const Miner = artifacts.require("./Miner.sol");
const Treasury = artifacts.require("./Treasury.sol");

const mkdirp = require('mkdirp');
const fs = require('fs');

const saveNetworkArtifact = async function(contract, network) {
    const contractName = contract.constructor._json.contractName;
    const networksPath = "./networks/"+network;
    const contractPath = networksPath+"/"+contractName+".json";

    mkdirp.sync(networksPath);

    const artifact = {
        "contractName": contractName,
        "address": contract.address,
        "abi": contract.abi
    }

    fs.writeFileSync(contractPath, JSON.stringify(artifact, null, 2));
}

module.exports = async function(deployer) {
    const miner = await Miner.deployed();

    await deployer.deploy(Treasury, miner.address);
    const treasury = await Treasury.deployed();

    saveNetworkArtifact(treasury, deployer.network);

    await miner.setMinter(treasury.address);
}