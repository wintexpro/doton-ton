pragma ton-solidity ^0.40.0;
pragma AbiHeader expire;

interface IBurnTokensCallback {

    function burnCallback(
        uint128 tokens,
        TvmCell payload,
        uint256 sender_public_key,
        address sender_address,
        address wallet_address
    ) external;
}