import * as React from "react";
import { View, Modal } from "react-native";
import { VSpacer } from "../core/spacer/Spacer";
import { IOStyles } from "../core/variables/IOStyles";

type Props = {
  header: React.ReactNode;
  content: React.ReactNode;
};
/**
 * Accessibility version of a BottomSheet including a header and it's content
 * @param header
 * @param content
 */
export const AccessibilityContent = ({ header, content }: Props) => (
  <Modal>
    <VSpacer size={40} />
    {header}
    <View style={IOStyles.horizontalContentPadding}>{content}</View>
  </Modal>
);
