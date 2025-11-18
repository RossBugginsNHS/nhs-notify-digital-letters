#! /bin/bash
set -euo pipefail

PYTHON=$1
cd ../.. && \
echo "Current working directory: $(pwd)" && \
ls -la $HOME/.asdf/shims && \
asdf reshim python && \
whereis pytest && \
whereis python3 && \
which pytest && \
which python3 && \
echo "PATH IS $PATH" && \
$PYTHON -m pytest src/eventcatalogasyncapiimporter/tests --cov=src/eventcatalogasyncapiimporter --cov-config=src/eventcatalogasyncapiimporter/pytest.ini --cov-report=html:src/eventcatalogasyncapiimporter/htmlcov --cov-report=term-missing --cov-report=xml:src/eventcatalogasyncapiimporter/coverage.xml
