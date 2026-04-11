import React, { Suspense, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

function getExtension(url) {
  return url.split('.').pop().split('?')[0].toLowerCase();
}

function ObjModel({ path }) {
  const obj = useLoader(OBJLoader, path);
  return <primitive object={obj.clone()} />;
}

function FbxModel({ path }) {
  const fbx = useLoader(FBXLoader, path);
  return <primitive object={fbx.clone()} />;
}

function GlbModel({ path }) {
  const { scene } = useGLTF(path);
  return <primitive object={scene.clone()} />;
}

function AutoFitModel({ path }) {
  const ref = useRef();
  const { camera } = useThree();
  const ext = getExtension(path);

  useEffect(() => {
    if (!ref.current) return;

    const box = new THREE.Box3().setFromObject(ref.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    ref.current.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2.5;
    camera.position.set(distance * 0.7, distance * 0.4, distance * 0.8);
    camera.near = maxDim * 0.01;
    camera.far = maxDim * 100;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  });

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={ref}>
      {ext === 'obj' && <ObjModel path={path} />}
      {ext === 'fbx' && <FbxModel path={path} />}
      {(ext === 'glb' || ext === 'gltf') && <GlbModel path={path} />}
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#30ada9" wireframe />
    </mesh>
  );
}

export default function ModelPreview({ modelPath, enableZoom = false, enablePan = false }) {
  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 40 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} />
      <Suspense fallback={<LoadingFallback />}>
        <AutoFitModel path={modelPath} />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls
        enableZoom={enableZoom}
        enablePan={enablePan}
        autoRotate={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
