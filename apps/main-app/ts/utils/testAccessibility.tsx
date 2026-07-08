import { AccessibilityInfo } from "react-native";

export function mockAccessibilityInfo(boldTextEnabled = false) {
  jest
    .spyOn(AccessibilityInfo, "isBoldTextEnabled")
    .mockImplementation(() => Promise.resolve(boldTextEnabled));
}
