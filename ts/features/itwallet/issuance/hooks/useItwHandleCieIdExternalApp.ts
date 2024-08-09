import { useEffect, useRef, useState } from "react";
import { AppStateStatus, Linking } from "react-native";
import { useIOSelector } from "../../../../store/hooks";
import { appStateSelector } from "../../../../store/reducers/appState";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { selectIdentification } from "../../machine/eid/selectors";

// TODO: abort the CieID flow automatically with this hook or use ItwIssuanceLoadingScreen?
export function useItwHandleCieIdExternalApp() {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const identificationCtx =
    ItwEidIssuanceMachineContext.useSelector(selectIdentification);

  const isCieIdIdentification = identificationCtx?.mode === "cieId";

  const { appState } = useIOSelector(appStateSelector);
  const [callbackUrl, setCallbackUrl] = useState<string>();
  const prevAppState = useRef<AppStateStatus>();

  useEffect(() => {
    if (!isCieIdIdentification) {
      return;
    }

    const subscription = Linking.addEventListener("url", ({ url }) => {
      setCallbackUrl(url);
    });
    return () => {
      subscription.remove();
    };
  }, [isCieIdIdentification]);

  useEffect(() => {
    // We are back from an external app without a callback URL
    if (
      isCieIdIdentification &&
      prevAppState.current === "background" &&
      appState === "active" &&
      !callbackUrl
    ) {
      machineRef.send({ type: "abort" });
    }
    // eslint-disable-next-line functional/immutable-data
    prevAppState.current = appState;
  }, [machineRef, appState, callbackUrl, isCieIdIdentification]);

  return null;
}
