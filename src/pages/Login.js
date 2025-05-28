import React, { useEffect } from "react";
import "./Login.css";

const Login = () => {
  useEffect(() => {
    document.title = "Login | NFT Marketplace";
  }, []);

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <input type="text" placeholder="Wallet Address" />
        <input type="password" placeholder="Password" />
        <button className="login-btn">Login</button>
        <p className="toggle-link">Don't have an account? Sign Up</p>
      </div>
    </div>
  );
};

export default Login;
