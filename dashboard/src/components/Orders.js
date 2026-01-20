import React, { useEffect, useState } from "react";
import API from "../api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/api/allOrders")
      .then((res) => {
        setOrders(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch orders", err);
        setError("Failed to load orders");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h3>Loading orders...</h3>;
  }

  if (error) {
    return <h3>{error}</h3>;
  }

  return (
    <>
      <h3 className="title">Orders ({orders.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Type</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan="5">No orders found</td>
              </tr>
            )}

            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.name}</td>
                <td>{order.qty}</td>
                <td>{order.price}</td>
                <td>{order.mode}</td>
                <td>
                  {new Date(order.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Orders;

















// import React, { useEffect, useState } from "react";
// import API from "../api";

// const Orders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // ✅ CORRECT endpoint (NO /api here)
//     API.get("/allOrders")
//       .then((res) => {
//         setOrders(Array.isArray(res.data) ? res.data : []);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch orders", err);
//         setError("Failed to load orders");
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) {
//     return <h3>Loading orders...</h3>;
//   }

//   if (error) {
//     return <h3 className="loss">{error}</h3>;
//   }

//   return (
//     <>
//       <h3 className="title">Orders ({orders.length})</h3>

//       <div className="order-table">
//         <table>
//           <thead>
//             <tr>
//               <th>Instrument</th>
//               <th>Qty</th>
//               <th>Price</th>
//               <th>Type</th>
//               <th>Time</th>
//             </tr>
//           </thead>

//           <tbody>
//             {orders.length === 0 && (
//               <tr>
//                 <td colSpan="5">No orders found</td>
//               </tr>
//             )}

//             {orders.map((order) => (
//               <tr key={order._id}>
//                 <td>{order.name}</td>
//                 <td>{order.qty}</td>
//                 <td>{order.price}</td>
//                 <td className={order.mode === "BUY" ? "profit" : "loss"}>
//                   {order.mode}
//                 </td>
//                 <td>
//                   {new Date(order.createdAt).toLocaleString()}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </>
//   );
// };

// export default Orders;




// import React from "react";
// import { Link } from "react-router-dom";

// const Orders = () => {
//   return (
//     <div className="orders">
//       <div className="no-orders">
//         <p>You haven't placed any orders today</p>

//         <Link to={"/"} className="btn">
//           Get started
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default Orders;
