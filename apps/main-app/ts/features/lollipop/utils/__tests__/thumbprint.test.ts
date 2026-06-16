import * as O from "fp-ts/lib/Option";
import { PublicKey } from "@pagopa/io-react-native-crypto";
import { jwkThumbprintByEncoding } from "jwk-thumbprint";
import { toBase64EncodedThumbprint, toThumbprint } from "../crypto";
import { DEFAULT_LOLLIPOP_HASH_ALGORITHM_CLIENT } from "../login";

const jwkPublicKey: PublicKey = {
  crv: "P-256",
  x: "dyLTwacs5ej/nnXIvCMexUBkmdh6ArJ4GPKjHob61mE=",
  kty: "EC",
  y: "Tz0xNv++cOeLVapU/BhBS0FJydIcNcV25/ALb1HVu+s="
};

const expectedThumbprint = "SXn6l6BNlwAb60cJUKpvKB3H-UQbe2slQ_8LBR70cfA";

describe("Test toThumbprint", () => {
  it("should return the correct thumbprint", () => {
    const thumbprint = toThumbprint(O.some(jwkPublicKey));
    expect(thumbprint).toEqual(expectedThumbprint);
  });

  it("should return undefined", () => {
    const thumbprint = toThumbprint(O.none);
    expect(thumbprint).toBeUndefined();
  });

  it("should return the same result as toBase64EncodedThumbprint", () => {
    const thumbprint = toThumbprint(O.some(jwkPublicKey));
    expect(thumbprint).toEqual(toBase64EncodedThumbprint(jwkPublicKey));
  });

  it("should return the same result as as jwkThumbprintByEncoding", () => {
    const thumbprint = toThumbprint(O.some(jwkPublicKey));
    const thumbprintFromLib = jwkThumbprintByEncoding(
      jwkPublicKey,
      DEFAULT_LOLLIPOP_HASH_ALGORITHM_CLIENT,
      "base64url"
    );
    expect(thumbprint).toEqual(thumbprintFromLib);
  });
});
