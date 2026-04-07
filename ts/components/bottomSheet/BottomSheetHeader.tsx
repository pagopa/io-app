import { H4, IconButton, IOVisualCostants } from "@pagopa/io-app-design-system";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "i18next";
import {
  createRef,
  FunctionComponent,
  isValidElement,
  ReactNode,
  useEffect
} from "react";
import { StyleSheet, View } from "react-native";

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
  onClose: () => void;
  title: ReactNode | string;
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
    <View ref={headerRef} style={styles.bottomSheetHeader}>
      {isValidElement(title) ? (
        title
      ) : (
        <View
          accessibilityLabel={typeof title === "string" ? title : undefined}
          accessibilityRole={"header"}
          accessible={true}
          style={{ flex: 1 }}
        >
          <H4>{title}</H4>
        </View>
      )}
      <IconButton
        accessibilityLabel={I18n.t("global.buttons.close")}
        color="neutral"
        icon="closeMedium"
        onPress={onClose}
      />
    </View>
  );
};
