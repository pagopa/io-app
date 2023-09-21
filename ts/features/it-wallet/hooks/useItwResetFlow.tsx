import * as React from "react";
import { View } from "react-native";
import { useDispatch } from "react-redux";
import { IOColors } from "@pagopa/io-app-design-system";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { H4 } from "../../../components/core/typography/H4";
import { itwLifecycleOperational } from "../store/actions/itwLifecycleActions";

/**
 * A hook that returns a function to present the reset wallet bottom sheet in the wallet home screen.
 */
export const useItwResetFlow = () => {
  const dispatch = useDispatch();
  const BottomSheetBody = () => (
    <View style={IOStyles.flex}>
      <H4 color={"bluegreyDark"} weight={"Regular"}>
        {I18n.t("features.itWallet.homeScreen.reset.bottomSheet.body")}
      </H4>
    </View>
  );
  const Footer = () => (
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={{
        onPressWithGestureHandler: true,
        bordered: true,
        onPress: () => dismiss(),
        title: I18n.t("features.itWallet.homeScreen.reset.bottomSheet.cancel")
      }}
      rightButton={{
        onPress: () => {
          dispatch(itwLifecycleOperational());
          dismiss();
        },
        primary: true,
        labelColor: IOColors.white,
        title: I18n.t("features.itWallet.homeScreen.reset.bottomSheet.confirm")
      }}
    />
  );
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    title: I18n.t("features.itWallet.homeScreen.reset.bottomSheet.title"),
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
