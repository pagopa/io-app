import { memo } from "react";
import { View } from "react-native";
import { Body } from "@pagopa/io-app-design-system";
import * as Sentry from "@sentry/react-native";
import I18n from "i18next";
import { useIOSelector } from "../../store/hooks";
import { isScreenReaderEnabledSelector } from "../../store/reducers/preferences";
import { IOMarkdownRenderRules } from "./types";
import {
  convertReferenceLinksToInline,
  getRenderMarkdown,
  parse,
  sanitizeMarkdownForImages
} from "./markdownRenderer";
import { DEFAULT_RULES } from "./renderRules";

type UnsafeProps = Omit<IOMarkdownProps, "onError">;

export type IOMarkdownProps = {
  /**
   * The `markdown` string to render.
   */
  content: string;
  onError?:
    | ((
        error: unknown,
        componentStack: string | undefined,
        eventId: string
      ) => void)
    | undefined;
  /**
   * The render rules that can be used to override the `DEFAULT_RULES`.
   */
  rules?: Partial<IOMarkdownRenderRules>;
};

/**
 * This component parses a markdown string and render it using the `DS` components.
 *
 * It's possible to override every single rule by passing a custom `rules` object.
 */
const UnsafeIOMarkdown = ({ content, rules }: UnsafeProps) => {
  const screenReaderEnabled = useIOSelector(isScreenReaderEnabledSelector);

  const inlineLinkMarkdown = convertReferenceLinksToInline(content);
  const sanitizedMarkdown = sanitizeMarkdownForImages(inlineLinkMarkdown);
  const parsedContent = parse(sanitizedMarkdown);
  const renderMarkdown = getRenderMarkdown(
    {
      ...DEFAULT_RULES,
      ...(rules || {})
    },
    screenReaderEnabled
  );
  return <View>{parsedContent.map(renderMarkdown)}</View>;
};

const IOMarkdown = ({ content, rules, onError }: IOMarkdownProps) => (
  <Sentry.ErrorBoundary
    fallback={
      <View>
        <Body>{I18n.t("global.markdown.decodeError")}</Body>
      </View>
    }
    onError={onError}
  >
    <UnsafeIOMarkdown content={content} rules={rules} />
  </Sentry.ErrorBoundary>
);
export default memo(IOMarkdown);
