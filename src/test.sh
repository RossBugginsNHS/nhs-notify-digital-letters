#! /bin/bash
set -euo pipefail

make -C ./asyncapigenerator coverage && \
make -C ./eventcatalogasyncapiimporter coverage && \
make -C ./cloudevents test
