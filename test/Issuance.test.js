const { BN, constants, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const { ZERO_ADDRESS } = constants;

const Miner = artifacts.require("Miner");
const Issuance = artifacts.require("Issuance");

contract("Issuance", (accounts) => {
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
        let amount = supply;
        await miner.mint(amount);
        await miner.transfer(issuance.address, amount);

        let actual = new BN(await miner.balanceOf(issuance.address));

        assert.equal(
            actual.toNumber(),
            amount.toNumber(),
            "Issuance/Incorrect amount");
    });

    describe("purchasing miner", () => {
        const unitPrice = 50;
        const currencyCode = "USD";
        const amount = new BN("100000").mul(new BN("10").pow(decimals));
        const zeroAmount = 0;

        beforeEach(async () => {
            await miner.mint(supply);
            await miner.transfer(issuance.address, supply);
        });

        it("should issue miner tokens", async () => {
            await issuance.issue(ALICE, amount, unitPrice, "USD");

            const balance = await miner.balanceOf(ALICE);

            expect(balance.toNumber()).to.be.equal(amount.toNumber());
        });

        it("should NOT issue zero tokens", async () => {
            await expectRevert(
                issuance.issue(ALICE, zeroAmount, unitPrice, "USD"),
                "Issuance/amount-invalid");
        });

        it("should NOT issue tokens as an invalid user", async () => {
            await expectRevert(
                issuance.issue(ALICE, amount, unitPrice, "USD", { from: ALICE }),
                "Ownable: caller is not the owner");
        });

        it("should NOT exceed issuing more tokens than are available",
        async () => {
            let tooMuch = supply.add(new BN(1));

            await expectRevert(
                issuance.issue(ALICE, tooMuch, unitPrice, "USD"),
                "Issuance/balance-exceeded");
        });

        it("should NOT issue tokens as zero address", async () => {
            await expectRevert(
                issuance.issue(ZERO_ADDRESS, zeroAmount, unitPrice, "USD"),
                "Issuance/address-invalid");
        });

        it("should get trade count", async () => {
            await issuance.issue(BOB, amount, unitPrice, "USD");
            await issuance.issue(BOB, amount, unitPrice, "USD");
            await issuance.issue(BOB, amount, unitPrice, "USD");

            const actual = await issuance.getHistoryCount();
            expect(Number(actual)).to.be.equal(3);
        });

        it("should get alice trade count", async () => {
            await issuance.issue(BOB, amount, unitPrice, currencyCode);
            await issuance.issue(ALICE, amount, unitPrice, currencyCode);
            await issuance.issue(BOB, amount, unitPrice, currencyCode);

            const actual = await issuance.getAccountTradesCount(ALICE);
            expect(Number(actual)).to.be.equal(1);
        });

        it("should get alice trade indexes", async () => {
            await issuance.issue(BOB, amount, unitPrice, currencyCode);
            await issuance.issue(ALICE, amount, unitPrice, currencyCode);
            await issuance.issue(ALICE, amount, unitPrice, currencyCode);
            await issuance.issue(BOB, amount, unitPrice, currencyCode);
            var trades = await issuance.getAccountTradesIndexes(ALICE);
            var tradesCount = await issuance.getAccountTradesCount(ALICE);

            expect(trades).to.have.lengthOf(tradesCount);
        });
    });
});
