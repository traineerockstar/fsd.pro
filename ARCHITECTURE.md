# FSD.PRO Architecture Blueprint (v2.0)

## 1. Core Philosophy: "The Serverless Google Stack"
*   **Identity:** Google OAuth 2.0 (Client-side)
*   **Database:** User's Google Drive (`FSD_PRO_DATA` folder). JSON files act as NoSQL documents.
*   **Compute:** Browser-based React Logic + Google Gemini API (AI).
*   **Advantages:** Zero backend maintenance, data sovereignty (user owns their data), infinite scalability.

## 2. Directory Structure
```
/
├── components/
│   ├── Dashboard.tsx       # Main Orchestrator (Schedule)
│   ├── IngestManager.tsx   # Smart Schedule & Image Processing
│   ├── OscarChat.tsx       # AI Assistant (Context-Aware)
│   ├── JobCard.tsx         # Job Display & Interaction
│   ├── JobDetail.tsx       # Deep Dive Job View (Maps, Uploads)
│   ├── Sidebar.tsx         # Navigation
│   ├── LoginScreen.tsx     # OAuth Entry Point
│   └── ... (UI Atoms)
├── services/
│   ├── geminiService.ts    # AI Logic (Prompt Engineering)
│   ├── googleDriveService.ts # Persistence Layer
│   ├── ingestionService.ts # Parsing & Logic Layer
│   └── sheetExportService.ts # Google Sheets Connector
├── context/
│   └── JobContext.tsx      # Global State (Syncs with Drive)
├── App.tsx                 # Root Container (Auth Handler)
```

## 3. Data Flow
1.  **Ingestion:**
    *   User uploads screenshots (Manual or via Drive Scan) in `IngestManager`.
    *   Gemini processes images -> JSON.
    *   `TimeSlotManager` allows user review.
    *   **Save:** Data is written as `job_{uuid}.json` to Google Drive.
2.  **Hydration:**
    *   `JobProvider` scans Drive on load.
    *   Hydrates `jobs` state in React Context.
3.  **Interaction:**
    *   User interacts with `Dashboard` / `JobDetail`.
    *   Updates (e.g., status change) are optimistically updated in UI and synced to Drive in background.

## 4. Key Components
*   **Dashboard:** The single source of truth for the UI. Manages tool modals (`Ingest`, `Diagnostic`, `Oscar`).
*   **OscarChat:** "The Neurosurgeon". Has read-access to the current `Job` context to answer specific questions.
*   **IngestManager:** "The Architect". Handles the transform from Unstructured Data (Images) -> Structured Data (JSON).

## 5. Security & Privacy
*   **Token Handling:** Access Tokens are held in React State (`App.tsx`) and passed down. Never stored in localStorage (security best practice).
*   **Scope:** App only accesses files it created (`drive.file` scope) or specific folders it is pointed to.
