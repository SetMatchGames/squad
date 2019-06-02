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

use elements::{Element, ElementIndex, valid_element};
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
        },

        links: [
            to! {
                "ElementIndex",
                link_type: "Index",

                validation_package : || {
                    hdk::ValidationPackageDefinition::Entry
                },
                validation: |_validation_data: hdk::LinkValidationData| {
                    Ok(())
                }
            }
        ]
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
        }
    }
}

fn handle_contribute_element(element: Element, index_address: Address) -> ZomeApiResult<Address> {
    hdk::debug(format!("handle_contribute_element({:?})", element))?;
    let new_entry = Entry::App("Element".into(), element.into());
    let address = hdk::commit_entry(&new_entry)?;

    // link the element to an appropriate index
    let base: Address = valid_element_index_address(address.clone(), index_address)?;
    hdk::api::link_entries(&base, &address, "Index", "")?;

    // TODO Enter it into the curation market

    // TODO create a DAO

    Ok(address)
}

fn handle_contribute_element_index(index: ElementIndex) -> ZomeApiResult<Address> {
    let new_entry = Entry::App("ElementIndex".into(), index.into());
    let address = hdk::commit_entry(&new_entry)?;
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

fn valid_element_index_address(element_address: Address, index_address: Address) -> ZomeApiResult<Address> {
    let element: Element = handle_get_element(element_address)?;
    let index: ElementIndex = handle_get_element_index(index_address.clone())?;
    match (index.type_, element) {
        (Element::Game{..}, Element::Game{..}) => Ok(index_address),
        (Element::Format{..}, Element::Format{..}) => Ok(index_address),
        (Element::Component{..}, Element::Component{..}) => Ok(index_address),
        _ => Err(String::from("Element type does not match index type.").into())
    }
}

define_zome! {
    entries: [
        element_entry(),
        element_index_entry()
    ]

    genesis: || { Ok(()) }

    functions: [
        contribute_element: {
            inputs: |element: Element, index_address: Address|,
            outputs: |address: ZomeApiResult<Address>|,
            handler: handle_contribute_element
        }
        contribute_element_index: {
            inputs: |index: ElementIndex|,
            outputs: |address: ZomeApiResult<Address>|,
            handler: handle_contribute_element_index
        }
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
            contribute_element, 
            contribute_element_index, 
            get_element, 
            get_element_index
        ]
    }
}
