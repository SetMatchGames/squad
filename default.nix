with import <nixpkgs> {};

let
  holonix = callPackage ./holonix-0.0.3 {};
in
stdenv.mkDerivation {
    name = "squad_dev_env";

    buildInputs = [ holonix ];
}