#! /bin/bash

make -C ./cloudevents install && \
make -C ./asyncapigenerator install-dev && \
make -C ./cloudeventjekylldocs install-dev && \
make -C ./eventcatalogasyncapiimporter install-dev
