import { PersistedState } from "redux-persist";

import { itwIssuanceStateMigrations } from "../migrations";

const migrateToV0 = itwIssuanceStateMigrations["0"];

const persisted = (integrityKeyTag: unknown) =>
  ({
    _persist: { version: -1, rehydrated: true },
    integrityKeyTag
  }) as PersistedState;

describe("itwIssuanceStateMigrations, version 0", () => {
  it("unwraps a persisted Some into its value", () => {
    const migrated = migrateToV0(
      persisted({ _tag: "Some", value: "7408c9b7-5f23-4ca6-8960-58305cff5b7e" })
    );

    expect(migrated).toEqual(
      expect.objectContaining({
        integrityKeyTag: "7408c9b7-5f23-4ca6-8960-58305cff5b7e"
      })
    );
  });

  it("unwraps a persisted None into undefined", () => {
    const migrated = migrateToV0(persisted({ _tag: "None" }));

    expect(migrated).toEqual(
      expect.objectContaining({ integrityKeyTag: undefined })
    );
  });

  it.each([
    [
      "a plain string, already migrated",
      "7408c9b7-5f23-4ca6-8960-58305cff5b7e"
    ],
    ["a missing key tag", undefined]
  ])("leaves %s unchanged", (_name, integrityKeyTag) => {
    const migrated = migrateToV0(persisted(integrityKeyTag));

    expect(migrated).toEqual(expect.objectContaining({ integrityKeyTag }));
  });

  it("preserves the rest of the persisted state", () => {
    const migrated = migrateToV0({
      ...persisted({ _tag: "None" }),
      integrityServiceStatus: "ready"
    } as PersistedState);

    expect(migrated).toEqual(
      expect.objectContaining({ integrityServiceStatus: "ready" })
    );
  });
});
