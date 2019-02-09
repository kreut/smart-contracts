pragma solidity ^0.5.0;

contract DappToken {
  uint public totalSupply;
  string public name;
  string public symbol;
  string public standard;

  mapping(address => uint) public balanceOf;

  event Transfer(
    address indexed _from,
    address indexed _to,
    uint _value
    );

  constructor(uint _initialSupply) public {
    name = "Dapp Token";
    symbol = "DAPP";
    standard = "DAPP Token version v1.0";

    totalSupply = _initialSupply;
    balanceOf[msg.sender] = totalSupply;
  }

  function transfer(address _to, uint256 _value) public returns (bool success) {
    require(balanceOf[msg.sender] >= _value, "not enough tokens to transfer");

    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;

    emit Transfer(msg.sender, _to, _value);

    return true;
    }


}
