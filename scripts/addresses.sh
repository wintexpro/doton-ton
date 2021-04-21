#!/bin/bash
accessControllerCommand=`tonos-cli genaddr --setkey ./keys/AccessController.keys.json ./rbac/AccessController.tvc ./rbac/AccessController.abi.json`
accessControllerAddress=`echo $accessControllerCommand | grep -o -P '(?<=Raw address: ).*(?= t)'`
echo "Access Controller address: $accessControllerAddress"
epochControllerCommand=`tonos-cli genaddr --setkey ./keys/EpochController.keys.json ./bridge/EpochController.tvc ./bridge/EpochController.abi.json`
epochControllerAddress=`echo $epochControllerCommand | grep -o -P '(?<=Raw address: ).*(?= t)'`
echo "Bridge Vote Controller address: $epochControllerAddress"
bridgeCommand=`tonos-cli genaddr --setkey ./keys/Bridge.keys.json ./bridge/Bridge.tvc ./bridge/Bridge.abi.json`
bridgeAddress=`echo $bridgeCommand | grep -o -P '(?<=Raw address: ).*(?= t)'`
echo "Bridge address: $bridgeAddress"
handlerAddressCommand=`tonos-cli genaddr --setkey ./keys/Handler.keys.json ./bridge/Handler.tvc ./bridge/Handler.abi.json`
handlerAddress=`echo $handlerAddressCommand | grep -o -P '(?<=Raw address: ).*(?= t)'`
echo "Handler address: $handlerAddress"
