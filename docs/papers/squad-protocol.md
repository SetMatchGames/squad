# Squad Protocol

## Definitions

The squad protocol defines a structure for metadata-driven games that allows them and the metadata driving them to be 

```
Game <- Format -> Component
```

```
Player -> Game -> Definition <- Contributor
  \        |          |      ____/
   \       |          |     /
    --- Proof of -- AutoBond ---- Curator
        purchase      |
                      |
                    Curve
```

* Players play games, buy proof of purchase
* Games check proof of purchase and follow definition licence rules as implimented
* Contributors create definitions (Games, Formats, Components)
  * Optionally buy first block of bond tokens
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

### Proof of purchase licence

Definitions may specify a contract address that impliments the Proof
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
components that don't share greatrer than N% with the game or the
format.



