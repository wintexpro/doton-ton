pragma solidity >= 0.6.0;

contract BurnedTokensHandler {

    address tip3RootAddress;

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
        require(msg.sender == tip3RootAddress);
        address(this).transfer(100000000, false, 0, payload);
    }

    function deposit(uint8 destinationChainID, bytes32 resourceID, uint64 depositNonce, uint128 amount, bytes32 recipient) external pure {
        require (msg.sender.value == address(this).value);
        emit Deposit(destinationChainID, resourceID, depositNonce, amount, recipient);
    }


}