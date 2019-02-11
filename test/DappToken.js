const truffleAssert = require('truffle-assertions');

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

    await truffleAssert.reverts(
          tokenInstance.transfer.call(accounts[1], 1000000000),
            truffleAssert.ErrorType.REVERT,
            "not enough tokens to transfer"
      );

    let receipt = await tokenInstance.transfer(accounts[1], 250000, {from: accounts[0]});

    truffleAssert.eventEmitted(receipt, 'Transfer', (ev) => {
      assert.equal(ev._from, accounts[0], "logs the account where the tokens are transferred from");
      assert.equal(ev._to, accounts[1], "logs the account where the tokens are transferred to");
      assert.equal(ev._value.toNumber(), 250000,"logs the value transferred");
      return true;//just checks that an event occurred
   });

    let balance_1 = await tokenInstance.balanceOf(accounts[1]);
    let balance_0 = await tokenInstance.balanceOf(accounts[0]);

    assert.equal(balance_1.toNumber(), 250000, "adds the amount to new account");
    assert.equal(balance_0.toNumber(), 750000, "subtracts the amount from the old account");
  });

  it('approved tokens for delegated transfer', async () => {
    let success = await tokenInstance.approve.call(accounts[1], 100);
    assert.equal(success, true, 'it returns true');

    let receipt = await tokenInstance.approve(accounts[1], 100, {from: accounts[0]});

    truffleAssert.eventEmitted(receipt, 'Approve', (ev) => {
      assert(ev._owner === accounts[0], "logs the account where the approval is authorized by");
      assert(ev._spender === accounts[1], "logs the account where the approval is authorized to");
      assert(ev._value.toNumber() === 100,"logs the value authorized");
      return true;//just checks that an event occurred
   });


    let allowance = await tokenInstance.allowance(accounts[0], accounts[1]);
    assert.equal(allowance.toNumber(), 100, 'stores the allowance for the delegated transfer');
  });

  it('handles delegated token transfers', async () =>
{
  let fromAccount = accounts[2];
  let toAccount = accounts[3];
  let spendingAccount = accounts[4];
  let amountAllowed = 10;
  let amountToTransfer = 10;
  let initialAmountInFromAccount = 100;

  //set up
  await tokenInstance.transfer(fromAccount, initialAmountInFromAccount, { from: accounts[0] });
  await tokenInstance.approve(spendingAccount, amountAllowed, { from: fromAccount });

  await truffleAssert.reverts(
        tokenInstance.transferFrom(fromAccount, toAccount, initialAmountInFromAccount + 1, { from: spendingAccount}),
          truffleAssert.ErrorType.REVERT,
          "transferFrom should revert due to transfering more than balance"
    );

  await truffleAssert.reverts(
        tokenInstance.transferFrom(fromAccount, toAccount, amountAllowed + 1, { from: spendingAccount}),
          truffleAssert.ErrorType.REVERT,
          "transferFrom should revert due to transfering more than allowed"
    );

  success = await tokenInstance.transferFrom.call(fromAccount, toAccount, amountToTransfer, { from: spendingAccount});
  assert(success, 'it returns boolean upon completion');

  let receipt = await tokenInstance.transferFrom(fromAccount, toAccount, amountToTransfer, { from: spendingAccount});
  truffleAssert.eventEmitted(receipt, 'Transfer', (ev) => {
    assert(ev._from === fromAccount, "correct _from in Transfer event");
    assert(ev._to === toAccount, "correct _to in Transfer event");
    assert(ev._value.toNumber() === amountToTransfer,"correct _value in Transfer event");
    return true;//just checks that an event occurred
 });

  let updatedBalanceOfFromAccount = await tokenInstance.balanceOf(fromAccount);
  assert.equal(updatedBalanceOfFromAccount.toNumber(), initialAmountInFromAccount - amountToTransfer, 'From account decreased by amount transferred');

  let updatedBalanceOfToAccount = await tokenInstance.balanceOf(toAccount);
  assert.equal(updatedBalanceOfToAccount.toNumber(), amountToTransfer, 'To account increases by the amount transferred');

  let allowance = await tokenInstance.allowance(fromAccount, spendingAccount);
  assert.equal(allowance.toNumber(), amountAllowed - amountToTransfer, 'it decreases the allowance by the amount transferred');
})

});
