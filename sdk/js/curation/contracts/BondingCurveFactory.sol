pragma solidity ^0.4.23;

import "./EthPolynomialCurvedToken.sol";

contract BondingCurveFactory {

  event Made(address bondAddress);

  function make() {
    address bond = new EthPolynomialCurvedToken("SMG Component Token",
                                                "SMGCT",
                                                18,
                                                2
                                                );
    emit Made(bond);
  }
}
