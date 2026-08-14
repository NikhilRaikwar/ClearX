import "dotenv/config";
import hre from "hardhat";

async function main() {
  const token = process.env.USDT0_ADDRESS;
  if (!token || !/^0x[0-9a-fA-F]{40}$/.test(token)) throw new Error("Set the verified Coston2 USDT0_ADDRESS before deployment");
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying ClearX from ${deployer.address}`);
  const tokenContract = await hre.ethers.getContractAt(["function symbol() view returns(string)","function decimals() view returns(uint8)"], token);
  const [symbol, decimals] = await Promise.all([tokenContract.symbol(), tokenContract.decimals()]);
  const normalizedSymbol = String(symbol).replaceAll("₮", "T").normalize("NFKD").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (normalizedSymbol !== "USDT0") throw new Error(`Refusing unexpected token symbol: ${symbol}`);
  console.log(`Verified ${symbol} with ${decimals} decimals at ${token}`);
  const factory = await hre.ethers.getContractFactory("ClearXSettlement"); const contract = await factory.deploy(token); const receipt = await contract.deploymentTransaction()?.wait();
  console.log(`CLEARX_CONTRACT_ADDRESS=${await contract.getAddress()}`); console.log(`CLEARX_DEPLOYMENT_BLOCK=${receipt?.blockNumber}`); console.log(`DEPLOYMENT_TX=${receipt?.hash}`);
}
main().catch((error)=>{console.error(error instanceof Error?error.message:error);process.exitCode=1});
