import * as React from "react";
import { StyleSheet, View } from "react-native";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H3 } from "../../../components/core/typography/H3";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import Markdown from "../../../components/ui/Markdown";
import { IOColors } from "../../../components/core/variables/IOColors";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { errorButtonProps } from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { fciAbortingRequest } from "../store/actions";
import { useIODispatch } from "../../../store/hooks";

const styles = StyleSheet.create({
  verticalPad: {
    paddingVertical: customVariables.spacerHeight
  }
});

/**
 * A hook that returns a function to present the abort signature flow bottom sheet
 */
export const useFciAbortSignatureFlow = () => {
  const CSS_STYLE = `
        body {
            font-size: 18;
            color: ${IOColors.black};
        }
    `;
  const dispacth = useIODispatch();
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <View style={styles.verticalPad}>
      <Markdown cssStyle={CSS_STYLE} avoidTextSelection>
        {I18n.t("features.fci.abort.content")}
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
        onPress: () => {
          dismiss();
        },
        title: I18n.t("features.fci.abort.cancel")
      }}
      rightButton={{
        ...errorButtonProps(() => {
          dismiss();
          dispacth(fciAbortingRequest());
        }, I18n.t("features.fci.abort.confirm")),
        onPressWithGestureHandler: true
      }}
    />
  );

  return {
    dismiss,
    present,
    bottomSheet
  };
};
