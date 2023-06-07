import * as React from "react";
import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "../../i18n";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { IOLayoutCostants, IOStyles } from "../core/variables/IOStyles";
import { IOColors } from "../core/variables/IOColors";
import { setAccessibilityFocus } from "../../utils/accessibility";
import { Icon } from "../core/icons";
import { NewH4 } from "../core/typography/NewH4";

const styles = StyleSheet.create({
  bottomSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: IOLayoutCostants.appMarginDefault,
    paddingTop: IOLayoutCostants.appMarginDefault,
    backgroundColor: IOColors.white
  },
  modalClose: {
    paddingRight: 0,
    paddingVertical: 0,
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
    <View style={styles.bottomSheetHeader} ref={headerRef}>
      {React.isValidElement(title) ? (
        title
      ) : (
        <View
          style={IOStyles.flex}
          accessible={true}
          accessibilityRole={"header"}
          accessibilityLabel={typeof title === "string" ? title : undefined}
        >
          <NewH4>{title}</NewH4>
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
