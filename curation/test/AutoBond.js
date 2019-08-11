const AutoBond = artifacts.require("AutoBond")
const SimpleLinearCurve = artifacts.require("SimpleLinearCurve")

contract("AutoBond", ([alice, bob, ...accounts]) => {

  // alice can create bond A

  // bob can buy the first 2 units of bond A for 3 wei

  // bob can create bond B buy the first 2 units for 3 wei

  // alice can buy the next 2 units of bond B for 9 wei

  // bob can sell a unit of bond B for 4 wei

  // alice can sell 2 units of bond B for 5 wei

  // bob can sell 1 unit of bond b for 1 wei

  // neither alice nor bob can sell any more
})
