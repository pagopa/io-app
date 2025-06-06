import { memo } from "react";
import { View } from "react-native";
import { Body } from "@pagopa/io-app-design-system";
import * as Sentry from "@sentry/react-native";
import { useIOSelector } from "../../store/hooks";
import { isScreenReaderEnabledSelector } from "../../store/reducers/preferences";
import I18n from "../../i18n";
import { IOMarkdownRenderRules } from "./types";
import {
  getRenderMarkdown,
  parse,
  sanitizeMarkdownForImages,
  sanitizeMarkdownNewlines
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
  /**
   * If `true`, the component will render the markdown content sanitizing the new line markers.
   * If `false`, it will render the markdown content as it has been received.
   * Defaults to `true`.
   */
  sanitizeNewLines?: boolean;
};

/**
 * This component parses a markdown string and render it using the `DS` components.
 *
 * It's possible to override every single rule by passing a custom `rules` object.
 */
const UnsafeIOMarkdown = ({
  content,
  rules,
  sanitizeNewLines
}: UnsafeProps) => {
  const screenReaderEnabled = useIOSelector(isScreenReaderEnabledSelector);

  // Sanitize the markdown content to avoid issues with newlines
  // that should not affect the IO guidelines for markdown texts.
  const sanitizedContent = sanitizeNewLines
    ? sanitizeMarkdownNewlines(content)
    : content;
  const sanitizedMarkdown = sanitizeMarkdownForImages(sanitizedContent);
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

const IOMarkdown = ({
  content,
  rules,
  onError,
  sanitizeNewLines
}: IOMarkdownProps) => (
  <Sentry.ErrorBoundary
    fallback={
      <View>
        <Body>{I18n.t("global.markdown.decodeError")}</Body>
      </View>
    }
    onError={onError}
  >
    <UnsafeIOMarkdown
      content={content}
      rules={rules}
      sanitizeNewLines={sanitizeNewLines}
    />
  </Sentry.ErrorBoundary>
);
export default memo(IOMarkdown);
