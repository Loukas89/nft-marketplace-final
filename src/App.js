import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";

// Page components
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import Mint from "./pages/Mint";
import NotFound from "./pages/NotFound";
import MyNFTs from "./pages/MyNFTs"; // at the top


// Toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/mint" element={<Mint />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/mynfts" element={<MyNFTs />} />

      </Routes>

      {/*Toast container at bottom-right */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Layout>
  );
}

export default App;
