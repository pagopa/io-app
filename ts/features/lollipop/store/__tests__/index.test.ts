import * as O from "fp-ts/lib/Option";
import { PersistedState } from "redux-persist";
import { PersistedLollipopState, migrationKeyTagFunctional } from "..";

const migrationKeyTag = (state: PersistedState): PersistedLollipopState => {
  const persistedLS = state as PersistedLollipopState;
  const keyTagOption = persistedLS.keyTag;
  if (O.isSome(keyTagOption) && typeof keyTagOption.value !== "string") {
    const innerOption = keyTagOption.value as O.Option<string>;
    if (O.isSome(innerOption)) {
      return {
        ...state,
        keyTag: O.some(innerOption.value)
      } as PersistedLollipopState;
    } else {
      return {
        ...state,
        keyTag: O.none
      } as PersistedLollipopState;
    }
  }
  return state as PersistedLollipopState;
};

describe("Test migration KeyTag", () => {
  describe("Test migrationKeyTag()", () => {
    it("should return a keyTag as O.some(string) when keyTagOption is O.some(string)", () => {
      const persistedState = {
        keyTag: O.some("tag"),
        publicKey: O.none
      } as PersistedLollipopState;

      expect(migrationKeyTag(persistedState).keyTag).toEqual(O.some("tag"));
    });

    it("should return a keyTag O.some(string) when keyTagOption is an Option of Option and is a string", () => {
      const persistedState = {
        keyTag: O.some(O.some("tag")),
        publicKey: O.none
      } as PersistedLollipopState;

      expect(migrationKeyTag(persistedState).keyTag).toEqual(O.some("tag"));
    });

    it("should return a keyTag equal to O.none when keyTagOption is not Some", () => {
      const persistedState = {
        keyTag: O.some(O.none),
        publicKey: O.none
      } as PersistedLollipopState;

      expect(migrationKeyTag(persistedState).keyTag).toEqual(O.none);
    });

    it("should return the original state when keyTagOption is None", () => {
      const persistedState = {
        keyTag: O.none,
        publicKey: O.none
      } as PersistedLollipopState;

      expect(migrationKeyTag(persistedState).keyTag).toEqual(O.none);
    });
  });
  describe("Test migrationKeyTagFunctional", () => {
    it("should return a keyTag as O.some(string) when keyTagOption is O.some(string)", () => {
      const persistedState = {
        keyTag: O.some("tag"),
        publicKey: O.none
      } as PersistedLollipopState;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(
        O.some("tag")
      );
    });

    it("should return a keyTag equal to O.none when keyTagOption is not Some", () => {
      const persistedState = {
        keyTag: O.some(O.some("tag")),
        publicKey: O.none
      } as PersistedLollipopState;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(
        O.some("tag")
      );
    });

    it("should return a keyTag equal to O.none when keyTagOption is not Some", () => {
      const persistedState = {
        keyTag: O.some(O.none),
        publicKey: O.none
      } as PersistedLollipopState;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(O.none);
    });

    it("should return the original state when keyTagOption is None", () => {
      const persistedState = {
        keyTag: O.none,
        publicKey: O.none
      } as PersistedLollipopState;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(O.none);
    });
  });
  describe("Test migrationKeyTag* method comparison", () => {
    it("should return the same result when keyTagOption is O.some(string) for all methods", () => {
      const persistedState = {
        keyTag: O.some("tag"),
        publicKey: O.none
      } as PersistedLollipopState;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(
        migrationKeyTag(persistedState).keyTag
      );
    });

    it("should return the same result when keyTagOption is Some of Some and is a string for all methods", () => {
      const persistedState = {
        keyTag: O.some(O.some("tag")),
        publicKey: O.none
      } as PersistedLollipopState;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(
        migrationKeyTag(persistedState).keyTag
      );
    });

    it("should return the same result when keyTagOption is O.some(O.none) for all methods", () => {
      const persistedState = {
        keyTag: O.some(O.none),
        publicKey: O.none
      } as PersistedLollipopState;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(
        migrationKeyTag(persistedState).keyTag
      );
    });

    it("should return the original state when keyTagOption is None for all methods", () => {
      const persistedState = {
        keyTag: O.none,
        publicKey: O.none
      } as PersistedLollipopState;

      expect(migrationKeyTagFunctional(persistedState).keyTag).toEqual(
        migrationKeyTag(persistedState).keyTag
      );
    });
  });
});
