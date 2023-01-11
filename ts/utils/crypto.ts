import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { getPublicKey } from "io-react-native-crypto";

export const checkPublicKeyExists = (keyId: string) =>
  pipe(
    TE.tryCatch(
      () => getPublicKey(keyId),
      () => false
    ),
    TE.map(_ => true),
    TE.getOrElse(() => T.of(false))
  )();
