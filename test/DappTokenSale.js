const truffleAssert = require('truffle-assertions');

var DappTokenSale = artifacts.require("./DappTokenSale.sol");
var DappToken = artifacts.require("./DappToken.sol");

contract('DappTokenSale', accounts => {

  let tokenSaleInstance;
  let tokenInstance;
  let admin = accounts[0];
  let buyer = accounts[1];
  let tokenPrice = 1000000000000000; // in wei
  let tokensAvailable = 750000;
  let tokensTranferred = 250000;
  let numberOfTokens = 10;
  let value = numberOfTokens * tokenPrice;

    beforeEach('setup contract for each test', async () => {
      tokenSaleInstance = await DappTokenSale.deployed();
      tokenInstance = await DappToken.deployed();
    });

  it('initializes with the correct values', async () => {
    let address = await tokenSaleInstance.address;
    assert.notEqual(address, 0x0, 'has contract address');

    address = await tokenSaleInstance.tokenContract();
    assert.notEqual(address, 0x0, 'has token contract address');

    let price = await tokenSaleInstance.tokenPrice();
    assert.equal(price, tokenPrice, 'token price is correct');
  });

  it('facilitates token buying', async () => {
    await tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin});

    let receipt = await tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: value});

    let amount = await tokenSaleInstance.tokensSold();
    assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');

    let balance = await tokenInstance.balanceOf(tokenSaleInstance.address);
    assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens, 'decreases the number of tokens sold');
    await truffleAssert.reverts(
          //buy for a different value
          tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: value * 2}),
            truffleAssert.ErrorType.REVERT,
            "buy for the incorrect value"
      );


    /** This revert doesn't work!  Get rid of the other revert and the revert in the test to see why..
  await truffleAssert.reverts(
          tokenSaleInstance.buyTokens(5000000000000000000, { from: buyer, value: value}),
            truffleAssert.ErrorType.REVERT,
            "buy more tokens than are available"
      );
          console.log(tokensAvailable);
     **/
     truffleAssert.eventEmitted(receipt, 'Sell', (ev) => {
       assert.equal(ev._buyer, buyer, "logs the account that purhcased the tokens");
       assert.equal(ev._amount, numberOfTokens, "logs the number of tokens purchased");
       return true;//just checks that an event occurred
    });
  });

  it('ends token sale', async () => {
    await truffleAssert.reverts(
          //buy for a different value
          tokenSaleInstance.endSale({ from: buyer }),
            truffleAssert.ErrorType.REVERT,
            "must be admin to end the sale"
      );

    await tokenSaleInstance.endSale({ from: admin });
    balance = await tokenInstance.balanceOf(admin);
    totalSupply = await tokenInstance.totalSupply();
    assert.equal(balance.toNumber(), totalSupply - numberOfTokens, 'returns remaining tokens to admin');

    try {
      let price = await tokenSaleInstance.tokenPrice();
      assert(false, 'the contract was not destroyed');
    } catch(err) {
      assert(err.message.indexOf('not a contract address') > -1, 'it destroys the contract');
  }
  });
});
