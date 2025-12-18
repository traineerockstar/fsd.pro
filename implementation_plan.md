# Refactor Core Layout (The Shell)

## Goal
Establish a structured, "Glassmorphism" based layout shell for the application, organizing the Sidebar and Main Content into a responsive grid.

## Proposed Changes
### New Component
#### [NEW] [Shell.tsx](file:///c:/Users/mattb/Desktop/fsd%20usable/components/Shell.tsx)
-   **Props:** `activeView`, `onNavigate`, `onLogout`, `children`.
-   **State:** `isSidebarOpen` (internal or lifted? Dashboard needs it? Dashboard manages it currently, but Shell could own the *toggle* UI).
    -   *Decision:* Let `Shell` manage the boolean state for sidebar visibility on mobile to simplify Dashboard.
-   **Layout:**
    -   Container: Full screen, radial gradient background.
    -   Desktop: `grid-cols-[256px_1fr]`. Fixed `Sidebar`.
    -   Mobile: `block` (Sidebar absolute/fixed).
-   **Styling:**
    -   Main Content wrapper: `m-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden`. This creates the "Glass Sheet" look requested.

### Modified Component
#### [MODIFY] [Dashboard.tsx](file:///c:/Users/mattb/Desktop/fsd%20usable/components/Dashboard.tsx)
-   Import `Shell`.
-   Wrap content in `<Shell>`.
-   Remove manual layout `div`s and `isSidebarOpen` state (delegating to Shell or passing through).
-   *Note:* The `Header` is currently inside `Dashboard`. I should probably move the Header into the `Shell` or keep it as a child. User said "Shell... to act as the main app container". The Header usually belongs to the Shell. I will expose a `title` prop or `headerContent` prop to `Shell` OR keep the Header as the first child of the Shell's main area. Keeping it as the first child gives more flexibility to Dashboard.

## Visual Requirements Verification
1.  **Background:** Slate gradient (implemented in Shell container).
2.  **Grid:** 256px Sidebar (Desktop) + Flex Content.
3.  **Glass Feel:** Wrapper div with `bg-white/5` etc.
