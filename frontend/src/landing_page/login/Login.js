import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // IMPORTANT: use /login (baseURL already has /api if configured that way)
      const response = await API.post("/login", {
        email: email.toLowerCase().trim(),
        password: password
      });

      const token = response.data.token;

      if (!token) {
        setErrors({ form: "Login failed" });
        return;
      }

      // store token on frontend (3000)
      localStorage.setItem("token", token);

      // redirect and pass token to dashboard (3001)
      window.location.href =
        "http://localhost:3001?token=" + token;

    } catch (error) {
      setErrors({
        form:
          error.response?.data?.message ||
          "Unable to login. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </div>

          {errors.form && (
            <div className="error form-error">{errors.form}</div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-text">
          New user? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
























// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import API from "../../api";
// import "./Login.css";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   const validateForm = () => {
//     const newErrors = {};
//     if (!email) newErrors.email = "Email is required";
//     if (!password) newErrors.password = "Password is required";
//     return newErrors;
//   };







  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   if (loading) return;

  //   const formErrors = validateForm();
  //   if (Object.keys(formErrors).length > 0) {
  //     setErrors(formErrors);
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     setErrors({});

  //     const response = await API.post("/login", {
  //       email: email.toLowerCase().trim(),
  //       password,
  //     });

  //     console.log("Login API response:", response.data);

  //     const token = response.data?.token;

  //     if (!token) {
  //       setErrors({
  //         form: response.data?.message || "Login failed",
  //       });
  //       return;
  //     }

  //     //  Store token (shared by both apps)
  //     localStorage.setItem("token", token);

  //     //  Redirect to dashboard app (PORT 3001)
  //     window.location.href = "http://localhost:3001";
  //   } catch (error) {
  //     setErrors({
  //       form:
  //         error.response?.data?.message ||
  //         "Unable to login. Please try again.",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

// const handleLogin = async (e) => {
//   e.preventDefault();
//   if (loading) return;

//   const formErrors = validateForm();
//   if (Object.keys(formErrors).length > 0) {
//     setErrors(formErrors);
//     return;
//   }

//   try {
//     setLoading(true);
//     setErrors({});

//     const response = await API.post("/login", {
//       email: email.toLowerCase().trim(),
//       password
//     });

//     const token = response.data.token;

//     if (!token) {
//       setErrors({ form: "Login failed" });
//       return;
//     }

//     localStorage.setItem("token", token);

//     window.location.href = "http://localhost:3001";
//   } catch (error) {
//     setErrors({
//       form:
//         error.response?.data?.message ||
//         "Unable to login. Please try again."
//     });
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
//     <div className="login-page">
//       <div className="login-card">
//         <h2>Login</h2>

//         <form onSubmit={handleLogin}>
//           <div className="input-group">
//             <input
//               type="email"
//               placeholder="Email address"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               disabled={loading}
//             />
//             {errors.email && <span className="error">{errors.email}</span>}
//           </div>

//           <div className="input-group">
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               disabled={loading}
//             />
//             {errors.password && (
//               <span className="error">{errors.password}</span>
//             )}
//           </div>

//           {errors.form && (
//             <div className="error form-error">{errors.form}</div>
//           )}

//           <button type="submit" disabled={loading}>
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <p className="signup-text">
//           New user? <Link to="/signup">Create an account</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;






// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import API from "../../api";
// import "./Login.css";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     if (!email || !password) {
//       setError("Email and password are required");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const response = await API.post("/login", {
//         email: email.toLowerCase().trim(),
//         password: password
//       });

//       if (!response.data || response.data.success !== true) {
//         setError(response.data?.message || "Invalid login credentials");
//         return;
//       }

//       if (!response.data.token) {
//         setError("Token not received from server");
//         return;
//       }

//       localStorage.setItem("token", response.data.token);

//       // IMPORTANT: redirect to dashboard app
//       window.location.href = "http://localhost:3001/#/";
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//         "Login failed. Please check your credentials"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-card">
//         <h2>Login to Zerodha</h2>

//         <form onSubmit={handleLogin}>
//           <div className="input-group">
//             <input
//               type="email"
//               placeholder="Email address"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               disabled={loading}
//             />
//           </div>

//           <div className="input-group">
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               disabled={loading}
//             />
//           </div>

//           {error && <div className="error form-error">{error}</div>}

//           <button type="submit" disabled={loading}>
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <p className="signup-text">
//           New to Zerodha? <Link to="/signup">Create an account</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;




// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import API from "../../api";
// import "./Login.css";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   const validateForm = () => {
//     const newErrors = {};
//     if (!email) newErrors.email = "Email is required";
//     if (!password) newErrors.password = "Password is required";
//     return newErrors;
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (loading) return;

//     const formErrors = validateForm();
//     if (Object.keys(formErrors).length > 0) {
//       setErrors(formErrors);
//       return;
//     }

//     try {
//       setLoading(true);
//       setErrors({});

//       const response = await API.post("/api/login", {
//         email: email.toLowerCase().trim(),
//         password
//       });

//       console.log("LOGIN RESPONSE DATA:", response.data);

//       // Save token only if backend sends it
//       if (response.data?.token) {
//         localStorage.setItem("token", response.data.token);
//       }

//       // TEMP: allow login if backend says success
//       if (response.data?.success === true) {
//         window.location.href = "http://localhost:3001";
//         return;
//       }

//       // Backend explicitly rejected login
//       setErrors({
//         form: response.data?.message || "Invalid login credentials"
//       });

//     } catch (error) {
//       setErrors({
//         form:
//           error.response?.data?.message ||
//           error.message ||
//           "Unable to login"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-card">
//         <h2>Login to Zerodha</h2>

//         <form onSubmit={handleLogin}>
//           <div className="input-group">
//             <input
//               type="email"
//               placeholder="Email address"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               disabled={loading}
//             />
//             {errors.email && <span className="error">{errors.email}</span>}
//           </div>

//           <div className="input-group">
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               disabled={loading}
//             />
//             {errors.password && (
//               <span className="error">{errors.password}</span>
//             )}
//           </div>

//           {errors.form && (
//             <div className="error form-error">{errors.form}</div>
//           )}

//           <button type="submit" disabled={loading}>
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <p className="signup-text">
//           New to Zerodha? <Link to="/signup">Create an account</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;
