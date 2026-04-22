import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function TypingDots() {
  return (
    <span className="inline-flex gap-1 ml-1">
      <span className="animate-bounce [animation-delay:0ms]">.</span>
      <span className="animate-bounce [animation-delay:150ms]">.</span>
      <span className="animate-bounce [animation-delay:300ms]">.</span>
    </span>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  // 🔥 AUTO FORMAT TEXT (no RAG change)
  function formatContent(text) {
    if (!text) return "";

    let formatted = text;

    formatted = formatted.replace(/\n?(\d+\.)/g, "\n$1");

    formatted = formatted.replace(
      /(Characteristics|Key contrast|Advantages|Disadvantages):/gi,
      "\n## $1\n"
    );

    formatted = formatted.replace(/([a-z])\n([A-Z])/g, "$1\n\n$2");

    formatted = formatted.replace(
      /(ETL\s*=.*|ELT\s*=.*)/gi,
      "\n> $1\n"
    );

    return formatted;
  }

  // 🧠 SMART IMAGE DETECTION (IMPORTANT FIX)
  const isImage =
    message.content?.startsWith("[IMAGE]") ||
    message.content?.includes("res.cloudinary.com");

  const imageUrl = message.content
    ?.replace("[IMAGE]", "")
    ?.trim();

  return (
    <div className={`flex gap-4 ${isUser ? "justify-end" : ""}`}>

      {/* 🤖 AI Avatar */}
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm shadow">
          🤖
        </div>
      )}

      {/* 💬 MESSAGE */}
      <div
        className={`
          max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${
            isUser
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-white/80 backdrop-blur border shadow-md text-gray-800"
          }
        `}
      >
{isImage ? (
  imageUrl ? (
    <img
      src={imageUrl}
      alt="AI generated"
      className="rounded-xl max-w-full shadow-md"
    />
  ) : (
    <div className="text-gray-400">Generating image...</div>
  )
) : message.content === "" ? (
  <div className="text-gray-400 flex items-center">
    Thinking<TypingDots />
  </div>
) : (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeRaw]}
    components={{
      code({ inline, children }) {
        return !inline ? (
          <SyntaxHighlighter style={oneDark}>
            {String(children)}
          </SyntaxHighlighter>
        ) : (
          <code className="bg-gray-200 px-1 rounded">
            {children}
          </code>
        );
      },
      table({ children }) {
        return (
          <div className="overflow-x-auto my-3">
            <table className="w-full border border-gray-300 text-xs">
              {children}
            </table>
          </div>
        );
      },
      th({ children }) {
        return (
          <th className="border px-2 py-1 bg-gray-200 font-semibold text-left">
            {children}
          </th>
        );
      },
      td({ children }) {
        return (
          <td className="border px-2 py-1">
            {children}
          </td>
        );
      },
    }}
  >
    {formatContent(message.content)}
  </ReactMarkdown>
)}
      </div>

      {/* 👤 User Avatar */}
      {isUser && (
        <div className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm shadow">
          👤
        </div>
      )}
    </div>
  );
}