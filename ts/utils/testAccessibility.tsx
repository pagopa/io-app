import { AccessibilityInfo } from "react-native";

export function mockAccessibilityInfo(boldTextEnabled: boolean = false) {
  jest
    .spyOn(AccessibilityInfo, "isBoldTextEnabled")
    .mockImplementation(() => Promise.resolve(boldTextEnabled));
}
