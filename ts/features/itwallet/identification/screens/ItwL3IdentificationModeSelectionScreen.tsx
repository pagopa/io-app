import {
  ContentWrapper,
  Divider,
  ListItemHeader,
  ListItemInfo,
  ListItemNav,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { View } from "react-native";
import IOMarkdown from "../../../../components/IOMarkdown";
import { renderActionButtons } from "../../../../components/ui/IOScrollView";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import {
  trackItWalletIDMethod,
  trackItWalletIDMethodSelected
} from "../../analytics";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { useCieInfoBottomSheet } from "../hooks/useCieInfoBottomSheet";
import { CieWarningType } from "./ItwIdentificationCieWarningScreen";

export const ItwL3IdentificationModeSelectionScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const cieIdBottomSheet = useCieIdBottomSheet();
  const cieCardInfoBottomSheet = useCieInfoBottomSheet("card");
  const ciePinInfoBottomSheet = useCieInfoBottomSheet("pin");

  const navigateToCieWarning = (warning: CieWarningType) => {
    machineRef.send({ type: "go-to-cie-warning", warning });
  };

  useFocusEffect(trackItWalletIDMethod);

  const handleCiePinPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "ciePin" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "ciePin" });
  }, [machineRef]);

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("features.itWallet.identification.mode.l3.screen.title")
      }}
      description={I18n.t(
        "features.itWallet.identification.mode.l3.screen.description"
      )}
      headerActionsProp={{ showHelp: true }}
      actions={{
        type: "TwoButtons",
        primary: {
          label: I18n.t(
            "features.itWallet.identification.mode.l3.screen.primaryAction"
          ),
          accessibilityLabel: I18n.t(
            "features.itWallet.identification.mode.l3.screen.primaryAction"
          ),
          onPress: handleCiePinPress,
          testID: "l3-primary-action"
        },
        secondary: {
          label: I18n.t(
            "features.itWallet.identification.mode.l3.screen.secondaryAction"
          ),
          accessibilityLabel: I18n.t(
            "features.itWallet.identification.mode.l3.screen.secondaryAction"
          ),
          onPress: () => navigateToCieWarning("noCie"),
          testID: "l3-secondary-action"
        }
      }}
      testID="l3-identification-view"
    >
      <ContentWrapper>
        <ListItemHeader
          label={I18n.t(
            "features.itWallet.identification.mode.l3.screen.requirements.header"
          )}
          testID="l3-cie-pin-header"
        />
        <VStack space={8}>
          <ListItemInfo
            value={I18n.t(
              "features.itWallet.identification.mode.l3.screen.requirements.card"
            )}
            icon={"fiscalCodeIndividual"}
            testID="l3-cie-card-info"
            endElement={{
              type: "iconButton",
              componentProps: {
                icon: "info",
                onPress: () => cieCardInfoBottomSheet.present(),
                accessibilityLabel: I18n.t("global.buttons.info"),
                testID: "l3-cie-info-button"
              }
            }}
          />
          <Divider />
          <ListItemInfo
            value={I18n.t(
              "features.itWallet.identification.mode.l3.screen.requirements.pin"
            )}
            icon={"key"}
            testID="l3-pin-info"
            endElement={{
              type: "iconButton",
              componentProps: {
                icon: "info",
                onPress: () => ciePinInfoBottomSheet.present(),
                accessibilityLabel: I18n.t("global.buttons.info"),
                testID: "l3-pin-info-button"
              }
            }}
          />
        </VStack>
        <VSpacer size={24} />
        <ListItemHeader
          label={I18n.t(
            "features.itWallet.identification.mode.l3.screen.otherMethods.header"
          )}
          testID="l3-cie-id-header"
        />
        <ListItemNav
          icon={"cie"}
          value={I18n.t(
            "features.itWallet.identification.mode.l3.screen.otherMethods.title"
          )}
          description={I18n.t(
            "features.itWallet.identification.mode.l3.screen.otherMethods.subtitle"
          )}
          onPress={cieIdBottomSheet.present}
          testID="l3-cie-id-nav"
        />
        {cieIdBottomSheet.bottomSheet}
        {cieCardInfoBottomSheet.bottomSheet}
        {ciePinInfoBottomSheet.bottomSheet}
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

/**
 * Bottom sheet that displays info about the CieID authentication method
 */
const useCieIdBottomSheet = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const bottomSheet = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.identification.mode.l3.bottomSheet.cieId.title"
    ),
    component: (
      <VStack space={24}>
        <IOMarkdown
          content={I18n.t(
            "features.itWallet.identification.mode.l3.bottomSheet.cieId.content"
          )}
        />
        <View>
          {renderActionButtons(
            {
              type: "TwoButtons",
              primary: {
                icon: "cie",
                label: I18n.t(
                  "features.itWallet.identification.mode.l3.bottomSheet.cieId.primaryAction"
                ),
                onPress: () => {
                  machineRef.send({
                    type: "select-identification-mode",
                    mode: "cieId"
                  });
                }
              },
              secondary: {
                label: I18n.t(
                  "features.itWallet.identification.mode.l3.bottomSheet.cieId.secondaryAction"
                ),
                onPress: () => {
                  bottomSheet.dismiss();
                }
              }
            },
            16
          )}
        </View>
      </VStack>
    )
  });

  return bottomSheet;
};
