#![feature(try_from)]

#[macro_use]
extern crate hdk;

#[macro_use]
extern crate serde_derive;

#[macro_use]
extern crate holochain_core_types_derive;

mod elements;

use elements::Element;
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
use std::convert::TryInto;

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
                Element::Game(game)           => game.valid(),
                Element::Mode(mode)           => mode.valid(),
                Element::Component(component) => component.valid(),
                Element::Format(format)       => format.valid(),
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
