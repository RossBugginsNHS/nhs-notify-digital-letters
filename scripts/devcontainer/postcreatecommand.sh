#!/bin/bash

echo 'sorting certs'
sudo cp -nr /home/ca-certificates/. /usr/local/share/ca-certificates
sudo update-ca-certificates
echo 'sorted certs'

echo 'asdf setup starting'
rm -Rf ~/.asdf
git clone https://github.com/asdf-vm/asdf.git ~/.asdf;
chmod +x ~/.asdf/asdf.sh;
echo '. $HOME/.asdf/asdf.sh' >> ~/.zshrc
echo '. $HOME/.asdf/completions/asdf.bash' >> ~/.zshrc
source ~/.zshrc
echo 'asdf setup complete'

echo 'make config starting'
make config
echo 'make config starting'

echo 'jekyll setup starting'
jekyll --version && cd docs && bundle install
echo 'jekyll setup complete'
