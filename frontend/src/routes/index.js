import Account from '../views/Account';
import MainView from '../views/MainView';

let routes = [
	{
		path: '/title/:id',
		component: MainView,
		layout: 'main',
	},
	{
		path: '/',
		component: Account,
		layout: 'main',
	},
];
export default routes;
