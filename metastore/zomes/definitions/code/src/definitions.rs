use hdk::{
    holochain_core_types::{
        entry::Entry,
    },
    holochain_persistence_api::{
        cas::content::Address,
    },
    holochain_json_api::{
        json::JsonString,
        error::JsonError 
    }
};

use std::convert::TryInto;

#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub struct Catalog {
    pub name: String,
    pub type_: String
}

#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub enum Definition {
    Game{
        name: String,
        // TODO rename Game.type to Game.runner
        type_: String,
        data: String,
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

fn non_empty_string(name: &String, message: &str) -> Result<(), String> {
    match name.len() {
        0 => Err(String::from(message)),
        _ => Ok(())
    }
}

fn valid_game_fields(name: &String, type_: &String) -> Result<(), String> {
    non_empty_string(name, "Empty game name")?;
    non_empty_string(type_, "Empty game type")
}

fn valid_component_fields(
    name: &String,
    type_: &String,
    _data: &String,
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
            if let Definition::Component{
                name: _,
                type_: _,
                data: _
            } = entry.try_into()? {
                continue;
            } else {
                return Err(String::from("Non-component component address"));
            }
        } else {
            return Err(String::from("Invalid app entry address"));
        }
    }
    Ok(())
}

pub fn valid_definition(definition: &Definition) -> Result<(), String> {
    match definition {
        Definition::Game{name, type_, data: _}   => valid_game_fields(&name, &type_),
        Definition::Component{name, type_, data} => valid_component_fields(&name, &type_, &data),
        Definition::Format{name, components}     => valid_format_fields(&name, &components),
    }
}

pub fn valid_base_and_target(base: &Catalog, target: &Definition) -> Result<(), String> {
    match target {
        Definition::Game{..} => { 
            if "Game" == &base.type_ { 
                return Ok(()) 
            }
            Err(format!("Expected base to be a game, but was {}", base.type_)) 
        },
        Definition::Format{..} => {
            if "Format" == &base.type_ { 
                return Ok(()) 
            }
            Err(format!("Expected base to be a format, but was {}", base.type_))
        },
        Definition::Component{..} => {
            if "Component" == &base.type_ { 
                return Ok(()) 
            }
            Err(format!("Expected base to be a component, but was {}", base.type_))
        },
    }
}