const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
// ===============================
// 🔑 SESSION HANDLING
// ===============================
const getSessionId = () => {
  return localStorage.getItem("session_id");
};

// ===============================
// 🔒 SAFE FETCH (CRITICAL FIX)
// ===============================
const safeFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    credentials: "include",  // ✅ FIX
  });

  let data;

  try {
    data = await res.json();
  } catch (err) {
    throw new Error("Invalid server response");
  }

  if (!res.ok || data.error) {
    throw new Error(data.error || "Request failed");
  }

  return data;
};
// ===============================
// 🔐 LOGIN
// ===============================
export const loginUser = async (email, password) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", String(password).trim());

  const data = await safeFetch(`${API_URL}/api/login`, {
    method: "POST",
    body: formData,
  });

  if (!data.session_id) {
    throw new Error("No session_id returned");
  }

  // ✅ ONLY AUTH SESSION (DO NOT TOUCH ELSEWHERE)
  return data;
};

// ===============================
// 📄 UPLOAD PDF
// ===============================
export const uploadPDF = async (file) => {
  const sessionId = getSessionId();
  if (!sessionId) throw new Error("Not logged in");

  const formData = new FormData();
  formData.append("file", file);

  return safeFetch(`${API_URL}/api/upload-cloud`, {
    method: "POST",
    headers: {
      "session-id": sessionId,
    },
    body: formData,
  });
};

// ===============================
// 💬 STREAM CHAT (FIXED)
// ===============================
export const askQuestionStream = async (
  question,
  onChunk,
  onImage,
  chatId // ✅ NEW
) => {
  const sessionId = localStorage.getItem("session_id");

  const formData = new FormData();
  formData.append("query", question);
  formData.append("chat_id", chatId); // ✅ NEW

  const res = await fetch("http://localhost:8000/api/chat-stream", {
    method: "POST",
    headers: {
      "session-id": sessionId,
    },
    body: formData,
  });

  if (!res.ok || !res.body) {
    throw new Error("Streaming failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let fullResponse = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    fullResponse += chunk;

    if (fullResponse.includes("[IMAGE]")) {
      const imageUrl = fullResponse.replace("[IMAGE]", "").trim();
      onImage(imageUrl);
      return;
    }

    onChunk(fullResponse);
  }
};
// ===============================
// 💬 NORMAL CHAT
// ===============================
export const askQuestion = async (question) => {
  const sessionId = getSessionId();
  if (!sessionId) throw new Error("Not logged in");

  const formData = new FormData();
  formData.append("query", question);

  return safeFetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: {
      "session-id": sessionId,
    },
    body: formData,
  });
};

// ===============================
// 📂 DOCUMENTS
// ===============================
export const getDocuments = async () => {
  const sessionId = getSessionId();
  if (!sessionId) throw new Error("Not logged in");

  const data = await safeFetch(`${API_URL}/api/pdfs`, {
    headers: {
      "session-id": sessionId,
    },
  });

  // ✅ HARD GUARD (prevents .map crash)
  return Array.isArray(data) ? data : [];
};

// ===============================
// 📜 CHAT HISTORY
// ===============================
export const getChatHistory = async () => {
  const sessionId = getSessionId();
  if (!sessionId) throw new Error("Not logged in");

  const data = await safeFetch(`${API_URL}/api/chat-history`, {
    headers: {
      "session-id": sessionId,
    },
  });

  // ✅ HARD GUARD
  return Array.isArray(data) ? data : [];
};

// ===============================
// 📝 REGISTER
// ===============================
export const registerUser = async (email, password) => {
  const formData = new FormData();
  formData.append("email", String(email).trim());
  formData.append("password", String(password).trim());

  return safeFetch(`${API_URL}/api/register`, {
    method: "POST",
    body: formData,
  });
};