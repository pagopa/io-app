import { VStack } from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import { useCallback, useMemo } from "react";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import I18n from "../../../../i18n";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import IOMarkdown from "../../../../components/IOMarkdown";
import { AnimatedImage } from "../../../../components/AnimatedImage";
import { renderActionButtons } from "../../../../components/ui/IOScrollView";

/**
 * The type of info to display in the bottom sheet
 */
type InfoCategory = "card" | "pin";

/**
 * Hook to display a bottom sheet with information about the CIE
 * @param category - The category of info to display
 * @returns The bottom sheet component
 */
export const useCieInfoBottomSheet = (category: InfoCategory) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const imageSrc = useMemo(() => {
    switch (category) {
      case "card":
        return require("../../../../../img/features/itWallet/identification/cie_card.png");
      case "pin":
        return require("../../../../../img/features/itWallet/identification/cie_pin.png");
      default:
        return undefined;
    }
  }, [category]);

  const handleSecondaryAction = useCallback(() => {
    switch (category) {
      case "card":
        machineRef.send({
          type: "go-to-cie-warning",
          warning: "noCie"
        });
        break;
      case "pin":
        machineRef.send({
          type: "go-to-cie-warning",
          warning: "noPin"
        });
        break;
    }
  }, [category, machineRef]);
  const bottomSheet = useIOBottomSheetModal({
    title: I18n.t(
      `features.itWallet.identification.cie.bottomSheet.${category}.title`
    ),
    component: (
      <VStack space={24}>
        <IOMarkdown
          content={I18n.t(
            `features.itWallet.identification.cie.bottomSheet.${category}.content`
          )}
        />
        <AnimatedImage source={imageSrc} style={styles.image} />
        <View>
          {renderActionButtons(
            {
              type: "TwoButtons",
              primary: {
                label: I18n.t(
                  `features.itWallet.identification.cie.bottomSheet.${category}.primaryAction`
                ),
                onPress: () => {
                  bottomSheet.dismiss();
                }
              },
              secondary: {
                label: I18n.t(
                  `features.itWallet.identification.cie.bottomSheet.${category}.secondaryAction`
                ),
                onPress: handleSecondaryAction
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

const styles = StyleSheet.create({
  image: {
    resizeMode: "contain",
    width: "100%"
  }
});
