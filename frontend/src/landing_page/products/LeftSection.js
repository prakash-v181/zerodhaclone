/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-unreachable */
import React from "react";

function LeftSection({
  imageURL,
  productName,
  productDescription,
  tryDemo,
  learnMore,
  googlePlay,
  appStore,
}) {
  return (
    <div className="container">
      <div className="row p-3">
        <div className="col-6 p-3">
          <img src={imageURL} />
        </div>
        <div className="col-6 p-3 mt-5">
          <h1>{productName}</h1>
          <p>{productDescription}</p>
          <div className="" >
            <a href={tryDemo} style={{ textDecoration: "none" }}>tryDemo</a>
            <a href={learnMore} style={{ marginLeft: "50px", textDecoration: "none" }}>learnMore</a>
          </div>
          <div className="mt-5 p-3">
            <a href={googlePlay}>
              <img src="media/images/googlePlayBadge.svg" />
            </a>
            <a href={appStore}>
              <img src="media/images/appstoreBadge.svg" 
              style={{ marginLeft: "50px" }}/>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftSection;
