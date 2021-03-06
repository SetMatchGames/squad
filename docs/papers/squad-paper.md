# Squad Paper

A cryptoeconomic mechanism for the decentralized development of video
games (software?), following the principle that
*contribution and curation are sufficient for progress*.

This is a system for coordination for situations which want to accept many answers as the "right answer"
Not like accounting but more like art. The system intends to allow many solutions to exist and for people to coordinate
around their style of the "right answer". It's almost the opposite of a blockchain that looks for a single
consensus. We do still want to mix that with an accounting system to create the economic incentives.

In this paper, we 
1. outline the opportunity we see in game design and balance, 
1. propose a cryptoeconomic mechanism to capture that opportunity, 
1. describe a general architecture for such a system, and 
1. consider broader applications of the system.

## The Opportunity

### Decentralized game design has the potential to 10x outperform centralized game design.
* Games are hard to design. 
  * In theory:
    * The design space is too large to be well-explored in a centralized way
  * And in practice:
    * The most popular games at the time of this writing are based on community
  designed and developed mods:
      * MOBAs
      * battle royales
      * Hero shooters

* [Balancing games is super hard.](https://www.gamasutra.com/blogs/DanFelder/20151012/251443/Design_101_Balancing_Games.php)
  * In theory:
    * "No matter how good you are at balancing, the collective intelligence of your
players is going to outmatch you" - Dan Felder
  * And in practice:
    * Large game companies employ entire teams to balance their games and still often receive harsh criticism on balance

## Cryptoeconomic System
By "cryptoeconomic system," we mean an economic system that can be formally described in code; that is, the system is agnostic to everything not specified in the code. Such systems often feature cryptographic techniques, hence the term "cryptoeconomic."

With Squad, we aim to design an efficient cryptoeconomic system that 
1. rewards individuals for making intelligent investments and contributions to the design and development of games, and
1. curates great gameplay using markets.

The basic economic loop to be defined in code:
* People submit contributions (games, parts of games, parts of parts of games, and so on).
* Games can choose to require payments from players. 
* Games that use contributions from the community can share revenue with the contribution authors (they may be obligated by licenses to do this).
* Contributions are curated by their market activity.
(Note also that some contributions can have elements of curation, i.e. formats)

Payments and data (actually metadata, as we will see) can be processed and stored without a central mediator using decentralized, cryptographic systems (blockchains, etc.).

## System Architecture

Squad consists of three parts, all decentralized:
1. metadata storage,
2. curation markets, and 
3. a governance DAO.

### Squad data model and metastore

Squad breaks games down into three parts: a base game, game components,
and formats.

Each of these three parts may be defined with a bit of metadata and
contributed by anyone. The metastore is where all these definitions
are stored. It holds every definition contributed to the system.

* A *Game* definition is a specification for how to launch the game

* A *Component* definition is a specification of some game component to
  be intrepreted by the game once launched

* A *Format* definition is a specification of a set of legal components
  and possibly some setup parameters to be intrepreted by the game
  once launched

### Curation Markets

(This is a new fangled term, but it's really just Hayek/Adam Smith/economics: 
prices/popularity provide an incredibly rich signal of what people value. Not perfect, but 
hard to argue anything else is better at scale.)

#### Contributions get a curved bond

Upon contribution each definition is registered in a curation market
where the contributor has a financial advantage by being the earliest
adopter, and more (detailed below). Each contribution is associated
with a bonding curve whose token can be given value by the software
developers (detailed below).

The key point here is that **the original authors & early adopters get rewarded
if the contribution becomes popular, creating a strong incentive to create and 
discover potentially popular contributions.**

Curved bonds also allow speculation, which has some positives and negatives,
but probably overall positives (provide liquidity, better signalling on average).

#### Right of first purchase

When a contribution is made, the contributor may purchase as many of
the definition tokens as they wish. Since this will always be the
first purchase of that bond, it cannot fall in value but can increase
in value. 
<<<<<Consider the option that contributors always get the first
N tokens of their contributions (for free, or some fixed small fee on
top of the ETH fee?, is spam even a problem? 
Ez: I don't think spam is a problem here: pump and dump / frontrunning are more likely, I think.
) and that funding the Gov
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
quadratically: the first level of discount costs 1, the second level
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

Let's consider framing this section in terms of these principles of DAO design:
1. How and why would one become a voter?
* Incedentally, as a result of people using (buying tokens from) your contributions
2. How and why would one vote?
* To fix some problem with the terms of service, which keeps the economic system you depend on safe
* To censor some problematic content, for the same reason
3. How and why would one fund the DAO?
* In order to make more money off your game design contributions
4. How and why would one get paid by the DAO?
* Generally: for contributing to the public goods of the Squad ecosystem
* Examples: lawyer editing the ToS or enforcing licenses, moderators identifying content that goes against ToS

#### Terms of service

A legally binding agreement between participants

#### System Parameters & Requirements

Params:
* Definition bond price curves
* Contributor Reputation award amount and frequency
* Contributor Reputation award distribution equation
  * Probably logarithmic based on tokens sold
* Gov DAO investor reputation equation and percentage
  * Probably simple token weight * percentage
* Funding reciept price
* Gov DAO Funding Discount Curve


## Our implimentation (Carry out the plan) (Physical model)

* Holochain: distributed metadata storage (metastore)
* Ethereum Automatic Bonds: curved bonds (curation markets)
  * How curation data stuck in Ethereum will make it to the end user looking for a good game
* DAOstack? Moloch? Homegrown?: gov DAO
  * What features do we need to build this DAO?

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
