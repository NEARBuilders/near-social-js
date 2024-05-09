#!/usr/bin/env bash

SCRIPT_DIR=$(dirname "${0}")

source "${SCRIPT_DIR}"/set_vars.sh


# Public: Starts up a NEAR development node in Docker and runs tests against it.
#
# Examples
#
#   ./scripts/test.sh
#
# Returns exit code 1 if the node is unhealthy or the tests failed, otherwise, exit code 0 is returned.
function main {
  local attempt
  local exit_code
  local near_node_health

  attempt=0
  near_node_health=starting

  set_vars

  # start the services
  docker compose \
    -p builddao_airdroptool_test \
    -f docker-compose.yml \
    up \
    --build \
    -d

  # poll the healthchecks
  while [ ${attempt} -le 15 ]; do
    sleep 2

    printf "%b waiting for healthchecks, attempt: %b...\n" "${INFO_PREFIX}" "${attempt}"

    near_node_health=$(docker inspect -f "{{.State.Health.Status}}" builddao_near_node)

    if [[ "${near_node_health}" == "unhealthy" ]]; then
      printf "%b healthchecks failed\n" "${ERROR_PREFIX}"
      break
    fi

    if [[ "${near_node_health}" == "healthy" ]]; then
      break
    fi

    attempt=$(( attempt + 1 ))
  done

  printf "%b builddao_near_node=%b\n" "${INFO_PREFIX}" "${near_node_health}"

  # if the services are up and running, we can run tests
  if [[ "${near_node_health}" == "healthy" ]]; then
    yarn jest --passWithNoTests

    exit_code=$?
  else
    docker logs --details builddao_near_node

    exit_code=1
  fi

  # stop the services and remove
  docker compose \
    -p builddao_airdroptool_test \
    -f docker-compose.yml \
    down

  exit "${exit_code}"
}

# and so, it begins...
main
