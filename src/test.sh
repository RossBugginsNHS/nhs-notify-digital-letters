#! /bin/bash

make -C ./asyncapigenerator coverage && \
make -C ./eventcatalogasyncapiimporter coverage && \
make -C ./cloudevents test
