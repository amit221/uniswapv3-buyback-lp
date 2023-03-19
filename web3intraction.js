require("dotenv").config();
const Web3 = require("web3");
const fs = require("fs");
const path = require("path");


const web3 = new Web3(new Web3.providers.HttpProvider(process.env.CHAIN_PROVIDER));
const DexManagerAbi = JSON.parse(fs.readFileSync(path.resolve("build/contracts/DexManager.json"), "utf8"));

const DexManagerContract = new web3.eth.Contract(DexManagerAbi.abi, process.env.DEX_MANGER_CONTRACT_ADDRESS);

function depositNFT(account) {
	return new Promise((resolve, reject) => {
		DexManagerContract.methods.depositNFT(10376).send({
			from: account.address,
			gas: 1000000,
			gasPrice: web3.utils.toWei("40", "gwei"),
		}).on("receipt", resolve).on("error", reject);
	});
}


(async () => {
	const account = await web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEYS_DEV);
	await web3.eth.accounts.wallet.add(account);

	let tokenId = Number(await DexManagerContract.methods.currentTokenId().call());
	if (tokenId === 0) {

		await depositNFT(account);
		tokenId = Number(await DexManagerContract.methods.currentTokenId().call());
	}
	console.log(tokenId);


})();
