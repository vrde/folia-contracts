import { ethers } from "ethers";
import { join } from "path";
import { promises as fs } from "fs";

export interface IEnv {
  network: string;
  endpoint: string;
  privateKey: string;
  foliaAddress: string;
  foliaControllerAddress: string;
  metadataAddress: string;
  wallet: ethers.Wallet;
  provider: ethers.providers.Provider;
  foliaContract: ethers.Contract;
  foliaControllerContract: ethers.Contract;
  metadataContract: ethers.Contract;
}

export interface IArtifact {
  contractName: string;
  abi: ethers.ContractInterface;
  networks: {
    [id: string]: {
      address: string;
      transactionHash: string;
    };
  };
}

export async function load(network: string, artifacts: string): Promise<IEnv> {
  function get(key: string) {
    const fullkey = `${network.toUpperCase()}_${key}`;
    const value = process.env[fullkey];
    if (value === undefined) {
      throw new Error(`Please define "${fullkey}" in your .env file.`);
    }
    return value;
  }

  async function getArtifact(key: string) {
    const filename = join(artifacts, key + ".json");
    try {
      return <IArtifact>JSON.parse(await fs.readFile(filename, "utf-8"));
    } catch (e) {
      throw e;
    }
  }

  function getAddress(artifact: IArtifact, chainId: number) {
    const obj = artifact.networks[chainId.toString()];
    if (!obj) {
      throw new Error(
        `Cannot find address for ${artifact.contractName}, did you deploy it to ${network}?`
      );
    }
    return obj.address;
  }

  const privateKey = get("PRIVATE_KEY");
  const endpoint = get("ENDPOINT");

  const wallet = new ethers.Wallet(privateKey);
  const provider = new ethers.providers.JsonRpcProvider(endpoint);
  const { chainId } = await provider.getNetwork();

  console.log("chainid is ", chainId);

  const foliaArtifact = await getArtifact("Folia");
  const foliaControllerArtifact = await getArtifact("FoliaController");
  const metadataArtifact = await getArtifact("Metadata");

  const foliaAddress = getAddress(foliaArtifact, chainId);
  const foliaControllerAddress = getAddress(foliaControllerArtifact, chainId);
  const metadataAddress = getAddress(metadataArtifact, chainId);

  const e = {
    foliaAddress: foliaArtifact.networks[chainId],
    foliaControllerAddress: foliaControllerArtifact.networks[chainId],
    metadataAddress: metadataArtifact.networks[chainId],
  };

  wallet.connect(provider);

  const foliaContract = new ethers.Contract(
    foliaAddress,
    foliaArtifact.abi,
    wallet
  );
  const foliaControllerContract = new ethers.Contract(
    foliaControllerAddress,
    foliaControllerArtifact.abi,
    wallet
  );
  const metadataContract = new ethers.Contract(
    metadataAddress,
    metadataArtifact.abi,
    wallet
  );

  return {
    network,
    endpoint,
    privateKey,
    foliaAddress,
    foliaControllerAddress,
    metadataAddress,
    wallet,
    provider,
    foliaContract,
    foliaControllerContract,
    metadataContract,
  };
}
