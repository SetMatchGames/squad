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

use elements::{Element, ElementIndex, ElementIndexLink, valid_element};
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
                    if let hdk::LinkValidationData::LinkAdd(LinkData(link), _) = validation_data {
                        let base = handle_get_element_index(link.base)?;
                        let target = handle_get_element(link.target)?;
                        return valid_base_and_target(&base, &target);
                    } else {
                       return Err("Cannot remove links at this time".to_string()),
                    }
                }
            }
        ]
    }
}

fn handle_create_element(element: Element) -> ZomeApiResult<Address> {
    let new_entry = Entry::App("Element".into(), element.into());
    let address: Address = hdk::commit_entry(&new_entry)?;
    hdk::debug(format!("handle_create_element({:?})", address))?;

    let index_address: Address = match element {
        Element::Game => handle_create_element_index("Games", "Game"),
        Element::Format => handle_create_element_index("Formats", "Format"),
        Element::Component => handle_create_element_index("Components", "Component"),
    };

    hdk::api::link_entries(&index_address, &address, "Index", "")?;
    
    Ok(address)
}

fn handle_create_element_index(name_: &str, type_str: &str) -> ZomeApiResult<Address> {
    let element_index: ElementIndex = {
        name: String::from(name_),
        type_: String::from(type_str)
    }
    let new_entry = Entry::App("ElementIndex".into(), element_index);
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

define_zome! {
    entries: [
        element_entry(),
        element_index_entry()
    ]

    genesis: || { Ok(()) }

    functions: [
        create_element: {
            inputs: |element: Element, index_address: Address|,
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
    ]

    traits: {
        hc_public [
            create_element, 
            // create_element_index, 
            get_element, 
            get_element_index
        ]
    }
}
