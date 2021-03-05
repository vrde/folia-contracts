/**
 * CLI for Folia contracts
 *
 * Env variables:
 *
 * - PRIVATE_KEY: the private key to use to sign transactions
 */

require("dotenv").config();

import { program } from "commander";
import { BigNumber } from "ethers";
import { load, IEnv } from "./load";
import { send } from "./send";
import { c } from "./colors";
import { banner } from "./banner";
import { CLIError } from "./exceptions";

async function addArtwork(
  env: IEnv,
  address: string,
  editions: number,
  price: number,
  pause: boolean
) {
  const { foliaControllerContract } = env;
  console.log(`addArtwork(${address}, ${editions}, ${price}, ${pause})`);
  await send(
    env,
    (overrides) =>
      foliaControllerContract.addArtwork(
        address,
        editions,
        price,
        pause,
        overrides
      ),
    () =>
      foliaControllerContract.estimateGas.addArtwork(
        address,
        editions,
        price,
        pause
      )
  );
}

async function showConfig(env: IEnv) {
  console.log("Configuration for network", c.blue(env.network));
  console.log("Endpoint:", c.blue(env.endpoint));
  console.log("Private key:", c.blue("*".repeat(env.privateKey.length)));
  console.log(
    "Folia address:",
    c.blue(env.foliaAddress),
    env.url(env.foliaAddress)
  );
  console.log(
    "FoliaController address:",
    c.blue(env.foliaControllerAddress),
    env.url(env.foliaControllerAddress)
  );
  console.log(
    "Metadata address:",
    c.blue(env.metadataAddress),
    env.url(env.metadataAddress)
  );
}

function loadFromOptions(opt: object) {
  // Gas price is specified in gwei, that is 1,000,000,000 wei
  const gasPrice = BigNumber.from(program.opts().gasPrice).mul(1e9);
  return load(
    program.opts().network,
    program.opts().artifacts,
    program.opts().SEND,
    gasPrice,
    program.opts().gasLimit,
    program.opts().confirmations
  );
}

function parseBool(v: string) {
  return ["1", "true", "t"].includes(v.toLowerCase());
}

async function main() {
  program.version("0.0.1");

  program.option("--SEND", "Send transactions to the blockchain", false);

  program.option(
    "-n, --network <name>",
    "Specify the network to use",
    "localhost"
  );

  program.option(
    "-p, --gas-price <gwei>",
    "Set the gas price in gwei",
    (v) => parseInt(v, 10),
    0
  );

  program.option("-l, --gas-limit <units>", "Set the gas limit", (v) =>
    parseInt(v, 10)
  );

  program.option(
    "-c, --confirmations <units>",
    "How many confirmations to wait before considering the transaction final",
    (v) => parseInt(v, 10),
    1
  );

  /*
  program.option(
    "-m, --gas-margin <percentage>",
    "Set the gas margin",
    "10"
  );
  */

  program.option(
    "-a, --artifacts <dir>",
    "Specify where the contract artifacts are stored",
    "out"
  );

  program
    .command("config")
    .description("Show the configuration")
    .action(async () => {
      const env = await loadFromOptions(program.opts());
      showConfig(env);
    });

  program
    .command("add-artwork <artistAddress> <editionNumber> <price> [paused]")
    .description("Add an artwork")
    .action(
      async (
        artistAddress: string,
        editionNumber: string,
        price: string,
        paused: string = "false"
      ) => {
        const env = await loadFromOptions(program.opts());
        await addArtwork(
          env,
          artistAddress,
          parseInt(editionNumber, 10),
          parseInt(price, 10),
          parseBool(paused)
        );
      }
    );

  console.log(c.green`${banner}\n`);
  await program.parseAsync(process.argv);
}

main().catch((e) => {
  if (e instanceof CLIError) {
    console.log(c.red`Error: ${e.message}`);
    process.exit(1);
  } else {
    console.log(c.red`Unhandled error`);
    console.error(e);
  }
});
