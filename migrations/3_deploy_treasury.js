const { saveNetworkArtifact, getMiner } = require("../lib/deployer");

const Miner = artifacts.require("./Miner.sol");
const Treasury = artifacts.require("./Treasury.sol");

module.exports = async function(deployer, network, accounts) {
    const miner = await getMiner(network);

    await deployer.deploy(Treasury, miner.address);
    const treasury = await Treasury.deployed();

    saveNetworkArtifact(treasury, deployer.network);

    await miner.setMinter(treasury.address);
}