import * as React from "react";
import { StyleSheet } from "react-native";
import { View } from "native-base";
import customVariables from "../../theme/variables";
import I18n from "../../i18n";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { H3 } from "../core/typography/H3";
import IconFont from "../ui/IconFont";
import { IOStyles } from "../core/variables/IOStyles";
import { IOColors } from "../core/variables/IOColors";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...IOStyles.horizontalContentPadding,
    paddingTop: 24,
    backgroundColor: IOColors.white,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16
  },
  modalClose: {
    paddingRight: 0,
    justifyContent: "flex-end"
  },
  icon: {
    paddingRight: 0
  }
});

type Props = {
  title: string | React.ReactNode;
  onClose: () => void;
};

export const BottomSheetHeader: React.FunctionComponent<Props> = ({
  title,
  onClose
}: Props) => (
  <View style={styles.row}>
    {React.isValidElement(title) ? (
      title
    ) : (
      <View style={IOStyles.flex}>
        <H3>{title}</H3>
      </View>
    )}
    <ButtonDefaultOpacity
      onPressWithGestureHandler={true}
      style={styles.modalClose}
      onPress={onClose}
      transparent={true}
      accessible={true}
      accessibilityRole={"button"}
      accessibilityLabel={I18n.t("global.buttons.close")}
    >
      <IconFont
        name="io-close"
        color={customVariables.lightGray}
        style={styles.icon}
      />
    </ButtonDefaultOpacity>
  </View>
);
