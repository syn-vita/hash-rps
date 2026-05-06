import abi from "./abi.json";
import deployment from "./deployment.json";

export const CONTRACT_ABI = abi;
export const CONTRACT_ADDRESS = deployment.address;
export const CONTRACT_CHAIN_ID = deployment.chainId;
export const CONTRACT_NETWORK = deployment.network;
