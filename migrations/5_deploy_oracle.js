const { getIssuance, saveNetworkArtifact } = require("../lib/deployer");

const MinerOracle = artifacts.require("./MinerOracle.sol");
const PriceFeedETH = artifacts.require("./PriceFeedETH.sol");
const PriceFeedTestToken = artifacts.require("./PriceFeedTestToken.sol");
const EthSwap = artifacts.require("./EthSwap.sol");
const TokenSwap = artifacts.require("./TokenSwap.sol");
const TestToken = artifacts.require("./TestToken.sol");

module.exports = async function(deployer, network) {
    let priceFeedETHAddress = process.env.CHAINLINK_PRICE_FEED_ETH;

    await deployer.deploy(MinerOracle);
    const oracle = await MinerOracle.deployed();
    const issuance = await getIssuance(network);

    // if development, deploy the mock price feed.
    if (network === "development" || network == "test") {
        await deployer.deploy(PriceFeedETH);
        const priceFeedEth = await PriceFeedETH.deployed();
        priceFeedETHAddress = priceFeedEth.address;

        await deployer.deploy(PriceFeedTestToken);
        const priceFeedTestToken = await PriceFeedTestToken.deployed();

        await deployer.deploy(TestToken);
        const testToken = await TestToken.deployed();

        saveNetworkArtifact(priceFeedEth, deployer.network);
        saveNetworkArtifact(priceFeedTestToken, deployer.network);
        saveNetworkArtifact(testToken, deployer.network);

        await oracle.setExchangeRate("USD", 1.50*10**8);
    }

    const ethSwap = await deployer.deploy(
        EthSwap,
        oracle.address,
        priceFeedETHAddress,
        issuance.address);

    const tokenSwap = await deployer.deploy(
        TokenSwap,
        oracle.address,
        issuance.address);

    if (network === "development") {
        const priceFeedTestToken = await PriceFeedTestToken.deployed();
        const testToken = await TestToken.deployed();

        tokenSwap.registerSwap(priceFeedTestToken.address, testToken.address);
    }

    await issuance.addIssuer(ethSwap.address);
    await issuance.addIssuer(tokenSwap.address);

    saveNetworkArtifact(ethSwap, deployer.network);
    saveNetworkArtifact(tokenSwap, deployer.network);
    saveNetworkArtifact(oracle, deployer.network);
}