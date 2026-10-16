import { testSaga } from "redux-saga-test-plan";
import { Action } from "typesafe-actions";

import { itwCredentialsStore } from "../../../credentials/store/actions";
import { itwLifecycleStoresReset } from "../../../lifecycle/store/actions";
import { CredentialType } from "../../utils/itwMocksUtils";
import { CredentialMetadata } from "../../utils/itwTypesUtils";
import { waitForItWalletActivation } from "../utils";

type TakeEffect = {
  payload: {
    pattern: (action: Action) => boolean;
  };
  type: string;
};

describe("waitForItWalletActivation", () => {
  it("waits for a credential store action containing an active PID", () => {
    const pidAction = itwCredentialsStore([
      {
        credentialType: CredentialType.PID,
        spec_version: "1.3.3"
      } as CredentialMetadata
    ]);
    const nonPidAction = itwCredentialsStore([
      {
        credentialType: CredentialType.DRIVING_LICENSE,
        spec_version: "1.3.3"
      } as CredentialMetadata
    ]);
    const outdatedPidAction = itwCredentialsStore([
      {
        credentialType: CredentialType.PID,
        spec_version: "1.2.0"
      } as CredentialMetadata
    ]);
    const newerPidAction = itwCredentialsStore([
      {
        credentialType: CredentialType.PID,
        spec_version: "1.4.0"
      } as CredentialMetadata
    ]);
    const invalidVersionPidAction = itwCredentialsStore([
      {
        credentialType: CredentialType.PID,
        spec_version: "invalid"
      } as CredentialMetadata
    ]);

    testSaga(waitForItWalletActivation)
      .next()
      .inspect(effect => {
        const takeEffect = effect as TakeEffect;
        expect(takeEffect.payload.pattern(pidAction)).toBe(true);
        expect(takeEffect.payload.pattern(nonPidAction)).toBe(false);
        expect(takeEffect.payload.pattern(outdatedPidAction)).toBe(false);
        expect(takeEffect.payload.pattern(newerPidAction)).toBe(true);
        expect(takeEffect.payload.pattern(invalidVersionPidAction)).toBe(false);
        expect(takeEffect.payload.pattern(itwLifecycleStoresReset())).toBe(
          false
        );
      })
      .next(pidAction)
      .isDone();
  });
});
