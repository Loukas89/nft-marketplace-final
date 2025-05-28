import React, { useState, useEffect } from "react";
import "./Marketplace.css";
import NFTCard from "../components/NFTCard";
import NFTDetailModal from "../components/NFTDetailModal";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";
import { toast } from "react-toastify";

const Marketplace = () => {
  const [nfts, setNFTs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    document.title = "Marketplace | NFT Marketplace";
    getWallet();
    fetchListedNFTs();
  }, []);

  const getWallet = async () => {
    if (!window.ethereum) return;
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWalletAddress(accounts[0]);
  };

  const fetchListedNFTs = async () => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const listedTokenIds = await contract.getListedNFTs();

      const parsedNFTs = await Promise.all(
        listedTokenIds.map(async (tokenId) => {
          const tokenURI = await contract.tokenURI(tokenId);
          const metadataRes = await fetch(tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/"));
          const metadata = await metadataRes.json();

          const price = await contract.tokenIdToPrice(tokenId);
          const owner = await contract.ownerOf(tokenId);

          return {
            id: tokenId.toString(),
            name: metadata.name,
            description: metadata.description,
            image: metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
            price: ethers.formatEther(price),
            owner,
            listed: true,
          };
        })
      );

      setNFTs(parsedNFTs);
    } catch (error) {
      console.error("Failed to fetch listed NFTs:", error);
    }
  };

  const handleBuy = async (tokenId, priceInEth) => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.buyNFT(tokenId, {
        value: ethers.parseEther(priceInEth),
      });
      await tx.wait();

      toast.success("🎉 NFT purchased!");
      fetchListedNFTs();
    } catch (error) {
      console.error("❌ Purchase failed:", error);
      toast.error("Error buying NFT: " + error.message);
    }
  };

  const handleSell = async (tokenId) => {
    const priceInEth = prompt("Enter price in ETH for your NFT:");
    if (!priceInEth) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.listNFT(tokenId, ethers.parseEther(priceInEth));
      await tx.wait();

      toast.success(`🟢 Listed for ${priceInEth} ETH`);
      fetchListedNFTs();
    } catch (error) {
      console.error("Error listing NFT:", error);
      toast.error("Failed to list NFT: " + error.message);
    }
  };

  const handleOpenDetail = (nft) => {
    setSelectedNFT(nft);
    setShowModal(true);
  };

  const handleCloseDetail = () => {
    setSelectedNFT(null);
    setShowModal(false);
  };

  const filteredNFTs = nfts.filter((nft) =>
    nft.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="marketplace-container">
        <h1 className="marketplace-title">Explore Unique NFTs</h1>
        <p className="marketplace-subtitle">Own exclusive digital assets in the blockchain world</p>

        <div className="search-bar-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search NFTs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="nft-grid">
          {filteredNFTs.length > 0 ? (
            filteredNFTs.map((nft) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                currentAddress={walletAddress}
                onBuy={handleBuy}
                onSell={handleSell}
                onOpenDetail={handleOpenDetail}
              />
            ))
          ) : (
            <p>No NFTs found.</p>
          )}
        </div>
      </div>

      {/* NFT Detail Modal */}
      {showModal && selectedNFT && (
        <NFTDetailModal
          nft={selectedNFT}
          currentAddress={walletAddress}
          onBuy={handleBuy}
          onSell={handleSell}
          onClose={handleCloseDetail}
        />
      )}
    </>
  );
};

export default Marketplace;
