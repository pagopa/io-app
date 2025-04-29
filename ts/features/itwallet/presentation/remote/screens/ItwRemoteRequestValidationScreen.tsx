import { Body, ContentWrapper } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import * as E from "fp-ts/lib/Either";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent.tsx";
import I18n from "../../../../../i18n.ts";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList.ts";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { ItwRemoteRequestPayload } from "../utils/itwRemoteTypeUtils.ts";
import { validateItwPresentationQrCodeParams } from "../utils/itwRemotePresentationUtils.ts";
import { ItwRemoteMachineContext } from "../machine/provider.tsx";
import { ItwRemoteParamsList } from "../navigation/ItwRemoteParamsList.ts";
import { ItwRemoteDeepLinkFailure } from "../components/ItwRemoteDeepLinkFailure.tsx";

export type ItwRemoteRequestValidationScreenNavigationParams =
  Partial<ItwRemoteRequestPayload>;

type ScreenProps = IOStackNavigationRouteProps<
  ItwRemoteParamsList,
  "ITW_REMOTE_REQUEST_VALIDATION"
>;

const ItwRemoteRequestValidationScreen = ({ route }: ScreenProps) => {
  useItwDisableGestureNavigation();

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
    <LoadingScreenContent
      testID={"loader"}
      contentTitle={I18n.t(
        "features.itWallet.presentation.remote.loadingScreen.title"
      )}
    >
      <ContentWrapper style={{ alignItems: "center" }}>
        <Body>
          {I18n.t(
            "features.itWallet.presentation.remote.loadingScreen.subtitle"
          )}
        </Body>
      </ContentWrapper>
    </LoadingScreenContent>
  );
};

export { ItwRemoteRequestValidationScreen };
