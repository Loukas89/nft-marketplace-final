import React from "react";

const LoadingSpinner = () => {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "50vh",
      fontSize: "1.5rem",
      color: "#00FFFF"
    }}>
      Loading...
    </div>
  );
};

export default LoadingSpinner;
