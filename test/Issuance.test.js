const { BN, constants, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const { ZERO_ADDRESS } = constants;

const Miner = artifacts.require("Miner");
const Issuance = artifacts.require("Issuance");

contract("Issuance", function(accounts) {
    const OWNER = accounts[0];
    const OWNER_2 = accounts[1];
    const OWNER_3 = accounts[2];

    const ALICE = accounts[3];
    const BOB = accounts[4];

    let miner, issuance;

    const decimals = new BN("4");
    const supply = new BN("1000000").mul(new BN("10").pow(decimals));

    beforeEach(async () => {
        miner = await Miner.new();
        issuance = await Issuance.new(miner.address);
        await miner.setMinter(OWNER);
    });

    it("should fund the token issuance", async () => {
        let amount = new BN(12345);
        await miner.mint(amount);
        await miner.transfer(issuance.address, amount);

        let actual = new BN(await miner.balanceOf(issuance.address));

        assert.equal(
            actual.toNumber(),
            amount.toNumber(),
            "Issuance/Incorrect amount");
    });

    describe("purchasing miner", () => {
        beforeEach(async () => {
            await miner.mint(supply);
            await miner.transfer(issuance.address, supply);
        });

        it("should issue miner tokens", async () => {
            let amount = supply;
            let unitPrice = 50;

            await issuance.issue(ALICE, amount, unitPrice, "USD");

            const balance = await miner.balanceOf(ALICE);

            expect(balance.toNumber()).to.be.equal(amount.toNumber());
        });

        it("should NOT issue zero tokens", async () => {
            let amount = 0;
            let unitPrice = 50;

            await expectRevert(
                issuance.issue(ALICE, amount, unitPrice, "USD"),
                "Issuance/amount-invalid");
        });

        it("should NOT issue tokens as an invalid user", async () => {
            let amount = supply;
            let unitPrice = 50;

            await expectRevert(
                issuance.issue(ALICE, amount, unitPrice, "USD", { from: ALICE }),
                "Ownable: caller is not the owner");
        });

        it("should NOT exceed issuing more tokens than are available",
        async () => {
            let amount = supply.add(new BN(1));
            let unitPrice = 50;

            await expectRevert(
                issuance.issue(ALICE, amount, unitPrice, "USD"),
                "Issuance/balance-exceeded");
        });

        it("should NOT issue tokens as zero address", async () => {
            let amount = 0;
            let unitPrice = 50;

            await expectRevert(
                issuance.issue(ZERO_ADDRESS, amount, unitPrice, "USD"),
                "Issuance/address-invalid");
        });

        it("should get trade count", async () => {
            await issuance.issue(BOB, 100, 1500, "USD");
            await issuance.issue(BOB, 100, 1500, "USD");
            await issuance.issue(BOB, 100, 1500, "USD");

            const actual = await issuance.getHistoryCount();
            assert.equal(Number(actual), 3, "Trade count should be 3");
        });

        it("should get alice trade count", async () => {
            await issuance.issue(BOB, 100, 1500, "USD");
            await issuance.issue(ALICE, 100, 1500, "USD");
            await issuance.issue(BOB, 100, 1500, "USD");

            const actual = await issuance.getAccountTradesCount(ALICE);
            assert.equal(Number(actual), 1, "Trade count should be 1");
        });

        it("should get alice trade indexes", async () => {
            await issuance.issue(BOB, 100, 1500, "USD");
            await issuance.issue(ALICE, 100, 1500, "USD");
            await issuance.issue(ALICE, 100, 1500, "USD");
            await issuance.issue(BOB, 100, 1500, "USD");
            var trades = await issuance.getAccountTradesIndexes(ALICE);
            var tradesCount = await issuance.getAccountTradesCount(ALICE);

            assert.equal(trades.length, new BN(tradesCount), "ALICE has two trades");
        });
    });
});
