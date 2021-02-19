pragma solidity >= 0.6.0;
pragma AbiHeader expire;

interface ITONTokenWalletWithNotifiableTransfers {

    function setReceiveCallback(address receive_callback_) external;

    function transferWithNotify(
        address to,
        uint128 tokens,
        uint128 grams,
        TvmCell payload
    ) external;

    function transferFromWithNotify(
        address from,
        address to,
        uint128 tokens,
        uint128 grams,
        TvmCell payload
    ) external;
}
