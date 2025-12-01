import { SafeAreaView } from "react-native-safe-area-context";
import { IOVisualCostants, VSpacer } from "@pagopa/io-app-design-system";
import { Alert, Dimensions, Image } from "react-native";
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

const screenWidth = Dimensions.get("screen").width;
const { width, height, uri } = Image.resolveAssetSource(
  cieCanEducationalSource
);
const aspectRatio = width / height;
const maxScreenWidth = screenWidth - IOVisualCostants.appMarginDefault * 2;
const maxHeight = maxScreenWidth / aspectRatio;

export const SendAARCanEducationalScreen = () => {
  const dispatch = useIODispatch();
  const currentAARState = useIOSelector(currentAARFlowData);
  const { terminateFlow } = useSendAarFlowManager();
  const denomination = useIOSelector(aarAdresseeDenominationSelector);

  useEffect(() => {
    if (currentAARState.type === sendAARFlowStates.cieCanInsertion) {
      // TODO: [IOCOM-2748] navigate into CIE CAN insertion screen
    }
  }, [currentAARState.type]);

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
            onPress: () => {
              if (currentAARState.type === sendAARFlowStates.cieCanAdvisory) {
                dispatch(
                  setAarFlowState({
                    ...currentAARState,
                    type: sendAARFlowStates.cieCanInsertion
                  })
                );
              }
            }
          }
        }}
        title={{
          label: i18n.t("features.pn.aar.flow.cieCanAdvisory.title", {
            denomination
          })
        }}
        description={i18n.t("features.pn.aar.flow.cieCanAdvisory.description")}
        goBack={handleGoBack}
      >
        <VSpacer size={8} />
        <Image
          source={{ uri }}
          style={{
            height: maxHeight,
            width: maxScreenWidth,
            alignSelf: "center"
          }}
          accessibilityIgnoresInvertColors
        />
      </IOScrollViewWithLargeHeader>
    </SafeAreaView>
  );
};
