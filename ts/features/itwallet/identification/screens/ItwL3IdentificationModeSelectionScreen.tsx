import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ContentWrapper,
  Divider,
  ListItemHeader,
  ListItemInfo,
  ListItemNav,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import {
  trackItWalletIDMethod,
  trackItWalletIDMethodSelected,
  trackItwContinueWithCieID,
  trackItwContinueWithCieIDClose,
  trackItwGoToCieIDApp,
  trackItwUserWithoutL3Requirements
} from "../../analytics";
import { useItwIdentificationBottomSheet } from "../../common/hooks/useItwIdentificationBottomSheet";
import { useCieInfoAndPinBottomSheets } from "../hooks/useCieInfoAndPinBottomSheets";
import { useNoCieBottomSheet } from "../hooks/useNoCieBottomSheet";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIOSelector } from "../../../../store/hooks";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { CieWarningType } from "./ItwIdentificationCieWarningScreen";

export const ItwL3IdentificationModeSelectionScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const [shouldTrackDismiss, setShouldTrackDismiss] = useState(true);
  const { name: routeName } = useRoute();

  const navigateToCieWarning = (warning: CieWarningType) => {
    machineRef.send({ type: "go-to-cie-warning", warning });
  };

  const cieBottomSheet = useItwIdentificationBottomSheet({
    title: I18n.t(
      "features.itWallet.identification.l3.mode.bottomSheet.cie.title"
    ),
    content: [
      {
        body: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.cie.content"
        )
      }
    ],
    footerButtons: [
      {
        icon: "cie",
        label: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.cie.action"
        ),
        onPress: () => {
          setShouldTrackDismiss(false);
          handleCieIdPress();
          trackItwGoToCieIDApp();
          cieBottomSheet.dismiss();
        }
      },
      {
        label: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.cie.cancel"
        ),
        onPress: () => {
          setShouldTrackDismiss(true);
          cieBottomSheet.dismiss();
        }
      }
    ],
    onDismiss: () => {
      if (shouldTrackDismiss) {
        trackItwContinueWithCieIDClose();
      }
      setShouldTrackDismiss(true);
    }
  });

  const { cieInfoBottomSheet, pinBottomSheet } = useCieInfoAndPinBottomSheets();

  const { noCieBottomSheet, noCieBottomSheetPresent } = useNoCieBottomSheet();

  useFocusEffect(
    useCallback(() => {
      trackItWalletIDMethod("L3");
    }, [])
  );

  const handleCiePinPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "ciePin" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "ciePin", itw_flow: "L3" });
  }, [machineRef]);

  const handleCieIdPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "cieId" });
    trackItWalletIDMethodSelected({ ITW_ID_method: "cieId", itw_flow: "L3" });
  }, [machineRef]);

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("features.itWallet.identification.l3.mode.title")
      }}
      description={I18n.t(
        "features.itWallet.identification.l3.mode.description"
      )}
      headerActionsProp={{ showHelp: true }}
      actions={{
        type: "TwoButtons",
        primary: {
          label: I18n.t(
            "features.itWallet.identification.l3.mode.primaryAction"
          ),
          accessibilityLabel: I18n.t(
            "features.itWallet.identification.l3.mode.primaryAction"
          ),
          onPress: handleCiePinPress,
          testID: "l3-primary-action"
        },
        secondary: {
          label: I18n.t(
            "features.itWallet.identification.l3.mode.secondaryAction"
          ),
          accessibilityLabel: I18n.t(
            "features.itWallet.identification.l3.mode.secondaryAction"
          ),
          onPress: isItwValid
            ? () => {
                trackItwUserWithoutL3Requirements({
                  screen_name: routeName,
                  reason: "user_without_cie",
                  position: "screen"
                });
                navigateToCieWarning("noCie");
              }
            : () => noCieBottomSheetPresent(),
          testID: "l3-secondary-action"
        }
      }}
      testID="l3-identification-view"
    >
      <ContentWrapper>
        <ListItemHeader
          label={I18n.t(
            "features.itWallet.identification.l3.mode.ciePin.header"
          )}
          testID="l3-cie-pin-header"
        />
        <VStack space={8}>
          <ListItemInfo
            value={I18n.t(
              "features.itWallet.identification.l3.mode.ciePin.card"
            )}
            icon={"fiscalCodeIndividual"}
            testID="l3-cie-card-info"
            endElement={{
              type: "iconButton",
              componentProps: {
                icon: "info",
                onPress: () => cieInfoBottomSheet.present(),
                accessibilityLabel: I18n.t("global.buttons.info"),
                testID: "l3-cie-info-button"
              }
            }}
          />
          <Divider />
          <ListItemInfo
            value={I18n.t(
              "features.itWallet.identification.l3.mode.ciePin.pin"
            )}
            icon={"key"}
            testID="l3-pin-info"
            endElement={{
              type: "iconButton",
              componentProps: {
                icon: "info",
                onPress: () => pinBottomSheet.present(),
                accessibilityLabel: I18n.t("global.buttons.info"),
                testID: "l3-pin-info-button"
              }
            }}
          />
        </VStack>
        <VSpacer size={24} />
        <ListItemHeader
          label={I18n.t(
            "features.itWallet.identification.l3.mode.cieId.header"
          )}
          testID="l3-cie-id-header"
        />
        <ListItemNav
          icon={"cie"}
          value={I18n.t("features.itWallet.identification.l3.mode.cieId.title")}
          description={I18n.t(
            "features.itWallet.identification.l3.mode.cieId.subtitle"
          )}
          onPress={() => {
            trackItwContinueWithCieID();
            cieBottomSheet.present();
          }}
          testID="l3-cie-id-nav"
        />
        {cieBottomSheet.bottomSheet}
        {cieInfoBottomSheet.bottomSheet}
        {pinBottomSheet.bottomSheet}
        {noCieBottomSheet.bottomSheet}
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
