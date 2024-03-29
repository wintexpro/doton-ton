pragma ton-solidity ^0.40.0;
pragma AbiHeader expire;

interface IBurnableByRootTokenRootContract {
    function proxyBurn(
        uint128 tokens,
        address sender_address,
        address callback_address,
        TvmCell callback_payload
    ) external;
}