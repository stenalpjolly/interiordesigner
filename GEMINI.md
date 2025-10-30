# 10x Interior Designer (Next.js Version)

## Version: 1.1
## Date: October 30, 2025

---

## 1. Executive Summary

### 1.1. Product Title
10x Interior Designer

### 1.2. Mission & Elevator Pitch
The 10x Interior Designer is a single-page web application that empowers users to instantly visualize new interior designs for their own rooms. By uploading or pasting a photo, users receive a dynamic, AI-generated questionnaire. Based on their answers, the app generates multiple photorealistic design concepts that preserve the original room's core structure, allowing for a direct and realistic comparison.

### 1.3. Core Problem
Homeowners and renters struggle to visualize how new interior design styles, furniture, or color palettes will look in their specific space. Current tools are often complex or too generic.

### 1.4. Core Solution
A simple, wizard-style tool that analyzes a user's room photo, asks intelligent questions, and generates structure-preserving, photorealistic redesigns in seconds.

---

## 2. Core User Flow

The user experience is a linear, multi-step "wizard" built as a single-page application using React components.

- **Step 1: Upload**
  - The user uploads or pastes an image. The app shows a preview and transitions to the next step.

- **Step 2: AI Analysis**
  - A loading state is shown.
  - The frontend calls a Next.js API route (`/api/analyze`) which securely calls the Gemini 2.5 Flash model to get a room analysis and a set of questions.

- **Step 3: Customize**
  - The AI's "Designer's Notes" and dynamic questions are displayed in a React component.
  - The user selects design preferences and the number of variants.

- **Step 4: AI Generation**
  - A loading state is shown.
  - The frontend calls another API route (`/api/generate`) for each variant. This route securely calls the `gemini-2.5-flash-image-preview` model.

- **Step 5: Review**
  - The generated designs are displayed in a results grid with "Zoom" and "Download" options.

---

## 3. Key Features

- **Image Upload & Clipboard Paste:** Flexible image input.
- **AI Room Analysis:** Uses a secure Next.js API route to call the Gemini model.
- **Dynamic Questionnaire:** Renders a dynamic form from the API response.
- **Structure-Preserving Image Generation:** The core feature, ensuring realistic redesigns.
- **Image Result Gallery:** A responsive grid to display results.
- **Component-Based Architecture:** A clean and maintainable UI built with React.
- **Secure API Calls:** API keys are stored in environment variables and used only on the server-side within Next.js API routes.

---

## 4. Technical Design & Architecture

### 4.1. Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (`useState`, `useReducer`) for managing the wizard flow and application state within the main page component.
- **Components:** The UI is broken down into modular React components for each screen of the wizard (`UploadScreen`, `QuestionsScreen`, `ResultScreen`, etc.).

### 4.2. Backend (Next.js API Routes)
- **API Routes:**
  - `src/app/api/analyze/route.ts`: Handles the room analysis call to the Gemini API.
  - `src/app/api/generate/route.ts`: Handles the image generation calls to the Gemini API.
- **Security:** The Google Generative AI API key is stored in `.env.local` and is only accessible on the server side, preventing exposure to the client.

### 4.3. AI & Platform
- **Platform:** Google Generative AI (Gemini API)
- **Models:**
  - **Analysis & Questions:** `gemini-2.5-flash-preview-09-2025`
  - **Image Generation:** `gemini-2.5-flash-image-preview`

---

## 5. Potential Future Enhancements

- **Interactive Masking:** Allow users to select specific items to keep or replace.
- **Style & Brand Library:** Offer preset style buttons.
- **Firestore Project Saving:** Add user authentication to save projects.
- **"Shop the Look" (Monetization):** Use a third AI call to identify furniture and find matching products online.