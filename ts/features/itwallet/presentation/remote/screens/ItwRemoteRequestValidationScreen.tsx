import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import * as E from "fp-ts/lib/Either";
import I18n from "../../../../../i18n.ts";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList.ts";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { ItwRemoteRequestPayload } from "../utils/itwRemoteTypeUtils.ts";
import { validateItwPresentationQrCodeParams } from "../utils/itwRemotePresentationUtils.ts";
import { ItwRemoteMachineContext } from "../machine/provider.tsx";
import { ItwRemoteParamsList } from "../navigation/ItwRemoteParamsList.ts";
import { ItwRemoteDeepLinkFailure } from "../components/ItwRemoteDeepLinkFailure.tsx";
import { ItwRemoteLoadingScreen } from "../components/ItwRemoteLoadingScreen.tsx";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { progressSelector } from "../../../../identification/store/selectors/index.ts";

export type ItwRemoteRequestValidationScreenNavigationParams =
  Partial<ItwRemoteRequestPayload>;

type ScreenProps = IOStackNavigationRouteProps<
  ItwRemoteParamsList,
  "ITW_REMOTE_REQUEST_VALIDATION"
>;

const ItwRemoteRequestValidationScreen = ({ route }: ScreenProps) => {
  useItwDisableGestureNavigation();

  const identificationProgress = useIOSelector(progressSelector);

  /**
   * In case of same-device flow the app might not be running when the user opens the link,
   * so the app is started and the user needs to complete the identification process.
   * Here we wait for the identification to finish to avoid inconsistencies
   * between the machine and the navigation.
   * This also applies when the token expires and the user needs to identify again.
   */
  if (identificationProgress.kind !== "identified") {
    return (
      <ItwRemoteLoadingScreen
        title={I18n.t(
          "features.itWallet.presentation.remote.loadingScreen.request"
        )}
      />
    );
  }

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

  useFocusEffect(
    useCallback(() => {
      machineRef.send({
        type: "start",
        payload
      });
    }, [payload, machineRef])
  );

  return (
    <ItwRemoteLoadingScreen
      title={I18n.t(
        "features.itWallet.presentation.remote.loadingScreen.request"
      )}
    />
  );
};

export { ItwRemoteRequestValidationScreen };
