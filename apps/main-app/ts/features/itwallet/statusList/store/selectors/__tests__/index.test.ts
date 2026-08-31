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
    mockSelectItwSpecsVersion.mockReturnValue("1.3.3");
    mockGetIoWallet.mockReturnValue({
      WalletUnitAttestation: {
        isSupported: true,
        decode: jest.fn().mockReturnValue({
          status: {
            status_list: { uri: "https://wallet.example/status-list/1" }
          }
        })
      }
    } as never);
  });

  it("returns references from credentials and WUAs", () => {
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
            walletUnitAttestations: { wua1: "wua-jwt" }
          }
        }
      }
    } as unknown as GlobalState;

    expect(itwStatusListReferencedUrisSelector(state)).toEqual([
      "https://issuer.example/status-list/1",
      "https://wallet.example/status-list/1"
    ]);
  });

  it("ignores malformed WUAs", () => {
    mockGetIoWallet.mockReturnValue({
      WalletUnitAttestation: {
        isSupported: true,
        decode: jest.fn().mockImplementation(() => {
          throw new Error("invalid WUA");
        })
      }
    } as never);

    const state = {
      features: {
        itWallet: {
          credentials: { credentials: {} },
          walletInstance: {
            walletUnitAttestations: { wua1: "invalid-wua" }
          }
        }
      }
    } as unknown as GlobalState;

    expect(itwStatusListReferencedUrisSelector(state)).toEqual([]);
  });
});
