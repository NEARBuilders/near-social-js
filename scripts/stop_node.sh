#!/usr/bin/env bash

SCRIPT_DIR=$(dirname "${0}")

source "${SCRIPT_DIR}"/set_vars.sh


# Public: Starts up a NEAR development node in Docker.
#
# Examples
#
#   ./scripts/start_node.sh
#
# Returns exit code 0.
function main {
  set_vars

  # stop the node
  docker compose \
    -p builddao_near_social_sdk \
    -f docker-compose.yml \
    down

  exit 0
}

# and so, it begins...
main
