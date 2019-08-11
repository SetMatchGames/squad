pragma solidity >=0.4.21 <0.6.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract AutoBond {

  constructor () public {}

  struct Bond {
    uint256 supply; // total outstanding minted units
    mapping(address => uint256) balances;
    address curve;
  }

  // mapping from definition address to it's bond
  mapping(bytes32 => Bond) public bonds;

  // newBond makes a new bond and buys the first set of units
  function newBond(address curve, bytes32 bondId, uint256 units) payable public {
    require(curve != address(0), "Must specify a curve address");
    require(bonds[bondId].address == address(0), "Bond id exists");
    Bond bond;
    bond.curve = curve;
    bonds[bondId] = bond;
    if (units > 0) {
      _buy(units, bondId, msg.sender, msg.vaue);
    }
  }

  function _buy(
    uint256 units,
    bytes32 bondId,
    address purchaser,
    uint256 value
  ) internal {
    require(uints > 0, "cannot buy zero or less units");
    Bond b = bonds[bondId];
    uint256 price = Curve(b.curve).buyPrice(b.supply, units);
    require(price <= value, "must send enough to cover price");
    uint256 refund = value.min(price);
    b.supply = b.supply.add(units);
    b.balances[purchaser] = b.balances[purchaser].add(units);
    purchaser.transfer(refund);
    bonds[bondId] = b;
  }

  function buy(uint256 units, bytes32 bondId) public payable {
    _buy(units, bondId, msg.sender, msg.value);
  }

  function sell(uint256 units, bytes32 bondId) public {
    // TODO users will want some way to control whether they want to hold
    // depending on price
    require(units > 0, "cannot sell zero or fewer units");
    Bond b = bonds[bondId];
    require(units >= b.balances[msg.sender], "Must own enough units to sell");
    uint256 price = Curve(b.curve).sellPrice(b.supply, units);
    b.supply = b.supply.sub(units);
    b.balances[msg.sender] = b.balances[msg.sender].sub(units);
    msg.sender.transfer(price);
  }
}

contract Curve {
  function buyPrice(uint256 supply, uint256 units) public returns (uint256);
  function sellPrice(uint256 supply, uint256 units) public returns (uint256);
}

contract SimpleLinearCurve is Curve {
  using SafeMath for uint256;

  constructor () public {}

  function buyPrice (uint256 supply, uint256 units) public returns (uint256) {
    // sum of the series from units to units + supply
    // units * ((supply + units) / 2)
    return units.mul(supply.add(units).div(2))
  }

  function sellPrice (uint256 supply, uint256 units) public returns (uint256) {
    return buyPrice(supply.sub(units), units)
  }
}
