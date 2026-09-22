import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "i18next";
import { RefObject } from "react";
import { AccessibilityInfo, HostInstance } from "react-native";

import { format } from "./dates";

/**
 * Moves the screen reader focus onto `nodeReference` once `executionDelay` has elapsed.
 *
 * The node is read after the delay, so a reference that is no longer mounted
 * makes this a no-op and `callback` is not invoked.
 */
export const setAccessibilityFocus = (
  nodeReference: RefObject<HostInstance | null>,
  executionDelay: Millisecond = 0 as Millisecond, // default: execute immediately,
  callback?: () => void
) => {
  setTimeout(() => {
    const node = nodeReference.current;
    if (node == null) {
      return;
    }
    try {
      AccessibilityInfo.sendAccessibilityEvent(node, "focus");
    } catch {
      // focusing is best-effort: a native failure must not break the caller
    } finally {
      callback?.();
    }
  }, executionDelay);
};

/**
 * return a Promise where true means there is a screen reader active (VoiceOver / TalkBack)
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch {
    return false;
  }
};

// return a string representing the date in a readable format
export const dateToAccessibilityReadableFormat = (
  date: Date,
  dateFormat: string = I18n.t("global.accessibility.dateFormat")
) => `${format(date, dateFormat)}`;

export const hoursAndMinutesToAccessibilityReadableFormat = (date: Date) =>
  dateToAccessibilityReadableFormat(date, "HH:mm");

/**
 * Adds a single space between every character in a string.
 *
 * @param {string} str - The original string to be formatted.
 * @returns {string} A new string with spaces separating each character.
 */
export const formatStringToSpacedString = (str: string): string =>
  str.split("").join(" ");

/**
 * This function is used to get the text that will be read by the screen reader
 * with the correct minus symbol pronunciation.
 */
export const getAccessibleAmountText = (amount?: string) =>
  amount?.replace("-", I18n.t("global.accessibility.minusSymbol"));

export const getListItemAccessibilityLabelCount = (
  total: number,
  index: number,
  excludeComma = false
) =>
  `${excludeComma ? "" : ", "}${I18n.t("global.accessibility.list.counter", {
    index: index + 1,
    total
  })}`;
