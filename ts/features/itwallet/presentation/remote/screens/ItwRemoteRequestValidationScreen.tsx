import { Body, IOStyles } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { View } from "react-native";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent.tsx";
import I18n from "../../../../../i18n.ts";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList.ts";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { ItwRemoteRequestPayload } from "../Utils/itwRemoteTypeUtils.ts";
import { ItwRemoteMachineContext } from "../machine/provider.tsx";
import { ItwRemoteParamsList } from "../navigation/ItwRemoteParamsList.ts";
import { ItwRemoteDeepLinkFailureScreen } from "./ItwRemoteDeepLinkFailureScreen.tsx";

export type ItwRemoteRequestValidationScreenNavigationParams =
  Partial<ItwRemoteRequestPayload>;

type ScreenProps = IOStackNavigationRouteProps<
  ItwRemoteParamsList,
  "ITW_REMOTE_REQUEST_VALIDATION"
>;

const ItwRemoteRequestValidationScreen = (params: ScreenProps) => {
  useItwDisableGestureNavigation();

  const payload = params.route.params;

  if (!ItwRemoteRequestPayload.is(payload)) {
    return <ItwRemoteDeepLinkFailureScreen payload={payload} />;
  }

  // Add default value for request_uri_method if not present
  const updatedPayload = {
    ...payload,
    request_uri_method: payload.request_uri_method ?? "GET"
  };

  return <ContentView payload={updatedPayload} />;
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
      <View style={[IOStyles.alignCenter, IOStyles.horizontalContentPadding]}>
        <Body>
          {I18n.t(
            "features.itWallet.presentation.remote.loadingScreen.subtitle"
          )}
        </Body>
      </View>
    </LoadingScreenContent>
  );
};

export { ItwRemoteRequestValidationScreen };
