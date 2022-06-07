import { RandomPicture } from 'random-picture/dist';
import React, { useEffect, useState } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { useHistory } from 'react-router-dom';
import { Button } from 'reactstrap';
import nft from '../assets/img/berry.png';

let rawGithubImage =
	'https://raw.githubusercontent.com/JustinGuese/solidity-kingdom-game/master/nft-generator-python/output';

function CarouselSection({ nftData }) {
	// const [random, setRandom] = useState('');
	const history = useHistory();
	// useEffect(async () => {
	// 	const image = await RandomPicture().url;
	// 	setRandom(image);
	// }, []);

	const responsive = {
		superLargeDesktop: {
			// the naming can be any, depends on you.
			breakpoint: { max: 4000, min: 3000 },
			items: 6,
		},
		desktop: {
			breakpoint: { max: 3000, min: 1024 },
			items: 3,
		},
		tablet: {
			breakpoint: { max: 1024, min: 464 },
			items: 3,
		},
		mobile: {
			breakpoint: { max: 464, min: 0 },
			items: 2,
		},
	};
	const ButtonGroup = ({ next, previous, ...rest }) => {
		const {
			carouselState: { currentSlide, totalItems, slidesToShow },
		} = rest;

		return (
			<div className='carousel-button-group'>
				<button
					aria-label='Go to previous slide'
					className={currentSlide === 0 ? 'disable' : 'btn--left'}
					onClick={() => previous()}
				>
					Previous
				</button>
				<button
					aria-label='Go to next slide'
					className={
						currentSlide === totalItems - slidesToShow
							? 'disable'
							: 'btn--right'
					}
					onClick={() => next()}
				>
					{' '}
					Next
				</button>
			</div>
		);
	};

	return (
		<Carousel
			className='carousel mt-3 py-3'
			responsive={responsive}
			// arrows={false}
			// customButtonGroup={<ButtonGroup />}
		>
			{nftData.length > 0 &&
				nftData.map(nft => {
					return (
						<div
							style={{ cursor: 'pointer' }}
							onClick={() => {
								history.push(`/title/${nft.titleId}`);
							}}
							className='carousel__img px-3'
						>
							<img
								src={`${rawGithubImage}/${nft.titleId}.png`}
								className='img-fluid'
								height={200}
							/>
						</div>
					);
				})}
			{/* {nftData.length == 0 && (
				<div className='carousel__img px-3'>
					<img src={random} className='img-fluid' />
					No NFT Data
				</div>
			)} */}

			{/* <div className='carousel__img px-3'>
				<img src={nft} className='img-fluid' />
			</div>
			<div className='carousel__img px-3'>
				<img src={nft} className='img-fluid' />
			</div>
			<div className='carousel__img px-3'>
				<img src={nft} className='img-fluid' />
			</div>
			<div className='carousel__img px-3'>
				<img src={nft} className='img-fluid' />
			</div>
			<div className='carousel__img px-3'>
				<img src={nft} className='img-fluid' />
			</div> */}
		</Carousel>
	);
}

export default CarouselSection;
