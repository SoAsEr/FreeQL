#!/usr/bin/env bash

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"

cmake -DCMAKE_BUILD_TYPE=RELEASE ../../solver -DEMCC=$1 && make
