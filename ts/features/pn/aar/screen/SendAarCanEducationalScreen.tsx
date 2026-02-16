import { VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import i18n from "i18next";
import { useCallback, useEffect } from "react";
import { Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import cieCanEducationalSource from "../../../../../img/features/pn/cieCanEducational.png";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useHardwareBackButtonWhenFocused } from "../../../../hooks/useHardwareBackButton";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import {
  trackSendAarMandateCiePreparation,
  trackSendAarMandateCiePreparationContinue,
  trackSendAarMandateCieReadingClosureAlert,
  trackSendAarMandateCieReadingClosureAlertAccepted,
  trackSendAarMandateCieReadingClosureAlertContinue
} from "../analytics";
import { useSendAarFlowManager } from "../hooks/useSendAarFlowManager";
import { setAarFlowState } from "../store/actions";
import {
  aarAdresseeDenominationSelector,
  currentAARFlowData
} from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";

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
      navigation.replace(PN_ROUTES.SEND_AAR_CIE_CAN_INSERTION, {
        animationTypeForReplace: "push"
      });
    }
  }, [currentAarState.type, navigation]);

  useFocusEffect(
    useCallback(() => {
      trackSendAarMandateCiePreparation();
    }, [])
  );

  const handleGoBack = () => {
    trackSendAarMandateCieReadingClosureAlert("CIE_PREPARATION");
    Alert.alert(
      i18n.t("features.pn.aar.flow.cieCanAdvisory.alert.title"),
      i18n.t("features.pn.aar.flow.cieCanAdvisory.alert.message"),
      [
        {
          text: i18n.t("features.pn.aar.flow.cieCanAdvisory.alert.confirm"),
          style: "destructive",
          onPress: () => {
            trackSendAarMandateCieReadingClosureAlertAccepted(
              "CIE_PREPARATION"
            );
            terminateFlow();
          }
        },
        {
          text: i18n.t("features.pn.aar.flow.cieCanAdvisory.alert.cancel"),
          onPress: () => {
            trackSendAarMandateCieReadingClosureAlertContinue(
              "CIE_PREPARATION"
            );
          }
        }
      ]
    );
  };

  const handleGoNext = () => {
    trackSendAarMandateCiePreparationContinue();

    if (currentAarState.type === sendAARFlowStates.cieCanAdvisory) {
      dispatch(
        setAarFlowState({
          ...currentAarState,
          type: sendAARFlowStates.cieCanInsertion
        })
      );
    }
  };

  useHardwareBackButtonWhenFocused(() => {
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
