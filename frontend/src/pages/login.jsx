import { useState } from "react";
import { loginUser } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

const handleLogin = async () => {
  try {
    const data = await loginUser(email, password);

    console.log("LOGIN SUCCESS:", data);

    // ✅ USE DIRECT VALUE (NOT localStorage immediately)
    const sessionId = data.session_id;

    if (!sessionId) {
      throw new Error("Session not returned");
    }

    // ✅ STORE
    localStorage.setItem("session_id", sessionId);

    // ✅ VERIFY AFTER STORE
    const stored = localStorage.getItem("session_id");
    console.log("STORED SESSION:", stored);

    if (!stored) {
      throw new Error("Session not stored");
    }

    navigate("/home");

  } catch (err) {
    console.error(err);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              NoteFlow
            </h1>
            <p className="text-gray-600 text-sm">
              Sign in to continue
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading || !email || !password}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Secure login powered by NoteFlow
            </p>
          </div>
          <div className="mt-4 text-center">
             <p className="text-sm text-gray-600">
              Don't have an account?{" "}
            <span
               className="text-blue-600 cursor-pointer hover:underline"
             onClick={() => navigate("/signup")}
            >
         Sign up
        </span>
      </p>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
  <p className="text-xs text-gray-500">
    Secure login powered by NoteFlow
  </p>
</div>
      </div>
      </div>
    </div>
  );
}