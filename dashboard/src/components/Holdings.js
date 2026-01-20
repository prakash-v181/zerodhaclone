import React, { useEffect, useState } from "react";
import API from "../api";
import { VerticalGraph } from "./VerticalGraph";

const AllHoldings = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/allHoldings")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        // ❌ remove qty = 0 holdings
        setHoldings(data.filter(h => Number(h.qty) > 0));
      })
      .catch(() => {
        setHoldings([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h3>Loading holdings...</h3>;
  }

  // 🔁 simulate live market price
  const getLivePrice = (base) =>
    base + Math.floor(Math.random() * 20 - 10);

  // TOTAL P & L
  const totalPnL = holdings.reduce((sum, h) => {
    const qty = Number(h.qty) || 0;
    const avg = Number(h.avg) || 0;
    const basePrice = Number(h.price) || 0;
    const livePrice = getLivePrice(basePrice);

    return sum + (livePrice - avg) * qty;
  }, 0);

  const totalPnLClass =
    totalPnL > 0 ? "profit" : totalPnL < 0 ? "loss" : "neutral";

  const chartData = {
    labels: holdings.map(h => h.name),
    datasets: [
      {
        label: "Last Traded Price",
        data: holdings.map(h => getLivePrice(Number(h.price) || 0)),
      },
    ],
  };

  return (
    <>
      {/* INLINE CSS */}
      <style>{`
        .profit { color: #2ecc71; font-weight: 600; }
        .loss { color: #e74c3c; font-weight: 600; }
        .neutral { color: #8e44ad; font-weight: 600; }

        .order-table table {
          width: 100%;
          border-collapse: collapse;
        }
        .order-table th, .order-table td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
          text-align: center;
        }
      `}</style>

      <h3 className="title">Holdings ({holdings.length})</h3>

      <div className="row mb-4">
        <div className="col">
          <h5 className={totalPnLClass}>
            {totalPnL.toFixed(2)}
          </h5>
          <p>Total P and L</p>
        </div>
      </div>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty</th>
              <th>Avg Price</th>
              <th>LTP</th>
              <th>Current Value</th>
              <th>P and L</th>
            </tr>
          </thead>

          <tbody>
            {holdings.length === 0 && (
              <tr>
                <td colSpan="6">No holdings found</td>
              </tr>
            )}

            {holdings.map((h, index) => {
              const qty = Number(h.qty) || 0;
              const avg = Number(h.avg) || 0;
              const basePrice = Number(h.price) || 0;
              const livePrice = getLivePrice(basePrice);

              const pnl = (livePrice - avg) * qty;
              const currentValue = livePrice * qty;

              const pnlClass =
                pnl > 0 ? "profit" : pnl < 0 ? "loss" : "neutral";

              return (
                <tr key={h._id || index}>
                  <td>{h.name}</td>
                  <td>{qty}</td>
                  <td>{avg.toFixed(2)}</td>
                  <td>{livePrice.toFixed(2)}</td>
                  <td>{currentValue.toFixed(2)}</td>
                  <td className={pnlClass}>
                    {pnl.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <VerticalGraph data={chartData} />
    </>
  );
};

export default AllHoldings;

















// import React, { useState, useEffect } from "react";
// import axios, { all } from "axios";
// import { VerticalGraph } from "./VerticalGraph";

// // import { holdings } from "../data/data";

// const Holdings = () => {
//   const [allHoldings, setAllHoldings] = useState([]);

//   useEffect(() => {
//     axios.get("http://localhost:3002/allHoldings").then((res) => {
//       // console.log(res.data);
//       setAllHoldings(res.data);
//     });
//   }, []);

//   // const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
//   const labels = allHoldings.map((subArray) => subArray["name"]);

//   const data = {
//     labels,
//     datasets: [
//       {
//         label: "Stock Price",
//         data: allHoldings.map((stock) => stock.price),
//         backgroundColor: "rgba(255, 99, 132, 0.5)",
//       },
//     ],
//   };

//   // export const data = {
//   //   labels,
//   //   datasets: [
//   // {
//   //   label: 'Dataset 1',
//   //   data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
//   //   backgroundColor: 'rgba(255, 99, 132, 0.5)',
//   // },
//   //     {
//   //       label: 'Dataset 2',
//   //       data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
//   //       backgroundColor: 'rgba(53, 162, 235, 0.5)',
//   //     },
//   //   ],
//   // };

//   return (
//     <>
//       <h3 className="title">Holdings ({allHoldings.length})</h3>

//       <div className="order-table">
//         <table>
//           <tr>
//             <th>Instrument</th>
//             <th>Qty.</th>
//             <th>Avg. cost</th>
//             <th>LTP</th>
//             <th>Cur. val</th>
//             <th>P&L</th>
//             <th>Net chg.</th>
//             <th>Day chg.</th>
//           </tr>

//           {allHoldings.map((stock, index) => {
//             const curValue = stock.price * stock.qty;
//             const isProfit = curValue - stock.avg * stock.qty >= 0.0;
//             const profClass = isProfit ? "profit" : "loss";
//             const dayClass = stock.isLoss ? "loss" : "profit";

//             return (
//               <tr key={index}>
//                 <td>{stock.name}</td>
//                 <td>{stock.qty}</td>
//                 <td>{stock.avg.toFixed(2)}</td>
//                 <td>{stock.price.toFixed(2)}</td>
//                 <td>{curValue.toFixed(2)}</td>
//                 <td className={profClass}>
//                   {(curValue - stock.avg * stock.qty).toFixed(2)}
//                 </td>
//                 <td className={profClass}>{stock.net}</td>
//                 <td className={dayClass}>{stock.day}</td>
//               </tr>
//             );
//           })}
//         </table>
//       </div>

//       <div className="row">
//         <div className="col">
//           <h5>
//             29,875.<span>55</span>{" "}
//           </h5>
//           <p>Total investment</p>
//         </div>
//         <div className="col">
//           <h5>
//             31,428.<span>95</span>{" "}
//           </h5>
//           <p>Current value</p>
//         </div>
//         <div className="col">
//           <h5>1,553.40 (+5.20%)</h5>
//           <p>P&L</p>
//         </div>
//       </div>
//       <VerticalGraph data={data} />
//     </>
//   );
// };

// export default Holdings;
