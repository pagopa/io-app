import { SafeAreaView } from "react-native-safe-area-context";
import { VSpacer } from "@pagopa/io-app-design-system";
import { Alert, Image } from "react-native";
import i18n from "i18next";
import { useEffect } from "react";
import cieCanEducationalSource from "../../../../../img/features/pn/cieCanEducational.png";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useSendAarFlowManager } from "../hooks/useSendAarFlowManager";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  aarAdresseeDenominationSelector,
  currentAARFlowData
} from "../store/selectors";
import { setAarFlowState } from "../store/actions";
import { sendAARFlowStates } from "../utils/stateUtils";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";

const { width, height, uri } = Image.resolveAssetSource(
  cieCanEducationalSource
);
const aspectRatio = width / height;

export type SendAarCanEducationalScreenProps = IOStackNavigationRouteProps<
  PnParamsList,
  typeof PN_ROUTES.SEND_AAR_CIE_CAN_EDUCATIONAL
>;

export const SendAarCanEducationalScreen = ({
  navigation
}: SendAarCanEducationalScreenProps) => {
  const dispatch = useIODispatch();
  const currentAarState = useIOSelector(currentAARFlowData);
  const { terminateFlow } = useSendAarFlowManager();
  const denomination = useIOSelector(aarAdresseeDenominationSelector);

  useEffect(() => {
    if (currentAarState.type === sendAARFlowStates.cieCanInsertion) {
      navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
        screen: PN_ROUTES.MAIN,
        params: {
          screen: PN_ROUTES.SEND_AAR_CIE_CAN_INSERTION
        }
      });
    }
  }, [currentAarState.type, navigation]);

  const handleGoBack = () => {
    Alert.alert(
      i18n.t("features.pn.aar.flow.cieCanAdvisory.alert.title"),
      i18n.t("features.pn.aar.flow.cieCanAdvisory.alert.message"),
      [
        {
          text: i18n.t("features.pn.aar.flow.cieCanAdvisory.alert.confirm"),
          style: "destructive",
          onPress: terminateFlow
        },
        {
          text: i18n.t("features.pn.aar.flow.cieCanAdvisory.alert.cancel")
        }
      ]
    );
  };

  const handleGoNext = () => {
    if (currentAarState.type === sendAARFlowStates.cieCanAdvisory) {
      dispatch(
        setAarFlowState({
          ...currentAarState,
          type: sendAARFlowStates.cieCanInsertion
        })
      );
    }
  };

  useHardwareBackButton(() => {
    handleGoBack();
    return true;
  });

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <IOScrollViewWithLargeHeader
        actions={{
          type: "SingleButton",
          primary: {
            testID: "primaryActionID",
            label: i18n.t("global.buttons.continue"),
            onPress: handleGoNext
          }
        }}
        title={{
          label: i18n.t("features.pn.aar.flow.cieCanAdvisory.title", {
            denomination
          })
        }}
        description={i18n.t("features.pn.aar.flow.cieCanAdvisory.description")}
        headerActionsProp={{ showHelp: true }}
        contextualHelp={{
          title: i18n.t(
            "features.pn.aar.flow.delegated.cieContextualHelp.title"
          ),
          body: i18n.t("features.pn.aar.flow.delegated.cieContextualHelp.body")
        }}
        goBack={handleGoBack}
        includeContentMargins
        alwaysBounceVertical={false}
      >
        <VSpacer size={8} />
        <Image
          source={{
            uri
          }}
          style={{
            aspectRatio
          }}
          accessibilityIgnoresInvertColors
        />
      </IOScrollViewWithLargeHeader>
    </SafeAreaView>
  );
};
