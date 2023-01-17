import { generateDigestHeader, validateDigestHeader } from "../digest";

const httpRequestBody = `{ hello: "World!" }`;
// echo -n "{ hello: \"World\!\" }" | sha256sum | xxd -r -p | base64
// eNJnazvTtWDD2IoIlFZca3TDmPd3BpaM2GDcn4/bnSk=
const checkContentDigest =
  "sha-256=:eNJnazvTtWDD2IoIlFZca3TDmPd3BpaM2GDcn4/bnSk=:";

describe("Check generateDigestHeader", () => {
  it(`should be ${checkContentDigest}`, () => {
    const digestHeader = generateDigestHeader(httpRequestBody);
    expect(digestHeader).toBe(checkContentDigest);
  });
});

describe("Check validateDigestHeader/generateDigestHeader", () => {
  it(`against ${httpRequestBody}`, () => {
    const digestHeader = generateDigestHeader(httpRequestBody);
    // eslint-disable-next-line functional/no-let
    let invalidReason = "";
    try {
      validateDigestHeader(digestHeader, httpRequestBody);
    } catch (e) {
      invalidReason = `${e}`;
    }
    expect(invalidReason).toBe("");
  });
});
