
const Miner = artifacts.require("./Miner.sol");
const Treasury = artifacts.require("./Treasury.sol");
const MinerSale = artifacts.require("./MinerSale.sol");

module.exports = async function(deployer) {
    await deployer.deploy(Miner);

    const miner = await Miner.deployed();
    await deployer.deploy(Treasury, miner.address);

    const treasury = await Treasury.deployed();
    await miner.setMinter(treasury.address);

    await deployer.deploy(MinerSale, miner.address);
}
