import React from "react";
import "./NFTDetailModal.css";

const NFTDetailModal = ({ nft, onClose, currentAddress, onBuy, onSell }) => {
  const isOwner = currentAddress?.toLowerCase() === nft.owner?.toLowerCase();

  const handleSellClick = () => {
    onSell(nft.id);
    onClose();
  };

  const handleBuyClick = () => {
    onBuy(nft.id, nft.price);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <img src={nft.image} alt={nft.name} className="modal-image" />
        <h2>{nft.name}</h2>
        <p>
          <strong>Price:</strong> {nft.price} ETH
        </p>
        <p>{nft.description}</p>
        <p>
          <strong>Owner:</strong>{" "}
          {isOwner ? "You own this NFT" : `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`}
        </p>

        {isOwner && !nft.listed && (
          <button className="sell-button" onClick={handleSellClick}>
            Sell NFT
          </button>
        )}
        {isOwner && nft.listed && (
          <button className="sell-button" onClick={handleSellClick}>
            Update Price
          </button>
        )}
        {!isOwner && nft.listed && (
          <button className="buy-button" onClick={handleBuyClick}>
            Buy NFT
          </button>
        )}
      </div>
    </div>
  );
};

export default NFTDetailModal;
