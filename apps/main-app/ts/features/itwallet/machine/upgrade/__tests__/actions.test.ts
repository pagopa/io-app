import { ActionArgs } from "xstate";

import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
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
    const upgradedMdl = {
      credential: "raw-jwt",
      metadata: ItwStoredCredentialsMocks.L3.mdl
    };

    const runStoreCredentialAction = (
      ownedCredentials: ReadonlyArray<CredentialMetadata>
    ) => {
      const mockDispatch = jest.fn();

      storeCredentialAction({
        context: {
          credentials: ownedCredentials,
          deps: testCredentialUpgradeDeps({
            store: testMachineStore({ dispatch: mockDispatch })
          })
        } as Context,
        event: {
          type: "xstate.done.actor.upgradeCredential",
          actorId: "upgradeCredential",
          output: {
            credentialType: upgradedMdl.metadata.credentialType,
            credentials: [upgradedMdl]
          }
        }
      } as unknown as ActionArgs<
        Context,
        CredentialUpgradeEvents,
        CredentialUpgradeEvents
      >);

      return mockDispatch;
    };

    test.each([
      { name: "catalogue", origin: "catalogue" as const },
      { name: "credential offer", origin: "credentialOffer" as const },
      { name: "unknown", origin: undefined }
    ])(
      "should replace the owned credential keeping its $name origin",
      ({ origin }) => {
        const mockDispatch = runStoreCredentialAction([
          { ...ItwStoredCredentialsMocks.mdl, origin }
        ]);

        expect(mockDispatch).toHaveBeenCalledWith(
          itwCredentialsReplaceByType(
            [
              {
                ...upgradedMdl,
                metadata: { ...upgradedMdl.metadata, origin }
              }
            ],
            {}
          )
        );
      }
    );

    it("should not take the origin from an owned credential of another type", () => {
      const mockDispatch = runStoreCredentialAction([
        { ...ItwStoredCredentialsMocks.ts, origin: "credentialOffer" }
      ]);

      expect(mockDispatch).toHaveBeenCalledWith(
        itwCredentialsReplaceByType(
          [
            {
              ...upgradedMdl,
              metadata: { ...upgradedMdl.metadata, origin: undefined }
            }
          ],
          {}
        )
      );
    });
  });
});
