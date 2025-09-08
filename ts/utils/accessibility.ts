import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as O from "fp-ts/lib/Option";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Component, RefObject, useEffect, useState } from "react";
import { AccessibilityInfo, findNodeHandle } from "react-native";
import I18n from "i18next";
import { format } from "./dates";

/**
 * set the accessibility focus on the given {@param nodeReference}
 * use {@param executionDelay} to set focus with a delay
 * when the focus is set (or not) the {@param callback} will be executed
 * @param nodeReference
 * @param executionDelay
 * @param callback
 */
export const setAccessibilityFocus = <T extends Component>(
  nodeReference: RefObject<T | null>,
  executionDelay: Millisecond = 0 as Millisecond, // default: execute immediately,
  callback?: () => void
) => {
  setTimeout(() => {
    pipe(
      O.fromNullable(nodeReference && nodeReference.current),
      O.chain(ref => O.fromNullable(findNodeHandle(ref))), // nodeReference could be null or undefined
      O.map(reactTag => {
        // could raise an exception
        try {
          AccessibilityInfo.setAccessibilityFocus(reactTag);
        } catch {
          // do nothing
        } finally {
          if (callback) {
            callback();
          }
        }
      })
    );
  }, executionDelay);
};

/**
 * return a Promise where true means there is a screen reader active (VoiceOver / TalkBack)
 */
export const isScreenReaderEnabled = async (): Promise<boolean> =>
  await pipe(
    TE.tryCatch(
      () => AccessibilityInfo.isScreenReaderEnabled(),
      errorMsg => new Error(String(errorMsg))
    ),
    TE.getOrElse(() => T.of(false))
  )();

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
  dateFormat: string = I18n.t("global.accessibility.dateFormat")
) => `${format(date, dateFormat)}`;

export const hoursAndMinutesToAccessibilityReadableFormat = (date: Date) =>
  dateToAccessibilityReadableFormat(date, "HH:mm");

/**
 * This function is used to get the text that will be read by the screen reader
 * with the correct minus symbol pronunciation.
 */
export const getAccessibleAmountText = (amount?: string) =>
  pipe(
    amount,
    O.fromNullable,
    O.map(amountText =>
      amountText.replace("-", I18n.t("global.accessibility.minusSymbol"))
    ),
    O.getOrElseW(() => undefined)
  );

export const getListItemAccessibilityLabelCount = (
  total: number,
  index: number,
  excludeComma = false
) =>
  `${excludeComma ? "" : ", "}${I18n.t("global.accessibility.list.counter", {
    index: index + 1,
    total
  })}`;
