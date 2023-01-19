import AsyncStorage from "@react-native-async-storage/async-storage";
import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { getPublicKey } from "@pagopa/io-react-native-crypto";

export const setKeyAlreadyGenerated = async (keyTag: string, value: string) =>
  pipe(
    TE.tryCatch(
      () => AsyncStorage.setItem(keyTag, value),
      () => false
    ),
    TE.map(_ => true),
    TE.getOrElse(() => T.of(false))
  )();

export const isKeyAlreadyGenerated = async (keyTag: string) =>
  pipe(
    TE.tryCatch(
      () => AsyncStorage.getItem(keyTag),
      () => false
    ),
    TE.map(value => value !== null),
    TE.getOrElse(() => T.of(false))
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
