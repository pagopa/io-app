package expo.modules.cie

import it.pagopa.io.app.cie.CieLogger

class Atr(private val atr: ByteArray) {
  fun getCieType(): CieType {
    CieLogger.i("ATR_MAIN:", this.atr.toHexString())
    CieType.entries.forEach {
      CieLogger.i("ATR_OTHE:", it.atr.toHexString())
      if (it.atr.isSubsetInOrder(this.atr))
        return it
    }
    return CieType.UNKNOWN
  }

  private fun ByteArray.toHexString(): String {
    return joinToString(separator = " ") { byte ->
      "0x%02X".format(byte)
    }
  }

  private fun ByteArray.isSubsetInOrder(second: ByteArray): Boolean {
    if (this.size > second.size) return false
    var indexSecond = 0
    for (element in this) {
      // Find the element in the second array starting from the current index
      while (indexSecond < second.size && second[indexSecond] != element) {
        indexSecond++
      }
      // If we reach the end of the second array without finding the element, return false
      if (indexSecond == second.size) {
        return false
      }
      // Increment the index for the next iteration
      indexSecond++
    }
    return true
  }
}
