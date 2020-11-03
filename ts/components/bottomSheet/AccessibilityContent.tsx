import { View } from "native-base";
import * as React from "react";
import { Modal } from "react-native";

/**
 * Accessibility version of a BottomSheet including a header and it's content
 * @param header
 * @param content
 */
export const AccessibilityContent = (
  header: React.ReactNode,
  content: React.ReactNode
) => (
  <Modal>
    <View spacer={true} extralarge={true} />
    {header}
    {content}
  </Modal>
);
