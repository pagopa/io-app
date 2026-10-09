package it.ipzs.cieidsdk.nfc

import java.util.Arrays

internal class ApduResponse {

    var response: ByteArray = byteArrayOf()
    var swByte: ByteArray = byteArrayOf()

    val swHex: String
        @Throws(Exception::class)
        get() = bytesToHex(this.swByte)
    val swInt: Int
        @Throws(Exception::class)
        get() = AppUtil.toUint(this.swByte)


    @Throws(Exception::class)
    constructor(fullResponse: ByteArray) {
        this.response = Arrays.copyOfRange(fullResponse, 0, fullResponse.size - 2)
        this.swByte = Arrays.copyOfRange(fullResponse, fullResponse.size - 2, fullResponse.size)
    }

    @Throws(Exception::class)
    constructor(res: ByteArray, sw: ByteArray) {
        this.response = res
        this.swByte = sw
    }

    @Throws(Exception::class)
    private fun bytesToHex(bytes: ByteArray): String {
        val sb = StringBuilder(bytes.size * 2)
        for (i in bytes.indices) {
            sb.append(String.format("%02x", bytes[i]))
        }
        return sb.toString()
    }

}
