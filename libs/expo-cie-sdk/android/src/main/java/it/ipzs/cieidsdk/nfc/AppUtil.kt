package it.ipzs.cieidsdk.nfc

import java.security.SecureRandom

/**
 * classe di utility
 */
internal class AppUtil {

    internal class AppUtilException(message : String) : IllegalArgumentException(message)

    companion object {

        /**
         * converte un intero in un array di bytes
         * @param value l'intero di input
         * @return l'array di byte
         */
        fun intToByteArray(value: Int): ByteArray {
            return byteArrayOf(value.ushr(8).toByte(), value.toByte())
        }

        /**
         * converte un array di byte in intero senza segno
         * @param dataB l'array da convertire
         * @return un intero senza segno
         * @throws Exception
         */
        @Throws(Exception::class)
        fun toUint(dataB: ByteArray?): Int {
            if (dataB == null)
                return 0
            var `val` = +0
            for (i in dataB.indices) {
                `val` = `val` shl 8 or dataB[i].toInt()
            }
            return `val`
        }

        /**
         * compara due array di byte
         * @param a primo array da confrontare
         * @param b secondo array
         * @return true se i due array sono uguali
         */
        fun byteArrayCompare(a: ByteArray, b: ByteArray): Boolean {
            var uguali = true
            if (a.size == b.size) {
                for (i in a.indices)
                    if (byteCompare(a[i], b[i])) {
                        uguali = false
                        break
                    }
            }
            return uguali
        }

        /**
         * compara due byte
         * @param a primo byte da comparare
         * @param b secondo byte
         * @return true se sono uguali
         */
        fun byteCompare(a: Byte, b: Byte): Boolean {
            return if (java.lang.Byte.compare(a, b) == 0) true else false
        }

        fun byteCompare(a: Int, b: Int): Int {
            return java.lang.Byte.compare(a.toByte(), b.toByte())
            //if( == 0) return true;
            //return false;
        }

        /**
         * crea un nuovo array inizializzato
         * @param size la dim. dell'array
         * @param content il contenuto dell'array
         * @return un array di byte
         * @throws Exception
         */
        @Throws(Exception::class)
        fun fill(size: Int, content: Byte): ByteArray {
            val data = ByteArray(size)
            for (i in 0 until size)
                data[i] = content
            return data
        }

        /**
         * converte un byte in intero
         * @param b il byte da convertire
         * @return l'intero senza segno
         * @throws Exception
         */
        @Throws(Exception::class)
        fun unsignedToBytes(b: Byte): Int {
            return b.toInt() and 0xFF
        }

        /**
         * converte  un intero in byte
         * @param b l'intero in input
         * @return il byte senza segno
         * @throws Exception
         */
        @Throws(Exception::class)
        fun unsignedToBytes(b: Int): Byte {
            return (b and 0xFF).toByte()
        }

        /**
         * crea un array di byte in base alla lunghezza espressa in byte
         * @param value
         * @return l'array di byte
         * @throws Exception
         */
        @Throws(Exception::class)
        internal fun lenToBytes(value: Int): ByteArray {
            if (value < 0x80) {
                return byteArrayOf(value.toByte())
            }
            if (value <= 0xff) {
                return byteArrayOf(0x81.toByte(), value.toByte())
            } else if (value <= 0xffff) {
                return byteArrayOf(0x82.toByte(), (value shr 8).toByte(), (value and 0xff).toByte())
            } else if (value <= 0xffffff) {
                return byteArrayOf(
                    0x83.toByte(),
                    (value shr 16).toByte(),
                    (value shr 8 and 0xff).toByte(),
                    (value and 0xff).toByte()
                )
            } else if (value <= -0x1) {
                return byteArrayOf(
                    0x84.toByte(),
                    (value shr 24).toByte(),
                    (value shr 16 and 0xff).toByte(),
                    (value shr 8 and 0xff).toByte(),
                    (value and 0xff).toByte()
                )
            }
            throw AppUtilException("dati troppo lunghi")
        }

        /**
         *
         * @param array array originale
         * @param tag tag di riferimento
         * @return un array di byte
         * @throws Exception
         */
        @Throws(Exception::class)
        fun asn1Tag(array: ByteArray, tag: Int): ByteArray {
            val _tag = tagToByte(tag)//1
            val _len = lenToBytes(array.size)//2
            val data = ByteArray(_tag.size + _len.size + array.size)//131
            System.arraycopy(_tag, 0, data, 0, _tag.size)
            System.arraycopy(_len, 0, data, _tag.size, _len.size)
            System.arraycopy(array, 0, data, _tag.size + _len.size, array.size)
            return data
        }


        /**
         * @param value
         * @return l'array di dimensione value
         * @throws Exception
         */
        @Throws(Exception::class)
        fun tagToByte(value: Int): ByteArray {
            if (value <= 0xff) {
                return byteArrayOf(unsignedToBytes(value))
            } else if (value <= 0xffff) {
                return byteArrayOf((value shr 8).toByte(), (value and 0xff).toByte())
            } else if (value <= 0xffffff) {
                return byteArrayOf((value shr 16).toByte(), (value shr 8 and 0xff).toByte(), (value and 0xff).toByte())
            } else if (value <= -0x1) {
                return byteArrayOf(
                    (value shr 24).toByte(),
                    (value shr 16 and 0xff).toByte(),
                    (value shr 8 and 0xff).toByte(),
                    (value and 0xff).toByte()
                )
            }
            throw AppUtilException("tag troppo lungo")
        }

        @Throws(Exception::class)
        @JvmOverloads
        fun increment(array: ByteArray, indice: Int = array.size - 1) {
            if (array[indice].compareTo(0xff.toByte()) == 0) { //Byte.MAX_VALUE) {
                array[indice] = 0x00//Byte.MIN_VALUE;
                increment(array, indice - 1)
            } else {
                array[indice] = (array[indice] + 1).toByte()
            }
        }


        /**
         *
         * @param array l'array originale
         * @param start indice da cui partire
         * @param num la dimensione del subset
         * @return un array di byte subset
         * @throws Exception
         */
        @Throws(Exception::class)
        fun getSub(array: ByteArray, start: Int, num: Int): ByteArray {
            var num = num
            if (Math.signum(num.toFloat()) < 0)
                num = num and 0xff
            val data = ByteArray(num)
            System.arraycopy(array, start, data, 0, data.size)
            return data
        }


        @Throws(Exception::class)
        fun getSub(array: ByteArray, start: Int): ByteArray {

            val data = ByteArray(array.size - start)
            System.arraycopy(array, start, data, 0, data.size)
            return data
        }

        /**
         * padding di tipo ISO
         * @param data l'array originale
         * @return un array paddato
         * @throws Exception
         */
        @Throws(Exception::class)
        fun getIsoPad(data: ByteArray): ByteArray {
            val padLen: Int
            if (data.size and 0x7 == 0)
                padLen = data.size + 8
            else
                padLen = data.size - (data.size and 0x7) + 0x08
            val padData = ByteArray(padLen)
            System.arraycopy(data, 0, padData, 0, data.size)
            padData[data.size] = 0x80.toByte()
            for (i in data.size + 1 until padData.size)
                padData[i] = 0
            return padData
        }

        /**
         * genera dei byte random
         * @param array l'array da valorizzare
         * @param numByte il numero di byte da generare
         * @return l'array di byte
         * @throws Exception
         */
        @Throws(Exception::class)
        fun getRandomByte(array: ByteArray, numByte: Int): ByteArray {
            var array = array
            val random = SecureRandom()
            array = random.generateSeed(numByte)
            return array
        }

        /**
         *
         * @param array
         * @param num
         * @return
         * @throws Exception
         */
        @Throws(Exception::class)
        fun getRight(array: ByteArray, num: Int): ByteArray {
            if (num > array.size)
                return array.clone()
            val data = ByteArray(num)
            System.arraycopy(array, array.size - num, data, 0, num)
            return data
        }

        @Throws(Exception::class)
        fun getLeft(array: ByteArray, num: Int): ByteArray {
            if (num > array.size)
                return array.clone()
            val data = ByteArray(num)
            System.arraycopy(array, 0, data, 0, num)
            return data
        }

        @Throws(Exception::class)
        fun appendByteArray(a: ByteArray, b: ByteArray): ByteArray {
            val c = ByteArray(a.size + b.size)
            System.arraycopy(a, 0, c, 0, a.size)
            System.arraycopy(b, 0, c, a.size, b.size)
            return c
        }

        @Throws(Exception::class)
        fun appendByte(a: ByteArray, b: Byte): ByteArray {
            val c = ByteArray(a.size + 1)
            System.arraycopy(a, 0, c, 0, a.size)
            c[a.size] = b
            return c
        }

        @Throws(Exception::class)
        fun bytesToHex(bytes: ByteArray): String {
            val sb = StringBuilder(bytes.size * 2)
            for (i in bytes.indices) {
                sb.append(String.format("%02x", bytes[i]).uppercase())
            }
            return sb.toString()
        }

        @Throws(Exception::class)
        fun isoRemove(data: ByteArray): ByteArray {
            var i: Int
            i = data.size - 1
            while (i >= 0) {
                if (data[i] == 0x80.toByte())
                    break
                if (data[i].toInt() != 0x00)
                    throw AppUtilException("Padding ISO non presente")
                i--
            }
            return getLeft(data, i)
        }
    }


}
