import Header from '../components/Header';

const Main = props => {
	return (
		<>
			<Header />
			{props.children}
		</>
	);
};

export default Main;
