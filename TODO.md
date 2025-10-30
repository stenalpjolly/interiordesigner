# 10x Interior Designer: Development Checklist (Next.js)

This checklist outlines the plan to build the application using the existing Next.js framework.

## Phase 1: Project Setup & Structuring

- [ ] **Review and Configure `tailwind.config.ts`:** Ensure the `content` property is correctly configured to scan `src/app/**/*.{js,ts,jsx,tsx}` and `src/components/**/*.{js,ts,jsx,tsx}`.
- [ ] **Create Directory Structure:**
    - [ ] Create `src/components` for UI components.
    - [ ] Create `src/lib` for shared utilities, like a `fetchWithBackoff` function.
    - [ ] Create `src/app/api/analyze/route.ts` for the analysis API call.
    - [ ] Create `src/app/api/generate/route.ts` for the image generation API call.
- [ ] **API Key Setup:**
    - [ ] Create a `.env.local` file.
    - [ ] Add `GOOGLE_API_KEY="YOUR_API_KEY_HERE"` to `.env.local`.
    - [ ] Add `.env.local` to `.gitignore` if it's not already there.

## Phase 2: UI Implementation (React Components)

- [ ] **Main Page (`src/app/page.tsx`):**
    - [ ] Implement a state machine using `useState` to manage the current view (e.g., `upload`, `analyzing`, `questions`, `generating`, `results`).
    - [ ] Conditionally render the appropriate screen component based on the current state.
    - [ ] Manage all application state (image data, analysis results, user answers, generated images).
- [ ] **Create Screen Components:**
    - [ ] `src/components/UploadScreen.tsx`: Handles file input, drag-and-drop, and paste events. Calls a function passed via props to update the parent's state with the image data.
    - [ ] `src/components/LoadingScreen.tsx`: A reusable component that accepts a text prop (e.g., "Analyzing...", "Generating...").
    - [ ] `src/components/QuestionsScreen.tsx`: Receives analysis data and questions as props. Renders the form. Calls a prop function on submit with the user's answers.
    - [ ] `src/components/ResultScreen.tsx`: Receives an array of generated image URLs/base64 strings. Renders the results grid. Manages the zoom modal. Includes a "Start Over" button that calls a prop function.

## Phase 3: Backend API Routes

- [ ] **Implement Analysis API Route (`/api/analyze/route.ts`):**
    - [ ] Read the incoming request body (which will contain the image data).
    - [ ] Use the Google Generative AI SDK to call the `gemini-2.5-flash-preview-09-2025` model.
    - [ ] Construct the prompt and payload as specified in the PRD.
    - [ ] Return the structured JSON response to the client.
    - [ ] Implement error handling.
- [ ] **Implement Generation API Route (`/api/generate/route.ts`):**
    - [ ] Read the incoming request body (original image, analysis, user answers).
    - [ ] Call the `gemini-2.5-flash-image-preview` model.
    - [ ] Construct the detailed prompt, ensuring the "Preserve Structure" instruction is included.
    - [ ] Return the generated image data (base64) to the client.
    - [ ] Implement error handling.

## Phase 4: Client-Side Logic & Integration

- [ ] **Connect UI to API Routes:**
    - [ ] In `src/app/page.tsx`, write functions to `fetch` data from `/api/analyze` and `/api/generate`.
    - [ ] Implement the state transition logic: after the image is uploaded, call the analyze API; after questions are submitted, call the generate API.
- [ ] **Implement Image Handling:**
    - [ ] Write the logic in `UploadScreen.tsx` to handle file selection, drag-and-drop, and paste.
    - [ ] Convert the uploaded image to a base64 string to be sent to the backend.
- [ ] **Implement Utility Functions:**
    - [ ] Create `src/lib/utils.ts` and add the `fetchWithBackoff` function if desired for extra resilience, although initial implementation can use standard `fetch`.

## Phase 5: Finalization & Testing

- [ ] **Test the Full E2E Flow:**
    - [ ] Upload an image and verify the analysis questions are relevant.
    - [ ] Answer the questions and verify the generated images respect the original structure.
    - [ ] Test all buttons and interactions (Zoom, Download, Start Over).
- [ ] **Error Handling:**
    - [ ] Ensure API errors are caught and communicated to the user (e.g., "Analysis failed, please try again").
- [ ] **Styling and Responsiveness:**
    - [ ] Polish the UI with Tailwind CSS and ensure it works on mobile devices.
- [ ] **Code Cleanup:**
    - [ ] Add TypeScript types for all state and API payloads.
    - [ ] Add comments to complex logic.