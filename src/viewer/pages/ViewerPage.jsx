import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as THREE from 'three'
import { viewerCopy } from '../content/copy'
import {
  fetchLocal3DAssets,
  resolveLocal3DAsset,
} from '../content/localAssetCatalog'
import { APP_DEFAULT_LIGHT_SOURCE_ID } from '../constants/lighting'
import { useViewerCustomLights } from '../hooks/useViewerCustomLights'
import {
  ROTATION_STEP_DEG,
  applyViewerCustomLights,
  applyViewerEnvironmentLight,
  applyEditorView,
  buildAppendedAsset,
  buildEditorViewPreset,
  buildSeedSceneAssets,
  clamp,
  clearViewerCustomLights,
  clearViewerEnvironmentLight,
  cleanupObject3D,
  createViewerBootstrap,
  disposeViewerEnvironmentCache,
  fitCameraToObject,
  getZoomProgressFromDistance,
  loadViewerAsset,
  normalizeObjectScale,
  repositionCamera,
  getViewerCustomLightSourceIdFromObject,
  createTransformControls,
  loadHdriFromUrl,
  clearHdri,
} from '../utils/viewerScene'
import SketchfabModal from '../../components/SketchfabModal'
import LocalAssetsModal from '../../components/LocalAssetsModal'
import AppLayout from '../../components/AppLayout'
import ViewerScenePanel from '../components/ViewerScenePanel'
import RotateCameraAnimation from '../components/RotateCameraAnimation'
import ViewerHelpTutorialModal from '../components/ViewerHelpTutorialModal'
import ViewerLightComposerPanel from '../components/ViewerLightComposerPanel'
import ViewerProjectMenu from '../components/ViewerProjectMenu'
import ViewerQuickCreateDock from '../components/ViewerQuickCreateDock'
import ViewerStageControls from '../components/ViewerStageControls'
import ViewerStageOverlays from '../components/ViewerStageOverlays'
import ViewerZoomMeter from '../components/ViewerZoomMeter'
import '../viewer.css'

const EDIT_STATUS_FEEDBACK_MS = 960
const MAC_PLATFORM_REGEX = /(Mac|iPhone|iPod|iPad)/i
const DEFAULT_LIGHT_ASSET_POSITION = 'x: 0.00, y: 0.00, z: 0.00'
const DEFAULT_LIGHT_ASSET_ROTATION = 'x: 0.0deg, y: 0.0deg, z: 0.0deg'
const DEFAULT_LIGHT_ASSET_SCALE = 'x: 1.00, y: 1.00, z: 1.00'
const DEFAULT_VIEWER_LIGHT_ADJUSTMENTS = {
  rotationY: 0,
  exposure: 1,
  envIntensity: 1,
  bgIntensity: 1,
  bgBlur: 0,
}
const DEFAULT_CUSTOM_LIGHT_SOURCE_COLOR = '#ffffff'
const DEFAULT_CUSTOM_LIGHT_SOURCE_INTENSITY = 3.2
const DEFAULT_CUSTOM_LIGHT_SOURCE_SIZE = 2.8
const DEFAULT_CUSTOM_LIGHT_SOURCE_HEIGHT = 2

function buildSceneAssetFallbackName(type, sequence, copy) {
  if (type === 'scenario') return `${copy.editorMode.assetTypeScenario} ${sequence}`
  if (type === 'light') return `${copy.editorMode.assetTypeLight} ${sequence}`
  return `${copy.editorMode.assetTypeObject} ${sequence}`
}

function buildScreenshotFileName(projectTitle) {
  const safeName = projectTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 56)
  return `${safeName || 'viewer-scene'}-render.png`
}

function createCustomLightSource(sourceNamePrefix, sequence) {
  const offsetX = ((sequence % 4) - 1.5) * 0.8
  const offsetZ = (Math.floor(sequence / 2) % 3) * 0.72
  return {
    id: `draft-light-source-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: `${sourceNamePrefix} ${sequence}`,
    color: DEFAULT_CUSTOM_LIGHT_SOURCE_COLOR,
    intensity: DEFAULT_CUSTOM_LIGHT_SOURCE_INTENSITY,
    size: DEFAULT_CUSTOM_LIGHT_SOURCE_SIZE,
    position: { x: offsetX, y: DEFAULT_CUSTOM_LIGHT_SOURCE_HEIGHT, z: 2.1 + offsetZ },
  }
}

function cloneLightSource(source) {
  return { ...source, position: { ...source.position } }
}

function buildLightDraftFromSource(sourceStockLightId, sourceNamePrefix, preset = null) {
  if (!preset) {
    const initialSource = createCustomLightSource(sourceNamePrefix, 1)
    return {
      name: '',
      sourceStockLightId,
      sources: [initialSource],
      activeSourceId: initialSource.id,
      ...DEFAULT_VIEWER_LIGHT_ADJUSTMENTS,
    }
  }
  const presetSources = preset.sources.map(cloneLightSource)
  const activeSourceId = presetSources[0]?.id ?? null
  return {
    name: preset.name,
    sourceStockLightId: preset.sourceStockLightId,
    sources: presetSources,
    activeSourceId,
    rotationY: preset.rotationY,
    exposure: preset.exposure,
    envIntensity: preset.envIntensity,
    bgIntensity: preset.bgIntensity,
    bgBlur: preset.bgBlur,
  }
}

function guessFormat(url) {
  const ext = url.split(/[?#]/)[0].split('.').pop()?.toLowerCase()
  if (ext === 'glb' || ext === 'gltf') return ext
  return 'glb'
}

export default function ViewerPage() {
  const copy = viewerCopy
  const creationId = 'scene'
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    presets: customLightPresets,
    createPreset: createCustomLightPreset,
  } = useViewerCustomLights(creationId)

  const externalModelUrl = searchParams.get('model') || ''
  const externalModelTitle = searchParams.get('title') || 'Untitled Model'
  const isShareViewOnly = searchParams.get('share') === '1'
  const isEditMode = !isShareViewOnly && searchParams.get('mode') === 'edit'

  const stageRef = useRef(null)
  const pointerIndicatorRef = useRef(null)
  const bootstrapRef = useRef(null)
  const activeObjectRef = useRef(null)
  const animationFrameRef = useRef(null)
  const initialViewRef = useRef(null)
  const hasStartedRotationRef = useRef(false)
  const editStatusTimeoutRef = useRef(null)
  const isEditModeRef = useRef(isEditMode)
  const editorViewPresetRef = useRef(null)
  const activeEditorViewRef = useRef('isometric')
  const nextAssetSequenceRef = useRef(0)
  const lightEnvironmentCacheRef = useRef(new Map())
  const lightRequestIdRef = useRef(0)
  const lightComposerDraftRef = useRef(null)
  const isLightComposerOpenRef = useRef(false)
  const lightSourceHandleRef = useRef(new Map())
  const importedObjectsRef = useRef(new Map())
  const importsGroupRef = useRef(null)
  const transformControlsRef = useRef(null)
  const initialTransformsRef = useRef(new Map())
  const selectedObjectRef = useRef(null)
  const hdriTexturesRef = useRef({ texture: null, envMap: null })
  const undoStackRef = useRef([])
  const redoStackRef = useRef([])

  const [assets, setAssets] = useState(null)
  const [manifestError, setManifestError] = useState(null)
  const [isAssetLoading, setIsAssetLoading] = useState(false)
  const [assetError, setAssetError] = useState(null)
  const [isHelpTutorialOpen, setIsHelpTutorialOpen] = useState(false)
  const [controlsCollapsed, setControlsCollapsed] = useState(false)
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false)
  const [isCreateDockCollapsed, setIsCreateDockCollapsed] = useState(false)
  const [quickCreateTarget, setQuickCreateTarget] = useState('scenario')
  const [quickCreateMode, setQuickCreateMode] = useState('prompt')
  const [quickCreatePrompt, setQuickCreatePrompt] = useState('')
  const [hasStartedRotation, setHasStartedRotation] = useState(false)
  const [isPointerIndicatorVisible, setIsPointerIndicatorVisible] = useState(false)
  const [zoomControlProgress, setZoomControlProgress] = useState(0)
  const [zoomPercent, setZoomPercent] = useState(100)
  const [editStatusFeedback, setEditStatusFeedback] = useState(null)
  const [activeEditorView, setActiveEditorView] = useState('isometric')
  const [assetDraftName, setAssetDraftName] = useState('')
  const [assetDraftType, setAssetDraftType] = useState('object')
  const [sceneAssets, setSceneAssets] = useState([])
  const [activeLightSelection, setActiveLightSelection] = useState({ kind: 'default' })
  const [lightApplyStatus, setLightApplyStatus] = useState('idle')
  const [, setLightStatusMessage] = useState(null)
  const [isLightComposerOpen, setIsLightComposerOpen] = useState(false)
  const [lightComposerDraft, setLightComposerDraft] = useState(null)
  const [lightSelectionBeforeComposer, setLightSelectionBeforeComposer] = useState(null)
  const [isSketchfabOpen, setIsSketchfabOpen] = useState(false)
  const [isLocalAssetsOpen, setIsLocalAssetsOpen] = useState(false)
  const [importedModels, setImportedModels] = useState([])
  const [selectedObjectId, setSelectedObjectId] = useState(null)
  const [transformMode, setTransformMode] = useState('translate')
  const [sceneId, setSceneId] = useState(searchParams.get('sceneId') || null)
  const [savingScene, setSavingScene] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeHdriId, setActiveHdriId] = useState(null)
  const [activeHdriInfo, setActiveHdriInfo] = useState(null)
  const [showHdriPanel, setShowHdriPanel] = useState(false)
  const [sceneData, setSceneData] = useState(null)
  const [sceneRestored, setSceneRestored] = useState(false)
  const [projectTitleOverride, setProjectTitleOverride] = useState(null)

  const isMacPlatform = useMemo(() => {
    if (typeof window === 'undefined') return false
    const platform = window.navigator.platform ?? ''
    const userAgent = window.navigator.userAgent ?? ''
    return MAC_PLATFORM_REGEX.test(platform) || MAC_PLATFORM_REGEX.test(userAgent)
  }, [])

  const shortcutModifierLabel = isMacPlatform ? 'Command' : 'Ctrl'
  const shortcutAltLabel = isMacPlatform ? 'Option' : 'Alt'
  const projectMenuShortcutKeys = useMemo(() => [shortcutModifierLabel, 'R'], [shortcutModifierLabel])
  const createDockShortcutKeys = useMemo(() => [shortcutModifierLabel, shortcutAltLabel, 'N'], [shortcutAltLabel, shortcutModifierLabel])
  const controlsShortcutKeys = useMemo(() => [shortcutModifierLabel, shortcutAltLabel, 'B'], [shortcutAltLabel, shortcutModifierLabel])
  const editModeShortcutKeys = useMemo(() => [shortcutModifierLabel, 'E'], [shortcutModifierLabel])

  useEffect(() => {
    activeEditorViewRef.current = activeEditorView
    const view = bootstrapRef.current
    if (!view || !editorViewPresetRef.current || !isEditMode) return
    applyEditorView(view, editorViewPresetRef.current, activeEditorView)
  }, [activeEditorView, isEditMode])

  useEffect(() => {
    if (!isShareViewOnly || !searchParams.has('mode')) return
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.delete('mode')
    setSearchParams(nextSearchParams, { replace: true })
  }, [isShareViewOnly, searchParams, setSearchParams])

  useEffect(() => { lightComposerDraftRef.current = lightComposerDraft }, [lightComposerDraft])
  useEffect(() => { isLightComposerOpenRef.current = isLightComposerOpen }, [isLightComposerOpen])

  useEffect(() => {
    const environmentCache = lightEnvironmentCacheRef.current
    return () => {
      if (editStatusTimeoutRef.current !== null) {
        window.clearTimeout(editStatusTimeoutRef.current)
        editStatusTimeoutRef.current = null
      }
      disposeViewerEnvironmentCache(environmentCache)
      lightSourceHandleRef.current.clear()
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function hydrateManifest() {
      try {
        const localAssets = await fetchLocal3DAssets()
        if (cancelled) return
        setAssets(localAssets)
        setManifestError(null)
      } catch (error) {
        if (cancelled) return
        const message = error instanceof Error ? error.message : copy.asset.manifestError
        setManifestError(message)
        setAssets([])
      }
    }
    hydrateManifest()
    return () => { cancelled = true }
  }, [copy.asset.manifestError])

  const resolvedAsset = useMemo(() => {
    if (externalModelUrl) {
      return {
        id: 'external',
        kind: 'object',
        title: externalModelTitle,
        format: guessFormat(externalModelUrl),
        url: externalModelUrl,
      }
    }
    if (!assets) return null
    const local = resolveLocal3DAsset({ creationId, assets })
    if (!local || local.kind === 'light') return null
    return local
  }, [assets, creationId, externalModelUrl, externalModelTitle])

  const baseLightAssets = useMemo(() => {
    if (!assets) return []
    return assets.filter((asset) => asset.kind === 'light')
  }, [assets])

  const baseLightById = useMemo(
    () => new Map(baseLightAssets.map((l) => [l.id, l])),
    [baseLightAssets],
  )

  const customLightPresetById = useMemo(
    () => new Map(customLightPresets.map((p) => [p.id, p])),
    [customLightPresets],
  )

  const activeCustomLightPreset = useMemo(() => {
    if (activeLightSelection.kind !== 'custom') return null
    return customLightPresetById.get(activeLightSelection.presetId) ?? null
  }, [activeLightSelection, customLightPresetById])

  const activeLightLabel = useMemo(() => {
    if (activeLightSelection.kind === 'default') return copy.editorMode.defaultLightLabel
    if (activeLightSelection.kind === 'custom') return activeCustomLightPreset?.name ?? copy.editorMode.defaultLightLabel
    return baseLightById.get(activeLightSelection.lightId)?.title ?? copy.editorMode.defaultLightLabel
  }, [activeCustomLightPreset, activeLightSelection, baseLightById, copy.editorMode.defaultLightLabel])

  useEffect(() => {
    const nextSeedAssets = buildSeedSceneAssets(creationId, resolvedAsset)
    setSceneAssets(nextSeedAssets)
    nextAssetSequenceRef.current = nextSeedAssets.length
  }, [creationId, resolvedAsset])

  useEffect(() => {
    const view = bootstrapRef.current
    if (view) {
      clearViewerEnvironmentLight(view)
      clearViewerCustomLights(view)
    }
    lightRequestIdRef.current += 1
    lightSourceHandleRef.current.clear()
    setActiveLightSelection({ kind: 'default' })
    setLightApplyStatus('idle')
    setLightStatusMessage(copy.editorMode.lightFallbackStatus)
    setIsLightComposerOpen(false)
    setLightComposerDraft(null)
    setLightSelectionBeforeComposer(null)
  }, [copy.editorMode.lightFallbackStatus, creationId])

  useEffect(() => {
    if (activeLightSelection.kind === 'default') return
    if (activeLightSelection.kind === 'stock') {
      const has = baseLightAssets.some((l) => l.id === activeLightSelection.lightId)
      if (has) return
      setActiveLightSelection({ kind: 'default' })
      setLightApplyStatus('idle')
      setLightStatusMessage(copy.editorMode.lightFallbackStatus)
      return
    }
    const activePreset = customLightPresetById.get(activeLightSelection.presetId)
    if (!activePreset) {
      setActiveLightSelection({ kind: 'default' })
      setLightApplyStatus('idle')
      setLightStatusMessage(copy.editorMode.lightFallbackStatus)
      return
    }
    if (activePreset.sourceStockLightId === APP_DEFAULT_LIGHT_SOURCE_ID) return
    const hasSource = baseLightAssets.some((l) => l.id === activePreset.sourceStockLightId)
    if (hasSource) return
    setActiveLightSelection({ kind: 'default' })
    setLightApplyStatus('idle')
    setLightStatusMessage(copy.editorMode.lightFallbackStatus)
  }, [activeLightSelection, baseLightAssets, copy.editorMode.lightFallbackStatus, customLightPresetById])

  useEffect(() => {
    if (!lightComposerDraft) return
    if (lightComposerDraft.sourceStockLightId === APP_DEFAULT_LIGHT_SOURCE_ID) return
    const has = baseLightAssets.some((l) => l.id === lightComposerDraft.sourceStockLightId)
    if (has) return
    setLightComposerDraft((d) => d ? { ...d, sourceStockLightId: APP_DEFAULT_LIGHT_SOURCE_ID } : null)
  }, [baseLightAssets, lightComposerDraft])

  useEffect(() => {
    if (!lightComposerDraft || lightComposerDraft.sources.length === 0) return
    const has = lightComposerDraft.sources.some((s) => s.id === lightComposerDraft.activeSourceId)
    if (has) return
    setLightComposerDraft((d) => d ? { ...d, activeSourceId: d.sources[0]?.id ?? null } : null)
  }, [lightComposerDraft])

  useEffect(() => {
    if (!stageRef.current) return

    const bootstrap = createViewerBootstrap(stageRef.current)
    bootstrapRef.current = bootstrap

    const importsGroup = new THREE.Group()
    importsGroup.name = 'importsGroup'
    bootstrap.scene.add(importsGroup)
    importsGroupRef.current = importsGroup

    const tc = createTransformControls(bootstrap.camera, bootstrap.renderer.domElement, bootstrap.controls)
    bootstrap.scene.add(tc.getHelper())
    transformControlsRef.current = tc

    let preTransformState = null
    tc.addEventListener('dragging-changed', (event) => {
      if (event.value) {
        const obj = tc.object
        if (obj) {
          const objId = obj === activeObjectRef.current ? 'main' : (obj.userData?.importId || null)
          preTransformState = {
            objectId: objId,
            position: obj.position.clone(),
            rotation: obj.rotation.clone(),
            scale: obj.scale.clone(),
          }
        }
      } else {
        if (preTransformState) {
          undoStackRef.current.push({
            type: 'transform',
            ...preTransformState,
          })
          if (undoStackRef.current.length > 50) undoStackRef.current.shift()
          redoStackRef.current = []
          preTransformState = null
        }
      }
    })

    const bootstrapDistance = bootstrap.camera.position.distanceTo(bootstrap.controls.target)
    setZoomControlProgress(getZoomProgressFromDistance(bootstrap.controls, bootstrapDistance))
    setZoomPercent(100)

    const raycaster = new THREE.Raycaster()
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const pointer = new THREE.Vector2()
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -DEFAULT_CUSTOM_LIGHT_SOURCE_HEIGHT)
    const dragOffset = new THREE.Vector3()

    let pointerDownX = 0
    let pointerDownY = 0
    let pointerDownButton = 0
    let pointerMoved = false
    let isPointerDown = false
    let draggedLightSourceId = null
    let isDraggingHeight = false
    let dragStartY = 0
    let dragStartLightY = 0

    const positionPointerIndicator = (clientX, clientY) => {
      const view = bootstrapRef.current
      const indicatorElement = pointerIndicatorRef.current
      if (!view || !indicatorElement) return
      const canvasRect = view.renderer.domElement.getBoundingClientRect()
      if (canvasRect.width === 0 || canvasRect.height === 0) return
      const offsetX = clamp(clientX - canvasRect.left, 0, canvasRect.width)
      const offsetY = clamp(clientY - canvasRect.top, 0, canvasRect.height)
      indicatorElement.style.left = `${offsetX}px`
      indicatorElement.style.top = `${offsetY}px`
    }

    const setRayFromPointerEvent = (event, view) => {
      const canvasRect = view.renderer.domElement.getBoundingClientRect()
      if (canvasRect.width === 0 || canvasRect.height === 0) return false
      pointer.x = ((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1
      pointer.y = -((event.clientY - canvasRect.top) / canvasRect.height) * 2 + 1
      raycaster.setFromCamera(pointer, view.camera)
      return true
    }

    const handlePointerDown = (event) => {
      if (isEditModeRef.current) return
      const view = bootstrapRef.current
      if (!view) return

      if (isLightComposerOpenRef.current) {
        if (!setRayFromPointerEvent(event, view)) return
        const lightHandleTargets = Array.from(lightSourceHandleRef.current.values())
        if (lightHandleTargets.length === 0) return
        const intersections = raycaster.intersectObjects(lightHandleTargets, true)
        const hitSourceId = getViewerCustomLightSourceIdFromObject(intersections[0]?.object ?? null)
        if (hitSourceId) {
          const draft = lightComposerDraftRef.current
          const hitSource = draft?.sources.find((s) => s.id === hitSourceId)
          if (!hitSource) return
          event.preventDefault()
          setIsPointerIndicatorVisible(false)
          pointerMoved = false
          isPointerDown = true
          draggedLightSourceId = hitSourceId
          isDraggingHeight = false
          dragStartY = event.clientY
          dragStartLightY = hitSource.position.y
          setLightComposerDraft((d) => d ? { ...d, activeSourceId: hitSourceId } : d)
          dragPlane.set(new THREE.Vector3(0, 1, 0), -hitSource.position.y)
          const planeHit = new THREE.Vector3()
          if (raycaster.ray.intersectPlane(dragPlane, planeHit)) {
            dragOffset.set(hitSource.position.x - planeHit.x, hitSource.position.y - planeHit.y, hitSource.position.z - planeHit.z)
          } else {
            dragOffset.set(0, 0, 0)
          }
          return
        }
      }

      pointerDownX = event.clientX
      pointerDownY = event.clientY
      pointerDownButton = event.button
      pointerMoved = false
      isPointerDown = true
      setIsPointerIndicatorVisible(true)
      positionPointerIndicator(event.clientX, event.clientY)
    }

    const handlePointerEnter = (event) => {
      if (isEditModeRef.current) { setIsPointerIndicatorVisible(false); return }
      setIsPointerIndicatorVisible(true)
      positionPointerIndicator(event.clientX, event.clientY)
    }

    const handlePointerMove = (event) => {
      if (isEditModeRef.current) return

      if (isLightComposerOpenRef.current && draggedLightSourceId) {
        const wantsHeight = event.shiftKey
        if (wantsHeight && !isDraggingHeight) {
          // Switching to height mode — snapshot current Y and cursor position
          isDraggingHeight = true
          dragStartY = event.clientY
          const draft = lightComposerDraftRef.current
          const src = draft?.sources.find((s) => s.id === draggedLightSourceId)
          dragStartLightY = src ? src.position.y : dragStartLightY
        } else if (!wantsHeight && isDraggingHeight) {
          isDraggingHeight = false
        }

        if (isDraggingHeight) {
          const deltaPixels = dragStartY - event.clientY
          const sensitivity = 0.02
          const nextY = clamp(dragStartLightY + deltaPixels * sensitivity, 0, 12)
          setLightComposerDraft((d) => {
            if (!d) return null
            const idx = d.sources.findIndex((s) => s.id === draggedLightSourceId)
            if (idx < 0) return d
            const nextSources = d.sources.map((s, i) => {
              if (i !== idx) return s
              return { ...s, position: { ...s.position, y: Number(nextY.toFixed(2)) } }
            })
            return { ...d, sources: nextSources, activeSourceId: draggedLightSourceId }
          })
          pointerMoved = true
          return
        }
        const view = bootstrapRef.current
        if (!view) return
        if (!setRayFromPointerEvent(event, view)) return
        const planeHit = new THREE.Vector3()
        if (!raycaster.ray.intersectPlane(dragPlane, planeHit)) return
        const nextPosition = planeHit.add(dragOffset)
        setLightComposerDraft((d) => {
          if (!d) return null
          const idx = d.sources.findIndex((s) => s.id === draggedLightSourceId)
          if (idx < 0) return d
          const nextSources = d.sources.map((s, i) => {
            if (i !== idx) return s
            return { ...s, position: { x: Number(nextPosition.x.toFixed(2)), y: s.position.y, z: Number(nextPosition.z.toFixed(2)) } }
          })
          return { ...d, sources: nextSources, activeSourceId: draggedLightSourceId }
        })
        pointerMoved = true
        return
      }

      setIsPointerIndicatorVisible(true)
      positionPointerIndicator(event.clientX, event.clientY)

      if (!isPointerDown) return
      if (Math.abs(event.clientX - pointerDownX) > 4 || Math.abs(event.clientY - pointerDownY) > 4) {
        pointerMoved = true
        const isRotateGesture = event.pointerType === 'touch' || pointerDownButton === 0 || pointerDownButton === 2
        if (isRotateGesture && !hasStartedRotationRef.current) {
          hasStartedRotationRef.current = true
          setHasStartedRotation(true)
        }
      }
    }

    const handlePointerUp = (event) => {
      if (isEditModeRef.current) return
      if (isLightComposerOpenRef.current && draggedLightSourceId) {
        isPointerDown = false
        pointerMoved = false
        draggedLightSourceId = null
        isDraggingHeight = false
        return
      }
      isPointerDown = false
      setIsPointerIndicatorVisible(true)
      positionPointerIndicator(event.clientX, event.clientY)
      if (pointerMoved) return

      const view = bootstrapRef.current
      if (!view) return
      const canvasRect = view.renderer.domElement.getBoundingClientRect()
      if (canvasRect.width === 0 || canvasRect.height === 0) return
      pointer.x = ((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1
      pointer.y = -((event.clientY - canvasRect.top) / canvasRect.height) * 2 + 1
      raycaster.setFromCamera(pointer, view.camera)

      let nextTarget = null
      const activeObject = activeObjectRef.current
      if (activeObject) {
        const intersections = raycaster.intersectObject(activeObject, true)
        if (intersections.length > 0) nextTarget = intersections[0]?.point.clone() ?? null
      }
      if (!nextTarget) {
        const planeHit = new THREE.Vector3()
        if (raycaster.ray.intersectPlane(plane, planeHit)) nextTarget = planeHit
      }
      if (!nextTarget) return
      repositionCamera(view, nextTarget)
    }

    const handlePointerCancel = () => {
      isPointerDown = false
      draggedLightSourceId = null
      isDraggingHeight = false
      setIsPointerIndicatorVisible(false)
    }

    const handleControlsChange = () => {
      const view = bootstrapRef.current
      if (!view) return
      const distance = view.camera.position.distanceTo(view.controls.target)
      const nextProgress = getZoomProgressFromDistance(view.controls, distance)
      setZoomControlProgress((prev) => Math.abs(prev - nextProgress) > 0.1 ? nextProgress : prev)
      const baseline = initialViewRef.current?.distance ?? distance
      const nextZoomPercent = clamp(Math.round((baseline / Math.max(distance, 0.0001)) * 100), 10, 2400)
      setZoomPercent((prev) => Math.abs(prev - nextZoomPercent) >= 1 ? nextZoomPercent : prev)
    }

    bootstrap.controls.addEventListener('change', handleControlsChange)
    bootstrap.renderer.domElement.addEventListener('pointerdown', handlePointerDown)
    bootstrap.renderer.domElement.addEventListener('pointerenter', handlePointerEnter)
    bootstrap.renderer.domElement.addEventListener('pointermove', handlePointerMove)
    bootstrap.renderer.domElement.addEventListener('pointerup', handlePointerUp)
    bootstrap.renderer.domElement.addEventListener('pointercancel', handlePointerCancel)
    bootstrap.renderer.domElement.addEventListener('pointerleave', handlePointerCancel)

    bootstrap.cleanupCallbacks.push(() => {
      bootstrap.controls.removeEventListener('change', handleControlsChange)
      bootstrap.renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
      bootstrap.renderer.domElement.removeEventListener('pointerenter', handlePointerEnter)
      bootstrap.renderer.domElement.removeEventListener('pointermove', handlePointerMove)
      bootstrap.renderer.domElement.removeEventListener('pointerup', handlePointerUp)
      bootstrap.renderer.domElement.removeEventListener('pointercancel', handlePointerCancel)
      bootstrap.renderer.domElement.removeEventListener('pointerleave', handlePointerCancel)
    })

    const tick = () => {
      const view = bootstrapRef.current
      if (!view) return
      view.controls.update()
      view.renderer.render(view.scene, view.camera)
      animationFrameRef.current = window.requestAnimationFrame(tick)
    }
    tick()

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      const activeObject = activeObjectRef.current
      if (activeObject) {
        bootstrap.scene.remove(activeObject)
        cleanupObject3D(activeObject)
        activeObjectRef.current = null
      }
      for (const [, entry] of importedObjectsRef.current) {
        importsGroup.remove(entry.object)
        cleanupObject3D(entry.object)
      }
      importedObjectsRef.current.clear()
      importsGroupRef.current = null
      initialTransformsRef.current.clear()
      tc.detach()
      tc.dispose()
      transformControlsRef.current = null
      selectedObjectRef.current = null
      undoStackRef.current = []
      redoStackRef.current = []
      if (hdriTexturesRef.current.texture) { hdriTexturesRef.current.texture.dispose(); hdriTexturesRef.current.texture = null }
      if (hdriTexturesRef.current.envMap) { hdriTexturesRef.current.envMap.dispose(); hdriTexturesRef.current.envMap = null }
      clearViewerEnvironmentLight(bootstrap)
      clearViewerCustomLights(bootstrap)
      lightSourceHandleRef.current.clear()
      lightRequestIdRef.current += 1
      bootstrap.cleanupCallbacks.forEach((cleanup) => cleanup())
      bootstrapRef.current = null
    }
  }, [])

  useEffect(() => {
    const view = bootstrapRef.current
    if (!view) return

    hasStartedRotationRef.current = false
    setHasStartedRotation(false)

    const currentObject = activeObjectRef.current
    if (currentObject) {
      view.scene.remove(currentObject)
      cleanupObject3D(currentObject)
      activeObjectRef.current = null
    }

    if (!resolvedAsset) {
      editorViewPresetRef.current = null
      setIsAssetLoading(false)
      setAssetError(null)
      return
    }

    let cancelled = false

    const loadAssetToScene = async () => {
      setIsAssetLoading(true)
      setAssetError(null)
      try {
        const loadedObject = await loadViewerAsset(resolvedAsset)
        if (cancelled) { cleanupObject3D(loadedObject); return }

        normalizeObjectScale(loadedObject)
        activeObjectRef.current = loadedObject
        view.scene.add(loadedObject)

        editorViewPresetRef.current = buildEditorViewPreset(loadedObject)
        initialViewRef.current = fitCameraToObject(loadedObject, view.camera, view.controls)

        initialTransformsRef.current.set('main', {
          position: loadedObject.position.clone(),
          rotation: loadedObject.rotation.clone(),
          scale: loadedObject.scale.clone(),
        })

        if (isEditModeRef.current && editorViewPresetRef.current) {
          applyEditorView(view, editorViewPresetRef.current, activeEditorViewRef.current)
        }

        const fittedDistance = view.camera.position.distanceTo(view.controls.target)
        setZoomControlProgress(getZoomProgressFromDistance(view.controls, fittedDistance))
        setZoomPercent(100)
        setIsAssetLoading(false)
      } catch (error) {
        if (cancelled) return
        const message = error instanceof Error ? error.message : 'Failed to load 3D asset.'
        setAssetError(message)
        setIsAssetLoading(false)
      }
    }

    loadAssetToScene()
    return () => { cancelled = true }
  }, [resolvedAsset])

  useEffect(() => {
    isEditModeRef.current = isEditMode
    const view = bootstrapRef.current
    if (!view) return
    view.controls.enabled = true
    view.controls.enableRotate = true
    view.controls.enableZoom = true
    view.controls.enablePan = isEditMode

    if (!isEditMode) {
      if (transformControlsRef.current) transformControlsRef.current.detach()
      selectedObjectRef.current = null
      setSelectedObjectId(null)
    }
  }, [isEditMode])

  const canControlCamera = Boolean(bootstrapRef.current && resolvedAsset && !isAssetLoading && !assetError)
  const canInteractCamera = canControlCamera && !isEditMode

  useEffect(() => { if (!canInteractCamera) setIsPointerIndicatorVisible(false) }, [canInteractCamera])

  const rotateCamera = (rotationDirection) => {
    const view = bootstrapRef.current
    if (!view || !canInteractCamera) return
    if (!hasStartedRotationRef.current) { hasStartedRotationRef.current = true; setHasStartedRotation(true) }
    view.controls.rotateLeft(THREE.MathUtils.degToRad(rotationDirection * ROTATION_STEP_DEG))
    view.controls.update()
  }

  const zoomCamera = (zoomFactor) => {
    const view = bootstrapRef.current
    if (!view || !canInteractCamera) return
    const offset = view.camera.position.clone().sub(view.controls.target)
    const nextDistance = clamp(offset.length() * zoomFactor, view.controls.minDistance, view.controls.maxDistance)
    offset.setLength(nextDistance)
    view.camera.position.copy(view.controls.target).add(offset)
    view.controls.update()
  }

  const setZoomProgress = (progress) => {
    const view = bootstrapRef.current
    if (!view || !canInteractCamera) return
    const nextProgress = clamp(progress, 0, 100)
    const distanceRange = Math.max(view.controls.maxDistance - view.controls.minDistance, 0.0001)
    const nextDistance = view.controls.maxDistance - (nextProgress / 100) * distanceRange
    const offset = view.camera.position.clone().sub(view.controls.target)
    if (offset.lengthSq() < 0.000001) offset.set(0, 0, 1)
    setZoomControlProgress(nextProgress)
    offset.setLength(nextDistance)
    view.camera.position.copy(view.controls.target).add(offset)
    view.controls.update()
  }

  const resetCamera = () => {
    const view = bootstrapRef.current
    const snapshot = initialViewRef.current
    if (!view || !snapshot || !canInteractCamera) return
    view.camera.position.copy(snapshot.position)
    view.controls.target.copy(snapshot.target)
    view.controls.update()
  }

  const continueToUploadFromQuickCreate = () => {
    const nextSearchParams = new URLSearchParams()
    nextSearchParams.set('target', quickCreateTarget)
    nextSearchParams.set('mode', quickCreateMode)
    const normalizedPrompt = quickCreatePrompt.trim()
    if (quickCreateMode === 'prompt' && normalizedPrompt.length > 0) {
      nextSearchParams.set('prompt', normalizedPrompt)
    }
    navigate(`/upload?${nextSearchParams.toString()}`)
  }

  const addAssetToScene = (requestedType, requestedName, origin) => {
    setSceneAssets((previousAssets) => {
      const nextSequence = nextAssetSequenceRef.current + 1
      nextAssetSequenceRef.current = nextSequence
      const trimmedName = requestedName.trim()
      const normalizedName = trimmedName.length > 0 ? trimmedName : buildSceneAssetFallbackName(requestedType, nextSequence, copy)
      const nextId = `asset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
      const nextAsset = buildAppendedAsset(nextSequence, nextId, normalizedName, requestedType, origin)
      if (requestedType === 'scenario') {
        return [nextAsset, ...previousAssets.filter((a) => a.type !== 'scenario')]
      }
      return [...previousAssets, nextAsset]
    })
  }

  const upsertActiveLightAsset = useCallback((lightName, sceneLightId) => {
    setSceneAssets((previousAssets) => {
      const nextLightAsset = {
        id: `scene-light-${sceneLightId}`,
        name: lightName,
        type: 'light',
        origin: 'library',
        position: DEFAULT_LIGHT_ASSET_POSITION,
        rotation: DEFAULT_LIGHT_ASSET_ROTATION,
        scale: DEFAULT_LIGHT_ASSET_SCALE,
      }
      return [...previousAssets.filter((a) => !(a.type === 'light' && a.origin === 'library')), nextLightAsset]
    })
  }, [])

  const removeActiveLightAsset = useCallback(() => {
    setSceneAssets((prev) => prev.filter((a) => !(a.type === 'light' && a.origin === 'library')))
  }, [])

  const applyResolvedLight = useCallback(async (lightAsset, lightAdjustments, nextSelection, lightLabel, sceneLightId, customSources = []) => {
    const view = bootstrapRef.current
    if (!view) return false
    const requestId = lightRequestIdRef.current + 1
    lightRequestIdRef.current = requestId
    setLightApplyStatus('loading')
    setLightStatusMessage(copy.editorMode.lightApplyingStatus)
    try {
      await applyViewerEnvironmentLight(view, lightAsset, lightEnvironmentCacheRef.current, lightAdjustments)
      if (requestId !== lightRequestIdRef.current) return false
      lightSourceHandleRef.current = applyViewerCustomLights(view, customSources, null)
      setActiveLightSelection(nextSelection)
      setLightApplyStatus('ready')
      setLightStatusMessage(`${copy.editorMode.lightAppliedStatus}: ${lightLabel}`)
      upsertActiveLightAsset(lightLabel, sceneLightId)
      return true
    } catch (error) {
      if (requestId !== lightRequestIdRef.current) return false
      const fallbackMessage = error instanceof Error && error.message.length > 0 ? error.message : copy.editorMode.lightApplyError
      setLightApplyStatus('error')
      setLightStatusMessage(fallbackMessage)
      return false
    }
  }, [copy.editorMode.lightApplyError, copy.editorMode.lightAppliedStatus, copy.editorMode.lightApplyingStatus, upsertActiveLightAsset])

  const applyBaseLight = useCallback(async (lightAsset) => {
    await applyResolvedLight(lightAsset, DEFAULT_VIEWER_LIGHT_ADJUSTMENTS, { kind: 'stock', lightId: lightAsset.id }, lightAsset.title, lightAsset.id)
  }, [applyResolvedLight])

  const restoreHdriBackground = useCallback(() => {
    const view = bootstrapRef.current
    const textures = hdriTexturesRef.current
    if (!view || !textures.texture) return
    view.scene.background = textures.texture
    view.scene.environment = textures.envMap
  }, [])

  const applyCustomLightPreset = useCallback(async (customPreset) => {
    if (customPreset.sourceStockLightId === APP_DEFAULT_LIGHT_SOURCE_ID) {
      const view = bootstrapRef.current
      if (!view) return
      lightRequestIdRef.current += 1
      clearViewerEnvironmentLight(view)
      view.scene.environmentIntensity = customPreset.envIntensity
      view.scene.backgroundIntensity = customPreset.bgIntensity
      view.scene.backgroundBlurriness = customPreset.bgBlur
      view.renderer.toneMappingExposure = customPreset.exposure
      lightSourceHandleRef.current = applyViewerCustomLights(view, customPreset.sources, customPreset.sources[0]?.id ?? null)
      restoreHdriBackground()
      setActiveLightSelection({ kind: 'custom', presetId: customPreset.id })
      setLightApplyStatus('ready')
      setLightStatusMessage(`${copy.editorMode.lightAppliedStatus}: ${customPreset.name}`)
      upsertActiveLightAsset(customPreset.name, customPreset.id)
      return
    }
    const sourceLightAsset = baseLightById.get(customPreset.sourceStockLightId)
    if (!sourceLightAsset) {
      setLightApplyStatus('error')
      setLightStatusMessage(copy.editorMode.lightApplyError)
      return
    }
    await applyResolvedLight(
      sourceLightAsset,
      { rotationY: customPreset.rotationY, exposure: customPreset.exposure, envIntensity: customPreset.envIntensity, bgIntensity: customPreset.bgIntensity, bgBlur: customPreset.bgBlur },
      { kind: 'custom', presetId: customPreset.id },
      customPreset.name,
      customPreset.id,
      customPreset.sources,
    )
    restoreHdriBackground()
  }, [applyResolvedLight, baseLightById, copy.editorMode.lightApplyError, copy.editorMode.lightAppliedStatus, restoreHdriBackground, upsertActiveLightAsset])

  const applyLightComposerPreview = useCallback(async (draft) => {
    const view = bootstrapRef.current
    if (!view) return
    const requestId = lightRequestIdRef.current + 1
    lightRequestIdRef.current = requestId
    setLightApplyStatus('loading')
    setLightStatusMessage(copy.editorMode.lightApplyingStatus)
    try {
      const sourceLightAsset = baseLightById.get(draft.sourceStockLightId)
      if (draft.sourceStockLightId !== APP_DEFAULT_LIGHT_SOURCE_ID && sourceLightAsset) {
        await applyViewerEnvironmentLight(view, sourceLightAsset, lightEnvironmentCacheRef.current, draft)
      } else {
        clearViewerEnvironmentLight(view)
        view.scene.environmentIntensity = draft.envIntensity
        view.scene.backgroundIntensity = draft.bgIntensity
        view.scene.backgroundBlurriness = draft.bgBlur
        view.renderer.toneMappingExposure = draft.exposure
      }
      if (requestId !== lightRequestIdRef.current) return
      lightSourceHandleRef.current = applyViewerCustomLights(view, draft.sources, draft.activeSourceId, { showHandles: true })
      restoreHdriBackground()
      setLightApplyStatus('ready')
      const sourceLabel = draft.sourceStockLightId === APP_DEFAULT_LIGHT_SOURCE_ID
        ? copy.editorMode.lightComposerDefaultSourceLabel
        : sourceLightAsset?.title ?? copy.editorMode.defaultLightLabel
      setLightStatusMessage(`${copy.editorMode.lightAppliedStatus}: ${draft.name.trim().length > 0 ? draft.name.trim() : sourceLabel}`)
    } catch (error) {
      if (requestId !== lightRequestIdRef.current) return
      const fallbackMessage = error instanceof Error && error.message.length > 0 ? error.message : copy.editorMode.lightApplyError
      setLightApplyStatus('error')
      setLightStatusMessage(fallbackMessage)
    }
  }, [baseLightById, copy.editorMode.lightApplyError, copy.editorMode.lightAppliedStatus, copy.editorMode.lightApplyingStatus, copy.editorMode.lightComposerDefaultSourceLabel, copy.editorMode.defaultLightLabel, restoreHdriBackground])

  const resetToDefaultLight = useCallback(() => {
    const view = bootstrapRef.current
    if (!view) return
    lightRequestIdRef.current += 1
    clearViewerEnvironmentLight(view)
    clearViewerCustomLights(view)
    lightSourceHandleRef.current.clear()
    setActiveLightSelection({ kind: 'default' })
    setLightApplyStatus('idle')
    setLightStatusMessage(copy.editorMode.lightFallbackStatus)
    removeActiveLightAsset()
  }, [copy.editorMode.lightFallbackStatus, removeActiveLightAsset])

  const openLightComposer = useCallback(() => {
    setLightSelectionBeforeComposer(activeLightSelection)
    const existingPreset = activeCustomLightPreset
    if (existingPreset) {
      setLightComposerDraft(buildLightDraftFromSource(existingPreset.sourceStockLightId, copy.editorMode.customLightSourceNamePrefix, existingPreset))
    } else {
      setLightComposerDraft(buildLightDraftFromSource(APP_DEFAULT_LIGHT_SOURCE_ID, copy.editorMode.customLightSourceNamePrefix))
    }
    setIsLightComposerOpen(true)
    setIsProjectMenuOpen(false)
  }, [activeCustomLightPreset, activeLightSelection, copy.editorMode.customLightSourceNamePrefix])

  const closeLightComposerWithRevert = useCallback(() => {
    setIsLightComposerOpen(false)
    setLightComposerDraft(null)
    const previousSelection = lightSelectionBeforeComposer
    setLightSelectionBeforeComposer(null)
    if (!previousSelection || previousSelection.kind === 'default') { resetToDefaultLight(); return }
    if (previousSelection.kind === 'stock') {
      const prev = baseLightById.get(previousSelection.lightId)
      if (prev) { void applyBaseLight(prev) } else { resetToDefaultLight() }
      return
    }
    const prevCustom = customLightPresetById.get(previousSelection.presetId) ?? null
    if (prevCustom) { void applyCustomLightPreset(prevCustom); return }
    resetToDefaultLight()
  }, [applyBaseLight, applyCustomLightPreset, baseLightById, customLightPresetById, lightSelectionBeforeComposer, resetToDefaultLight])

  const saveComposedLight = useCallback(async () => {
    if (!lightComposerDraft) return
    const fallbackName = `${copy.editorMode.customLightNamePrefix} ${customLightPresets.length + 1}`
    const normalizedDraft = {
      ...lightComposerDraft,
      sources: lightComposerDraft.sources.map((source, index) => {
        const trimmedSourceName = source.name.trim()
        return {
          ...source,
          name: trimmedSourceName.length > 0 ? trimmedSourceName : `${copy.editorMode.customLightSourceNamePrefix} ${index + 1}`,
          color: /^#[0-9a-f]{6}$/i.test(source.color) ? source.color : DEFAULT_CUSTOM_LIGHT_SOURCE_COLOR,
        }
      }),
    }
    const nextPreset = createCustomLightPreset(normalizedDraft, fallbackName)
    await applyCustomLightPreset(nextPreset)
    setIsLightComposerOpen(false)
    setLightComposerDraft(null)
    setLightSelectionBeforeComposer(null)
  }, [applyCustomLightPreset, copy.editorMode.customLightNamePrefix, copy.editorMode.customLightSourceNamePrefix, createCustomLightPreset, customLightPresets.length, lightComposerDraft])

  const addComposerSource = useCallback(() => {
    setLightComposerDraft((d) => {
      if (!d) return null
      const nextSource = createCustomLightSource(copy.editorMode.customLightSourceNamePrefix, d.sources.length + 1)
      return { ...d, sources: [...d.sources, nextSource], activeSourceId: nextSource.id }
    })
  }, [copy.editorMode.customLightSourceNamePrefix])

  const selectComposerSource = useCallback((sourceId) => {
    setLightComposerDraft((d) => d ? { ...d, activeSourceId: sourceId } : null)
  }, [])

  const reorderComposerSources = useCallback((nextSources) => {
    setLightComposerDraft((d) => {
      if (!d || nextSources.length === 0) return d
      const ids = new Set(nextSources.map((s) => s.id))
      const hasAll = d.sources.every((s) => ids.has(s.id))
      if (!hasAll) return d
      return { ...d, sources: nextSources, activeSourceId: d.activeSourceId && ids.has(d.activeSourceId) ? d.activeSourceId : nextSources[0]?.id ?? null }
    })
  }, [])

  const removeComposerSource = useCallback((sourceId) => {
    setLightComposerDraft((d) => {
      if (!d) return null
      const nextSources = d.sources.filter((s) => s.id !== sourceId)
      if (nextSources.length === d.sources.length) return d
      const hasActive = !!d.activeSourceId && nextSources.some((s) => s.id === d.activeSourceId)
      return { ...d, sources: nextSources, activeSourceId: hasActive ? d.activeSourceId : nextSources[0]?.id ?? null }
    })
  }, [])

  const updateComposerSource = useCallback((nextSource) => {
    setLightComposerDraft((d) => {
      if (!d) return null
      const has = d.sources.some((s) => s.id === nextSource.id)
      if (!has) return d
      return { ...d, sources: d.sources.map((s) => s.id === nextSource.id ? nextSource : s), activeSourceId: nextSource.id }
    })
  }, [])

  useEffect(() => {
    if (!isLightComposerOpen || !lightComposerDraft) return
    void applyLightComposerPreview(lightComposerDraft)
  }, [applyLightComposerPreview, isLightComposerOpen, lightComposerDraft])

  const generateAssetInScene = () => {
    const generatedType = quickCreateTarget === 'scenario' ? 'scenario' : 'object'
    addAssetToScene(generatedType, quickCreatePrompt, 'generated')
    setQuickCreatePrompt('')
  }

  const addCustomAsset = () => {
    addAssetToScene(assetDraftType, assetDraftName, 'generated')
    setAssetDraftName('')
  }

  const handleImportModel = useCallback(async (modelData) => {
    const view = bootstrapRef.current
    const group = importsGroupRef.current
    if (!view || !group) return
    setIsSketchfabOpen(false)
    setIsLocalAssetsOpen(false)
    try {
      const importedAsset = { url: modelData.downloadUrl, format: modelData.format || 'glb' }
      const loadedObject = await loadViewerAsset(importedAsset)

      const mainObject = activeObjectRef.current
      const mainBounds = mainObject ? new THREE.Box3().setFromObject(mainObject) : null
      const mainSize = mainBounds ? mainBounds.getSize(new THREE.Vector3()) : new THREE.Vector3(2, 2, 2)
      const mainMaxDim = Math.max(mainSize.x, mainSize.y, mainSize.z)

      const importBounds = new THREE.Box3().setFromObject(loadedObject)
      const importSize = importBounds.getSize(new THREE.Vector3())
      const importMaxDim = Math.max(importSize.x, importSize.y, importSize.z)
      if (importMaxDim > 0) {
        const targetSize = mainMaxDim * 0.35
        const scaleFactor = targetSize / importMaxDim
        loadedObject.scale.multiplyScalar(scaleFactor)
      }

      const importCount = importedObjectsRef.current.size
      const offsetDir = importCount % 2 === 0 ? 1 : -1
      const offsetAmount = mainMaxDim * 0.6 * (Math.floor(importCount / 2) + 1)
      loadedObject.position.set(offsetDir * offsetAmount, 0, 0)

      const placedBounds = new THREE.Box3().setFromObject(loadedObject)
      loadedObject.position.y -= placedBounds.min.y

      const id = `sketchfab-${modelData.uid}-${Date.now().toString(36)}`
      loadedObject.userData = { importId: id }
      group.add(loadedObject)
      importedObjectsRef.current.set(id, { object: loadedObject, meta: modelData })

      initialTransformsRef.current.set(id, {
        position: loadedObject.position.clone(),
        rotation: loadedObject.rotation.clone(),
        scale: loadedObject.scale.clone(),
      })

      setImportedModels((prev) => [...prev, {
        id,
        uid: modelData.uid,
        name: modelData.name,
        author: modelData.author,
        thumbnailUrl: modelData.thumbnailUrl,
        source: 'sketchfab',
      }])
      undoStackRef.current.push({ type: 'addImport', id, object: loadedObject, meta: modelData })
      if (undoStackRef.current.length > 50) undoStackRef.current.shift()
      redoStackRef.current = []
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import model.'
      setAssetError(message)
    }
  }, [])

  const handleRemoveImport = useCallback((id) => {
    const entry = importedObjectsRef.current.get(id)
    if (!entry) return
    const modelInfo = importedModels.find((m) => m.id === id)
    undoStackRef.current.push({
      type: 'removeImport',
      id,
      object: entry.object,
      meta: entry.meta,
      modelInfo: modelInfo ? { ...modelInfo } : null,
    })
    if (undoStackRef.current.length > 50) undoStackRef.current.shift()
    redoStackRef.current = []
    importsGroupRef.current?.remove(entry.object)
    importedObjectsRef.current.delete(id)
    initialTransformsRef.current.delete(id)
    if (selectedObjectRef.current === entry.object) {
      transformControlsRef.current?.detach()
      selectedObjectRef.current = null
      setSelectedObjectId(null)
    }
    setImportedModels((prev) => prev.filter((m) => m.id !== id))
  }, [importedModels])

  const handleSelectObject = useCallback((id) => {
    const tc = transformControlsRef.current
    if (!tc || !isEditModeRef.current) return
    let target = null
    if (id === 'main' && activeObjectRef.current) target = activeObjectRef.current
    else {
      const entry = importedObjectsRef.current.get(id)
      if (entry) target = entry.object
    }
    if (target) {
      selectedObjectRef.current = target
      tc.attach(target)
      setSelectedObjectId(id)
    }
  }, [])

  const handleDeselectObject = useCallback(() => {
    transformControlsRef.current?.detach()
    selectedObjectRef.current = null
    setSelectedObjectId(null)
  }, [])

  const handleRestoreObject = useCallback((id) => {
    let target = null
    if (id === 'main' && activeObjectRef.current) target = activeObjectRef.current
    else {
      const entry = importedObjectsRef.current.get(id)
      if (entry) target = entry.object
    }
    const saved = initialTransformsRef.current.get(id)
    if (target && saved) {
      target.position.copy(saved.position)
      target.rotation.copy(saved.rotation)
      target.scale.copy(saved.scale)
      if (selectedObjectRef.current === target && transformControlsRef.current) {
        transformControlsRef.current.detach()
        transformControlsRef.current.attach(target)
      }
    }
  }, [])

  const handleTransformModeChange = useCallback((mode) => {
    setTransformMode(mode)
    if (transformControlsRef.current) transformControlsRef.current.setMode(mode)
  }, [])

  const handleApplyHdri = useCallback(async (hdriInfo) => {
    const view = bootstrapRef.current
    if (!view) return
    try {
      const prevTexture = hdriTexturesRef.current.texture
      const prevEnvMap = hdriTexturesRef.current.envMap
      const result = await loadHdriFromUrl(view, hdriInfo.hdrUrl)
      hdriTexturesRef.current = result
      prevTexture?.dispose()
      prevEnvMap?.dispose()
      setActiveHdriId(hdriInfo.id)
      setActiveHdriInfo({ id: hdriInfo.id, name: hdriInfo.name, hdrUrl: hdriInfo.hdrUrl })
    } catch { /* HDRI load failed */ }
  }, [])

  const handleResetHdri = useCallback(() => {
    const view = bootstrapRef.current
    if (!view) return
    if (hdriTexturesRef.current.texture) { hdriTexturesRef.current.texture.dispose(); hdriTexturesRef.current.texture = null }
    if (hdriTexturesRef.current.envMap) { hdriTexturesRef.current.envMap.dispose(); hdriTexturesRef.current.envMap = null }
    clearHdri(view)
    setActiveHdriId(null)
    setActiveHdriInfo(null)
  }, [])

  const getObjectTransforms = useCallback(() => {
    const transforms = {}
    const main = activeObjectRef.current
    if (main) {
      transforms.main = { position: main.position.toArray(), rotation: [main.rotation.x, main.rotation.y, main.rotation.z], scale: main.scale.toArray() }
    }
    for (const [id, entry] of importedObjectsRef.current) {
      const o = entry.object
      transforms[id] = { position: o.position.toArray(), rotation: [o.rotation.x, o.rotation.y, o.rotation.z], scale: o.scale.toArray() }
    }
    return transforms
  }, [])

  const handleSaveScene = useCallback(async () => {
    setSavingScene(true)
    setSaveSuccess(false)
    try {
      handleDeselectObject()
      const transforms = getObjectTransforms()
      const view = bootstrapRef.current
      let screenshot = null
      if (view) {
        view.renderer.render(view.scene, view.camera)
        screenshot = view.renderer.domElement.toDataURL('image/png')
      }
      let savedLight = null
      if (activeLightSelection.kind === 'custom' && activeCustomLightPreset) {
        savedLight = { kind: 'custom', preset: activeCustomLightPreset }
      } else if (activeLightSelection.kind === 'stock') {
        savedLight = { kind: 'stock', lightId: activeLightSelection.lightId }
      }
      const payload = {
        title: projectTitleOverride ?? resolvedAsset?.title ?? 'Untitled Scene',
        modelPath: externalModelUrl,
        hdri: activeHdriInfo,
        transforms,
        screenshot,
        importedModels: importedModels.map((m) => ({ id: m.id, uid: m.uid, name: m.name, author: m.author, thumbnailUrl: m.thumbnailUrl, source: m.source })),
        customLight: savedLight,
      }
      const url = sceneId ? `http://localhost:5174/api/scenes/${sceneId}` : 'http://localhost:5174/api/scenes'
      const method = sceneId ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) {
        const scene = await res.json()
        setSceneId(scene.id)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
      }
    } catch { /* save failed */ }
    setSavingScene(false)
  }, [activeCustomLightPreset, activeHdriInfo, activeLightSelection, externalModelUrl, getObjectTransforms, handleDeselectObject, importedModels, projectTitleOverride, resolvedAsset?.title, sceneId])

  const toggleEditMode = useCallback(() => {
    if (isLightComposerOpen || isShareViewOnly) return
    const nextIsEditMode = !isEditMode
    const nextSearchParams = new URLSearchParams(searchParams)
    if (isEditMode) {
      nextSearchParams.delete('mode')
      setActiveEditorView('isometric')
    } else {
      nextSearchParams.set('mode', 'edit')
      setControlsCollapsed(false)
    }
    if (editStatusTimeoutRef.current !== null) {
      window.clearTimeout(editStatusTimeoutRef.current)
      editStatusTimeoutRef.current = null
    }
    setEditStatusFeedback(nextIsEditMode ? 'enabled' : 'disabled')
    editStatusTimeoutRef.current = window.setTimeout(() => {
      setEditStatusFeedback(null)
      editStatusTimeoutRef.current = null
    }, EDIT_STATUS_FEEDBACK_MS)
    setSearchParams(nextSearchParams, { replace: true })
  }, [isEditMode, isLightComposerOpen, isShareViewOnly, searchParams, setSearchParams])

  useEffect(() => {
    if (!sceneId) return
    fetch(`http://localhost:5174/api/scenes/${sceneId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data) setSceneData(data) })
      .catch(() => {})
  }, [sceneId])

  useEffect(() => {
    if (!sceneData || sceneRestored || isAssetLoading) return
    const view = bootstrapRef.current
    if (!view || !activeObjectRef.current) return
    const timer = setTimeout(async () => {
      if (sceneData.transforms?.main) {
        const m = activeObjectRef.current
        const t = sceneData.transforms.main
        if (m && t) {
          if (t.position) m.position.fromArray(t.position)
          if (t.rotation) m.rotation.set(t.rotation[0], t.rotation[1], t.rotation[2])
          if (t.scale) m.scale.fromArray(t.scale)
        }
      }
      if (sceneData.customLight) {
        try {
          if (sceneData.customLight.kind === 'custom' && sceneData.customLight.preset) {
            await applyCustomLightPreset(sceneData.customLight.preset)
          } else if (sceneData.customLight.kind === 'stock' && sceneData.customLight.lightId) {
            const lightAsset = baseLightAssets.find((l) => l.id === sceneData.customLight.lightId)
            if (lightAsset) await applyBaseLight(lightAsset)
          }
        } catch { /* light restore failed */ }
      }
      if (sceneData.hdri?.hdrUrl) {
        try { await handleApplyHdri(sceneData.hdri) } catch { /* ignore */ }
      }
      if (sceneData.importedModels?.length > 0) {
        for (const model of sceneData.importedModels) {
          if (model.source === 'sketchfab' && model.uid) {
            try {
              const res = await fetch(`http://localhost:5174/api/sketchfab/models/${model.uid}/download`)
              const data = await res.json()
              if (!res.ok) continue
              const formats = data?.gltf || data?.glb ? data : (data?.formats || data)
              let downloadUrl = null
              for (const key of ['glb', 'gltf', 'usdz', 'source']) { if (formats[key]?.url) { downloadUrl = formats[key].url; break } }
              if (!downloadUrl) { for (const [, value] of Object.entries(formats)) { if (value?.url) { downloadUrl = value.url; break } } }
              if (!downloadUrl) continue
              await handleImportModel({ uid: model.uid, name: model.name, author: model.author, thumbnailUrl: model.thumbnailUrl, downloadUrl, format: 'glb' })
              if (sceneData.transforms?.[model.id]) {
                const entry = Array.from(importedObjectsRef.current.values()).pop()
                if (entry) {
                  const t = sceneData.transforms[model.id]
                  if (t.position) entry.object.position.fromArray(t.position)
                  if (t.rotation) entry.object.rotation.set(t.rotation[0], t.rotation[1], t.rotation[2])
                  if (t.scale) entry.object.scale.fromArray(t.scale)
                }
              }
            } catch { /* restore failed */ }
          }
        }
      }
      if (sceneData.title) setProjectTitleOverride(sceneData.title)
      setSceneRestored(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [sceneData, sceneRestored, isAssetLoading, handleApplyHdri, handleImportModel, applyCustomLightPreset, applyBaseLight, baseLightAssets])

  useEffect(() => {
    if (!isEditMode) return
    const handleKey = (e) => {
      if (e.target instanceof HTMLElement && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return
      switch (e.key.toLowerCase()) {
        case 'w': handleTransformModeChange('translate'); break
        case 'e': handleTransformModeChange('rotate'); break
        case 'r': handleTransformModeChange('scale'); break
        case 'escape': handleDeselectObject(); break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isEditMode, handleTransformModeChange, handleDeselectObject])

  const projectTitle = projectTitleOverride ?? resolvedAsset?.title ?? `${copy.sceneLabel} ${creationId}`

  const handleRenameProject = useCallback((newTitle) => {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    setProjectTitleOverride(trimmed)
  }, [])

  const captureViewerScreenshotBlob = useCallback(async () => {
    const view = bootstrapRef.current
    if (!view) return null
    view.renderer.render(view.scene, view.camera)
    const canvas = view.renderer.domElement
    const blob = await new Promise((resolve) => { canvas.toBlob((b) => resolve(b), 'image/png') })
    if (blob) return blob
    try {
      const dataUrl = canvas.toDataURL('image/png')
      const response = await fetch(dataUrl)
      return await response.blob()
    } catch { return null }
  }, [])

  const downloadViewerScreenshot = useCallback(async () => {
    const screenshotBlob = await captureViewerScreenshotBlob()
    if (!screenshotBlob) return false
    const downloadUrl = URL.createObjectURL(screenshotBlob)
    const downloadLink = document.createElement('a')
    downloadLink.href = downloadUrl
    downloadLink.download = buildScreenshotFileName(projectTitle)
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0)
    return true
  }, [captureViewerScreenshotBlob, projectTitle])

  const copyViewerScreenshotToClipboard = useCallback(async () => {
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') return 'unsupported'
    const screenshotBlob = await captureViewerScreenshotBlob()
    if (!screenshotBlob) return 'error'
    try {
      const clipboardItem = new ClipboardItem({ [screenshotBlob.type || 'image/png']: screenshotBlob })
      await navigator.clipboard.write([clipboardItem])
      return 'success'
    } catch { return 'error' }
  }, [captureViewerScreenshotBlob])

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const url = new URL('/editor', window.location.origin)
    url.searchParams.set('share', '1')
    return url.toString()
  }, [])

  const performUndo = useCallback(() => {
    const entry = undoStackRef.current.pop()
    if (!entry) return

    if (entry.type === 'transform') {
      let target = null
      if (entry.objectId === 'main' && activeObjectRef.current) target = activeObjectRef.current
      else {
        const imp = importedObjectsRef.current.get(entry.objectId)
        if (imp) target = imp.object
      }
      if (target) {
        redoStackRef.current.push({
          type: 'transform',
          objectId: entry.objectId,
          position: target.position.clone(),
          rotation: target.rotation.clone(),
          scale: target.scale.clone(),
        })
        target.position.copy(entry.position)
        target.rotation.copy(entry.rotation)
        target.scale.copy(entry.scale)
        if (selectedObjectRef.current === target && transformControlsRef.current) {
          transformControlsRef.current.detach()
          transformControlsRef.current.attach(target)
        }
      }
      return
    }

    if (entry.type === 'addImport') {
      redoStackRef.current.push({ type: 'addImport', id: entry.id, object: entry.object, meta: entry.meta })
      importsGroupRef.current?.remove(entry.object)
      importedObjectsRef.current.delete(entry.id)
      initialTransformsRef.current.delete(entry.id)
      if (selectedObjectRef.current === entry.object) {
        transformControlsRef.current?.detach()
        selectedObjectRef.current = null
        setSelectedObjectId(null)
      }
      setImportedModels((prev) => prev.filter((m) => m.id !== entry.id))
      return
    }

    if (entry.type === 'removeImport') {
      redoStackRef.current.push({
        type: 'removeImport',
        id: entry.id,
        object: entry.object,
        meta: entry.meta,
        modelInfo: entry.modelInfo,
      })
      importsGroupRef.current?.add(entry.object)
      importedObjectsRef.current.set(entry.id, { object: entry.object, meta: entry.meta })
      if (entry.modelInfo) {
        setImportedModels((prev) => [...prev, entry.modelInfo])
      }
      return
    }
  }, [])

  const performRedo = useCallback(() => {
    const entry = redoStackRef.current.pop()
    if (!entry) return

    if (entry.type === 'transform') {
      let target = null
      if (entry.objectId === 'main' && activeObjectRef.current) target = activeObjectRef.current
      else {
        const imp = importedObjectsRef.current.get(entry.objectId)
        if (imp) target = imp.object
      }
      if (target) {
        undoStackRef.current.push({
          type: 'transform',
          objectId: entry.objectId,
          position: target.position.clone(),
          rotation: target.rotation.clone(),
          scale: target.scale.clone(),
        })
        target.position.copy(entry.position)
        target.rotation.copy(entry.rotation)
        target.scale.copy(entry.scale)
        if (selectedObjectRef.current === target && transformControlsRef.current) {
          transformControlsRef.current.detach()
          transformControlsRef.current.attach(target)
        }
      }
      return
    }

    if (entry.type === 'addImport') {
      undoStackRef.current.push({ type: 'addImport', id: entry.id, object: entry.object, meta: entry.meta })
      importsGroupRef.current?.add(entry.object)
      importedObjectsRef.current.set(entry.id, { object: entry.object, meta: entry.meta })
      setImportedModels((prev) => [...prev, {
        id: entry.id,
        uid: entry.meta.uid,
        name: entry.meta.name,
        author: entry.meta.author,
        thumbnailUrl: entry.meta.thumbnailUrl,
        source: 'sketchfab',
      }])
      return
    }

    if (entry.type === 'removeImport') {
      undoStackRef.current.push({
        type: 'removeImport',
        id: entry.id,
        object: entry.object,
        meta: entry.meta,
        modelInfo: entry.modelInfo,
      })
      importsGroupRef.current?.remove(entry.object)
      importedObjectsRef.current.delete(entry.id)
      initialTransformsRef.current.delete(entry.id)
      if (selectedObjectRef.current === entry.object) {
        transformControlsRef.current?.detach()
        selectedObjectRef.current = null
        setSelectedObjectId(null)
      }
      setImportedModels((prev) => prev.filter((m) => m.id !== entry.id))
      return
    }
  }, [])

  useEffect(() => {
    const matchesModifier = (event) => isMacPlatform ? event.metaKey : event.ctrlKey
    const isTypingElement = (target) => {
      if (!(target instanceof HTMLElement)) return false
      const tagName = target.tagName
      return target.isContentEditable || tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT'
    }
    const onKeyDown = (event) => {
      if (!matchesModifier(event) || isTypingElement(event.target)) return
      const pressedKey = event.key.toLowerCase()
      const pressedCode = event.code
      const hasAltModifier = event.altKey
      const hasShiftModifier = event.shiftKey
      const matchesKey = (key, code) => pressedKey === key || pressedCode === code

      if (matchesKey('z', 'KeyZ') && !hasAltModifier && !hasShiftModifier) {
        event.preventDefault()
        performUndo()
        return
      }
      if (matchesKey('y', 'KeyY') && !hasAltModifier && !hasShiftModifier) {
        event.preventDefault()
        performRedo()
        return
      }
      if (matchesKey('r', 'KeyR') && !hasAltModifier && !hasShiftModifier) {
        if (isLightComposerOpen) return
        event.preventDefault()
        setIsProjectMenuOpen((s) => !s)
        return
      }
      if (matchesKey('n', 'KeyN') && hasAltModifier && !hasShiftModifier) {
        if (isLightComposerOpen) return
        event.preventDefault()
        setIsCreateDockCollapsed((s) => !s)
        return
      }
      if (matchesKey('b', 'KeyB') && hasAltModifier && !hasShiftModifier) {
        if (isLightComposerOpen) return
        event.preventDefault()
        setControlsCollapsed((s) => !s)
        return
      }
      if (matchesKey('e', 'KeyE') && !hasAltModifier && !hasShiftModifier) {
        if (isLightComposerOpen || isShareViewOnly) return
        event.preventDefault()
        toggleEditMode()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => { window.removeEventListener('keydown', onKeyDown) }
  }, [isLightComposerOpen, isMacPlatform, isShareViewOnly, performUndo, performRedo, toggleEditMode])

  const editorViewOptions = useMemo(() => [
    { id: 'isometric', label: copy.editorMode.viewIsometric },
    { id: 'front', label: copy.editorMode.viewFront },
    { id: 'right', label: copy.editorMode.viewRight },
    { id: 'back', label: copy.editorMode.viewBack },
    { id: 'left', label: copy.editorMode.viewLeft },
    { id: 'top', label: copy.editorMode.viewTop },
  ], [copy.editorMode.viewBack, copy.editorMode.viewFront, copy.editorMode.viewIsometric, copy.editorMode.viewLeft, copy.editorMode.viewRight, copy.editorMode.viewTop])

  const isViewerUiLoading = (!externalModelUrl && assets === null) || isAssetLoading
  const loadingCardDescription = resolvedAsset?.title ?? copy.asset.loadingDescription

  return (
    <AppLayout collapsibleSidebar>
    <main
      className={`viewer-page ${isEditMode ? 'viewer-page--edit-mode' : ''}`}
      aria-label="3D workspace"
    >
      <div className="viewer-workspace">
        <section className="viewer-stage-panel">
          <div
            className={`viewer-stage ${isLightComposerOpen ? 'viewer-stage--light-composer-open' : ''}`}
            role="region"
            aria-label={copy.stageAriaLabel}
          >
            <div ref={stageRef} className="viewer-stage-canvas" />
            {isViewerUiLoading ? (
              <div
                className="viewer-stage-overlay viewer-stage-overlay--loading-card"
                role="status"
                aria-live="polite"
              >
                <p>{copy.asset.loading}</p>
                <small>{loadingCardDescription}</small>
              </div>
            ) : null}

            {!isViewerUiLoading ? (
              <>
                {canInteractCamera ? (
                  <span
                    ref={pointerIndicatorRef}
                    className={`viewer-target-indicator ${isPointerIndicatorVisible ? 'is-visible' : ''}`}
                    aria-hidden="true"
                  />
                ) : null}

                {!isLightComposerOpen ? (
                  <ViewerProjectMenu
                    isProjectMenuOpen={isProjectMenuOpen}
                    onToggleProjectMenu={() => setIsProjectMenuOpen((s) => !s)}
                    projectMenuShortcutKeys={projectMenuShortcutKeys}
                    projectTitle={projectTitle}
                    onRenameProject={handleRenameProject}
                    shareUrl={shareUrl}
                    onDownloadScreenshot={downloadViewerScreenshot}
                    onCopyScreenshot={copyViewerScreenshotToClipboard}
                    sceneAssets={sceneAssets}
                    baseLightAssets={baseLightAssets}
                    customLightPresets={customLightPresets}
                    activeLightSelection={activeLightSelection}
                    activeLightLabel={activeLightLabel}
                    lightApplyStatus={lightApplyStatus}
                    onApplyBaseLight={applyBaseLight}
                    onApplyCustomLight={applyCustomLightPreset}
                    onResetBaseLight={resetToDefaultLight}
                    onOpenLightComposer={openLightComposer}
                    onOpenGallery={() => navigate('/gallery')}
                    onOpenAssetLibrary={() => { setIsProjectMenuOpen(false) }}
                    onOpenUpload={() => navigate('/upload')}
                    copy={copy}
                  />
                ) : null}

                {!isLightComposerOpen ? (
                  <ViewerQuickCreateDock
                    copy={copy}
                    isEditMode={isEditMode}
                    isCreateDockCollapsed={isCreateDockCollapsed}
                    createDockShortcutKeys={createDockShortcutKeys}
                    onCollapseCreateDock={() => setIsCreateDockCollapsed(true)}
                    onExpandCreateDock={() => setIsCreateDockCollapsed(false)}
                    quickCreateTarget={quickCreateTarget}
                    onQuickCreateTargetChange={setQuickCreateTarget}
                    quickCreateMode={quickCreateMode}
                    onQuickCreateModeChange={setQuickCreateMode}
                    quickCreatePrompt={quickCreatePrompt}
                    onQuickCreatePromptChange={setQuickCreatePrompt}
                    onGenerateAssetInScene={generateAssetInScene}
                    onContinueToUpload={continueToUploadFromQuickCreate}
                    onImportFromLibrary={() => setIsSketchfabOpen(true)}
                    assetDraftName={assetDraftName}
                    onAssetDraftNameChange={setAssetDraftName}
                    assetDraftType={assetDraftType}
                    onAssetDraftTypeChange={setAssetDraftType}
                    onAddCustomAsset={addCustomAsset}
                  />
                ) : null}

                {!isLightComposerOpen ? (
                  <ViewerZoomMeter
                    zoomPercent={zoomPercent}
                    copy={copy}
                    onOpenHelp={() => setIsHelpTutorialOpen(true)}
                  />
                ) : null}

                {canInteractCamera ? (
                  <RotateCameraAnimation
                    hasStartedRotation={hasStartedRotation}
                    copy={copy}
                  />
                ) : null}

                {!isLightComposerOpen ? (
                  <ViewerStageControls
                    copy={copy}
                    isEditMode={isEditMode}
                    editStatusFeedback={editStatusFeedback}
                    controlsShortcutKeys={controlsShortcutKeys}
                    editModeShortcutKeys={editModeShortcutKeys}
                    toggleEditMode={toggleEditMode}
                    hideEditModeButton={isLightComposerOpen || isShareViewOnly}
                    controlsCollapsed={controlsCollapsed}
                    setControlsCollapsed={setControlsCollapsed}
                    canInteractCamera={canInteractCamera}
                    zoomControlProgress={zoomControlProgress}
                    setZoomProgress={setZoomProgress}
                    rotateCamera={rotateCamera}
                    zoomCamera={zoomCamera}
                    resetCamera={resetCamera}
                    activeEditorView={activeEditorView}
                    setActiveEditorView={setActiveEditorView}
                    editorViewOptions={editorViewOptions}
                    savingScene={savingScene}
                    saveSuccess={saveSuccess}
                    onSaveScene={handleSaveScene}
                    sceneId={sceneId}
                  />
                ) : null}

                {isLightComposerOpen && lightComposerDraft ? (
                  <ViewerLightComposerPanel
                    draft={lightComposerDraft}
                    isApplyingLight={lightApplyStatus === 'loading'}
                    onDraftChange={(nextDraft) => setLightComposerDraft(nextDraft)}
                    onAddSource={addComposerSource}
                    onSelectSource={selectComposerSource}
                    onReorderSources={reorderComposerSources}
                    onSourceChange={updateComposerSource}
                    onDeleteSource={removeComposerSource}
                    onSave={() => { void saveComposedLight() }}
                    onCancel={closeLightComposerWithRevert}
                    copy={copy}
                  />
                ) : null}
              </>
            ) : null}

            <ViewerStageOverlays
              assets={assets}
              resolvedAsset={resolvedAsset}
              manifestError={manifestError}
              assetError={assetError}
              onDismissAssetError={() => setAssetError(null)}
              copy={copy}
            />
          </div>
        </section>

        {isEditMode && (
          <ViewerScenePanel
            isEditMode={isEditMode}
            selectedObjectId={selectedObjectId}
            transformMode={transformMode}
            onTransformModeChange={handleTransformModeChange}
            onDeselectObject={handleDeselectObject}
            mainModelTitle={resolvedAsset?.title || externalModelTitle}
            importedModels={importedModels}
            onSelectObject={handleSelectObject}
            onRestoreObject={handleRestoreObject}
            onRemoveImport={handleRemoveImport}
            showHdriPanel={showHdriPanel}
            onToggleHdriPanel={() => setShowHdriPanel((s) => !s)}
            activeHdriId={activeHdriId}
            activeHdriName={activeHdriInfo?.name || null}
            onApplyHdri={handleApplyHdri}
            onResetHdri={handleResetHdri}
            onOpenSketchfab={() => setIsSketchfabOpen(true)}
            onOpenLocalAssets={() => setIsLocalAssetsOpen(true)}
            onOpenLightComposer={openLightComposer}
          />
        )}
      </div>

      <ViewerHelpTutorialModal
        isOpen={isHelpTutorialOpen}
        onClose={() => setIsHelpTutorialOpen(false)}
        copy={copy.helpTutorial}
      />

      <SketchfabModal
        isOpen={isSketchfabOpen}
        onClose={() => setIsSketchfabOpen(false)}
        onImportModel={handleImportModel}
      />
      <LocalAssetsModal
        isOpen={isLocalAssetsOpen}
        onClose={() => setIsLocalAssetsOpen(false)}
        onImportModel={handleImportModel}
      />
    </main>
    </AppLayout>
  )
}
