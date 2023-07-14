import * as React from "react";
import { View } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { errorButtonProps } from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { H4 } from "../../../components/core/typography/H4";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";

/**
 * A hook that returns a function to present the abort wallet activation flow bottom sheet
 */
export const useItwAbortFlow = () => {
  const BottomSheetBody = () => (
    <View style={IOStyles.flex}>
      <H4 color={"bluegreyDark"} weight={"Regular"}>
        {I18n.t("features.itWallet.issuing.pidPreviewScreen.bottomSheet.body")}
      </H4>
    </View>
  );
  const Footer = () => (
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={{
        testID: "FciStopAbortingSignatureTestID",
        onPressWithGestureHandler: true,
        bordered: true,
        onPress: () => dismiss(),
        title: I18n.t(
          "features.itWallet.issuing.pidPreviewScreen.bottomSheet.buttons.back"
        )
      }}
      rightButton={{
        ...errorButtonProps(() => {
          dismiss();
          NavigationService.dispatchNavigationAction(
            CommonActions.navigate(ROUTES.MAIN)
          );
        }, I18n.t("features.itWallet.issuing.pidPreviewScreen.bottomSheet.buttons.cancel")),
        onPressWithGestureHandler: true
      }}
    />
  );
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.issuing.pidPreviewScreen.bottomSheet.title"
    ),
    component: <BottomSheetBody />,
    snapPoint: [300],
    footer: <Footer />
  });

  return {
    dismiss,
    present,
    bottomSheet
  };
};
