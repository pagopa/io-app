import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { Predicate } from "fp-ts/lib/Predicate";
import { identity, pipe } from "fp-ts/lib/function";
import FM from "front-matter";
import { Linking } from "react-native";
import { MessageBodyMarkdown } from "../../../../definitions/backend/MessageBodyMarkdown";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ServiceMetadata } from "../../../../definitions/services/ServiceMetadata";
import { Locales } from "../../../../locales/locales";
import {
  deriveCustomHandledLink,
  isIoInternalLink
} from "../../../components/ui/Markdown/handlers/link";
import { trackCTAFrontMatterDecodingError } from "../analytics";
import { localeFallback } from "../../../i18n";
import {
  CTA,
  CTAS,
  LocalizedCTAs,
  LocalizedCTALocales
} from "../../../types/LocalizedCTAs";
import {
  getInternalRoute,
  handleInternalLink
} from "../../../utils/internalLink";
import { getLocalePrimaryWithFallback } from "../../../utils/locale";
import { isTestEnv } from "../../../utils/environment";
import { isFIMSLink } from "../../fims/singleSignOn/utils";

export type CTAActionType =
  | "io_handled_link"
  | "io_internal_link"
  | "fims"
  | "none";

export const handleCtaAction = (
  cta: CTA,
  linkTo: (path: string) => void,
  fimsCallback: (label: string, url: string) => void
) => {
  if (isIoInternalLink(cta.action)) {
    const convertedLink = getInternalRoute(cta.action);
    handleInternalLink(linkTo, `${convertedLink}`);
  } else if (isFIMSLink(cta.action)) {
    fimsCallback(cta.text, cta.action);
  } else {
    const maybeHandledAction = deriveCustomHandledLink(cta.action);
    if (E.isRight(maybeHandledAction)) {
      Linking.openURL(maybeHandledAction.right.url).catch(() => 0);
    }
  }
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
export const getRemoteLocale = (): Extract<Locales, LocalizedCTALocales> =>
  pipe(
    getLocalePrimaryWithFallback(),
    LocalizedCTALocales.decode,
    E.getOrElseW(() => localeFallback.locale)
  );

/**
 * Extract the CTAs if they are nested inside the message markdown content.
 * The returned CTAs are already localized.
 * @param markdown
 * @param serviceMetadata
 * @param serviceId
 */
export const getMessageCTAs = (
  markdown: MessageBodyMarkdown | string,
  serviceId: ServiceId,
  serviceMetadata?: ServiceMetadata
): CTAS | undefined => getCTAsIfValid(markdown, serviceId, serviceMetadata);

/**
 * extract the CTAs from a string given in serviceMetadata such as the front-matter of the message
 * if some CTAs are been found, the localized version will be returned
 * @param serviceMetadata
 */
export const getServiceCTAs = (
  serviceId: ServiceId,
  serviceMetadata?: ServiceMetadata
): CTAS | undefined => {
  const serviceCta = serviceMetadata?.cta;
  return serviceCta != null
    ? getCTAsIfValid(serviceCta, serviceId, serviceMetadata)
    : undefined;
};

/**
 * remove the cta front-matter if it is nested inside the markdown
 * @param markdown
 */
export const removeCTAsFromMarkdown = (
  markdownText: MessageBodyMarkdown | string,
  serviceId: ServiceId
): E.Either<string, string> => {
  const isValidFrontMatterHeaderEither = containsFrontMatterHeader(
    markdownText,
    serviceId
  );
  if (E.isLeft(isValidFrontMatterHeaderEither)) {
    return E.left(markdownText);
  }
  const hasFrontMatterHeader = isValidFrontMatterHeaderEither.right;
  if (!hasFrontMatterHeader) {
    return E.right(markdownText);
  }
  return extractBodyAfterFrontMatter(markdownText, serviceId);
};

const getCTAsIfValid = (
  frontMatterText: string | undefined,
  serviceId: ServiceId,
  serviceMetadata?: ServiceMetadata
): CTAS | undefined => {
  const localizedCTAs = localizedCTAsFromFrontMatter(
    frontMatterText,
    serviceId
  );
  if (localizedCTAs == null) {
    return undefined;
  }

  const ctas = ctasFromLocalizedCTAs(localizedCTAs, serviceId);
  if (ctas == null) {
    return undefined;
  }

  if (areCTAsActionsValid(ctas, serviceId, serviceMetadata)) {
    return ctas;
  }

  return undefined;
};

export const localizedCTAsFromFrontMatter = (
  frontMatterText: string | undefined,
  serviceId: ServiceId
): LocalizedCTAs | undefined => {
  if (frontMatterText == null) {
    return undefined;
  }
  const isValidFrontMatterHeaderEither = containsFrontMatterHeader(
    frontMatterText,
    serviceId
  );
  if (E.isLeft(isValidFrontMatterHeaderEither)) {
    return undefined;
  }
  const isValidFrontMatterHeader = isValidFrontMatterHeaderEither.right;
  if (!isValidFrontMatterHeader) {
    return undefined;
  }
  try {
    const frontMatter = FM<LocalizedCTAs>(frontMatterText);
    return frontMatter.attributes;
  } catch {
    trackCTAFrontMatterDecodingError(
      "A failure occourred while parsing or extracting front matter",
      serviceId
    );
    return undefined;
  }
};

export const ctasFromLocalizedCTAs = (
  localizedCTAs: LocalizedCTAs | undefined,
  serviceId: ServiceId
): CTAS | undefined => {
  if (localizedCTAs == null) {
    return undefined;
  }
  const typeUncheckedCTAs = localizedCTAs[getRemoteLocale()];
  const decodedCTAsResult = CTAS.decode(typeUncheckedCTAs);
  if (E.isRight(decodedCTAsResult)) {
    return decodedCTAsResult.right;
  }
  trackCTAFrontMatterDecodingError(
    "A failure occoured while decoding from Localized CTAS to specific CTAs",
    serviceId
  );
  return undefined;
};

/**
 * return true if at least one of the CTAs is valid
 * @param ctas
 * @param serviceMetadata
 */
const areCTAsActionsValid = (
  ctas: CTAS,
  serviceId: ServiceId,
  serviceMetadata?: ServiceMetadata
): boolean => {
  const isCTA1Valid = isCtaActionValid(ctas.cta_1, serviceMetadata);
  if (!isCTA1Valid) {
    trackCTAFrontMatterDecodingError(
      "The first CTA does not contain a supported action",
      serviceId
    );
  }

  if (ctas.cta_2 == null) {
    return isCTA1Valid;
  }
  const isCTA2Valid = isCtaActionValid(ctas.cta_2, serviceMetadata);
  if (!isCTA2Valid) {
    trackCTAFrontMatterDecodingError(
      "The second CTA does not contain a supported action",
      serviceId
    );
  }
  return isCTA1Valid || isCTA2Valid;
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
  if (isFIMSLink(cta.action)) {
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

const containsFrontMatterHeader = (
  input: string,
  serviceId: ServiceId
): E.Either<void, boolean> => {
  try {
    return E.right(FM.test(input));
  } catch {
    trackCTAFrontMatterDecodingError(
      "A failure occoured while testing for front matter",
      serviceId
    );
    return E.left(undefined);
  }
};

const extractBodyAfterFrontMatter = (
  text: string,
  serviceId: ServiceId
): E.Either<string, string> => {
  try {
    const frontMatter = FM(text);
    return E.right(frontMatter.body);
  } catch (e) {
    trackCTAFrontMatterDecodingError(
      "A failure occourred while parsing or extracting body from input with front matter",
      serviceId
    );
    return E.left(text);
  }
};

export const testable = isTestEnv
  ? {
      areCTAsActionsValid,
      containsFrontMatterHeader,
      ctasFromLocalizedCTAs,
      extractBodyAfterFrontMatter,
      getCTAsIfValid,
      hasMetadataTokenName,
      internalRoutePredicates,
      isCtaActionValid
    }
  : undefined;
