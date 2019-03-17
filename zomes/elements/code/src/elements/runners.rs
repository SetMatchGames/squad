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

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
enum GameOutcome {
    // Outcome in which there is a single winner
    Win {
        winner_id: AgentId,
        loser_ids: Vec<AgentId>,
    },

    // Outcome of a game that sorts all players into 1st..N place
    Sorting {
        sorted_player_ids: Vec<AgentId>,
    },
    // Outcome with no winner and no loser
    Draw { player_ids: Vec<AgentId> },
    // Outcome where some number of players have forfeited the game
    Forfeit {
        forfeited_player_ids: Vec<AgentId>,
        other_player_ids: Vec<AgentId>,
    },
    // Outcome where the game has been abandoned
    Abandoned {
        player_ids: Vec<AgentId>
    },
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
pub struct GameResult {
    game: Address,
    active_mode: Address,
    format: Address,
    outcome: GameOutcome,
    // TODO consider start and end time
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
pub struct DNARunner {
    dna_url: String,
    ui_url: String,
}

impl DNARunner {
    fn run(&self, format_address: String) -> GameResult {
        unimplemented!()
    }
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
pub struct MockRunner {
    run_count: i32,
    run_args: Vec<String>,
}

impl MockRunner {
    fn run(&mut self, format_address: String) -> GameResult {
        self.run_count += 1;
        self.run_args.push(format_address);
        return GameResult{
            game: "MockAddress".into(),
            active_mode: "MockAddress".into(),
            format: "MockAddress".into(),
            outcome: GameOutcome::Draw { player_ids: vec![] },
        };
    }
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
pub enum Runner {
    Mock(MockRunner),
    DNA(DNARunner),
}

impl Runner {
    fn run(&mut self, format_address: String) -> GameResult {
        match self {
            Runner::Mock(r) => r.run(format_address),
            Runner::DNA(r) => r.run(format_address),
        }
    }
}
