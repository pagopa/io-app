package it.ipzs.cieidsdk.nfc

import android.nfc.tech.IsoDep
import it.ipzs.cieidsdk.exceptions.BlockedPinException
import it.ipzs.cieidsdk.exceptions.NoCieException
import it.ipzs.cieidsdk.exceptions.PinInputNotValidException
import it.ipzs.cieidsdk.exceptions.PinNotValidException
import it.ipzs.cieidsdk.nfc.algorithms.Algoritmi
import it.ipzs.cieidsdk.nfc.algorithms.RSA
import it.ipzs.cieidsdk.nfc.algorithms.Sha256
import it.ipzs.cieidsdk.nfc.extensions.hexStringToByteArray
import it.ipzs.cieidsdk.util.CieIDSdkLogger
import java.util.*
import kotlin.experimental.or


/**
 * Classe per la gestione delle funzionalità di autenticazione
 */
internal class Ias constructor(val isoDep: IsoDep) {

    internal class InternalAuthenticationException(message : String) : IllegalArgumentException(message)
    internal class ReadPublicKeyException : Throwable()
    internal class ResponseSMException(message : String) : IllegalArgumentException(message)
    internal class SendApduException(message : String) : IllegalArgumentException(message)


    private var index = 0
    private val CIE_AID = byteArrayOf(0xA0.toByte(), 0x00, 0x00, 0x00, 0x00, 0x39)
    private var dh_g: ByteArray = byteArrayOf()
    private var dh_p: ByteArray = byteArrayOf()
    private var dh_q: ByteArray = byteArrayOf()
    private var caCar: ByteArray = byteArrayOf()
    private var dappPubKey: ByteArray = byteArrayOf()
    private var caAid: ByteArray = byteArrayOf()
    private var caModule: ByteArray = byteArrayOf()
    private var caPubExp: ByteArray = byteArrayOf()
    private var sessEnc: ByteArray = byteArrayOf()
    private var sessMac: ByteArray = byteArrayOf()
    private var dh_pubKey: ByteArray = byteArrayOf()
    private var dh_ICCpubKey: ByteArray = byteArrayOf()
    private var dappModule: ByteArray = byteArrayOf()
    private var caPrivExp: ByteArray = byteArrayOf()
    private var baExtAuth_PrivExp: ByteArray = byteArrayOf()
    private val CIE_KEY_ExtAuth_ID = 0x84.toByte()
    private val CIE_PIN_ID = 0x81.toByte()
    private val CIE_KEY_Sign_ID = 0x81.toByte()
    private val defModule = byteArrayOf(
        0xba.toByte(),
        0x28,
        0x37,
        0xab.toByte(),
        0x4c,
        0x6b,
        0xb8.toByte(),
        0x27,
        0x57,
        0x7b,
        0xff.toByte(),
        0x4e,
        0xb7.toByte(),
        0xb1.toByte(),
        0xe4.toByte(),
        0x9c.toByte(),
        0xdd.toByte(),
        0xe0.toByte(),
        0xf1.toByte(),
        0x66,
        0x14,
        0xd1.toByte(),
        0xef.toByte(),
        0x24,
        0xc1.toByte(),
        0xb7.toByte(),
        0x5c,
        0xf7.toByte(),
        0x0f,
        0xb1.toByte(),
        0x2c,
        0xd1.toByte(),
        0x8f.toByte(),
        0x4d,
        0x14,
        0xe2.toByte(),
        0x81.toByte(),
        0x4b,
        0xa4.toByte(),
        0x87.toByte(),
        0x7e,
        0xa8.toByte(),
        0x00,
        0xe1.toByte(),
        0x75,
        0x90.toByte(),
        0x60,
        0x76,
        0xb5.toByte(),
        0x62,
        0xba.toByte(),
        0x53,
        0x59,
        0x73,
        0xc5.toByte(),
        0xd8.toByte(),
        0xb3.toByte(),
        0x78,
        0x05,
        0x1d,
        0x8a.toByte(),
        0xfc.toByte(),
        0x74,
        0x07,
        0xa1.toByte(),
        0xd9.toByte(),
        0x19,
        0x52,
        0x9e.toByte(),
        0x03,
        0xc1.toByte(),
        0x06,
        0xcd.toByte(),
        0xa1.toByte(),
        0x8d.toByte(),
        0x69,
        0x9a.toByte(),
        0xfb.toByte(),
        0x0d,
        0x8a.toByte(),
        0xb4.toByte(),
        0xfd.toByte(),
        0xdd.toByte(),
        0x9d.toByte(),
        0xc7.toByte(),
        0x19,
        0x15,
        0x9a.toByte(),
        0x50,
        0xde.toByte(),
        0x94.toByte(),
        0x68,
        0xf0.toByte(),
        0x2a,
        0xb1.toByte(),
        0x03,
        0xe2.toByte(),
        0x82.toByte(),
        0xa5.toByte(),
        0x0e,
        0x71,
        0x6e,
        0xc2.toByte(),
        0x3c,
        0xda.toByte(),
        0x5b,
        0xfc.toByte(),
        0x4a,
        0x23,
        0x2b,
        0x09,
        0xa4.toByte(),
        0xb2.toByte(),
        0xc7.toByte(),
        0x07,
        0x45,
        0x93.toByte(),
        0x95.toByte(),
        0x49,
        0x09,
        0x9b.toByte(),
        0x44,
        0x83.toByte(),
        0xcb.toByte(),
        0xae.toByte(),
        0x62,
        0xd0.toByte(),
        0x09,
        0x96.toByte(),
        0x74,
        0xdb.toByte(),
        0xf6.toByte(),
        0xf3.toByte(),
        0x9b.toByte(),
        0x72,
        0x23,
        0xa9.toByte(),
        0x9d.toByte(),
        0x88.toByte(),
        0xe3.toByte(),
        0x3f,
        0x1a,
        0x0c,
        0xde.toByte(),
        0xde.toByte(),
        0xeb.toByte(),
        0xbd.toByte(),
        0xc3.toByte(),
        0x55,
        0x17,
        0xab.toByte(),
        0xe9.toByte(),
        0x88.toByte(),
        0x0a,
        0xab.toByte(),
        0x24,
        0x0e,
        0x1e,
        0xa1.toByte(),
        0x66,
        0x28,
        0x3a,
        0x27,
        0x4a,
        0x9a.toByte(),
        0xd9.toByte(),
        0x3b,
        0x4b,
        0x1d,
        0x19,
        0xf3.toByte(),
        0x67,
        0x9f.toByte(),
        0x3e,
        0x8b.toByte(),
        0x5f,
        0xf6.toByte(),
        0xa1.toByte(),
        0xe0.toByte(),
        0xed.toByte(),
        0x73,
        0x6e,
        0x84.toByte(),
        0xd5.toByte(),
        0xab.toByte(),
        0xe0.toByte(),
        0x3c,
        0x59,
        0xe7.toByte(),
        0x34,
        0x6b,
        0x42,
        0x18,
        0x75,
        0x5d,
        0x75,
        0x36,
        0x6c,
        0xbf.toByte(),
        0x41,
        0x36,
        0xf0.toByte(),
        0xa2.toByte(),
        0x6c,
        0x3d,
        0xc7.toByte(),
        0x0a,
        0x69,
        0xab.toByte(),
        0xaa.toByte(),
        0xf6.toByte(),
        0x6e,
        0x13,
        0xa1.toByte(),
        0xb2.toByte(),
        0xfa.toByte(),
        0xad.toByte(),
        0x05,
        0x2c,
        0xa6.toByte(),
        0xec.toByte(),
        0x9c.toByte(),
        0x51,
        0xe2.toByte(),
        0xae.toByte(),
        0xd1.toByte(),
        0x4d,
        0x16,
        0xe0.toByte(),
        0x90.toByte(),
        0x25,
        0x4d,
        0xc3.toByte(),
        0xf6.toByte(),
        0x4e,
        0xa2.toByte(),
        0xbd.toByte(),
        0x8a.toByte(),
        0x83.toByte(),
        0x6b,
        0xba.toByte(),
        0x99.toByte(),
        0xde.toByte(),
        0xfa.toByte(),
        0xcb.toByte(),
        0xa3.toByte(),
        0xa6.toByte(),
        0x13,
        0xae.toByte(),
        0xed.toByte(),
        0xd9.toByte(),
        0x3a,
        0x96.toByte(),
        0x15,
        0x27,
        0x3d
    )
    private val defPrivExp = byteArrayOf(
        0x47,
        0x16,
        0xc2.toByte(),
        0xa3.toByte(),
        0x8c.toByte(),
        0xcc.toByte(),
        0x7a,
        0x07,
        0xb4.toByte(),
        0x15,
        0xeb.toByte(),
        0x1a,
        0x61,
        0x75,
        0xf2.toByte(),
        0xaa.toByte(),
        0xa0.toByte(),
        0xe4.toByte(),
        0x9c.toByte(),
        0xea.toByte(),
        0xf1.toByte(),
        0xba.toByte(),
        0x75,
        0xcb.toByte(),
        0xa0.toByte(),
        0x9a.toByte(),
        0x68,
        0x4b,
        0x04,
        0xd8.toByte(),
        0x11,
        0x18,
        0x79,
        0xd3.toByte(),
        0xe2.toByte(),
        0xcc.toByte(),
        0xd8.toByte(),
        0xb9.toByte(),
        0x4d,
        0x3c,
        0x5c,
        0xf6.toByte(),
        0xc5.toByte(),
        0x57,
        0x53,
        0xf0.toByte(),
        0xed.toByte(),
        0x95.toByte(),
        0x87.toByte(),
        0x91.toByte(),
        0x0b,
        0x3c,
        0x77,
        0x25,
        0x8a.toByte(),
        0x01,
        0x46,
        0x0f,
        0xe8.toByte(),
        0x4c,
        0x2e,
        0xde.toByte(),
        0x57,
        0x64,
        0xee.toByte(),
        0xbe.toByte(),
        0x9c.toByte(),
        0x37,
        0xfb.toByte(),
        0x95.toByte(),
        0xcd.toByte(),
        0x69,
        0xce.toByte(),
        0xaf.toByte(),
        0x09,
        0xf4.toByte(),
        0xb1.toByte(),
        0x35,
        0x7c,
        0x27,
        0x63,
        0x14,
        0xab.toByte(),
        0x43,
        0xec.toByte(),
        0x5b,
        0x3c,
        0xef.toByte(),
        0xb0.toByte(),
        0x40,
        0x3f,
        0x86.toByte(),
        0x8f.toByte(),
        0x68,
        0x8e.toByte(),
        0x2e,
        0xc0.toByte(),
        0x9a.toByte(),
        0x49,
        0x73,
        0xe9.toByte(),
        0x87.toByte(),
        0x75,
        0x6f,
        0x8d.toByte(),
        0xa7.toByte(),
        0xa1.toByte(),
        0x01,
        0xa2.toByte(),
        0xca.toByte(),
        0x75,
        0xa5.toByte(),
        0x4a,
        0x8c.toByte(),
        0x4c,
        0xcf.toByte(),
        0x9a.toByte(),
        0x1b,
        0x61,
        0x47,
        0xe4.toByte(),
        0xde.toByte(),
        0x56,
        0x42,
        0x3a,
        0xf7.toByte(),
        0x0b,
        0x20,
        0x67,
        0x17,
        0x9c.toByte(),
        0x5e,
        0xeb.toByte(),
        0x64,
        0x68,
        0x67,
        0x86.toByte(),
        0x34,
        0x78,
        0xd7.toByte(),
        0x52,
        0xc7.toByte(),
        0xf4.toByte(),
        0x12,
        0xdb.toByte(),
        0x27,
        0x75,
        0x41,
        0x57,
        0x5a,
        0xa0.toByte(),
        0x61,
        0x9d.toByte(),
        0x30,
        0xbc.toByte(),
        0xcc.toByte(),
        0x8d.toByte(),
        0x87.toByte(),
        0xe6.toByte(),
        0x17,
        0x0b,
        0x33,
        0x43,
        0x9a.toByte(),
        0x2c,
        0x93.toByte(),
        0xf2.toByte(),
        0xd9.toByte(),
        0x7e,
        0x18,
        0xc0.toByte(),
        0xa8.toByte(),
        0x23,
        0x43,
        0xa6.toByte(),
        0x01,
        0x2a,
        0x5b,
        0xb1.toByte(),
        0x82.toByte(),
        0x28,
        0x08,
        0xf0.toByte(),
        0x1b,
        0x5c,
        0xfd.toByte(),
        0x85.toByte(),
        0x67,
        0x3a,
        0xc0.toByte(),
        0x96.toByte(),
        0x4c,
        0x5f,
        0x3c,
        0xfd.toByte(),
        0x2d,
        0xaf.toByte(),
        0x81.toByte(),
        0x42,
        0x35,
        0x97.toByte(),
        0x64,
        0xa9.toByte(),
        0xad.toByte(),
        0xb9.toByte(),
        0xe3.toByte(),
        0xf7.toByte(),
        0x6d,
        0xb6.toByte(),
        0x13,
        0x46,
        0x1c,
        0x1b,
        0xc9.toByte(),
        0x13,
        0xdc.toByte(),
        0x9a.toByte(),
        0xc0.toByte(),
        0xab.toByte(),
        0x50,
        0xd3.toByte(),
        0x65,
        0xf7.toByte(),
        0x7c,
        0xb9.toByte(),
        0x31,
        0x94.toByte(),
        0xc9.toByte(),
        0x8a.toByte(),
        0xa9.toByte(),
        0x66,
        0xd8.toByte(),
        0x9c.toByte(),
        0xdd.toByte(),
        0x55,
        0x51,
        0x25,
        0xa5.toByte(),
        0xe5.toByte(),
        0x9e.toByte(),
        0xcf.toByte(),
        0x4f,
        0xa3.toByte(),
        0xf0.toByte(),
        0xc3.toByte(),
        0xfd.toByte(),
        0x61,
        0x0c,
        0xd3.toByte(),
        0xd0.toByte(),
        0x56,
        0x43,
        0x93.toByte(),
        0x38,
        0xfd.toByte(),
        0x81.toByte()
    )
    private val defPubExp = byteArrayOf(0x00, 0x01, 0x00, 0x01)
    val IAS_AID = byteArrayOf(
        0xA0.toByte(),
        0x00,
        0x00,
        0x00,
        0x30,
        0x80.toByte(),
        0x00,
        0x00,
        0x00,
        0x09,
        0x81.toByte(),
        0x60,
        0x01
    )


    companion object {

        internal var seq: ByteArray = byteArrayOf()

        protected fun unsignedToBytes(b: Byte): Int {
            return b.toInt() and 0xFF
        }
    }


    /**
     * inizializza un canale sicuro tra carta e dispositivo passando il pin dell'utente
     * @param pin
     * @throws Exception
     */
    @Throws(Exception::class)
    fun startSecureChannel(pin: String) {
        selectAidIas()
        selectAidCie()
        initDHParam()
        if (dappPubKey.isEmpty())
            readDappPubKey()
        initExtAuthKeyParam()
        dhKeyExchange()
        dApp()
        val numeroTentativi = verifyPin(pin)
        if (numeroTentativi < 3) {
            if (numeroTentativi == 0)
                throw BlockedPinException()
            else
                throw PinNotValidException(numeroTentativi)
        }
    }


    @Throws(Exception::class)
    fun getIdServizi(): String {
        CieIDSdkLogger.log("getIdServizi()")
        transmit("00A4040C0DA0000000308000000009816001".hexStringToByteArray())
        transmit("00A4040406A00000000039".hexStringToByteArray())
        transmit("00a40204021001".hexStringToByteArray())
        val res = transmit("00b000000c".hexStringToByteArray())
        if (res.swHex != "9000") {
            throw NoCieException()
        }
        return AppUtil.bytesToHex(res.response)
    }


    @Throws(Exception::class)
    fun sign(dataToSign: ByteArray): ByteArray? {
        CieIDSdkLogger.log("sign()")
        val setKey = byteArrayOf(0x00, 0x22, 0x41, 0xA4.toByte())
        val val02 = byteArrayOf(0x02)
        val keyId = byteArrayOf(CIE_KEY_Sign_ID)
        val dati = AppUtil.appendByteArray(AppUtil.asn1Tag(val02, 0x80), AppUtil.asn1Tag(keyId, 0x84))
        sendApduSM(setKey, dati, null)
        val signApdu = byteArrayOf(0x00, 0x88.toByte(), 0x00, 0x00)
        val response = sendApduSM(signApdu, dataToSign, null)
        return response.response
    }

    /**
     *
     * @param pin verifica il pin dell'utente
     * @return restituisce il numero di tentativi possibili
     * @throws Exception
     */
    @Throws(Exception::class)
    private fun verifyPin(pin: String): Int {
        CieIDSdkLogger.log("verifyPin()")
        if(pin.length!=8){
            throw PinInputNotValidException()
        }
        val verifyPIN = byteArrayOf(0x00, 0x20, 0x00, CIE_PIN_ID)
        val response = sendApduSM(verifyPIN, pin.toByteArray(), null)
        val nt = AppUtil.bytesToHex(response.swByte)
        return when {
            nt.equals("9000", ignoreCase = true) -> 3
            nt.equals("ffc2", ignoreCase = true) -> 2
            nt.equals("ffc1", ignoreCase = true) -> 1
            else -> 0
        }
    }


    /**
     * Device Authentication With privacy protection
     * contiene ExtAuth e IntAuth
     * @throws Exception
     */
    @Throws(Exception::class)
    private fun dApp() {
        CieIDSdkLogger.log("dApp()")
        val psoVerifyAlgo = byteArrayOf(0x41)
        val shaOID: Byte = 0x04
        val shaSize = 32

        val module = defModule
        val pubExp = defPubExp
        val privExp = defPrivExp
        val snIFD = byteArrayOf(0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01)
        val CPI = 0x8A.toByte()
        val baseCHR = byteArrayOf(0x00, 0x00, 0x00, 0x00)
        var CHR = byteArrayOf()
        CHR = AppUtil.appendByteArray(CHR, baseCHR)
        CHR = AppUtil.appendByteArray(CHR, snIFD)
        var CHA = byteArrayOf()
        CHA = AppUtil.appendByteArray(CHA, caAid)
        CHA = AppUtil.appendByte(CHA, 0x01.toByte())
        val baseOID = byteArrayOf(0x2A, 0x81.toByte(), 0x22, 0xF4.toByte(), 0x2A, 0x02, 0x04, 0x01)
        var OID = byteArrayOf()
        OID = AppUtil.appendByteArray(OID, baseOID)
        OID = AppUtil.appendByte(OID, shaOID)
        var endEntityCert = byteArrayOf()
        endEntityCert = AppUtil.appendByte(endEntityCert, CPI)
        endEntityCert = AppUtil.appendByteArray(endEntityCert, caCar)
        endEntityCert = AppUtil.appendByteArray(endEntityCert, CHR)
        endEntityCert = AppUtil.appendByteArray(endEntityCert, CHA)
        endEntityCert = AppUtil.appendByteArray(endEntityCert, OID)
        endEntityCert = AppUtil.appendByteArray(endEntityCert, module)
        endEntityCert = AppUtil.appendByteArray(endEntityCert, pubExp)
        var d1 = Sha256.encrypt(endEntityCert)
        val ba99 = AppUtil.getLeft(endEntityCert, caModule.size - shaSize - 2)
        var toSign = byteArrayOf()
        toSign = AppUtil.appendByte(toSign, 0x6a.toByte())
        toSign = AppUtil.appendByteArray(toSign, ba99)
        toSign = AppUtil.appendByteArray(toSign, d1)
        toSign = AppUtil.appendByte(toSign, 0xbc.toByte())
        val rsa = RSA(caModule, caPrivExp)
        val certSign = rsa.encrypt(toSign)
        val pkRem = AppUtil.getSub(
            endEntityCert,
            caModule.size - shaSize - 2,
            endEntityCert.size - (caModule.size - shaSize - 2)
        )


        val tmp = AppUtil.asn1Tag(certSign, 0x5f37)
        val tmp1 = AppUtil.asn1Tag(pkRem, 0x5F38)
        val tmp2 = AppUtil.asn1Tag(caCar, 0x42)

        val cert = AppUtil.asn1Tag(AppUtil.appendByteArray(AppUtil.appendByteArray(tmp, tmp1), tmp2), 0x7f21)

        val selectKey = byteArrayOf(0x00, 0x22, 0x81.toByte(), 0xb6.toByte())

        val dataTmp = AppUtil.appendByteArray(
            AppUtil.asn1Tag(psoVerifyAlgo, 0x80),
            AppUtil.asn1Tag(byteArrayOf(CIE_KEY_ExtAuth_ID), 0x83)
        )
        sendApduSM(selectKey, dataTmp, null)

        val verifyCert = byteArrayOf(0x00, 0x2A, 0x00, 0xAE.toByte())
        sendApduSM(verifyCert, cert, null)
        val setCHR = byteArrayOf(0x00, 0x22, 0x81.toByte(), 0xA4.toByte())
        sendApduSM(setCHR, AppUtil.asn1Tag(CHR, 0x83), null)

        val getChallenge = byteArrayOf(0x00.toByte(), 0x84.toByte(), 0x00.toByte(), 0x00.toByte())
        val chLen = byteArrayOf(8)
        val challengeResp = sendApduSM(getChallenge, byteArrayOf(), chLen)

        val padSize = module.size - shaSize - 2
        var PRND = byteArrayOf()
        PRND = AppUtil.getRandomByte(PRND, padSize)
        var toHash = byteArrayOf()
        toHash = AppUtil.appendByteArray(toHash, PRND)
        toHash = AppUtil.appendByteArray(toHash, dh_pubKey)
        toHash = AppUtil.appendByteArray(toHash, snIFD)
        toHash = AppUtil.appendByteArray(toHash, challengeResp.response)
        toHash = AppUtil.appendByteArray(toHash, dh_ICCpubKey)
        toHash = AppUtil.appendByteArray(toHash, dh_g)
        toHash = AppUtil.appendByteArray(toHash, dh_p)
        toHash = AppUtil.appendByteArray(toHash, dh_q)
        d1 = Sha256.encrypt(toHash)

        toSign = byteArrayOf()
        toSign = AppUtil.appendByte(toSign, 0x6a.toByte())
        toSign = AppUtil.appendByteArray(toSign, PRND)
        toSign = AppUtil.appendByteArray(toSign, d1)
        toSign = AppUtil.appendByte(toSign, 0xbc.toByte())

        val signResp: ByteArray
        val rsaCertKey = RSA(module, privExp)
        signResp = rsaCertKey.encrypt(toSign)

        var chResponse = byteArrayOf()
        chResponse = AppUtil.appendByteArray(chResponse, snIFD)
        chResponse = AppUtil.appendByteArray(chResponse, signResp)
        val resp: ApduResponse?
        val extAuth = byteArrayOf(0x00, 0x82.toByte(), 0x00, 0x00)
        sendApduSM(extAuth, chResponse, null)
        val intAuth = byteArrayOf(0x00, 0x22, 0x41, 0xa4.toByte())
        val val82 = byteArrayOf(0x82.toByte())
        val pKdScheme = byteArrayOf(0x9b.toByte())
        val temp: ByteArray

        temp = AppUtil.appendByteArray(AppUtil.asn1Tag(val82, 0x84), AppUtil.asn1Tag(pKdScheme, 0x80))
        sendApduSM(intAuth, temp, null)
        var rndIFD = byteArrayOf()
        rndIFD = AppUtil.getRandomByte(rndIFD, 8)
        val giveRandom = byteArrayOf(0x00, 0x88.toByte(), 0x00, 0x00)
        resp = sendApduSM(giveRandom, rndIFD, null)

        val SN_ICC = AppUtil.getSub(resp.response, 0, 8)
        val intAuthResp: ByteArray
        val rsaIntAuthKey = RSA(dappModule, dappPubKey)
        intAuthResp = rsaIntAuthKey.encrypt(AppUtil.getSub(resp.response, 8, resp.response.size - 8))

        if (java.lang.Byte.compare(intAuthResp[0], 0x6a.toByte()) != 0)
            throw InternalAuthenticationException("Errore nell'autenticazione del chip- Byte.compare(intAuthResp[0], (byte)0x6a) != 0")

        val PRND2 = AppUtil.getSub(intAuthResp, 1, intAuthResp.size - 32 - 2)
        val hashICC = AppUtil.getSub(intAuthResp, PRND2.size + 1, 32)
        var toHashIFD = byteArrayOf()
        toHashIFD = AppUtil.appendByteArray(toHashIFD, PRND2)
        toHashIFD = AppUtil.appendByteArray(toHashIFD, dh_ICCpubKey)
        toHashIFD = AppUtil.appendByteArray(toHashIFD, SN_ICC)
        toHashIFD = AppUtil.appendByteArray(toHashIFD, rndIFD)
        toHashIFD = AppUtil.appendByteArray(toHashIFD, dh_pubKey)
        toHashIFD = AppUtil.appendByteArray(toHashIFD, dh_g)
        toHashIFD = AppUtil.appendByteArray(toHashIFD, dh_p)
        toHashIFD = AppUtil.appendByteArray(toHashIFD, dh_q)
        val calcHashIFD = Sha256.encrypt(toHashIFD)

        if (AppUtil.bytesToHex(calcHashIFD) != AppUtil.bytesToHex(hashICC))
            throw InternalAuthenticationException("Errore nell'autenticazione del chip (calcHashIFD,hashICC)")


        if (java.lang.Byte.compare(intAuthResp[intAuthResp.size - 1], 0xbc.toByte()) != 0)
            throw InternalAuthenticationException("Errore nell'autenticazione del chip AppUtil.byteCompare(intAuthResp[intAuthResp.length - 1],0xcb")

        val ba888 = AppUtil.getRight(challengeResp.response, 4)
        val ba889 = AppUtil.getRight(rndIFD, 4)
        seq = AppUtil.appendByteArray(ba888, ba889)


    }

    /**
     * @return il certificato dell'utente
     * @throws Exception
     */
    @Throws(Exception::class)
    fun readCertCie(): ByteArray {
        CieIDSdkLogger.log("readCie()")
        //selectAidCie()
        return readFileSM(0x1003)
    }

    /**
     * scambio di chiavi Diffie Hellman
     * @throws Exception
     */
    @Throws(Exception::class)
    private fun dhKeyExchange() {
        CieIDSdkLogger.log("dhKeyExchange()")
        var dh_prKey: ByteArray = byteArrayOf()
        do {
            dh_prKey = AppUtil.getRandomByte(dh_prKey, dh_q.size)
        } while (dh_q[0].compareTo(dh_prKey[0]) < 0)

        val dhg = dh_g.clone()
        val rsa = RSA(dh_p, dh_prKey)
        dh_pubKey = rsa.encrypt(dhg)

        val algo = byteArrayOf(0x9b.toByte())
        val keyId = byteArrayOf(0x81.toByte())
        val tmp1 = AppUtil.appendByteArray(
            AppUtil.appendByteArray(AppUtil.asn1Tag(algo, 0x80), AppUtil.asn1Tag(keyId, 0x83)),
            AppUtil.asn1Tag(dh_pubKey, 0x91)
        )
        val MSE_SET = byteArrayOf(0x00, 0x22, 0x41, 0xa6.toByte())
        sendApdu(MSE_SET, tmp1, null)

        val GET_DATA = byteArrayOf(0x00, 0xcb.toByte(), 0x3f, 0xff.toByte())
        val GET_DATA_Data = byteArrayOf(0x4d, 0x04, 0xa6.toByte(), 0x02, 0x91.toByte(), 0x00)
        val respAsn = sendApdu(GET_DATA, GET_DATA_Data, null)
        val asn1 = Asn1Tag.parse(respAsn.response, true)
        dh_ICCpubKey = asn1!!.child(0).data
        val secret = rsa.encrypt(dh_ICCpubKey)

        val diffENC = byteArrayOf(0x00, 0x00, 0x00, 0x01)
        val diffMAC = byteArrayOf(0x00, 0x00, 0x00, 0x02)

        var d1 = Sha256.encrypt(AppUtil.appendByteArray(secret, diffENC))
        sessEnc = AppUtil.getLeft(d1, 16)

        d1 = Sha256.encrypt(AppUtil.appendByteArray(secret, diffMAC))
        sessMac = AppUtil.getLeft(d1, 16)

        seq = ByteArray(8)
        seq[7] = 0x01
    }

    /**
     * recupera i parametri delle chiavi per external authentication
     * @throws Exception
     */
    @Throws(Exception::class)
    private fun initExtAuthKeyParam() {
        CieIDSdkLogger.log("initExtAuthParam()")
        //selectAidCie()
        val getKeyDoup = byteArrayOf(0, 0xcb.toByte(), 0x3f, 0xff.toByte())
        val getKeyDuopData = byteArrayOf(
            0x4d,
            0x09,
            0x70,
            0x07,
            0xBF.toByte(),
            0xA0.toByte(),
            0x04,
            0x03,
            0x7F,
            0x49,
            0x80.toByte())
        val response = sendApdu(getKeyDoup, getKeyDuopData, null)
        val asn1 = Asn1Tag.parse(response.response, true)
        caModule = asn1!!.child(0).child(0).childWithTagID(byteArrayOf(0x81.toByte()))!!.data
        caPubExp = asn1.child(0).child(0).childWithTagID(byteArrayOf(0x82.toByte()))!!.data
        baExtAuth_PrivExp = byteArrayOf(
            0x18,
            0x6B,
            0x31,
            0x48,
            0x8C.toByte(),
            0x25,
            0xDC.toByte(),
            0xF8.toByte(),
            0x5D,
            0x95.toByte(),
            0x3D,
            0x36,
            0x30,
            0xC0.toByte(),
            0xD0.toByte(),
            0x73,
            0xBA.toByte(),
            0x1C,
            0x6A,
            0xA2.toByte(),
            0x45,
            0x81.toByte(),
            0xAD.toByte(),
            0x25,
            0x4F,
            0x3B,
            0x67,
            0x19,
            0xC5.toByte(),
            0xD7.toByte(),
            0x2C,
            0xCA.toByte(),
            0x3E,
            0x5C,
            0xDC.toByte(),
            0x5A,
            0x1E,
            0x53,
            0x16,
            0x57,
            0x8D.toByte(),
            0x75,
            0x95.toByte(),
            0x4F,
            0xF7.toByte(),
            0x3B,
            0x23,
            0x7B,
            0x53,
            0x2C,
            0x9F.toByte(),
            0x8D.toByte(),
            0xE4.toByte(),
            0xA2.toByte(),
            0xC4.toByte(),
            0xC9.toByte(),
            0x11,
            0x38,
            0x5A,
            0x23,
            0xE6.toByte(),
            0x3E,
            0x33,
            0xE4.toByte(),
            0x7E,
            0xE4.toByte(),
            0x5E,
            0x66,
            0xEF.toByte(),
            0xD4.toByte(),
            0x9B.toByte(),
            0x18,
            0xE0.toByte(),
            0x2C,
            0xFF.toByte(),
            0x87.toByte(),
            0x59,
            0x8C.toByte(),
            0x39,
            0x10,
            0x9E.toByte(),
            0x8F.toByte(),
            0x86.toByte(),
            0xA6.toByte(),
            0x6B,
            0xC3.toByte(),
            0x30,
            0x24,
            0x9C.toByte(),
            0xE3.toByte(),
            0xFC.toByte(),
            0xAD.toByte(),
            0x65,
            0x5D,
            0xCD.toByte(),
            0xBF.toByte(),
            0x98.toByte(),
            0xC9.toByte(),
            0xC5.toByte(),
            0xE4.toByte(),
            0x79,
            0x32,
            0x1A,
            0xF5.toByte(),
            0x3B,
            0x51,
            0x7D,
            0x04,
            0x10,
            0x61,
            0x88.toByte(),
            0x0A,
            0x64,
            0x7B,
            0xBE.toByte(),
            0x0F,
            0xF8.toByte(),
            0x13,
            0x68,
            0x34,
            0x70,
            0xE6.toByte(),
            0xC5.toByte(),
            0x00,
            0x94.toByte(),
            0xCE.toByte(),
            0x81.toByte(),
            0xD0.toByte(),
            0x64,
            0xE2.toByte(),
            0x04,
            0xE3.toByte(),
            0x51,
            0xBD.toByte(),
            0x3A,
            0xE0.toByte(),
            0xA7.toByte(),
            0x94.toByte(),
            0x7D,
            0x8E.toByte(),
            0x91.toByte(),
            0xC3.toByte(),
            0xFD.toByte(),
            0x5C,
            0x0A,
            0x15,
            0x23,
            0x3C,
            0x34,
            0x9A.toByte(),
            0x52,
            0x15,
            0xA4.toByte(),
            0xE6.toByte(),
            0x6E,
            0x21,
            0xC5.toByte(),
            0xD3.toByte(),
            0x34,
            0x98.toByte(),
            0xE7.toByte(),
            0x19,
            0x91.toByte(),
            0xEA.toByte(),
            0x24,
            0x47,
            0x3B,
            0x29,
            0xF1.toByte(),
            0x47,
            0x5F,
            0x6F,
            0xD9.toByte(),
            0xBE.toByte(),
            0x39,
            0x96.toByte(),
            0xE1.toByte(),
            0x9B.toByte(),
            0xD4.toByte(),
            0x74,
            0xFA.toByte(),
            0xD1.toByte(),
            0xB4.toByte(),
            0x1E,
            0xA0.toByte(),
            0xDC.toByte(),
            0xD2.toByte(),
            0xFC.toByte(),
            0x16,
            0xC9.toByte(),
            0xBF.toByte(),
            0xFA.toByte(),
            0x07,
            0x1B,
            0xFE.toByte(),
            0xC1.toByte(),
            0xB2.toByte(),
            0x24,
            0x15,
            0x18,
            0x48,
            0x11,
            0xC1.toByte(),
            0x98.toByte(),
            0x5F,
            0xBF.toByte(),
            0xE3.toByte(),
            0xE7.toByte(),
            0xB4.toByte(),
            0xF4.toByte(),
            0x4A,
            0x4B,
            0x3C,
            0x8D.toByte(),
            0xFA.toByte(),
            0xB4.toByte(),
            0xD9.toByte(),
            0x0C,
            0xEC.toByte(),
            0xFC.toByte(),
            0x5E,
            0x60,
            0x8D.toByte(),
            0x67,
            0x3E,
            0x67,
            0x62,
            0xC6.toByte(),
            0x2C,
            0xB7.toByte(),
            0x98.toByte(),
            0x34,
            0x12,
            0x71,
            0x14,
            0x9B.toByte(),
            0xA6.toByte(),
            0x88.toByte(),
            0x16,
            0x2E,
            0xC7.toByte(),
            0xD0.toByte(),
            0xE3.toByte(),
            0x46,
            0x8F.toByte(),
            0x65,
            0xA9.toByte(),
            0x4A,
            0xB4.toByte(),
            0xAD.toByte(),
            0x1A,
            0xB6.toByte(),
            0x7E,
            0x37,
            0xBF.toByte(),
            0xC1.toByte()
        )
        caPrivExp = baExtAuth_PrivExp
        val caCha = asn1.child(0).child(0).childWithTagID(byteArrayOf(0x5f, 0x4c))!!.data
        val caChr = asn1.child(0).child(0).childWithTagID(byteArrayOf(0x5f, 0x20))!!.data
        caCar = AppUtil.getSub(caChr, 4)
        caAid = AppUtil.getLeft(caCha, 6)
    }

    /**
     * recupera i parametri delle chiavi per Diffie Hellman
     */
    @Throws(Exception::class)
    private fun initDHParam() {
        CieIDSdkLogger.log("initDHParam()")
        //selectAidCie()
        val getDHDoup = byteArrayOf(0, 0xcb.toByte(), 0x3f, 0xff.toByte())
        val getDHDuopData_g = byteArrayOf(
            0x4D,
            0x0A,
            0x70,
            0x08,
            0xBF.toByte(),
            0xA1.toByte(),
            0x01,
            0x04,
            0xA3.toByte(),
            0x02,
            0x97.toByte(),
            0x00
        )
        var resp = sendApdu(getDHDoup, getDHDuopData_g, null)
        var asn1Tag = Asn1Tag.parse(resp.response, false)
        dh_g = asn1Tag!!.child(0).child(0).child(0).data
        val getDHDuopData_p = byteArrayOf(
            0x4D,
            0x0A,
            0x70,
            0x08,
            0xBF.toByte(),
            0xA1.toByte(),
            0x01,
            0x04,
            0xA3.toByte(),
            0x02,
            0x98.toByte(),
            0x00
        )
        resp = sendApdu(getDHDoup, getDHDuopData_p, null)
        asn1Tag = Asn1Tag.parse(resp.response, false)
        dh_p = asn1Tag!!.child(0).child(0).child(0).data
        val getDHDuopData_q = byteArrayOf(
            0x4D,
            0x0A,
            0x70,
            0x08,
            0xBF.toByte(),
            0xA1.toByte(),
            0x01,
            0x04,
            0xA3.toByte(),
            0x02,
            0x99.toByte(),
            0x00
        )
        resp = sendApdu(getDHDoup, getDHDuopData_q, null)
        asn1Tag = Asn1Tag.parse(resp.response, false)
        dh_q = asn1Tag!!.child(0).child(0).child(0).data
    }

    /**
     * recupera la chiave per la Internal Authentication
     * @throws Exception
     */
    @Throws(Exception::class)
    private fun readDappPubKey() {
        CieIDSdkLogger.log("readDappPubKey()")
        val dappKey: ByteArray = readFile(0x1004)
        dappModule = byteArrayOf()
        if (this.dappPubKey.isNotEmpty())
            throw ReadPublicKeyException()
        //selectAidCie()
        val asn1 = Asn1Tag.parse(dappKey, false)
        dappModule = asn1!!.child(0).data
        while (dappModule[0].toInt() == 0)
            dappModule = AppUtil.getSub(dappModule, 1, dappModule.size - 1)
        dappPubKey = asn1.child(1).data

        while (dappPubKey[0].toInt() == 0)
            dappPubKey = AppUtil.getSub(dappPubKey, 1, dappPubKey.size - 1)

    }


    @Throws(Exception::class)
    private fun selectAidCie() {
        CieIDSdkLogger.log("selectAidCie()")
        val selectCie = byteArrayOf(0x00, 0xa4.toByte(), 0x04, 0x0c)
        sendApdu(selectCie, CIE_AID, null)
    }

    /**
     * seleziona l'applicazione IAS dalla carta
     * @param sm booleano se in secure messaging
     * @throws Exception
     */
    @Throws(Exception::class)
    private fun selectAidIas() {
        CieIDSdkLogger.log("selectAidIas()")
        val selectMF = byteArrayOf(0x00, 0xa4.toByte(), 0x04, 0x0c)
        sendApdu(selectMF, IAS_AID, null)
    }


    @Throws(Exception::class)
    private fun readFileSM(id: Int): ByteArray {
        //CieIDSdkLogger.log("readfileSM()");
        var content = byteArrayOf()
        val selectFile = byteArrayOf(0x00, 0xa4.toByte(), 0x02, 0x04)
        val fileId = byteArrayOf(HIBYTE(id), LOBYTE(id))

        sendApduSM(selectFile, fileId, null)

        var cnt = 0
        var chunk = 256

        while (true) {
            ////CieIDSdkLogger.logI("SDK-CIE[CPP]  dentro while(true) C++ content.size():%d",content.size());
            val readFile = byteArrayOf(0x00, 0xb0.toByte(), HIBYTE(cnt), LOBYTE(cnt))
            val response = sendApduSM(readFile, byteArrayOf(), byteArrayOf(chunk.toByte()))
            var chn = response.response
            if (java.lang.Byte.compare((response.swInt shr 8).toByte(), 0x6c.toByte()) == 0) {
                val le = AppUtil.unsignedToBytes(response.swInt and 0xff)
                val respApdu = sendApduSM(readFile, byteArrayOf(), byteArrayOf(le))
                chn = respApdu.response
            }
            if (response.swHex == "9000") {
                content = AppUtil.appendByteArray(content, chn)
                cnt += chn.size
                chunk = 256
            } else {
                if (response.swHex == "6282") {
                    content = AppUtil.appendByteArray(content, chn)
                } else if (response.swHex != "6b00") {
                    return content
                }
                break
            }
        }
        //CieIDSdkLogger.log("fine readfile SM");
        return content
    }

    @Throws(Exception::class)
    private fun readFile(id: Int): ByteArray {
        //CieIDSdkLogger.log("readFile()");
        var content = byteArrayOf()
        val selectFile = byteArrayOf(0x00, 0xa4.toByte(), 0x02, 0x04)
        val fileId = byteArrayOf(HIBYTE(id), LOBYTE(id))

        sendApdu(selectFile, fileId, null)

        var cnt = 0
        var chunk = 256

        while (true) {
            ////CieIDSdkLogger.logI("SDK-CIE[CPP]  dentro while(true) C++ content.size():%d",content.size());
            val readFile = byteArrayOf(0x00, 0xb0.toByte(), HIBYTE(cnt), LOBYTE(cnt))
            val response = sendApdu(readFile, byteArrayOf(), byteArrayOf(chunk.toByte()))
            var chn = response.response
            if ((response.swInt shr 8).toByte().compareTo(0x6c.toByte()) == 0) {
                val le = AppUtil.unsignedToBytes(response.swInt and 0xff)
                val respApdu = sendApdu(readFile, byteArrayOf(), byteArrayOf(le))
                chn = respApdu.response
            }
            if (response.swHex == "9000") {
                content = AppUtil.appendByteArray(content, chn)
                cnt += chn.size
                chunk = 256
            } else {
                if (response.swHex == "0x6282") {
                    content = AppUtil.appendByteArray(content, chn)
                } else if (response.swHex != "0x6b00") {
                    return content
                }
                break
            }
        }
        return content
    }

    @Throws(Exception::class)
    private fun sendApduSM(head: ByteArray, data: ByteArray, le: ByteArray?): ApduResponse {
        //CieIDSdkLogger.log("sendApduSM()");
        var apduSm: ByteArray
        val ds = data.size
        if (ds < unsignedToBytes(0xe7.toByte())) {
            //CieIDSdkLogger.log("ds < unsignedToBytes((byte)0xe7): ");
            apduSm = byteArrayOf()
            apduSm = AppUtil.appendByteArray(apduSm, head)
            apduSm = AppUtil.appendByte(apduSm, ds.toByte())
            apduSm = AppUtil.appendByteArray(apduSm, data)
            if (le != null)
                apduSm = AppUtil.appendByteArray(apduSm, le)
            //CieIDSdkLogger.log("apduSm:  " + apduSm);
            apduSm = sm(sessEnc, sessMac, apduSm)
            var apduResponse = transmit(apduSm)
            apduResponse = getRespSM(apduResponse)
            return apduResponse
        } else {
            var i = 0
            val cla = head[0]
            while (true) {
                apduSm = byteArrayOf()
                val s = AppUtil.getSub(data, i, Math.min(data.size - i, 0xE7))
                i += s.size
                if (i != data.size)
                    head[0] = (cla or 0x10)
                else
                    head[0] = cla
                if (s.isNotEmpty()) {
                    apduSm = byteArrayOf()
                    apduSm = AppUtil.appendByteArray(apduSm, head)
                    apduSm = AppUtil.appendByte(apduSm, s.size.toByte())
                    apduSm = AppUtil.appendByteArray(apduSm, s)
                    if (le != null)
                        apduSm = AppUtil.appendByteArray(apduSm, byteArrayOf())
                } else {
                    apduSm = byteArrayOf()
                    apduSm = AppUtil.appendByteArray(apduSm, head)
                    if (le != null)
                        apduSm = AppUtil.appendByteArray(apduSm, le)
                }
                apduSm = sm(sessEnc, sessMac, apduSm)

                var response = transmit(apduSm)
                response = getRespSM(response)
                if (i == data.size) {
                    return response
                }
            }

        }
    }

    @Throws(Exception::class)
    private fun sendApdu(head: ByteArray, data: ByteArray, le: ByteArray?): ApduResponse {

        var apdu = byteArrayOf()
        val ds = data.size
        if (ds > 255) {
            var i = 0
            val cla = head[0]
            while (true) {
                apdu = byteArrayOf()
                val s = AppUtil.getSub(data, i, Math.min(data.size - i, 255))
                i += s.size
                if (i != data.size)
                    head[0] = (cla or 0x10).toByte()
                else
                    head[0] = cla
                apdu = AppUtil.appendByteArray(apdu, head)
                apdu = AppUtil.appendByte(apdu, s.size.toByte())
                apdu = AppUtil.appendByteArray(apdu, s)
                if (le != null)
                    apdu = AppUtil.appendByteArray(apdu, le)
                val apduResponse = transmit(apdu)
                //curresp = apduResponse.getResponse();
                if (apduResponse.swHex != "9000")
                    throw SendApduException("Errore apdu")
                if (i == data.size) {
                    return getResp(apduResponse)
                }
            }
        } else {
            if (data.isNotEmpty()) {
                apdu = AppUtil.appendByteArray(apdu, head)
                apdu = AppUtil.appendByte(apdu, data.size.toByte())
                apdu = AppUtil.appendByteArray(apdu, data)
                if (le != null)
                    apdu = AppUtil.appendByteArray(apdu, le)
            } else {
                apdu = AppUtil.appendByteArray(apdu, head)
                if (le != null)
                    apdu = AppUtil.appendByteArray(apdu, le)
            }
            val response = transmit(apdu)
            return getResp(response)
        }
    }


    @Throws(Exception::class)
    private fun setIndex(vararg argomenti: Int) {
        var tmpIndex = 0
        var tmpSegno: Int
        for (i in argomenti.indices) {
            if (Math.signum(argomenti[i].toFloat()) < 0) {
                tmpSegno = argomenti[i] and 0xFF
                tmpIndex += tmpSegno
            } else
                tmpIndex += argomenti[i]
            //System.out.print("sommo: " +  tmpIndex+" , ");
        }
        this.index = tmpIndex
    }


    @Throws(Exception::class)
    private fun sm(keyEnc: ByteArray, keyMac: ByteArray, apdu: ByteArray): ByteArray {
        AppUtil.increment(seq)
        val smHead = AppUtil.getLeft(apdu, 4)
        smHead[0] = smHead[0] or 0x0C
        var calcMac = AppUtil.getIsoPad(AppUtil.appendByteArray(seq, smHead))
        val smMac: ByteArray
        var dataField = byteArrayOf()
        var doob: ByteArray
        //CieIDSdkLogger.log("calcMac: " + AppUtil.bytesToHex(calcMac));

        if (apdu[4].toInt() != 0 && apdu.size > 5) {
            //encript la parte di dati
            val d1 = AppUtil.getIsoPad(AppUtil.getSub(apdu, 5, apdu[4].toInt()))
            //CieIDSdkLogger.log("d1: "+ AppUtil.bytesToHex(d1));
            val enc = Algoritmi.desEnc(keyEnc, d1)
            //CieIDSdkLogger.log("enc: "+ AppUtil.bytesToHex(enc));
            doob = if (apdu[1].toInt() and 1 == 0) {
                AppUtil.asn1Tag(AppUtil.appendByteArray(byteArrayOf(0x01), enc), 0x87)
            } else
                AppUtil.asn1Tag(enc, 0x85)
            calcMac = AppUtil.appendByteArray(calcMac, doob)
            dataField = AppUtil.appendByteArray(dataField, doob)
        }
        if (apdu.size == 5 || apdu.size == apdu[4] + 6)
        //--
        { // ' se c'è un le
            doob = AppUtil.asn1Tag(byteArrayOf(apdu[apdu.size - 1]), 0x97.toByte().toInt())
            calcMac = AppUtil.appendByteArray(calcMac, doob)
            dataField = AppUtil.appendByteArray(dataField, doob)
        }
        val d1 = AppUtil.getIsoPad(calcMac)
        smMac = Algoritmi.macEnc(keyMac, d1)
        val tmp = AppUtil.asn1Tag(smMac, 0x8e)
        dataField = AppUtil.appendByteArray(dataField, tmp)
        return AppUtil.appendByte(
            AppUtil.appendByteArray(
                AppUtil.appendByteArray(
                    smHead,
                    byteArrayOf(dataField.size.toByte())
                ), dataField
            ), 0x00.toByte()
        )

    }


    @Throws(Exception::class)
    private fun respSM(keyEnc: ByteArray, keySig: ByteArray, resp: ByteArray): ApduResponse {
        AppUtil.increment(seq)
        // cerco il tag 87
        setIndex(0)
        var encData: ByteArray = byteArrayOf()
        var encObj = byteArrayOf()
        var dataObj: ByteArray = byteArrayOf()

        var sw = 0
        do {
            if (resp[index].compareTo(0x99.toByte()) == 0) {
                if (resp[index + 1].compareTo(0x02.toByte()) != 0)
                    throw ResponseSMException("Errore nella verifica del SM - lunghezza del DataObject")
                dataObj = AppUtil.getSub(resp, index, 4)
                sw = resp[index + 2].toInt().shl(8) or resp[index + 3].toInt()
                setIndex(index, 4)//index += 4;
                continue
            }
            if (resp[index].compareTo(0x8e.toByte()) == 0) {
                val calcMac = Algoritmi.macEnc(
                    keySig,
                    AppUtil.getIsoPad(AppUtil.appendByteArray(AppUtil.appendByteArray(seq, encObj), dataObj))
                )
                setIndex(index, 1)//index++;
                if (resp[index].compareTo(0x08.toByte()) != 0)
                    throw ResponseSMException("Errore nella verifica del SM - lunghezza del MAC errata")
                setIndex(index, 1)//index++;
                if (!Arrays.equals(calcMac, AppUtil.getSub(resp, index, 8)))
                    throw ResponseSMException("Errore nella verifica del SM - MAC non corrispondente")
                setIndex(index, 8)//index += 8;
                continue
            }
            if (resp[index] == 0x87.toByte()) {
                if (AppUtil.unsignedToBytes(resp[index + 1]) > AppUtil.unsignedToBytes(0x80.toByte())) {

                    var lgn = 0
                    val llen = AppUtil.unsignedToBytes(resp[index + 1]) - 0x80
                    if (llen == 1)
                        lgn = AppUtil.unsignedToBytes(resp[index + 2])
                    if (llen == 2)
                        lgn = resp[index + 2].toInt().shl(8) or resp[index + 3].toInt()
                    encObj = AppUtil.getSub(resp, index, llen + lgn + 2)
                    encData = AppUtil.getSub(resp, index + llen + 3, lgn - 1) // ' levo il padding indicator
                    setIndex(index, llen, lgn, 2)//index += llen + lgn + 2;
                } else {
                    encObj = AppUtil.getSub(resp, index, resp[index + 1] + 2)
                    encData = AppUtil.getSub(resp, index + 3, resp[index + 1] - 1) // ' levo il padding indicator
                    setIndex(index, resp[index + 1].toInt(), 2) //index += resp[index + 1] + 2;
                }
                continue
            } else if (java.lang.Byte.compare(resp[index], 0x85.toByte()) == 0) {
                if (java.lang.Byte.compare(resp[index + 1], 0x80.toByte()) > 0) {
                    var lgn = 0
                    val llen = resp[index + 1] - 0x80
                    if (llen == 1)
                        lgn = resp[index + 2].toInt()
                    if (llen == 2)
                        lgn = resp[index + 2].toInt().shl(8) or resp[index + 3].toInt()
                    encObj = AppUtil.getSub(resp, index, llen + lgn + 2)
                    encData = AppUtil.getSub(resp, index + llen + 2, lgn) // ' levo il padding indicator
                    setIndex(index, llen, lgn, 2)//index += llen + lgn + 2;
                } else {
                    encObj = AppUtil.getSub(resp, index, resp[index + 1] + 2)
                    encData = AppUtil.getSub(resp, index + 2, resp[index + 1].toInt())
                    setIndex(index, resp[index + 1].toInt(), 2) //index += resp[index + 1] + 2;

                }
                continue
            } else
                throw ResponseSMException("Tag non previsto nella risposta in SM")
            //index = index + resp[index + 1] + 1;
        } while (index < resp.size)

        if (encData.isNotEmpty()) {
            var resp = Algoritmi.desDec(keyEnc, encData)
            resp = AppUtil.isoRemove(resp)
            return ApduResponse(resp, AppUtil.intToByteArray(sw))
        }
        return ApduResponse(AppUtil.intToByteArray(sw))
    }


    @Throws(Exception::class)
    private fun getRespSM(responseTmp: ApduResponse): ApduResponse {
        var responseTmp = responseTmp
        var elaboraResp = byteArrayOf()
        if (responseTmp.response.isNotEmpty())
            elaboraResp = AppUtil.appendByteArray(elaboraResp, responseTmp.response)
        val sw = responseTmp.swInt
        while (true) {
            if (AppUtil.byteCompare(sw shr 8, 0x61) == 0) {
                val ln = (sw and 0xff).toByte()
                if (ln.toInt() != 0) {
                    val apdu = byteArrayOf(0x00, 0xc0.toByte(), 0x00, 0x00, ln)
                    responseTmp = transmit(apdu)
                    elaboraResp = AppUtil.appendByteArray(elaboraResp, responseTmp.response)
                    if (responseTmp.swInt == 0x9000)
                        break
                    if (AppUtil.byteCompare(responseTmp.swInt shr 8, 0x61) != 0) {
                        break
                    }
                } else {
                    val apdu = byteArrayOf(0x00, 0xc0.toByte(), 0x00, 0x00, 0x00)
                    responseTmp = transmit(apdu)
                    elaboraResp = AppUtil.appendByteArray(elaboraResp, responseTmp.response)
                }
            } else return if (AppUtil.byteArrayCompare(
                    responseTmp.swByte,
                    byteArrayOf(0x90.toByte(), 0x00.toByte())
                ) ||
                AppUtil.byteArrayCompare(responseTmp.swByte, byteArrayOf(0x6b.toByte(), 0x00.toByte())) ||
                AppUtil.byteArrayCompare(responseTmp.swByte, byteArrayOf(0x62.toByte(), 0x82.toByte()))
            ) {
                break
            } else
                ApduResponse(byteArrayOf(), byteArrayOf(sw.toByte()))
        }
        return respSM(sessEnc, sessMac, elaboraResp)
    }


    @Throws(Exception::class)
    private fun getResp(responseTmp: ApduResponse): ApduResponse {
        var response: ApduResponse?
        val resp = responseTmp.response
        var sw = responseTmp.swInt
        var elaboraResp = byteArrayOf()
        if (resp.isNotEmpty())
            elaboraResp = AppUtil.appendByteArray(elaboraResp, resp)
        val apduGetRsp = byteArrayOf(0x00.toByte(), 0xc0.toByte(), 0x00, 0x00)
        while (true) {
            if (AppUtil.byteCompare(sw shr 8, 0x61) == 0) {
                val ln = (sw and 0xff).toByte()
                if (ln.toInt() != 0) {
                    val apdu = AppUtil.appendByte(apduGetRsp, ln)
                    response = transmit(apdu)
                    elaboraResp = AppUtil.appendByteArray(elaboraResp, response.response)
                    return ApduResponse(AppUtil.appendByteArray(elaboraResp, response.swHex.toByteArray()))
                } else {
                    val apdu = AppUtil.appendByte(apduGetRsp, 0x00.toByte())
                    response = transmit(apdu)
                    sw = response.swInt
                    elaboraResp = AppUtil.appendByteArray(elaboraResp, response.response)
                }
            } else {
                return responseTmp

            }
        }
    }

    private fun HIBYTE(b: Int): Byte {
        return (b shr 8 and 0xFF).toByte()
    }

    private fun LOBYTE(b: Int): Byte {
        return b.toByte()
    }


    @Throws(Exception::class)
    private fun transmit(apdu: ByteArray): ApduResponse {
        CieIDSdkLogger.log("APDU: " + AppUtil.bytesToHex(apdu))
        val resp = ApduResponse(isoDep.transceive(apdu))

        CieIDSdkLogger.log("RESPONSE: " + AppUtil.bytesToHex(resp.response))
        CieIDSdkLogger.log("SW: " + AppUtil.bytesToHex(resp.swByte))
        return resp
    }




}
