import { View } from "native-base";
import * as React from "react";
import { Modal } from "react-native";

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
