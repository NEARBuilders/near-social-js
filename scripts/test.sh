#!/usr/bin/env bash

SCRIPT_DIR=$(dirname "${0}")

source "${SCRIPT_DIR}"/set_vars.sh


# Public: Starts up a NEAR development node and runs tests against it.
#
# Examples
#
#   ./scripts/test.sh
#
# Returns exit code 1 if the tests failed, otherwise, exit code 0 is returned.
function main {
  local exit_code

  set_vars

  # start the node
  "${SCRIPT_DIR}"/start_node.sh

  # run tests
  yarn jest --passWithNoTests

  exit_code=$?

  # stop the node
  "${SCRIPT_DIR}"/stop_node.sh

  exit "${exit_code}"
}

# and so, it begins...
main
