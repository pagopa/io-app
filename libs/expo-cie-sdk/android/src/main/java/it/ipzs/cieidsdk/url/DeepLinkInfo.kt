package it.ipzs.cieidsdk.url

internal data class DeepLinkInfo(
    val name: String? = null,
    val authnRequest: String? = null,
    val value: String? = null,
    val opText: String? = null,
    val nextUrl: String? = null,
    val host: String? = null,
    val logo: String? = null
) {

    companion object {
        const val KEY_VALUE = "value"
        const val KEY_AUTHN_REQUEST_STRING = "authnRequestString"
        const val KEY_NAME = "name"
        const val KEY_NEXT_UTL = "nextUrl"
        const val KEY_OP_TEXT = "OpText"
        const val KEY_LOGO = "imgUrl"
    }


}
