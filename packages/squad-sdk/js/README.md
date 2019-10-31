The Squad-SDK is a software development kit that supports community-designed video games. Building with the Squad-SDK will let you build a game that allows community created and curated components, formats, and other elements inside your game. With the SDK, a game's community can 1) submit game elements, 2) buy them, 3), curate them (via curation markets), and 4) license and profit off their contributions.

# Usage

```
squad = require('squad')
squad.webSocketConnection("localhost:8888")
```

# Configuration

two config files are currently created by build processes
`./curation-config.json` is created by the curation market deploy process and
stores the ethereum contract addresses.

`./squad-config.json` is created by the "build process" (`make develop` right
now) and it holds the `sdkUrl`. This is passed to games by game runners.
