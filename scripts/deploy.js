const hre = require("hardhat");

async function main() {
  const Upload = await hre.ethers.getContractFactory("ProductTracking");
  const upload = await Upload.deploy();

  await upload.deployed();

  console.log("Library deployed to:", upload.address);
}

main().catch((error) => {
  console.error("error", error);
  process.exitCode = 1;
});
