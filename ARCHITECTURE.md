# Field Service Data Processor - Architecture Blueprint

## 1. Project Overview

**Name:** Field Service Data Processor
**Goal:** An AI-powered "Digital Worksheet" for field engineers. The app takes screenshot inputs, organizes them into a schedule (Agenda View), and uses the Gemini API to extract data, format tables, and generate customer notifications.

## 2. Current Folder Structure

```
/
├── index.html              # Entry point
├── index.tsx               # React root mount
├── App.tsx                 # Main Application Container (Orchestrator)
├── types.ts                # TypeScript interfaces (ProcessedData, etc.)
├── metadata.json           # Project metadata and permissions
├── services/
│   └── geminiService.ts    # AI Integration: Prompts, API calls, Schema validation
└── components/
    ├── ImageUploader.tsx   # File selection and preview logic
    ├── TimeSlotManager.tsx # Schedule management (Current: Manual | Future: Auto-Agenda)
    ├── DataTable.tsx       # Markdown -> HTML Table renderer
    ├── Notifications.tsx   # Message display with Copy-to-Clipboard
    ├── Loader.tsx          # UI Loading state
    └── Icons.tsx           # SVG Icon library
```

## 3. Key Components & Responsibilities

### `App.tsx` (The Controller)
*   **Responsibility:** Holds the "Single Source of Truth" for the application state.
*   **State Managed:**
    *   `imageFiles`: Array of uploaded File objects.
    *   `timeSlots`: Array of `{ start, end }` objects.
    *   `processedData`: The JSON result from Gemini.
    *   `isLoading`, `error`: UI states.
*   **Action:** Orchestrates the data flow. It passes `imageFiles` to the Uploader and `timeSlots` to the Manager. It triggers the `geminiService` when the "Process" button is clicked.

### `components/TimeSlotManager.tsx` (The Schedule Engine)
*   **Current Status:** A semi-automated list manager.
    *   Allows manual adding/removing of slots.
    *   Enforces rules: Job 1 fixed (07:30-08:30). Jobs 2+ have editable start times but fixed 2-hour durations.
*   **Future Goal (The Digital Worksheet):**
    *   **Role:** A read-only or "Agenda View" component that reacts to the *number* of jobs.
    *   **Automation:** Instead of manual "Add" buttons, it will receive a `jobCount` prop.
    *   **Logic:** It will automatically generate the schedule based on the `jobCount`.
    *   **Defaults:** It will implement specific default start times (Job 1 @ 7:30, Job 2 @ 8:00, etc.) and auto-calculate end times (Start + 2hrs).

### `services/geminiService.ts` (The Brain)
*   **Responsibility:** Constructs the `MASTER_PROMPT` dynamically based on the `timeSlots` provided by the user.
*   **Logic:** Uses Google Gemini 2.5 Pro to process images, extract text, apply business logic (serial number decoding), and return structured JSON.

## 4. State Management Strategy

### Current State (Lifted State)
*   The state is "lifted" to `App.tsx`.
*   `TimeSlotManager` receives `timeSlots` (read) and `onTimeSlotsChange` (write) as props.
*   This allows `App.tsx` to easily access the final schedule to send to the API.

### Future Data Flow (Refactor Plan)
*   **Trigger:** User uploads images via `ImageUploader`.
*   **Calculation:** `App.tsx` determines `jobCount` = `imageFiles.length`.
*   **Prop Propagation:** `App` passes `jobCount` to `TimeSlotManager`.
*   **Auto-Generation:**
    *   `TimeSlotManager` listens for changes to `jobCount`.
    *   It automatically generates the array of time slots based on the specific default rules (Job 1: 7:30, Job 2: 8:00, Job 3: 10:00...).
    *   It updates the parent `App` state (or manages it internally and exposes it) so the "Process" button works immediately without manual user setup.

## 5. Future Roadmap: The Digital Worksheet

The immediate goal is to transition `TimeSlotManager` from a "Creation Tool" to a "Worksheet View".

**The Rules of the Worksheet:**
1.  **Job 1**: Always fixed `07:30 - 08:30`.
2.  **Automation**: If 5 images are uploaded, 5 slots appear instantly. No manual "Add Slot" clicks required.
3.  **Specific Defaults**:
    *   Job 2 starts at 08:00 (30 min overlap with end of Job 1 allowed in logic, or distinct).
    *   Job 3 starts at 10:00.
    *   Job 4 starts at 11:00.
    *   Job 5 starts at 12:00.
    *   Job 6 starts at 13:00.
    *   Job 7+ starts 2 hours after previous.
4.  **Editability**: Start times remain editable to adjust for travel/delays, but end times are strictly `Start + 2 hours` (for Job 2+).
