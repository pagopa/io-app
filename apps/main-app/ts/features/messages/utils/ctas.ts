import FM, { FrontMatterResult } from "front-matter";
import { Linking } from "react-native";

import { MessageBodyMarkdown } from "../../../../definitions/communication/MessageBodyMarkdown";
import { ServiceId } from "../../../../definitions/services/ServiceId";
import { ServiceMetadata } from "../../../../definitions/services/ServiceMetadata";
import {
  deriveCustomHandledLink,
  isIoInternalLink
} from "../../../components/ui/Markdown/handlers/link";
import { localeFallback } from "../../../i18n";
import {
  CTA,
  CTAS,
  LocalizedCTALocales,
  LocalizedCTAs
} from "../../../types/LocalizedCTAs";
import { isTestEnv } from "../../../utils/environment";
import {
  getInternalRoute,
  handleInternalLink
} from "../../../utils/internalLink";
import { getLocalePrimaryWithFallback } from "../../../utils/locale";
import { isFIMSLink } from "../../fims/singleSignOn/utils";
import { trackCTAFrontMatterDecodingError } from "../analytics";

export type CTAActionType =
  | "fims"
  | "io_handled_link"
  | "io_internal_link"
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
    const customHandledAction = deriveCustomHandledLink(cta.action);
    if (customHandledAction != null) {
      Linking.openURL(customHandledAction).catch(() => 0);
    }
  }
};

/**
 * Since remote payload can have a subset of supported locales, this function
 * return the locale supported by the app. If the remote locale is not supported
 * a fallback will be returned
 */
export const getRemoteLocale = (): LocalizedCTALocales => {
  const locale = getLocalePrimaryWithFallback();
  const isValidLocale = LocalizedCTALocales.is(locale);

  return isValidLocale ? locale : localeFallback.locale;
};

/**
 * Extract the CTAs if they are nested inside the message markdown content. The
 * returned CTAs are already localized.
 *
 * @param markdown
 * @param serviceMetadata
 * @param serviceId
 */
export const getMessageCTAs = (
  markdown: MessageBodyMarkdown | string,
  serviceId: ServiceId
): CTAS | undefined => getCTAsIfValid(markdown, serviceId);

/**
 * Extract the CTAs from a string given in serviceMetadata such as the
 * front-matter of the message if some CTAs are been found, the localized
 * version will be returned
 *
 * @param serviceMetadata
 */
export const getServiceCTAs = (
  serviceId: ServiceId,
  serviceMetadata?: ServiceMetadata
): CTAS | undefined => {
  const serviceCta = serviceMetadata?.cta;
  return serviceCta != null ? getCTAsIfValid(serviceCta, serviceId) : undefined;
};

/**
 * Remove the cta front-matter if it is nested inside the markdown
 *
 * @param markdown
 */
export const removeCTAsFromMarkdown = (
  markdownText: MessageBodyMarkdown | string,
  serviceId: ServiceId
) => {
  const result = parseFrontMatter(markdownText, serviceId);
  if (result.status === "failure") {
    return undefined;
  }
  if (result.status === "no-header") {
    return markdownText;
  }
  return result.frontMatter.body;
};

const getCTAsIfValid = (
  frontMatterText: string | undefined,
  serviceId: ServiceId
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

  if (areCTAsActionsValid(ctas, serviceId)) {
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
  const result = parseFrontMatter<LocalizedCTAs>(frontMatterText, serviceId);
  return result.status === "success"
    ? result.frontMatter.attributes
    : undefined;
};

export const ctasFromLocalizedCTAs = (
  localizedCTAs: LocalizedCTAs | undefined,
  serviceId: ServiceId
): CTAS | undefined => {
  if (localizedCTAs == null) {
    return undefined;
  }
  const typeUncheckedCTAs = localizedCTAs[getRemoteLocale()];
  const isValidCtas = CTAS.is(typeUncheckedCTAs);
  if (!isValidCtas) {
    trackCTAFrontMatterDecodingError(
      "A failure occoured while decoding from Localized CTAS to specific CTAs",
      serviceId
    );
    return undefined;
  }
  return typeUncheckedCTAs;
};

/**
 * Return true if at least one of the CTAs is valid
 *
 * @param ctas
 * @param serviceMetadata
 */
const areCTAsActionsValid = (ctas: CTAS, serviceId: ServiceId): boolean => {
  const isCTA1Valid = isCtaActionValid(ctas.cta_1);
  if (!isCTA1Valid) {
    trackCTAFrontMatterDecodingError(
      "The first CTA does not contain a supported action",
      serviceId
    );
  }

  if (ctas.cta_2 == null) {
    return isCTA1Valid;
  }
  const isCTA2Valid = isCtaActionValid(ctas.cta_2);
  if (!isCTA2Valid) {
    trackCTAFrontMatterDecodingError(
      "The second CTA does not contain a supported action",
      serviceId
    );
  }
  return isCTA1Valid || isCTA2Valid;
};

/**
 * Return a boolean indicating if the cta action is valid or not Checks on
 * servicesMetadata for defined parameter based on predicates defined in
 * internalRoutePredicates map
 *
 * @param cta
 */
const isCtaActionValid = (cta: CTA): boolean => {
  // check if it is an internal navigation
  if (isIoInternalLink(cta.action)) {
    return true;
  }

  if (isFIMSLink(cta.action)) {
    try {
      const url = new URL(cta.action);
      return url !== undefined;
    } catch {
      return false;
    }
  }

  // check if it is a custom action (it should be composed in a specific format)
  const maybeCustomHandledAction = deriveCustomHandledLink(cta.action);
  return maybeCustomHandledAction != null;
};

type FrontMatterParseResult<T> =
  | { frontMatter: FrontMatterResult<T>; status: "success" }
  | { status: "failure" }
  | { status: "no-header" };

const parseFrontMatter = <T>(
  input: string,
  serviceId: ServiceId
): FrontMatterParseResult<T> => {
  try {
    if (!FM.test(input)) {
      return { status: "no-header" };
    }
  } catch {
    trackCTAFrontMatterDecodingError(
      "A failure occoured while testing for front matter",
      serviceId
    );
    return { status: "failure" };
  }
  try {
    return { status: "success", frontMatter: FM<T>(input) };
  } catch {
    trackCTAFrontMatterDecodingError(
      "A failure occourred while parsing or extracting front matter",
      serviceId
    );
    return { status: "failure" };
  }
};

export const testable = isTestEnv
  ? {
      areCTAsActionsValid,
      parseFrontMatter,
      ctasFromLocalizedCTAs,
      getCTAsIfValid,
      isCtaActionValid
    }
  : undefined;
