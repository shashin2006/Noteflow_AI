const API = "http://localhost:8000/api";

// ===============================
// 🔐 LOGIN
// ===============================
let SESSION_ID = null;
export const loginUser = async (email, password) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  const res = await fetch(`${API}/login`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (data.session_id) {
    SESSION_ID = data.session_id;
  }

  return data;
};