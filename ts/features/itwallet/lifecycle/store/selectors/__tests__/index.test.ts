import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { itwStoreIntegrityKeyTag } from "../../../../issuance/store/actions";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsInstalledSelector,
  itwLifecycleIsOperationalSelector,
  itwLifecycleIsValidSelector
} from "..";
import { GlobalState } from "../../../../../../store/reducers/types";
import { itwCredentialsStore } from "../../../../credentials/store/actions";
import { StoredCredential } from "../../../../common/utils/itwTypesUtils";
import { CredentialType } from "../../../../common/utils/itwMocksUtils";
import { reproduceSequence } from "../../../../../../utils/tests";

describe("IT Wallet lifecycle selectors", () => {
  it("Correctly defines the INSTALLED state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(true);
    expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsValidSelector(globalState)).toEqual(false);
  });

  it("Correctly defines the OPERATIONAL state", () => {
    const globalState = reproduceSequence({} as GlobalState, appReducer, [
      applicationChangeState("active"),
      itwStoreIntegrityKeyTag("9556271b-2e1c-414d-b9a5-50ed8c2743e3")
    ]);
    expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(true);
    expect(itwLifecycleIsValidSelector(globalState)).toEqual(false);
  });

  it("Correctly defines the VALID state", () => {
    const globalState = reproduceSequence({} as GlobalState, appReducer, [
      applicationChangeState("active"),
      itwStoreIntegrityKeyTag("9556271b-2e1c-414d-b9a5-50ed8c2743e3"),
      itwCredentialsStore([
        {
          credentialType: CredentialType.PID,
          credentialId: "dc_sd_jwt_PersonIdentificationData",
          format: "dc+sd-jwt"
        }
      ] as Array<StoredCredential>)
    ]);
    expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsValidSelector(globalState)).toEqual(true);
  });

  it.each([
    [
      "eyJhbGciOiJFUzI1NiIsInR5cCI6ImRjK3NkLWp3dCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik1hcmlvIFJvc3NpIiwiaWF0IjoxNTE2MjM5MDIyfQ.uKkt3jqXmbu_QZ5Dkb1uF2Q9b38YhKX3GnyP8BVVH0g-darsMz9h1N3i-RWmwmt4ABlchqIqz1b6M_ssmbBP1Q",
      true
    ], // IT-Wallet
    [
      "eyJhbGciOiJFUzI1NiIsInR5cCI6InZjK3NkLWp3dCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik1hcmlvIFJvc3NpIiwiaWF0IjoxNTE2MjM5MDIyfQ.LAx3X4EpfB8aJj7n8vAk5zX-bYjjmx7Do02NX0p2feO2-TtRTL1DrPZmfBfPCKgyGlteMAv-EZow8bEaOtjcYw",
      false
    ] // Documenti su IO
  ])(
    "Correctly checks if is a valid IT-Wallet instance with %s",
    (credential, isITWallet) => {
      const globalState = reproduceSequence({} as GlobalState, appReducer, [
        applicationChangeState("active"),
        itwStoreIntegrityKeyTag("9556271b-2e1c-414d-b9a5-50ed8c2743e3"),
        itwCredentialsStore([
          {
            credentialType: CredentialType.PID,
            credential,
            credentialId: "dc_sd_jwt_PersonIdentificationData",
            format: "dc+sd-jwt"
          }
        ] as Array<StoredCredential>)
      ]);
      expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(false);
      expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(false);
      expect(itwLifecycleIsValidSelector(globalState)).toEqual(true);
      expect(itwLifecycleIsITWalletValidSelector(globalState)).toEqual(
        isITWallet
      );
    }
  );
});
