const MinerOnPolygon = artifacts.require("./ChildERC20.sol");

module.exports = async function(deployer) {
    deployer.deploy(
        MinerOnPolygon,
        "Miner",
        "MINER",
        18,
        "0xb5505a6d998549090530911180f38aC5130101c6"
    );
};
