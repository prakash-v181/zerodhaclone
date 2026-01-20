import React, { useState, useContext } from "react";
import GeneralContext from "./GeneralContext";
import API from "../api";
import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid }) => {
  const { closeBuyWindow } = useContext(GeneralContext);

  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(1);

  const handleBuyClick = async () => {
    const qty = Number(stockQuantity);
    const price = Number(stockPrice);

    if (!uid || qty <= 0 || price <= 0) {
      alert("Please enter valid quantity and price");
      return;
    }

    try {
      await API.post("/api/newOrder", {
        name: uid,
        qty: qty,
        price: price,
        mode: "BUY"
      });

      alert("Order placed successfully");
      closeBuyWindow();
    } catch (error) {
      console.error("Buy error", error);
      alert("Buy failed");
    }
  };

  return (
    <div className="container" id="buy-window">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty</legend>
            <input
              type="number"
              min="1"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />
          </fieldset>

          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              min="0.01"
              step="0.05"
              value={stockPrice}
              onChange={(e) => setStockPrice(e.target.value)}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>Margin required 140.65</span>
        <div>
          <button className="btn btn-blue" onClick={handleBuyClick}>
            Buy
          </button>
          <button className="btn btn-grey" onClick={closeBuyWindow}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;











// import React, { useState } from "react";
// import { Link } from "react-router-dom";

// import axios from "axios";

// import GeneralContext from "./GeneralContext";

// import "./BuyActionWindow.css";

// const BuyActionWindow = ({ uid }) => {
//   const [stockQuantity, setStockQuantity] = useState(1);
//   const [stockPrice, setStockPrice] = useState(0.0);

//   const handleBuyClick = () => {
//     axios.post("http://localhost:3002/newOrder", {
//       name: uid,
//       qty: stockQuantity,
//       price: stockPrice,
//       mode: "BUY",
//     });

//     GeneralContext.closeBuyWindow();
//   };

//   const handleCancelClick = () => {
//     GeneralContext.closeBuyWindow();
//   };

//   return (
//     <div className="container" id="buy-window" draggable="true">
//       <div className="regular-order">
//         <div className="inputs">
//           <fieldset>
//             <legend>Qty.</legend>
//             <input
//               type="number"
//               name="qty"
//               id="qty"
//               onChange={(e) => setStockQuantity(e.target.value)}
//               value={stockQuantity}
//             />
//           </fieldset>
//           <fieldset>
//             <legend>Price</legend>
//             <input
//               type="number"
//               name="price"
//               id="price"
//               step="0.05"
//               onChange={(e) => setStockPrice(e.target.value)}
//               value={stockPrice}
//             />
//           </fieldset>
//         </div>
//       </div>

//       <div className="buttons">
//         <span>Margin required ₹140.65</span>
//         <div>
//           <Link className="btn btn-blue" onClick={handleBuyClick}>
//             Buy
//           </Link>
//           <Link to="" className="btn btn-grey" onClick={handleCancelClick}>
//             Cancel
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BuyActionWindow;
