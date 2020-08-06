import { fromNullable } from "fp-ts/lib/Option";
import { tryCatch } from "fp-ts/lib/Task";
import { Millisecond } from "italia-ts-commons/lib/units";
import * as React from "react";
import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  findNodeHandle,
  Platform,
  UIManager
} from "react-native";
import I18n from "../i18n";
import { format } from "./dates";

/**
 * set the accessibility focus on the given {@param nodeReference}
 * use {@param executionDelay} to set focus with a delay
 * when the focus is set (or not) the {@param callback} will be executed
 * @param nodeReference
 * @param executionDelay
 * @param callback
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
        // could raise an exception
        try {
          if (Platform.OS === "android") {
            UIManager.sendAccessibilityEvent(
              reactTag,
              UIManager.AccessibilityEventTypes.typeViewFocused
            );
          } else {
            // ios
            AccessibilityInfo.setAccessibilityFocus(reactTag);
          }
        } catch {
          // do nothing
        } finally {
          if (callback) {
            callback();
          }
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

// return the state of the screen reader when the caller component is mounted
export const useScreenReaderEnabled = () => {
  const [screenReaderEnabled, setIscreenReaderEnabled] = useState(false);

  useEffect(() => {
    isScreenReaderEnabled()
      .then(setIscreenReaderEnabled)
      .catch(_ => setIscreenReaderEnabled(false));
  }, []);
  return screenReaderEnabled;
};

// return a string representing the date in a readable format
export const dateToAccessibilityReadableFormat = (
  date: Date,
  dateFormat: string = I18n.t("global.accessibility.date_format")
) => `${format(date, dateFormat)}`;

export const hoursAndMinutesToAccessibilityReadableFormat = (date: Date) =>
  dateToAccessibilityReadableFormat(date, "HH:mm");
