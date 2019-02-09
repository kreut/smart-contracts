var DappToken = artifacts.require("./DappToken.sol");

contract("DappToken", accounts => {
  let tokenInstance;
    beforeEach('setup contract for each test', async function () {
        tokenInstance = await DappToken.deployed();
    });

  it("initializes the contract with the correct values", async () =>{
    let name = await tokenInstance.name();
    assert.equal("Dapp Token", name, "it returns the correct name");

    let symbol = await tokenInstance.symbol();
    assert.equal("DAPP", symbol, "it returns the correct symbol");

    let standard = await tokenInstance.standard();
    assert.equal("DAPP Token version v1.0", standard, "it returns the correct standard");
  });

  it("allocates initial amount to 1,000,000", async () =>
    {
      let totalSupply = await tokenInstance.totalSupply();
      assert.equal(1000000, totalSupply.toNumber(), "it correctly set the total supply to 1,000,000");

      let adminBalance = await tokenInstance.balanceOf(accounts[0]);
      assert.equal(1000000, adminBalance.toNumber(), "it correctly gives the admin the initial supply");
    });

  it("transfers token ownership", async () => {
    let success = await tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0]});
    assert.equal(success, true, 'it returns true');

    try {
      await tokenInstance.transfer.call(accounts[1], 1000000000);
    } catch(error) {
      assert(error.message.indexOf('not enough tokens to transfer') >=0, 'not enough tokens to transfer');
    }
    let receipt = await tokenInstance.transfer(accounts[1], 250000, {from: accounts[0]});
    assert.equal(receipt.logs.length, 1, 'triggers one event');
    assert.equal(receipt.logs[0].event, 'Transfer', 'triggers the transfer event');
    assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account where the tokens are transferred from');
    assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account where the tokens are transferred from');
    assert.equal(receipt.logs[0].args._value.toNumber(), 250000, 'logs the value transferred');

    let balance_1 = await tokenInstance.balanceOf(accounts[1]);
    let balance_0 = await tokenInstance.balanceOf(accounts[0]);

    assert.equal(balance_1.toNumber(), 250000, "adds the amount to new account");
    assert.equal(balance_0.toNumber(), 750000, "subtracts the amount from the old account");
  });

});
