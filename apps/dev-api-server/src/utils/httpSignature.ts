import { AlgorithmTypes } from "@mattrglobal/http-signatures";
import * as crypto from "crypto";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/TaskEither";
import * as jose from "jose";

export const verifyCustomContentChallenge = (
  signatureBase: string | undefined,
  signatureToVerify: string,
  publicKey: jose.JWK
) =>
  pipe(
    toPem(publicKey),
    TE.fold(
      _ => T.of(false),
      pemKey =>
        pipe(
          signatureBase,
          O.fromNullable,
          O.fold(
            () => T.of(false),
            signatureBase =>
              T.of(
                crypto
                  .createVerify("sha256")
                  .update(signatureBase)
                  .verify(
                    {
                      key: pemKey,
                      padding:
                        publicKey.kty === "RSA"
                          ? crypto.constants.RSA_PKCS1_PSS_PADDING
                          : undefined
                    },
                    signatureToVerify,
                    "base64"
                  )
              )
          )
        )
    )
  );

const toDigestAlgo = (jwk: jose.JWK) => (jwk.kty === "EC" ? "ES256" : "PS256");

// https://www.scottbrady91.com/jose/jwts-which-signing-algorithm-should-i-use
export const toPem = (jwk: jose.JWK) =>
  pipe(
    TE.tryCatch(
      () => jose.importJWK(jwk, toDigestAlgo(jwk)),
      e => new Error(String(e))
    ),
    TE.chain(publicKey =>
      TE.tryCatch(
        () => jose.exportSPKI(publicKey as jose.KeyLike),
        e => new Error(String(e))
      )
    ),
    TE.map(result => result.trim())
  );

export type SignatureBaseInfo = {
  signatureBase: string;
  signatureLabel: string;
};

export const getCustomContentSignatureBase = (
  signatureInput: string,
  challengeHex: string,
  headerName: string
): SignatureBaseInfo | undefined =>
  pipe(
    signatureInput.split(","),
    A.findFirst(value =>
      new RegExp(`^sig\\d+=\\("${headerName}"\\)`).test(value)
    ),
    O.fold(
      () => undefined,
      sigInput => ({
        signatureBase: `"${headerName}": ${challengeHex}\n"@signature-params": ${sigInput.replace(
          /^sig\d+=/,
          ""
        )}`,
        signatureLabel: pipe(
          sigInput.match(/^sig(\d+)/),
          O.fromNullable,
          O.fold(
            () => "",
            v => v[0]
          )
        )
      })
    )
  );

export const getCustomContentChallenge = (
  signatureLabel: string,
  signature: string
) =>
  pipe(
    signature,
    s => new RegExp(`${signatureLabel}=:(.+?):`).exec(s),
    O.fromNullable,
    O.map(match => match[1]),
    O.fold(
      () => "",
      result => result
    )
  );

export type SignatureAlgorithm = "ecdsa-p256-sha256" | "rsa-pss-sha256";

export const getSignatureInfo = (
  signatureBase: string
): O.Option<SignatureAlgorithm> =>
  pipe(
    signatureBase,
    s => new RegExp(`alg="(.+?)"`).exec(s),
    O.fromNullable,
    O.map(match => match[1])
  ) as O.Option<SignatureAlgorithm>;

export const isSignAlgorithmValid = (
  signAlghorithm: O.Option<SignatureAlgorithm>
) =>
  pipe(
    signAlghorithm,
    O.fold(
      () => false,
      v => v === "ecdsa-p256-sha256" || v === "rsa-pss-sha256"
    )
  );

const signatureVerifier =
  (publicKey: JsonWebKey) =>
  async (
    _: { alg: AlgorithmTypes; keyid: string },
    data: Uint8Array,
    signature: Uint8Array
  ): Promise<boolean> =>
    await verifyCustomContentChallenge(
      Buffer.from(data).toString("utf-8"),
      Buffer.from(signature).toString("base64"),
      publicKey as jose.JWK
    )();

type VerifyFunction = (
  signatureParams: { alg: AlgorithmTypes; keyid: string },
  data: Uint8Array,
  signature: Uint8Array
) => Promise<boolean>;

type VerifyFunctionWrapper = (privateKey: JsonWebKey) => VerifyFunction;

export const signAlgorithmToVerifierMap: {
  [key: string]: {
    verify: VerifyFunctionWrapper;
  };
} = {
  ["rsa-pss-sha256"]: {
    verify: signatureVerifier
  },
  ["ecdsa-p256-sha256"]: {
    verify: signatureVerifier
  }
};
