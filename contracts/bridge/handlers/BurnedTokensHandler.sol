pragma ton-solidity ^0.36.0;

contract BurnedTokensHandler {

    address tip3RootAddress;

    uint8 error_wrong_sender            = 101;
    uint8 error_wrong_decoded_amount    = 103;

    event Deposit(uint8 destinationChainID, bytes32 resourceID, uint64 depositNonce, uint128 amount, bytes32 recipient);

    constructor (
        address _tip3RootAddress
    ) public {
        tvm.accept();
        tip3RootAddress = _tip3RootAddress;
    }

    function burnCallback(
        uint128 tokens,
        TvmCell payload,
        uint256 sender_public_key,
        address sender_address,
        address wallet_address
    ) external {
        require(msg.sender == tip3RootAddress, error_wrong_sender);
        (
            uint32 _id,
            uint8 _destinationChainID,
            uint256 _resourceID,
            uint64 _depositNonce,
            uint128 _amount,
            uint256 _recipient
        ) = payload.toSlice().decode(uint32, uint8, uint256, uint64, uint128, uint256);
        require(tokens == _amount, error_wrong_decoded_amount);
        address(this).transfer(100000000, false, 0, payload);
    }

    function deposit(uint8 destinationChainID, bytes32 resourceID, uint64 depositNonce, uint128 amount, bytes32 recipient) external pure {
        require (msg.sender.value == address(this).value, 102);
        emit Deposit(destinationChainID, resourceID, depositNonce, amount, recipient);
    }


}