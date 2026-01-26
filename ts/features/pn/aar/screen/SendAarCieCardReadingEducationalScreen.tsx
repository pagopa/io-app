import { SafeAreaView } from "react-native-safe-area-context";
import { VSpacer } from "@pagopa/io-app-design-system";
import { Image } from "react-native";
import i18n from "i18next";
import { useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import cieScanningEducationalSource from "../../../../../img/features/itWallet/identification/itw_cie_nfc.gif";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  aarAdresseeDenominationSelector,
  currentAARFlowData
} from "../store/selectors";
import { setAarFlowState } from "../store/actions";
import { sendAARFlowStates } from "../utils/stateUtils";
import { useHardwareBackButtonWhenFocused } from "../../../../hooks/useHardwareBackButton";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import { useIsNfcFeatureEnabled } from "../hooks/useIsNfcFeatureEnabled";
import {
  trackSendAarMandateCieCardReadingDisclaimer,
  trackSendAarMandateCieCardReadingDisclaimerContinue
} from "../analytics";

const { width, height, uri } = Image.resolveAssetSource(
  cieScanningEducationalSource
);
const aspectRatio = width / height;

export type SendAarCieCardReadingEducationalScreenProps =
  IOStackNavigationRouteProps<
    PnParamsList,
    typeof PN_ROUTES.SEND_AAR_CIE_CARD_READING_EDUCATIONAL
  >;

export const SendAarCieCardReadingEducationalScreen = ({
  navigation
}: SendAarCieCardReadingEducationalScreenProps) => {
  const dispatch = useIODispatch();
  const currentAarState = useIOSelector(currentAARFlowData);
  const denomination = useIOSelector(aarAdresseeDenominationSelector);
  const { isChecking, isNfcEnabled } = useIsNfcFeatureEnabled();

  useEffect(() => {
    switch (currentAarState.type) {
      case sendAARFlowStates.cieScanning: {
        const { type: _, ...params } = currentAarState;

        navigation.navigate(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.SEND_AAR_CIE_CARD_READING,
            params
          }
        });
        break;
      }
      case sendAARFlowStates.cieCanInsertion: {
        navigation.goBack();
        break;
      }
      case sendAARFlowStates.androidNFCActivation: {
        navigation.replace(MESSAGES_ROUTES.MESSAGES_NAVIGATOR, {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.SEND_AAR_NFC_ACTIVATION
          }
        });
        break;
      }
      default:
        break;
    }
  }, [currentAarState, navigation]);

  useFocusEffect(
    useCallback(() => {
      trackSendAarMandateCieCardReadingDisclaimer();
    }, [])
  );

  const handleGoBack = () => {
    if (currentAarState.type === sendAARFlowStates.cieScanningAdvisory) {
      dispatch(
        setAarFlowState({
          ...currentAarState,
          type: sendAARFlowStates.cieCanInsertion
        })
      );
    }
  };

  const handleGoNext = async () => {
    trackSendAarMandateCieCardReadingDisclaimerContinue();
    if (currentAarState.type === sendAARFlowStates.cieScanningAdvisory) {
      const isNfcActive = await isNfcEnabled();

      dispatch(
        setAarFlowState({
          ...currentAarState,
          type: isNfcActive
            ? sendAARFlowStates.cieScanning
            : sendAARFlowStates.androidNFCActivation
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
            label: i18n.t(
              "features.pn.aar.flow.cieScanningAdvisory.primaryAction"
            ),
            loading: isChecking,
            onPress: handleGoNext
          }
        }}
        title={{
          label: i18n.t("features.pn.aar.flow.cieScanningAdvisory.title", {
            denomination
          })
        }}
        description={i18n.t(
          "features.pn.aar.flow.cieScanningAdvisory.description"
        )}
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
