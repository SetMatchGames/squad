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