import React from 'react';
import {
	Navbar,
	NavbarBrand,
	Collapse,
	Nav,
	NavItem,
	Button,
} from 'reactstrap';
import { connectAccount } from '../store/actions/Action';
import { useDispatch, useSelector } from 'react-redux';
function Header() {
	const dispatch = useDispatch();
	const { account } = useSelector(state => state.web3);

	const connectWallet = () => {
		dispatch(connectAccount());
	};
	return (
		<>
			<Navbar expand='xs'>
				<NavbarBrand href='/' className='text-white'>
					Kingdom Warrior
				</NavbarBrand>
				<Collapse navbar>
					<Nav className='ml-auto' navbar>
						<NavItem className='mr-3'>
							<Button className='btn__primary-outlined '>
								Tutorial Team Whitepaper
							</Button>
						</NavItem>
						<NavItem>
							<Button
								onClick={connectWallet}
								disabled={account}
								className='btn__primary'
							>
								{account
									? `${account.substring(
											0,
											6
									  )}...${account.substring(
											account.length - 6
									  )}`
									: 'Connect Wallet'}
							</Button>
						</NavItem>
					</Nav>
				</Collapse>
			</Navbar>
		</>
	);
}

export default Header;
