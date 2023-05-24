import * as React from "react";
import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "../../i18n";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { H3 } from "../core/typography/H3";
import { IOStyles } from "../core/variables/IOStyles";
import { IOColors } from "../core/variables/IOColors";
import { setAccessibilityFocus } from "../../utils/accessibility";
import { Icon } from "../core/icons";

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
  }
});

type Props = {
  title: string | React.ReactNode;
  onClose: () => void;
};

export const BottomSheetHeader: React.FunctionComponent<Props> = ({
  title,
  onClose
}: Props) => {
  const headerRef = React.createRef<View>();

  useEffect(() => {
    setAccessibilityFocus(headerRef, 1000 as Millisecond);
  }, [headerRef]);

  return (
    <View style={styles.row} ref={headerRef}>
      {React.isValidElement(title) ? (
        title
      ) : (
        <View
          style={IOStyles.flex}
          accessible={true}
          accessibilityRole={"header"}
          accessibilityLabel={typeof title === "string" ? title : undefined}
        >
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
        <Icon name="close" color="grey" size={24} />
      </ButtonDefaultOpacity>
    </View>
  );
};
