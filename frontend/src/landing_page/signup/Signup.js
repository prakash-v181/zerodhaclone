import React, { useState } from "react";
import API from "../../api";
import "./Signup.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await API.post("/signup", {
        name,
        email,
        password
      });

      alert("Signup successful. Please login.");
      window.location.href = "/login";
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>Create your account</h2>

      <form className="signup-form" onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}

export default Signup;




// import React, { useState } from "react";
// import API from "../../api";   // keep this import
// import "./Signup.css";

// function Signup() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSignup = async (e) => {
//     e.preventDefault();

//     if (!name || !email || !password) {
//       alert("All fields are required");
//       return;
//     }

//     try {
//       setLoading(true);

//       //  CORRECT BACKEND API
//       const res = await API.post("/api/signup", {
//         name,
//         email,
//         password,
//       });

//       alert("Signup successful. Please login.");
//       window.location.href = "/login";
//     } catch (err) {
//       console.error("Signup error:", err.response?.data || err.message);
//       alert(err.response?.data?.message || "Signup failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="signup-container">
//       <h2>Create your account</h2>

//       <form className="signup-form" onSubmit={handleSignup}>
//         <input
//           type="text"
//           placeholder="Full Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           required
//         />

//         <input
//           type="email"
//           placeholder="Email address"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />

//         <button type="submit" disabled={loading}>
//           {loading ? "Signing up..." : "Sign up"}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default Signup;
