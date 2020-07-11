/* global URLSearchParams module */

import defaults from './defaults.json'

// Overwrite any defaults with query params
const urlParams = new URLSearchParams(window.location.search)
const settings = Object.assign({}, defaults, Object.fromEntries(urlParams))

export default settings
module.export = { defaults, settings }
