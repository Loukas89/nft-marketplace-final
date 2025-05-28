import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center", color: "white" }}>
      <h1 style={{ fontSize: "4rem", marginBottom: "20px" }}>404</h1>
      <p style={{ fontSize: "1.5rem", marginBottom: "30px" }}>
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link to="/" style={{
        background: "linear-gradient(90deg, #00FFFF, #0044FF)",
        padding: "12px 24px",
        color: "white",
        borderRadius: "8px",
        textDecoration: "none",
        fontWeight: "bold"
      }}>
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;
