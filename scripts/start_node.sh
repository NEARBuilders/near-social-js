#!/usr/bin/env bash

SCRIPT_DIR=$(dirname "${0}")

source "${SCRIPT_DIR}"/set_vars.sh


# Public: Starts the NEAR development node.
#
# Using the "-b|--background" flag will start the node on a background process.
#
# Examples
#
#   ./scripts/start_node.sh
#
# Returns exit code 0.
function main {
  local background
  local package

  set_vars

  package="start_node"
  background=false

  while [ $# -gt 0 ]; do
    case "$1" in
      -h|--help)
        echo "${package} - starts a NEAR development node"
        echo " "
        echo "${package} [options]"
        echo " "
        echo "options:"
        echo "-h, --help                show brief help"
        echo "-b, --background          runs the node in the background"
        exit 0
        ;;
      -b)
        background=true
        shift
        ;;
      --background)
        background=true
        shift
        ;;
      *)
        break
        ;;
    esac
  done

  if [ "${background}" = true ]; then
    printf "%b staring node in the background \n" "${INFO_PREFIX}"

    # start the node in the background, directing the log to null
    yarn near-sandbox --home ./.near run > /dev/null 2>&1 &

    sleep 2s

    printf "%b node started in the background, to stop the node, use \"scripts/stop_node.sh\" \n" "${INFO_PREFIX}"
  else
    printf "%b staring node, to stop the node, press Ctrl+C \n" "${INFO_PREFIX}"

    # start the node
    yarn near-sandbox --home ./.near run

    printf "%b node stopped \n" "${INFO_PREFIX}"
  fi

  exit 0
}

# and so, it begins...
main "$@"
