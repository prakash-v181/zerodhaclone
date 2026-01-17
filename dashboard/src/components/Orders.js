import React, { useEffect, useState } from "react";
import API from "../api";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    API.get("/allOrders")
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Failed to fetch orders", err));
  }, []);

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
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.name}</td>
                <td>{order.qty}</td>
                <td>{order.price}</td>
                <td
                  className={order.mode === "BUY" ? "profit" : "loss"}
                >
                  {order.mode}
                </td>
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
