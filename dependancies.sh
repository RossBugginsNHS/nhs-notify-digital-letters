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
  rm asdf-v0.18.0-linux-amd64.tar.gz && \
  pwd && \
  ls -la && \
  /usr/local/bin/asdf --version && \
  export ASDF_DATA_DIR=$HOME/.asdf && \
  export PATH=$ASDF_DATA_DIR/shims:$ASDF_DATA_DIR/bin:/usr/local/bin:$PATH && \
  echo "export ASDF_DATA_DIR=$HOME/.asdf" >> $HOME/.bashrc && \
  echo "export PATH=$ASDF_DATA_DIR/shims:$ASDF_DATA_DIR/bin:/usr/local/bin:$PATH" >> $HOME/.bashrc && \
  echo "export ASDF_DATA_DIR=$HOME/.asdf" >> $HOME/.zshrc && \
  echo "export PATH=$ASDF_DATA_DIR/shims:$ASDF_DATA_DIR/bin:/usr/local/bin:$PATH" >> $HOME/.zshrc && \

  # Make this natively available to GitHub Actions steps
  echo "Adding ASDF to GITHUB_PATH and GITHUB_ENV..." && \
  echo "ASDF_DATA_DIR=$HOME/.asdf" >> $GITHUB_ENV && \
  echo "$ASDF_DATA_DIR/shims"  >> "$GITHUB_PATH" && \
  echo "$ASDF_DATA_DIR/bin" >> "$GITHUB_PATH" && \
  asdf --version
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
install_asdf
install_deps
project_deps
