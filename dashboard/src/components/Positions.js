import React, { useEffect, useState } from "react";
import API from "../api";

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/allPositions")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        // ❌ remove qty = 0 positions
        setPositions(data.filter(p => Number(p.qty) > 0));
      })
      .catch(() => {
        setPositions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h3>Loading positions...</h3>;
  }

  // 🔁 simulate live market price
  const getLivePrice = (base) =>
    base + Math.floor(Math.random() * 20 - 10);

  const handleSell = async (position) => {
    try {
      await API.post("/api/newOrder", {
        name: position.name,
        qty: 1,
        price: position.price,
        mode: "SELL",
      });

      alert("Sell order placed");

      // refresh positions
      const res = await API.get("/api/allPositions");
      setPositions(res.data.filter(p => Number(p.qty) > 0));
    } catch (error) {
      alert("Sell failed");
    }
  };

  return (
    <>
      {/* INLINE CSS */}
      <style>{`
        .profit { color: #2ecc71; font-weight: 600; }
        .loss { color: #e74c3c; font-weight: 600; }
        .neutral { color: #8e44ad; font-weight: 600; }

        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
          text-align: center;
        }
        button {
          padding: 6px 12px;
          background: #4f46e5;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>

      <h3 className="title">Positions ({positions.length})</h3>

      <table>
        <thead>
          <tr>
            <th>Instrument</th>
            <th>Qty</th>
            <th>Avg Price</th>
            <th>LTP</th>
            <th>PNL</th>
            <th>Rel. Improvement (%)</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {positions.length === 0 && (
            <tr>
              <td colSpan="7">No open positions</td>
            </tr>
          )}

          {positions.map((p, index) => {
            const qty = Number(p.qty) || 0;
            const avg = Number(p.avg) || 0;

            const basePrice = Number(p.price) || 0;
            const livePrice = getLivePrice(basePrice);

            const pnl = (livePrice - avg) * qty;

            const relativeImprovement =
              avg > 0 ? ((livePrice - avg) / avg) * 100 : 0;

            const pnlClass =
              pnl > 0 ? "profit" : pnl < 0 ? "loss" : "neutral";

            const relClass =
              relativeImprovement > 0
                ? "profit"
                : relativeImprovement < 0
                ? "loss"
                : "neutral";

            return (
              <tr key={p._id || index}>
                <td>{p.name}</td>
                <td>{qty}</td>
                <td>{avg.toFixed(2)}</td>
                <td>{livePrice.toFixed(2)}</td>
                <td className={pnlClass}>
                  {pnl.toFixed(2)}
                </td>
                <td className={relClass}>
                  {relativeImprovement.toFixed(2)}%
                </td>
                <td>
                  <button
                    onClick={() => handleSell(p)}
                    disabled={qty <= 0}
                  >
                    Sell
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default Positions;














// import React, { useEffect, useState } from "react";
// import API from "../api";

// const Positions = () => {
//   const [positions, setPositions] = useState([]);
//   const [sellData, setSellData] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchPositions();
//   }, []);

//   const fetchPositions = () => {
//     setLoading(true);
//     API.get("/api/allPositions")
//       .then((res) => {
//         if (Array.isArray(res.data)) {
//           setPositions(res.data);
//         } else if (res.data && Array.isArray(res.data.positions)) {
//           setPositions(res.data.positions);
//         } else {
//           setPositions([]);
//         }
//       })
//       .catch((err) => {
//         console.error("Fetch positions failed", err);
//         setPositions([]);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   };

//   const handleInputChange = (name, field, value) => {
//     setSellData((prev) => ({
//       ...prev,
//       [name]: {
//         ...prev[name],
//         [field]: value,
//       },
//     }));
//   };

//   const handleSellClick = async (stock) => {
//     const qty = Number(sellData[stock.name]?.qty || 1);
//     const price = Number(sellData[stock.name]?.price || stock.price);

//     try {
//       await API.post("/api/newOrder", {
//         name: stock.name,
//         qty,
//         price,
//         mode: "SELL",
//       });

//       alert("Sell order placed successfully");

//       setSellData((prev) => {
//         const updated = { ...prev };
//         delete updated[stock.name];
//         return updated;
//       });

//       fetchPositions();
//     } catch (error) {
//       alert("Sell failed");
//       console.error(error);
//     }
//   };

//   if (loading) {
//     return <h3>Loading positions...</h3>;
//   }

//   return (
//     <>
//       <h3 className="title">Positions ({positions.length})</h3>

//       <div className="order-table">
//         <table>
//           <thead>
//             <tr>
//               <th>Product</th>
//               <th>Instrument</th>
//               <th>Qty</th>
//               <th>Avg</th>
//               <th>LTP</th>
//               <th>P and L</th>
//               <th>P and L percent</th>
//               <th>Sell Qty</th>
//               <th>Sell Price</th>
//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {positions.length === 0 && (
//               <tr>
//                 <td colSpan="10">No open positions</td>
//               </tr>
//             )}

//             {positions.map((stock, index) => {
//               const avg = Number(stock.avg) || 0;
//               const price = Number(stock.price) || 0;
//               const qty = Number(stock.qty) || 0;

//               const pnl =
//                 typeof stock.pnl === "number"
//                   ? stock.pnl
//                   : (price - avg) * qty;

//               const pnlPercent =
//                 typeof stock.pnlPercent === "number"
//                   ? stock.pnlPercent
//                   : avg > 0
//                   ? (pnl / (avg * qty)) * 100
//                   : 0;

//               const pnlClass = pnl >= 0 ? "profit" : "loss";

//               return (
//                 <tr key={stock._id || stock.name || index}>
//                   <td>{stock.product}</td>
//                   <td>{stock.name}</td>
//                   <td>{qty}</td>
//                   <td>{avg.toFixed(2)}</td>
//                   <td>{price.toFixed(2)}</td>
//                   <td className={pnlClass}>{pnl.toFixed(2)}</td>
//                   <td className={pnlClass}>{pnlPercent.toFixed(2)}</td>

//                   <td>
//                     <input
//                       type="number"
//                       min="1"
//                       max={qty}
//                       value={sellData[stock.name]?.qty || 1}
//                       onChange={(e) =>
//                         handleInputChange(stock.name, "qty", e.target.value)
//                       }
//                       style={{ width: "60px" }}
//                     />
//                   </td>

//                   <td>
//                     <input
//                       type="number"
//                       value={sellData[stock.name]?.price || price}
//                       onChange={(e) =>
//                         handleInputChange(stock.name, "price", e.target.value)
//                       }
//                       style={{ width: "80px" }}
//                     />
//                   </td>

//                   <td>
//                     <button
//                       className="btn btn-red"
//                       onClick={() => handleSellClick(stock)}
//                     >
//                       Sell
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </>
//   );
// };

// export default Positions;









