import { fromNullable } from "fp-ts/lib/Option";
import { tryCatch } from "fp-ts/lib/Task";
import { Millisecond } from "italia-ts-commons/lib/units";
import * as React from "react";
import {
  AccessibilityInfo,
  findNodeHandle,
  Platform,
  UIManager
} from "react-native";
import I18n from "../i18n";
import { format } from "./dates";

/**
 * set the accessibility focus on the given nodeReference
 * use executionDelay to set focus with a delay (to use within componentDidMount)
 * @param nodeReference
 * @param executionDelay
 */
export const setAccessibilityFocus = <T extends React.Component>(
  nodeReference: React.RefObject<T>,
  executionDelay: Millisecond = 0 as Millisecond, // default: execute immediately,
  callback?: () => void
) => {
  setTimeout(() => {
    fromNullable(nodeReference && nodeReference.current) // nodeReference could be null or undefined
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
        } else {
          // ios
          AccessibilityInfo.setAccessibilityFocus(reactTag);
        }
        if (callback) {
          callback();
        }
      });
  }, executionDelay);
};

/**
 * return a Promise where true means there is a screen reader active (VoiceOver / TalkBack)
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  const maybeReaderEnabled = await tryCatch(
    () => AccessibilityInfo.isScreenReaderEnabled(),
    errorMsg => new Error(String(errorMsg))
  ).run();
  return maybeReaderEnabled.getOrElse(false);
};

// return a string representing the date in a readable format
export const dateToAccessibilityReadbleFormat = (date: Date) =>
  `${format(date, I18n.t("global.accessibility.date_format"))}`;
