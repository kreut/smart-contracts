var DappToken = artifacts.require("./DappToken.sol");

contract("DappToken", accounts => {
  it("sets the total supply upon deployment", async () =>
    {
      let tokenInstance = await DappToken.deployed();
      let totalSupply = await tokenInstance.totalSupply();
      assert.equal(1000000,totalSupply.toNumber(), "it correctly");
    });
});
