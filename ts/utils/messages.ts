/**
 * Generic utilities for messages
 */

import {
  fromNullable,
  fromPredicate,
  none,
  Option,
  some
} from "fp-ts/lib/Option";
import FM from "front-matter";
import { Linking } from "react-native";
import { Dispatch } from "redux";
import { CreatedMessageWithContent } from "../../definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithContentAndAttachments } from "../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { MessageBodyMarkdown } from "../../definitions/backend/MessageBodyMarkdown";
import { PrescriptionData } from "../../definitions/backend/PrescriptionData";
import { Locales } from "../../locales/locales";
import {
  getInternalRoute,
  handleInternalLink
} from "../components/ui/Markdown/handlers/internalLink";
import { deriveCustomHandledLink } from "../components/ui/Markdown/handlers/link";
import I18n, { translations } from "../i18n";
import { CTA, CTAS, MessageCTA } from "../types/MessageCTA";
import { getExpireStatus } from "./dates";
import { getLocalePrimaryWithFallback } from "./locale";
import { isTextIncludedCaseInsensitive } from "./strings";

export function messageContainsText(
  message: CreatedMessageWithContentAndAttachments,
  searchText: string
) {
  return (
    isTextIncludedCaseInsensitive(message.content.subject, searchText) ||
    isTextIncludedCaseInsensitive(message.content.markdown, searchText)
  );
}

export function messageNeedsDueDateCTA(
  message: CreatedMessageWithContentAndAttachments
): boolean {
  return message.content.due_date !== undefined;
}

export function messageNeedsPaymentCTA(
  message: CreatedMessageWithContentAndAttachments
): boolean {
  return message.content.payment_data !== undefined;
}

export function messageNeedsCTABar(
  message: CreatedMessageWithContentAndAttachments
): boolean {
  return (
    messageNeedsDueDateCTA(message) ||
    messageNeedsPaymentCTA(message) ||
    getCTA(message).isSome()
  );
}

export const handleCtaAction = (cta: CTA, dispatch: Dispatch) => {
  const maybeInternalLink = getInternalRoute(cta.action);
  if (maybeInternalLink.isSome()) {
    handleInternalLink(dispatch, cta.action);
  } else {
    const maybeHandledAction = deriveCustomHandledLink(cta.action);
    if (maybeHandledAction.isSome()) {
      Linking.openURL(maybeHandledAction.value).catch(() => 0);
    }
  }
};

export const hasPrescriptionData = (
  message: CreatedMessageWithContentAndAttachments
): boolean => fromNullable(message.content.prescription_data).isSome();

type MessagePaymentUnexpirable = {
  kind: "UNEXPIRABLE";
  noticeNumber: NonNullable<
    CreatedMessageWithContentAndAttachments["content"]["payment_data"]
  >["notice_number"];
  amount: NonNullable<
    CreatedMessageWithContentAndAttachments["content"]["payment_data"]
  >["amount"];
};
export type ExpireStatus = "VALID" | "EXPIRING" | "EXPIRED";
type MessagePaymentExpirable = {
  kind: "EXPIRABLE";
  noticeNumber: NonNullable<
    CreatedMessageWithContentAndAttachments["content"]["payment_data"]
  >["notice_number"];
  amount: NonNullable<
    CreatedMessageWithContentAndAttachments["content"]["payment_data"]
  >["amount"];
  expireStatus: ExpireStatus;
  dueDate: Date;
};

export type MessagePaymentExpirationInfo =
  | MessagePaymentUnexpirable
  | MessagePaymentExpirable;

export function getMessagePaymentExpirationInfo(
  paymentData: NonNullable<
    CreatedMessageWithContentAndAttachments["content"]["payment_data"]
  >,
  dueDate?: Date
): MessagePaymentExpirationInfo {
  const { notice_number, amount, invalid_after_due_date } = paymentData;

  if (invalid_after_due_date && dueDate !== undefined) {
    const expireStatus = getExpireStatus(dueDate);

    return {
      kind: "EXPIRABLE",
      expireStatus,
      noticeNumber: notice_number,
      amount,
      dueDate
    };
  }

  return { kind: "UNEXPIRABLE", noticeNumber: notice_number, amount };
}

export const paymentExpirationInfo = (message: CreatedMessageWithContent) => {
  const { payment_data, due_date } = message.content;
  return fromNullable(payment_data).map(paymentData =>
    getMessagePaymentExpirationInfo(paymentData, due_date)
  );
};

export const isUnexpirable = (
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
): messagePaymentExpirationInfo is MessagePaymentExpirable =>
  messagePaymentExpirationInfo.kind === "UNEXPIRABLE";

export const isExpirable = (
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
): messagePaymentExpirationInfo is MessagePaymentExpirable =>
  messagePaymentExpirationInfo.kind === "EXPIRABLE";

export const isValid = (
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
) =>
  isExpirable(messagePaymentExpirationInfo) &&
  messagePaymentExpirationInfo.expireStatus === "VALID";

export const isExpiring = (
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
) =>
  isExpirable(messagePaymentExpirationInfo) &&
  messagePaymentExpirationInfo.expireStatus === "EXPIRING";

export const isExpired = (
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
) =>
  isExpirable(messagePaymentExpirationInfo) &&
  messagePaymentExpirationInfo.expireStatus === "EXPIRED";

/**
 * given a name, return the relative prescription data value if it corresponds to a field
 * @param message
 * @param name it should be a string nre | iup | prescriber_fiscal_code
 */
export const getPrescriptionDataFromName = (
  prescriptionData: PrescriptionData | undefined,
  name: string
): Option<string> => {
  return fromNullable(prescriptionData).fold(none, pd => {
    switch (name.toLowerCase()) {
      case "nre":
        return some(pd.nre);
      case "iup":
        return fromNullable(pd.iup);
      case "prescriber_fiscal_code":
        return fromNullable(pd.prescriber_fiscal_code);
    }
    return none;
  });
};

/**
 * extract the CTAs if they are nested inside the message markdown content
 * if some CTAs are been found, the localized version will be returned
 * @param message
 * @param locale
 */
export const getCTA = (
  message: CreatedMessageWithContent,
  locale: Locales = getLocalePrimaryWithFallback(I18n.currentLocale())
): Option<CTAS> => {
  return fromPredicate((t: string) => FM.test(t))(message.content.markdown)
    .map(m => FM<MessageCTA>(m).attributes)
    .chain(attrs =>
      CTAS.decode(attrs[locale]).fold(_ => {
        // fallback on the first locale available
        const fallback = translations.find(
          s => attrs[s as Locales] !== undefined
        );
        if (fallback) {
          return CTAS.decode(attrs[fallback as Locales]).fold(__ => none, some);
        }
        return none;
      }, some)
    );
};

/**
 * return a Promise indicating if the cta action is valid or not
 * @param cta
 */
export const isCtaActionValid = (cta: CTA): boolean => {
  // check if it is an internal navigation
  if (getInternalRoute(cta.action).isSome()) {
    return true;
  }
  const maybeCustomHandledAction = deriveCustomHandledLink(cta.action);
  // check if it is a custom action (it should be composed in a specific format)
  if (maybeCustomHandledAction.isSome()) {
    return true;
  }
  return false;
};

export const hasCtaValidActions = (ctas: CTAS): boolean => {
  const isCTA1Valid = isCtaActionValid(ctas.cta_1);
  if (ctas.cta_2 === undefined) {
    return isCTA1Valid;
  }
  const isCTA2Valid = isCtaActionValid(ctas.cta_2);
  return isCTA1Valid || isCTA2Valid;
};

export const hasCtaAndValidActions = (
  message: CreatedMessageWithContent
): boolean => getCTA(message).fold(false, c => hasCtaValidActions(c));

/**
 * remove the cta front-matter if it is nested inside the markdown
 * @param cta
 */
export const cleanMarkdownFromCTAs = (
  markdown: MessageBodyMarkdown
): string => {
  return fromPredicate((t: string) => FM.test(t))(markdown)
    .map(m => FM(m).body)
    .getOrElse(markdown as string);
};
