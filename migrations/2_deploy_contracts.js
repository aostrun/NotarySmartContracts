var Notary = artifacts.require("./notary_contract.sol");

module.exports = function(deployer) {
  deployer.deploy(Notary);
};
