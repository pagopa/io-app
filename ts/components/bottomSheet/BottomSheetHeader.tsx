import { H4, IconButton, IOVisualCostants } from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import {
  createRef,
  FunctionComponent,
  isValidElement,
  ReactNode,
  useEffect
} from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import { setAccessibilityFocus } from "../../utils/accessibility";

const styles = StyleSheet.create({
  bottomSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    paddingTop: IOVisualCostants.appMarginDefault,
    paddingBottom: IOVisualCostants.appMarginDefault
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
          style={{ flex: 1 }}
          accessible={true}
          accessibilityRole={"header"}
          accessibilityLabel={typeof title === "string" ? title : undefined}
        >
          <H4>{title}</H4>
        </View>
      )}
      <IconButton
        color="neutral"
        onPress={onClose}
        icon="closeMedium"
        accessibilityLabel={I18n.t("global.buttons.close")}
      />
    </View>
  );
};
