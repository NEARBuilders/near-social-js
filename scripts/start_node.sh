#!/usr/bin/env bash

SCRIPT_DIR=$(dirname "${0}")

source "${SCRIPT_DIR}"/set_vars.sh


# Public: Starts the node in a background process and saves the PID to .near/node.pid to be used to kill later.
#
# Examples
#
#   ./scripts/start_node.sh
#
# Returns exit code 0.
function main {
  set_vars

  printf "%b staring node \n" "${INFO_PREFIX}"

  # start the node
  near-sandbox --home ./.near run > /dev/null 2>&1 &

  sleep 1000

  printf "%b node started \n" "${INFO_PREFIX}"

  exit 0
}

# and so, it begins...
main
