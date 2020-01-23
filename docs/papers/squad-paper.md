# Squad Paper

A cryptoeconomic mechanism for the decentralized development of video
games (software?), following the principle that
*contribution and curation are sufficient for progress*.

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

### Decentralized game design is viable in the near future

Even though today's decentralized systems are limited, 
we believe a successful system for decentralized game design is possible in the near future,
because it depends on simple principles: 
1. Game design is relatively simple and harmless.
1. Contribution and curation are sufficient for progress.

#### Game design is relatively simple and harmless
This is *not* intended to belittle the difficulty of good game design (see above). 
We mean that relative to, for example, designing and building a smart energy grid, 
designing a game is simpler, and that the consequences of the energy grid failing
are much larger than a game design failing.

#### Contribution and curation are sufficient for progress
This principle says that a system that supports these two, relatively simple features has no theoretical achievement limit.

*Contribution* means things can be added to the system.
*Curation* means contributions can be grouped arbitrarily.

Programs can be thought of as systems that use only these two properties, and so can games.

We believe Squad only needs to do these two things well to succeed at decentralized game design and balance. 

## Cryptoeconomic Mechanism
A decentralized system for contribution and curation must incentivize those two things.

We propose to incentivize contribution through licenising and revenue shares
and to make curation an incendental effect of market activity.

The basic economic loop:
* People submit contributions (games, parts of games, parts of parts of games, and so on).
* Games can choose to require payments from players. 
* Games that use contributions from the community may be obligated by licenses to share their revenue with contribution authors.
* All contributions are curated by their market activity.
(Note also that some contributions can have elements of curation, i.e. formats)

Payments and data (actually metadata, as we will see) can be processed and stored without a central mediator using other  crypteconomic systems (blockchains, etc.).

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
  * Probably simple token weight
  (it can't be worse than what you'd get from buying a ton of your own contribution, or else investors might do that,
  which is bad for the curation markets)
  (quadratic might be fine here, as well: yes, you can pseudo-sybil attack, but it's still more expensive because of the gas costs)
* Funding reciept price
* Gov DAO Funding Discount Curve

Requirements:
* 

## Our implimentation (Carry out the plan) (Physical model)

* Holochain: distributed metadata storage (metastore)
* Ethereum Automatic Bonds: curved bonds
* DAOstack? Moloch? Homegrown?: gov DAO

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
