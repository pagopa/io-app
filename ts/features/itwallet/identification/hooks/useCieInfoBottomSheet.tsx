import { VStack } from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useMemo } from "react";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import I18n from "../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import IOMarkdown from "../../../../components/IOMarkdown";
import { AnimatedImage } from "../../../../components/AnimatedImage";
import { renderActionButtons } from "../../../../components/ui/IOScrollView";
import { CiePreparationType } from "../components/cie/ItwCiePreparationBaseScreenContent";
import {
  trackItwCieInfoBottomSheet,
  trackItwPinInfoBottomSheet,
  trackItwUserWithoutL3Requirements
} from "../../analytics";

type Props = { type: CiePreparationType; showSecondaryAction?: boolean };

const trackBottomSheetView = (type: CiePreparationType, screenName: string) => {
  switch (type) {
    case "card":
      return trackItwCieInfoBottomSheet({
        itw_flow: "L3",
        screen_name: screenName
      });
    case "pin":
      return trackItwPinInfoBottomSheet({
        itw_flow: "L3",
        screen_name: screenName
      });
  }
};

/**
 * Hook to display a bottom sheet with information about the CIE
 * @param type - The type of info to display
 * @param showSecondaryAction - Whether to show the secondary action button. The bottomsheet has different actions based
 * on auth level or step in the flow.
 * @returns The bottom sheet component
 */
export const useCieInfoBottomSheet = ({
  type,
  showSecondaryAction = true
}: Props) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const { name: routeName } = useRoute();
  const reason = type === "card" ? "user_without_cie" : "user_without_pin";

  const imageSrc = useMemo(() => {
    switch (type) {
      case "card":
        return require("../../../../../img/features/itWallet/identification/cie_card.png");
      case "pin":
        return require("../../../../../img/features/itWallet/identification/cie_pin.png");
      default:
        return undefined;
    }
  }, [type]);

  const bottomSheet = useIOBottomSheetModal({
    title: I18n.t(
      `features.itWallet.identification.cie.bottomSheet.${type}.title`
    ),
    component: (
      <VStack space={24}>
        <IOMarkdown
          content={I18n.t(
            `features.itWallet.identification.cie.bottomSheet.${type}.content`
          )}
        />
        <AnimatedImage source={imageSrc} style={styles.image} />
        <View>
          {renderActionButtons(
            showSecondaryAction
              ? // If L3 (IT-Wallet), show both primary and secondary actions
                {
                  type: "TwoButtons",
                  primary: {
                    label: I18n.t(
                      `features.itWallet.identification.cie.bottomSheet.${type}.primaryAction`
                    ),
                    onPress: () => {
                      bottomSheet.dismiss();
                    }
                  },
                  secondary: {
                    label: I18n.t(
                      `features.itWallet.identification.cie.bottomSheet.${type}.secondaryAction`
                    ),
                    onPress: () => {
                      trackItwUserWithoutL3Requirements({
                        screen_name: routeName,
                        reason,
                        position: "bottom_sheet"
                      });
                      machineRef.send({
                        type: "go-to-cie-warning",
                        warning: type
                      });
                      bottomSheet.dismiss();
                    }
                  }
                }
              : // If not L3 (Documenti su IO), show only the primary action
                {
                  type: "SingleButton",
                  primary: {
                    label: I18n.t(
                      `features.itWallet.identification.cie.bottomSheet.${type}.primaryAction`
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

  return {
    ...bottomSheet,
    present: () => {
      trackBottomSheetView(type, routeName);
      bottomSheet.present();
    }
  };
};

const styles = StyleSheet.create({
  image: {
    resizeMode: "contain",
    width: "100%"
  }
});
