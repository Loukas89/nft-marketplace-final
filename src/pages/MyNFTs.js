import React, { useEffect, useState, useCallback } from "react";
import "./MyNFTs.css";
import NFTCard from "../components/NFTCard";
import NFTDetailModal from "../components/NFTDetailModal";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";
import { ethers } from "ethers";
import { toast } from "react-toastify";

const MyNFTs = () => {
  const [myNFTs, setMyNFTs] = useState([]);
  const [walletAddress, setWalletAddress] = useState(null);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [showModal, setShowModal] = useState(false);

  //Step 1: Fetch wallet address & NFTs
  const getWalletAndNFTs = useCallback(async () => {
    try {
      if (!window.ethereum) throw new Error("Please install MetaMask");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signerAddress = accounts[0];
      setWalletAddress(signerAddress);

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const tokenIds = await contract.getAllTokenIds();

      const ownedNFTs = [];

      for (const tokenId of tokenIds) {
        const owner = await contract.ownerOf(tokenId);
        if (owner.toLowerCase() === signerAddress.toLowerCase()) {
          const tokenURI = await contract.tokenURI(tokenId);
          const metadataRes = await fetch(tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/"));
          const metadata = await metadataRes.json();
          const price = await contract.tokenIdToPrice(tokenId);
          const listed = await contract.listedForSale(tokenId);

          ownedNFTs.push({
            id: tokenId.toString(),
            name: metadata.name,
            description: metadata.description || "No description",
            image: metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
            price: ethers.formatEther(price),
            owner,
            listed,
          });
        }
      }

      setMyNFTs(ownedNFTs);
    } catch (err) {
      console.error("Error fetching wallet NFTs:", err);
    }
  }, []);

  useEffect(() => {
    getWalletAndNFTs();
  }, [getWalletAndNFTs]);

  // Step 2: Handle update price
  const handleSell = async (tokenId) => {
    const newPrice = prompt("Enter new price in ETH:");
    if (!newPrice) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.listNFT(tokenId, ethers.parseEther(newPrice));
      await tx.wait();

      toast.success(` NFT listed for ${newPrice} ETH`);
      getWalletAndNFTs(); // refresh
    } catch (err) {
      console.error("Error updating price:", err);
      toast.error("Failed to update price");
    }
  };

  //  Step 3: Open modal
  const handleOpenDetail = (nft) => {
    setSelectedNFT(nft);
    setShowModal(true);
  };

  const handleCloseDetail = () => {
    setSelectedNFT(null);
    setShowModal(false);
  };

  return (
    <div className="my-nfts-container">
      <h1 className="my-nfts-title">MY NFTs</h1>
      <p className="my-nfts-subtitle">View and manage your NFTs</p>

      <div className="nft-grid">
        {myNFTs.length > 0 ? (
          myNFTs.map((nft) => (
            <NFTCard
              key={nft.id}
              nft={nft}
              currentAddress={walletAddress}
              onSell={handleSell}
              onOpenDetail={handleOpenDetail}
            />
          ))
        ) : (
          <p>No NFTs found in your wallet.</p>
        )}
      </div>

      {showModal && selectedNFT && (
        <NFTDetailModal
          nft={selectedNFT}
          onClose={handleCloseDetail}
          onSell={handleSell}
          currentAddress={walletAddress}
        />
      )}
    </div>
  );
};

export default MyNFTs;
