import * as O from "fp-ts/lib/Option";
import { PersistedState } from "redux-persist";

import {
  migrationKeyTagFunctional,
  migrationKeyTagToStringUndefined,
  PersistedLollipopStateV0
} from "..";

const migrationKeyTag = (state: PersistedState): PersistedLollipopStateV0 => {
  const persistedLS = state as PersistedLollipopStateV0;
  const keyTagOption = persistedLS.keyTag;
  if (O.isSome(keyTagOption) && typeof keyTagOption.value !== "string") {
    const innerOption = keyTagOption.value as O.Option<string>;
    if (O.isSome(innerOption)) {
      return {
        ...state,
        keyTag: O.some(innerOption.value)
      } as PersistedLollipopStateV0;
    } else {
      return {
        ...state,
        keyTag: O.none
      } as PersistedLollipopStateV0;
    }
  }
  return state as PersistedLollipopStateV0;
};

describe("Test migration KeyTag", () => {
  describe("Test migrationKeyTag()", () => {
    it("should return a keyTag as O.some(string) when keyTagOption is O.some(string)", () => {
      const persistedState = {
        keyTag: O.some("tag"),
        publicKey: O.none
      } as PersistedLollipopStateV0;

      expect(migrationKeyTag(persistedState).keyTag).toEqual(O.some("tag"));
    });

    it("should return a keyTag O.some(string) when keyTagOption is an Option of Option and is a string", () => {
      const persistedState = {
        keyTag: O.some(O.some("tag")),
        publicKey: O.none
      } as PersistedLollipopStateV0;

      expect(migrationKeyTag(persistedState).keyTag).toEqual(O.some("tag"));
    });

    it("should return a keyTag equal to O.none when keyTagOption is not Some", () => {
      const persistedState = {
        keyTag: O.some(O.none),
        publicKey: O.none
      } as PersistedLollipopStateV0;

      expect(migrationKeyTag(persistedState).keyTag).toEqual(O.none);
    });

    it("should return the original state when keyTagOption is None", () => {
      const persistedState = {
        keyTag: O.none,
        publicKey: O.none
      } as PersistedLollipopStateV0;

      expect(migrationKeyTag(persistedState).keyTag).toEqual(O.none);
    });
  });
  describe("Test migrationKeyTagFunctional", () => {
    it("should return a keyTag as O.some(string) when keyTagOption is O.some(string)", () => {
      const persistedState = {
        keyTag: O.some("tag"),
        publicKey: O.none
      } as PersistedLollipopStateV0;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(
        O.some("tag")
      );
    });

    it("should return a keyTag equal to O.none when keyTagOption is not Some", () => {
      const persistedState = {
        keyTag: O.some(O.some("tag")),
        publicKey: O.none
      } as PersistedLollipopStateV0;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(
        O.some("tag")
      );
    });

    it("should return keyTag as O.none when keyTag value is Some(None)", () => {
      const persistedState = {
        keyTag: O.some(O.none),
        publicKey: O.none
      } as PersistedLollipopStateV0;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(O.none);
    });

    it("should return the original state when keyTagOption is None", () => {
      const persistedState = {
        keyTag: O.none,
        publicKey: O.none
      } as PersistedLollipopStateV0;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(O.none);
    });
  });
  describe("Test migrationKeyTagToStringUndefined", () => {
    it("should return a keyTag as string when keyTagOption is O.some(string)", () => {
      const persistedState = {
        keyTag: O.some("tag"),
        publicKey: O.none
      } as PersistedLollipopStateV0;

      expect(migrationKeyTagToStringUndefined(persistedState).keyTag).toEqual(
        "tag"
      );
    });

    it("should return a keyTag as undefined when keyTagOption is O.none", () => {
      const persistedState = {
        keyTag: O.none,
        publicKey: O.none
      } as PersistedLollipopStateV0;

      expect(migrationKeyTagToStringUndefined(persistedState).keyTag).toEqual(
        undefined
      );
    });
  });

  describe("Test migrationKeyTag* method comparison", () => {
    it("should return the same result when keyTagOption is O.some(string) for all methods", () => {
      const persistedState = {
        keyTag: O.some("tag"),
        publicKey: O.none
      } as PersistedLollipopStateV0;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(
        migrationKeyTag(persistedState).keyTag
      );
    });

    it("should return the same result when keyTagOption is Some of Some and is a string for all methods", () => {
      const persistedState = {
        keyTag: O.some(O.some("tag")),
        publicKey: O.none
      } as PersistedLollipopStateV0;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(
        migrationKeyTag(persistedState).keyTag
      );
    });

    it("should return the same result when keyTagOption is O.some(O.none) for all methods", () => {
      const persistedState = {
        keyTag: O.some(O.none),
        publicKey: O.none
      } as PersistedLollipopStateV0;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(
        migrationKeyTag(persistedState).keyTag
      );
    });

    it("should return the original state when keyTagOption is None for all methods", () => {
      const persistedState = {
        keyTag: O.none,
        publicKey: O.none
      } as PersistedLollipopStateV0;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(
        migrationKeyTag(persistedState).keyTag
      );
    });
  });
});
