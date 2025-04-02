import { useState } from "react";
import Editor from "@monaco-editor/react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import { setCode } from "./slices/codeSlice";
import { sendChatMessage } from "./slices/chatSlice";
import type { AppDispatch } from './store'; //
export default function CodeEditor() {
  const code = useSelector((state: RootState) => state.code.code);
  const dispatch = useDispatch<AppDispatch>();
  const [output, setOutput] = useState("");

  function runCodeInIframe(code: string): Promise<string> {
    return new Promise((resolve) => {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      const logs: string[] = [];
      let lastLogCount = 0;
      let idleStart: number | null = null;
      const maxWait = 10000;
      const checkInterval = 200;

      const iframeWindow = iframe.contentWindow;
      if (iframeWindow) {
        (iframeWindow as Window & typeof globalThis).console.log = (...args: unknown[]) => {
          logs.push(args.join(" "));
        };
      }

      const script = iframe.contentDocument?.createElement("script");
      if (script) {
        script.textContent = `
          (async () => {
            try {
              ${code}
            } catch (err) {
              console.error("Error:", err);
            }
          })();
        `;
        iframe.contentDocument?.body.appendChild(script);
      }

      const startTime = Date.now();

      function checkLogs() {
        const now = Date.now();
        if (logs.length !== lastLogCount) {
          lastLogCount = logs.length;
          idleStart = now;
        }
        if ((idleStart && now - idleStart >= 1000) || now - startTime >= maxWait) {
          document.body.removeChild(iframe);
          resolve(logs.join("\n"));
        } else {
          setTimeout(checkLogs, checkInterval);
        }
      }

      setTimeout(checkLogs, checkInterval);
    });
  }

  const runCode = async () => {
    try {
      const iframeOutput = await runCodeInIframe(code);
      setOutput(iframeOutput || "Console output will appear here.");
    } catch (err: any) {
      setOutput(`❌ Error: ${err.message}`);
    }
  };

  const getFeedback = () => {
    // Compose a feedback prompt with the current code and console output.
    const feedbackRequest = `Please review the following code and its console output. Verify if the challenge is solved correctly or provide feedback.

Code:
${code}

Console Output:
${output}`;
    // Dispatch the chat thunk so the feedback is handled just like any other chat message.
    dispatch(sendChatMessage(feedbackRequest));
  };

  return (
    <div className="space-y-4">
      {/* Editor */}
      <div className="rounded-2xl shadow-md border border-gray-700 overflow-hidden">
        <Editor
          height="400px"
          language="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => dispatch(setCode(value || ""))}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            padding: { top: 12 },
            fontLigatures: true,
          }}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={runCode}
          className="py-2 px-5 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
        >
          ▶️ Run Code
        </button>
        <button
          onClick={getFeedback}
          className="py-2 px-5 bg-green-600 text-white rounded-xl shadow hover:bg-green-700"
        >
          🔍 Get Feedback
        </button>
      </div>

      {/* Console Output */}
      <div className="bg-gray-900 text-gray-100 p-4 rounded-xl mt-4 whitespace-pre-wrap font-mono border border-gray-600 overflow-y-auto max-h-64 shadow-inner">
        {output || "Console output will appear here."}
      </div>
    </div>
  );
}