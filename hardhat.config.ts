import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { HardhatUserConfig } from "hardhat/config";
import "hardhat-abi-exporter";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  // Your type-safe config goes here
  solidity: "0.8.0",
  abiExporter: {
    path: './data/abi',
    clear: true,
    flat: true,
    // only: [':ERC20$'],
    only: [],
    spacing: 2
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
  }
};

export default config;