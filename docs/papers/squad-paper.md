# Squad Paper

A cryptoeconomic mechanism for the decentralized development of video
games (software?)

Contribution and curation are sufficient for progress.

In this paper we outline the opportunity we see in video game
development, propose a cryptoeconomic mechanism to capture that
opportunity, and consider broader applications of the system.

## The Opportunity

* Games are hard to design and develop. They require lots of
  playtesting, the more people the better
* The most popular games at the time of this writing are based on community
  designed and developed mods
  * MOBAs
  * battle royales
  * Hero shooters

[Balancing games is super hard](https://www.gamasutra.com/blogs/DanFelder/20151012/251443/Design_101_Balancing_Games.php)
"No matter how good you are at balancing, the collective intelligence of your
players is going to outmatch you" - Dan Felder

## Cryptoeconomic Mechanism

Design an efficient mechanism that rewards the collective intelligence
fairly for their investment in and contributions to the design and
development of video games.

Squad consists of three parts; distributed metadata storage, a
curation market, and a governance DAO.

### Squad data model and Metastore

Squad breaks games down into 3 parts. A base game, game components,
and formats

Each of these three parts may be defined with a bit of metadata and
contributed by anyone. The metastore is where all these definitions
are stored. It holds every definition contributed to the system.

* A Game definition is a specification for how to launch the game

* A Component definition is a specification of some game component to
  be intrepreted by the game once launched

* A Format definition is a specification of a set of legal components
  and possibly some setup parameters to be intrepreted by the game
  once launched

### Curation Market

#### Contributions get a curved bond

Upon contribution each definition is registered in a curation market
where the contributor has a financial advantage by being the earliest
adopter, and more (detailed below). Each contribution is associated
with a bonding curve whose token can be given value by the software
developers (detailed below).

#### Right of first purchase

When a contribution is made, the contributor may purchase as many of
the definition tokens as they wish. Sinse this will always be the
first purchase of that bond, it cannot fall in value but can increase
in value. <<<<<Consider the option that contributors always get the first
N tokens of their contributions (for free, or some fixed small fee on
top of the ETH fee?, is spam even a problem?) and that funding the Gov
DAO grants them a larger N>>>>>

* Models for games to give value to relevant definition tokens
  * Purchase Reciept in which the purchase of some reciept token buys and burns
    an equivilent value of the definition bond
    * The game would then impliment something of value for reciept holders
      Perhaps some in game advantage (pay to win) or cosmetics
  * Bond ownership required to use the definition
  * Tournaments whose entry fees go to buying and burning definition bonds

### Governance DAO

* Continuously funded (curved bond) DAO

* Reputation awarded to contributors proportional to their success in
  the market

* Some percent of awarded reputation is granted to holders of the Gov
  DAO continuous funding token

The governance DAO maintains and updates a terms of participation agreement,
funds platform development (or anything else), and tunes the parameters of the
system. Parameters might include the specifics of the definition bond and
continuous funding curves

Contributors may purchase a permenant discount on initial purchases of
their future contributions by funding the Governance DAO. The more a
given address funds the Gov DAO the more of a discount that address
gets when contributing new definitions. This discount increases
quadratically. The first level of discount costs 1, the second level
of discount costs 2 etc. This has the effect of shifting the price
curve for that definition to the right. Contributors who believe in
their future success in the platform are incentivised to fund the Gov
DAO. Furthermore, because the level of discount is determined by the
total amount that the contributing address has funded the Gov DAO,
contributors are incentivised to do all of that funding and make all
their contributions, with a single address. This makes sybil attacks
costly.

Funding reciepts can only be transfered to addresses without any
existing funding reciepts, and cannot be split sold or refunded.

#### Terms of service

A legally binding agreement between participants

#### System Parameters

* Definition bond price curves
* Reputation award amount and frequency
* Reputation award distribution equation
  * Probably logarithmic based on tokens sold
* Gov DAO investor reputation equation and percentage
  * Probably simple token weight
* Funding reciept price
* Gov DAO Funding Discount Curve

## Our implimentation (Carry out the plan) (Physical model)

* Holochain
* Ethereum Automatic Bonds
* DAOStack? Moloch? Homegrown?

## Future work and beyond video games

Platform extension to add licencing agreements for each
contribution. Contributors can set terms of service, or retail,
tournament, streaming, etc. licences. Licences could be sold under
Harberger taxation.

* This idea should work for any software, not just games.
* What about this system is "just for games" and would need to be changed or
  updated for this to work for more software systems?
* What software systems does this simply work for now?
* Should we rename our definitions (especially the "Game" type) to make it
  forward copatible?
* Should we rewrite the whole paper to apply to software?
  * squad.games would then become one of many possible app stores
