#! /usr/bin/env bash

set -eu -o pipefail

docker build -t focus_checker:latest .
docker build -t frame_server:latest ./frame_server

docker stop frame_server || true
docker rm -v frame_server || true
docker rm -v focus_tests || true

docker network rm test_net || true

docker network create test_net

docker run -p 8090:8090 -d --net test_net --name frame_server frame_server
docker run -it -v "$(pwd)/:/focus_checker" --name focus_tests --net test_net focus_checker:latest /focus_checker/test.sh
