#![feature(try_from)]

#[macro_use]
extern crate hdk;
//extern crate serde;
#[macro_use]
extern crate serde_derive;
//extern crate serde_json;
#[macro_use]
extern crate holochain_core_types_derive;

use hdk::{
    entry_definition::ValidatingEntryType,
    error::ZomeApiResult,
    holochain_core_types::{
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
struct Game {
    cmd: String,
    required_component_types: Vec<ComponentType>,
    optional_component_types: Vec<ComponentType>,
}

fn game_entry () -> ValidatingEntryType {
    entry! {
        name: "game",
        description: "Base rules that don't change between playings",
        sharing: Sharing::Public,
        native_type: Game,
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        validation: |_game: Game, _ctx: hdk::ValidationData| {
            Ok(())
        },
        links: []
    }
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
struct Mode {
    cmd: String,
}

fn mode_entry () -> ValidatingEntryType {
    entry! {
        name: "mode",
        description: "Intrepretation of game results",
        sharing: Sharing::Public,
        native_type: Mode,
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        validation: |_mode: Mode, _ctx: hdk::ValidationData| {
            Ok(())
        },
        links: []
    }
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
struct Component {
    name: String,
    type_: ComponentType,
    data: String,
}

fn component_entry () -> ValidatingEntryType {
    entry! {
        name: "component",
        description: "Those elements that change between playings",
        sharing: Sharing::Public,
        native_type: Component,
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        validation: |_component: Component, _ctx: hdk::ValidationData| {
            Ok(())
        },
        links: []
    }
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
struct Format {
    name: String,
    components: Vec<Address>,
}

fn format_entry () -> ValidatingEntryType {
    entry! {
        name: "format",
        description: "Set of components allowed for a specific playing",
        sharing: Sharing::Public,
        native_type: Format,
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        validation: |format: Format, _ctx: hdk::ValidationData| {
            // all component addresses must be components
            for address in format.components.iter() {
                let get_result = hdk::get_entry(&address);
                match get_result {
                    Ok(Some(Entry::App(entry_type, _))) => {
                        // TODO: Is this doing what I hope it is?
                        // I want to continue if and only if the entry type at
                        // this address is a Component entry
                        if entry_type == "component".into() {
                            continue
                        } else {
                            return Err(String::from("Non-component found in components"));
                        }
                    }
                    _ => return Err(
                        String::from("Non-component found in components")
                    ),
                }
            }
            Ok(())
        },
        links: []
    }
}

fn handle_contribute_game(game: Game) -> ZomeApiResult<Address> {
    hdk::debug(format!("contributing game {:?}", game))?;
    let game_entry = Entry::App("game".into(), game.into());
    let address = hdk::commit_entry(&game_entry)?;
    Ok(address)
}

fn handle_contribute_mode(mode: Mode) -> ZomeApiResult<Address> {
    hdk::debug(format!("contributing mode {:?}", mode))?;
    let mode_entry = Entry::App("mode".into(), mode.into());
    let address = hdk::commit_entry(&mode_entry)?;
    Ok(address)
}

fn handle_contribute_component(component: Component) -> ZomeApiResult<Address> {
    hdk::debug(format!("contributing component {:?}", component))?;
    let component_entry = Entry::App("component".into(), component.into());
    let address = hdk::commit_entry(&component_entry)?;
    Ok(address)
}

fn handle_contribute_format(format: Format) -> ZomeApiResult<Address> {
    hdk::debug(format!("contributing format {:?}", format))?;
    let format_entry = Entry::App("format".into(), format.into());
    let address = hdk::commit_entry(&format_entry)?;
    Ok(address)
}

define_zome! {
    entries: [
        game_entry(),
        mode_entry(),
        component_entry(),
        format_entry()
    ]

    genesis: || { Ok(()) }

    functions: [
        contribute_game: {
            inputs: |game: Game|,
            outputs: |address: ZomeApiResult<Address>|,
            handler: handle_contribute_game
        }
        contribute_mode: {
            inputs: |mode: Mode|,
            outputs: |address: ZomeApiResult<Address>|,
            handler: handle_contribute_mode
        }
        contribute_component: {
            inputs: |component: Component|,
            outputs: |address: ZomeApiResult<Address>|,
            handler: handle_contribute_component
        }
        contribute_format: {
            inputs: |format: Format|,
            outputs: |address: ZomeApiResult<Address>|,
            handler: handle_contribute_format
        }
    ]

    traits: {
        hc_public [
            contribute_game,
            contribute_mode,
            contribute_component,
            contribute_format
        ]
    }
}

