import CodeEditor from "./CodeEditor";
import ChatBox from "./Chatbox";
import { useState } from "react";

const App = () => {
  const sampleCode = `
  // 🧪 Sample JS: FizzBuzz Challenge
  function fizzBuzz(n) {
    for (let i = 1; i <= n; i++) {
      if (i % 15 === 0) {
        console.log("FizzBuzz");
      } else if (i % 3 === 0) {
        console.log("Fizz");
      } else if (i % 5 === 0) {
        console.log("Buzz");
      } else {
        console.log(i);
      }
    }
  }
  
  fizzBuzz(15);
  `;
  
  const [code, setCode] = useState(sampleCode);

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-900">
      {/* Header */}
      <header className="mb-4 text-center">
        <h1 className="text-4xl font-bold text-white">JavaScript AI Tutor</h1>
        <p className="text-lg text-gray-300">
          Your interactive assistant for JavaScript and TypeScript coding.
        </p>
      </header>
      {/* Top Section: CodeEditor (left) and ChatBox (right) */}
      <div className="flex flex-1 rounded-lg shadow-lg overflow-hidden">
        {/* Left: Code Editor */}
        <div className="flex-[2] border-r border-gray-300 p-4">
          <CodeEditor code={code} setCode={setCode} />
        </div>
        {/* Right: ChatBox */}
        <div className="flex-1 flex flex-col p-4 min-h-0">
          <ChatBox updateCodeEditor={setCode} />
        </div>
      </div>
    </div>
  );
};

export default App;