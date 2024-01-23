import * as React from "react";
import { StyleSheet, View, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useIOExperimentalDesign } from "@pagopa/io-app-design-system";
import { useLegacyIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H3 } from "../../../components/core/typography/H3";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { errorButtonProps } from "../../../components/buttons/ButtonConfigurations";
import { fciEndRequest } from "../store/actions";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { trackFciUserExit } from "../analytics";
import { fciSignatureRequestDossierTitleSelector } from "../store/reducers/fciSignatureRequest";
import Markdown from "../../../components/ui/Markdown";
import { fciEnvironmentSelector } from "../store/reducers/fciEnvironment";

const styles = StyleSheet.create({
  verticalPad: {
    paddingVertical: customVariables.spacerHeight
  }
});

/**
 * A hook that returns a function to present the abort signature flow bottom sheet
 */
export const useFciAbortSignatureFlow = () => {
  const dispatch = useIODispatch();
  const route = useRoute();
  const dossierTitle = useIOSelector(fciSignatureRequestDossierTitleSelector);
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);
  const { isExperimental } = useIOExperimentalDesign();

  /**
   * Callback function to abort the signature flow.
   */
  const abortSignatureFlow = () => {
    trackFciUserExit(route.name, fciEnvironment);
    dispatch(fciEndRequest());
    dismiss();
  };

  const {
    present: presentBs,
    bottomSheet,
    dismiss
  } = useLegacyIOBottomSheetModal(
    <View style={styles.verticalPad}>
      <Markdown>
        {I18n.t("features.fci.abort.content", { dossierTitle })}
      </Markdown>
    </View>,
    <View style={IOStyles.flex}>
      <H3 color={"bluegreyDark"} weight={"SemiBold"}>
        {I18n.t("features.fci.abort.title")}
      </H3>
    </View>,
    280,
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={{
        testID: "FciStopAbortingSignatureTestID",
        onPressWithGestureHandler: true,
        bordered: true,
        onPress: () => dismiss(),
        title: I18n.t("features.fci.abort.confirm")
      }}
      rightButton={{
        ...errorButtonProps(
          () => abortSignatureFlow(),
          I18n.t("features.fci.abort.cancel")
        ),
        onPressWithGestureHandler: true
      }}
    />
  );

  /**
   * Show an alert to confirm the abort signature flow.
   */
  const showAlert = () => {
    Alert.alert("Vuoi interrompere l’operazione?", undefined, [
      {
        text: "Sì, interrompi",
        onPress: () => abortSignatureFlow(),
        style: "cancel"
      },
      {
        text: "No, torna indietro"
      }
    ]);
  };

  /**
   * Overrides the present function of the bottom to show an alert instead if the experimental design is enabled.
   * This allows us to use an alert without changing single components which use the hook.
   * TODO: remove when the experimental design will be enabled by default (SFEQS-2090)
   */
  const present = () => (isExperimental ? showAlert() : presentBs());

  return {
    dismiss,
    present,
    bottomSheet
  };
};
