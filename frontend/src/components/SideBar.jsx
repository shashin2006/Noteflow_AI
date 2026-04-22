import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Sidebar({ documents, sessions, onSelectSession }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState(null);
  
  return (
    <aside className="w-72 bg-gray-950 text-gray-200 flex flex-col border-r border-gray-800">

      <div className="p-5 border-b border-gray-800 text-lg font-semibold">
        NoteFlow
      </div>

      <div className="p-4 border-b border-gray-800">
        <p className="text-xs text-gray-400">User</p>
        <p className="text-xs break-all">{user?.user_id}</p>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="text-xs text-red-400 mt-2"
        >
          Logout
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1">

        {/* DOCUMENTS */}
        <h3 className="text-xs text-gray-500 mb-2">Documents</h3>

        {(Array.isArray(documents) ? documents : []).map((doc, i) => (
          <a
            key={i}
            href={doc.url}
            target="_blank"
            className="flex items-center gap-2 text-sm px-2 py-2 rounded-md hover:bg-gray-800 transition"
          >
            📄 {doc.filename}
          </a>
        ))}

        {/* SESSIONS */}
        <h3 className="text-xs text-gray-500 mt-5 mb-2">Chats</h3>

       {sessions.map((s, i) => (
      <div
           key={i}
           onClick={() => {
              setActive(s.session_id);
              onSelectSession(s);
         }}
        className={`cursor-pointer text-sm text-gray-300 mb-1 px-3 py-2 rounded-lg hover:bg-gray-800 transition
        ${active === s.session_id
        ? "bg-gray-700 text-white"
        : "text-gray-300 hover:bg-gray-800"}
    `}
  >
    💬 {s.title}
  </div>
))}

      </div>
    </aside>
  );
}