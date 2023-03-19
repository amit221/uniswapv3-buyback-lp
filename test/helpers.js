export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';
export const EVM_REVERT = 'VM Exception while processing transaction: revert';

export const ether = n => {
	return new web3.utils.BN(
		web3.utils.toWei(n.toString(), 'ether')
	);
};

// Same as ether
export const tokens = n => ether(n);

export const wait = s => {
	const milliseconds = s * 1000;
	return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const advanceTime = (time) => {
	return new Promise((resolve, reject) => {
		web3.currentProvider.send({
			jsonrpc: '2.0',
			method: 'evm_increaseTime',
			params: [time],
			id: new Date().getTime()
		}, (err, result) => {
			if (err) {
				return reject(err);
			}
			return resolve(result);
		});
	});
};

export const advanceBlock = () => {
	return new Promise((resolve, reject) => {
		web3.currentProvider.send({
			jsonrpc: '2.0',
			method: 'evm_mine',
			id: new Date().getTime()
		}, (err, result) => {
			if (err) { return reject(err) }
			const newBlockHash = web3.eth.getBlock('latest').hash

			return resolve(newBlockHash)
		})
	})
}

export const takeSnapshot = () => {
	return new Promise((resolve, reject) => {
		web3.currentProvider.send({
			jsonrpc: '2.0',
			method: 'evm_snapshot',
			id: new Date().getTime()
		}, (err, snapshotId) => {
			if (err) {
				return reject(err);
			}
			return resolve(snapshotId);
		});
	});
};

export const revertToSnapShot = (id) => {
	return new Promise((resolve, reject) => {
		web3.currentProvider.send({
			jsonrpc: '2.0',
			method: 'evm_revert',
			params: [id],
			id: new Date().getTime()
		}, (err, result) => {
			if (err) {
				return reject(err);
			}
			return resolve(result);
		});
	});
};

export const advanceTimeAndBlock = async (time) => {
	await advanceTime(time);
	await advanceBlock();
	return Promise.resolve(web3.eth.getBlock('latest'));
};
