import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";
import NFTDetailModal from "../components/NFTDetailModal";

const Home = () => {
  const [featuredNFTs, setFeaturedNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    document.title = "Home | NFT Marketplace";
    fetchFeaturedNFTs();
  }, []);

  const fetchFeaturedNFTs = async () => {
    try {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const listedTokenIds = await contract.getListedNFTs();

      const featured = await Promise.all(
        listedTokenIds.slice(0, 6).map(async (tokenId) => {
          const tokenURI = await contract.tokenURI(tokenId);
          const metadataRes = await fetch(tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/"));
          const metadata = await metadataRes.json();

          const price = await contract.tokenIdToPrice(tokenId);
          const owner = await contract.ownerOf(tokenId);

          return {
            id: tokenId.toString(),
            name: metadata.name,
            image: metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
            description: metadata.description || "No description",
            price: ethers.formatEther(price),
            owner,
            listed: true,
          };
        })
      );

      setFeaturedNFTs(featured);
    } catch (error) {
      console.error("Error fetching featured NFTs:", error);
    }
  };

  const openModal = (nft) => {
    setSelectedNFT(nft);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNFT(null);
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay">
          <h1 className="glow-text">Discover, Collect, and Sell Extraordinary NFTs</h1>
          <p>The world’s largest decentralized NFT marketplace</p>
          <div className="buttons">
            <Link to="/marketplace" className="button neon-button">Explore Marketplace</Link>
            <Link to="/mint" className="button neon-button mint">Mint NFT</Link>
          </div>
        </div>
      </section>

      {/* Featured NFTs Showcase Section */}
      <section className="animated-nft-showcase">
        <h2>Featured NFTs</h2>
        <div className="scrolling-wrapper">
          {[...featuredNFTs, ...featuredNFTs].map((nft, index) => (
            <div
              className="nft-card"
              key={`${nft.id}-${index}`}
              onClick={() => openModal(nft)}
            >
              <img src={nft.image} alt={nft.name} />
              <p>{nft.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NFT Modal */}
      {showModal && selectedNFT && (
        <NFTDetailModal nft={selectedNFT} onClose={closeModal} />
      )}
    </div>
  );
};

export default Home;
