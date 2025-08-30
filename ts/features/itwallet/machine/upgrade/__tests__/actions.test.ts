import { default as configureMockStore } from "redux-mock-store";
import { ActionArgs } from "xstate";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { createCredentialUpgradeActionsImplementation } from "../actions";
import { Context } from "../context";
import { CredentialUpgradeEvents } from "../events";
import { useIOStore } from "../../../../../store/hooks";
import {
  itwCredentialsRemoveByType,
  itwCredentialsStore
} from "../../../credentials/store/actions";

describe("itwCredentialUpgradeMachine actions", () => {
  describe("storeCredential", () => {
    it("should store the new credential removing the old one", () => {
      const mockDispatch = jest.fn();
      const mockStore = {
        ...createMockStore(),
        dispatch: mockDispatch
      } as ReturnType<typeof useIOStore>;

      const { storeCredential } =
        createCredentialUpgradeActionsImplementation(mockStore);

      storeCredential({
        event: {
          type: "xstate.done.actor.itwCredentialUpgradeMachine.0.upgradeCredential",
          actorId: "upgradeCredential",
          output: {
            credentialType: "MDL",
            credentials: [ItwStoredCredentialsMocks.L3.mdl]
          }
        }
      } as unknown as ActionArgs<Context, CredentialUpgradeEvents, CredentialUpgradeEvents>);

      expect(mockDispatch).toHaveBeenCalledWith(
        itwCredentialsRemoveByType("MDL")
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        itwCredentialsStore([ItwStoredCredentialsMocks.L3.mdl])
      );
    });
  });
});

const createMockStore = () => {
  const defaultState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  return mockStore(defaultState);
};
