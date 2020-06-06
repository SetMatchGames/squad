const fs = require('fs')

const basePath = './img/chesspieces'

const graphics = {}

fs.readdirSync(basePath).forEach(d => {
  const dir = `${basePath}/${d}`
  const fileNames = fs.readdirSync(dir)
  const searched = []
  fileNames.forEach(f => {
    if (searched.includes(f)) { return }
    searched.push(f)
    let color = 'black'
    if (f.slice(0,1) === 'w') { color = 'white' }
    const piece = f.slice(1)
    if(!graphics[piece]) { graphics[piece] = {black: '', white: ''} }
    graphics[piece][color] = `.${dir}/${f}`
    fileNames.forEach(p => {
      if (searched.includes(p)) { return }
      const pair = p.slice(1)
      if (pair === piece) {
        searched.push(p)
        let pairColor = 'black'
        if (p.slice(0,1) === 'w') { pairColor = 'white' }
        graphics[piece][pairColor] = `.${dir}/${p}`
      }
    })
  })
})

fs.writeFileSync('./src/graphics-paths.json', JSON.stringify(graphics))