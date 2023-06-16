import * as React from "react";
import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "../../i18n";
import { IOVisualCostants, IOStyles } from "../core/variables/IOStyles";
import { IOColors } from "../core/variables/IOColors";
import { setAccessibilityFocus } from "../../utils/accessibility";
import { NewH4 } from "../core/typography/NewH4";
import IconButton from "../ui/IconButton";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";

const styles = StyleSheet.create({
  bottomSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    paddingTop: IOVisualCostants.appMarginDefault,
    paddingBottom: IOVisualCostants.appMarginDefault,
    backgroundColor: IOColors.white
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
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
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
      {/* ◀ REMOVE_LEGACY_COMPONENT: Remove the following condition */}
      {isDesignSystemEnabled ? (
        <IconButton
          color="neutral"
          onPress={onClose}
          icon="closeMedium"
          accessibilityLabel={I18n.t("global.buttons.close")}
        />
      ) : (
        <View style={{ opacity: 0.5 }}>
          <IconButton
            color="neutral"
            onPress={onClose}
            icon="closeMedium"
            accessibilityLabel={I18n.t("global.buttons.close")}
          />
        </View>
      )}
    </View>
  );
};
