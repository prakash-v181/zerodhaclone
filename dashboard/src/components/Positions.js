import React, { useEffect, useState } from "react";
import API from "../api";

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [sellData, setSellData] = useState({});

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = () => {
    API.get("/allPositions")
      .then((res) => setPositions(res.data))
      .catch((err) => console.error("Fetch positions failed", err));
  };

  const handleInputChange = (name, field, value) => {
    setSellData((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [field]: value,
      },
    }));
  };

  const handleSellClick = async (stock) => {
    const qty = Number(sellData[stock.name]?.qty || 1);
    const price = Number(sellData[stock.name]?.price || stock.price);

    try {
      await API.post("/newOrder", {
        name: stock.name,
        qty,
        price,
        mode: "SELL",
      });

      alert("SELL order placed successfully");
      fetchPositions();
    } catch (error) {
      alert("SELL failed");
      console.error(error);
    }
  };

  return (
    <>
      <h3 className="title">Positions ({positions.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Instrument</th>
              <th>Qty</th>
              <th>Avg</th>
              <th>LTP</th>
              <th>P&amp;L</th>
              <th>P&amp;L %</th>
              <th>Sell Qty</th>
              <th>Sell Price</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {positions.map((stock) => (
              <tr key={stock._id || stock.name}>
                <td>{stock.product}</td>
                <td>{stock.name}</td>
                <td>{stock.qty}</td>
                <td>{Number(stock.avg).toFixed(2)}</td>
                <td>{Number(stock.price).toFixed(2)}</td>

                {/*  Unrealised P&L */}
                <td className={stock.pnl >= 0 ? "profit" : "loss"}>
                  {stock.pnl.toFixed(2)}
                </td>

                {/*  P&L Percentage */}
                <td className={stock.pnl >= 0 ? "profit" : "loss"}>
                  {stock.pnlPercent.toFixed(2)}%
                </td>

                <td>
                  <input
                    type="number"
                    min="1"
                    max={stock.qty}
                    value={sellData[stock.name]?.qty || 1}
                    onChange={(e) =>
                      handleInputChange(stock.name, "qty", e.target.value)
                    }
                    style={{ width: "60px" }}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={sellData[stock.name]?.price || stock.price}
                    onChange={(e) =>
                      handleInputChange(stock.name, "price", e.target.value)
                    }
                    style={{ width: "80px" }}
                  />
                </td>

                <td>
                  <button
                    className="btn btn-red"
                    onClick={() => handleSellClick(stock)}
                  >
                    Sell
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Positions;









// import React from "react";

// import { positions } from "../data/data";

// const Positions = () => {
//   return (
//     <>
//       <h3 className="title">Positions ({positions.length})</h3>

//       <div className="order-table">
//         <table>
//           <tr>
//             <th>Product</th>
//             <th>Instrument</th>
//             <th>Qty.</th>
//             <th>Avg.</th>
//             <th>LTP</th>
//             <th>P&L</th>
//             <th>Chg.</th>
//           </tr>

//           {positions.map((stock, index) => {
//             const curValue = stock.price * stock.qty;
//             const isProfit = curValue - stock.avg * stock.qty >= 0.0;
//             const profClass = isProfit ? "profit" : "loss";
//             const dayClass = stock.isLoss ? "loss" : "profit";

//             return (
//               <tr key={index}>
//                 <td>{stock.product}</td>
//                 <td>{stock.name}</td>
//                 <td>{stock.qty}</td>
//                 <td>{stock.avg.toFixed(2)}</td>
//                 <td>{stock.price.toFixed(2)}</td>
//                 <td className={profClass}>
//                   {(curValue - stock.avg * stock.qty).toFixed(2)}
//                 </td>
//                 <td className={dayClass}>{stock.day}</td>
//               </tr>
//             );
//           })}
//         </table>
//       </div>
//     </>
//   );
// };

// export default Positions;
