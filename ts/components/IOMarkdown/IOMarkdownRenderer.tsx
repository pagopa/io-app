/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable arrow-body-style */
import {
  Body,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  HSpacer,
  IOStyles,
  IOToast,
  LabelLink,
  VSpacer
} from "@pagopa/io-app-design-system";
import { parse } from "@textlint/markdown-to-ast";
import {
  TxtHeaderNode,
  TxtParentNode,
  TxtListNode,
  TxtListItemNode,
  TxtParagraphNode,
  TxtStrNode,
  TxtStrongNode,
  TxtEmphasisNode,
  TxtLinkNode,
  TxtImageNode,
  AnyTxtNode
} from "@textlint/ast-node-types";
import React, { Fragment } from "react";
import { View, Image, Text } from "react-native";
import { openWebUrl } from "../../utils/url";
import I18n from "../../i18n";
import { AnyTxtNodeWiSpacer, Renderer, IOMarkdownRules } from "./types";

const BULLET_ITEM = "\u2022";
const HEADINGS_MAP = {
  1: H1,
  2: H2,
  3: H3,
  4: H4,
  5: H5,
  6: H6
};

export function getStrValue({ children }: TxtParentNode): string {
  return children.reduce((acc, inc) => {
    if (inc.type === "Str" || inc.type === "Code") {
      return acc + inc.value;
    }
    if ("children" in inc) {
      return acc + getStrValue(inc);
    }
    return acc;
  }, "");
}

export function getTxtNodeKey(txtNode: AnyTxtNode) {
  const encoded = Buffer.from(
    `${txtNode.raw.substring(0, 10) + JSON.stringify(txtNode.loc.start)}`
  ).toString("base64");

  return `${txtNode.type}_${encoded}`;
}

class IOMarkdownRenderer {
  render: Renderer;

  constructor(rules?: Partial<IOMarkdownRules>) {
    const getMarkdownRenderer = (rules: IOMarkdownRules): Renderer => {
      return (content: AnyTxtNodeWiSpacer) =>
        // @ts-ignore
        rules[content.type]?.(content, getMarkdownRenderer(rules)) ?? null;
    };
    this.render = getMarkdownRenderer({
      Header: this.renderHeader,
      Paragraph: this.renderParagraph,
      Str: this.renderStr,
      Strong: this.renderStrong,
      Emphasis: this.renderEmphasis,
      Comment: () => null,
      Link: this.renderLink,
      List: this.renderList,
      ListItem: this.renderListItem,
      Image: this.renderImage,
      Spacer: content => <VSpacer size={content.size} />,
      ...(rules || {})
    });
  }

  parse(content: string) {
    return parse(content).children.reduce<Array<AnyTxtNodeWiSpacer>>(
      (acc, currNode, idx, self) => {
        const nextNode = self[idx + 1];
        const diff = nextNode?.loc.start.line - currNode.loc.end.line;
        if (diff > 1) {
          return [
            ...acc,
            currNode,
            { type: "Spacer", size: Math.min(2, diff - 1) * 8 }
          ];
        }
        return [...acc, currNode];
      },
      []
    );
  }

  private renderHeader(header: TxtHeaderNode, render: Renderer) {
    const Heading = HEADINGS_MAP[header.depth];

    return (
      <Heading key={getTxtNodeKey(header)}>
        {header.children.map(render)}
      </Heading>
    );
  }

  private renderParagraph(paragraph: TxtParagraphNode, render: Renderer) {
    return (
      <Body key={getTxtNodeKey(paragraph)}>
        {paragraph.children.map(render)}
      </Body>
    );
  }
  private renderEmphasis(emphasis: TxtEmphasisNode, render: Renderer) {
    return (
      <Text key={getTxtNodeKey(emphasis)} style={{ fontStyle: "italic" }}>
        {emphasis.children.map(render)}
      </Text>
    );
  }
  private renderStrong(strong: TxtStrongNode, render: Renderer) {
    return (
      <Text key={getTxtNodeKey(strong)} style={{ fontWeight: "800" }}>
        {strong.children.map(render)}
      </Text>
    );
  }
  private renderStr(str: TxtStrNode) {
    return <Fragment key={getTxtNodeKey(str)}>{str.value}</Fragment>;
  }
  private renderLink(link: TxtLinkNode, render: Renderer) {
    const handleOpenLink = () => {
      openWebUrl(link.url, () => {
        IOToast.error(I18n.t("global.jserror.title"));
      });
    };

    return (
      <LabelLink key={getTxtNodeKey(link)} onPress={handleOpenLink}>
        {link.children.map(render)}
      </LabelLink>
    );
  }
  private renderImage(image: TxtImageNode) {
    return (
      <Image
        key={getTxtNodeKey(image)}
        accessibilityIgnoresInvertColors
        accessibilityLabel={image.alt ?? ""}
        source={{ uri: image.url }}
      />
    );
  }
  private renderList(list: TxtListNode, render: Renderer) {
    const isOrdered = list.ordered;

    function getLeftAdornment(i: number) {
      if (isOrdered) {
        return <Body>{i + 1}.</Body>;
      }

      return <Body>{BULLET_ITEM}</Body>;
    }

    return (
      <View style={IOStyles.row}>
        <HSpacer size={8} />
        <View accessible={true} accessibilityRole="list">
          {list.children.map((child, i) => {
            return (
              <View key={`${child.type}_${i}`} style={IOStyles.row}>
                {getLeftAdornment(i)}
                <HSpacer size={8} />
                {render(child)}
              </View>
            );
          })}
        </View>
      </View>
    );
  }
  private renderListItem(listItem: TxtListItemNode, render: Renderer) {
    return (
      <View key={getTxtNodeKey(listItem)}>{listItem.children.map(render)}</View>
    );
  }
}

export default IOMarkdownRenderer;
