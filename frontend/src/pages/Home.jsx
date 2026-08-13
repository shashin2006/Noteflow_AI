import { useEffect, useState } from "react";
import {
  getDocuments,
  getChatHistory,
  uploadPDF,
} from "../services/api";

import Sidebar from "../components/SideBar";
import ChatBox from "../components/ChatBox";

export default function Home() {
  const [documents, setDocuments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

useEffect(() => {
  const sessionId = localStorage.getItem("session_id");

  if (!sessionId) {
    console.error("NO SESSION FOUND");
    return; // ⛔ STOP API CALLS
  }

  loadData();
}, []);

  // ===============================
  // 🔥 GROUP CHAT SESSIONS
  // ===============================
  const groupSessions = (history) => {
    if (!Array.isArray(history)) return [];

    const grouped = {};

    history.forEach((chat) => {
      const sid = chat.session_id || "default";

      if (!grouped[sid]) {
        grouped[sid] = {
          session_id: sid,
          title: chat.query,
          messages: [],
        };
      }

      grouped[sid].messages.push(chat);
    });

    return Object.values(grouped);
  };

  // ===============================
  // 🔥 LOAD DATA
  // ===============================
  console.log("SESSION IN HOME:", localStorage.getItem("session_id"));
  const loadData = async () => {
    try {
      const docs = await getDocuments();
      const history = await getChatHistory();

      console.log("DOCS:", docs);
      console.log("HISTORY:", history);

      const safeDocs = Array.isArray(docs) ? docs : [];
      const safeHistory = Array.isArray(history) ? history : [];

      setDocuments(safeDocs);

      const grouped = groupSessions(safeHistory);
      setSessions(grouped);

      if (grouped.length > 0) {
        loadSession(grouped[0]);
      }

    } catch (err) {
      console.error("Load error:", err);
    }
  };

  // ===============================
  // 🔥 LOAD SESSION
  // ===============================
  const loadSession = (session) => {
    const formatted = session.messages.flatMap((chat) => [
      { role: "user", content: chat.query },
      { role: "assistant", content: chat.response },
    ]);

    setMessages(formatted);

    // ❌ DO NOT STORE session_id HERE
  };

  // ===============================
  // 🔥 HANDLE FILE UPLOAD
  // ===============================
  const handleUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);

    try {
      const res = await uploadPDF(file);

      if (res.error) {
        alert("Upload failed: " + res.error);
        return;
      }

      console.log("Upload success:", res);

      // 🔄 Reload documents after upload
      loadData();

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-200">

      {/* SIDEBAR */}
      <Sidebar
        documents={documents}
        sessions={sessions}
        onSelectSession={loadSession}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* TOP BAR */}
        <div className="flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800"></h2>

          <input
            type="file"
            id="upload"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              handleUpload(file);
            }}
          />

          <label
            htmlFor="upload"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg cursor-pointer text-sm transition"
          >
            {isUploading ? "⏳ Uploading..." : "📎 Upload"}
          </label>
        </div>

        {/* CHAT */}
        <div className="flex-1 overflow-hidden">
          <ChatBox messages={messages} setMessages={setMessages} />
        </div>

      </main>
    </div>
  );
}