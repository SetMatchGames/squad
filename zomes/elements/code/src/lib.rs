#![feature(try_from)]
extern crate serde;
extern crate serde_json;
#[macro_use]
extern crate hdk;

#[macro_use]
extern crate serde_derive;

#[macro_use]
extern crate holochain_core_types_derive;

mod elements;

use elements::{ Element, ElementIndex, valid_element, valid_base_and_target };
use hdk::{
    entry_definition::ValidatingEntryType,
    error::ZomeApiResult,
    holochain_core_types::{
        error::HolochainError,
        dna::entry_types::Sharing,
        json::JsonString,
        cas::content::Address,
        entry::Entry,
        link::link_data::LinkData,
    },
    api::{
        link_entries,
        get_links,
    }
};
use std::convert::TryInto;

fn element_entry () -> ValidatingEntryType {
    entry! {
        name: "Element",
        description: "Elements that make up the Set Match Games system",
        sharing: Sharing::Public,

        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },

        validation: |validation_data: hdk::EntryValidationData<Element>| {
            let element = match validation_data {
                hdk::EntryValidationData::Create{
                    entry,
                    validation_data: _
                } => entry,
                _ => return Err("Cannot modify or delete Elements".to_string())
            };
            valid_element(&element)
        }
    }
}

fn element_index_entry () -> ValidatingEntryType {
    entry! {
        name: "ElementIndex",
        description: "Entries that link to all elements of a type",
        sharing: Sharing::Public,

        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },

        validation: |_validation_data: hdk::EntryValidationData<ElementIndex>| {
            Ok(())
        },

        links: [
            to! {
                "Element",
                link_type: "Index",

                validation_package : || {
                    hdk::ValidationPackageDefinition::Entry
                },
                validation: |validation_data: hdk::LinkValidationData| {
                    if let hdk::LinkValidationData::LinkAdd{
                            link: LinkData{
                                link: link_,
                                action_kind: _
                            }, 
                            validation_data: _
                        } = validation_data {
                        let base = handle_get_element_index(link_.base().to_owned())?;
                        let target = handle_get_element(link_.target().to_owned())?;
                        return valid_base_and_target(&base, &target);
                    } else {
                        // LinkRemove is the other type that can be found here, but it isn't implemented.
                        return Err("Cannot remove links at this time.".to_string());
                    }
                }
            }
        ]
    }
}

fn handle_create_element(element: Element) -> ZomeApiResult<Address> {
    let new_entry = Entry::App("Element".into(), element.clone().into());
    let address: Address = hdk::commit_entry(&new_entry)?;
    hdk::debug(format!("handle_create_element({:?})", address))?;

    let index_address: Address = match element {
        Element::Game{..} => handle_create_element_index("Games", "Game").unwrap(),
        Element::Format{..} => handle_create_element_index("Formats", "Format").unwrap(),
        Element::Component{..} => handle_create_element_index("Components", "Component").unwrap(),
    };

    link_entries(&index_address, &address, "Index", "")?;
    
    Ok(address)
}

fn handle_create_element_index(name_str: &str, type_str: &str) -> ZomeApiResult<Address> {
    let element_index = ElementIndex {
        name: String::from(name_str),
        type_: String::from(type_str)
    };
    let new_entry = Entry::App("ElementIndex".into(), element_index.into());
    let address: Address = hdk::commit_entry(&new_entry)?;
    Ok(address)
}

fn handle_get_element(address: Address) -> ZomeApiResult<Element> {
    match hdk::get_entry(&address) {
        Ok(Some(Entry::App(_, api_result))) => Ok(api_result.try_into()?),
        _ => Err(String::from("No element found").into())
    }
}

fn handle_get_element_index(address: Address) -> ZomeApiResult<ElementIndex> {
    match hdk::get_entry(&address) {
        Ok(Some(Entry::App(_, api_result))) => Ok(api_result.try_into()?),
        _ => Err(String::from("No element index found").into())
    }
}

fn handle_get_all_games() -> ZomeApiResult<Vec<Element>> {
    let index_address: Address = handle_create_element_index("Games", "Game").unwrap();
    let links: Vec<Address> = get_links(&index_address, Some("Index".to_string()), None)?.addresses();
    let games: Vec<Element> = links.into_iter().map(|address| {
        handle_get_element(address).unwrap()
    }).collect();
    Ok(games)
}

define_zome! {
    entries: [
        element_entry(),
        element_index_entry()
    ]

    genesis: || { Ok(()) }

    functions: [
        create_element: {
            inputs: |element: Element|,
            outputs: |address: ZomeApiResult<Address>|,
            handler: handle_create_element
        }
        /*
        create_element_index: {
            inputs: |index: ElementIndex|,
            outputs: |address: ZomeApiResult<Address>|,
            handler: handle_create_element_index
        }
        */ 
        get_element: {
            inputs: |address: Address|,
            outputs: |element: ZomeApiResult<Element>|,
            handler: handle_get_element
        }
        get_element_index: {
            inputs: |address: Address|,
            outputs: |element: ZomeApiResult<ElementIndex>|,
            handler: handle_get_element_index
        }
        get_all_games: {
            inputs: | |,
            outputs: |games: ZomeApiResult<Vec<Element>>|,
            handler: handle_get_games
        }
    ]

    traits: {
        hc_public [
            create_element, 
            // create_element_index, 
            get_element, 
            get_element_index,
            get_all_games
        ]
    }
}