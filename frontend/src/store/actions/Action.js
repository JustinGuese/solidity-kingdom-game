import Web3 from 'web3';
import BigNumber from 'big-number';
import KingdomAttackCoin from '../../assets/contracts/KingdomAttackCoin.json';
import KingdomSeedCoin from '../../assets/contracts/KingdomSeedCoin.json';
import KingdomDefenseCoin from '../../assets/contracts/KingdomDefenseCoin.json';
import KingdomGameMechanic from '../../assets/contracts/KingdomGameMechanic.json';
import bigNumber from 'big-number';
import { RandomPicture } from 'random-picture/dist';

export const connectAccount = () => async dispatch => {
	if (window.ethereum) {
		window.web3 = new Web3(
			Web3.givenProvider || 'http://172.24.208.1:7545'
		);
		try {
			await window.ethereum.enable();
			const web3 = window.web3;
			const accounts = await web3.eth.getAccounts();
			dispatch({ type: 'CONNECT_ACCOUNT', payload: accounts[0] });
			// await window.ethereum.sendAsync('eth_requestAccounts');
			console.log('Web3 injected browser');
		} catch (error) {
			console.log('User denied account access');
		}
	}
	return;
};

export const loadBlockChainData = account => async dispatch => {
	dispatch(loaderState(true));
	const web3 = window.web3;
	let balance = await web3.eth.getBalance(account);
	balance = Number(Web3.utils.fromWei(balance, 'ether')).toFixed(2);
	dispatch({ type: 'GET_BALANCE', payload: balance });
	let loadCount = 0;
	const networkId = await web3.eth.net.getId();
	// network related stuff
	console.log(networkId, 'networkid');
	console.log(account, 'account');
	const kgdatDataAT = await KingdomAttackCoin.networks[networkId];
	console.log(KingdomAttackCoin.networks, 'kgdatDataAT');
	const kgdatDataDF = await KingdomDefenseCoin.networks[networkId];
	const kgdatDataSC = await KingdomSeedCoin.networks[networkId];
	const kgdatDataBC = await KingdomGameMechanic.networks[networkId];
	console.log('networkid', kgdatDataAT);
	if (kgdatDataAT) {
		const kgdat = new web3.eth.Contract(
			KingdomAttackCoin.abi,
			KingdomAttackCoin.networks[networkId].address
		);
		let balance1 = await kgdat.methods.balanceOf(account).call();
		balance1 = balance1 / 10 ** 18;
		dispatch({
			type: 'KGDAT_DATA',
			payload: { kgdat: kgdat, kgdat_balance: balance1.toString() },
		});
		loadCount++;
	} else {
		console.log('KingdomAttackCoin not deployed to this network');
	}
	if (kgdatDataDF) {
		// next defense
		const kgddf = new web3.eth.Contract(
			KingdomDefenseCoin.abi,
			KingdomDefenseCoin.networks[networkId].address
		);
		let balance2 = await kgddf.methods.balanceOf(account).call();
		balance2 = balance2 / 10 ** 18;
		dispatch({
			type: 'KGDDF_DATA',
			payload: { kgddf: kgddf, kgddf_balance: balance2.toString() },
		});
		loadCount++;
	} else {
		console.log('Defensecoin not deployed to this network');
	}
	if (kgdatDataSC) {
		// next seed
		const kgdsc = new web3.eth.Contract(
			KingdomSeedCoin.abi,
			KingdomSeedCoin.networks[networkId].address
		);
		let balance3 = await kgdsc.methods.balanceOf(account).call();
		balance3 = balance3 / 10 ** 18;
		dispatch({
			type: 'KGDSC_DATA',
			payload: { kgdsc: kgdsc, kgdsc_balance: balance3.toString() },
		});
		loadCount++;
	} else {
		console.log('Seedcoin not deployed to this network');
	}
	if (kgdatDataBC) {
		// console.log("bankcoin active");
		// next bcoin
		const kgdbc = new web3.eth.Contract(
			KingdomGameMechanic.abi,
			KingdomGameMechanic.networks[networkId].address
		);
		let balance4 = await kgdbc.methods.balanceOf(account).call();
		let allTitleIds = await kgdbc.methods.getIdsOfAddress(account).call();
		let allNFTData = [];
		if (allTitleIds.length) {
			for (let i = 0; i < allTitleIds.length; i++) {
				let responseData = await kgdbc.methods
					.getTitleStats(allTitleIds[i])
					.call();
				const image = await (await RandomPicture()).url;
				allNFTData.push({
					...responseData,
					titleId: allTitleIds[i],
					image,
				});
			}
		}
		let allRanksOfTitles = await kgdbc.methods
			.getRanksOfAddress(account)
			.call();
		console.log(
			'yo got dat balance for seedycoin, is: ',
			balance4.toString()
		);
		dispatch({
			type: 'KGDBC_DATA',
			payload: {
				kgdbc: kgdbc,
				kgdbc_balance: balance4.toString(),
				title_ids: allTitleIds,
				title_ranks: allRanksOfTitles,
				nftData: allNFTData,
			},
		});
		loadCount++;
		// set state of staking
		// console.log("geddin stakingres");
		let stakingres = await kgdbc.methods
			.getCurrentStakes()
			.call({ from: account });
		console.log('staking area ', stakingres);
		if (stakingres) {
			console.log(stakingres, 'stakingres');
			if (parseInt(stakingres[0]) > 0 || parseInt(stakingres[1]) > 0) {
				console.log(stakingres, 'stakingresfixy');
				// fuck this shit, somehow it is not working, fuck all javascript and fuck react
				// let stakingtime = await kgdbc.methods.getTimeUntilStakingDone22().call({ from: this.state.account }); // await kgdbc.methods.getTimeUntilStakingDone().call({ from: this.state.account });
				let stakingtime = [0, 0];
				// console.log("stakingres: ", stakingres);
				dispatch({
					type: 'STAKE_DATA',
					payload: {
						kgdat_stakes: stakingres[0].toString(),
						kgdat_stakeTimeRemaining: stakingtime[0].toString(),
						kgddf_stakes: stakingres[1].toString(),
						kgddf_stakeTimeRemaining: stakingtime[1].toString(),
					},
				});
			}
		}
	} else {
		console.log('Bankcoin not deployed to this network');
	}
	if (loadCount === 4) {
		dispatch(loaderState(false));
		// all done so set false
		console.log('ended data');
		// loading = false;
	} else {
		dispatch(loaderState(false));
		console.log(
			'Error! Contract not deployed, no detected network! loadcount: ',
			loadCount
		);
	}
};

export const buyForEth = (account, amount, kgdbc) => async dispatch => {
	// this.state.loading = true;
	dispatch(loaderState(true));
	try {
		console.log('buyForEth called', Web3.utils.toWei(amount, 'ether'));
		amount = Web3.utils.toWei(amount, 'ether');
		await kgdbc.methods.buyForETH().send({ from: account, value: amount });
		dispatch(loadBlockChainData(account));
		dispatch(loaderState(false)); // udpate
		// this.state.loading = false;
		// window.location.reload(false);
	} catch (error) {
		dispatch(loaderState(false));
	}
};

export const setSeedingTime = (account, kgdbc) => async dispatch => {
	// this.state.loading = true;
	console.log('setSeedingTime called');
	let stakingtime = await kgdbc.methods
		.getTimeUntilStakingDone()
		.call({ from: account });
	dispatch({
		type: 'UPDATE_STAKE_TIME',
		payload: {
			kgdat_stakeTimeRemaining: stakingtime[0].toString(),
			kgddf_stakeTimeRemaining: stakingtime[1].toString(),
		},
	});
	// this.state.loading = false;
	// window.location.reload(false);
};

export const plantSeeds =
	(amount, account, coinType, kgdsc, kgdbc) => async dispatch => {
		dispatch(loaderState(true));
		console.log('plantSeeds called', amount, coinType);

		// this.state.loading = true;
		// amount = Web3.utils.toWei(amount, 'ether');
		let tokenAmount = bigNumber(amount).multiply(
			bigNumber(String(10 ** 18))
		);
		console.log(tokenAmount);
		console.log(kgdbc.options.address);
		// let bignumber = Web3.utils.toBN(amount);
		// console.log(bignumber);
		try {
			if (coinType === 'kgdat') {
				// first approve
				await kgdsc.methods
					.approve(kgdbc.options.address, tokenAmount)
					.send({ from: account });
				await kgdbc.methods
					.plantSeeds(tokenAmount, 0)
					.send({ from: account });
			} else if (coinType === 'kgddf') {
				await kgdsc.methods
					.approve(kgdbc.options.address, tokenAmount)
					.send({ from: account });
				await kgdbc.methods
					.plantSeeds(tokenAmount, 1)
					.send({ from: account });
			}
			dispatch(loadBlockChainData(account));
			dispatch(loaderState(false));
			// udpate
			// this.state.loading = false;
			// window.location.reload(false);
		} catch (error) {
			dispatch(loaderState(false));
			console.log('error in plant seeds function: ', error);
		}
	};

export const harvestAll = (account, kgdbc) => async dispatch => {
	// this.state.loading = true;
	dispatch(loaderState(true));
	await kgdbc.methods.harvestAll().send({ from: account });
	dispatch(loadBlockChainData(account));
	dispatch(loaderState(false));
	// udpate
	// this.state.loading = false;
	// window.location.reload(false);
};

export const getSingleData = (id, kgdbc) => async dispatch => {
	dispatch(loaderState(true));
	let responseData = await kgdbc.methods.getTitleStats(id).call();
	let rank = await kgdbc.methods.getRankOfId(id).call();
	let boss = await kgdbc.methods.getBossId(id).call();
	let child = await kgdbc.methods.getServants(id).call();
	responseData.attackPoints = responseData.attackPoints / 10 ** 18;
	responseData.defensePoints = responseData.defensePoints / 10 ** 18;
	dispatch({
		type: 'GET_SINGLE_DATA',
		payload: { ...responseData, rank, boss, child },
	});
	dispatch(loaderState(false));
};

export const assignPoints =
	(amount, account, titleId, type, kgdbc, kgdat, kgddf) => async dispatch => {
		dispatch(loaderState(true));
		try {
			let tokenAmount = bigNumber(amount).multiply(
				bigNumber(String(10 ** 18))
			);
			if (type == 0) {
				await kgdat.methods
					.approve(kgdbc.options.address, tokenAmount)
					.send({ from: account });
				await kgdbc.methods
					.assignMilitaryToTitle(tokenAmount, titleId, 0)
					.send({ from: account });
				dispatch(getSingleData(titleId, kgdbc));
				dispatch(loaderState(false));
			} else if (type == 1) {
				await kgddf.methods
					.approve(kgdbc.options.address, tokenAmount)
					.send({ from: account });
				await kgdbc.methods
					.assignMilitaryToTitle(tokenAmount, titleId, 1)
					.send({ from: account });
				dispatch(getSingleData(titleId, kgdbc));
				dispatch(loaderState(false));
			}
		} catch (e) {
			dispatch(loaderState(false));
		}
	};

export const loaderState = bool => async dispatch => {
	dispatch({ type: 'LOAD_STATE', payload: bool });
};
