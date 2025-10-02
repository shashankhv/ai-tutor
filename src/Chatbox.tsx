import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./store";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import 'highlight.js/styles/github-dark.css';
import { sendChatMessage } from "./slices/chatSlice";
import { setCode } from "./slices/codeSlice";
import type { AppDispatch } from './store';

/**
 * The ChatBox component provides a user interface for chatting with the AI tutor.
 * It displays messages from both the user and the AI, handles user input,
 * and allows the user to accept or reject code snippets provided by the AI.
 * @returns {JSX.Element} The rendered ChatBox component.
 */
export default function ChatBox() {
  const messages = useSelector((state: RootState) => state.chat.messages);
  const loading = useSelector((state: RootState) => state.chat.loading);
  const dispatch = useDispatch<AppDispatch>();
  const [input, setInput] = useState("");
  const [codeBlockStatus, setCodeBlockStatus] = useState<Record<string, "pending" | "accepted" | "rejected">>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Handles accepting a code block from the AI.
   * Marks the code block as 'accepted' and dispatches an action to update the code in the editor.
   * @param {string} key - The unique identifier for the code block.
   * @param {string} code - The code snippet to accept.
   */
  const handleAccept = (key: string, code: string) => {
    setCodeBlockStatus((prev) => ({ ...prev, [key]: "accepted" }));
    dispatch(setCode(code));
  };

  /**
   * Handles rejecting a code block from the AI.
   * Marks the code block as 'rejected'.
   * @param {string} key - The unique identifier for the code block.
   */
  const handleReject = (key: string) => {
    setCodeBlockStatus((prev) => ({ ...prev, [key]: "rejected" }));
  };

  /**
   * Sends the user's current input as a chat message.
   * It dispatches the `sendChatMessage` action if the input is not empty,
   * and then clears the input field.
   */
  const handleSend = () => {
    if (input.trim()) {
      dispatch(sendChatMessage(input));
      setInput("");
    }
  };

  /**
   * Handles the 'keydown' event for the input field.
   * If the 'Enter' key is pressed, it calls `handleSend` to send the message.
   * @param {KeyboardEvent<HTMLInputElement>} e - The keyboard event object.
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900 p-4 h-full">
      {/* Chat History */}
      <div className="flex-1 h-full overflow-y-auto space-y-4 min-h-0 scrollbar scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 hover:scrollbar-show scrollbar-hide">
        {messages.map((msg, msgIdx) => (
          <div key={msgIdx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`px-4 py-2 rounded-lg shadow-lg w-fit max-w-[70%] ${msg.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"}`}>
              {msg.sender === "ai" ? (
                <div className="max-w-full overflow-x-auto whitespace-pre-wrap break-words">
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                    {msg.text}
                  </ReactMarkdown>
                  {msg.codeBlocks && msg.codeBlocks.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.codeBlocks.map((code, codeIdx) => {
                        const key = `${msgIdx}-${codeIdx}`;
                        if (codeBlockStatus[key] && codeBlockStatus[key] !== "pending") {
                          return null;
                        }
                        const preview = code.length > 100 ? code.substring(0, 100) + "..." : code;
                        return (
                          <div key={key} className="bg-gray-700 p-2 rounded-md">
                            <div className="font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                              {preview}
                            </div>
                            <div className="flex justify-end mt-1 gap-2">
                              <button onClick={() => handleAccept(key, code)} className="text-green-400 hover:underline">
                                Accept
                              </button>
                              <button onClick={() => handleReject(key)} className="text-red-400 hover:underline">
                                Reject
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {/* Loader */}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-lg bg-gray-800 text-gray-100 shadow-lg">
              ⏳ Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          className="flex-1 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-800 text-gray-100"
        />
        <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Send
        </button>
      </div>
    </div>
  );
   
}