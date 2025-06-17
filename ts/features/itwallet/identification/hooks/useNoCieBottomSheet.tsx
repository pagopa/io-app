import { StyleSheet, View } from "react-native";
import {
  FooterActions,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import IOMarkdown from "../../../../components/IOMarkdown";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";

const noCieContentKeys = [
  "features.itWallet.identification.l3.mode.bottomSheet.noCie.content.firstAttention",
  "features.itWallet.identification.l3.mode.bottomSheet.noCie.content.secondAttention",
  "features.itWallet.identification.l3.mode.bottomSheet.noCie.content.thirdAttention"
] as const;

/**
 * Hook to manage the no CIE bottom sheet
 */
export const useNoCieBottomSheet = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const navigateToL2Identification = () => {
    machineRef.send({ type: "go-to-l2-identification" });
    noCieBottomSheet.dismiss();
  };
  const noCieBottomSheet = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.identification.l3.mode.bottomSheet.noCie.title"
    ),
    component: (
      <>
        <IOMarkdown
          content={I18n.t(
            "features.itWallet.identification.l3.mode.bottomSheet.noCie.description"
          )}
        />
        <VSpacer size={8} />
        <View>
          {noCieContentKeys.map((key, index) => (
            <View key={index} style={styles.row}>
              <View style={styles.iconContainer}>
                <Pictogram name="attention" size={64} />
              </View>
              <View style={styles.textContainer}>
                <IOMarkdown content={I18n.t(key)} />
              </View>
            </View>
          ))}
        </View>
      </>
    ),
    snapPoint: [660],
    footer: (
      <FooterActions
        actions={{
          type: "TwoButtons",
          primary: {
            label: I18n.t(
              "features.itWallet.identification.l3.mode.bottomSheet.noCie.primaryAction"
            ),
            accessibilityLabel: I18n.t(
              "features.itWallet.identification.l3.mode.bottomSheet.noCie.primaryAction"
            ),
            onPress: navigateToL2Identification
          },
          secondary: {
            label: I18n.t(
              "features.itWallet.identification.l3.mode.bottomSheet.noCie.secondaryAction"
            ),
            accessibilityLabel: I18n.t(
              "features.itWallet.identification.l3.mode.bottomSheet.noCie.secondaryAction"
            ),
            onPress: () => noCieBottomSheet.dismiss()
          }
        }}
      />
    )
  });

  return noCieBottomSheet;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginVertical: 15
  },
  iconContainer: {
    alignSelf: "center"
  },
  textContainer: {
    marginLeft: 12,
    flex: 1
  }
});
