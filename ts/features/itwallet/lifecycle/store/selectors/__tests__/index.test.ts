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
import { CredentialMetadata } from "../../../../common/utils/itwTypesUtils";
import { CredentialType } from "../../../../common/utils/itwMocksUtils";
import { reproduceSequence } from "../../../../../../utils/tests";
import { itwSetFiscalCodeWhitelisted } from "../../../../common/store/actions/preferences";

describe("IT Wallet lifecycle selectors", () => {
  it("should define the INSTALLED state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(true);
    expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsValidSelector(globalState)).toEqual(false);
  });

  it("should define the OPERATIONAL state", () => {
    const globalState = reproduceSequence({} as GlobalState, appReducer, [
      applicationChangeState("active"),
      itwStoreIntegrityKeyTag("9556271b-2e1c-414d-b9a5-50ed8c2743e3")
    ]);
    expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(true);
    expect(itwLifecycleIsValidSelector(globalState)).toEqual(false);
  });

  it("should define the VALID state", () => {
    const globalState = reproduceSequence({} as GlobalState, appReducer, [
      applicationChangeState("active"),
      itwStoreIntegrityKeyTag("9556271b-2e1c-414d-b9a5-50ed8c2743e3"),
      itwCredentialsStore([
        {
          credentialType: CredentialType.PID,
          credentialId: "dc_sd_jwt_PersonIdentificationData",
          format: "dc+sd-jwt"
        }
      ] as Array<CredentialMetadata>)
    ]);
    expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsValidSelector(globalState)).toEqual(true);
  });

  it.each`
    isWhitelisted | simplifiedActivation | expected
    ${true}       | ${false}             | ${true}
    ${true}       | ${true}              | ${false}
    ${false}      | ${false}             | ${false}
    ${false}      | ${true}              | ${false}
    ${false}      | ${false}             | ${false}
  `(
    "should define a valid IT-Wallet instance for whitelist: $isWhitelisted and simplifiedActivation: $simplifiedActivation",
    ({ isWhitelisted, simplifiedActivation, expected }) => {
      const initialState = {
        features: {
          itWallet: {
            preferences: {
              isItwSimplifiedActivationRequired: simplifiedActivation
            }
          }
        }
      } as GlobalState;

      const globalState = reproduceSequence(initialState, appReducer, [
        applicationChangeState("active"),
        itwStoreIntegrityKeyTag("9556271b-2e1c-414d-b9a5-50ed8c2743e3"),
        itwSetFiscalCodeWhitelisted(isWhitelisted),
        itwCredentialsStore([
          {
            credentialType: CredentialType.PID,
            credentialId: "dc_sd_jwt_PersonIdentificationData",
            format: "dc+sd-jwt",
            verification: {
              assurance_level: "high"
            }
          }
        ] as Array<CredentialMetadata>)
      ]);
      expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(false);
      expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(false);
      expect(itwLifecycleIsValidSelector(globalState)).toEqual(true);
      expect(itwLifecycleIsITWalletValidSelector(globalState)).toEqual(
        expected
      );
    }
  );
});
