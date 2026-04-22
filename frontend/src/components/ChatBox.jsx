import { useState, useRef, useEffect } from "react";
import { askQuestionStream } from "../services/api";
import MessageBubble from "./MessageBubble";

export default function ChatBox({ messages, setMessages }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null); // ✅ NEW

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ===============================
  // 🔥 NEW CHAT
  // ===============================
  const startNewChat = () => {
    const newChatId = crypto.randomUUID();
    setChatId(newChatId);
    setMessages([]);
  };

  // ===============================
  // 💬 SEND MESSAGE
  // ===============================
  const sendMessage = async (customInput = null) => {
    const text = customInput || input;
    if (!text.trim() || isLoading) return;

    // ✅ Ensure chatId exists
    let currentChatId = chatId;
    if (!currentChatId) {
      currentChatId = crypto.randomUUID();
      setChatId(currentChatId);
    }

    const userMessage = { role: "user", content: text };

    let aiIndex;

    setMessages((prev) => {
      aiIndex = prev.length;
      return [...prev, userMessage, { role: "assistant", content: "" }];
    });

    setInput("");
    setIsLoading(true);

    let fullResponse = "";

    try {
      await askQuestionStream(
        text,
        (chunk) => {
          fullResponse = chunk;

          setMessages((prev) => {
            const updated = [...prev];
            updated[aiIndex + 1] = {
              role: "assistant",
              content: fullResponse + "▌",
            };
            return updated;
          });
        },
        (imageUrl) => {
          setMessages((prev) => {
            const updated = [...prev];
            updated[aiIndex + 1] = {
              role: "assistant",
              content: `[IMAGE]${imageUrl}`,
            };
            return updated;
          });
        },
        currentChatId // ✅ PASS chatId
      );
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[aiIndex + 1] = {
          role: "assistant",
          content: "Something went wrong. Try again.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border flex flex-col h-full overflow-hidden">

      {/* HEADER */}
      <div className="px-6 py-4 border-b flex items-center bg-white/70 backdrop-blur-xl">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">
            AI Assistant
          </h3>
          <p className="text-xs text-gray-500">
            Ask questions about your documents
          </p>
        </div>

        <button
          onClick={startNewChat}
          className="ml-auto bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-blue-700"
        >
          + New Chat
        </button>
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            💬 Start a conversation
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t bg-white flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask anything..."
          className="w-full border rounded-lg p-2 text-sm"
        />

        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}