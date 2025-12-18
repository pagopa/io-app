import { ListItemHeader, VStack } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";
import { renderActionButtons } from "../../../../../components/ui/IOScrollView";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";

type Props = {
  type: "ciePin" | "cieId" | "spid";
  onPrimaryAction: () => void;
};

/**
 * Hook to display a bottom sheet with information about what you will need to continue the issuance flow
 * @param type - The type of info to display
 * @param onPrimaryAction - The action to be executed when the primary button is pressed
 * @returns The bottom sheet component
 */
export const useContinueWithBottomSheet = ({
  type,
  onPrimaryAction
}: Props) => {
  const firstIcon = (type: string) => {
    switch (type) {
      case "ciePin":
        return "fiscalCodeIndividual";
      case "cieId":
        return "fiscalCodeIndividual";
      case "spid":
        return "spid";
      default:
        return undefined;
    }
  };

  const secondIcon = (type: string) => {
    switch (type) {
      case "ciePin":
        return "securityPad";
      case "cieId":
        return "cie";
      case "spid":
        return "fiscalCodeIndividual";
      default:
        return undefined;
    }
  };

  const bottomSheet = useIOBottomSheetModal({
    title: I18n.t(
      `features.itWallet.identification.modeSelection.mode.${type}.bottomSheet.title`
    ),
    component: (
      <VStack space={24}>
        <ListItemHeader
          label={I18n.t(
            `features.itWallet.identification.modeSelection.mode.${type}.bottomSheet.entry-1`
          )}
          iconName={firstIcon(type)}
        />
        <ListItemHeader
          label={I18n.t(
            `features.itWallet.identification.modeSelection.mode.${type}.bottomSheet.entry-2`
          )}
          iconName={secondIcon(type)}
        />
        <View>
          {renderActionButtons(
            {
              type: "SingleButton",
              primary: {
                label: I18n.t(
                  `features.itWallet.identification.modeSelection.mode.${type}.bottomSheet.title`
                ),
                onPress: () => {
                  onPrimaryAction();
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
    // When opening the bottom sheet, track the view event by default.
    // Pass { skipTracking: true } to skip sending the analytics event.
    present: (options?: { skipTracking: boolean }) => {
      if (!options?.skipTracking) {
        // TODO: add tracking
      }
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
