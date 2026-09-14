import * as pot from "@pagopa/ts-commons/lib/pot";
import { createMigrate } from "redux-persist";

import { migrations } from "..";

describe("ITW Wallet Instance reducer migrations", () => {
  const migrate = createMigrate(migrations);
  const status = {
    id: "54285dcc-1614-4f00-9a01-8d75e00895c3",
    is_revoked: false
  };
  const migratedStatus = pot.some(status);

  it.each([
    {
      from: -1,
      to: 0,
      state: {
        attestation: "wallet-attestation",
        status
      },
      expectedState: {
        attestation: "wallet-attestation",
        status: migratedStatus
      }
    },
    {
      from: -1,
      to: 0,
      state: {
        attestation: "wallet-attestation",
        status: undefined
      },
      expectedState: {
        attestation: "wallet-attestation",
        status: pot.none
      }
    },
    {
      from: 0,
      to: 1,
      state: {
        attestation: "wallet-attestation",
        status: migratedStatus
      },
      expectedState: {
        attestation: { jwt: "wallet-attestation" },
        status: migratedStatus
      }
    },
    {
      from: 1,
      to: 2,
      state: {
        attestation: { jwt: "wallet-attestation" },
        status: migratedStatus
      },
      expectedState: {
        attestation: { jwt: "wallet-attestation" },
        renewalError: false,
        status: migratedStatus
      }
    },
    {
      from: 2,
      to: 3,
      state: {
        attestation: { jwt: "wallet-attestation" },
        renewalError: true,
        status: migratedStatus
      },
      expectedState: {
        attestation: { jwt: "wallet-attestation" },
        renewalError: true,
        status: migratedStatus,
        walletUnitAttestations: {}
      }
    },
    {
      from: 3,
      to: 4,
      state: {
        attestation: { jwt: "wallet-attestation" },
        renewalError: true,
        status: migratedStatus,
        walletUnitAttestations: { wua: "wallet-unit-attestation" }
      },
      expectedState: {
        attestation: { jwt: "wallet-attestation" },
        isRemotelyActive: undefined,
        renewalError: true,
        status: migratedStatus,
        walletUnitAttestations: { wua: "wallet-unit-attestation" }
      }
    }
  ])(
    "should migrate the store from version $from to version $to",
    async ({ from, to, state, expectedState }) => {
      const persist = { version: from, rehydrated: false };
      const previousState = {
        ...state,
        _persist: persist
      };

      const newState = await migrate(previousState, to);

      expect(newState).toEqual({
        ...expectedState,
        _persist: persist
      });
    }
  );
});
