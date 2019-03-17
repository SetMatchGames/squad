mod runners;

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
use runners::Runner;
use std::convert::TryInto;

fn non_empty_string(name: &String, message: &str) -> Result<(), String> {
    match name.len() {
        0 => Err(String::from(message)),
        _ => Ok(())
    }
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
pub enum Element {
    Game{
        name: String,
        runner: String,
    },
    Mode{
        name: String,
        // TODO what is this? cmd is probably wrong
        // probably needs to have something of a function signature
        // [GameResult] -> View... something, not sure
        // something like the game runner, maybe modes are Runners too
        cmd: String,
    },
    Component{
        name: String,
        type_: String,
        data: String,
    },
    Format{
        name: String,
        components: Vec<Address>,
    },
}

fn valid_game_fields(name: &String, runner: &String) -> Result<(), String> {
    non_empty_string(name, "Empty game name")?;
    let runner: Result<Runner, _> = serde_json::from_str(&*runner);
    if let Ok(_) = runner {
        return Ok(());
    }
    Err(String::from("Invalid runner"))
}

fn valid_mode_fields(name: &String, cmd: &String) -> Result<(), String> {
    non_empty_string(name, "Empty mode name")?;
    non_empty_string(cmd, "Empty mode cmd")
}

fn valid_component_fields(
    name: &String,
    type_: &String,
    data: &String
) -> Result<(), String> {
    non_empty_string(name, "Empty component name")?;
    non_empty_string(type_, "Empty component type")
}

fn valid_format_fields(
    name: &String,
    components: &Vec<Address>
) -> Result<(), String> {
    non_empty_string(name, "Empty format name")?;

    // confirm that each address is a component address
    for address in components.iter() {

        // get the entry at the address
        let api_result = hdk::get_entry(&address)?;
        if let Some(Entry::App(_, entry)) = api_result {
            // confirm it's a component
            if let Element::Component{
                name: _,
                type_: _,
                data: _
            } = entry.try_into()? {
                continue;
            } else {
                return  Err(String::from("Non-component component address"));
            }
        } else {
            return Err(String::from("Invalid app entry address"));
        }
    }
    Ok(())
}

pub fn valid_element(element: &Element) -> Result<(), String> {
    match element {
        Element::Game{name, runner}           => valid_game_fields(&name, &runner),
        Element::Mode{name, cmd}              => valid_mode_fields(&name, &cmd),
        Element::Component{name, type_, data} => valid_component_fields(&name, &type_, &data),
        Element::Format{name, components}     => valid_format_fields(&name, &components),
    }
}




