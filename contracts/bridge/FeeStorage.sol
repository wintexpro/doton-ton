pragma ton-solidity ^0.40.0;


contract FeeStorage {
    TvmCell relayerInitState;
    mapping (uint256 => uint32) fee;

    uint8 error_invalid_relayer   = 101;
    uint8 error_method_has_no_fee = 102;

    constructor(TvmCell _relayerInitState) public {
        tvm.accept();
        relayerInitState = _relayerInitState;
    }

    modifier isValidRelayer(uint256 relayerPublicKey) {
        TvmCell relayerInitStateWithPublicKey = tvm.insertPubkey(relayerInitState, relayerPublicKey);
        require (msg.sender.value == tvm.hash(relayerInitStateWithPublicKey), error_invalid_relayer);
        _;
    }

    function adminSetFee(uint256 shaMethod, uint32 value, uint256 relayerPubKey) isValidRelayer(relayerPubKey) external {
        fee[shaMethod] = value;
    }

    function estimateFee(uint256 shaMethod, uint8 price) external view returns (uint) {
        require(fee[shaMethod] != 0, error_method_has_no_fee);
        return fee[shaMethod] * price;
    }
}