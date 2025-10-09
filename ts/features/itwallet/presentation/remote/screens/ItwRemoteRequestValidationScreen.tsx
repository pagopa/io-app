import { useFocusEffect } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import I18n from "i18next";
import { useCallback, useState } from "react";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import {
  StartupStatusEnum,
  isStartupLoaded
} from "../../../../../store/reducers/startup.ts";
import { trackItwRemoteStart } from "../../../analytics/index.ts";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { ItwRemoteDeepLinkFailure } from "../components/ItwRemoteDeepLinkFailure.tsx";
import { ItwRemoteLoadingScreen } from "../components/ItwRemoteLoadingScreen.tsx";
import { ItwRemoteMachineContext } from "../machine/provider.tsx";
import { ItwRemoteParamsList } from "../navigation/ItwRemoteParamsList.ts";
import { validateItwPresentationQrCodeParams } from "../utils/itwRemotePresentationUtils.ts";
import { ItwRemoteRequestPayload } from "../utils/itwRemoteTypeUtils.ts";

export type ItwRemoteRequestValidationScreenNavigationParams =
  Partial<ItwRemoteRequestPayload>;

type ScreenProps = IOStackNavigationRouteProps<
  ItwRemoteParamsList,
  "ITW_REMOTE_REQUEST_VALIDATION"
>;

const ItwRemoteRequestValidationScreen = ({ route }: ScreenProps) => {
  useItwDisableGestureNavigation();

  const startupStatus = useIOSelector(isStartupLoaded);

  /**
   * There may be scenarios where the app is not running when the user opens the link,
   * so the app is started and the user goes through the identification or the full authentication process.
   * Here we wait for the startup status to be authenticated to avoid inconsistencies
   * between the machine and the navigation.
   */
  if (startupStatus !== StartupStatusEnum.AUTHENTICATED) {
    return (
      <ItwRemoteLoadingScreen
        title={I18n.t(
          "features.itWallet.presentation.remote.loadingScreen.request"
        )}
      />
    );
  }

  trackItwRemoteStart();

  const payload = validateItwPresentationQrCodeParams(route.params);

  if (E.isLeft(payload)) {
    return (
      <ItwRemoteDeepLinkFailure failure={payload.left} payload={route.params} />
    );
  }

  return <ContentView payload={payload.right} />;
};

const ContentView = ({ payload }: { payload: ItwRemoteRequestPayload }) => {
  const machineRef = ItwRemoteMachineContext.useActorRef();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Reset the machine in case there is a pending presentation
      machineRef.send({ type: "reset" });
      machineRef.send({ type: "start", payload });

      // Timeout to change copy after 5s
      setTimeoutReached(false);
      const timer = setTimeout(() => {
        setTimeoutReached(true);
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }, [payload, machineRef])
  );

  return (
    <ItwRemoteLoadingScreen
      {...(timeoutReached ? { testID: "timeout-loader", message: "" } : {})}
      title={I18n.t(
        timeoutReached
          ? "features.itWallet.presentation.remote.loadingScreen.timeout"
          : "features.itWallet.presentation.remote.loadingScreen.request"
      )}
    />
  );
};

export { ItwRemoteRequestValidationScreen };
