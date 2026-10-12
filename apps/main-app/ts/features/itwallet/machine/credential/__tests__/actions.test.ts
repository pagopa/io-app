import _ from "lodash";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import {
  CredentialMetadata,
  CredentialOfferResolved
} from "../../../common/utils/itwTypesUtils";
import { itwCredentialsReplaceByType } from "../../../credentials/store/actions";
import {
  testCredentialIssuanceDeps,
  testMachineStore
} from "../../utils/testDeps";
import { storeCredentialAction } from "../actions";
import { Context, CredentialIssuanceMode, InitialContext } from "../context";

type StoreCredentialActionArgs = Parameters<typeof storeCredentialAction>[0];

const ownedMdl = ItwStoredCredentialsMocks.mdl;
const issuedMdl = {
  credential: "raw-jwt",
  metadata: ItwStoredCredentialsMocks.L3.mdl
};

const getStateWithOwnedCredential = (credential?: CredentialMetadata) =>
  _.merge(undefined, appReducer(undefined, applicationChangeState("active")), {
    features: {
      itWallet: {
        credentials: {
          credentials: credential
            ? { [credential.credentialId]: credential }
            : {}
        }
      }
    }
  });

type Scenario = {
  expectedOrigin: CredentialMetadata["origin"];
  hasCredentialOffer: boolean;
  mode: CredentialIssuanceMode;
  name: string;
  ownedOrigin?: "none" | CredentialMetadata["origin"];
};

describe("itwCredentialIssuanceMachine actions", () => {
  describe("storeCredentialAction", () => {
    test.each<Scenario>([
      {
        name: "issuance from the catalogue",
        mode: "issuance",
        hasCredentialOffer: false,
        ownedOrigin: "none",
        expectedOrigin: "catalogue"
      },
      {
        name: "issuance from a credential offer",
        mode: "issuance",
        hasCredentialOffer: true,
        ownedOrigin: "none",
        expectedOrigin: "credentialOffer"
      },
      {
        name: "issuance from the catalogue of a credential previously obtained via credential offer",
        mode: "issuance",
        hasCredentialOffer: false,
        ownedOrigin: "credentialOffer",
        expectedOrigin: "catalogue"
      },
      {
        name: "upgrade of a credential obtained via credential offer",
        mode: "upgrade",
        hasCredentialOffer: false,
        ownedOrigin: "credentialOffer",
        expectedOrigin: "credentialOffer"
      },
      {
        name: "reissuance of a credential obtained via credential offer",
        mode: "reissuance",
        hasCredentialOffer: false,
        ownedOrigin: "credentialOffer",
        expectedOrigin: "credentialOffer"
      },
      {
        name: "reissuance of a credential obtained via the catalogue",
        mode: "reissuance",
        hasCredentialOffer: false,
        ownedOrigin: "catalogue",
        expectedOrigin: "catalogue"
      },
      {
        name: "upgrade of a credential with unknown origin",
        mode: "upgrade",
        hasCredentialOffer: false,
        ownedOrigin: undefined,
        expectedOrigin: "catalogue"
      },
      {
        name: "upgrade without an owned credential",
        mode: "upgrade",
        hasCredentialOffer: false,
        ownedOrigin: "none",
        expectedOrigin: "catalogue"
      }
    ])(
      "stores $expectedOrigin origin on $name",
      ({ mode, hasCredentialOffer, ownedOrigin, expectedOrigin }) => {
        const mockDispatch = jest.fn();
        const ownedCredential =
          ownedOrigin === "none"
            ? undefined
            : { ...ownedMdl, origin: ownedOrigin };

        const context = {
          ...InitialContext,
          deps: testCredentialIssuanceDeps({
            store: testMachineStore({
              dispatch: mockDispatch,
              getState: () => getStateWithOwnedCredential(ownedCredential)
            })
          }),
          mode,
          credentialType: ownedMdl.credentialType,
          credentials: [issuedMdl],
          resolvedCredentialOffer: hasCredentialOffer
            ? ({} as CredentialOfferResolved)
            : undefined
        } as Context;

        storeCredentialAction({ context } as StoreCredentialActionArgs);

        expect(mockDispatch).toHaveBeenCalledWith(
          itwCredentialsReplaceByType(
            [
              {
                ...issuedMdl,
                metadata: { ...issuedMdl.metadata, origin: expectedOrigin }
              }
            ],
            {}
          )
        );
      }
    );
  });
});
