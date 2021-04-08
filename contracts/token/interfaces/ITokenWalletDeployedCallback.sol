pragma ton-solidity ^0.40.0;

interface ITokenWalletDeployedCallback {
    function notifyWalletDeployed(address root) external;
}
