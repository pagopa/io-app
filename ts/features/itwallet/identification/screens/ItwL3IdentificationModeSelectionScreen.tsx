import {
  ContentWrapper,
  Divider,
  HStack,
  ListItemHeader,
  ListItemInfo,
  ListItemNav,
  Pictogram,
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
import { useIOSelector } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import {
  trackItWalletIDMethod,
  trackItWalletIDMethodSelected
} from "../../analytics";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { useCieInfoBottomSheet } from "../hooks/useCieInfoBottomSheet";
import { isL3FeaturesEnabledSelector } from "../../machine/eid/selectors";

export const ItwL3IdentificationModeSelectionScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isWalletAlreadyActivated = useIOSelector(itwLifecycleIsValidSelector);
  const isL3FeaturesEnabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );

  const cieIdBottomSheet = useCieIdBottomSheet();
  const noCieBottomSheet = useNoCieBottomSheet();
  const cieCardInfoBottomSheet = useCieInfoBottomSheet({
    type: "card",
    showSecondaryAction: isL3FeaturesEnabled
  });
  const ciePinInfoBottomSheet = useCieInfoBottomSheet({
    type: "pin",
    showSecondaryAction: isL3FeaturesEnabled
  });

  useFocusEffect(trackItWalletIDMethod);

  const handlePrimaryActionPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "ciePin" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "ciePin" });
  }, [machineRef]);

  const handleSecondaryActionPress = useCallback(() => {
    if (isWalletAlreadyActivated) {
      // If the user is in the L3 upgrade flow, he cannot proceed without a CIE card
      machineRef.send({ type: "go-to-cie-warning", warning: "card" });
    } else {
      // If the user is activating the IT Wallet, we provide an L2 fallback
      noCieBottomSheet.present();
    }
  }, [isWalletAlreadyActivated, noCieBottomSheet, machineRef]);

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
          onPress: handlePrimaryActionPress,
          testID: "l3-primary-action"
        },
        secondary: {
          label: I18n.t(
            "features.itWallet.identification.mode.l3.screen.secondaryAction"
          ),
          accessibilityLabel: I18n.t(
            "features.itWallet.identification.mode.l3.screen.secondaryAction"
          ),
          onPress: handleSecondaryActionPress,
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
        {noCieBottomSheet.bottomSheet}
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

/**
 * Hook that manages the bottom sheet that displays info about the CieID authentication method
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

/**
 * Hook that manages the bottom sheet that displays info about the CieID authentication method
 */
export const useNoCieBottomSheet = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const bottomSheet = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.identification.mode.l3.bottomSheet.noCie.title"
    ),
    component: (
      <VStack space={24}>
        <IOMarkdown
          content={I18n.t(
            "features.itWallet.identification.mode.l3.bottomSheet.noCie.content"
          )}
        />
        {([0, 1, 2] as const).map(index => (
          <HStack space={24} key={index} style={{ alignItems: "center" }}>
            <Pictogram name="attention" size={48} />
            <View style={{ flex: 1 }}>
              <IOMarkdown
                content={I18n.t(
                  `features.itWallet.identification.mode.l3.bottomSheet.noCie.warnings.${index}`
                )}
              />
            </View>
          </HStack>
        ))}
        <View>
          {renderActionButtons(
            {
              type: "TwoButtons",
              primary: {
                icon: "cie",
                label: I18n.t(
                  "features.itWallet.identification.mode.l3.bottomSheet.noCie.primaryAction"
                ),
                onPress: () => {
                  machineRef.send({ type: "go-to-l2-identification" });
                  bottomSheet.dismiss();
                }
              },
              secondary: {
                label: I18n.t(
                  "features.itWallet.identification.mode.l3.bottomSheet.noCie.secondaryAction"
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
