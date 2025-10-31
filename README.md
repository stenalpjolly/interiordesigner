# 🎨 10x AI Interior Designer

Instantly redesign your room with the power of AI! ✨ Simply upload a photo of any room, and our AI-powered interior designer will analyze the space, ask you a few smart questions about your style, and generate stunning, photorealistic design concepts. It preserves the core structure of your room, making the new designs feel realistic and achievable.

---

<!-- You can add a screenshot or GIF of the application in action here -->
<!-- ![App Screenshot](link-to-your-screenshot.png) -->

## ✨ Features

*   📸 **Effortless Image Upload:** Drag-and-drop, paste from clipboard, or browse your files.
*   🧠 **Smart AI Analysis:** Uses Google's Gemini model to understand your room's layout, furniture, and style, including walls, ceilings, and doors.
*   📝 **Dynamic Questionnaire:** Get a unique set of questions with interactive hotspots on your image to fine-tune your preferences.
*   🎨 **AI-Powered Redesigns:** Generate multiple, high-quality design variations in parallel based on your feedback.
*   🔍 **Pixel-Perfect Comparison:**
    *   Select any two generated designs for a side-by-side comparison with a slider.
    *   Click a single image to compare it directly against your original photo.
*   🖼️ **Responsive Gallery:** View your new designs in a beautiful, responsive grid that adapts to your screen size.
*   ⚡ **Server-Side Caching:** Upload the same image again and get instant results without waiting for the AI analysis.
*   💀 **Skeleton Loaders:** A smooth loading experience ensures you see generated images as they become available.
*   🗑️ **Cache Management:** Easily clear the server's analysis cache directly from the UI.

## 🚀 Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) 14+ (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **AI:** [Google Gemini API](https://ai.google.dev/)
*   **Deployment:** [Docker](https://www.docker.com/)

## 🛠️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v20 or later)
*   npm
*   A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/stenalpjolly/interiordesigner.git
    cd interiordesigner
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Create a file named `.env.local` in the root of the project and add your API key:
    ```
    GEMINI_API_KEY=your_super_secret_api_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser and start designing! 🛋️

## 🐳 Running with Docker

Prefer to use Docker? No problem!

1.  **Build the image:**
    Make sure to pass your Gemini API key as a build argument.
    ```bash
    docker build --build-arg GEMINI_API_KEY="your_super_secret_api_key" -t 10x-interior-designer .
    ```

2.  **Run the container:**
    ```bash
    docker run -p 3000:3000 10x-interior-designer
    ```
The application will be available at [http://localhost:3000](http://localhost:3000).

## 📂 Project Structure

A quick overview of the key directories:

```
/src
├── /app
│   ├── /api          # Server-side API routes (analyze, generate, clearcache)
│   └── page.tsx      # Main entry point for the application UI
├── /components       # Reusable React components (UploadScreen, ResultScreen, etc.)
└── /lib              # Shared utilities and React Context (AppContext)
```

## 🚀 Future Ideas

*   **Interactive Masking:** Allow users to select specific items to keep or replace.
*   **Style & Brand Library:** Offer preset style buttons (e.g., "Scandinavian", "Industrial").
*   **"Shop the Look":** Use AI to identify furniture and find matching products online.