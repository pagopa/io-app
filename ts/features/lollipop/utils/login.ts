import { PublicKey } from "@pagopa/io-react-native-crypto";
import { jwkThumbprintByEncoding } from "jwk-thumbprint";
import pako from "pako";
import { parseStringPromise } from "xml2js";

export const lollipopSamlVerify = (
  samlRequest: string,
  publicKey: PublicKey,
  onSuccess: () => void,
  onFailure: () => void
) => {
  const decodeSaml = decodeURIComponent(samlRequest);

  const xmlSamlRequest = pako.inflateRaw(Buffer.from(decodeSaml, "base64"), {
    to: "string"
  });

  parseStringPromise(xmlSamlRequest)
    .then(xmlToJson => {
      const authnRequest = xmlToJson["samlp:AuthnRequest"];

      const thumbprint = jwkThumbprintByEncoding(
        publicKey,
        "SHA-256",
        "base64url"
      );

      if (authnRequest && authnRequest.$.ID === thumbprint) {
        onSuccess();
        return;
      }

      onFailure();
    })
    .catch(_ => {
      onFailure();
    });
};
