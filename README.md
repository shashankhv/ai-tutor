# JavaScript AI Tutor

This project is an interactive, AI-powered tutor designed to help users learn and practice JavaScript. It provides a side-by-side view of a code editor and a chatbox, allowing users to write code, run it, and get instant feedback and guidance from an AI assistant.

## ✨ Features

*   **Interactive Code Editor**: A full-featured Monaco Editor for writing JavaScript code with syntax highlighting.
*   **Live Code Execution**: Run your JavaScript code directly in the browser and see the console output immediately.
*   **AI-Powered Chat**: Ask questions, request challenges, or get feedback on your code from an intelligent AI tutor.
*   **Code Suggestions**: The AI can provide code snippets that you can directly accept and load into the editor.
*   **Resizable Layout**: Adjust the size of the code editor and chat panels to your liking.
*   **Persistent State**: Your chat history and code are saved locally, so you can pick up where you left off.

## 🛠️ Tech Stack

*   **Frontend**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) & [Redux Persist](https://github.com/rt2zz/redux-persist)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (using Radix UI and CVA)

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or a compatible package manager

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/javascript-ai-tutor.git
    cd javascript-ai-tutor
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add your AI service API key. This is required for the chat functionality to work.
    ```env
    VITE_AGENT_SECRET=your_secret_api_key_here
    ```

### Running the Application

Once the installation is complete, you can start the development server:

```sh
npm run dev
```

This will open the application in your default browser at `http://localhost:5173`.

## usage How to Use

1.  **Write Code**: Use the code editor on the left to write and edit your JavaScript code. A sample FizzBuzz challenge is provided by default.
2.  **Run Code**: Click the "▶️ Run Code" button to execute your code. The output will appear in the console panel below the editor.
3.  **Chat with the AI**: Type a question or a request in the input box on the right and click "Send". The AI can help you with concepts, debug your code, or give you new challenges.
4.  **Get Feedback**: Click the "🔍 Get Feedback" button to send your current code and its output to the AI for a review.
5.  **Accept/Reject Code**: When the AI provides a code block, you can click "Accept" to load it directly into the editor or "Reject" to dismiss it.

## 📂 Project Structure

```
src/
├── components/      # Shared UI components (e.g., Button)
├── lib/             # Utility functions
├── slices/          # Redux Toolkit slices for state management
│   ├── chatSlice.ts # State and logic for the chat
│   └── codeSlice.ts # State and logic for the code editor
├── styles/          # Global CSS and styles
├── App.tsx          # Main application component
├── Chatbox.tsx      # The chat interface component
├── CodeEditor.tsx   # The code editor and console component
├── main.tsx         # The entry point of the application
└── store.ts         # Redux store configuration
```

This project was bootstrapped with [Vite](https://vitejs.dev/).