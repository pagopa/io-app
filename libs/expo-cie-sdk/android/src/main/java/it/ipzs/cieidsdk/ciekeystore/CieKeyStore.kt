package it.ipzs.cieidsdk.ciekeystore

import java.io.InputStream
import java.io.OutputStream
import java.security.*
import java.security.cert.Certificate
import java.security.cert.CertificateFactory
import java.security.cert.X509Certificate
import java.util.*

internal class CieKeyStore : KeyStoreSpi() {

    val ALIAS = "CertAutenticazione"
    var USERS_CERTS_ALIASES: ArrayList<String> = arrayListOf()

    init {
        USERS_CERTS_ALIASES.add(ALIAS)
    }

    private val keyStore = KeyStore.getInstance(KeyStore.getDefaultType())

    override fun engineIsKeyEntry(alias: String?): Boolean {
        throw UnsupportedOperationException()
    }

    override fun engineIsCertificateEntry(alias: String?): Boolean {
        throw UnsupportedOperationException()
    }

    override fun engineGetCertificate(alias: String?): Certificate? {
        return keyStore.getCertificate(alias)
    }

    override fun engineGetCreationDate(alias: String?): Date {
        throw UnsupportedOperationException()
    }

    override fun engineDeleteEntry(alias: String?) {
        throw UnsupportedOperationException()
    }

    override fun engineSetKeyEntry(alias: String?, key: Key?, password: CharArray?, chain: Array<out Certificate>?) {
        throw UnsupportedOperationException()
    }

    override fun engineSetKeyEntry(alias: String?, key: ByteArray?, chain: Array<out Certificate>?) {
        throw UnsupportedOperationException()
    }

    override fun engineStore(stream: OutputStream?, password: CharArray?) {
        throw UnsupportedOperationException()
    }

    override fun engineSize(): Int {
        return USERS_CERTS_ALIASES.size
    }

    override fun engineAliases(): Enumeration<String> {
        return Collections.enumeration(USERS_CERTS_ALIASES)
    }

    override fun engineContainsAlias(alias: String?): Boolean {
        return USERS_CERTS_ALIASES.contains(alias)
    }

    override fun engineLoad(stream: InputStream?, password: CharArray?) {

        keyStore.load(null,null)
        val cfCSCA = CertificateFactory.getInstance("X.509")
        val certificatoUtente =
            cfCSCA.generateCertificate(stream) as X509Certificate
        engineSetCertificateEntry(ALIAS, certificatoUtente)

    }

    override fun engineGetCertificateChain(alias: String?): Array<Certificate> {
        return arrayOf(engineGetCertificate(alias) as X509Certificate)
    }

    override fun engineSetCertificateEntry(alias: String?, cert: Certificate?) {
        keyStore.setCertificateEntry(alias, cert)
    }

    override fun engineGetCertificateAlias(cert: Certificate?): String {
        return ALIAS
    }


    override fun engineGetKey(alias: String?, password: CharArray?): Key {
        val cert = engineGetCertificate(ALIAS) as X509Certificate
        return CiePrivateKey(cert)
    }

    override fun engineGetEntry(alias: String?, protParam: KeyStore.ProtectionParameter?): KeyStore.Entry {
        val key = engineGetKey(alias, null) as PrivateKey
        return KeyStore.PrivateKeyEntry(key, engineGetCertificateChain(alias))
    }

    override fun engineEntryInstanceOf(alias: String, entryClass: Class<out KeyStore.Entry>): Boolean {
        return entryClass == KeyStore.PrivateKeyEntry::class.java
    }

}