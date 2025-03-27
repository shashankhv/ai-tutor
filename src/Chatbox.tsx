import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import 'highlight.js/styles/github-dark.css';
interface Message {
  sender: "user" | "ai";
  text: string;
}
interface ChatBoxProps {
  updateCodeEditor: (code: string) => void;
}
export default function ChatBox({ updateCodeEditor }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function extractCodeBlock(content: string): string {
    // This regex looks for a code block starting with ```javascript and ending with ```
    const regex = /```javascript\s*([\s\S]*?)```/;
    const match = content.match(regex);
    return match ? match[1].trim() : "";
  }


  
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const secretKey = import.meta.env.VITE_AGENT_SECRET;
      const response = await axios.post(
        "https://agent-lc3uy75jsr3juh4f77aaq4js-mpbmh.ondigitalocean.app/api/v1/chat/completions",
        {
          messages: [
            {
              role: "user",
              content: input
            }
          ],
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000,
          max_completion_tokens: 1000,
          stream: false,
          k: 5,
          retrieval_method: "rewrite",
          frequency_penalty: 0,
          presence_penalty: 0,
          stop: null,
          stream_options: {
            include_usage: true
          },
          kb_filters: [
            {
              index: "0000000-0000-0000-0000-000000000000",
              path: "docs/javascript_tutorial.csv"
            },
            {
              index: "1111111-1111-1111-1111-111111111111"
            }
          ],
          filter_kb_content_by_query_metadata: false,
          instruction_override: "Answer only with the final answer. Do not include any internal reasoning or chain-of-thought.",
          include_functions_info: false,
          include_retrieval_info: false,
          include_guardrails_info: false
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${secretKey}`,
          },
        }
      );
  let content = response.data.choices[0].message.content; 
      const marker = "</think>";
  if (content.includes(marker)) {
    const parts = content.split(marker);
    content = parts[parts.length - 1].trim();
  }

  const codeblock =  extractCodeBlock(content)

  updateCodeEditor(codeblock)

      // Extract message content from the response structure
      const aiMessage: Message = {
        sender: "ai",
        text: content
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: `❌ Error: ${err.message || "Something went wrong"}` },
      ]);
    }
    setLoading(false);
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-900 p-4">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[70%] shadow-lg ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-800 text-gray-100 rounded-bl-none"
              }`}
            >
              {msg.sender === "ai" ? (
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
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
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask a question..."
          className="flex-1 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-800 text-gray-100"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}