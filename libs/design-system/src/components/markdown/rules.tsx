import React, { Fragment } from "react";
import { View } from "react-native";
import { Banner } from "../banner";
import { Divider, HSpacer, VSpacer } from "../layout";
import { Body } from "../typography/Body";
import { BodyMonospace } from "../typography/BodyMonospace";
import { H1 } from "../typography/H1";
import { H2 } from "../typography/H2";
import { H3 } from "../typography/H3";
import { H4 } from "../typography/H4";
import { H5 } from "../typography/H5";
import { H6 } from "../typography/H6";
import { IOText } from "../typography/IOText";
import { CodeBlock } from "./CodeBlock";
import { ImageRenderer } from "./ImageRenderer";
import type {
  MarkdownNode,
  MarkdownNodeType,
  RenderContext,
  RenderRule
} from "./types";
import {
  collectRawText,
  extractPictogramName,
  getOrderedListMarker,
  getUnorderedListBullet,
  isBrTag,
  stripPictogramPrefix
} from "./utils";

/* ─── Inline flattening (shared between heading and paragraph rendering) ─── */

type InlineStyle = {
  bold: boolean;
  italic: boolean;
  link?: string;
};

type StyledSegment = {
  key: string;
  text: string;
  style: InlineStyle;
};

/**
 * Recursively walks inline AST nodes and produces flat styled segments
 * with accumulated bold/italic/link state.
 */
const flattenInlineNodes = (
  nodes: ReadonlyArray<MarkdownNode>,
  inherited: InlineStyle
): Array<StyledSegment> =>
  nodes.reduce<Array<StyledSegment>>((acc, node) => {
    switch (node.type) {
      case "text":
      case "code_inline":
        return [
          ...acc,
          { key: node.key, text: node.content ?? "", style: inherited }
        ];

      case "softbreak":
      case "hardbreak":
        return [...acc, { key: node.key, text: "\n", style: inherited }];

      case "strong":
        return [
          ...acc,
          ...flattenInlineNodes(node.children, {
            ...inherited,
            bold: true
          })
        ];

      case "em":
        return [
          ...acc,
          ...flattenInlineNodes(node.children, {
            ...inherited,
            italic: true
          })
        ];

      case "link": {
        const href = node.attributes?.href;
        return [
          ...acc,
          ...flattenInlineNodes(node.children, {
            ...inherited,
            link: href
          })
        ];
      }

      default:
        return acc;
    }
  }, []);

/**
 * Renders a single styled segment as either a raw string
 * or an IOText element with the appropriate props.
 */
const renderSegment = (
  segment: StyledSegment,
  context: RenderContext,
  isCode?: boolean
): React.ReactNode => {
  if (isCode) {
    return <BodyMonospace key={segment.key}>{segment.text}</BodyMonospace>;
  }

  const { bold, italic, link } = segment.style;

  return (
    <IOText
      key={segment.key}
      {...(bold ? { weight: "Semibold" } : {})}
      {...(italic ? { fontStyle: "italic" } : {})}
      {...(link
        ? {
            color: context.linkColor,
            onPress: () => context.onLinkPress?.(link),
            accessibilityRole: "link" as const,
            textStyle: { textDecorationLine: "underline" as const }
          }
        : {})}
      size={context.fontSize}
      lineHeight={context.lineHeight}
    >
      {segment.text}
    </IOText>
  );
};

/* ─── Heading component map ─── */

type HeadingComponent = typeof H1;

const headingComponentMap: Record<string, HeadingComponent> = {
  heading1: H1,
  heading2: H2,
  heading3: H3,
  heading4: H4,
  heading5: H5,
  heading6: H6
};

/* ─── Block rendering helpers ─── */

/**
 * Renders a paragraph block by flattening inline children
 * into styled segments.
 */
const renderParagraph = (
  node: MarkdownNode,
  context: RenderContext
): React.ReactNode => {
  const segments = flattenInlineNodes(node.children, {
    bold: false,
    italic: false
  });

  return (
    <Body key={node.key} style={{ textAlign: context.textAlign }}>
      {segments.map(seg => {
        const matchingNode = node.children.find(c => c.key === seg.key);
        const isCode = matchingNode?.type === "code_inline";
        return renderSegment(seg, context, isCode);
      })}
    </Body>
  );
};

/**
 * Creates a render rule for a heading level using the corresponding
 * DS heading component (H1-H6). This ensures headings inherit
 * dynamicTypeRamp, uppercase/letterSpacing (H5), legacy typeface (H6),
 * and theme colors automatically.
 */
const makeHeadingRule =
  (Heading: HeadingComponent): RenderRule =>
  (node, _renderChildren, context) => {
    const segments = flattenInlineNodes(node.children, {
      bold: false,
      italic: false
    });

    return (
      <View key={node.key} accessibilityRole="header">
        <Heading style={{ textAlign: context.textAlign }}>
          {segments.map(seg => seg.text)}
        </Heading>
      </View>
    );
  };

/* ─── Default render rules ─── */

const paragraphRule: RenderRule = (node, _renderChildren, context) =>
  renderParagraph(node, context);

const textRule: RenderRule = node => (
  <Fragment key={node.key}>{node.content ?? ""}</Fragment>
);

const strongRule: RenderRule = (node, renderChildren) => (
  <IOText key={node.key} weight="Semibold">
    {renderChildren(node.children)}
  </IOText>
);

const emRule: RenderRule = (node, renderChildren) => (
  <IOText key={node.key} fontStyle="italic">
    {renderChildren(node.children)}
  </IOText>
);

const linkRule: RenderRule = (node, renderChildren, context) => {
  const href = node.attributes?.href;
  return (
    <IOText
      key={node.key}
      color={context.linkColor}
      onPress={href ? () => context.onLinkPress?.(href) : undefined}
      accessibilityRole="link"
      textStyle={{ textDecorationLine: "underline" }}
    >
      {renderChildren(node.children)}
    </IOText>
  );
};

const softbreakRule: RenderRule = node => (
  <Fragment key={node.key}>{"\n"}</Fragment>
);

const hardbreakRule: RenderRule = node => (
  <Fragment key={node.key}>{"\n"}</Fragment>
);

const bulletListRule: RenderRule = (node, renderChildren) => (
  <View
    key={node.key}
    accessible={true}
    accessibilityRole="list"
    style={{ paddingLeft: 12 }}
  >
    <VSpacer size={8} />
    {node.children.map(child => (
      <View key={child.key} style={{ flexDirection: "row" }}>
        <Body>{getUnorderedListBullet(node.listDepth ?? 0)}</Body>
        <HSpacer size={8} />
        <View style={{ flex: 1, flexShrink: 1 }}>
          {renderChildren(child.children)}
        </View>
      </View>
    ))}
    <VSpacer size={8} />
  </View>
);

const orderedListRule: RenderRule = (node, renderChildren) => (
  <View
    key={node.key}
    accessible={true}
    accessibilityRole="list"
    style={{ paddingLeft: 12 }}
  >
    <VSpacer size={8} />
    {node.children.map((child, i) => (
      <View key={child.key} style={{ flexDirection: "row" }}>
        <Body>{getOrderedListMarker(i + 1, node.listDepth ?? 0)}</Body>
        <HSpacer size={8} />
        <View style={{ flex: 1, flexShrink: 1 }}>
          {renderChildren(child.children)}
        </View>
      </View>
    ))}
    <VSpacer size={8} />
  </View>
);

const listItemRule: RenderRule = (node, renderChildren) => (
  <View key={node.key} style={{ flex: 1, flexShrink: 1 }}>
    {renderChildren(node.children)}
  </View>
);

const blockquoteRule: RenderRule = node => {
  const allText = collectRawText(node);
  const pictogramName = extractPictogramName(allText);

  // Find the first heading child for the banner title
  const headingNode = node.children.find(c => c.type.startsWith("heading"));
  const title = headingNode ? collectRawText(headingNode).trim() : undefined;

  // Collect content from paragraph children, stripping the pictogram pattern
  const content = node.children
    .filter(c => c.type === "paragraph")
    .map(c => stripPictogramPrefix(collectRawText(c)).trim())
    .filter(Boolean)
    .join("\n");

  return (
    <Banner
      key={node.key}
      pictogramName={pictogramName}
      color="neutral"
      title={title}
      content={content || undefined}
    />
  );
};

const imageRule: RenderRule = node => (
  <View key={node.key} style={{ marginVertical: 16 }}>
    <ImageRenderer node={node} />
  </View>
);

const codeInlineRule: RenderRule = node => (
  <BodyMonospace key={node.key}>{node.content ?? ""}</BodyMonospace>
);

const fenceRule: RenderRule = node => (
  <CodeBlock key={node.key} content={(node.content ?? "").trimEnd()} />
);

const hrRule: RenderRule = node => <Divider key={node.key} />;

const htmlRule: RenderRule = node => {
  if (node.content && isBrTag(node.content)) {
    return <Fragment key={node.key}>{"\n"}</Fragment>;
  }
  return null;
};

/**
 * The complete set of default render rules for all supported node types.
 */
export const DEFAULT_RULES: Record<MarkdownNodeType, RenderRule> = {
  heading1: makeHeadingRule(headingComponentMap.heading1),
  heading2: makeHeadingRule(headingComponentMap.heading2),
  heading3: makeHeadingRule(headingComponentMap.heading3),
  heading4: makeHeadingRule(headingComponentMap.heading4),
  heading5: makeHeadingRule(headingComponentMap.heading5),
  heading6: makeHeadingRule(headingComponentMap.heading6),
  paragraph: paragraphRule,
  text: textRule,
  strong: strongRule,
  em: emRule,
  link: linkRule,
  softbreak: softbreakRule,
  hardbreak: hardbreakRule,
  bullet_list: bulletListRule,
  ordered_list: orderedListRule,
  list_item: listItemRule,
  blockquote: blockquoteRule,
  image: imageRule,
  code_inline: codeInlineRule,
  fence: fenceRule,
  hr: hrRule,
  html_block: htmlRule,
  html_inline: htmlRule
};
