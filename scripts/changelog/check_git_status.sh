#!/bin/bash
if [[ $(git diff --stat) != '' ]]; then
  echo -e "\033[1;31m Git directory is dirty! Please commit or stash your changes before a release!"
  exit 1
else
  echo 'Git directory is clean!'
fi
