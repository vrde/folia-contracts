/**
 * CLI for Folia contracts
 *
 * Env variables:
 *
 * - PRIVATE_KEY: the private key to use to sign transactions
 */

require("dotenv").config();

import { program } from "commander";
import { load, IEnv } from "./load";

async function addArtwork(
  env: IEnv,
  address: string,
  editions: number,
  price: number,
  pause: boolean
) {
  const { foliaControllerContract } = env;
}

async function showConfig(env: IEnv) {
  console.log("Configuration for network", env.network);
  console.log("\tEndpoint:", env.endpoint);
  console.log("\tPrivate key:", "*".repeat(env.privateKey.length));
  console.log("\tFolia address:", env.foliaAddress);
  console.log("\tFoliaController address:", env.foliaControllerAddress);
  console.log("\tMetadata address:", env.metadataAddress);
}

async function main() {
  program.version("0.0.1");

  program.option(
    "-n, --network <name>",
    "Specify the network to use",
    "localhost"
  );

  program.option(
    "-a, --artifacts <dir>",
    "Specify where the contract artifacts are stored",
    "out"
  );

  program
    .command("config")
    .description("Show the configuration")
    .action(async () => {
      const env = await load(program.opts().network, program.opts().artifacts);
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
        paused: string
      ) => {
        const env = await load(
          program.opts().network,
          program.opts().artifacts
        );
        showConfig(env);
        console.log("add artwork", artistAddress, editionNumber, price, paused);
      }
    );

  program.parse(process.argv);
}

main().catch((e) => console.error(e));
