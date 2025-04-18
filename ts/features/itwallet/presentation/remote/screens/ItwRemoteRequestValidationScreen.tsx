import { Body, ContentWrapper } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent.tsx";
import I18n from "../../../../../i18n.ts";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList.ts";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { ItwRemoteRequestPayload } from "../Utils/itwRemoteTypeUtils.ts";
import { ItwRemoteMachineContext } from "../machine/provider.tsx";
import { ItwRemoteParamsList } from "../navigation/ItwRemoteParamsList.ts";
import { ItwRemoteDeepLinkFailure } from "../components/ItwRemoteDeepLinkFailure.tsx";

export type ItwRemoteRequestValidationScreenNavigationParams =
  Partial<ItwRemoteRequestPayload>;

type ScreenProps = IOStackNavigationRouteProps<
  ItwRemoteParamsList,
  "ITW_REMOTE_REQUEST_VALIDATION"
>;

const ItwRemoteRequestValidationScreen = (params: ScreenProps) => {
  useItwDisableGestureNavigation();

  // Add default value for request_uri_method if not present
  const payload = {
    ...params.route.params,
    request_uri_method: params.route.params.request_uri_method ?? "GET"
  };

  if (!ItwRemoteRequestPayload.is(payload)) {
    return <ItwRemoteDeepLinkFailure payload={payload} />;
  }

  return <ContentView payload={payload} />;
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
