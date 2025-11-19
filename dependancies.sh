#!/bin/bash
set -euo pipefail

install_apt_deps(){
  echo "====================== INSTALL APT DEPS =============================="
  echo "Installing apt packages listed in packages.txt..."
  sudo apt-get update && cat packages.txt | xargs sudo apt-get install -y || echo "Couldn't get apt packages, continuing..."
}

install_asdf(){
  echo "====================== INSTALL ASDF =============================="
  curl -LO https://github.com/asdf-vm/asdf/releases/download/v0.18.0/asdf-v0.18.0-linux-amd64.tar.gz && \
  sudo tar -xvzf asdf-v0.18.0-linux-amd64.tar.gz -C /usr/local/bin && \
  sudo chmod +x /usr/local/bin/asdf && \
  rm asdf-v0.18.0-linux-amd64.tar.gz
}

set_asdf_envs(){
  export ASDF_DATA_DIR=$HOME/.asdf && \
  export PATH=$ASDF_DATA_DIR/shims:$ASDF_DATA_DIR/bin:/usr/local/bin:$PATH && \
  echo "export ASDF_DATA_DIR=$HOME/.asdf" >> $HOME/.bashrc && \
  echo "export PATH=$ASDF_DATA_DIR/shims:$ASDF_DATA_DIR/bin:/usr/local/bin:$PATH" >> $HOME/.bashrc && \
  echo "export ASDF_DATA_DIR=$HOME/.asdf" >> $HOME/.zshrc && \
  echo "export PATH=$ASDF_DATA_DIR/shims:$ASDF_DATA_DIR/bin:/usr/local/bin:$PATH" >> $HOME/.zshrc
}

set_asdf_github_envs(){
  # Make this natively available to GitHub Actions steps
  if [ -n "${GITHUB_ENV:-}" ] && [ -n "${GITHUB_PATH:-}" ]; then
    echo "Adding ASDF to GITHUB_PATH and GITHUB_ENV..." && \
    echo "ASDF_DATA_DIR=$HOME/.asdf" >> "$GITHUB_ENV" && \
    echo "$ASDF_DATA_DIR/shims"  >> "$GITHUB_PATH" && \
    echo "$ASDF_DATA_DIR/bin" >> "$GITHUB_PATH"
  fi
}

install_or_skip_asdf(){
  # Check if asdf command is available
  if command -v asdf &> /dev/null; then
    echo "====================== ASDF ALREADY INSTALLED =============================="
    echo "✅ asdf is available on PATH"
    asdf --version
  else
    echo "====================== ASDF NOT FOUND, INSTALLING =============================="
    install_asdf
    set_asdf_envs
  fi
}

install_deps(){
  echo "====================== INSTALL DEPS =============================="
  make _install-dependencies
}

project_deps()
{
  echo "====================== INSTALL PROJECT DEPS =============================="
  echo "Installing project dependencies..."
  echo "Installing documentation dependencies..."
  echo "ASDF data dir: $$ASDF_DATA_DIR"
  echo "PATH: $$PATH"
  asdf current || "failed to get asdf current"
  echo "+++++++++++++++++ DOCS +++++++++++++++++++++++++++ "
  make -C docs install
}

install_apt_deps
install_or_skip_asdf
set_asdf_github_envs

install_deps
project_deps
