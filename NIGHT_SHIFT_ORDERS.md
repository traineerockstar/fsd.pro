# FSD.PRO AUTONOMOUS WORK ORDER
Status: APPROVED (USER GRANTED FULL PERMISSION)

## PHASE 1: The Hybrid Brain (Knowledge)
- [x] **Service:** Create `services/knowledgeService.ts`.
- [x] **Logic:** Implement `findManual(model)`: Check `FSD_PRO_DATA/MANUALS` (Drive) FIRST.
- [x] **Logic:** Implement Fallback: If Drive empty, call Exa.ai API (Sniper Mode).
- [x] **Logic:** Implement Auto-Save: If Exa finds PDF, save to Drive `MANUALS`.
- [x] **UI:** Update `TrainingCenter.tsx` with "Bulk Sync" button.

## PHASE 2: The Diagnostic Wizard (Triage)
- [x] **Page:** Create `pages/DiagnosticWizard.tsx`.
- [x] **UI:** Build Screen 1: "Symptom" vs "Error Code" buttons.
- [x] **Logic:** Connect to `solutions_db.json` (History) to show "Most Likely Fix".
- [x] **Logic:** If no history, trigger Oscar (Gemini) to read the Manual (Phase 1) and generate a checklist.
- [x] **Feedback:** Create "Mark as Fixed" button that updates `solutions_db.json`.

## PHASE 3: The Smart Scheduler (Logistics)
- [x] **Service:** Create `services/ingestionService.ts`.
- [x] **Logic:** Watch `INPUT_SCREENSHOTS` -> Extract Job Data -> Create Job Card.
- [x] **Logic:** Auto-set Start Time (07:00) and Windows (2 Hours).
- [x] **UI:** Display "Gap Time" (Travel Time) between jobs in `IngestManager.tsx`.
- [x] **SMS:** Create `MessageCenter.tsx` with "Copy Arrival Text" buttons.

## PHASE 4: Visuals & Cleanup
- [x] **Service:** Create `services/imageService.ts` (Google Custom Search Placeholder).
- [x] **UI:** Add Machine Image Header to `JobDetail.tsx`.
- [x] **Cleanup:** Ensure all new files are imported in `App.tsx` routing.
