/**
 * Generic utilities for messages
 */

import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { Predicate } from "fp-ts/lib/Predicate";
import FM from "front-matter";
import { Linking } from "react-native";
import { identity, pipe } from "fp-ts/lib/function";
import { CreatedMessageWithContentAndAttachments } from "../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { MessageBodyMarkdown } from "../../definitions/backend/MessageBodyMarkdown";
import { PrescriptionData } from "../../definitions/backend/PrescriptionData";
import {
  getInternalRoute,
  handleInternalLink
} from "../components/ui/Markdown/handlers/internalLink";
import {
  deriveCustomHandledLink,
  isIoInternalLink
} from "../components/ui/Markdown/handlers/link";
import { CTA, CTAS, MessageCTA, MessageCTALocales } from "../types/MessageCTA";
import { localeFallback } from "../i18n";
import { Locales } from "../../locales/locales";
import { ServiceId } from "../../definitions/backend/ServiceId";
import { CreatedMessageWithContent } from "../../definitions/backend/CreatedMessageWithContent";
import { ServiceMetadata } from "../../definitions/backend/ServiceMetadata";
import { ServicePublic } from "../../definitions/backend/ServicePublic";
import ROUTES from "../navigation/routes";
import { trackMessageCTAFrontMatterDecodingError } from "../features/messages/analytics";
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

export function hasMessagePaymentData(
  message: CreatedMessageWithContentAndAttachments
): boolean {
  return message.content.payment_data !== undefined;
}

export function messageNeedsCTABar(
  message: CreatedMessageWithContentAndAttachments
): boolean {
  return (
    message.content.eu_covid_cert !== undefined || // eucovid data
    messageNeedsDueDateCTA(message) ||
    hasMessagePaymentData(message) ||
    O.isSome(getCTA(message))
  );
}

export const handleCtaAction = (
  cta: CTA,
  linkTo: (path: string) => void,
  service?: ServicePublic
) => {
  if (isIoInternalLink(cta.action)) {
    const convertedLink = getInternalRoute(cta.action);
    // the service ID is specifically required for MyPortal webview usage,
    // not required for other internal screens
    if (cta.action.indexOf(ROUTES.SERVICE_WEBVIEW) !== -1) {
      handleInternalLink(
        linkTo,
        `${convertedLink}${
          service ? "&serviceId=" + (service.service_id as string) : ""
        }`
      );
      return;
    }
    handleInternalLink(linkTo, `${convertedLink}`);
  } else {
    const maybeHandledAction = deriveCustomHandledLink(cta.action);
    if (E.isRight(maybeHandledAction)) {
      Linking.openURL(maybeHandledAction.right.url).catch(() => 0);
    }
  }
};

export const hasPrescriptionData = (
  message: CreatedMessageWithContent
): boolean => pipe(message.content.prescription_data, O.fromNullable, O.isSome);

type MessagePaymentUnexpirable = {
  kind: "UNEXPIRABLE";
  expireStatus?: ExpireStatus;
  dueDate?: Date;
};
export type ExpireStatus = "VALID" | "EXPIRING" | "EXPIRED";
type MessagePaymentExpirable = {
  kind: "EXPIRABLE";
  expireStatus: ExpireStatus;
  dueDate: Date;
};

export type MessagePaymentExpirationInfo =
  | MessagePaymentUnexpirable
  | MessagePaymentExpirable;

/**
 * Given a payment data and a due date return an object that specifies if the data are expirable or not.
 * There are 3 cases:
 *  - if the due date is undefined -> the message is unexpirable
 *  - if the due date is defined and the message is valid after the due date -> the message is expirable
 * - if the due date is defined and the message is invalid after the due date -> the message is unexpirable
 * @param paymentData
 * @param dueDate -> optional
 */
export function getMessagePaymentExpirationInfo(
  paymentData: NonNullable<
    CreatedMessageWithContentAndAttachments["content"]["payment_data"]
  >,
  dueDate?: Date
): MessagePaymentExpirationInfo {
  const { invalid_after_due_date } = paymentData;

  if (dueDate !== undefined) {
    const expireStatus = getExpireStatus(dueDate);

    return {
      kind: invalid_after_due_date ? "EXPIRABLE" : "UNEXPIRABLE",
      expireStatus,
      dueDate
    };
  }

  return {
    kind: "UNEXPIRABLE"
  };
}

/**
 * Given a message return an object of type MessagePaymentExpirationInfo
 * @param message
 */
export const paymentExpirationInfo = (
  message: CreatedMessageWithContentAndAttachments
): O.Option<MessagePaymentExpirationInfo> => {
  const { payment_data, due_date } = message.content;
  return pipe(
    payment_data,
    O.fromNullable,
    O.map(paymentData => getMessagePaymentExpirationInfo(paymentData, due_date))
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
) => messagePaymentExpirationInfo.expireStatus === "EXPIRING";

export const isExpired = (
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo
) => messagePaymentExpirationInfo.expireStatus === "EXPIRED";

/**
 * given a name, return the relative prescription data value if it corresponds to a field
 * @param prescriptionData
 * @param name it should be a string nre | iup | prescriber_fiscal_code
 */
export const getPrescriptionDataFromName = (
  prescriptionData: PrescriptionData | undefined,
  name: string
): O.Option<string> =>
  pipe(
    prescriptionData,
    O.fromNullable,
    O.fold(
      () => O.none,
      pd => {
        switch (name.toLowerCase()) {
          case "nre":
            return O.some(pd.nre);
          case "iup":
            return O.fromNullable(pd.iup);
          case "prescriber_fiscal_code":
            return O.fromNullable(pd.prescriber_fiscal_code);
        }
        return O.none;
      }
    )
  );

const hasMetadataTokenName = (metadata?: ServiceMetadata): boolean =>
  metadata?.token_name !== undefined;

// a mapping between routes name (the key) and predicates (the value)
// the predicate says if for that specific route the navigation is allowed
const internalRoutePredicates: Map<
  string,
  Predicate<ServiceMetadata | undefined>
> = new Map<string, Predicate<ServiceMetadata | undefined>>([
  ["/services/webview", hasMetadataTokenName]
]);

/**
 * since remote payload can have a subset of supported locales, this function
 * return the locale supported by the app. If the remote locale is not supported
 * a fallback will be returned
 */
export const getRemoteLocale = (): Extract<Locales, MessageCTALocales> =>
  pipe(
    getLocalePrimaryWithFallback(),
    MessageCTALocales.decode,
    E.getOrElseW(() => localeFallback.locale)
  );

const extractCTA = (
  text: string,
  serviceMetadata?: ServiceMetadata,
  serviceId?: ServiceId
): O.Option<CTAS> =>
  pipe(
    text,
    FM.test,
    O.fromPredicate(identity),
    O.chainNullableK(() => {
      try {
        return FM<MessageCTA>(text).attributes;
      } catch (e) {
        trackMessageCTAFrontMatterDecodingError(serviceId);
        return null;
      }
    }),
    O.chain(attrs =>
      pipe(
        attrs[getRemoteLocale()],
        CTAS.decode,
        E.fold(
          _ => O.none,
          // check if the decoded actions are valid
          cta =>
            hasCtaValidActions(cta, serviceMetadata) ? O.some(cta) : O.none
        )
      )
    )
  );

/**
 * extract the CTAs if they are nested inside the message markdown content
 * if some CTAs are been found, the localized version will be returned
 * @deprecated please use getMessageCTA instead
 * @param message
 * @param serviceMetadata
 * @param serviceId
 */
export const getCTA = (
  message: CreatedMessageWithContentAndAttachments,
  serviceMetadata?: ServiceMetadata,
  serviceId?: ServiceId
): O.Option<CTAS> =>
  getMessageCTA(message.content.markdown, serviceMetadata, serviceId);

/**
 * Extract the CTAs if they are nested inside the message markdown content.
 * The returned CTAs are already localized.
 * @param markdown
 * @param serviceMetadata
 * @param serviceId
 */
export const getMessageCTA = (
  markdown: MessageBodyMarkdown,
  serviceMetadata?: ServiceMetadata,
  serviceId?: ServiceId
): O.Option<CTAS> => extractCTA(markdown, serviceMetadata, serviceId);

/**
 * extract the CTAs from a string given in serviceMetadata such as the front-matter of the message
 * if some CTAs are been found, the localized version will be returned
 * @param serviceMetadata
 */
export const getServiceCTA = (
  serviceMetadata?: ServiceMetadata
): O.Option<CTAS> =>
  pipe(
    serviceMetadata?.cta,
    O.fromNullable,
    O.chain(cta => extractCTA(cta, serviceMetadata))
  );

/**
 * return a boolean indicating if the cta action is valid or not
 * Checks on servicesMetadata for defined parameter based on predicates defined in internalRoutePredicates map
 * @param cta
 * @param serviceMetadata
 */
export const isCtaActionValid = (
  cta: CTA,
  serviceMetadata?: ServiceMetadata
): boolean => {
  // check if it is an internal navigation
  if (isIoInternalLink(cta.action)) {
    const internalRoute = getInternalRoute(cta.action);
    return pipe(
      internalRoutePredicates.get(internalRoute),
      O.fromNullable,
      O.map(f => f(serviceMetadata)),
      O.getOrElse(() => true)
    );
  }
  // check if it is a custom action (it should be composed in a specific format)
  const maybeCustomHandledAction = deriveCustomHandledLink(cta.action);
  return E.isRight(maybeCustomHandledAction);
};

/**
 * return true if at least one of the CTAs is valid
 * @param ctas
 * @param serviceMetadata
 */
export const hasCtaValidActions = (
  ctas: CTAS,
  serviceMetadata?: ServiceMetadata
): boolean => {
  const isCTA1Valid = isCtaActionValid(ctas.cta_1, serviceMetadata);
  if (ctas.cta_2 === undefined) {
    return isCTA1Valid;
  }
  const isCTA2Valid = isCtaActionValid(ctas.cta_2, serviceMetadata);
  return isCTA1Valid || isCTA2Valid;
};

/**
 * remove the cta front-matter if it is nested inside the markdown
 * @param markdown
 */
export const cleanMarkdownFromCTAs = (markdown: MessageBodyMarkdown): string =>
  pipe(
    markdown,
    FM.test,
    O.fromPredicate(identity),
    O.map(() => FM(markdown).body),
    O.getOrElse(() => markdown as string)
  );
