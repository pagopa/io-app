import { fromNullable } from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import {
  AccessibilityInfo,
  findNodeHandle,
  Platform,
  UIManager
} from "react-native";

// set the accessibility focus on the given node reference
export const setAccessibilityFocus = <T extends View>(
  nodeReference: React.RefObject<T>
) => {
  fromNullable(nodeReference.current)
    .chain(ref => fromNullable(findNodeHandle(ref)))
    .map(reactTag => {
      if (Platform.OS === "android") {
        // could raise an exception
        try {
          UIManager.sendAccessibilityEvent(
            reactTag,
            UIManager.AccessibilityEventTypes.typeViewFocused
          );
          // tslint:disable-next-line:no-empty
        } catch {} // ignore
        return;
      }
      // ios
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    });
};
