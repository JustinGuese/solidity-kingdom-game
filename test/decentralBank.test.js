const helper = require("../helpers/truffletimetravel");


const KGDSC = artifacts.require("KingdomSeedCoin");
const KGDAT = artifacts.require("KingdomAttackCoin");
const KGDDF = artifacts.require("KingdomDefenseCoin");
// next one actually contains KingdomBank, KingdomTItles and KingdomGameMechanics
const KB = artifacts.require("KingdomGameMechanic");

require("chai")
.use(require("chai-as-promised"))
.should();

async function tryCatch(promise, message) {
    try {
        await promise;
        throw null;
    }
    catch (error) {
        assert(error, "Expected an error but did not get one");
        assert(error.message.startsWith(PREFIX + message), "Expected an error starting with '" + PREFIX + message + "' but got '" + error.message + "' instead");
    }
};

contract("KingdomBank", (accounts) => {
    let kgdsc, kgdat, kgddf, kb;

    before(async () => {
        kgdsc = await KGDSC.new();
        kgdat = await KGDAT.new();
        kgddf = await KGDDF.new();
        kb = await KB.new(kgdsc.address, kgdat.address, kgddf.address);
        // transfer all tokens to decentralbank
        await kgdsc.transfer(kb.address, "1000000000000000000000000", {from: accounts[0]});
        await kgdat.transfer(kb.address, "1000000000000000000000000", {from: accounts[0]});
        await kgddf.transfer(kb.address, "1000000000000000000000000", {from: accounts[0]});
    });

    // check name of shitty coin
    describe("KingdomSeeds Deployment", async () => {
        it("matches name successfully", async () => {
            const name = await kgdsc.name();
            name.should.equal("KingdomSeeds");
        });
    });
    describe("Kingdom Attack Coins Deployment", async () => {
        it("matches name successfully", async () => {
            const name = await kgdat.name();
            name.should.equal("Kingdom Attack Coins");
        });
    });
    describe("Kingdom Defense Coins Deployment", async () => {
        it("matches name successfully", async () => {
            const name = await kgddf.name();
            name.should.equal("Kingdom Defense Coins");
        });
    });
    // check balance
    describe("KingdomBank Deployment", async () => {
        it("matches name successfully", async() => {
            const name = await kb.name();
            // console.log("bankname is: ",name);
            name.should.equal("Kingdom Titles");
        });
        it("contract has kgdsc", async () => {
            let balance = await kgdsc.balanceOf(kb.address);
            balance = balance.toString();
            balance.should.equal("1000000000000000000000000");
        });
        it("contract has kgdat", async () => {
            let balance = await kgdat.balanceOf(kb.address);
            balance = balance.toString();
            balance.should.equal("1000000000000000000000000");
        });
        it("contract has kgddf", async () => {
            let balance = await kgddf.balanceOf(kb.address);
            balance = balance.toString();
            balance.should.equal("1000000000000000000000000");
        });
        it("NFT check, supply etc", async () => {
            let totalSupply = await kb.totalSupply();
            totalSupply = totalSupply.toString();
            totalSupply.should.equal("10000");
        });

    });

    // buy some kgdsc with account[1]
    describe("buy KGDSC for ETH, and stake it for KGDAT and KGDDF", async () => {
        it("should not have any KGDSC before purchase", async() => {
            let balance = await kgdsc.balanceOf(accounts[1]);
            balance = balance.toString();
            balance.should.equal("0");
        });
        it("should not have any kgdat before purchase", async() => {
            let balance = await kgdat.balanceOf(accounts[1]);
            balance = balance.toString();
            balance.should.equal("0");
        });
        it("should not have any kgddf before purchase", async() => {
            let balance = await kgddf.balanceOf(accounts[1]);
            balance = balance.toString();
            balance.should.equal("0");
        });

        it("should buy kgdsc successfully with eth", async() => {
            let ethbal_prev = await web3.eth.getBalance(accounts[1]);
            ethbal_prev_expected = ethbal_prev - new web3.utils.BN(web3.utils.toWei("1", "ether"));
            ethbal_prev_expected = Number(web3.utils.fromWei(ethbal_prev_expected.toString()));
            // console.log("ethbal current",ethbal_prev ,"ethbal_prev_expected: ", ethbal_prev_expected);
            // await fails somehow
            res = await kb.buyForETH({from: accounts[1], value: new web3.utils.BN(web3.utils.toWei("1", "ether"))});
            let ethbal = await web3.eth.getBalance(accounts[1]);
            ethbal = Number(web3.utils.fromWei(ethbal.toString()));
            // little less bc gas fee
            ethbal.should.lessThan(ethbal_prev_expected);

            // now check balance of kgdsc
            let balance = await kgdsc.balanceOf(accounts[1]);
            balance = balance.toString();
            // 100 bc our multiplier for purchased eth is 100
            balance.should.equal(web3.utils.toWei("100", "ether"));
        });

        it("should be possible to stake these bought coins for attackcoins", async() => {
            let prev_balance = await kgdsc.balanceOf(accounts[1]);
            prev_balance = prev_balance.toString();
            // stake 75% of seecoins
            // first we need to allow the contract to transfer the tokens
            await kgdsc.approve(kb.address, web3.utils.toWei("100", "ether"), {from: accounts[1]});
            // first plant for attackcoins
            let res = await kb.plantSeeds(web3.utils.toWei("75", "ether"), 0, {from: accounts[1]});
            // and some defensepoints
            res = await kb.plantSeeds(web3.utils.toWei("5", "ether"), 1, {from: accounts[1]});
            let balance = await kgdsc.balanceOf(accounts[1]);
            balance = balance.toString();
            // 75% of seecoins should be staked
            balance.should.equal(web3.utils.toWei("20", "ether"));
        });

        it("should not be possible to unstake before time if over", async() => {
            let res = await kb.harvestAll({from: accounts[1]});
            res = await kb.getCurrentStakes({from: accounts[1]});
            let attackPoints = res[0].toString();
            let defensePoints = res[1].toString();
            attackPoints.should.equal(web3.utils.toWei("75", "ether"));
            defensePoints.should.equal(web3.utils.toWei("5", "ether"));
            // check remaining time
            let remTime = await kb.getTimeUntilStakingDone({from: accounts[1]});
            let attackRemTime = remTime[0];
            let defenseRemTime = remTime[1];
            attackRemTime.should.not.equal(0);
            defenseRemTime.should.not.equal(0);

            // console.log("in staking: attackpoints/defensepoints", attackPoints, defensePoints);
            // and finally check if balance is still correct
            let balance = await kgdsc.balanceOf(accounts[1]);
            balance = balance.toString();
            balance.should.equal(web3.utils.toWei("20", "ether"));
            // also if attackpoints are not prematurely harvested
            balance = await kgdat.balanceOf(accounts[1]);
            balance = balance.toString();
            balance.should.equal("0");
            // same for def points
            balance = await kgddf.balanceOf(accounts[1]);
            balance = balance.toString();
            balance.should.equal("0");
        });

        it("should be possible to unstake after time ", async() => {
            // forward time 60 seconds 
            helper.advanceTimeAndBlock(61);

            let res = await kb.harvestAll({from: accounts[1]});
            res = await kb.getCurrentStakes({from: accounts[1]});
            let attackPoints = res[0].toString();
            let defensePoints = res[1].toString();
            attackPoints.should.equal("0");
            defensePoints.should.equal("0");
            // check remaining time
            let remTime = await kb.getTimeUntilStakingDone({from: accounts[1]});
            let attackRemTime = remTime[0].toString();
            let defenseRemTime = remTime[1].toString();
            attackRemTime.should.equal("0");
            defenseRemTime.should.equal("0");

            // check how many seedcoins we have returned
            let balance_seed = await kgdsc.balanceOf(accounts[1]);
            let balance_attack = await kgdat.balanceOf(accounts[1]);
            let balance_defense = await kgddf.balanceOf(accounts[1]);
            balance_seed = balance_seed.toString();
            balance_attack = balance_attack.toString();
            balance_defense = balance_defense.toString();
            // console.log("balances of coinds seed/attack/def", web3.utils.fromWei(balance_seed.toString()), web3.utils.fromWei(balance_attack.toString()), web3.utils.fromWei(balance_defense.toString()));
            // should have 75 eth * .9 = 67.5 eth returned, plus the 25 we still have = 92.5 eth
            balance_seed.should.equal(web3.utils.toWei("92", "ether"));
            balance_attack.should.equal(web3.utils.toWei("7.5", "ether"));
            balance_defense.should.equal(web3.utils.toWei("0.625", "ether"));
        });
    });

    describe("NFT ownership check", async () => {

        it("should be possible to check balance of NFTs", async() => {
            let nrNfts = await kb.balanceOf(accounts[0]);
            nrNfts = nrNfts.toString();
            nrNfts.should.equal("0");

            nrNfts = await kb.balanceOf(kb.address);
            nrNfts = nrNfts.toString();
            nrNfts.should.equal("0");
        });
    });

    describe("NFT title checks", async () => {
        it("should be possible to award an NFC, but only for owner", async() => {
            
            // there should be no nfc yet
            let pos = await kb.currentPosition();
            pos = pos.toString();
            pos.should.equal("0");

            // should work
            await kb.awardItem(accounts[1], {from: accounts[0]});
            pos = await kb.currentPosition();
            pos = pos.toString();
            pos.should.equal("1");

            // owner of check
            // starting at 1 the count
            let own = await kb.ownerOf(1);
            own.should.equal(accounts[1]);
        });
        it("should fail: assign nft as non-owner", async() => {
            const ERROR_MSG = 'VM Exception while processing transaction: revert fook off -- Reason given: fook off.';
            
            // should fail
            await kb.awardItem(accounts[1], {from: accounts[1]}).should.be.rejectedWith(ERROR_MSG);;
        });

    });

    describe("NFT should be able to be reversed by contract, e.g. winning mechanism", async () => {
        it("just grab first item and reverse it to contract address", async() => {
            let pos = await kb.currentPosition();
            pos = pos.toString();
            // checks if accounts[1] still owns that damn niftie
            pos.should.equal("1");
            let owner = await kb.ownerOf(1);
            owner.should.equal(accounts[1]);

            // now reverse it
            await kb.reverseItem(1, {from: accounts[0]});
            owner = await kb.ownerOf(1);
            owner.should.equal(kb.address);

            // other reverse ownerships should fail
            let ERROR_MSG = "Returned error: VM Exception while processing transaction: revert fook off -- Reason given: fook off.";
            await kb.reverseItem(1, {from: accounts[3]}).should.be.rejectedWith(ERROR_MSG);
        });

        // it("should only be possible to assign totalsupply (10000) nfts", async() => {
        //     for (let i = 0; i < 10000; i++) {
        //         await kb.awardItem(accounts[1], {from: accounts[0]});
        //     }
        // });
    });

    // now game mechanic tests
    describe("Game mechanics - setup", async () => {
        it("first assign some attack and defense points to acc 2", async() => {
            // let acc 2 farm some attack and defense points
            const ERROR_NO_SEEDS = "VM Exception while processing transaction: revert you don't have enough seedcoins! buy or trade some -- Reason given: you don't have enough seedcoins! buy or trade some.";
            await kb.plantSeeds(web3.utils.toWei("5", "ether"), 0, {from: accounts[2]}).should.be.rejectedWith(ERROR_NO_SEEDS);

            // buy seed coins
            await kb.buyForETH({from: accounts[2], value: web3.utils.toWei("5", "ether")});
            let seedbal = await kgdsc.balanceOf(accounts[2]);
            seedbal = seedbal.toString();
            seedbal.should.equal(web3.utils.toWei("500", "ether"));

            // plant them
            // first approve
            await kgdsc.approve(kb.address, web3.utils.toWei("500", "ether"), {from: accounts[2]});
            await kb.plantSeeds(web3.utils.toWei("300", "ether"), 0, {from: accounts[2]})
            await kb.plantSeeds(web3.utils.toWei("200", "ether"), 1, {from: accounts[2]})

            // now seeds should be 0
            seedbal = await kgdsc.balanceOf(accounts[2]);
            seedbal = seedbal.toString();
            seedbal.should.equal(web3.utils.toWei("0", "ether"));

            // let it grow
            helper.advanceTimeAndBlock(61);

            // harvest
            await kb.harvestAll({from: accounts[2]});

            // check if amount is right
            let acc2_attack = await kgdat.balanceOf(accounts[2]);
            let acc2_defense = await kgddf.balanceOf(accounts[2]);
            let acc2_seeds = await kgdsc.balanceOf(accounts[2]);
            // console.log("attack/def/seeds acc2 : ", web3.utils.fromWei(acc2_attack.toString()), web3.utils.fromWei(acc2_defense.toString()), web3.utils.fromWei(acc2_seeds.toString()));
            acc2_attack = acc2_attack.toString();
            acc2_defense = acc2_defense.toString();
            acc2_seeds = acc2_seeds.toString();
            acc2_attack.should.equal(web3.utils.toWei("30", "ether"));
            acc2_defense.should.equal(web3.utils.toWei("25", "ether"));
            acc2_seeds.should.equal(web3.utils.toWei("450", "ether"));

            let acc1_attack = await kgdat.balanceOf(accounts[1]);
            let acc1_defense = await kgddf.balanceOf(accounts[1]);
            let acc1_seeds = await kgdsc.balanceOf(accounts[1]);
            // console.log("acc1_attack/defense", web3.utils.fromWei(acc1_attack.toString()), web3.utils.fromWei(acc1_defense.toString()), web3.utils.fromWei(acc1_seeds.toString()));
            acc1_attack = acc1_attack.toString();
            acc1_defense = acc1_defense.toString();
            acc1_seeds = acc1_seeds.toString();
            acc1_attack.should.equal(web3.utils.toWei("7.5", "ether"));
            acc1_defense.should.equal(web3.utils.toWei("0.625", "ether"));
            acc1_seeds.should.equal(web3.utils.toWei("92", "ether"));
        });

        it("next assign them some nifties", async() => {
            await kb.awardItem(accounts[2], {from: accounts[0]});
            await kb.awardItem(accounts[1], {from: accounts[0]});
            await kb.awardItem(accounts[3], {from: accounts[0]});
            await kb.awardItem(accounts[1], {from: accounts[0]});

            let balacc1 = await kb.balanceOf(accounts[1]);
            let balacc2 = await kb.balanceOf(accounts[2]);

            // console.log(balacc1.toString(), balacc2.toString());
            balacc1.toString().should.equal("2");
            balacc2.toString().should.equal("1");

            // let own1 = await kb.ownerOf(1);
            // let own2 = await kb.ownerOf(2);
            // let own3 = await kb.ownerOf(3);
            // let own4 = await kb.ownerOf(4);
            // own1.should.equal()

        });

        it("servant checks", async() => {
            // neighbor and parent check
            let n = await kb.getServants(1);
            let left = n[0].toString();
            let right = n[1].toString(); 
            left.should.equal("2");
            right.should.equal("3");

            n = await kb.getServants(3);
            left = n[0].toString();
            right = n[1].toString();
            left.should.equal("0");
            right.should.equal("0"); // bc not assigned yet

            // next get neighbors of not assigned yet
            const ERR_NOTASS = "VM Exception while processing transaction: revert id is not yet assigned";
            n = await kb.getServants(30).should.be.rejectedWith(ERR_NOTASS);
        });

        it("boss check", async() => {
            let boss = await kb.getBoss(1);
            boss.toString().should.equal("0");

            boss = await kb.getBoss(4);
            boss.toString().should.equal("2");
        });

    });

    describe("Game Mechanics - attack and sacking",  async() => {

        it("transfer attack and defensepoints to a title", async() => {
            // account 2 and 3 will play against each other, with 3 and title 4 being the child of 2

            // first to own title
            // 1 is owned by contract due to test
            // check what acc 1 owns
            // acc1 owns 0,3,5
            // acc2 owns 2
            // let idsOfAcc1 = await kb.returnIdsOfAddress(accounts[0]);
            // console.log("acc 0 owns the ids: ", idsOfAcc1);
            // idsOfAcc1 = await kb.returnIdsOfAddress(accounts[1]);
            // console.log("acc 1 owns the ids: ", idsOfAcc1);
            // idsOfAcc1 = await kb.returnIdsOfAddress(accounts[2]);
            // console.log("acc 2 owns the ids: ", idsOfAcc1);

            let own = await kb.ownerOf(2);
            // console.log(own, accounts)
            own.should.equal(accounts[2]);
            // also check if 5 is belonging to acc 1
            own = await kb.ownerOf(5);
            own.should.equal(accounts[1]);

            // approve
            await kgdat.approve(kb.address,web3.utils.toWei("1", "ether"), {from: accounts[2]});
            await kgddf.approve(kb.address,web3.utils.toWei(".6", "ether"), {from: accounts[2]});
            // deposit
            await kb.assignMilitaryToTitle(web3.utils.toWei("1", "ether"), 2, 0, {from: accounts[2]});
            await kb.assignMilitaryToTitle(web3.utils.toWei(".6", "ether"), 2, 1, {from: accounts[2]});
            // check if transaction worked
            let acc1_attack = await kgdat.balanceOf(accounts[2]);
            let acc1_def = await kgddf.balanceOf(accounts[2]);
            acc1_attack = acc1_attack.toString();
            acc1_def = acc1_def.toString();
            acc1_attack.should.equal(web3.utils.toWei("29", "ether"));
            acc1_def.should.equal(web3.utils.toWei("24.4", "ether"));

            // alseo check if the right amount had been signed 
            let res = await kb.getTitleStats(2);
            let attack = res[0].toString();
            let def = res[1].toString();
            let read = res[2];
            attack.should.equal(web3.utils.toWei("1", "ether"));
            def.should.equal(web3.utils.toWei(".6", "ether"));
            // read.should.equal(false);

            // console.log("now do the same for owner of title 5");

            // do the same for owner of title 5, so acc nr 1
            // approve
            await kgdat.approve(kb.address,web3.utils.toWei("1", "ether"), {from: accounts[1]});
            await kgddf.approve(kb.address,web3.utils.toWei(".6", "ether"), {from: accounts[1]});
            // deposit
            await kb.assignMilitaryToTitle(web3.utils.toWei("1", "ether"), 5, 0, {from: accounts[1]});
            await kb.assignMilitaryToTitle(web3.utils.toWei(".6", "ether"), 5, 1, {from: accounts[1]});
            // console.log(attacc2.toString(), defacc2.toString(), "balance ac 3");
            // alseo check if the right amount had been signed 
            res = await kb.getTitleStats(5);
            attack = res[0].toString();
            def = res[1].toString();
            read = res[2];
            attack.should.equal(web3.utils.toWei("1", "ether"));
            def.should.equal(web3.utils.toWei(".6", "ether"));
            // read.should.equal(false);
        });

        it("should work to attack", async() => {
            // chegg befgore
            let five = await kb.getTitleStats(5);
            let attack5bef = five[0].toString();
            let def5bef = five[1].toString();
            let read5bef = five[2];
            console.log("before stats for tile 5: ", attack5bef, def5bef, read5bef);
            let two = await kb.getTitleStats(2);
            let attack2bef = two[0].toString();
            let def2bef = two[1].toString();
            let read2bef = two[2];
            console.log("before stats for tile 2: ", attack2bef, def2bef, read2bef);

            // acc1 owns 0,3,5
            // acc2 owns 2
            // meaning 5 will attack 2
            let ERR_NOTASS = "VM Exception while processing transaction: revert you need to call setApprovalForAll in order to play a game...";
            await kb.attackBoss(5, {from: accounts[1]}).should.be.rejectedWith(ERR_NOTASS);

            await kb.setApprovalForAll(kb.address, true, {from: accounts[1]});

            ERR_NOTASS = "VM Exception while processing transaction: revert your boss needs to setApprovedForAll to this contract, otherwise the mechanism does not work. He only earns money if that approval has been set though.";
            await kb.attackBoss(5, {from: accounts[1]}).should.be.rejectedWith(ERR_NOTASS);

            await kb.setApprovalForAll(kb.address, true, {from: accounts[2]});

            await kb.attackBoss(5, {from: accounts[1]})

            // check title stacks
            five = await kb.getTitleStats(5);
            let attack5 = five[0].toString();
            let def5 = five[1].toString();
            let read5 = five[2];
            console.log("after stats for tile 5: ", attack5, def5, read5);
            two = await kb.getTitleStats(2);
            let attack2 = two[0].toString();
            let def2 = two[1].toString();
            let read2 = two[2];
            console.log("after stats for tile 2: ", attack2, def2, read2);
        });
    });

});