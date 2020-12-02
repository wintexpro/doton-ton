pragma solidity >= 0.6.0;

contract WintexGiver {
    constructor() public {
        tvm.accept();
    }

    function sendMeGramsPls(address dest, uint64 amount) public {
	tvm.accept();        
	// require(address(this).balance > amount, 60);
        dest.transfer({value:amount, bounce:false});
    }
}
