pragma solidity >=0.5.0 <0.6.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract AutoBond {
  using SafeMath for uint256;

  constructor () public {}

  struct Bond {
    uint256 supply; // total outstanding minted units
    mapping(address => uint256) balances;
    address curve;
  }

  // mapping from definition address to it's bond
  mapping(bytes32 => Bond) public bonds;

  function getBalance(bytes32 bondId, address holder) public view returns (uint256) {
    return bonds[bondId].balances[holder];
  }

  function getSupply(bytes32 bondId) public view returns (uint256) {
    return bonds[bondId].supply;
  }

  function getCurve(bytes32 bondId) public view returns (address) {
    return bonds[bondId].curve;
  }

  // newBond makes a new bond and buys the first set of units
  function newBond(address curve, bytes32 bondId, uint256 units) public payable {
    require(curve != address(0), "Must specify a curve address");
    require(bonds[bondId].curve == address(0), "Bond id exists");
    Bond memory bond = Bond({ curve: curve, supply: 0 });
    // bond.curve = curve;
    bonds[bondId] = bond;
    if (units > 0) {
      _buy(units, bondId, msg.sender, msg.value);
    }
  }

  function _buy(
    uint256 units,
    bytes32 bondId,
    address payable purchaser,
    uint256 value
  ) internal {
    require(units > 0, "cannot buy zero or less units");
    Bond storage b = bonds[bondId];
    uint256 price = Curve(b.curve).buyPrice(b.supply, units);
    require(price <= value, "must send enough to cover price");
    uint256 refund = value.sub(price);
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
    Bond storage b = bonds[bondId];
    require(units <= b.balances[msg.sender], "Must own enough units to sell");
    uint256 price = Curve(b.curve).sellPrice(b.supply, units);
    b.supply = b.supply.sub(units);
    b.balances[msg.sender] = b.balances[msg.sender].sub(units);
    msg.sender.transfer(price);
  }
}

contract Curve {
  function buyPrice(uint256 supply, uint256 units) public view returns (uint256);
  function sellPrice(uint256 supply, uint256 units) public view returns (uint256);
}

contract SimpleLinearCurve is Curve {
  using SafeMath for uint256;

  constructor () public {}

  function buyPrice (uint256 supply, uint256 units) public view returns (uint256) {
    // sum of the series from supply + 1 to new supply or (supply + units)
    // average of the first term and the last term timen the number of terms
    //                supply + 1         supply + units      units

    uint256 a1 = supply.add(1);      // the first newly minted token
    uint256 an = supply.add(units);  // the last newly minted token
    uint256 n = units;               // number of tokens in the series

    // the forumula is n((a1 + an)/2)
    // but deviding integers by 2 introduces errors that are then multiplied
    // factor the formula to devide by 2 last

    // ((a1 * n) + (a2 * n)) / 2

    return a1.mul(n).add(an.mul(n)).div(2);
  }

  function sellPrice (uint256 supply, uint256 units) public view returns (uint256) {
    return buyPrice(supply.sub(units), units);
  }
}
