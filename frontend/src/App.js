import React, { Component } from 'react';
import Web3 from 'web3';
import KingdomAttackCoin from './contracts/KingdomAttackCoin.json';
import KingdomSeedCoin from './contracts/KingdomSeedCoin.json';
import KingdomDefenseCoin from './contracts/KingdomDefenseCoin.json';
import KingdomGameMechanic from './contracts/KingdomGameMechanic.json';

class App extends Component {

  async LoadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    let balance = await web3.eth.getBalance(account);
    let loadCount = 0;
    const networkId = await web3.eth.net.getId();
    this.setState({ account, balance, networkId });
    // network related stuff
    console.log(networkId, "networkid");
    console.log(account, "account");
    const kgdatDataAT = await KingdomAttackCoin.networks[networkId];
    console.log(kgdatDataAT.address, "kgdatDataAT");
    const kgdatDataDF = await KingdomDefenseCoin.networks[networkId];
    const kgdatDataSC = await KingdomSeedCoin.networks[networkId];
    const kgdatDataBC = await KingdomGameMechanic.networks[networkId];

    if (kgdatDataAT) {
      const kgdat = new web3.eth.Contract(KingdomAttackCoin.abi, kgdatDataAT.address);
      let balance1 = await kgdat.methods.balanceOf(account).call();
      this.setState({ kgdat : kgdat, kgdat_balance : balance1.toString() });
      loadCount++;
    }
    else {
      console.log("KingdomAttackCoin not deployed to this network");
    }
    if (kgdatDataDF) {
      // next defense
      const kgddf = new web3.eth.Contract(KingdomDefenseCoin.abi, kgdatDataDF.address);
      let balance2 = await kgddf.methods.balanceOf(account).call();
      this.setState({ kgddf : kgddf, kgddf_balance : balance2.toString() });
      loadCount++;
    }
    else {
      console.log("Defensecoin not deployed to this network");
    }
    if (kgdatDataSC) {
      // next seed
      const kgdsc = new web3.eth.Contract(KingdomSeedCoin.abi, kgdatDataSC.address);
      let balance3 = await kgdsc.methods.balanceOf(account).call();
      this.setState({ kgdsc : kgdsc, kgdsc_balance : balance3.toString() });
      loadCount++;
    }
    else {
      console.log("Seedcoin not deployed to this network");
    }
    if (kgdatDataBC) {
      // console.log("bankcoin active");
      // next bcoin
      const kgdbc = new web3.eth.Contract(KingdomGameMechanic.abi, kgdatDataBC.address);
      let balance4 = await kgdbc.methods.balanceOf(account).call();
      console.log("yo got dat balance for seedycoin, is: ", balance4.toString());
      this.setState({ kgdbc : kgdbc, kgdbc_balance : balance4.toString() });
      loadCount++;
      // set state of staking 
      // console.log("geddin stakingres");
      let stakingres = await kgdbc.methods.getCurrentStakes().call({ from: this.state.account });
        if (stakingres) {
          console.log(stakingres, "stakingres");
          if (parseInt(stakingres[0]) > 0 || parseInt(stakingres[1]) > 0) {
            console.log(stakingres, "stakingresfixy");
            // fuck this shit, somehow it is not working, fuck all javascript and fuck react
            // let stakingtime = await kgdbc.methods.getTimeUntilStakingDone22().call({ from: this.state.account }); // await kgdbc.methods.getTimeUntilStakingDone().call({ from: this.state.account });
            let stakingtime = [0,0];
            // console.log("stakingres: ", stakingres);
            console.log("i will fucking set the values now to ", stakingres, stakingtime)
            this.setState({
              kgdat_stakes: stakingres[0].toString(),
              kgdat_stakeTimeRemaining: stakingtime[0].toString(),
              kgddf_stakes: stakingres[1].toString(),
              kgddf_stakeTimeRemaining: stakingtime[1].toString(),
            });
        }
      }
      }
      
    else {
      console.log("Bankcoin not deployed to this network");
    }
    if (loadCount === 4) {
      // all done so set false
      this.state.loading = false;
    }
    else {
      console.log("Error! Contract not deployed, no detected network! loadcount: ", loadCount)
    }
  }

  async Web3Mount() {
    if (window.ethereum) {
      window.web3 = new Web3(Web3.givenProvider || "http://172.24.208.1:7545");
      try {
        await window.ethereum.enable()
        // await window.ethereum.sendAsync('eth_requestAccounts');
        console.log('Web3 injected browser');
      } catch (error) {
        console.log('User denied account access');
      }
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      networkId: 0,
      balance: 0,
      kgdat: {},
      kgdat_balance: 0,
      kgddf: {},
      kgddf_balance: 0,
      kgdsc: {},
      kgdsc_balance: 0,
      kgdbc: {},
      kgdbc_balance: 0,
      loading: true,
      // stakes
      kgdat_stakes: 0,
      kgdat_stakeTimeRemaining: 0,
      kgddf_stakes: 0,
      kgddf_stakeTimeRemaining: 0,
    }
    this.Web3Mount();
    this.LoadBlockchainData();
    this.state.loading = false;
    // somehow staking cant be set, wtf, but do it here


  }

  // logic for buying seedcoin with eth
  async buyForEth(amount) {
    this.state.loading = true;
    console.log("buyForEth called", amount);
    await this.state.kgdbc.methods.buyForETH().send({ from: this.state.account, value: amount });
    await this.LoadBlockchainData(); // udpate
    this.state.loading = false;
    window.location.reload(false);
  }

  async setSeedingTime() {
    this.state.loading = true;
    console.log("setSeedingTime called");
    let stakingtime = await this.state.kgdbc.methods.getTimeUntilStakingDone().call({ from: this.state.account });
    this.setState({
      kgdat_stakeTimeRemaining: stakingtime[0].toString(),
      kgddf_stakeTimeRemaining: stakingtime[1].toString(),
    });
    this.state.loading = false;
    window.location.reload(false);
  }

  async plantSeeds(amount, coinType) {
    console.log("plantSeeds called", amount, coinType);
    this.state.loading = true;
    try {
      if (coinType === "kgdat") {
        // first approve
        await this.state.kgdsc.methods.approve(this.state.kgdbc.options.address, amount).send({ from: this.state.account });
        await this.state.kgdbc.methods.plantSeeds(amount, 0).send({ from: this.state.account });
      }
      else if (coinType === "kgddf") {
        await this.state.kgdsc.methods.approve(this.state.kgdbc.options.address, amount).send({ from: this.state.account });
        await this.state.kgdbc.methods.plantSeeds(amount, 1).send({ from: this.state.account });
      }
      await this.LoadBlockchainData(); // udpate
      this.state.loading = false;
      window.location.reload(false);
    }
    catch (error) {
      console.log("error in plant seeds function: ", error);
    }
  }

  async harvestAll() {
    this.state.loading = true;
    await this.state.kgdbc.methods.harvestAll().send({ from: this.state.account });
    await this.LoadBlockchainData(); // udpate
    this.state.loading = false;
    window.location.reload(false);
  }

  render() {
  if (this.state.loading) {
    return <p>loading...</p>
  }

  return (
    <div className="App">
    <nav class="navbar navbar-inverse">
      <div class="container-fluid">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>                        
          </button>
          <a class="navbar-brand" href="https://google.com">Logo</a>
        </div>
        <div class="collapse navbar-collapse" id="myNavbar">
          <ul class="nav navbar-nav">
            <li class="active"><a href="https://google.com">Home</a></li>
            <li><a href="https://google.com">About</a></li>
            <li><a href="https://google.com">Projects</a></li>
            <li><a href="https://google.com">Contact</a></li>
          </ul>
          <ul class="nav navbar-nav navbar-right">
            <li><a href="https://google.com"><span class="glyphicon glyphicon-log-in"></span> Login</a></li>
          </ul>
        </div>
      </div>
    </nav>
      
    <div class="container-fluid text-center">    
      <div class="row content">
        <div class="col-sm-2 sidenav">
          <p><a href="https://google.com">Link</a></p>
          <p><a href="https://google.com">Link</a></p>
          <p><a href="https://google.com">Link</a></p>
        </div>
        <div class="col-sm-8 text-left"> 
          <h1>Welcome</h1>
          <p>
          Current network id is: {this.state.networkId}
        </p>
        <p>
          Still loading? {this.state.loading ? "Yes" : "No"}
        </p>
        </div>
        </div>
        
        <div class="col-sm-8 content text-left">

        <table class= "table table-striped table-dark text-left">
          <tbody>
            <tr>
              <td>Account:</td>
              <td>{this.state.account}</td>
            </tr>
            <tr>
              <td>Balance of native coin:</td>
              <td>{ this.state.balance }</td>
            </tr>
            <tr>
              <td>Balance of KingdomAttackCoin:</td>
              <td>{this.state.kgdat_balance}</td>
            </tr>
            <tr>
              <td>Balance of KingdomDefenseCoin:</td>
              <td>{this.state.kgddf_balance}</td>
            </tr>
            <tr>
              <td>Balance of KingdomSeedCoin:</td>
              <td>{this.state.kgdsc_balance}</td>
            </tr>
            <tr>
              <td>Nr of titles owned:</td>
              <td>{this.state.kgdbc_balance}</td>
            </tr>
            <tr>
              <td>update time remaining for seedcoin harvest</td>
                <td>
                  <form onSubmit={(event) => {
                    event.preventDefault()
                    // let amount = event.target.amount.value
                    this.setSeedingTime()
                  }}>
                  <button type="submit">Update Harvest Time</button>
                </form>
              </td>
            </tr>
            <tr>
              <td>Stakes of KingdomAttackCoin:</td>
              <td>{this.state.kgdat_stakes}, time remaining (s): { this.state.kgdat_stakeTimeRemaining } </td>
            </tr>
            <tr>
              <td>Stakes of KingdomDefenseCoin:</td>
              <td>{this.state.kgddf_stakes}, time remaining (s): { this.state.kgddf_stakeTimeRemaining } </td>
            </tr>
            
          </tbody>
        </table>


          <h3>Buy KingdomSeedcoins for Ether</h3>

          <p>Kaufe Coins für ETH du spasst</p>

          <form onSubmit={(event) => {
                  event.preventDefault()
                  let amount = event.target.amount.value
                  this.buyForEth(amount)
                }}
                >
                  <input name="amount" type="text" placeholder="Amount of Kingdom Seed Coins to buy" />
                  <button type="submit">Buy Kingdom Seed Coins</button>
                </form>
          </div>

          <div class="col-sm-8 content text-left">
            <h2>Seeding</h2>
          </div>

          <div class="col-sm-8 content text-left">
            <h3>Stake KingdomSeedcoins for KingdomAttackCoin</h3>
            <p>whatever</p>
            <form onSubmit={(event) => {
                    event.preventDefault()
                    let amount = event.target.amount.value
                    this.plantSeeds(amount, "kgdat")
                  }}
                  >
                    <input name="amount" type="text" placeholder="Amount of Seedcoin to plant" />
                    <button type="submit">Seed for Kingdom Attack Coins</button>
            </form>
          </div>

          <div class="col-sm-8 content text-left">
            <h3>Stake KingdomSeedcoins for KingdomDefenseCoin</h3>
            <p>whatever</p>
            <form onSubmit={(event) => {
                    event.preventDefault()
                    let amount = event.target.amount.value
                    this.plantSeeds(amount, "kgddf")
                  }}
                  >
                    <input name="amount" type="text" placeholder="Amount of Seedcoin to plant" />
                    <button type="submit">Seed for Kingdom Defense Coins</button>
            </form>
          </div>

          <div class="col-sm-8 content text-left">
            <h2>Harvesting</h2>
          </div>

          <div class="col-sm-8 content text-left">
            <h3>Harvest all</h3>
            <p>Harvest all available</p>
            <form onSubmit={(event) => {
                    event.preventDefault()
                    // let amount = event.target.amount.value
                    this.harvestAll()
                  }}
                  >
                    <button type="submit">Harvest all</button>
            </form>
          </div>
          


        
        <div class="col-sm-2 sidenav">
          <div class="well">
            <p>ADS</p>
          </div>
          <div class="well">
            <p>ADS</p>
          </div>
        </div>
      </div>

    </div>
  )
}
}

export default App;
