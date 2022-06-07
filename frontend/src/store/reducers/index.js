// Root Reducer

import { combineReducers } from "redux";
import accountReducer from './accountReducer';

export let rootReducer = combineReducers({
	web3: accountReducer,
});

export default rootReducer;