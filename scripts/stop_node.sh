#!/usr/bin/env bash

SCRIPT_DIR=$(dirname "${0}")

source "${SCRIPT_DIR}"/set_vars.sh


# Public: Kills the node's process.
#
# Examples
#
#   ./scripts/start_node.sh
#
# Returns exit code 0.
function main {
  local node_pid

  set_vars

  printf "%b stopping the node \n" "${INFO_PREFIX}"

  # stop the node
  pkill -f "near-sandbox"

  printf "%b stopped node \n" "${INFO_PREFIX}"

  exit 0
}

# and so, it begins...
main
