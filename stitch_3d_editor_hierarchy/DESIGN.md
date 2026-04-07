# Design System Specification: High-End 3D SaaS Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Liquid Architect"**

This design system rejects the rigid, boxy constraints of traditional SaaS dashboards in favor of a fluid, "liquid glass" experience. We move beyond the "template" look by treating the interface as an environment of light and depth rather than a flat canvas. 

The system is defined by **Intentional Asymmetry** and **Tonal Depth**. By overlapping glass containers and utilizing high-contrast typography scales (the juxtaposition of the technical `Inter` and the architectural `Manrope`), we create a workspace that feels like a premium creative studio. We don't just display data; we curate an atmosphere of professional high-tech precision.

---

## 2. Colors & Surface Philosophy

### The Tonal Palette
Our palette is anchored in a refreshing, cool-toned "Atmospheric Blue" (`#f3fafd`) and a high-energy "Digital Teal" (`#30ada9`). 

*   **Primary (`#006a67`):** Use for high-authority actions and deep-contrast elements.
*   **Primary Container (`#30ada9`):** Our signature accent. Use for creative highlights and active states.
*   **Surface Tiers:** Use `surface-container-lowest` (#ffffff) for the highest visual priority (floating cards) and `surface-container-high` (#e2e9ec) for recessed backgrounds.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. 
*   *Correct:* A `surface-container-low` section sitting directly on a `surface` background.
*   *Incorrect:* Using a grey line to separate the sidebar from the main content.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of frosted glass.
1.  **Base Layer:** `surface` (#f3fafd).
2.  **Structural Sections:** `surface-container-low` (#eef5f8).
3.  **Active Workspace/Cards:** `surface-container-lowest` (#ffffff).

### The "Glass & Gradient" Rule
To achieve the "Liquid" feel, floating elements (modals, dropdowns, navigation rails) must use Glassmorphism:
*   **Background:** `surface` at 70% opacity.
*   **Effect:** `backdrop-filter: blur(24px)`.
*   **Stroke:** 1px "Ghost Border" using `outline-variant` at 15% opacity to catch "light" on the edges.

---

## 3. Typography
We use a dual-typeface system to balance technical utility with editorial authority.

*   **The Hero (Manrope):** Used for `display` and `headline` levels. It provides an architectural, wide-set feel that communicates high-end tech.
*   **The Workhorse (Inter):** Used for `title`, `body`, and `label`. Increase `letter-spacing` by 0.02em on all Inter styles to maintain the "breathable" premium aesthetic.

**Hierarchy as Identity:**
- **Display Large (3.5rem):** Use for bold, asymmetric hero statements.
- **Headline Medium (1.75rem):** Use for primary section headers to establish a clear mental map.
- **Label Medium (0.75rem):** Use `on-surface-variant` with `font-weight: 600` for technical metadata.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved through **Tonal Layering** rather than structural shadows.
*   Place a `surface-container-lowest` card (Pure White) on a `surface-container-low` background. The subtle shift in hex code creates a "soft lift" that feels more modern than a drop shadow.

### Ambient Shadows
When a component must "float" (e.g., a 3D model inspector or a floating action menu):
*   **Blur:** 40px to 60px.
*   **Spread:** -5px.
*   **Color:** `on-surface` (#161d1f) at 4% to 6% opacity. 
*   **Intent:** The shadow should feel like ambient occlusion in a 3D engine, not a 2D offset shadow.

### Corner Radii
*   **Standard Cards:** `md` (1.5rem / 24px). This large radius is non-negotiable; it softens the high-tech edge, making the system feel "liquid."
*   **Buttons/Chips:** `full` (9999px) to contrast the expansive cards.

---

## 5. Components

### Buttons
*   **Primary:** `primary-container` background with `on-primary-container` text. Use a subtle linear gradient (Top: +5% brightness) to give it a 3D "molded" look.
*   **Secondary:** `surface-container-highest` background. No border.
*   **Ghost:** Transparent background with `primary` text. Use only for low-priority utility actions.

### Cards & Lists
*   **Forbid Divider Lines:** Use `Spacing 6` (2rem) of vertical white space or a shift to `surface-container-low` to separate items.
*   **Interactive Cards:** On hover, shift background from `surface-container-lowest` to `primary-fixed-dim` at 10% opacity and increase shadow diffusion.

### Input Fields
*   **Style:** Minimalist "Underline" style is forbidden. Use "Soft Inset" style.
*   **Background:** `surface-container-high`.
*   **Border:** None.
*   **Focus:** A 2px `primary` border with a soft `primary` outer glow (8px blur).

### 3D Viewport Controls (Context Specific)
*   **Floating HUD:** Use the "Glassmorphism" rule. 
*   **Controls:** Use `full` roundedness for all toggle switches and sliders to mimic physical hardware.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetric layouts. If a right-side panel is 300px, the left-side margin should not necessarily be 300px. Create "breathing rooms."
*   **Do** use `primary` for purposeful focal points. The teal accent should be a "reward" for the user's eye, not a default color for every icon.
*   **Do** embrace white space. If you think there is enough space, add `Spacing 2`.

### Don't:
*   **Don't** use pure black (#000000) for shadows or text. Always use the `on-surface` or `on-surface-variant` tokens.
*   **Don't** use 1px solid borders to create "grids." If the layout looks messy, use background tonal shifts to organize it.
*   **Don't** use standard "Material Design" ripple effects. Use soft "Fade-to-Color" transitions (200ms Ease-Out).

---

## 7. Spacing Scale Reference
*   **Section Padding:** `12` (4rem) or `16` (5.5rem).
*   **Card Internal Padding:** `6` (2rem).
*   **Element Grouping:** `3` (1rem).
*   **Fine Metadata:** `1` (0.35rem).

*Director's Note: Every pixel should feel like it was placed by an architect, not a developer. If a component feels "standard," it's not finished. Refine the blur, soften the shadow, and increase the radius until it feels like liquid glass.*