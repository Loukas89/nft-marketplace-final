import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Metamask is not installed.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      setWalletAddress(address);
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Failed to connect wallet.");
    }
  };

  const truncateAddress = (address) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">
        <Link to="/">NFT Market</Link>
      </div>

      {/* Navigation Links */}
      <div className="nav-links-container">
        <ul className="nav-links">
          <li className={currentPath === "/marketplace" ? "active" : ""}>
            <Link to="/marketplace">Marketplace</Link>
          </li>
          <li className={currentPath === "/mint" ? "active" : ""}>
            <Link to="/mint">Mint</Link>
          </li>
          <li className={currentPath === "/mynfts" ? "active" : ""}>
            <Link to="/mynfts">My NFTs</Link>
          </li>
        </ul>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <input type="text" className="search-bar" placeholder="Search NFTs..." />
      </div>

      {/* Wallet Connect / Disconnect */}
      <div className="wallet-button-container">
        {walletAddress ? (
          <div className="connected-wallet">
            {truncateAddress(walletAddress)}
            <button onClick={() => setWalletAddress("")} className="disconnect-btn">
              Disconnect
            </button>
          </div>
        ) : (
          <button className="connect-wallet" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
