import {
  deleteKey,
  generate,
  getPublicKey
} from "@pagopa/io-react-native-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";

export type KeyGenerationInfo = {
  keyTag: string;
  keyType?: string;
  errorCode?: string;
  userInfo?: Record<string, string>;
};

export const setKeyGenerationInfo = async (
  keyTag: string,
  value: KeyGenerationInfo
) =>
  pipe(
    TE.tryCatch(
      () => AsyncStorage.setItem(keyTag, JSON.stringify(value)),
      () => false
    ),
    TE.map(_ => true),
    TE.getOrElse(() => T.of(false))
  )();

export const getKeyGenerationInfo = async (
  keyTag: string
): Promise<KeyGenerationInfo | null> =>
  pipe(
    TE.tryCatch(
      () => AsyncStorage.getItem(keyTag),
      () => null
    ),
    TE.map(value => {
      if (value) {
        return JSON.parse(value);
      } else {
        return null;
      }
    }),
    TE.getOrElse(() => T.of(null))
  )();

export const checkPublicKeyExists = (keyId: string) =>
  pipe(
    TE.tryCatch(
      () => getPublicKey(keyId),
      () => false
    ),
    TE.map(_ => true),
    TE.getOrElse(() => T.of(false))
  )();

export const taskRegenerateKey = (keyId: string) =>
  pipe(
    TE.tryCatch(
      () => deleteKey(keyId).then(() => generate(keyId)),
      () => undefined
    ),
    TE.getOrElseW(() => T.of(undefined))
  )();

export const taskGetPublicKey = (keyId: string) =>
  pipe(
    TE.tryCatch(
      () => getPublicKey(keyId),
      () => undefined
    ),
    TE.getOrElseW(() => T.of(undefined))
  )();

export const taskGeneratePublicKey = (keyId: string) =>
  pipe(
    TE.tryCatch(
      () => generate(keyId),
      () => undefined
    ),
    TE.getOrElseW(() => T.of(undefined))
  )();

export const deleteKeyPair = (keyId: string) =>
  pipe(
    TE.tryCatch(
      () => deleteKey(keyId),
      () => false
    ),
    TE.map(_ => true),
    TE.getOrElse(() => T.of(false))
  )();
