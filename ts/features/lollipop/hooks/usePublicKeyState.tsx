import { PublicKey } from "@pagopa/io-react-native-crypto";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { useEffect, useState } from "react";
import { useIOSelector } from "../../../store/hooks";
import { taskGetPublicKey } from "../../../utils/crypto";
import { lollipopKeyTagSelector } from "../store/reducers/lollipop";

export const usePublicKeyState = () => {
  const [publicKeyState, setPublicKeyState] = useState<
    PublicKey | "error" | "retrieving"
  >("retrieving");
  const keyTag = useIOSelector(lollipopKeyTagSelector);
  const handleError = () => setPublicKeyState("error");
  useEffect(() => {
    void pipe(
      keyTag,
      O.fold(
        () => handleError,
        tag =>
          pipe(
            tag,
            taskGetPublicKey,
            TE.map(setPublicKeyState),
            TE.mapLeft(handleError)
          )
      )
    )();
  }, [keyTag]);
  return publicKeyState;
};
