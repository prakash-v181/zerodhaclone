import React, { useEffect, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import API from "../api";

import Apps from "./Apps";
import Funds from "./Funds";
import Holdings from "./Holdings";
import Orders from "./Orders";
import Positions from "./Positions";
import Summary from "./Summary";
import WatchList from "./WatchList";
import { GeneralContextProvider } from "./GeneralContext";

const Dashboard = () => {
  const refreshData = useCallback(async () => {
    try {
      await Promise.all([
        API.get("/api/allHoldings"),
        API.get("/api/allPositions"),
        API.get("/api/allOrders")
      ]);
    } catch (error) {
      console.error("Dashboard refresh failed");
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <GeneralContextProvider>
      <div className="dashboard-container">
        <WatchList onTradeSuccess={refreshData} />

        <div className="content">
          <Routes>
            <Route index element={<Summary />} />
            <Route path="holdings" element={<Holdings />} />
            <Route path="positions" element={<Positions />} />
            <Route path="orders" element={<Orders />} />
            <Route path="funds" element={<Funds />} />
            <Route path="apps" element={<Apps />} />
          </Routes>
        </div>
      </div>
    </GeneralContextProvider>
  );
};

export default Dashboard;







// import React, { useEffect, useState } from "react";
// import { Routes, Route } from "react-router-dom";
// import API from "../api";

// import Apps from "./Apps";
// import Funds from "./Funds";
// import Holdings from "./Holdings";
// import Orders from "./Orders";
// import Positions from "./Positions";
// import Summary from "./Summary";
// import WatchList from "./WatchList";
// import { GeneralContextProvider } from "./GeneralContext";

// const Dashboard = () => {
//   const [holdings, setHoldings] = useState([]);
//   const [positions, setPositions] = useState([]);
//   const [orders, setOrders] = useState([]);

//   const refreshData = async () => {
//     try {
//       const [h, p, o] = await Promise.all([
//         API.get("/allHoldings"),
//         API.get("/allPositions"),
//         API.get("/allOrders"),
//       ]);

//       setHoldings(h.data || []);
//       setPositions(p.data || []);
//       setOrders(o.data || []);
//     } catch (err) {
//       console.error("Failed to refresh dashboard data", err);
//     }
//   };

//   useEffect(() => {
//     refreshData();
//   }, []);

//   return (
//     <div className="dashboard-container">
//       <GeneralContextProvider>
//         {/* 🔥 BUY/SELL notifies dashboard */}
//         <WatchList onTradeSuccess={refreshData} />
//       </GeneralContextProvider>

//       <div className="content">
//         <Routes>
//           <Route index element={<Summary />} />

//           <Route
//             path="holdings"
//             element={<Holdings data={holdings} />}
//           />

//           <Route
//             path="positions"
//             element={<Positions data={positions} />}
//           />

//           <Route
//             path="orders"
//             element={<Orders data={orders} />}
//           />

//           <Route path="funds" element={<Funds />} />
//           <Route path="apps" element={<Apps />} />
//         </Routes>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;













// import React from "react";
// import { Route, Routes } from "react-router-dom";

// import Apps from "./Apps";
// import Funds from "./Funds";
// import Holdings from "./Holdings";

// import Orders from "./Orders";
// import Positions from "./Positions";
// import Summary from "./Summary";
// import WatchList from "./WatchList";
// import { GeneralContextProvider } from "./GeneralContext";

// const Dashboard = () => {
//   return (
//     <div className="dashboard-container">
//       <GeneralContextProvider>
//         <WatchList />
//       </GeneralContextProvider>
//       <div className="content">
//         <Routes>
//           <Route exact path="/" element={<Summary />} />
//           <Route path="/orders" element={<Orders />} />
//           <Route path="/holdings" element={<Holdings />} />
//           <Route path="/positions" element={<Positions />} />
//           <Route path="/funds" element={<Funds />} />
//           <Route path="/apps" element={<Apps />} />
//         </Routes>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;





// import React from "react";
// import { Routes, Route } from "react-router-dom";

// import TopBar from "./TopBar";
// import Apps from "./Apps";
// import Funds from "./Funds";
// import Holdings from "./Holdings";
// import Orders from "./Orders";
// import Positions from "./Positions";
// import Summary from "./Summary";
// import WatchList from "./WatchList";
// import { GeneralContextProvider } from "./GeneralContext";

// const Dashboard = () => {
//   return (
//     <div className="dashboard-container">
//       {/* LEFT SIDE */}
//       <GeneralContextProvider>
//         <WatchList />
//       </GeneralContextProvider>

//       {/* RIGHT SIDE */}
//       <div className="right-section">
//         {/* ✅ MAIN NAV BAR */}
//         <TopBar />

//         {/* PAGE CONTENT */}
//         <div className="content">
//           <Routes>
//             <Route index element={<Summary />} />
//             <Route path="orders" element={<Orders />} />
//             <Route path="holdings" element={<Holdings />} />
//             <Route path="positions" element={<Positions />} />
//             <Route path="funds" element={<Funds />} />
//             <Route path="apps" element={<Apps />} />
//           </Routes>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;





