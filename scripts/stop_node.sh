#!/usr/bin/env bash

SCRIPT_DIR=$(dirname "${0}")

source "${SCRIPT_DIR}"/set_vars.sh


# Public: Stops a NEAR development node started by near-sandbox.
#
# Examples
#
#   ./scripts/start_node.sh
#
# Returns exit code 0.
function main {
  local package

  set_vars

  package="stop_node"

  while [ $# -gt 0 ]; do
    case "$1" in
      -h|--help)
        echo "${package} - stops a NEAR development node"
        echo " "
        echo "${package} [options]"
        echo " "
        echo "options:"
        echo "-h, --help                show brief help"
        exit 0
        ;;
      *)
        break
        ;;
    esac
  done

  printf "%b stopping the node \n" "${INFO_PREFIX}"

  # stop the node
  pkill -f "near-sandbox"

  sleep 2s

  printf "%b stopped node \n" "${INFO_PREFIX}"

  exit 0
}

# and so, it begins...
main "$@"
