import { VSpacer } from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import i18n from "i18next";
import { useCallback, useEffect } from "react";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import cieScanningEducationalSource from "../../../../../img/features/itWallet/identification/itw_cie_nfc.gif";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useHardwareBackButtonWhenFocused } from "../../../../hooks/useHardwareBackButton";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { PnParamsList } from "../../navigation/params";
import PN_ROUTES from "../../navigation/routes";
import {
  trackSendAarMandateCieCardReadingDisclaimer,
  trackSendAarMandateCieCardReadingDisclaimerContinue
} from "../analytics";
import { useIsNfcFeatureEnabled } from "../hooks/useIsNfcFeatureEnabled";
import { setAarFlowState } from "../store/actions";
import {
  aarAdresseeDenominationSelector,
  currentAarFlowData
} from "../store/selectors";
import { sendAarFlowStates } from "../utils/stateUtils";

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
  const currentAarState = useIOSelector(currentAarFlowData);
  const denomination = useIOSelector(aarAdresseeDenominationSelector);
  const { isChecking, isNfcEnabled } = useIsNfcFeatureEnabled();

  useEffect(() => {
    switch (currentAarState.type) {
      case sendAarFlowStates.androidNFCActivation: {
        navigation.replace(PN_ROUTES.SEND_AAR_NFC_ACTIVATION);
        break;
      }
      case sendAarFlowStates.cieCanInsertion: {
        navigation.replace(PN_ROUTES.SEND_AAR_CIE_CAN_INSERTION, {
          animationTypeForReplace: "pop"
        });
        break;
      }
      case sendAarFlowStates.cieScanning: {
        const { type: _, ...params } = currentAarState;
        navigation.replace(PN_ROUTES.SEND_AAR_CIE_CARD_READING, {
          ...params,
          animationTypeForReplace: "push"
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
    if (currentAarState.type === sendAarFlowStates.cieScanningAdvisory) {
      dispatch(
        setAarFlowState({
          ...currentAarState,
          type: sendAarFlowStates.cieCanInsertion
        })
      );
    }
  };

  const handleGoNext = async () => {
    trackSendAarMandateCieCardReadingDisclaimerContinue();
    if (currentAarState.type === sendAarFlowStates.cieScanningAdvisory) {
      const isNfcActive = await isNfcEnabled();

      dispatch(
        setAarFlowState({
          ...currentAarState,
          type: isNfcActive
            ? sendAarFlowStates.cieScanning
            : sendAarFlowStates.androidNFCActivation
        })
      );
    }
  };

  useHardwareBackButtonWhenFocused(() => {
    handleGoBack();
    return true;
  });

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      <IOScrollViewWithLargeHeader
        actions={{
          type: "SingleButton",
          primary: {
            testID: "primaryActionID",
            label: i18n.t(
              "features.pn.aar.flow.cieScanningAdvisory.primaryAction"
            ),
            loading: isChecking,
            onPress: () => void handleGoNext()
          }
        }}
        alwaysBounceVertical={false}
        contextualHelp={{
          title: i18n.t(
            "features.pn.aar.flow.delegated.cieContextualHelp.title"
          ),
          body: i18n.t("features.pn.aar.flow.delegated.cieContextualHelp.body")
        }}
        description={i18n.t(
          "features.pn.aar.flow.cieScanningAdvisory.description"
        )}
        goBack={handleGoBack}
        headerActionsProp={{ showHelp: true }}
        includeContentMargins
        title={{
          label: i18n.t("features.pn.aar.flow.cieScanningAdvisory.title", {
            denomination
          })
        }}
      >
        <VSpacer size={8} />
        <Image
          accessibilityIgnoresInvertColors
          source={{
            uri
          }}
          style={{
            aspectRatio
          }}
        />
      </IOScrollViewWithLargeHeader>
    </SafeAreaView>
  );
};
