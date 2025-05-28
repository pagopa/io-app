import { userFromSuccessLoginSelector } from "../selectors";

describe("userFromSuccessLoginSelector", () => {
  it("should return userFromSuccessLogin from the state", () => {
    const mockUser = {
      fiscalCode: "ABCDEF12G34H567I",
      name: "Mario",
      familyName: "Rossi"
    };

    const mockState = {
      features: {
        loginFeatures: {
          loginInfo: {
            userFromSuccessLogin: mockUser
          }
        }
      }
    } as any; // oppure: as GlobalState se hai il tipo disponibile

    const result = userFromSuccessLoginSelector(mockState);
    expect(result).toEqual(mockUser);
  });

  it("should return undefined if userFromSuccessLogin is not set", () => {
    const mockState = {
      features: {
        loginFeatures: {
          loginInfo: {
            userFromSuccessLogin: undefined
          }
        }
      }
    } as any;

    const result = userFromSuccessLoginSelector(mockState);
    expect(result).toBeUndefined();
  });
});
