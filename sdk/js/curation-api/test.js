require("dotenv").config()
const curation = require("./index")

curation.newBond(process.env.SIMPLE_CURVE_ADDR, 'bondId', 0)