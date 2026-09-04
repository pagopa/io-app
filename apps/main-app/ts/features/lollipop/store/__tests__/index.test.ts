import {
  migrationKeyTagFunctional,
  migrationKeyTagToStringUndefined,
  PersistedLollipopStateV0V1
} from "..";
import { none, some } from "../../types/SerializedOption";

describe("Test migration KeyTag", () => {
  describe("Test migrationKeyTagFunctional", () => {
    it("should return a keyTag as Some(string) when keyTagOption is Some(string)", () => {
      const persistedState = {
        keyTag: some("tag")
      } as PersistedLollipopStateV0V1;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(
        some("tag")
      );
    });

    it("should return a keyTag equal to None when keyTagOption is not Some", () => {
      const persistedState = {
        keyTag: some(some("tag"))
      } as unknown as PersistedLollipopStateV0V1;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(
        some("tag")
      );
    });

    it("should return keyTag as None when keyTag value is Some(None)", () => {
      const persistedState = {
        keyTag: some(none)
      } as unknown as PersistedLollipopStateV0V1;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(none);
    });

    it("should return the original state when keyTagOption is None", () => {
      const persistedState = {
        keyTag: none
      } as PersistedLollipopStateV0V1;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(none);
    });
  });

  describe("Test migrationKeyTagToStringUndefined", () => {
    it("should return a keyTag as string when keyTagOption is Some(string)", () => {
      const persistedState = {
        keyTag: some("tag")
      } as PersistedLollipopStateV0V1;

      expect(migrationKeyTagToStringUndefined(persistedState).keyTag).toEqual(
        "tag"
      );
    });

    it("should return a keyTag as undefined when keyTagOption is None", () => {
      const persistedState = {
        keyTag: none
      } as PersistedLollipopStateV0V1;

      expect(migrationKeyTagToStringUndefined(persistedState).keyTag).toEqual(
        undefined
      );
    });
  });
});
