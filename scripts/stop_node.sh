#!/usr/bin/env bash

SCRIPT_DIR=$(dirname "${0}")

source "${SCRIPT_DIR}"/set_vars.sh


# Public: Gets the saved node PID from .near/node.pid and kills the background process.
#
# Examples
#
#   ./scripts/start_node.sh
#
# Returns exit code 0.
function main {
  local node_pid

  set_vars

  printf "%b killing node process \n" "${INFO_PREFIX}"

  # stop the node
  pkill -f "near-sandbox"

  exit 0
}

# and so, it begins...
main
