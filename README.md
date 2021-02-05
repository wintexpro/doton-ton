# DOTON TON Smart contracts

DOTON uses Solidity smart contracts to enable transfers to and from TVM compatible chains. These contracts consist of a core bridge contracts: Bridge, BridgeVoteController, Proposal, Handler. As a source chain of transfer flow, ton implementation has Sender and Receiver contracts.

## Solidity contract workflow

Firstly, you should install solidity build tools: [TON Solidity Compiler](https://github.com/tonlabs/TON-Solidity-Compiler/) and [TVM Linker](https://github.com/tonlabs/TVM-linker/tree/master/tvm_linker)

There is a **build.sh** bash script inside *scripts* folder. You should provide a path to your compiler executable binary in **local_variables.sh** script by set up **solcExec** variable. (EX: /usr/bin/solc or just solc). Build script will automatically compile contracts and store them into TVC files (with tvm_linker). Builded .tvc files and .abi.json files will be placed onto build directory. Files ready for deploying.
