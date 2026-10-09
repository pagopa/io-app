package it.ipzs.cieidsdk.nfc


import java.io.ByteArrayInputStream
import java.lang.IllegalStateException
import java.util.*

internal class Asn1TagParseException(message : String) : IllegalStateException(message)

internal class Asn1Tag @Throws(Exception::class)
constructor(objects: Array<Any>) {




    var unusedBits: Byte = 0
    var tag: ByteArray = byteArrayOf()
    var data: ByteArray = byteArrayOf()
    var children: List<Asn1Tag> = emptyList()
    var startPos: Long = 0
    var endPos: Long = 0
    var constructed: Long = 0
    var childSize: Long = 0

    val isTagConstructed: Boolean
        @Throws(Exception::class)
        get() = this.tag[0].toInt() and 0x20 != 0
    private val tagRawNumber: Int
        @Throws(Exception::class)
        get() {
            var num = tag[0].toInt()
            for (i in 1 until tag.size) {
                num = num shl 8 or tag[i].toInt()
            }
            return num
        }

    init {
        this.tag = ByteArray(objects.size)
        for (i in objects.indices)
            this.tag[i] = objects[i] as Byte
    }

    @Throws(Exception::class)
    fun child(tagNum: Int): Asn1Tag {
        return children[tagNum]
    }

    @Throws(Exception::class)
    fun Child(tagNum: Int, tagCheck: Byte): Asn1Tag {
        val tag = children[tagNum]
        if (tag.tagRawNumber != tagCheck.toInt())
            throw Asn1TagParseException("Check del tag fallito")
        return tag
    }


    @Throws(Exception::class)
    fun childWithTagID(tag: ByteArray): Asn1Tag? {
        for (subTag in children) {
            if (subTag.tag.contentEquals(tag))
                return subTag
        }
        return null
    }


    companion object {


        private var iterazione: Int = 0

        @Throws(Exception::class)
        fun unsignedToBytes32(x: Int): Long {
            return if (x > 0) x.toLong() else Math.pow(2.0, 32.0).toLong() + x
        }


        @Throws(Exception::class)
        fun parse(asn: ByteArrayInputStream, start: Long, length: Long, reparse: Boolean): Asn1Tag? {
            iterazione++
            var readPos = 0
            var tag = unsignedToBytes(asn.read().toByte())//96
            if (readPos.toLong() == length)
                throw Asn1TagParseException("Lunghezza non corretta")
            val tagVal = ArrayList<Byte>()
            readPos++
            tagVal.add(tag.toByte())
            if (tag and 0x1f == 0x1f) {
                while (true) {
                    if (readPos.toLong() == length)
                        throw Asn1TagParseException("Lunghezza non corretta")
                    tag = asn.read()
                    readPos++
                    tagVal.add(tag.toByte())
                    if (tag and 0x80 != 0x80) {
                        break
                    }
                }
            }
            // leggo la lunghezza
            if (readPos.toLong() == length)
                throw Asn1TagParseException("Lunghezza non corretta")
            var len = unsignedToBytes(asn.read().toByte()).toLong()
            readPos++
            if (len > unsignedToBytes(0x80.toByte())) {
                val lenlen = unsignedToBytes((len - 0x80).toByte())
                len = 0
                for (i in 0 until lenlen) {
                    if (readPos.toLong() == length)
                        throw Asn1TagParseException("Lunghezza non corretta")
                    val bTmp = unsignedToBytes(asn.read().toByte())
                    len = unsignedToBytes32((len shl 8 or bTmp.toLong()).toInt())
                    readPos++
                }
            }
            val size = readPos + len
            if (size > length)
                throw Asn1TagParseException("ASN1 non valido")
            if (tagVal.size == 1 && tagVal[0].toInt() == 0 && len == 0L) {
                return null
            }
            val data = ByteArray(len.toInt())
            asn.read(data, 0, len.toInt())
            val ms = ByteArrayInputStream(data)
            val newTag = Asn1Tag(tagVal.toTypedArray())
            newTag.childSize = size
            var childern: MutableList<Asn1Tag>? = null

            var parsedLen: Long = 0
            var parseSubTags = false
            if (newTag.isTagConstructed)
                parseSubTags = true
            else if (reparse && knownTag(newTag.tag) === "OCTET STRING")
                parseSubTags = true
            else if (reparse && knownTag(newTag.tag) === "BIT STRING") {
                parseSubTags = true
                newTag.unusedBits = ms.read().toByte()
                parsedLen++
            }
            if (parseSubTags) {
                childern = ArrayList()
                while (true) {
                    val child = parse(ms, start + readPos.toLong() + parsedLen, len - parsedLen, reparse)
                    if (child != null)
                        childern!!.add(child)

                    parsedLen += child!!.childSize
                    if (parsedLen > len) {
                        childern = null
                        break
                    } else if (parsedLen == len) {
                        break
                    }
                }
            }
            newTag.startPos = start
            newTag.endPos = start + size
            if (childern == null) {
                newTag.data =data
            } else {
                newTag.children = childern
                newTag.constructed = len
            }
            return newTag

        }

        @Throws(Exception::class)
        internal fun knownTag(tag: ByteArray): String? {
            if (tag.size == 1) {
                when (tag[0]) {
                    2.toByte() -> return "INTEGER"
                    3.toByte() -> return "BIT STRING"
                    4.toByte() -> return "OCTET STRING"
                    5.toByte() -> return "NULL"
                    6.toByte() -> return "OBJECT IDENTIFIER"
                    0x30.toByte() -> return "SEQUENCE"
                    0x31.toByte() -> return "SET"
                    12.toByte() -> return "UTF8 String"
                    19.toByte() -> return "PrintableString"
                    20.toByte() -> return "T61String"
                    22.toByte() -> return "IA5String"
                    23.toByte() -> return "UTCTime"
                }
            }
            return null
        }

        @Throws(Exception::class)
        fun unsignedToBytes(b: Byte): Int {
            return b.toInt() and 0xFF
        }

        @Throws(Exception::class)
        fun parse(efCom: ByteArray, reparse: Boolean): Asn1Tag? {
            val input = ByteArrayInputStream(efCom)
            return parse(input,0, efCom.size.toLong(), reparse)
        }

    }


}
