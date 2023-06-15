import * as React from "react";
import { View, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { Icon } from "../../../components/core/icons";
import I18n from "../../../i18n";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { IOColors } from "../../../components/core/variables/IOColors";
import { WithTestID } from "../../../types/WithTestID";

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...IOStyles.horizontalContentPadding,
    paddingTop: 24,
    backgroundColor: IOColors.white,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16
  },
  closeButton: {
    paddingRight: 0,
    justifyContent: "flex-end"
  }
});

type ModalHeaderProps = WithTestID<{
  onClose: () => void;
}>;

const ModalHeader = ({ onClose, testID }: ModalHeaderProps) => (
  <View style={styles.mainContainer}>
    <View />
    <ButtonDefaultOpacity
      testID={`${testID}-close-button`}
      style={styles.closeButton}
      onPressWithGestureHandler={true}
      onPress={onClose}
      transparent={true}
      accessible={true}
      accessibilityRole={"button"}
      accessibilityLabel={I18n.t("global.buttons.close")}
    >
      <Icon name="closeLarge" color="bluegreyDark" size={24} />
    </ButtonDefaultOpacity>
  </View>
);

export default ModalHeader;
