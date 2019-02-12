pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./SafeMath.sol";

contract DappTokenSale {

  address payable admin;
  DappToken public tokenContract;
  using SafeMath for uint256;
  uint256 public tokenPrice;
  uint256 public tokensSold;

  event Sell(
    address _buyer,
    uint256 _amount
    );

  constructor(DappToken _tokenContract, uint256 _tokenPrice) public {
    admin = msg.sender;
    tokenContract = _tokenContract;
    tokenPrice = _tokenPrice;
  }

  function buyTokens(uint _numberOfTokens) public payable {
    require(msg.value == _numberOfTokens.mul(tokenPrice));
    //require(_numberOfTokens <= tokenContract.balanceOf(address(this)));
    tokensSold += _numberOfTokens;
    require(tokenContract.transfer(msg.sender, _numberOfTokens));
    // Trigger sell event
    emit Sell(msg.sender, _numberOfTokens);
  }

  function endSale() public {
    require(msg.sender == admin);
    tokenContract.transfer(msg.sender, tokenContract.balanceOf(address(this)));
    selfdestruct(admin);
  }

}
