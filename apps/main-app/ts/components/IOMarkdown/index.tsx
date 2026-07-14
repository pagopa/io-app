import { memo } from "react";
import { View } from "react-native";
import { Body } from "@io-app/design-system";
import I18n from "i18next";
import { useIOSelector } from "../../store/hooks";
import { isScreenReaderEnabledSelector } from "../../store/reducers/preferences";
import ErrorBoundary from "../error/ErrorBoundary";
import { IOMarkdownRenderRules } from "./types";
import {
  convertReferenceLinksToInline,
  getRenderMarkdown,
  parse,
  sanitizeMarkdownForImages,
  sanitizeMarkdownFromFormFeed
} from "./markdownRenderer";
import { DEFAULT_RULES } from "./renderRules";

type UnsafeProps = Omit<IOMarkdownProps, "onError">;

export type IOMarkdownProps = {
  /**
   * The `markdown` string to render.
   */
  content: string;
  onError?: (error: unknown, componentStack: string | undefined) => void;
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

  const sanitizedFormFeedContent = sanitizeMarkdownFromFormFeed(content);
  const inlineLinkMarkdown = convertReferenceLinksToInline(
    sanitizedFormFeedContent
  );
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

const IOMarkdownComponent = ({ content, rules, onError }: IOMarkdownProps) => (
  <ErrorBoundary
    fallback={
      <View>
        <Body>{I18n.t("global.markdown.decodeError")}</Body>
      </View>
    }
    onError={onError}
  >
    <UnsafeIOMarkdown content={content} rules={rules} />
  </ErrorBoundary>
);

/**
 * @deprecated Use `IOMarkdown` or `IOMarkdownLite` from `@io-app/design-system` instead.
 * Remaining usages with custom render rules need to be tested against the DS version before migrating.
 */
const IOMarkdown = memo(IOMarkdownComponent);
export default IOMarkdown;
