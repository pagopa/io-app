import * as React from "react";
import { PublicKey, getPublicKey } from "@pagopa/io-react-native-crypto";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { useEffect, useState } from "react";
import { useIOSelector } from "../../../store/hooks";
import { lollipopKeyTagSelector } from "../store/reducers/lollipop";
import { toCryptoError } from "../utils/crypto";

type PKReady = { kind: "ready"; publicKey: PublicKey };
type PKChecking = { kind: "checking" };
type PKError = { kind: "error"; error: string };
type PKStatus = PKReady | PKChecking | PKError;

export interface PublicKeyStatusInjectedProps {
  keychainPublicKey: PKStatus;
}

// This is the HOC that will be used in Profile Main Screen.
// If you don't have any other specific needs, you have to retrive the public key
// from the Redux store using the provided selectors.
export const withKeychainPublicKey =
  <P,>(WrappedComponent: React.ComponentType<P>) =>
  (props: P) => {
    const keychainPublicKey = usePublicKeyState();

    return (
      <WrappedComponent keychainPublicKey={keychainPublicKey} {...props} />
    );
  };

// If you don't have any other specific needs, you have to retrive the public key
// from the Redux store using the provided selectors.
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
            TE.tryCatchK(getPublicKey, toCryptoError),
            TE.map(publicKey =>
              setPublicKeyState({ kind: "ready", publicKey })
            ),
            TE.mapLeft(error =>
              handleError(`Error while getting public key: ${error.message}`)
            )
          )()
      )
    );
  }, [keyTag]);
  return publicKeyState;
};
