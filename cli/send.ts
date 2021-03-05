import { BigNumber, ContractTransaction, Overrides, utils } from "ethers";
import { CLIError } from "./exceptions";
import { IEnv } from "./load";

export async function send(
  env: IEnv,
  sendFunc: (o: Overrides) => Promise<ContractTransaction>,
  estimateFunc: () => Promise<BigNumber>
) {
  const overrides: Overrides = {
    gasPrice: env.gasPrice,
  };

  const estimate = await estimateFunc();
  const estimateInEth = utils.formatEther(estimate.mul(env.gasPrice));
  console.log(`Gas estimation: ${estimate.toString()} (${estimateInEth} Ξ)`);

  if (env.gasLimit > 0) {
    if (env.gasLimit < estimate.toNumber()) {
      throw new CLIError(
        `Gas limit is set to ${
          env.gasLimit
        }, but estimate is ${estimate.toString()}`
      );
    } else {
      overrides.gasLimit = env.gasLimit;
    }
  } else {
    overrides.gasLimit = estimate;
  }

  if (env.send) {
    console.log("Send transaction");
    const tx = await sendFunc(overrides);
    console.log("Transaction hash", tx.hash);
    console.log("Waiting for transaction to be included in a block");
    const receipt = await tx.wait(env.confirmations);
    return receipt;
  }
}
