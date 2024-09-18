import { generateTrustmarkUrl } from "../itwCredentialUtils";
import { StoredCredential } from "../itwTypesUtils";

describe("ITW Credential Utils: generateTrustmarkUrl", () => {
  it("Generates the correct url with the given credential", () => {
    const credential = {
      credential:
        "ewogICJraWQiOiAiNTUxMTc2YWMtMWQ3Mi00NTczLTkxMGQtZWM0MjdlODE4MzlkIiwKICAidHlwIjogImp3dCIsCiAgImFsZyI6ICJFUzI1NiIKfQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJkZXNjcmlwdGlvbiI6IlRoaXMgaXMgYSBzaWduYXR1cmUgdGVzdCBmb3IgY3JlZGVudGlhbCBpc3N1ZXIiLCJqd3QiOiJZZXMsIEknbSBhIEpXVCBidXQgbm90dGhpbmcgZGlmZmVyZW50IGZyb20gc2Qtand0In0.ra5cJj8oyH-KbM7kQnjuCLcc1ZeK3quyG7AY6G0crF58oFUJxh1NC8p0iNSkM7p9d8ZOap-kb5vuwOqsNrgLgw~WyJIUGc1MFRRVHd3ODV6MmxzOTM2cDdRIiwiZHJpdmluZ19wcml2aWxlZ2VzIiwiQU0gQiJdWyIxZ21aSFVBbXNvbUkxdmU4MktfbGZnIiwiZG9jdW1lbnRfbnVtYmVyIiwiWDEwMFkxMDEwVyJd"
    } as StoredCredential;
    const verifierUrl = "https://verifier.eaa.example.it";

    expect(generateTrustmarkUrl(credential, verifierUrl)).toEqual(
      "https://verifier.eaa.example.it?data_hash=430e5a8f72a70604344f58e40df66cb6dc9f5b013ae6156f18bdb5dea3b4888e&signature=ra5cJj8oyH-KbM7kQnjuCLcc1ZeK3quyG7AY6G0crF58oFUJxh1NC8p0iNSkM7p9d8ZOap-kb5vuwOqsNrgLgw&kid=551176ac-1d72-4573-910d-ec427e81839d"
    );
  });
});
