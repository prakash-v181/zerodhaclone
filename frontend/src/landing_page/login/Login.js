import React, { useState } from "react";
import API from "../../api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      //  Login (cookie is set by backend)
      await API.post("/login", { email, password });

      //  Redirect to dashboard (3002)
      window.location.href = "http://localhost:3002/";
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>Login</h2>

      <form onSubmit={handleLogin} className="signup-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
