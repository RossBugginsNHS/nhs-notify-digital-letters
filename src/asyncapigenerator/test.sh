#! /bin/bash
set -euo pipefail
PYTHON=$1

cd ../.. && \
echo "PATH IS $PATH" && \
asdf current || echo "asdf current failed" && \
echo "Current working directory: $(pwd)" && \
ls -la $HOME/.asdf/shims && \
asdf reshim python && \
whereis pytest || echo "whereis pytest failed" && \
whereis python3 || echo "whereis python3 failed" && \
which pytest || echo "which pytest failed" && \
which python3 || echo "which python3 failed" && \
$PYTHON -m pytest src/asyncapigenerator/tests/ --cov=src/asyncapigenerator --cov-config=src/asyncapigenerator/pytest.ini --cov-report=html:src/asyncapigenerator/htmlcov --cov-report=term-missing --cov-report=xml:src/asyncapigenerator/coverage.xml
