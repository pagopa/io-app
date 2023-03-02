import { PublicKey } from "@pagopa/io-react-native-crypto";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { useEffect, useState } from "react";
import { useIOSelector } from "../../../store/hooks";
import { taskGetPublicKey } from "../../../utils/crypto";
import { lollipopKeyTagSelector } from "../store/reducers/lollipop";

type PKReady = { kind: "ready"; publicKey: PublicKey };
type PKChecking = { kind: "checking" };
type PKError = { kind: "error"; error: string };
type PKStatus = PKReady | PKChecking | PKError;

export const usePublicKeyState = () => {
  const [publicKeyState, setPublicKeyState] = useState<PKStatus>({
    kind: "checking"
  });
  const keyTag = useIOSelector(lollipopKeyTagSelector);

  const handleError = (error: string) =>
    setPublicKeyState({ kind: "error", error });

  useEffect(() => {
    pipe(
      keyTag,
      O.fold(
        () => handleError("Missing key tag"),
        tag =>
          pipe(
            tag,
            taskGetPublicKey,
            TE.map(publicKey =>
              setPublicKeyState({ kind: "ready", publicKey })
            ),
            TE.mapLeft(e => handleError(e.message))
          )()
      )
    );
  }, [keyTag]);
  return publicKeyState;
};
