import * as React from "react";
import { View } from "react-native";
import { useDispatch } from "react-redux";
import { BlockButtons, Body, IOStyles } from "@pagopa/io-app-design-system";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import I18n from "../../../i18n";
import { itwLifecycleOperational } from "../store/actions/itwLifecycleActions";

/**
 * A hook that returns a function to present the reset wallet bottom sheet in the wallet home screen.
 */
export const useItwResetFlow = () => {
  const dispatch = useDispatch();
  const BottomSheetBody = () => (
    <View style={IOStyles.flex}>
      <Body>
        {I18n.t("features.itWallet.homeScreen.reset.bottomSheet.body")}
      </Body>
    </View>
  );
  const Footer = () => (
    <View
      style={{
        ...IOStyles.horizontalContentPadding,
        paddingBottom: IOStyles.footer.paddingBottom
      }}
    >
      <BlockButtons
        type="TwoButtonsInlineHalf"
        primary={{
          type: "Outline",
          buttonProps: {
            accessibilityLabel: I18n.t(
              "features.itWallet.homeScreen.reset.bottomSheet.cancel"
            ),
            label: I18n.t(
              "features.itWallet.homeScreen.reset.bottomSheet.cancel"
            ),
            onPress: () => dismiss()
          }
        }}
        secondary={{
          type: "Solid",
          buttonProps: {
            accessibilityLabel: I18n.t(
              "features.itWallet.homeScreen.reset.bottomSheet.confirm"
            ),
            label: I18n.t(
              "features.itWallet.homeScreen.reset.bottomSheet.confirm"
            ),
            onPress: () => {
              dispatch(itwLifecycleOperational());
              dismiss();
            }
          }
        }}
      />
    </View>
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
