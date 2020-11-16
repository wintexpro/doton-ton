/**
 * Helpук functions for tests
 */


function fromHexWith0x(_string) {
  return Buffer.from(_string.substring(2), 'hex').toString('utf8')
}

function toHex(_string, isWith0x = true) {
  return (isWith0x ? '0x' : '') + Buffer.from(_string, 'utf8').toString('hex')
}

module.exports.fromHexWith0x = fromHexWith0x;
module.exports.toHex = toHex;
