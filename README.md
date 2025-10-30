# 10x Interior Designer

The 10x Interior Designer is a web application that allows users to upload a photo of their room and receive AI-generated interior design ideas. The application analyzes the room, asks the user a series of questions about their preferences, and then generates new designs based on their answers.

## Features

*   **Image Upload**: Upload an image of your room to get started.
*   **AI Analysis**: The application uses the Gemini AI model to analyze the room and generate a set of questions.
*   **Dynamic Questionnaire**: Answer a series of questions about your design preferences.
*   **AI-Powered Design Generation**: The application uses the Gemini AI model to generate new interior designs based on your answers.
*   **Server-Side Caching**: The application uses a server-side, file-based caching system to store the analysis of uploaded images, avoiding redundant API calls.
*   **Clear Cache**: A "Clear Cache" button on the results page allows for manual cache invalidation.
*   **Skeleton Loaders**: Skeleton placeholders are displayed on the results page to provide a better user experience while new images are being generated.

## Tech Stack

*   [Next.js](https://nextjs.org/)
*   [React](https://reactjs.org/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Google Generative AI (Gemini)](https://ai.google.dev/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   npm
    ```sh
    npm install npm@latest -g
    ```

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/stenalpjolly/interiordesigner.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Create a `.env.local` file in the root of the project and add your Gemini API key:
    ```
    GEMINI_API_KEY=your_api_key
    ```

### Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Docker

You can also run the application using Docker.

### Build the Docker Image

```bash
docker build --build-arg GEMINI_API_KEY="your_api_key" -t interiordesigner .
```

### Run the Docker Container

```bash
docker run -p 3000:3000 interiordesigner
```
