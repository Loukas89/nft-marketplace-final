// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCollectible is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    mapping(uint256 => uint256) public tokenIdToPrice;
    mapping(uint256 => bool) public listedForSale;

    constructor() ERC721("NFTCollectible", "NFTC") Ownable(msg.sender) {
        tokenCounter = 0;
    }

    //  Minting function
function mintNFT(address to, string memory tokenURI) public returns (uint256) {
        uint256 tokenId = tokenCounter;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        tokenCounter += 1;
        return tokenId;
}

    //  View all minted token IDs
    function getAllTokenIds() public view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](tokenCounter);
        for (uint256 i = 0; i < tokenCounter; i++) {
            ids[i] = i;
        }
        return ids;
    }

    //  List NFT for sale
    function listNFT(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can list this NFT");
        require(price > 0, "Price must be greater than 0");
        listedForSale[tokenId] = true;
        tokenIdToPrice[tokenId] = price;
    }

    //  Buy a listed NFT
    function buyNFT(uint256 tokenId) public payable {
        require(listedForSale[tokenId], "This NFT is not listed for sale");
        uint256 price = tokenIdToPrice[tokenId];
        require(msg.value >= price, "Not enough ETH sent");

        address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId);

        listedForSale[tokenId] = false;
        tokenIdToPrice[tokenId] = 0;

        payable(seller).transfer(price);
    }

    //  Get all currently listed NFTs
    function getListedNFTs() public view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < tokenCounter; i++) {
            if (listedForSale[i]) {
                count++;
            }
        }

        uint256[] memory listed = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < tokenCounter; i++) {
            if (listedForSale[i]) {
                listed[index] = i;
                index++;
            }
        }
        return listed;
    }
}
