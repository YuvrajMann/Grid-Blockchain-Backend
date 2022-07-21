const Migrations = artifacts.require("ProductManager.sol");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
