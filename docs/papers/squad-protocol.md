# Squad Protocol

## Definitions

The squad protocol defines a structure for metadata-driven games that
allows them and the metadata driving them to be curated by a
decentralized market.

```
Game <- Format -> Component
 ^____________________|

```

### Games

A Game definition is a set of instructions to run the game on a
particular platform. It might be a link to the game on the web, or an
install and run command on a desktop platform.

It's not necessary to include the code of the game in the definition
but in order to run on the squad platform a game software must be
configurable by the Formats and Components discussed below. The game
must also respect the licenses selected by format and component
contributors discussed below though the Squad software development
kits (SDKs) will make this easy to do.

### Components

A Component definition is interpreted by a game. It's up to the game
to expose an interface to Component designers and could treat
Components as a number of things like a unit of configuration, a
module, an image, an animation, or any other bit of data the game
might need.

If a card game exposed a schema for how it interprets cards, Component
contributors would create Components whose data followed that schema
to make cards available to Format contributors.

### Formats

A Format is a set of Components and configuration that together meet
the configuration requirements for a particular Game (or Games).
Formats specify a universe of Components and a way to play with
them---one of the possible complete experiences made possible by the
Game---for players to gather around.

## Curation

Each definitions is entered into the curation market which is
implemented as a curved bond token per definition. Market activity in
the market correlates to the value of the definition when purchases of
those bonds are correlated to their value. For instance, if a user is
required to buy a Format's bond before the game allows them to play or
if there is a micro-transaction market for cosmetics that change the
look of a component if the player has some of the relevant token.

In order to support a broad range of revenue models and revenue
sharing models built on top of this curation market, the protocol
supports revenue sharing between contributors, system enforceable
sharing requirements between contributions and legal licenses between
contributors and game developers.


```
Player -> Game -> Definition <- Contributor
  \        |         |   _______/
   \       |         |  /
    --- Proof of -- Bond ---- Curator
        purchase     |
                     |
                    Curve
```

* Players buy proofs of purchase and play Games
* Games check proofs of purchase and follow definition license rules as
  implemented by the Squad SDK
* Contributors create definitions (Games, Formats, Components)
  * Optionally buy first block of bond tokens
  * Optionally select licensing rules implemented by the Squad SDK
  * Optionally select revenue sharing requirements
* Curators buy bond tokens

## Value flow between contributors

Contributors choose licenses, revenue share offers, and revenue share
requirements as part of submitting definitions. Licenses are
agreements between players and contributors (and between multiple
contributors) enforced by the live courts and requirements are
constraints on revenue share offers enforced by the smart contracts.

## Licenses

### End User License Agreements (EULA)

Definitions may specify EULA clauses that players must agree to before
using them.

### Proof of purchase license

Definitions may specify a contract address that implements the Proof
of Purchase interface. Game contributors agree to check the contract
for proof of purchase before allowing players to use the definition.

#### Proof of purchase Interface

For games (though games can do what they want)
`validGamePurchase(userAddress, gameAddress)`

For Formats
`validFormatPurchase(userAddress, gameAddress, formatAddress)`

Format contributors may want the ability to charge for each game they
are played with, and perhaps charge different amounts.

For Components
`validComponentPurchase(userAddress, gameAddress, formatAddress, componentAddress)`

Component contributors may want to charge differently for different
games or formats

## Revenue Sharing Offers and Requirements

Each definition type has different options for sharing revenue and
requiring shared revenue.

### Component Revenue Share Options

Component authors may share N% of their revenue with formats that
include them, weighted by format market cap, and subject to a
denylist.

### Component Requirement Options

Component authors may require formats to share greater than N% of
their revenue evenly with components in order to include the component
in the format.

### Format Revenue Share Options

Format authors may share N% of Format revenue evenly with its
components

Format authors may share N% of Format revenue with a game. This may be
specified multiple with different percentages for different games.

### Game Rev Share Options

Game authors may share N% of Game revenue with Formats for that game,
weighted by market cap, and subject to a denylist. Revenue that would
have been sent to a format on a deny list is burned instead to keep
game authors from being able to add all formats not authored by them
to a deny list once the game becomes popular.

Game authors may share N% of Game revenue with Components in Formats
for the game weighted by either the component market cap or their
formats market caps or some combination.

### Game Requirement Options

Game authors may require that Formats for the game share greater than
N% revenue with either the game or their components.

Game authors may require that Formats for the game not include
components that don't share greater than N% with the game or the
format.



