import { itwStatusListReferencedUrisSelector } from "..";
import { GlobalState } from "../../../../../../store/reducers/types";
import { selectItwSpecsVersion } from "../../../../common/store/selectors/environment";
import { getIoWallet } from "../../../../common/utils/itwIoWallet";

jest.mock("../../../../common/utils/itwIoWallet", () => ({
  getIoWallet: jest.fn()
}));

jest.mock("../../../../common/store/selectors/environment", () => ({
  selectItwSpecsVersion: jest.fn()
}));

const mockGetIoWallet = jest.mocked(getIoWallet);
const mockSelectItwSpecsVersion = jest.mocked(selectItwSpecsVersion);

describe("itwStatusListReferencedUrisSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSelectItwSpecsVersion.mockReturnValue("1.4.6");
    mockGetIoWallet.mockReturnValue({
      KeyAttestation: {
        isSupported: true,
        decode: jest.fn().mockReturnValue({
          status: {
            status_list: { uri: "https://wallet.example/status-list/1" }
          }
        })
      }
    } as never);
  });

  it("returns references from credentials and KAs", () => {
    const state = {
      features: {
        itWallet: {
          credentials: {
            credentials: {
              credential1: {
                validity: {
                  type: "status_list",
                  statusList: { uri: "https://issuer.example/status-list/1" }
                }
              }
            }
          },
          walletInstance: {
            keyAttestations: { ka1: "ka-jwt" }
          }
        }
      }
    } as unknown as GlobalState;

    expect(itwStatusListReferencedUrisSelector(state)).toEqual([
      "https://issuer.example/status-list/1",
      "https://wallet.example/status-list/1"
    ]);
  });

  it("ignores malformed KAs", () => {
    mockGetIoWallet.mockReturnValue({
      KeyAttestation: {
        isSupported: true,
        decode: jest.fn().mockImplementation(() => {
          throw new Error("invalid KA");
        })
      }
    } as never);

    const state = {
      features: {
        itWallet: {
          credentials: { credentials: {} },
          walletInstance: {
            keyAttestations: { ka1: "invalid-ka" }
          }
        }
      }
    } as unknown as GlobalState;

    expect(itwStatusListReferencedUrisSelector(state)).toEqual([]);
  });
});
