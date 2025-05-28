import React, { useState, useEffect } from "react";
import "./Mint.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../config";
import NFTCollectible from "../abi/NFTCollectible.json";
import { toast } from "react-toastify";

const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiMGQ2NjJmMS1kOTI4LTQ2NzUtYjYwMy1kNTc1MWE2M2FjM2IiLCJlbWFpbCI6ImxvdWtpdG9mMUBob3RtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIzYzk1Mjg0MjYzZDU5ZDliZDY5OCIsInNjb3BlZEtleVNlY3JldCI6IjM0MmI1OWY1MDU3OTdkNTUyNzc1YzM5MjZkNjVjNjYxZmNmOWIxMzk5MjEyYzBlNDVkZDhjYWVmYWFjNThhMWIiLCJleHAiOjE3NzkzOTYzNjZ9.SwA94EAc99bslT-poG9KRDyCIMbSLcw88meqnrf543c";

const Mint = () => {
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [nftImage, setNftImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Mint NFT | NFT Marketplace";
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNftImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewURL(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewURL(null);
    }
  };

  const uploadToPinata = async () => {
    const formData = new FormData();
    formData.append("file", nftImage);

    const imageRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!imageRes.ok) throw new Error("Image upload failed.");
    const imageData = await imageRes.json();
    const imageIpfsUrl = `ipfs://${imageData.IpfsHash}`;

    const metadata = {
      name: nftName,
      description: nftDescription || "No description",
      image: imageIpfsUrl,
    };

    const metadataRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    if (!metadataRes.ok) throw new Error("Metadata upload failed.");
    const metadataData = await metadataRes.json();
    return `ipfs://${metadataData.IpfsHash}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nftName || !nftImage || !price) {
      toast.error("Please provide name, image, and price.");
      return;
    }

    try {
      setLoading(true);
      toast.info("Uploading to IPFS...");

      const tokenURI = await uploadToPinata();
      console.log("✅ Uploaded to IPFS:", tokenURI);

      if (!window.ethereum) throw new Error("Please install MetaMask.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTCollectible.abi, signer);

      // Mint NFT
      const tx = await contract.mintNFT(signer.address, tokenURI);
      const receipt = await tx.wait();

      const transferEvent = receipt.logs.find((log) =>
        log.topics[0] === contract.interface.getEvent("Transfer").topicHash
      );
      const parsed = contract.interface.parseLog(transferEvent);
      const tokenId = parsed.args.tokenId;

      // List NFT
      const listTx = await contract.listNFT(tokenId, ethers.parseEther(price));
      await listTx.wait();

      toast.success("🎉 NFT successfully minted and listed!");
      setNftName("");
      setNftDescription("");
      setNftImage(null);
      setPrice("");
      setPreviewURL(null);
    } catch (err) {
      console.error(" Minting/listing failed:", err);
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mint-container">
      <h1>Mint Your NFT</h1>
      <p>Upload your artwork, set a price, and mint it on the blockchain.</p>

      <form onSubmit={handleSubmit} className="mint-form">
        <input
          type="text"
          placeholder="Enter NFT name"
          value={nftName}
          onChange={(e) => setNftName(e.target.value)}
          required
        />
        <textarea
          placeholder="NFT Description (optional)"
          value={nftDescription}
          onChange={(e) => setNftDescription(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
        <input
          type="number"
          placeholder="Enter price in ETH"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          step="0.01"
        />

        {previewURL && (
          <div className="preview">
            <p>Preview:</p>
            <img src={previewURL} alt="NFT Preview" />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Minting..." : "Mint NFT"}
        </button>
      </form>
    </div>
  );
};

export default Mint;
