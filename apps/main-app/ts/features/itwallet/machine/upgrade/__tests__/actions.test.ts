import { ActionArgs } from "xstate";

import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { itwCredentialsReplaceByType } from "../../../credentials/store/actions";
import {
  testCredentialUpgradeDeps,
  testMachineStore
} from "../../utils/testDeps";
import { storeCredentialAction } from "../actions";
import { Context } from "../context";
import { CredentialUpgradeEvents } from "../events";

describe("itwCredentialUpgradeMachine actions", () => {
  describe("storeCredentialAction", () => {
    it("should store the new credential removing the old one", () => {
      const mockDispatch = jest.fn();

      storeCredentialAction({
        context: {
          deps: testCredentialUpgradeDeps({
            store: testMachineStore({ dispatch: mockDispatch })
          })
        } as Context,
        event: {
          type: "xstate.done.actor.upgradeCredential",
          actorId: "upgradeCredential",
          output: {
            credentialType: "MDL",
            credentials: [
              {
                credential: "raw-jwt",
                metadata: ItwStoredCredentialsMocks.L3.mdl
              }
            ]
          }
        }
      } as unknown as ActionArgs<
        Context,
        CredentialUpgradeEvents,
        CredentialUpgradeEvents
      >);

      expect(mockDispatch).toHaveBeenCalledWith(
        itwCredentialsReplaceByType(
          [
            {
              credential: "raw-jwt",
              metadata: ItwStoredCredentialsMocks.L3.mdl
            }
          ],
          {}
        )
      );
    });
  });
});
