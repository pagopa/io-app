import { createMigrate } from "redux-persist";
import { applicationChangeState } from "../../../../../../store/actions/application";
import itWalletReducer, { migrations } from "../index";

describe("itWalletReducer", () => {
  it("should match snapshot [if this test fails, remember to add a migration to the store before updating the snapshot]", () => {
    const itWalletState = itWalletReducer(
      undefined,
      applicationChangeState("active")
    );
    expect(itWalletState).toMatchSnapshot();
  });
});

describe("itWalletReducer migrations", () => {
  const migrate = createMigrate(migrations);

  it("should migrate the store to version 0", async () => {
    const previousState = {
      _persist: { version: -1, rehydrated: false }
    };
    const newState = await migrate(previousState, 0);
    expect(newState).toEqual({
      _persist: { version: -1, rehydrated: false },
      preferences: {}
    });
  });

  it("should migrate the store to version 1", async () => {
    const previousState = {
      _persist: { version: 0, rehydrated: false },
      preferences: {}
    };

    const newState = await migrate(previousState, 1);
    expect(newState).toEqual({
      _persist: { version: 0, rehydrated: false },
      preferences: { requestedCredentials: {} }
    });
  });

  it.each([
    ["ITW_LIFECYCLE_INSTALLED", undefined],
    ["ITW_LIFECYCLE_VALID", "L2"]
  ])(
    "should migrate the store to version 2 with %s",
    async (lifecycle, authLevel) => {
      const previousState = {
        _persist: { version: 1, rehydrated: false },
        preferences: { requestedCredentials: {} },
        lifecycle
      };

      const newState = await migrate(previousState, 2);
      expect(newState).toEqual({
        _persist: { version: 1, rehydrated: false },
        preferences: { requestedCredentials: {}, authLevel },
        lifecycle
      });
    }
  );

  it("should migrate the store to version 3", async () => {
    const previousState = {
      _persist: { version: 2, rehydrated: false },
      preferences: { requestedCredentials: {}, authLevel: "L2" },
      lifecycle: "ITW_LIFECYCLE_VALID"
    };

    const newState = await migrate(previousState, 3);
    expect(newState).toEqual({
      _persist: { version: 2, rehydrated: false },
      preferences: { requestedCredentials: {}, authLevel: "L2" }
    });
  });

  it("should migrate the store to version 4", async () => {
    const previousState = {
      _persist: { version: 3, rehydrated: false },
      preferences: { requestedCredentials: {}, authLevel: "L2" }
    };

    const newState = await migrate(previousState, 4);
    expect(newState).toEqual({
      _persist: { version: 3, rehydrated: false },
      preferences: { requestedCredentials: {}, authLevel: "L2" },
      environment: { env: "prod" }
    });
  });

  it("should migrate the store to version 5 and rename MDL to mDL", async () => {
    const previousState = {
      _persist: { version: 4, rehydrated: false },
      preferences: { requestedCredentials: { MDL: "2025-10-01T00:00:00Z" } },
    };
  
    const newState = await migrate(previousState, 5);
  
    expect(newState).toEqual({
      _persist: { version: 4, rehydrated: false },
      preferences: { requestedCredentials: { mDL: "2025-10-01T00:00:00Z" } },
    });
  });

  it("should migrate the store to version 6 and remove offlineBannerHidden", async () => {
    const previousState = {
      _persist: { version: 5, rehydrated: false },
      preferences: { offlineBannerHidden: true, requestedCredentials: {} },
    };
  
    const newState = await migrate(previousState, 6);
  
    expect(newState).toEqual({
      _persist: { version: 5, rehydrated: false },
      preferences: { requestedCredentials: {} },
    });
  });
});
