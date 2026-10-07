import { readFileSync } from "fs";
import path from "path";
import {
  TransactionHash,
  TransactionStatus,
  ExecutionResult,
  GenLayerClient,
  DecodedDeployData,
} from "genlayer-js/types";

export default async function main(client: GenLayerClient<any>) {
  const filePath = path.resolve(process.cwd(), "contracts/ClauseLens.py");

  try {
    const contractCode = new Uint8Array(readFileSync(filePath));

    const deployTransaction = await client.deployContract({
      code: contractCode,
      args: [],
    });

    const receipt = await client.waitForTransactionReceipt({
      hash: deployTransaction as TransactionHash,
      status: TransactionStatus.ACCEPTED,
      retries: 200,
    });

    if (receipt.txExecutionResultName !== ExecutionResult.FINISHED_WITH_RETURN) {
      throw new Error(`Deployment did not execute successfully: ${JSON.stringify(receipt)}`);
    }

    const deployedContractAddress = (receipt.txDataDecoded as DecodedDeployData)?.contractAddress
      ?? (receipt.data?.contract_address as string | undefined);
    if (!deployedContractAddress) throw new Error("Deployment was accepted, but the RPC did not return a contract address.");

    console.log(`Contract deployed: ${deployedContractAddress}`);
    console.log(`Network: ${client.chain.name ?? client.chain.id}`);
    console.log(`Transaction: ${deployTransaction}`);
  } catch (error) {
    throw new Error(`Error during deployment:, ${error}`);
  }
}
