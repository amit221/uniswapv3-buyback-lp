require("babel-register");
require("babel-polyfill");
require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const privateKeysDev = process.env.PRIVATE_KEYS_DEV || "";
const privateKeys = process.env.PRIVATE_KEYS || "";
/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

// const HDWalletProvider = require('@truffle/hdwallet-provider');
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
	/**
	 * Networks define how you connect to your ethereum client and let you set the
	 * defaults web3 uses to send transactions. If you don't specify one truffle
	 * will spin up a development blockchain for you on port 9545 when you
	 * run `develop` or `test`. You can ask a truffle command to use a specific
	 * network from the command line, e.g
	 *
	 * $ truffle test --network <network-name>
	 */

	mocha: {enableTimeouts: false},
	networks: {
		development: {
			host: "127.0.0.1",
			port: 8545,
			network_id: "*", // Match any network id
			gas: 22626085,
			websockets: true,

		},
		ganache: {
			host: "127.0.0.1",
			port: 7545,
			network_id: "*", // Match any network id
			gas: 22626085,

		},
		poly: {
			network_id: 137,
			networkCheckTimeout: 90000,
			skipDryRun: true,
			gasPrice: 180 * Math.pow(10, 9),
			gas: 20000000,
			provider: function () {
				return new HDWalletProvider({
						privateKeys: privateKeys.split(","),
						providerOrUrl: `https://polygon-rpc.com`,
						pollingInterval: 20000
					}
				);
			},
		},
		//truffle deploy --reset --compile-none --network polytest
		polytest: {
			network_id: 80001,
			websocket: true,
			networkCheckTimeout: 1000000,
			skipDryRun: true,
			//gasPrice: 40 * Math.pow(10, 9),
			provider: function () {
				return new HDWalletProvider({
						privateKeys: privateKeysDev.split(","),
						providerOrUrl: "https://matic-mumbai.chainstacklabs.com"
					}
				);
			},
		},

	},

	plugins: ["truffle-contract-size"],

	// Configure your compilers
	compilers: {
		solc: {
			version: "0.7.6",    // Fetch exact version from solc-bin (default: truffle's version)
			// docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
			settings: {          // See the solidity docs for advice about optimization and evmVersion
				optimizer: {
					enabled: true,
					runs: 2 ** 32 - 1
				},
			}
		}
	},

	// Truffle DB is currently disabled by default; to enable it, change enabled:
	// false to enabled: true. The default storage location can also be
	// overridden by specifying the adapter settings, as shown in the commented code below.
	//
	// NOTE: It is not possible to migrate your contracts to truffle DB and you should
	// make a backup of your artifacts to a safe location before enabling this feature.
	//
	// After you backed up your artifacts you can utilize db by running migrate as follows:
	// $ truffle migrate --reset --compile-all
	//
	// db: {
	// enabled: false,
	// host: "127.0.0.1",
	// adapter: {
	//   name: "sqlite",
	//   settings: {
	//     directory: ".db"
	//   }
	// }
	// }
};
