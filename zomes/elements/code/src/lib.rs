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
enum SMGElement {
    Game {
        cmd: String,
        // TODO probably want more expressive component requirements specs
        required_component_types: Vec<ComponentType>,
        optional_component_types: Vec<ComponentType>,
    },
    Mode {
        cmd: String,
    },
    Component {
        name: String,
        type_: ComponentType,
        data: String,
    },
    Format {
        name: String,
        components: Vec<Address>,
    },
}

fn element_entry () -> ValidatingEntryType {
    entry! {
        name: "SMGElement",
        description: "Elements that make up the Set Match Games system",
        sharing: Sharing::Public,
        native_type: SMGElement,

        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },

        validation: |element: SMGElement, _ctx: hdk::ValidationData| {
            match element {
                SMGElement::Format{name: _, components} => {
                    // TODO refactor this nested match iterator mess
                    // look for functional ways to handle this better

                    // not valid if any address is not a component
                    for address in components.iter() {
                        match hdk::get_entry(&address)? {
                            Some(Entry::App(_, api_result)) => {
                                match api_result.try_into()? {
                                    SMGElement::Component{
                                        name: _,
                                        type_: _,
                                        data: _
                                    } => continue,
                                    _ => return Err(String::from(
                                        "Non-component address found in componenets"
                                    )),
                                }
                            },

                            _ => return Err(String::from(
                                "Non-component address found in components"
                            )),
                        }
                    }
                    Ok(())
                },
                _ => Ok(())
            }
        },

        links: []
    }
}

fn handle_contribute_element(element: SMGElement) -> ZomeApiResult<Address> {
    hdk::debug(format!("contributing {:?} ", element))?;
    let new_entry = Entry::App("SMGElement".into(), element.into());
    let address = hdk::commit_entry(&new_entry)?;

    // TODO create a curved bond

    // TODO create a DAO

    Ok(address)
}

fn handle_get_element(address: Address) -> ZomeApiResult<SMGElement> {
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
            inputs: |element: SMGElement|,
            outputs: |address: ZomeApiResult<Address>|,
            handler: handle_contribute_element
        }
        get_element: {
            inputs: |address: Address|,
            outputs: |element: ZomeApiResult<SMGElement>|,
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
