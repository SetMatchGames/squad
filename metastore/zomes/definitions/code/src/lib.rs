#![feature(try_from)]
extern crate serde;
extern crate serde_json;
#[macro_use]
extern crate hdk;

#[macro_use]
extern crate serde_derive;

#[macro_use]
extern crate holochain_json_derive;

mod definitions;

use definitions::{ Definition, Catalog, DefWithAddr, valid_definition, valid_base_and_target };
use hdk::{
    entry_definition::ValidatingEntryType,
    error::ZomeApiResult,
    holochain_core_types::{
        dna::entry_types::Sharing,
        entry::Entry,
        link::{
            link_data::LinkData,
            LinkMatch
        }
    },
    api::{
        link_entries,
        get_links,
        entry_address,
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

fn definition_entry () -> ValidatingEntryType {
    entry! {
        name: "Definition",
        description: "Definitions that make up the Set Match Games system",
        sharing: Sharing::Public,

        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },

        validation: |validation_data: hdk::EntryValidationData<Definition>| {
            let definition = match validation_data {
                hdk::EntryValidationData::Create{
                    entry,
                    validation_data: _
                } => entry,
                _ => return Err("Cannot modify or delete Definitions".to_string())
            };
            valid_definition(&definition)
        }
    }
}

fn catalog_entry () -> ValidatingEntryType {
    entry! {
        name: "Catalog",
        description: "Entries that link to all definitions of a type",
        sharing: Sharing::Public,

        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },

        validation: |_validation_data: hdk::EntryValidationData<Catalog>| {
            Ok(())
        },

        links: [
            to! {
                "Definition",
                link_type: "Catalog",

                validation_package : || {
                    hdk::ValidationPackageDefinition::Entry
                },
                validation: |validation_data: hdk::LinkValidationData| {
                    if let hdk::LinkValidationData::LinkAdd{
                            link: LinkData{link: link_, .. },
                            validation_data: _
                        } = validation_data {
                        // check that base and target exist
                        let base = handle_get_catalog(link_.base().to_owned())?;
                        let target = handle_get_definition(link_.target().to_owned())?.definition;

                        // check that this link hasn't already been made
                        let links: Vec<Address> = get_links(link_.base(), LinkMatch::Exactly("Catalog"), LinkMatch::Any)?.addresses();
                        if links.contains(link_.target()) { return Err("Catalog link already exists.".to_string()) };

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

fn handle_create_definition(definition: Definition) -> ZomeApiResult<Address> {
    let new_entry = Entry::App("Definition".into(), definition.clone().into());
    let address: Address = hdk::commit_entry(&new_entry)?;
    hdk::debug(format!("handle_create_definition({:?})", address))?;

    let catalog_address: Address = match definition {
        Definition::Game{..} => handle_create_catalog("Game Catalog", "Game").unwrap(),
        Definition::Format{..} => handle_create_catalog("Format Catalog", "Format").unwrap(),
        Definition::Component{..} => handle_create_catalog("Component Catalog", "Component").unwrap(),
    };
    link_entries(&catalog_address, &address, "Catalog", "")?;

    Ok(address)
}

fn handle_create_catalog(name_str: &str, type_str: &str) -> ZomeApiResult<Address> {
    let catalog = Catalog {
        name: String::from(name_str),
        type_: String::from(type_str)
    };
    let new_entry = Entry::App("Catalog".into(), catalog.into());
    let address: Address = hdk::commit_entry(&new_entry)?;
    Ok(address)
}

fn handle_get_definition(address: Address) -> ZomeApiResult<DefWithAddr> {
    match hdk::get_entry(&address) {
        Ok(Some(Entry::App(_, api_result))) => Ok(DefWithAddr{
                definition: api_result.try_into()?,
                key: address
            }),
        _ => Err(String::from("No definition found").into())
    }
}

// TODO consider removing
fn handle_get_catalog(address: Address) -> ZomeApiResult<Catalog> {
    match hdk::get_entry(&address) {
        Ok(Some(Entry::App(_, api_result))) => Ok(api_result.try_into()?),
        _ => Err(String::from("No definition catalog found").into())
    }
}

fn handle_get_all_definitions_of_type(catalog_type: String) -> ZomeApiResult<Vec<DefWithAddr>> {
    let catalog_name: String = catalog_type.clone() + " Catalog";
    let catalog = Catalog {
        name: catalog_name.clone(),
        type_: catalog_type
    };

    let catalog_entry = Entry::App("Catalog".into(), catalog.into());
    let address: Address = entry_address(&catalog_entry)?;

    let links: Vec<Address> = get_links(&address, LinkMatch::Exactly("Catalog"), LinkMatch::Any)?.addresses();
    let definitions: Vec<DefWithAddr> = links.into_iter().map(|address| {
        handle_get_definition(address).unwrap()
    }).collect();
    Ok(definitions)
}

fn handle_get_definitions_from_catalog(catalog_type: String, catalog_name: String) -> ZomeApiResult<Vec<DefWithAddr>> {
    let catalog = Catalog {
        name: catalog_name.clone(),
        type_: catalog_type
    };

    let catalog_entry = Entry::App("Catalog".into(), catalog.into());
    let address: Address = entry_address(&catalog_entry)?;

    let links: Vec<Address> = get_links(&address, LinkMatch::Exactly("Catalog"), LinkMatch::Any)?.addresses();
    let definitions: Vec<DefWithAddr> = links.into_iter().map(|address| {
        handle_get_definition(address).unwrap()
    }).collect();
    Ok(definitions)
}

define_zome! {
    entries: [
        definition_entry(),
        catalog_entry()
    ]

    genesis: || { Ok(()) }

    functions: [
        create_definition: {
            inputs: |definition: Definition|,
            outputs: |address: ZomeApiResult<Address>|,
            handler: handle_create_definition
        }
        /*
        create_catalog: {
            inputs: |catalog: Catalog|,
             outputs: |address: ZomeApiResult<Address>|,
            handler: handle_create_catalog
        }
        */
        get_definition: {
            inputs: |address: Address|,
            outputs: |definition: ZomeApiResult<DefWithAddr>|,
            handler: handle_get_definition
        }
        get_catalog: {
            inputs: |address: Address|,
            outputs: |definition: ZomeApiResult<Catalog>|,
            handler: handle_get_catalog
        }
        get_all_definitions_of_type: {
            inputs: |catalog_type: String|,
            outputs: |linked_definitions: ZomeApiResult<Vec<DefWithAddr>>|,
            handler: handle_get_all_definitions_of_type
        }
        get_definitions_from_catalog: {
            inputs: |catalog_type: String, catalog_name: String|,
            outputs: |linked_definitions: ZomeApiResult<Vec<DefWithAddr>>|,
            handler: handle_get_definitions_from_catalog
        }
    ]

    traits: {
        hc_public [
            create_definition,
            // create_catalog,
            get_definition,
            get_catalog,
            get_all_definitions_of_type,
            get_definitions_from_catalog
        ]
    }
}
