import {
  verifySignatureHeader,
  VerifySignatureHeaderOptions
} from "@mattrglobal/http-signatures";
import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/lib/Task";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import * as jose from "jose";

import {
  getCustomContentChallenge,
  getCustomContentSignatureBase,
  getSignatureInfo,
  isSignAlgorithmValid,
  signAlgorithmToVerifierMap,
  toPem,
  verifyCustomContentChallenge
} from "../../httpSignature";

// Android RSA Public Key
const rsaPublicKeyJwk = {
  e: "AQAB",
  n: "AOGUlxpUt6Cq4AuTg+XSWKs7JJepRhNvD/kNwK2jXnSxIcFGAFLj2A/t+tPltMgB6LKrkFXfbl6fBSxsy90R922il61e/mtpxiCEPg/Go4NPYNbXSopPYRdbGdidn8ai5itQn4h3Zx++p8aE4YM9JbqZN0CetBL27PHk9H6XpkpxW8W0Dn62o1gXsNbD5s6YSUb0+qeREuWuKxS/xf2D+9ujh/DEb2n7WpbChFOvyk0Ui2zjxo57ZXnKe/h7qGcbH3c4K7Z1jqdGqZ9Cor6a2Hcl7Kt6CP7jdpW3j2FE+av4XOigGg3IJK57XW6HsbcU+Vm0mydHGDYBPSXB8+MaFB8=",
  alg: "RS256",
  kty: "RSA"
};

const rsaPublicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4ZSXGlS3oKrgC5OD5dJY
qzskl6lGE28P+Q3AraNedLEhwUYAUuPYD+360+W0yAHosquQVd9uXp8FLGzL3RH3
baKXrV7+a2nGIIQ+D8ajg09g1tdKik9hF1sZ2J2fxqLmK1CfiHdnH76nxoThgz0l
upk3QJ60Evbs8eT0fpemSnFbxbQOfrajWBew1sPmzphJRvT6p5ES5a4rFL/F/YP7
26OH8MRvaftalsKEU6/KTRSLbOPGjntlecp7+HuoZxsfdzgrtnWOp0apn0KivprY
dyXsq3oI/uN2lbePYUT5q/hc6KAaDcgkrntdboextxT5WbSbJ0cYNgE9JcHz4xoU
HwIDAQAB
-----END PUBLIC KEY-----`;

const rsaThumbprint = "Ii6BXhYgSGHgpjj0rj57ODP1Z4HX1y3J70IJ1iwb1Wc";

// signature_input header from the API request
const SIGNATURE_INPUT =
  'sig1=("x-pagopa-lollipop-original-method" "x-pagopa-lollipop-original-url");created=1678478670;nonce="nonce-123";alg="rsa-pss-sha256";keyid="Ii6BXhYgSGHgpjj0rj57ODP1Z4HX1y3J70IJ1iwb1Wc",sig2=("x-pagopa-lollipop-custom-tos-challenge");created=1678478670;nonce="nonce-123";alg="rsa-pss-sha256";keyid="Ii6BXhYgSGHgpjj0rj57ODP1Z4HX1y3J70IJ1iwb1Wc",sig3=("x-pagopa-lollipop-custom-sign-challenge");created=1678478670;nonce="nonce-123";alg="rsa-pss-sha256";keyid="Ii6BXhYgSGHgpjj0rj57ODP1Z4HX1y3J70IJ1iwb1Wc"';
// signature header frome the API request
const SIGNATURE =
  "sig1=:po9EbbRn8V/H+/wmWYjLURelKiR6zicz8a71u7C6wxjLeANImDlvmgDke1ESGqv/dAhIny9XtxfaDUqZx6QKdIBPPwualgWdtkLc+v/7f27/5EUsCowtF9q0rUsTxU5yJIsgBILpsaFtZfKVCMEjvNNrX+H+SASUWDe1r4/h0BWcD56gGwtQ1yRkuV5WeDSL7ItThFS0w5Hcg1smC91y5CGCXaCKUxFlYDcyZD8vBnpGzX9GtZYJSRTfgoXcT9HbfO3y9MPq6x83Q64TSETbAknPIDg4JpSsh54TWdo8WGukbdc2smyhzlJk9IZKsMAv1e6Bfb2WgA9XfBHDRRXyxQ==:,sig2=:JrbXUBe+s0dUVw38e1voW8mvb40oBOB1ELxUgqiHrpTioTiOJgunh5w5UmPB2pKu2MZyKThrGnyGdeasKfHYXKWPDDyiQDIb4He5FKi/6AZMvGRe6yOebANWw2NCpXJqxwQIxr4CP6e22Ab8GCrvx0nRzlIobggjrJ7WCjQOen9v+8ftExGSFM3I0T9MZ/hORighy9TzRtciGxfVVpp4C64TtAwAI+Il09V2BGN7wle0GMsMLWCh/9XqTYlvNk4BPG60RyUSA3OBTs6PsPk7fSvrptMK7MwkD92ZZiylYjDkQ5QXuuAIJNXqqNXBplfxkGYqoxaOxW12Aw8qIiKHHA==:,sig3=:T0F/2mi8INdJ/STqsJ6bpIkeUN7YN32rE64u9AD2PAYSdzeoOZ/2+cY+2ZKq0r2eM3XTiTykGPfTZWJ1OiFW9rcOyhFbYTVd39suMUn/KLZUAX4pQIEUA7FP9Ald1H/xPwK/wcBFlzfPDQOV7mgnfzncsuPfiJaE+dElHP6vmQXYetQE9poryTTnx1oZybNmB/2amOKJF6uh2zoet4v0TwlJIqDDp56x2/KzY/yAwg1tjuKq/z2qWumIo58tPpSHTswIIHAbm9nscX2rCG3OS7ADsSgfNVLth+j77seKSRIBOG9bsgYPwK+XG3CN237dsLsMtoPAuBeqxp+1b6K0Jg==:";
// LC HEX encoded TOS hash to be verified
const TOS_CHALLENGE =
  "f46a0523e83e2c45b3b948e76bb6617d35e0159f9ae2ccf27865efb5d390f8aa";
// LC HEX encoded Documents hash to be verified
const CHALLENGE =
  "2a6a0a73efb1197847f2426d3b508411688ddc924248cde9aae0911aad73a676";

const TOS_HEADER_NAME = "x-pagopa-lollipop-custom-tos-challenge";
const SIGNATURE_HEADER_NAME = "x-pagopa-lollipop-custom-sign-challenge";

const TOS_CHALLENGE_SIGNATURE_BASE = `"${TOS_HEADER_NAME}": f46a0523e83e2c45b3b948e76bb6617d35e0159f9ae2ccf27865efb5d390f8aa
"@signature-params": ("${TOS_HEADER_NAME}");created=1678478670;nonce="nonce-123";alg="rsa-pss-sha256";keyid="Ii6BXhYgSGHgpjj0rj57ODP1Z4HX1y3J70IJ1iwb1Wc"`;

const CHALLENGE_SIGNATURE_BASE = `"${SIGNATURE_HEADER_NAME}": 2a6a0a73efb1197847f2426d3b508411688ddc924248cde9aae0911aad73a676
"@signature-params": ("${SIGNATURE_HEADER_NAME}");created=1678478670;nonce="nonce-123";alg="rsa-pss-sha256";keyid="Ii6BXhYgSGHgpjj0rj57ODP1Z4HX1y3J70IJ1iwb1Wc"`;

const TEST_CONTENT = [
  {
    header: TOS_HEADER_NAME,
    signatureBase: TOS_CHALLENGE_SIGNATURE_BASE,
    challenge: TOS_CHALLENGE
  },
  {
    header: SIGNATURE_HEADER_NAME,
    signatureBase: CHALLENGE_SIGNATURE_BASE,
    challenge: CHALLENGE
  }
];

describe("Test JWK utilities", () => {
  it("should check that the JWK thumbprint is right", async () => {
    const thumbprint = await jose.calculateJwkThumbprint(
      rsaPublicKeyJwk,
      "sha256"
    );
    expect(thumbprint).toBe(rsaThumbprint);
  });

  it("should check that the JWK thumbprint is wrong", async () => {
    const thumbprint = await jose.calculateJwkThumbprint(
      rsaPublicKeyJwk,
      "sha512"
    );
    expect(thumbprint).not.toBe(rsaThumbprint);
  });

  it("should convert the JWK to PEM successfully", async () => {
    const pemKey = await pipe(
      toPem(rsaPublicKeyJwk),
      TE.fold(
        () => T.of(""),
        result => T.of(result)
      )
    )();
    expect(pemKey).toBe(rsaPublicKeyPem);
  });

  it("should fails to convert the JWK to PEM", async () => {
    const pemKey = await pipe(
      toPem({ ...rsaPublicKeyJwk, e: "" }),
      TE.fold(
        () => T.of(""),
        result => T.of(result)
      )
    )();
    expect(pemKey).not.toBe(rsaPublicKeyPem);
  });
});

describe("Test custom content TOS and Sign Challenges", () => {
  TEST_CONTENT.forEach(content => {
    it(`it should compute successfully the signature base of "${content.header}"`, async () => {
      const customContentSignatureBase = getCustomContentSignatureBase(
        SIGNATURE_INPUT,
        content.challenge,
        content.header
      );
      expect(customContentSignatureBase).not.toBe(undefined);
      if (customContentSignatureBase) {
        expect(customContentSignatureBase.signatureBase).toBe(
          content.signatureBase
        );
      }
    });
  });

  TEST_CONTENT.forEach(content => {
    it(`it should verify successfully the signature of the signature base of "${content.header}"`, async () => {
      const customContentSignatureBase = getCustomContentSignatureBase(
        SIGNATURE_INPUT,
        content.challenge,
        content.header
      );

      expect(customContentSignatureBase).not.toBe(undefined);
      if (customContentSignatureBase) {
        const customContentChallenge = getCustomContentChallenge(
          customContentSignatureBase.signatureLabel,
          SIGNATURE
        );

        expect(customContentChallenge).not.toBe(undefined);
        if (customContentChallenge) {
          const result = await verifyCustomContentChallenge(
            customContentSignatureBase.signatureBase,
            customContentChallenge,
            rsaPublicKeyJwk
          )();

          expect(result).toBeTruthy();
        }
      }
    });
  });
});

describe("Test the signature algorithms", () => {
  TEST_CONTENT.forEach(content => {
    it(`it should retrive a valid sign algorithm for "${content.header}" from signature-input`, () => {
      const signAlgorithm = getSignatureInfo(content.signatureBase);
      expect(O.isSome(signAlgorithm)).toBeTruthy();
      expect(isSignAlgorithmValid(signAlgorithm)).toBeTruthy();
    });
    it(`it should retrive a wrong sign algorithm for "${content.header}" from signature-input`, () => {
      const wrongSignAlgorithm = getSignatureInfo("wrong-value");
      expect(O.isNone(wrongSignAlgorithm)).toBeTruthy();
      expect(isSignAlgorithmValid(wrongSignAlgorithm)).toBeFalsy();
    });
  });
});

const MOCK_VERIFY_SIGNATURE_HEADER_OPTIONS: VerifySignatureHeaderOptions = {
  verifier: {
    verify:
      signAlgorithmToVerifierMap["ecdsa-p256-sha256"].verify(rsaPublicKeyJwk)
  },
  url: "http://127.0.0.1:3000",
  method: "GET",
  httpHeaders: {
    host: "127.0.0.1:3000",
    connection: "Keep-Alive",
    "accept-encoding": "gzip",
    "user-agent": "okhttp/4.9.2",
    "x-pagopa-lollipop-original-url": "/api/v1/profile",
    "x-pagopa-lollipop-original-method": "GET",
    [TOS_HEADER_NAME]: TOS_CHALLENGE,
    [SIGNATURE_HEADER_NAME]: CHALLENGE,
    signature: SIGNATURE,
    "signature-input": SIGNATURE_INPUT
  },
  body: undefined,
  signatureKey: "",
  verifyExpiry: false
};
describe("Test http-signature request", () => {
  ["sig1", "sig2", "sig3", undefined, "sig8"].forEach(sigLabel => {
    const mockRequestOptions: VerifySignatureHeaderOptions = {
      ...MOCK_VERIFY_SIGNATURE_HEADER_OPTIONS,
      signatureKey: sigLabel
    };
    it(`it should expect that the verification of the "signature" haeder for the label ${sigLabel} to be ${
      sigLabel !== "sig8" ? "correct" : "wrong"
    }`, async () => {
      const verificationResult =
        await verifySignatureHeader(mockRequestOptions);
      const verification = verificationResult.unwrapOr({
        verified: false
      }).verified;
      if (sigLabel !== "sig8") {
        expect(verificationResult.isOk()).toBeTruthy();
        expect(verification).toBeTruthy();
      } else {
        expect(verificationResult.isOk()).toBeTruthy();
        expect(verification).toBeFalsy();
      }
    });
  });
});
