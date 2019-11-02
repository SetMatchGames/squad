FROM nixos/nix

RUN mkdir /app
WORKDIR /app

# COPY holonix holonix

# TODO update this to use https://holochain.love to get the most recent version
RUN nix-env -f https://holochain.love -iA holochain.hc holochain.holochain

COPY . .

RUN hc package

CMD hc run --logging