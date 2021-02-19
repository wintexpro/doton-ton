pragma ton-solidity ^0.36.0;

interface ITokenWalletDeployedCallback {
    function notifyWalletDeployed(address root) external;
}
