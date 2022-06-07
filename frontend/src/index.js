import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Import CSS here
import "bootstrap/dist/css/bootstrap.min.css"
import "./assets/css/style.css"
import { ToastContainer } from 'react-toastify';

ReactDOM.render(
	<React.StrictMode>
		<ToastContainer />
		<App />
	</React.StrictMode>,
	document.getElementById('root')
);