import { fromIdpToLocalSpidIdp } from "../idps";

describe("fromIdpToLocalSpidIdp", () => {
  it("should return an empty array if the input is empty", () => {
    const result = fromIdpToLocalSpidIdp([]);
    expect(result).toEqual([]);
  });

  it("should correctly map IDPs to the local SpidIdp format", () => {
    const idps = fromIdpToLocalSpidIdp([
      {
        entityID: "https://test.idp.it",
        friendlyName: "Test IDP",
        active: true,
        status: "OK"
      }
    ]);

    expect(idps).toEqual([
      {
        id: "https://test.idp.it",
        name: "Test IDP",
        logo: {
          light: {
            uri: "https://assets.oneid.pagopa.it/assets/idps/aHR0cHM6Ly90ZXN0LmlkcC5pdA.png"
          },
          dark: {
            uri: "https://assets.oneid.pagopa.it/assets/idps/aHR0cHM6Ly90ZXN0LmlkcC5pdA-dark.png"
          }
        },
        profileUrl: ""
      }
    ]);
  });
});
