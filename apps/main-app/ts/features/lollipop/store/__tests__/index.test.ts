import * as O from "fp-ts/lib/Option";

import {
  migrationKeyTagFunctional,
  migrationKeyTagToStringUndefined,
  PersistedLollipopStateV0V1
} from "..";

describe("Test migration KeyTag", () => {
  describe("Test migrationKeyTagFunctional", () => {
    it("should return a keyTag as O.some(string) when keyTagOption is O.some(string)", () => {
      const persistedState = {
        keyTag: O.some("tag")
      } as PersistedLollipopStateV0V1;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(
        O.some("tag")
      );
    });

    it("should return a keyTag equal to O.none when keyTagOption is not Some", () => {
      const persistedState = {
        keyTag: O.some(O.some("tag"))
      } as PersistedLollipopStateV0V1;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(
        O.some("tag")
      );
    });

    it("should return keyTag as O.none when keyTag value is Some(None)", () => {
      const persistedState = {
        keyTag: O.some(O.none)
      } as PersistedLollipopStateV0V1;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(O.none);
    });

    it("should return the original state when keyTagOption is None", () => {
      const persistedState = {
        keyTag: O.none
      } as PersistedLollipopStateV0V1;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(O.none);
    });
  });

  describe("Test migrationKeyTagToStringUndefined", () => {
    it("should return a keyTag as string when keyTagOption is O.some(string)", () => {
      const persistedState = {
        keyTag: O.some("tag")
      } as PersistedLollipopStateV0V1;

      expect(migrationKeyTagToStringUndefined(persistedState).keyTag).toEqual(
        "tag"
      );
    });

    it("should return a keyTag as undefined when keyTagOption is O.none", () => {
      const persistedState = {
        keyTag: O.none
      } as PersistedLollipopStateV0V1;

      expect(migrationKeyTagToStringUndefined(persistedState).keyTag).toEqual(
        undefined
      );
    });
  });
});
