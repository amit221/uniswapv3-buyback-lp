require("dotenv").config();
const Web3 = require("web3");
const fs = require("fs");
const path = require("path");


const web3 = new Web3(new Web3.providers.HttpProvider(process.env.CHAIN_PROVIDER));
const DexManagerAbi = JSON.parse(fs.readFileSync(path.resolve("build/contracts/DexManager.json"), "utf8"));
const INonfungiblePositionManagerAbi = JSON.parse(fs.readFileSync(path.resolve("build/contracts/INonfungiblePositionManager.json"), "utf8"));
const ITokenAbi = JSON.parse(fs.readFileSync(path.resolve("build/contracts/IERC20.json"), "utf8"));

const DexManagerContract = new web3.eth.Contract(DexManagerAbi.abi, process.env.DEX_MANGER_CONTRACT_ADDRESS);
const TokenContract = new web3.eth.Contract(ITokenAbi.abi, process.env.TOKEN_CONTRACT_ADDRESS);
const WETHContract = new web3.eth.Contract(ITokenAbi.abi, process.env.WETH_CONTRACT_ADDRESS);
const INonfungiblePositionManagerAbiContract = new web3.eth.Contract(INonfungiblePositionManagerAbi.abi, process.env.NON_FUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS);
const DEPOSIT_NFT = process.env.DEPOSIT_NFT_TOKEN_ID;

async function approve(account) {

	const gas = await INonfungiblePositionManagerAbiContract.methods.approve(process.env.DEX_MANGER_CONTRACT_ADDRESS, DEPOSIT_NFT).estimateGas({
		from: account.address,
	});


	return new Promise((resolve, reject) => {


		INonfungiblePositionManagerAbiContract.methods.approve(process.env.DEX_MANGER_CONTRACT_ADDRESS, DEPOSIT_NFT).send({
			from: account.address,
			gas,
			gasPrice: web3.utils.toWei("40", "gwei"),
		}).on("receipt", resolve).on("error", reject);
	});
}


async function transferNft(account, to, tokenId) {

	const gas = await INonfungiblePositionManagerAbiContract.methods.transferFrom(account.address, to, tokenId).estimateGas({
		from: account.address,
	});

	return new Promise((resolve, reject) => {

		INonfungiblePositionManagerAbiContract.methods.transferFrom(account.address, to, tokenId).send({
			from: account.address,
			gas,
			gasPrice: web3.utils.toWei("40", "gwei"),
		}).on("receipt", resolve).on("error", reject);
	});
}

async function depositNFT(account) {

	const gas = await DexManagerContract.methods.depositNFT(DEPOSIT_NFT).estimateGas({
		from: account.address,
	});

	return new Promise((resolve, reject) => {


		DexManagerContract.methods.depositNFT(DEPOSIT_NFT).send({
			from: account.address,
			gas,
			gasPrice: web3.utils.toWei("40", "gwei"),
		}).on("receipt", resolve).on("error", reject);
	});
}


async function activate(state, account) {


	const gas = await DexManagerContract.methods.activate(state).estimateGas({
		from: account.address,
	});

	return new Promise((resolve, reject) => {


		DexManagerContract.methods.activate(state).send({
			from: account.address,
			gas,
			gasPrice: web3.utils.toWei("40", "gwei"),
		}).on("receipt", resolve).on("error", reject);
	});
}

async function setPoolFee(amount, account) {


	const gas = await DexManagerContract.methods.setPoolFee(amount).estimateGas({
		from: account.address,
	});

	return new Promise((resolve, reject) => {


		DexManagerContract.methods.setPoolFee(amount).send({
			from: account.address,
			gas,
			gasPrice: web3.utils.toWei("40", "gwei"),
		}).on("receipt", resolve).on("error", reject);
	});
}

async function swapAndLp(amount, account) {


	const gas = await DexManagerContract.methods.swapAndLp().estimateGas({
		from: account.address,
		value: amount
	});

	return new Promise((resolve, reject) => {


		DexManagerContract.methods.swapAndLp().send({
			from: account.address,
			gas,
			gasPrice: web3.utils.toWei("40", "gwei"),
			value: amount
		}).on("receipt", resolve).on("error", reject);
	});
}

(async () => {
	try {

		console.log("start");
		console.log("Token allowance", await TokenContract.methods.allowance(process.env.DEX_MANGER_CONTRACT_ADDRESS, process.env.NON_FUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS).call());
		console.log("WETH allowance", await WETHContract.methods.allowance(process.env.DEX_MANGER_CONTRACT_ADDRESS, process.env.NON_FUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS).call());
		console.log("Token balanceOf", await TokenContract.methods.balanceOf(process.env.DEX_MANGER_CONTRACT_ADDRESS).call());
		console.log("WETH balanceOf", await WETHContract.methods.balanceOf(process.env.DEX_MANGER_CONTRACT_ADDRESS).call());

		const account = await web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEYS_DEV);
		await web3.eth.accounts.wallet.add(account);
		console.log("account", account.address);
		//await transferNft(account, "0xDfB6Ba7d9DFbE6137dFA800e1FA2346bE6170F94", 10644);

		let tokenId = Number(await DexManagerContract.methods.currentTokenId().call());
// 		console.log("tokenId", tokenId);
// 		console.log("getApproved", await INonfungiblePositionManagerAbiContract.methods.getApproved(DEPOSIT_NFT).call());
// 		await approve(account);
// 		console.log("approve");
// 		await depositNFT(account);
// 		console.log("depositNFT");
// 		tokenId = Number(await DexManagerContract.methods.currentTokenId().call());
// 		await activate(true, account);
// 		console.log("activate");
//
// 		//await setPoolFee(30, account);
// 		console.log(tokenId);
// // await activate(true, account);
// // 		console.log("activate");
// 		console.log("WETH", await DexManagerContract.methods.WETH().call());
// 		console.log("DEPOSIT_NFT", await DexManagerContract.methods.deposits(DEPOSIT_NFT).call());
// 		console.log("swapRouter", await DexManagerContract.methods.swapRouter().call());
// 		console.log("nonfungiblePositionManager", await DexManagerContract.methods.nonfungiblePositionManager().call());


		await swapAndLp(web3.utils.toWei("1", "finney"), account);
		console.log("swapAndLp");

		console.log("Token allowance", await TokenContract.methods.allowance(process.env.DEX_MANGER_CONTRACT_ADDRESS, process.env.NON_FUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS).call());
		console.log("WETH allowance", await WETHContract.methods.allowance(process.env.DEX_MANGER_CONTRACT_ADDRESS, process.env.NON_FUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS).call());
		console.log("Token balanceOf", await TokenContract.methods.balanceOf(process.env.DEX_MANGER_CONTRACT_ADDRESS).call());
		console.log("WETH balanceOf", Number(await WETHContract.methods.balanceOf(process.env.DEX_MANGER_CONTRACT_ADDRESS).call()));

	} catch (e) {
		console.error(e);
	}


})();
