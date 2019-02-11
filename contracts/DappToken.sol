pragma solidity ^0.5.0;

contract DappToken {
  uint public totalSupply;
  string public name;
  string public symbol;
  string public standard;

  mapping(address => uint) public balanceOf;
  mapping(address => mapping(address => uint256)) public allowance;

  event Transfer(
    address indexed _from,
    address indexed _to,
    uint _value
    );

  event Approve(
    address indexed _owner,
    address indexed _spender,
    uint256 _value
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

  // approve
  function approve(address _spender, uint256 _value) public returns (bool success) {

  emit Approve(msg.sender, _spender, _value);
  allowance[msg.sender][_spender] = _value;

  return true;
  }

  //transferFrom
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
    require(_value <= balanceOf[_from]); //enough tokens to transfer
    require(_value <= allowance[_from][msg.sender]);    // Require allowance is big enough

    balanceOf[_from] -= _value;
    balanceOf[_to] += _value;
    allowance[_from][msg.sender] -= _value;

    emit Transfer(_from, _to, _value);
    return true;
    // return a boolean
  }




}
