#!/bin/bash

cp .env.production .env
yarn postinstall
yarn cie-ios:ci
yarn cie-ios:ci
