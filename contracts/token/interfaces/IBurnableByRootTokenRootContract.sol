pragma ton-solidity ^0.36.0;
pragma AbiHeader expire;

interface IBurnableByRootTokenRootContract {
    function burnTokensOnWallet(
        uint128 tokens,
        address sender_address,
        address callback_address,
        TvmCell callback_payload
    ) external;
}
