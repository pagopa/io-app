import { Body, IOStyles } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { View } from "react-native";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent.tsx";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent.tsx";
import I18n from "../../../../../i18n.ts";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../../navigation/params/AppParamsList.ts";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { ItwRemoteRequestPayload } from "../Utils/itwRemoteTypeUtils.ts";
import { ItwRemoteMachineContext } from "../machine/provider.tsx";
import { ItwRemoteParamsList } from "../navigation/ItwRemoteParamsList.ts";

export type ItwRemoteRequestValidationScreenNavigationParams =
  Partial<ItwRemoteRequestPayload>;

type ScreenProps = IOStackNavigationRouteProps<
  ItwRemoteParamsList,
  "ITW_REMOTE_REQUEST_VALIDATION"
>;

const ItwRemoteRequestValidationScreen = (params: ScreenProps) => {
  const navigation = useIONavigation();
  useItwDisableGestureNavigation();

  const payload = params.route.params;

  if (!ItwRemoteRequestPayload.is(payload)) {
    // TODO: handle invalid payload failure [1961]
    return (
      <OperationResultScreenContent
        title={"Contenuto non valido"}
        subtitle={"Il contenuto della richiesta non è valido"}
        testID={"failure"}
        action={{
          label: "Ho capito",
          onPress: () => navigation.goBack()
        }}
      />
    );
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
