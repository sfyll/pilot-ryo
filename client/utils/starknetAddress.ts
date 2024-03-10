import type { Address } from 'abitype'

const addressRegex = /^0x[a-fA-F0-9]{63}$/

/**
* Viem isAddress function without isStrict mode (i.e. check-summed)
* and without cache usage
*
*/
export function isStarknetAddress(
  address: string,
): address is Address {

  const result = (() => {
    if (!addressRegex.test(address)) return false
    if (address.toLowerCase() === address) return true
    return true
  })()
  return result
}

