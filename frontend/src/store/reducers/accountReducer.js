const initialState = {
	account: null,
	balance: 0,
	kgdat: {},
	kgdat_balance: 0,
	kgddf: {},
	kgddf_balance: 0,
	kgdsc: {},
	kgdsc_balance: 0,
	kgdbc: {},
	kgdbc_balance: 0,
	title_ids: [],
	title_ranks: [],
	nftData: [],
	singleNFT: null,
	loading: false,
	// stakes
	kgdat_stakes: 0,
	kgdat_stakeTimeRemaining: 0,
	kgddf_stakes: 0,
	kgddf_stakeTimeRemaining: 0,
};

const accountReducer = (state = initialState, action) => {
	switch (action.type) {
		case 'CONNECT_ACCOUNT':
			return {
				...state,
				account: action.payload,
			};
		case 'GET_BALANCE':
			return {
				...state,
				balance: action.payload,
			};
		case 'KGDAT_DATA':
			return {
				...state,
				kgdat: action.payload.kgdat,
				kgdat_balance: action.payload.kgdat_balance,
			};
		case 'KGDDF_DATA':
			return {
				...state,
				kgddf: action.payload.kgddf,
				kgddf_balance: action.payload.kgddf_balance,
			};
		case 'KGDSC_DATA':
			return {
				...state,
				kgdsc: action.payload.kgdsc,
				kgdsc_balance: action.payload.kgdsc_balance,
			};
		case 'KGDBC_DATA':
			return {
				...state,
				kgdbc: action.payload.kgdbc,
				kgdbc_balance: action.payload.kgdbc_balance,
				title_ids: action.payload.title_ids,
				title_ranks: action.payload.title_ranks,
				nftData: action.payload.nftData,
			};
		case 'STAKE_DATA':
			return {
				...state,
				kgdat_stakes: action.payload.kgdat_stakes,
				kgdat_stakeTimeRemaining:
					action.payload.kgdat_stakeTimeRemaining,
				kgddf_stakes: action.payload.kgddf_stakes,
				kgddf_stakeTimeRemaining:
					action.payload.kgddf_stakeTimeRemaining,
			};
		case 'UPDATE_STAKE_TIME':
			return {
				...state,

				kgdat_stakeTimeRemaining:
					action.payload.kgdat_stakeTimeRemaining,

				kgddf_stakeTimeRemaining:
					action.payload.kgddf_stakeTimeRemaining,
			};
		case 'GET_SINGLE_DATA':
			return {
				...state,
				singleNFT: action.payload,
			};
		case 'LOAD_STATE':
			return {
				...state,
				loading: action.payload,
			};
		default:
			return state;
	}
};

export default accountReducer;
