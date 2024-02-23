import * as React from "react";
import { useRoute } from "@react-navigation/native";
import {
  BlockButtons,
  ButtonSolidProps,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
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
  const cancelButtonProps: ButtonSolidProps = {
    testID: "FciStopAbortingSignatureTestID",
    onPress: () => dismiss(),
    label: I18n.t("features.fci.abort.confirm"),
    accessibilityLabel: I18n.t("features.fci.abort.confirm")
  };
  const continueButtonProps: ButtonSolidProps = {
    onPress: () => {
      trackFciUserExit(route.name, fciEnvironment);
      dispatch(fciEndRequest());
      dismiss();
    },
    color: "danger",
    label: I18n.t("features.fci.abort.cancel"),
    accessibilityLabel: I18n.t("features.fci.abort.cancel")
  };
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
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

  return {
    dismiss,
    present,
    bottomSheet
  };
};
