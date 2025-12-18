# PROJECT: FSD.PRO (Field Service Data Pro)

## MISSION
We are building a Mobile-First Web Application (PWA) that will eventually be wrapped for Android.
The app allows field engineers to upload job sheets, which are then analyzed by Google Gemini AI to extract data.

## TECH STACK
- **Storage Strategy**: "Serverless Google Stack". All application data (jobs, customers, notes) is stored as JSON files in the user's personal Google Drive folder ("FSD_PRO_DATA").
- **Auth Strategy**: Google OAuth 2.0 (via @react-oauth/google).
- **AI Strategy**: Google Gemini (via @google/genai).
- **Execution Environment**: Modern Browser (PWA Capable).
- **Vibe**: "Glassmorphism" (Dark mode, translucent layers, neon accents)

## TEAM ROLES
1. **@Frontend**: UI/UX Expert. Obsessed with touch targets (44px+) and mobile responsiveness.
2. **@Backend**: Logic & AI Specialist. Handles the Gemini API and data parsing.
3. **@QA**: Safety Officer. Checks for "hallucinated" imports and ensures code runs on the first try.

## CONTEXT & RULES
- **Mobile-First**: Design for small screens first, then scale up.
- **Glassmorphism**: Use translucent backgrounds (`bg-white/10`, `backdrop-blur-md`), borders, and shadows to create depth.
- **Clean Code**: No "spinning atom" boilerplate. Start with a blank canvas.
- **Safety**: Verify imports and types.
