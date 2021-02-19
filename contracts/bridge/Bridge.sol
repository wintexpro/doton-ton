pragma ton-solidity ^0.36.0;

interface IBridgeVoteController {
    function voteByBridge(address voter, uint8 choice, uint8 chainId, bytes32 messageType, address handlerAddress, uint64 nonce, TvmCell data) external;
}

contract Bridge {
    address accessControllerAddress;
    address voteControllerAddress;

    TvmCell relayerInitState;
    mapping (bytes32 => address) handlers; 

    constructor(TvmCell _relayerInitState, address _accessControllerAddress, address _voteControllerAddress) public {
        tvm.accept();
        relayerInitState = _relayerInitState;
        accessControllerAddress = _accessControllerAddress;
        voteControllerAddress = _voteControllerAddress;
    }

    modifier isValidRelayer(uint256 relayerPublicKey) {
        TvmCell relayerInitStateWithPublicKey = tvm.insertPubkey(relayerInitState, relayerPublicKey);
        require (msg.sender.value == tvm.hash(relayerInitStateWithPublicKey));
        _;
    }

    function adminSetHandler(bytes32 messageType, address handlerAddress, uint256 relayerPubKey) isValidRelayer(relayerPubKey) external {
        handlers[messageType] = handlerAddress;
    }

    function relayerVoteForProposal(uint8 choice, uint8 chainId, bytes32 messageType, uint64 nonce, TvmCell data, uint256 relayerPubKey) isValidRelayer(relayerPubKey) external view {
        require(msg.value >= 400000000); // TODO ???
        require(handlers[messageType] != address(0));
        IBridgeVoteController(voteControllerAddress).voteByBridge{bounce:true, value:350000000}(msg.sender, choice, chainId, messageType, handlers[messageType], nonce, data);
    }

    function getHandlerAddressByMessageType(bytes32 messageType) external view returns (address) {
        return handlers[messageType];
    }
}