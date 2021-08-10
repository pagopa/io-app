#!/bin/bash

cp .env.production .env
yarn postinstall
yarn cie-ios:dev
yarn cie-ios:prod
