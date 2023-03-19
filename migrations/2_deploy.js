const Univ3ERC20TestTokenContract = artifacts.require("Univ3ERC20TestToken");
const DexManagerContract = artifacts.require("DexManager");

const SWAP_ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const NON_FUNGIBLE_POSITION_MANAGER_ADRRESS = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

const throwError = (msg) => {
	throw new Error(msg);
};

module.exports = async function (deployer, network, accounts) {
	try {
		const WETH = network === "poly" ? "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270¶" : "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";

		console.log("accounts", accounts);

		const owner = accounts[0];

		await deployer.deploy(Univ3ERC20TestTokenContract, owner, {from: owner});
		console.log("Univ3ERC20TestTokenContract.address)", Univ3ERC20TestTokenContract.address);

		await deployer.deploy(DexManagerContract, SWAP_ROUTER_ADDRESS, NON_FUNGIBLE_POSITION_MANAGER_ADRRESS, Univ3ERC20TestTokenContract.address, WETH, 3000, {from: owner});
		console.log("DexManagerContract.address)", DexManagerContract.address);


	} catch (e) {
		console.error(e);
		throw e;
	}

};
