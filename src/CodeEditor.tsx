import { useState } from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  setCode: (value: string | undefined) => void;
}

export default function CodeEditor({ code, setCode }: CodeEditorProps) {
  const [output, setOutput] = useState("");
  function runCodeInIframe(code: string): Promise<string> {
    return new Promise((resolve) => {
      // Create a hidden iframe
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);
  
      const logs: string[] = [];
      let lastLogCount = 0;
      let idleStart: number | null = null;
      const maxWait = 10000; // Maximum wait time: 10 seconds
      const checkInterval = 200; // Check every 200ms
  
      const iframeWindow = iframe.contentWindow;
      if (iframeWindow) {
        // Override console.log in the iframe to capture logs
        iframeWindow.console.log = (...args: any[]) => {
          logs.push(args.join(" "));
        };
      }
  
      // Create a script element to execute the provided code
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
  
      // Function to poll and check for idle logs
      function checkLogs() {
        const now = Date.now();
        // If log count has changed, update lastLogCount and reset idleStart
        if (logs.length !== lastLogCount) {
          lastLogCount = logs.length;
          idleStart = now;
        }
        // If we've been idle for 1 second, or reached the maximum wait time:
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

  return (
    <div className="space-y-4">
      <Editor
        height="400px"
        language="javascript"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value)}
        options={{
          fontSize: 14,
          minimap: { enabled: true },
        }}
      />
      <button
        onClick={runCode}
        className="mb-2 py-2 px-4 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
      >
        ▶️ Run Code
      </button>
      <div className="bg-gray-900 text-gray-100 p-4 rounded-md mt-4 whitespace-pre-wrap font-mono border border-gray-600">
        {output || "Console output will appear here."}
      </div>
    </div>
  );
}