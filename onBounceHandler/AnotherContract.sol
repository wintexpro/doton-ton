pragma solidity >= 0.6.0;

// Contract that can handle errors during intercontract communication.
contract AnotherContract {
	uint testFlag;

	constructor() public {
		tvm.accept();
	}

	function receiveMoney(uint128 value) external {
		require(value == 1);
		tvm.accept();
		testFlag = 2;
	}
	function receiveValues(uint16 value1, bool value2, uint64 value3) external {
		revert();
		require(value1 == 1, 101);
		require(value2 == true, 102);
		require(value3 == 1, 103);
		tvm.accept();
		testFlag = 4;
	}

	function getData() public returns (uint data_testFlag) {
		tvm.accept();
		return testFlag;
	}
}