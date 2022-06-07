import React, { useEffect, useState } from 'react';
import {
	Button,
	Card,
	CardBody,
	Col,
	Container,
	Label,
	Row,
	Input,
	Form,
} from 'reactstrap';
import CarouselSection from '../components/CarouselSection.js';
import { css } from '@emotion/react';

import Avatar from 'react-avatar';
import { useDispatch, useSelector } from 'react-redux';
import {
	buyForEth,
	connectAccount,
	loadBlockChainData,
	plantSeeds,
	setSeedingTime,
} from '../store/actions/Action';
import LoadingOverlay from 'react-loading-overlay';
import { DotLoader } from 'react-spinners';
import { toast } from 'react-toastify';
function Account () {
 const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;
	const dispatch = useDispatch();
	const {
		account,
		balance,
		kgdat,
		kgdat_balance,
		kgddf,
		kgddf_balance,
		kgdsc,
		kgdsc_balance,
		kgdbc,
		kgdbc_balance,
		title_ids,
		title_ranks,
		nftData,
		loading,
		// stakes
		kgdat_stakes,
		kgdat_stakeTimeRemaining,
		kgddf_stakes,
		kgddf_stakeTimeRemaining,
	} = useSelector(state => state.web3);
	const [amount, setAmount] = useState();
	const [amount1, setAmount1] = useState();
	const [amount2, setAmount2] = useState();
	const connectWallet = () => {
		dispatch(connectAccount());
	};
	useEffect(() => {
		connectWallet();
	}, []);

	useEffect(() => {
		if (account) {
			dispatch(loadBlockChainData(account));
		}
	}, [account]);
	return (
		<>
			<LoadingOverlay
				active={loading}
				spinner={<DotLoader color={'#ff0000'} css={override} size={250} />}
				// text='Loading your content...'
			>
				<Container fluid className='mb-3'>
					<Row>
						<Col lg='6' className='text-white'>
							<CarouselSection nftData={nftData} />
							<div className='mt-3'>
								<strong className='simple__text'>
									Buy KingdomSeedCoins for Ether
								</strong>
								<br />
								<small>Kaufe Coins for ETH du spasst</small>
								<Form
									onSubmit={e => {
										e.preventDefault();
										if (account) {
											dispatch(
												buyForEth(
													account,
													amount,
													kgdbc
												)
											);
											setAmount('');
										} else {
											toast.error(
												'Please Connect Account'
											);
										}
									}}
								>
									<div className='d-flex mt-3'>
										<Input
											type='number'
											placeholder='987654321' //={987654321}
											onChange={e =>
												setAmount(e.target.value)
											}
											className='custom__input-number mr-4'
											required
											value={amount}
											// steps={0.1}
											min={1}
										/>
										<Button
											block
											type='submit'
											className='btn__primary font-weight-bold py-3'
										>
											Buy Kingdom Seed Coins
										</Button>
									</div>
								</Form>
								<h2 className='mt-5 mb-5 font-weight-bold'>
									Seeding
								</h2>
								<strong className='simple__text'>
									Stake KingdomSeedCoins for KingdomAttackCoin
								</strong>
								<br />
								<small>Whatever</small>
								<Form
									onSubmit={e => {
										e.preventDefault();
										if (account) {
											dispatch(
												plantSeeds(
													amount1,
													account,
													'kgdat',
													kgdsc,
													kgdbc
												)
											);
											setAmount1('');
										} else {
											toast.error(
												'Please connect your account!!!'
											);
										}
									}}
								>
									<div className='d-flex mt-3 mb-3'>
										<Input
											type='number'
											placeholder='987654321' //={987654321}
											value={amount1}
											required
											min={1}
											onChange={e =>
												setAmount1(e.target.value)
											}
											className='custom__input-number mr-4'
										/>
										<Button
											block
											type='submit'
											className='btn__primary font-weight-bold py-3'
										>
											Seed for Kingdom Attack Coins
										</Button>
									</div>
								</Form>
								<strong className='simple__text'>
									Stake KingdomSeedCoins for
									KingdomDefenseCoin
								</strong>
								<br />
								<small>Whatever</small>
								<Form
									onSubmit={e => {
										e.preventDefault();
										if (account) {
											dispatch(
												plantSeeds(
													amount2,
													account,
													'kgddf',
													kgdsc,
													kgdbc
												)
											);
											setAmount2('');
										} else {
											toast.error(
												'Please connect your account!!!'
											);
										}
									}}
								>
									<div className='d-flex mt-3'>
										<Input
											type='number'
											placeholder='987654321' //={987654321}
											value={amount2}
											required
											min={1}
											onChange={e =>
												setAmount2(e.target.value)
											}
											className='custom__input-number mr-4'
										/>
										<Button
											block
											type='submit'
											className='btn__primary font-weight-bold py-3'
										>
											Seed for Kingdom Defense Coins
										</Button>
									</div>
								</Form>
							</div>
						</Col>
						<Col lg='6'>
							<div className='mt-3'>
								<div className='d-flex align-items-baseline'>
									<div className='profile mr-4'>
										<Avatar
											// src='https://banner2.cleanpng.com/20180623/iqh/kisspng-computer-icons-avatar-social-media-blog-font-aweso-avatar-icon-5b2e99c40ce333.6524068515297806760528.jpg'
											size='80'
											round={true}
										/>
										<Label className='text-white mt-2 mb-0'>
											John Doe
										</Label>
									</div>
									<div>
										<div className='d-flex align-items-center'>
											<Label className='text-white mr-3 mb-0'>
												Current Share in Pool:
											</Label>
											<strong className='number_text'>
												0.17 %
											</strong>
										</div>
										<div className='d-flex align-items-center'>
											<Label className='text-white mr-3 mb-0'>
												Expected Earnings:
											</Label>
											<strong className='number_text'>
												1.3 ETH
											</strong>
										</div>
										<div className='d-flex align-items-center'>
											<Label className='text-white mr-3 mb-0'>
												Time of Payout:
											</Label>
											<small className='text-white'>
												1 day, 23h, 12m
											</small>
										</div>
									</div>
								</div>
								<Card className='gray__card mt-4'>
									<CardBody>
										<strong className='simple__text'>
											Your Statistics
										</strong>
										<Card className='detail__card mt-2'>
											<CardBody>
												<Row>
													<Col>
														<small>Account:</small>
													</Col>
													<Col>
														<small>
															{account
																? account
																: 'Not Connected'}
														</small>
													</Col>
												</Row>
											</CardBody>
										</Card>
										<Card className='detail__card mt-2'>
											<CardBody>
												<Row>
													<Col>
														<small>
															Balance of Native
															Coin:
														</small>
													</Col>
													<Col>
														<small>
															{balance} ETH
														</small>
													</Col>
												</Row>
											</CardBody>
										</Card>
										<Card className='detail__card mt-2'>
											<CardBody>
												<Row>
													<Col>
														<small>
															Balance of
															KingdomAttackCoin:
														</small>
													</Col>
													<Col>
														<small>
															{kgdat_balance}{' '}
															KGDAT
														</small>
													</Col>
												</Row>
											</CardBody>
										</Card>
										<Card className='detail__card mt-2'>
											<CardBody>
												<Row>
													<Col>
														<small>
															Balance of
															KingdomDefenceCoin:
														</small>
													</Col>
													<Col>
														<small>
															{kgddf_balance}{' '}
															KGDDF
														</small>
													</Col>
												</Row>
											</CardBody>
										</Card>
										<Card className='detail__card mt-2'>
											<CardBody>
												<Row>
													<Col>
														<small>
															Balance of
															KingdomSeedCoin:
														</small>
													</Col>
													<Col>
														<small>
															{kgdsc_balance} KGDS
														</small>
													</Col>
												</Row>
											</CardBody>
										</Card>
										<Card className='detail__card mt-2'>
											<CardBody>
												<Row>
													<Col>
														<small>
															No of Titles Owned:
														</small>
													</Col>
													<Col>
														<small>
															{kgdbc_balance}
														</small>
													</Col>
												</Row>
											</CardBody>
										</Card>
										<Card className='detail__card mt-2'>
											<CardBody>
												<Row>
													<Col>
														<small>
															TitleIds of Titles
															Owned:
														</small>
													</Col>
													<Col>
														<small>
															{title_ids.length
																? title_ids.map(
																		(
																			id,
																			index
																		) => (
																			<>
																				{
																					id
																				}
																				{index ===
																				title_ids.length -
																					1
																					? ''
																					: ','}
																			</>
																		)
																  )
																: 'N/A'}
														</small>
													</Col>
												</Row>
											</CardBody>
										</Card>
										<Card className='detail__card mt-2'>
											<CardBody>
												<Row>
													<Col>
														<small>
															Ranks of Titles
															Owned:
														</small>
													</Col>
													<Col>
														<small>
															{title_ranks.length
																? title_ranks.map(
																		(
																			id,
																			index
																		) => (
																			<>
																				{
																					id
																				}
																				{index ===
																				title_ranks.length -
																					1
																					? ''
																					: ','}
																			</>
																		)
																  )
																: 'N/A'}
														</small>
													</Col>
												</Row>
											</CardBody>
										</Card>
										<Card className='detail__card mt-2'>
											<CardBody>
												<Row className='align-items-center'>
													<Col>
														<small>
															Update Time
															Remaining for
															Seedcoin Harvest:
														</small>
													</Col>
													<Col>
														<Button
															onClick={() => {
																if (account) {
																	dispatch(
																		setSeedingTime(
																			account,
																			kgdbc
																		)
																	);
																} else {
																	toast.error(
																		'Please Connect to your account'
																	);
																}
															}}
														>
															Update Harvest Time
														</Button>
													</Col>
												</Row>
											</CardBody>
										</Card>
										<Card className='detail__card mt-2'>
											<CardBody>
												<Row>
													<Col>
														<small>
															Stakes of
															KingdomAttackCoin:
														</small>
													</Col>
													<Col>
														<small>
															{kgdat_stakes}, time
															remaining (s):{' '}
															{
																kgdat_stakeTimeRemaining
															}
														</small>
													</Col>
												</Row>
											</CardBody>
										</Card>
										<Card className='detail__card mt-2'>
											<CardBody>
												<Row>
													<Col>
														<small>
															Stakes of
															KingdomDefenseCoin:
														</small>
													</Col>
													<Col>
														<small>
															{kgddf_stakes}, time
															remaining (s):{' '}
															{
																kgddf_stakeTimeRemaining
															}
														</small>
													</Col>
												</Row>
											</CardBody>
										</Card>
									</CardBody>
								</Card>
							</div>
						</Col>
					</Row>
				</Container>
			</LoadingOverlay>
		</>
	);
}

export default Account;
