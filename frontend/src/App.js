import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import Main from './layout/Main';
import routes from './routes';
import store from './store';

function App() {
	return (
		<>
			<Provider store={store}>
				<BrowserRouter>
					<Switch>
						{routes.map(route => {
							switch (route.layout) {
								case 'main':
									return (
										<Route exact path={route.path}>
											<Main>
												<route.component />
											</Main>
										</Route>
									);
							}
						})}
						<Redirect to='/' />
					</Switch>
				</BrowserRouter>
			</Provider>
		</>
	);
}

export default App;
