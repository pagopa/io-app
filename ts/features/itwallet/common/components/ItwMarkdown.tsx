import {
  Body,
  bodyFontSize,
  H1,
  h1FontSize,
  H2,
  h2FontSize,
  H3,
  h3FontSize,
  H4,
  h4FontSize,
  H5,
  h5FontSize,
  H6,
  h6FontSize,
  IOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import _ from "lodash";
import { ReactNode } from "react";
import * as React from "react";
import { StyleSheet } from "react-native";
import Markdown, { ASTNode } from "react-native-markdown-display";
import I18n from "../../../../i18n";
import { openWebUrl } from "../../../../utils/url";

type ItwMarkdownProps = {
  // We can provide styles to override the default ones
  styles?: Partial<typeof styles>;
  onLinkOpen?: () => void;
};

const getRules = (onLinkOpen?: ItwMarkdownProps["onLinkOpen"]) => ({
  heading1: (node: ASTNode, children: Array<ReactNode>) => (
    <React.Fragment key={node.key}>
      <H1>{children}</H1>
      <VSpacer size={8} />
    </React.Fragment>
  ),
  heading2: (node: ASTNode, children: Array<ReactNode>) => (
    <React.Fragment key={node.key}>
      <H2>{children}</H2>
      <VSpacer size={8} />
    </React.Fragment>
  ),
  heading3: (node: ASTNode, children: Array<ReactNode>) => (
    <React.Fragment key={node.key}>
      <H3>{children}</H3>
      <VSpacer size={8} />
    </React.Fragment>
  ),
  heading4: (node: ASTNode, children: Array<ReactNode>) => (
    <React.Fragment key={node.key}>
      <H4>{children}</H4>
      <VSpacer size={8} />
    </React.Fragment>
  ),
  heading5: (node: ASTNode, children: Array<ReactNode>) => (
    <React.Fragment key={node.key}>
      <H5>{children}</H5>
      <VSpacer size={8} />
    </React.Fragment>
  ),
  heading6: (node: ASTNode, children: Array<ReactNode>) => (
    <React.Fragment key={node.key}>
      <H6>{children}</H6>
      <VSpacer size={8} />
    </React.Fragment>
  ),
  paragraph: (node: ASTNode, children: Array<ReactNode>) => (
    <React.Fragment key={node.key}>
      <Body>{children}</Body>
      <VSpacer size={24} />
    </React.Fragment>
  ),
  strong: (node: ASTNode, children: Array<ReactNode>) => (
    <Body key={node.key} weight="Semibold">
      {children}
    </Body>
  ),
  link: (node: ASTNode, children: Array<ReactNode>) => (
    <Body
      weight="Semibold"
      asLink
      key={node.key}
      onPress={() => {
        openWebUrl(node.attributes.href, () =>
          IOToast.error(I18n.t("global.jserror.title"))
        );
        onLinkOpen?.();
      }}
      numberOfLines={1}
    >
      {children}
    </Body>
  )
});

/* eslint-disable react-native/no-unused-styles */
const styles = StyleSheet.create({
  body: {
    fontSize: bodyFontSize
  },
  heading1: {
    fontSize: h1FontSize
  },
  heading2: {
    fontSize: h2FontSize
  },
  heading3: {
    fontSize: h3FontSize
  },
  heading4: {
    fontSize: h4FontSize
  },
  heading5: {
    fontSize: h5FontSize
  },
  heading6: {
    fontSize: h6FontSize
  }
});
/* eslint-enable react-native/no-unused-styles */

/**
 * This component renders react components starting from a markdown text.
 * Main components are mapped into rules object.
 * @param content - contains the text to be converted in react elements.
 */
const ItwMarkdown = (props: React.PropsWithChildren<ItwMarkdownProps>) => (
  <Markdown
    style={_.merge(styles, props.styles)}
    rules={getRules(props.onLinkOpen)}
  >
    {props.children}
  </Markdown>
);

export default ItwMarkdown;
