import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./components/Home";

// Read token from URL
const params = new URLSearchParams(window.location.search);
const token = params.get("token");

// Save token to localStorage for dashboard (port 3001)
if (token) {
  localStorage.setItem("token", token);
  window.history.replaceState({}, document.title, "/");
}

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
















// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
// import "./index.css";
// import Home from "./components/Home";
// import Orders from "./components/Orders";
// import Holdings from "./components/Holdings";
// import Positions from "./components/Positions";

// const root = ReactDOM.createRoot(document.getElementById("root"));

// root.render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/orders" element={<Orders />} />
//         <Route path="/holdings" element={<Holdings />} />
//         <Route path="/positions" element={<Positions />} />
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </BrowserRouter>
//   </React.StrictMode>
// );







// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter, Route, Routes } from "react-router-dom";
// import "./index.css";
// import Home from "./components/Home";
// import Orders from "./components/Orders";


// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <Routes>
//         <Route path="/*" element={<Home />} />
//         <Route path="/orders" element={<Orders />} />
//       </Routes>
//     </BrowserRouter>
//   </React.StrictMode>
// );
