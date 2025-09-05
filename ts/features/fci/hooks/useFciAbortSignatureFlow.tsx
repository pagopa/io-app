import {
  FooterActions,
  useIOExperimentalDesign
} from "@pagopa/io-app-design-system";
import { useRoute } from "@react-navigation/native";
import I18n from "i18next";
import { Alert } from "react-native";
import IOMarkdown from "../../../components/IOMarkdown";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { trackFciUserExit } from "../analytics";
import { fciEndRequest } from "../store/actions";
import { fciEnvironmentSelector } from "../store/reducers/fciEnvironment";
import { fciSignatureRequestDossierTitleSelector } from "../store/reducers/fciSignatureRequest";

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
  } = useIOBottomSheetModal({
    title: I18n.t("features.fci.abort.title"),
    component: (
      <IOMarkdown
        content={I18n.t("features.fci.abort.content", { dossierTitle })}
      />
    ),
    snapPoint: [280],
    footer: (
      <FooterActions
        actions={{
          type: "TwoButtons",
          primary: {
            color: "danger",
            label: I18n.t("features.fci.abort.cancel"),
            onPress: () => abortSignatureFlow()
          },
          secondary: {
            testID: "FciStopAbortingSignatureTestID",
            label: I18n.t("features.fci.abort.confirm"),
            onPress: () => dismiss()
          }
        }}
      />
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
