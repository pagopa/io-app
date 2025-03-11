/**
 * Generic utilities for messages
 */

import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { Predicate } from "fp-ts/lib/Predicate";
import { identity, pipe } from "fp-ts/lib/function";
import FM from "front-matter";
import { Linking } from "react-native";
import { MessageBodyMarkdown } from "../../../../definitions/backend/MessageBodyMarkdown";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ServiceMetadata } from "../../../../definitions/backend/ServiceMetadata";
import { Locales } from "../../../../locales/locales";
import {
  deriveCustomHandledLink,
  isIoFIMSLink,
  isIoInternalLink,
  removeFIMSPrefixFromUrl
} from "../../../components/ui/Markdown/handlers/link";
import { trackMessageCTAFrontMatterDecodingError } from "../analytics";
import { localeFallback } from "../../../i18n";
import NavigationService from "../../../navigation/NavigationService";
import { CTA, CTAS, MessageCTA, MessageCTALocales } from "../types/MessageCTA";
import {
  getInternalRoute,
  handleInternalLink
} from "../../../utils/internalLink";
import { getLocalePrimaryWithFallback } from "../../../utils/locale";
import { FIMS_ROUTES } from "../../fims/common/navigation";
import { isTestEnv } from "../../../utils/environment";

export type CTAActionType =
  | "io_handled_link"
  | "io_internal_link"
  | "fims"
  | "none";

export const handleCtaAction = (
  cta: CTA,
  linkTo: (path: string) => void,
  preActionCallback?: (actionType: CTAActionType) => void
) => {
  if (isIoInternalLink(cta.action)) {
    preActionCallback?.("io_internal_link");
    const convertedLink = getInternalRoute(cta.action);
    handleInternalLink(linkTo, `${convertedLink}`);
    return;
  } else if (isIoFIMSLink(cta.action)) {
    preActionCallback?.("fims");
    const url = removeFIMSPrefixFromUrl(cta.action);
    NavigationService.navigate(FIMS_ROUTES.MAIN, {
      screen: FIMS_ROUTES.CONSENTS,
      params: {
        ctaText: cta.text,
        ctaUrl: url
      }
    });
    return;
  } else {
    const maybeHandledAction = deriveCustomHandledLink(cta.action);
    if (E.isRight(maybeHandledAction)) {
      preActionCallback?.("io_handled_link");
      Linking.openURL(maybeHandledAction.right.url).catch(() => 0);
      return;
    }
  }
  preActionCallback?.("none");
};

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

/**
 * Extract the CTAs if they are nested inside the message markdown content.
 * The returned CTAs are already localized.
 * @param markdown
 * @param serviceMetadata
 * @param serviceId
 */
export const getMessageCTA = (
  markdown: MessageBodyMarkdown | string,
  serviceMetadata?: ServiceMetadata,
  serviceId?: ServiceId
): CTAS | undefined => getCTAIfValid(markdown, serviceMetadata, serviceId);

/**
 * extract the CTAs from a string given in serviceMetadata such as the front-matter of the message
 * if some CTAs are been found, the localized version will be returned
 * @param serviceMetadata
 */
export const getServiceCTA = (
  serviceMetadata?: ServiceMetadata
): CTAS | undefined => getCTAIfValid(serviceMetadata?.cta, serviceMetadata);

/**
 * remove the cta front-matter if it is nested inside the markdown
 * @param markdown
 */
export const cleanMarkdownFromCTAs = (
  markdown: MessageBodyMarkdown | string
): string => {
  const isValidMarkdown = safeContainsFronMatter(markdown);
  if (!isValidMarkdown) {
    return markdown;
  }
  return safeExtractBodyAfterFrontMatter(markdown);
};

const getCTAIfValid = (
  text: string | undefined,
  serviceMetadata?: ServiceMetadata,
  serviceId?: ServiceId
): CTAS | undefined => {
  const unsafeMessageCTA = unsafeMessageCTAFromInput(text);
  if (unsafeMessageCTA == null) {
    trackMessageCTAFrontMatterDecodingError(serviceId);
    return undefined;
  }

  const safeCTAS = ctaFromMessageCTA(unsafeMessageCTA);
  if (safeCTAS == null) {
    trackMessageCTAFrontMatterDecodingError(serviceId);
    return undefined;
  }

  if (hasCtaValidActions(safeCTAS, serviceMetadata)) {
    return safeCTAS;
  }

  return undefined;
};

export const unsafeMessageCTAFromInput = (
  input: string | undefined
): MessageCTA | undefined => {
  if (input == null) {
    return undefined;
  }
  const isValidFrontMatter = safeContainsFronMatter(input);
  if (!isValidFrontMatter) {
    return undefined;
  }
  try {
    const frontMatter = FM<MessageCTA>(input);
    return frontMatter.attributes;
  } catch {
    return undefined;
  }
};

export const ctaFromMessageCTA = (
  messageCTA: MessageCTA | undefined
): CTAS | undefined => {
  if (messageCTA == null) {
    return undefined;
  }
  const unsafeCTAs = messageCTA[getRemoteLocale()];
  const decodedCTAS = CTAS.decode(unsafeCTAs);
  if (E.isRight(decodedCTAS)) {
    return decodedCTAS.right;
  }
  return undefined;
};

/**
 * return true if at least one of the CTAs is valid
 * @param ctas
 * @param serviceMetadata
 */
const hasCtaValidActions = (
  ctas: CTAS,
  serviceMetadata?: ServiceMetadata
): boolean => {
  const isCTA1Valid = isCtaActionValid(ctas.cta_1, serviceMetadata);
  if (isCTA1Valid) {
    return true;
  }
  return ctas.cta_2 != null && isCtaActionValid(ctas.cta_2, serviceMetadata);
};

/**
 * return a boolean indicating if the cta action is valid or not
 * Checks on servicesMetadata for defined parameter based on predicates defined in internalRoutePredicates map
 * @param cta
 * @param serviceMetadata
 */
const isCtaActionValid = (
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
  if (isIoFIMSLink(cta.action)) {
    return pipe(
      E.tryCatch(
        () => new URL(cta.action),
        () => false
      ),
      E.fold(identity, _ => true)
    );
  }
  // check if it is a custom action (it should be composed in a specific format)
  const maybeCustomHandledAction = deriveCustomHandledLink(cta.action);
  return E.isRight(maybeCustomHandledAction);
};

const safeContainsFronMatter = (input: string): boolean => {
  try {
    return FM.test(input);
  } catch {
    return false;
  }
};

const safeExtractBodyAfterFrontMatter = (input: string): string => {
  try {
    const frontMatter = FM(input);
    return frontMatter.body;
  } catch {
    return input;
  }
};

export const testable = isTestEnv
  ? {
      getCTAIfValid,
      hasCtaValidActions,
      hasMetadataTokenName,
      internalRoutePredicates,
      isCtaActionValid,
      safeContainsFronMatter,
      safeExtractBodyAfterFrontMatter
    }
  : undefined;
