package it.ipzs.cieidsdk.ciekeystore

import java.math.BigInteger
import java.security.cert.X509Certificate
import java.security.interfaces.RSAPrivateKey
import java.security.interfaces.RSAPublicKey


internal class CiePrivateKey internal constructor(private val cert: X509Certificate) : RSAPrivateKey {

    override fun getAlgorithm(): String {
        return "RSA"
    }

    override fun getFormat(): String? {
        return null
    }

    override fun getEncoded(): ByteArray {
        return ByteArray(0)
    }


    override fun getPrivateExponent(): BigInteger {
        throw UnsupportedOperationException()
    }

    override fun getModulus(): BigInteger {
        val pk = cert.publicKey as RSAPublicKey
        return pk.modulus
    }

}
