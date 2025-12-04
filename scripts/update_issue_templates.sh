#!/usr/bin/env bash

INFO_PREFIX="[\033[1;94mINFO\033[0m]"
ERROR_PREFIX="[\033[1;91mERROR\033[0m]"

function main {
  local version_included

  if [ -z "${1}" ]; then
    printf "%b no version specified, use: ./scripts/update_issue_templates.sh [version] \n" "${ERROR_PREFIX}"
    exit 1
  fi

  if [[ ! "${1}" =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]]; then
    printf "%b invalid semantic version, got '${1}', but should be in the format '1.0.0' \n" "${ERROR_PREFIX}"
    exit 1
  fi

  if [[ "${1}" =~ ^[0-9]+\.[0-9]+\.[0-9]-beta+ ]]; then
    printf "%b pre-release versions should not be added, skipping \n" "${INFO_PREFIX}"
    exit 0
  fi

  version_included=$(version="${1}" yq '(.body[]  | select(.id == "version") | .attributes.options) | contains([env(version)])' "${PWD}/.github/ISSUE_TEMPLATE/bug_report_template.yml")

  if ! "${version_included}"; then
    printf "%b adding version '%s' to .github/ISSUE_TEMPLATE/bug_report_template.yml \n" "${INFO_PREFIX}" "${1}"
    version="${1}" \
      yq -i '(.body[]  | select(.id == "version") | .attributes.options) = [env(version)] + (.body[]  | select(.id == "version") | .attributes.options)' "${PWD}/.github/ISSUE_TEMPLATE/bug_report_template.yml"
  else
    printf "%b version '%s' already added to .github/ISSUE_TEMPLATE/bug_report_template.yml \n" "${INFO_PREFIX}" "${1}"
  fi

  exit 0
}

main "$1"
