import { fromIdpToLocalSpidIdp, randomOrderIdps } from "../idps";

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

describe("randomOrderIdps", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return an empty array if the input is empty", () => {
    expect(randomOrderIdps([])).toEqual([]);
  });

  it("should shuffle the array", () => {
    // With `Math.random` always returning 0, every swap picks index 0
    // as `j`: this pins down the exact (deterministic) output of the
    // Fisher-Yates algorithm, instead of just checking it's *a*
    // permutation.
    jest.spyOn(Math, "random").mockReturnValue(0);

    const input = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    const result = randomOrderIdps(input);

    expect(result).toEqual([{ id: 2 }, { id: 3 }, { id: 4 }, { id: 1 }]);
  });
});
