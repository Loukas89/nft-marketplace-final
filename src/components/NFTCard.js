import React from "react";
import "./NFTCard.css";

const NFTCard = ({ nft, currentAddress, onBuy, onSell, onOpenDetail }) => {
  const isOwner = nft.owner?.toLowerCase() === currentAddress?.toLowerCase();

  return (
    <div className="nft-card" onClick={() => onOpenDetail(nft)}>
      <img src={nft.image} alt={nft.name} className="nft-image" />
      <h2>{nft.name}</h2>
      <p>{nft.description}</p>
      {nft.listed && (
        <p><strong>Price:</strong> {nft.price} ETH</p>
      )}
      {!isOwner && nft.listed && (
        <button
          className="buy-button"
          onClick={(e) => {
            e.stopPropagation(); // prevent opening modal
            onBuy(nft.id, nft.price);
          }}
        >
          Buy NFT
        </button>
      )}
      {isOwner && !nft.listed && (
        <button
          className="sell-button"
          onClick={(e) => {
            e.stopPropagation();
            onSell(nft.id);
          }}
        >
          Sell NFT
        </button>
      )}
      {isOwner && <p className="owner-badge">👤 You own this NFT</p>}
    </div>
  );
};

export default NFTCard;
