import {
  createRef,
  FunctionComponent,
  isValidElement,
  ReactNode,
  useEffect
} from "react";
import { View, StyleSheet } from "react-native";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import {
  H4,
  IconButton,
  IOColors,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import I18n from "../../i18n";
import { IOStyles } from "../core/variables/IOStyles";
import { setAccessibilityFocus } from "../../utils/accessibility";
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
  title: string | ReactNode;
  onClose: () => void;
};

export const BottomSheetHeader: FunctionComponent<Props> = ({
  title,
  onClose
}: Props) => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const headerRef = createRef<View>();

  useEffect(() => {
    setAccessibilityFocus(headerRef, 1000 as Millisecond);
  }, [headerRef]);

  return (
    <View style={styles.bottomSheetHeader} ref={headerRef}>
      {isValidElement(title) ? (
        title
      ) : (
        <View
          style={IOStyles.flex}
          accessible={true}
          accessibilityRole={"header"}
          accessibilityLabel={typeof title === "string" ? title : undefined}
        >
          <H4>{title}</H4>
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
