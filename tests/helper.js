/**
 * Helpук functions for tests
 */

function fromHexWith0x (_string) {
  return Buffer.from(_string.substring(2), 'hex').toString('utf8')
}

function toHex (_string, isWith0x = true) {
  return (isWith0x ? '0x' : '') + Buffer.from(_string, 'utf8').toString('hex')
}

/** runLocal for contract from manager (contract MUST BE in manager) */
async function runLocal (_manager, contract, functionName, input) {
  const runLocalRes = await _manager.client.contracts.runLocal({
    address: _manager.contracts[contract].address,
    functionName: functionName,
    abi: _manager.contracts[contract].contractPackage.abi,
    input: input
  }).catch(e => console.log(e))
  return runLocalRes.output
}

module.exports.fromHexWith0x = fromHexWith0x
module.exports.toHex = toHex
module.exports.runLocal = runLocal
