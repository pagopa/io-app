import React, { useEffect, useRef } from "react";
import { AppStateStatus } from "react-native";
import { useSelector } from "@xstate5/react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import I18n from "../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { useIOSelector } from "../../../../store/hooks";
import { appStateSelector } from "../../../../store/reducers/appState";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { selectIdentification } from "../../machine/eid/selectors";

export const ItwIssuanceEidRequestScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const identification = useSelector(machineRef, selectIdentification);

  const { appState } = useIOSelector(appStateSelector);
  const prevAppState = useRef<AppStateStatus>();

  useAvoidHardwareBackButton();

  useEffect(() => {
    // When the user selects CieID an external browser instance is opened.
    // If the user closes it, the eID issuing process is aborted and
    // the machine should go back to the previous state.
    // For SPID, the native authentication session throws an error when closed,
    // and that error is handled within the machine definition.
    if (
      identification?.mode === "cieId" &&
      prevAppState.current === "background" &&
      appState === "active"
    ) {
      machineRef.send({ type: "back" });
    }

    // eslint-disable-next-line functional/immutable-data
    prevAppState.current = appState;
  }, [appState, machineRef, identification?.mode]);

  return (
    <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
  );
};
