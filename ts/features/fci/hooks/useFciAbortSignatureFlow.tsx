import * as React from "react";
import { Alert, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  BlockButtons,
  ButtonSolidProps,
  IOVisualCostants,
  useIOExperimentalDesign
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { fciEndRequest } from "../store/actions";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { trackFciUserExit } from "../analytics";
import { fciSignatureRequestDossierTitleSelector } from "../store/reducers/fciSignatureRequest";
import LegacyMarkdown from "../../../components/ui/Markdown/LegacyMarkdown";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { fciEnvironmentSelector } from "../store/reducers/fciEnvironment";

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

  const cancelButtonProps: ButtonSolidProps = {
    testID: "FciStopAbortingSignatureTestID",
    onPress: () => dismiss(),
    label: I18n.t("features.fci.abort.confirm"),
    accessibilityLabel: I18n.t("features.fci.abort.confirm")
  };
  const continueButtonProps: ButtonSolidProps = {
    onPress: () => abortSignatureFlow(),
    color: "danger",
    label: I18n.t("features.fci.abort.cancel"),
    accessibilityLabel: I18n.t("features.fci.abort.cancel")
  };

  const {
    present: presentBs,
    bottomSheet,
    dismiss
  } = useIOBottomSheetModal({
    title: I18n.t("features.fci.abort.title"),
    component: (
      <LegacyMarkdown>
        {I18n.t("features.fci.abort.content", { dossierTitle })}
      </LegacyMarkdown>
    ),
    snapPoint: [280],
    footer: (
      <View style={{ paddingHorizontal: IOVisualCostants.appMarginDefault }}>
        <BlockButtons
          type={"TwoButtonsInlineHalf"}
          primary={{ type: "Outline", buttonProps: cancelButtonProps }}
          secondary={{ type: "Solid", buttonProps: continueButtonProps }}
        />
      </View>
    )
  });

  /**
   * Show an alert to confirm the abort signature flow.
   */
  const showAlert = () => {
    Alert.alert(I18n.t("features.fci.abort.alert.title"), undefined, [
      {
        text: I18n.t("features.fci.abort.alert.cancel"),
        style: "cancel"
      },
      {
        text: I18n.t("features.fci.abort.alert.confirm"),
        onPress: () => abortSignatureFlow()
      }
    ]);
  };

  /**
   * Overrides the present function of the bottom sheet to show an alert instead if the experimental design is enabled.
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
