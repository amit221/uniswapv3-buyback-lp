import {
	tokens,
	ether,
	ETHER_ADDRESS,
	EVM_REVERT,
	wait,
	advanceTimeAndBlock,
	getDefaultBundle,
	getDefaultItem
} from "./helpers";
import Web3 from "web3";

const sleep = (time) => {
	return new Promise(r => {
		setTimeout(() => r(), time);
	});
};
const web3 = new Web3(new Web3.providers.HttpProvider("https://matic-mumbai.chainstacklabs.com"));


const DexManager = artifacts.require("DexManager");

require("chai")
	.use(require("chai-as-promised"))
	.should();
import {expect} from "chai";

const zeroAddress = "0x0000000000000000000000000000000000000000";


contract.only("DexManager", (accounts) => {
	const owner = accounts[0];
	let dexManagerContract;


	before(async () => {
		dexManagerContract = await DexManager.at("0x16eDB0649fA5fe970d9D3495899DECfB5e7503ff");
	});
	beforeEach(async () => {


	});
	after(async () => {
	});

	describe("Start", () => {

		it("quest mega test", async () => {
			try {

			} catch (e) {
				console.error(e);
				throw e;
			}

		});

	});


});
