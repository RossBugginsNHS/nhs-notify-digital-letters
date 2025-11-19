#!/bin/bash
set -euo pipefail

# Constants
readonly ASDF_INSTALL_PATH="/usr/local/bin/asdf"
readonly ASDF_VERSION="0.18.0"
readonly SHELL_RC_FILES=(".bashrc" ".zshrc")

# Configuration - can be overridden for testing
ASDF_HOME="${ASDF_HOME:-$HOME}"
ASDF_DOWNLOAD_URL="${ASDF_DOWNLOAD_URL:-https://github.com/asdf-vm/asdf/releases/download/v${ASDF_VERSION}/asdf-v${ASDF_VERSION}-linux-amd64.tar.gz}"
ASDF_TEMP_DIR="${ASDF_TEMP_DIR:-$(mktemp -d)}"

install_apt_deps(){
  echo "====================== INSTALL APT DEPS =============================="
  echo "Installing apt packages listed in packages.txt..."

  if [ ! -f "packages.txt" ]; then
    echo "⚠️  packages.txt not found, skipping apt package installation"
    return 0
  fi

  sudo DEBIAN_FRONTEND=noninteractive apt-get update -qq && \
  xargs -a packages.txt sudo DEBIAN_FRONTEND=noninteractive apt-get install -y || \
  echo "⚠️  Some apt packages failed to install, continuing..."
}

install_asdf(){
  echo "====================== INSTALL ASDF =============================="
  # Extract filename from URL
  local tarball="$ASDF_TEMP_DIR/${ASDF_DOWNLOAD_URL##*/}"

  # Ensure cleanup happens no matter what
  trap "rm -f '$tarball'" RETURN

  # Download asdf
  echo "Downloading asdf to $tarball..."
  if ! curl -fsSL -o "$tarball" "$ASDF_DOWNLOAD_URL"; then
    echo "❌ ERROR: Failed to download asdf from $ASDF_DOWNLOAD_URL"
    return 1
  fi

  # Extract to /usr/local/bin
  if ! sudo tar -xzf "$tarball" -C /usr/local/bin; then
    echo "❌ ERROR: Failed to extract asdf"
    return 1
  fi

  # Set executable permissions
  if ! sudo chmod +x "$ASDF_INSTALL_PATH"; then
    echo "❌ ERROR: Failed to set permissions on asdf"
    return 1
  fi

  echo "✅ asdf v${ASDF_VERSION} installed successfully"
}

configure_shell_rc_file() {
  local rc_name=$1
  local rc_file="$ASDF_HOME/$rc_name"

  # Skip if rc file doesn't exist (user probably doesn't use this shell)
  if [ ! -f "$rc_file" ]; then
    echo "ℹ️  $rc_name not found, skipping configuration"
    return 0
  fi

  # Check if already configured
  if grep -q "ASDF_DATA_DIR" "$rc_file" 2>/dev/null; then
    echo "✅ ASDF environment already configured in $rc_name"
    return 0
  fi

  # Add configuration
  echo "Adding ASDF environment variables to $rc_name..."
  {
    echo "export ASDF_DATA_DIR=$ASDF_HOME/.asdf"
    echo "export PATH=\$ASDF_DATA_DIR/shims:\$ASDF_DATA_DIR/bin:/usr/local/bin:\$PATH"
  } >> "$rc_file" || {
    echo "⚠️  Failed to write to $rc_name, skipping"
    return 1
  }

  echo "✅ Successfully configured $rc_name"
}

persist_asdf_env_to_shell_rc(){
  # Ensure persistent environment setup in shell RC files
  local configured=false

  for rc_file in "${SHELL_RC_FILES[@]}"; do
    if configure_shell_rc_file "$rc_file"; then
      configured=true
    fi
  done

  if ! $configured; then
    echo "⚠️  Warning: Failed to configure any shell RC files"
  fi
}

configure_asdf_for_github_actions(){
  # Make this natively available to GitHub Actions steps
  if [ -n "${GITHUB_ENV:-}" ] && [ -n "${GITHUB_PATH:-}" ]; then
    echo "Adding ASDF to GITHUB_PATH and GITHUB_ENV..." && \
    echo "ASDF_DATA_DIR=$ASDF_HOME/.asdf" >> "$GITHUB_ENV" && \
    echo "$ASDF_DATA_DIR/shims"  >> "$GITHUB_PATH" && \
    echo "$ASDF_DATA_DIR/bin" >> "$GITHUB_PATH"
  else
    echo "Not running in GitHub Actions, skipping GitHub environment setup"
  fi
}

setup_asdf_current_session(){
  # Immediately set up environment in the current shell if asdf exists but isn't accessible
  if [ -f "$ASDF_INSTALL_PATH" ] && ! command -v asdf &> /dev/null; then
    echo "Setting up asdf environment for current shell session..."
    export ASDF_DATA_DIR=$ASDF_HOME/.asdf
    export PATH=$ASDF_DATA_DIR/shims:$ASDF_DATA_DIR/bin:/usr/local/bin:$PATH
  else
    if [ -f "$ASDF_INSTALL_PATH" ]; then
      echo "✅ asdf is already accessible from PATH"
    else
      echo "ℹ️  asdf binary not yet installed, skipping current session setup"
    fi
  fi
}

setup_asdf(){
  # Check if asdf binary file exists in the installation location
  if [ -f "$ASDF_INSTALL_PATH" ]; then
    echo "====================== ASDF ALREADY INSTALLED =============================="
    echo "✅ asdf binary found at $ASDF_INSTALL_PATH"
  else
    echo "====================== ASDF NOT FOUND, INSTALLING =============================="
    install_asdf
  fi
  setup_asdf_current_session
}

install_asdf_plugins(){
  echo "====================== INSTALL ASDF PLUGINS =============================="
  if ! make _install-dependencies; then
    echo "❌ ERROR: Failed to install asdf plugins"
    exit 1
  fi
  echo "✅ asdf plugins installed successfully"
}

verify_asdf_configuration(){
  echo "====================== VERIFY ASDF CONFIGURATION =============================="
  echo "ASDF data dir: ${ASDF_DATA_DIR:-not set}"
  echo "PATH: $PATH"
  if ! asdf current; then
    echo "❌ ERROR: asdf is not fully configured. Cannot proceed with project dependencies installation."
    exit 1
  fi
  echo "✅ asdf configuration verified successfully"
}

install_project_dependencies()
{
  echo "====================== INSTALL PROJECT DEPENDENCIES =============================="
  echo "Installing documentation dependencies..."
  make -C docs install
}

# Main execution flow
install_apt_deps
setup_asdf
persist_asdf_env_to_shell_rc
configure_asdf_for_github_actions
install_asdf_plugins
verify_asdf_configuration
install_project_dependencies
