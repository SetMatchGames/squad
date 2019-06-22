FROM rust:1.33.0

# use Holochain's chosen rust release
RUN rustup override set nightly-2019-01-24

# Get Holochain tools
RUN cargo install hc --force --git https://github.com/holochain/holochain-rust.git --tag v0.0.17-alpha2
RUN cargo install holochain --force --git https://github.com/holochain/holochain-rust.git --tag v0.0.17-alpha2

# set WASM target
RUN rustup target add wasm32-unknown-unknown

COPY . ./squad-holochain
WORKDIR /squad-holochain

RUN hc package
CMD hc run