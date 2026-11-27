import { PublicKey } from "@io-app/expo-crypto";
import pako from "pako";

import { LOLLIPOP_FAILURE_REASONS } from "../../../authentication/common/utils/loginFailure";
import { toBase64EncodedThumbprint } from "../crypto";
import {
  DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER,
  verifySamlRequest
} from "../login";

const publicKey: PublicKey = {
  crv: "P-256",
  kty: "EC",
  x: "uao9Cd3ecm/nHVJP05C5AycOuRq9+W/kFGUgPRB2Xic=",
  y: "ExlJCRzL4crzq05EGcAl8b6stmjYeBTkCiiRziKPWaY="
};

const buildUrlEncodedSamlRequest = (xml: string) => {
  const deflated = pako.deflateRaw(xml);
  const base64 = Buffer.from(deflated).toString("base64");
  return encodeURIComponent(base64);
};

const buildAuthnRequestXml = (prefix: string, id?: string) => {
  const tag = prefix ? `${prefix}:AuthnRequest` : "AuthnRequest";
  const xmlns = prefix
    ? `xmlns:${prefix}="urn:oasis:names:tc:SAML:2.0:protocol"`
    : "";
  const idAttr = id ? `ID="${id}"` : "";

  return `<${tag} ${xmlns} ${idAttr} Version="2.0" IssueInstant="2024-01-01T00:00:00Z"></${tag}>`;
};

const validThumbprintWithAlgorithm = `${DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER}-${toBase64EncodedThumbprint(
  publicKey
)}`;

describe("verifySamlRequest", () => {
  test.each([
    { name: "samlp (IO namespace)", prefix: "samlp" },
    { name: "saml2p (OI namespace)", prefix: "saml2p" },
    { name: "an unknown/future namespace", prefix: "foo" },
    { name: "no namespace prefix", prefix: "" }
  ])(
    "should return no failure when the XML AuthnRequest uses $name",
    async ({ prefix }) => {
      const urlEncodedSamlRequest = buildUrlEncodedSamlRequest(
        buildAuthnRequestXml(prefix, validThumbprintWithAlgorithm)
      );

      await expect(
        verifySamlRequest(urlEncodedSamlRequest, publicKey)
      ).resolves.toBeUndefined();
    }
  );

  test.each([
    {
      name: "the payload cannot be decoded",
      urlEncodedSamlRequest: `$a{${buildUrlEncodedSamlRequest(
        buildAuthnRequestXml("samlp", validThumbprintWithAlgorithm)
      )}}b`,
      expected: LOLLIPOP_FAILURE_REASONS.DECODING_FAILED
    },
    {
      name: "the XML cannot be parsed",
      urlEncodedSamlRequest: buildUrlEncodedSamlRequest("<AuthnRequest"),
      expected: LOLLIPOP_FAILURE_REASONS.CONVERSION_FAILED
    },
    {
      name: "the AuthnRequest has no ID",
      urlEncodedSamlRequest: buildUrlEncodedSamlRequest(
        buildAuthnRequestXml("saml2p", undefined)
      ),
      expected: LOLLIPOP_FAILURE_REASONS.MISSING_ID
    },
    {
      name: "the AuthnRequest ID does not match the local public key thumbprint",
      urlEncodedSamlRequest: buildUrlEncodedSamlRequest(
        buildAuthnRequestXml("saml2p", "sha256-not-matching-value")
      ),
      expected: LOLLIPOP_FAILURE_REASONS.MISMATCH
    }
  ])(
    "should return the failure reason when $name",
    async ({ expected, urlEncodedSamlRequest }) => {
      await expect(
        verifySamlRequest(urlEncodedSamlRequest, publicKey)
      ).resolves.toBe(expected);
    }
  );
});
