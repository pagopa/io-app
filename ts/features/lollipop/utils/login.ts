import { PublicKey } from "@pagopa/io-react-native-crypto";
import { jwkThumbprintByEncoding } from "jwk-thumbprint";
import pako from "pako";
import { parseStringPromise } from "xml2js";

export const DEFAULT_LOLLIPOP_HASH_ALGORITHM_CLIENT = "SHA-256";
export const DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER = "sha256";

export const lollipopSamlVerify = (
  urlEncodedSamlRequest: string,
  publicKey: PublicKey,
  onSuccess: () => void,
  onFailure: () => void
) => {
  // SAMLRequest is URL encoded, so decode it
  const decodedSamlRequest = decodeURIComponent(urlEncodedSamlRequest);
  // Result is a base64 encoded string, so decode it to obtain the (server) original XML
  const xmlSamlRequest = pako.inflateRaw(
    Buffer.from(decodedSamlRequest, "base64"),
    {
      to: "string"
    }
  );

  // Convert XML to Json (in order not to include a XML Parser library)
  parseStringPromise(xmlSamlRequest)
    .then(jsonSamlRequest => {
      // Extract the AuthnRequest from the JSON
      const authnRequest = jsonSamlRequest["samlp:AuthnRequest"];
      // Extract the ID parameter (which may not be there, so handle the case).
      // The extracted string is in the format {HashAlgorithmName}-{HashedPublicKey}
      const responseThumbprintWithHashAlgorithm = authnRequest?.$?.ID;
      if (!responseThumbprintWithHashAlgorithm) {
        // If the request did not include the ID, treat it as a failure
        onFailure();
        return;
      }

      // Hash the local public key
      const localPublicKeyThumbprint = jwkThumbprintByEncoding(
        publicKey,
        DEFAULT_LOLLIPOP_HASH_ALGORITHM_CLIENT,
        "base64url"
      );
      // And append the algorithm used to hash it. The algorithm
      // representation must be the one that the server recognizes
      const localPublicKeyThumbprintWithHashAlgorithm = `${DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER}-${localPublicKeyThumbprint}`;

      if (
        localPublicKeyThumbprintWithHashAlgorithm !==
        responseThumbprintWithHashAlgorithm
      ) {
        // Hash signature from server did not match the
        // local one, so the response cannot be trusted
        onFailure();
        return;
      }

      onSuccess();
    })
    .catch(_ => {
      onFailure();
    });
};
