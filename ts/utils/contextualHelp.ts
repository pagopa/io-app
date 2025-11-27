import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { ScreenCHData } from "../../definitions/content/ScreenCHData";
import { TranslationKeys } from "../../locales/locales";
import { ContextualHelpData } from "../features/zendesk/screens/ZendeskSupportHelpCenter";

export type ContextualHelpProps = {
  title: string;
  body: string;
};

export type ContextualHelpPropsMarkdown = {
  title: TranslationKeys;
  body: TranslationKeys;
};

/**
 * Create the object needed to ensure that the Contextual Help question mark is visible
 * when the Contextual Help is filled remotely.
 *
 */
export const emptyContextualHelp: ContextualHelpProps = {
  title: "",
  body: ""
};

/**
 * Extract a title and a body (ContextualHelpProps) if the contextualHelp or the contextualHelpMarkdown in input are defined,
 * otherwise returns undefined.
 * @param contextualHelp
 * @param contextualHelpMarkdown
 * @param onLoadEnd
 * @param onLinkClicked
 * @param shouldHandleLink
 */
export const getContextualHelpConfig = (
  contextualHelp: ContextualHelpProps | undefined,
  contextualHelpMarkdown: ContextualHelpPropsMarkdown | undefined
): ContextualHelpProps | undefined =>
  contextualHelp
    ? { body: contextualHelp.body, title: contextualHelp.title }
    : contextualHelpMarkdown
    ? {
        body: I18n.t(contextualHelpMarkdown.body as any),
        title: I18n.t(contextualHelpMarkdown.title as any)
      }
    : undefined;

/**
 If contextualData (loaded from the content server) contains the route of the current screen,
 title, content, faqs are read from it, otherwise they came from the locales stored in app
 */
export const getContextualHelpData = (
  maybeContextualData: O.Option<ScreenCHData>,
  defaultData: ContextualHelpData
): ContextualHelpData =>
  pipe(
    maybeContextualData,
    O.fold(
      () => defaultData,
      data => ({
        title: data.title,
        content: data.content,
        faqs: pipe(
          data.faqs,
          O.fromNullable,
          O
            // ensure the array is defined and not empty
            .chainNullableK(faqs => (faqs.length > 0 ? faqs : undefined)),
          O
            // if remote faqs are not defined or empty, fallback to the local ones
            .fold(
              () => defaultData.faqs,
              fqs => fqs.map(f => ({ title: f.title, content: f.body }))
            )
        )
      })
    )
  );

export const reloadContextualHelpDataThreshold = (30 * 1000) as Millisecond;
