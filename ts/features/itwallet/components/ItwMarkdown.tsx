import React, { ReactNode } from "react";
import {
  Body,
  H1,
  H2,
  h2FontSize,
  H3,
  H4,
  H5,
  H6,
  h6FontSize,
  LabelLink,
  VSpacer
} from "@pagopa/io-app-design-system";
import Markdown, { ASTNode } from "react-native-markdown-display";
import { StyleSheet } from "react-native";
import { openWebUrl } from "../../../utils/url";

interface MarkdownParserProps {
  content?: string;
}

const rules = {
  paragraph: (node: ASTNode, children: Array<ReactNode>) => (
    <>
      <VSpacer />
      <Body key={node.key}>{children}</Body>
      <VSpacer />
    </>
  ),
  strong: (node: ASTNode, children: Array<ReactNode>) => (
    <Body key={node.key} weight="Bold">
      {children}
    </Body>
  ),
  heading1: (node: ASTNode, children: Array<ReactNode>) => (
    <H1 key={node.key}>{children}</H1>
  ),
  heading2: (node: ASTNode, children: Array<ReactNode>) => (
    <H2 key={node.key}>{children}</H2>
  ),
  heading3: (node: ASTNode, children: Array<ReactNode>) => (
    <H3 key={node.key}>{children}</H3>
  ),
  heading4: (node: ASTNode, children: Array<ReactNode>) => (
    <H4 key={node.key}>{children}</H4>
  ),
  heading5: (node: ASTNode, children: Array<ReactNode>) => (
    <H5 key={node.key}>{children}</H5>
  ),
  heading6: (node: ASTNode, children: Array<ReactNode>) => (
    <H6 key={node.key}>{children}</H6>
  ),
  link: (node: ASTNode, children: Array<ReactNode>) => (
    <LabelLink
      key={node.key}
      onPress={() => openWebUrl(node.attributes.href)}
      numberOfLines={1}
    >
      {children}
    </LabelLink>
  )
};

const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-unused-styles
  heading2: {
    fontSize: h2FontSize
  },
  // eslint-disable-next-line react-native/no-unused-styles
  heading6: {
    fontSize: h6FontSize
  }
});

/**
 * This component renders a markdown text.
 * It parses the text and renders bold text, links and headers.
 * NOTE: only header level 2 and 6 is supported to extend to other
 * headers create a new rgex group (eg. |^##\s(.+)).
 * @param markdownText - contains the text to be parsed.
 */
const ItwTextInfo: React.FC<MarkdownParserProps> = ({ content }) => (
  <Markdown style={styles} rules={rules}>
    {content}
  </Markdown>
);

export default ItwTextInfo;
