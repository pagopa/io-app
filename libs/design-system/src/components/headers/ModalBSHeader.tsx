import { createRef, isValidElement, ReactNode, useLayoutEffect } from "react";
import {
  AccessibilityInfo,
  findNodeHandle,
  StyleSheet,
  View
} from "react-native";
import { IOColors, IOVisualCostants } from "../../core";
import { IconButton } from "../buttons";
import { H4 } from "../typography";

const styles = StyleSheet.create({
  container: {
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
  closeAccessibilityLabel: string;
};

/**
 * A header for a modals and bottom sheet.
 * @param title - The title of the modal.
 * @param onClose - The function to call when the close button is pressed.
 * @param closeAccessibilityLabel - The accessibility label for the close button.
 *
 */
export const ModalBSHeader = ({
  title,
  onClose,
  closeAccessibilityLabel
}: Props) => {
  const headerRef = createRef<View>();

  useLayoutEffect(() => {
    const reactNode = findNodeHandle(headerRef.current);
    if (reactNode !== null) {
      AccessibilityInfo.setAccessibilityFocus(reactNode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container} ref={headerRef}>
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
        accessibilityLabel={closeAccessibilityLabel}
      />
    </View>
  );
};
