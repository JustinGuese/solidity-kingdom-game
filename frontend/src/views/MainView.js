import { startTransition, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	Button,
	Card,
	CardBody,
	Col,
	Container,
	Form,
	Input,
	Label,
	Row,
} from 'reactstrap';
import { Link, useHistory } from 'react-router-dom';
import {
	assignPoints,
	connectAccount,
	getSingleData,
	loadBlockChainData,
} from '../store/actions/Action';

import Berry from '../assets/img/berry.png';
import NFT from '../assets/img/nft.jpg';
import LoadingOverlay from 'react-loading-overlay';
import { DotLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { css } from '@emotion/react';
let rawGithubImage =
	'https://raw.githubusercontent.com/JustinGuese/solidity-kingdom-game/master/nft-generator-python/output';

const AdminView = props => {
	const override = css`
		display: block;
		margin: 0 auto;
		border-color: red;
	`;
	const history = useHistory();
	const [amount, setAmount] = useState('');
	const [amount1, setAmount1] = useState('');
	const dispatch = useDispatch();
	const { account, singleNFT, kgdbc, loading, kgdat, kgddf } = useSelector(
		state => state.web3
	);
	let id = history.location.pathname.split('/')[2];
	useEffect(() => {
		if (id && account && Object.keys(kgdbc).length) {
			dispatch(getSingleData(id, kgdbc));
		} else {
			dispatch(connectAccount());
			// dispatch(loadBlockChainData(account));
		}
	}, [kgdbc]);
	// useEffect(() => {
	// 	console.log('id', history.location.pathname.split('/')[2]);
	// }, [history.location.pathname]);
	useEffect(() => {
		if (account) {
			dispatch(loadBlockChainData(account));
		}
	}, [account]);

	return (
		<>
			<LoadingOverlay
				active={loading}
				spinner={
					<DotLoader color={'#ff0000'} css={override} size={250} />
				}
				// text='Loading...'
			>
				<Container fluid className='mb-2'>
					<Row>
						<Col md='6'>
							<Row className='mt-3'>
								<Col sm='2'>
									{/* <Card className='wyne__card text-center text-white'>
										<h5>REDWYNE</h5>
										<div className='text-center'>
											<img
												src={Berry}
												alt='Berry'
												height='34px'
												width='34px'
											/>
										</div>
									</Card> */}
								</Col>
								<Col sm='2'>
									{/* <Card className='wyne__card text-center text-white'>
										<h5>REDWYNE</h5>
										<div className='text-center'>
											<img
												src={Berry}
												alt='Berry'
												height='34px'
												width='34px'
											/>
										</div>
									</Card> */}
								</Col>
								<Col sm='4'>
									<Card className='wyne__card text-center text-white'>
										<img
											src={`${rawGithubImage}/${id}.png`}
											alt='NFT'
											className='img-fluid'
										/>
									</Card>
								</Col>
								<Col sm='4'>
									<Card className='gray__card text-center text-white'>
										<CardBody>
											<div className='d-flex align-items-center'>
												<small>
													Attack Multiplier:
												</small>
												<small className='number_text-sm  ml-auto'>
													{singleNFT
														? singleNFT.attackMultiplier
														: '0'}
												</small>
											</div>
											<div className='d-flex align-items-center'>
												<small>
													Defense Multiplier:
												</small>
												<small className='number_text-sm  ml-auto'>
													{singleNFT
														? singleNFT.defenseMultiplier
														: '0'}
												</small>
											</div>
											<div className='d-flex align-items-center'>
												<small>Money Multiplier:</small>
												<small className='number_text-sm  ml-auto'>
													{singleNFT
														? singleNFT.moneyMultiplier
														: '0'}
												</small>
											</div>
										</CardBody>
									</Card>
								</Col>
							</Row>
							<Row className='mt-3'>
								<Col sm={6}>
									<Card className='wyne__card text-center text-white'>
										{/* <Link
											to={`/title/${singleNFT?.child?.left}`}
										> */}
										<div
											// onClick={() =>
											// 	history.push(
											// 		`/title/${singleNFT?.child?.left}`
											// 	)
											// }
											className='text-center'
										>
											<img
												src={`${rawGithubImage}/${singleNFT?.child?.left}.png`}
												alt='Berry'
												className='img-fluid'
												height='34px'
												width='170px'
											/>
											<h5>{singleNFT?.child?.left}</h5>
										</div>
										{/* </Link> */}
									</Card>
								</Col>
								<Col sm={6}>
									<Card className='wyne__card text-center text-white'>
										{/* <Link
											to={`/title/${singleNFT?.child?.right}`}
										> */}
										<div
											// onClick={() =>
											// 	history.push(
											// 		`/title/${singleNFT?.child?.right}`
											// 	)
											// }
											className='text-center'
										>
											<img
												src={`${rawGithubImage}/${singleNFT?.child?.right}.png`}
												alt='Berry'
												className='img-fluid'
												height='34px'
												width='170px'
											/>
											<h5>{singleNFT?.child?.right}</h5>
										</div>
										{/* </Link> */}
									</Card>
								</Col>
							</Row>
						</Col>
						<Col md='6'>
							<div className='mt-3'>
								<div className='d-flex align-items-center'>
									<Label className='text-white mr-3 mb-0'>
										Your Rank:
									</Label>
									<strong className='number_text'>
										{singleNFT ? singleNFT.rank : '0'}
									</strong>
								</div>
								<div className='d-flex align-items-center'>
									<Label className='text-white mr-3 mb-0'>
										ID of Title:
									</Label>
									<strong className='number_text'>
										{id}
									</strong>
								</div>
								<Card className='gray__card mt-4'>
									<CardBody>
										<div className='d-flex align-items-center'>
											<Label className='text-white mr-3 mb-0'>
												TitleId boss:
											</Label>
											<strong className='simple__text'>
												{singleNFT
													? singleNFT.boss
													: '0'}
											</strong>
										</div>
										<div className='d-flex align-items-center'>
											<small className='text-white mr-3 mb-0'>
												Address boss:
											</small>
											<small className='text-white'>
												demo address for test purpose
											</small>
										</div>
									</CardBody>
								</Card>
								<Card className='gray__card mt-4'>
									<CardBody>
										<div className='d-flex align-items-center'>
											<Label className='text-white mr-3 mb-0'>
												TitleId right child:
											</Label>
											<strong className='simple__text'>
												{singleNFT
													? singleNFT.child.right
													: '0'}
											</strong>
										</div>
										<div className='d-flex align-items-center'>
											<small className='text-white mr-3 mb-0'>
												Address right child:
											</small>
											<small className='text-white'>
												demo address for test purpose
											</small>
										</div>
									</CardBody>
								</Card>
								<Card className='gray__card mt-4'>
									<CardBody>
										<div className='d-flex align-items-center'>
											<Label className='text-white mr-3 mb-0'>
												TitleId left child:
											</Label>
											<strong className='simple__text'>
												{singleNFT
													? singleNFT.child.left
													: '0'}
											</strong>
										</div>
										<div className='d-flex align-items-center'>
											<small className='text-white mr-3 mb-0'>
												Address left child:
											</small>
											<small className='text-white'>
												demo address for test purpose
											</small>
										</div>
									</CardBody>
								</Card>
								<h4 className='text-white font-weight-bold mt-3'>
									Attack/Defense Points in position
								</h4>
								<div className='d-flex align-items-center mt-3'>
									<Label className='text-white mr-4 mb-0'>
										AttackPoints:
									</Label>
									<strong className='number_text'>
										{singleNFT
											? singleNFT.attackPoints
											: '0'}{' '}
										<small>KGDAT</small>
									</strong>
								</div>
								<div className='d-flex align-items-center'>
									<Label className='text-white mr-3 mb-0'>
										DefensePoints:
									</Label>
									<strong className='number_text'>
										{singleNFT
											? singleNFT.defensePoints
											: '0'}{' '}
										<small>KGDDF</small>
									</strong>
								</div>
								<Form
									onSubmit={e => {
										e.preventDefault();
										if (account) {
											dispatch(
												assignPoints(
													amount,
													account,
													id,
													0,
													kgdbc,
													kgdat,
													kgddf
												)
											);
											setAmount('');
										} else {
											toast.error(
												'Please Connect to your account'
											);
										}
									}}
								>
									<div className='d-flex mt-3'>
										<Input
											type='number'
											value={amount}
											placeholder='987654321'
											required
											min={1}
											onChange={e =>
												setAmount(e.target.value)
											}
											className='custom__input-number mr-4'
										/>
										<Button
											type='submit'
											block
											className='btn__primary font-weight-bold py-3'
										>
											Transfer Attackpoints
										</Button>
									</div>
								</Form>
								<Form
									onSubmit={e => {
										e.preventDefault();
										if (account) {
											dispatch(
												assignPoints(
													amount,
													account,
													id,
													1,
													kgdbc,
													kgdat,
													kgddf
												)
											);
											setAmount1('');
										} else {
											toast.error(
												'Please Connect to your account'
											);
										}
									}}
								>
									<div className='d-flex mt-3'>
										<Input
											type='number'
											value={amount1}
											placeholder='987654321'
											min={1}
											required
											onChange={e =>
												setAmount1(e.target.value)
											}
											className='custom__input-number mr-4'
										/>
										<Button
											type='submit'
											block
											className='btn__primary font-weight-bold py-3'
										>
											Transfer Defensepoints
										</Button>
									</div>
								</Form>
							</div>
						</Col>
					</Row>
				</Container>
			</LoadingOverlay>
		</>
	);
};

export default AdminView;
