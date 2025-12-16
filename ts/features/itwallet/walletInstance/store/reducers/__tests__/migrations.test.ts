import { createMigrate } from "redux-persist";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { migrations } from "..";

describe("ITW Wallet Instance reducer migrations", () => {
  const migrate = createMigrate(migrations);

  it.each([
    [
      { id: "54285dcc-1614-4f00-9a01-8d75e00895c3", is_revoked: false },
      pot.some({
        id: "54285dcc-1614-4f00-9a01-8d75e00895c3",
        is_revoked: false
      })
    ],
    [undefined, pot.none]
  ])(
    "should migrate the store to 0 with status %s",
    async (status, expectedStatus) => {
      const previousState = {
        attestation: "wallet-attestation",
        status,
        _persist: { version: -1, rehydrated: false }
      };
      const newState = await migrate(previousState, 0);
      expect(newState).toEqual({
        attestation: "wallet-attestation",
        status: expectedStatus,
        _persist: { version: -1, rehydrated: false }
      });
    }
  );

  it("should migrate the store from 0 to 1", async () => {
    const previousState = {
      attestation: "wallet-attestation",
      status: pot.some({
        id: "54285dcc-1614-4f00-9a01-8d75e00895c3",
        is_revoked: false
      }),
      _persist: { version: 0, rehydrated: false }
    };
    const newState = await migrate(previousState, 1);
    expect(newState).toEqual({
      attestation: {
        jwt: "wallet-attestation"
      },
      status: pot.some({
        id: "54285dcc-1614-4f00-9a01-8d75e00895c3",
        is_revoked: false
      }),
      _persist: { version: 0, rehydrated: false }
    });
  });
});
