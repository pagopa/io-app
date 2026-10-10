package it.ipzs.cieidsdk.network.service

import io.reactivex.Single
import it.ipzs.cieidsdk.network.Endpoints
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.FieldMap
import retrofit2.http.FormUrlEncoded
import retrofit2.http.Headers
import retrofit2.http.POST

internal interface IdpService {

    @Headers("User-Agent: Mozilla/5.0")
    @FormUrlEncoded
    @POST(Endpoints.idp)
    fun callIdp(@FieldMap(encoded = true) values: Map<String, String>): Single<Response<ResponseBody>>

    companion object {

        val generaCodice = "generaCodice"
        val authnRequest = "authnRequest"
    }
}
