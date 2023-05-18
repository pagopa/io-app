import { PublicKey } from "@pagopa/io-react-native-crypto";
import pako from "pako";
import { parseStringPromise } from "xml2js";
import { trackLollipopIdpLoginFailure } from "../../../utils/analytics";
import { toBase64EncodedThumbprint } from "./crypto";

export const DEFAULT_LOLLIPOP_HASH_ALGORITHM_CLIENT = "SHA-256";
export const DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER = "sha256";

export const lollipopSamlVerify = (
  urlEncodedSamlRequest: string,
  publicKey: PublicKey,
  onSuccess: () => void,
  onFailure: (reason: string) => void
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
        onFailure("Missing ID parameter in samlp:AuthnRequest");
        return;
      }

      // Hash the local public key
      const localPublicKeyThumbprint = toBase64EncodedThumbprint(publicKey);
      // And append the algorithm used to hash it. The algorithm
      // representation must be the one that the server recognizes
      const localPublicKeyThumbprintWithHashAlgorithm = `${DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER}-${localPublicKeyThumbprint}`;

      if (
        localPublicKeyThumbprintWithHashAlgorithm !==
        responseThumbprintWithHashAlgorithm
      ) {
        // Hash signature from server did not match the
        // local one, so the response cannot be trusted
        onFailure("Mismatch between local and remote ID parameter content");
        return;
      }

      onSuccess();
    })
    .catch(_ => {
      onFailure("Unable to convert saml request from xml to json");
    });
};

export const verifyLollipopSamlRequestTask = (
  url: string,
  urlEncodedSamlRequest: string,
  publicKey: PublicKey
): Promise<string> =>
  new Promise((resolve, reject) => {
    lollipopSamlVerify(
      urlEncodedSamlRequest,
      publicKey,
      () => {
        resolve(url);
      },
      (reason: string) => {
        trackLollipopIdpLoginFailure(reason);
        reject(new Error(reason));
      }
    );
  });
