use hdk::{
    holochain_core_types::{
        error::HolochainError,
        json::JsonString,
        cas::content::Address,
        entry::Entry,
    }
};

use std::convert::TryInto;

fn non_empty_string(name: &String, message: &str) -> Result<(), String> {
    match name.len() {
        0 => Err(String::from(message)),
        _ => Ok(())
    }
}

#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub enum Element {
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
        Element::Game{name, type_, data: _}   => valid_game_fields(&name, &type_),
        Element::Component{name, type_, data} => valid_component_fields(&name, &type_, &data),
        Element::Format{name, components}     => valid_format_fields(&name, &components),
    }
}
