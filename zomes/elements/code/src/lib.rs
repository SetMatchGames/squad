#![feature(try_from)]

#[macro_use]
extern crate hdk;
//extern crate serde;
#[macro_use]
extern crate serde_derive;
//extern crate serde_json;
#[macro_use]
extern crate holochain_core_types_derive;

use std::convert::TryInto;

use crate::Runner::{Mock, DNA};
use crate::Element::{Game, Mode, Format, Component};

use hdk::{
    entry_definition::ValidatingEntryType,
    error::ZomeApiResult,
    holochain_core_types::{
        agent::AgentId,
        error::HolochainError,
        dna::entry_types::Sharing,
        json::JsonString,
        cas::content::Address,
        entry::Entry,
    }
};

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
struct ComponentType(String);

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
enum GameOutcome {
    // Outcome in which there is a single winner
    Win {
        winner_id: AgentId,
        loser_ids: Vec<AgentId>,
    },

    // Outcome of a game that sorts all players into 1st..N place
    Sorting {
        sorted_player_ids: Vec<AgentId>,
    },
    // Outcome with no winner and no loser
    Draw { player_ids: Vec<AgentId> },
    // Outcome where some number of players have forfeited the game
    Forfeit {
        forfeited_player_ids: Vec<AgentId>,
        other_player_ids: Vec<AgentId>,
    },
    // Outcome where the game has been abandoned
    Abandoned {
        player_ids: Vec<AgentId>
    },
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
struct GameResult {
    game: GameElem,
    active_mode: ModeElem,
    format: FormatElem,
    outcome: GameOutcome,
    // TODO consider start and end time
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
struct DNARunner {
    dna_url: String,
    ui_url: String,
}

impl DNARunner {
    fn run(&self, format_address: String) -> GameResult {
        unimplemented!()
    }
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
struct MockRunner {
    run_count: i32,
    run_args: Vec<String>,
}

impl MockRunner {
    fn run(&mut self, format_address: String) -> GameResult {
        self.run_count += 1;
        self.run_args.push(format_address);
        return GameResult{
            game: GameElem{
                name: "Mock Game".to_string(),
                runner: "MockRunner".to_string(),
            },
            active_mode: ModeElem{
                name: "Mock Mode".to_string(),
                cmd: "Mock cmd".to_string(),
            },
            format: FormatElem{
                name: "Mock Format".to_string(),
                components: vec![],
            },
            outcome: GameOutcome::Draw { player_ids: vec![] },
        };
    }
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
enum Runner {
    Mock(MockRunner),
    DNA(DNARunner),
}

impl Runner {
    fn run(&mut self, format_address: String) -> GameResult {
        match self {
            Mock(r) => r.run(format_address),
            DNA(r) => r.run(format_address),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
struct GameElem {
    name: String,
    runner: String,
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
struct ModeElem {
    name: String,
    // TODO what is this? cmd is probably wrong
    // probably needs to have something of a function signature
    // [GameResult] -> View... something, not sure
    // something like the game runner, maybe modes are Runners too
    cmd: String,
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
struct ComponentElem {
    name: String,
    type_: ComponentType,
    data: String,
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
struct FormatElem {
    name: String,
    components: Vec<Address>,
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
enum Element {
    Game(GameElem),
    Mode(ModeElem),
    Component(ComponentElem),
    Format(FormatElem),
}

fn check_string(name: String, message: &str) -> Result<(), String> {
    match name.len() {
        0 => Err(String::from(message)),
        _ => Ok(())
    }
}

fn element_entry () -> ValidatingEntryType {
    entry! {
        name: "Element",
        description: "Elements that make up the Set Match Games system",
        sharing: Sharing::Public,
        native_type: Element,

        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },

        validation: |element: Element, _ctx: hdk::ValidationData| {
            match element {
                Game(GameElem{name, runner}) => {
                    check_string(name, "Empty game name")?;
                    let runner: Result<Runner, _> = serde_json::from_str(&*runner);
                    if let Ok(_) = runner {
                        return Ok(());
                    }
                    Err(String::from("Invalid runner"))
                }

                Mode(ModeElem{name, cmd}) => {
                    check_string(name, "Empty mode name")?;
                    check_string(cmd, "Empty mode cmd")
                }

                Component(ComponentElem{name, type_, data: _}) => {
                    check_string(name, "Empty component name")?;
                    let ComponentType(type_name) = type_;
                    check_string(type_name, "Empty component type")
                }

                Format(FormatElem{name, components}) => {
                    check_string(name, "Empty format name")?;
                    // TODO refactor this nested match iterator mess
                    // look for functional ways to handle this better
                    // not valid if any address is not a component
                    for address in components.iter() {
                        match hdk::get_entry(&address)? {
                            Some(Entry::App(_, api_result)) => {
                                match api_result.try_into()? {
                                    Component(ComponentElem{
                                        name: _,
                                        type_: _,
                                        data: _,
                                    }) => continue,
                                    _ => return Err(String::from(
                                        "Non-component component address"
                                    )),
                                };
                            },

                            _ => return Err(String::from(
                                "Component does not exist"
                            )),
                        }
                    }
                    Ok(())
                }
            }
        },

        links: []
    }
}

fn handle_contribute_element(element: Element) -> ZomeApiResult<Address> {
    hdk::debug(format!("contributing {:?} ", element))?;
    let new_entry = Entry::App("Element".into(), element.into());
    let address = hdk::commit_entry(&new_entry)?;

    // TODO create a curved bond

    // TODO create a DAO

    Ok(address)
}

fn handle_get_element(address: Address) -> ZomeApiResult<Element> {
    match hdk::get_entry(&address) {
        Ok(Some(Entry::App(_, api_result))) => Ok(api_result.try_into()?),
        _ => Err(String::from("No element found").into())
    }
}

define_zome! {
    entries: [
        element_entry()
    ]

    genesis: || { Ok(()) }

    functions: [
        contribute_element: {
            inputs: |element: Element|,
            outputs: |address: ZomeApiResult<Address>|,
            handler: handle_contribute_element
        }
        get_element: {
            inputs: |address: Address|,
            outputs: |element: ZomeApiResult<Element>|,
            handler: handle_get_element
        }
    ]

    traits: {
        hc_public [
            contribute_element,
            get_element
        ]
    }
}
