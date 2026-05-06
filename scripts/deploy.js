const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const RockPaperScissors = await hre.ethers.getContractFactory("RockPaperScissors");
  const contract = await RockPaperScissors.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const network = await hre.ethers.provider.getNetwork();
  const artifact = await hre.artifacts.readArtifact("RockPaperScissors");
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  fs.mkdirSync(contractsDir, { recursive: true });

  fs.writeFileSync(
    path.join(contractsDir, "abi.json"),
    JSON.stringify(artifact.abi, null, 2) + "\n"
  );

  fs.writeFileSync(
    path.join(contractsDir, "deployment.json"),
    JSON.stringify(
      {
        address,
        network: hre.network.name,
        chainId: Number(network.chainId)
      },
      null,
      2
    ) + "\n"
  );

  console.log(`RockPaperScissors deployed to: ${address}`);
  console.log(`ABI written to: ${path.join("frontend", "src", "contracts", "abi.json")}`);
  console.log(
    `Deployment written to: ${path.join("frontend", "src", "contracts", "deployment.json")}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
