import * as React from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "native-base";
import customVariables from "../../theme/variables";
import I18n from "../../i18n";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
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
  title: {
    fontSize: 18,
    color: customVariables.lightGray,
    alignSelf: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    lineHeight: customVariables.lineHeightBase
  },
  modalClose: {
    flex: 1,
    paddingRight: 0,
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  icon: {
    paddingRight: 0
  }
});

type Props = {
  title: string;
  onClose: () => void;
};

export const BottomSheetHeader: React.FunctionComponent<Props> = ({
  title,
  onClose
}: Props) => (
  <View style={styles.row}>
    <Text style={styles.title} semibold={true}>
      {title}
    </Text>
    <ButtonDefaultOpacity
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
