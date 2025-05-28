const hre = require("hardhat");

async function main() {
  const NFTCollectible = await hre.ethers.getContractFactory("NFTCollectible");
  const nft = await NFTCollectible.deploy();
  await nft.waitForDeployment();

  console.log("✅ NFTCollectible deployed to:", await nft.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
