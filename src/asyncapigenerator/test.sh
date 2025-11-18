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
$PYTHON -m pytest src/asyncapigenerator/tests/ --cov=src/asyncapigenerator --cov-config=src/asyncapigenerator/pytest.ini --cov-report=html:src/asyncapigenerator/htmlcov --cov-report=term-missing --cov-report=xml:src/asyncapigenerator/coverage.xml
