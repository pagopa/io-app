import {
  IOToast,
  LabelLink,
  IOStyles,
  HSpacer,
  VSpacer,
  Body,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6
} from "@pagopa/io-app-design-system";
import {
  TxtHeaderNode,
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
import { Image, Text, View } from "react-native";
import I18n from "../../i18n";
import { openWebUrl } from "../../utils/url";
import { IOMarkdownRenderRules, Renderer } from "./types";

const BULLET_ITEM = "\u2022";
const HEADINGS_MAP = {
  1: H1,
  2: H2,
  3: H3,
  4: H4,
  5: H5,
  6: H6
};
/**
 * Used to get a valid key
 *
 * @param txtNode any Txt node
 * @returns a string to be used as component key inside of map loops.
 */
export function getTxtNodeKey(txtNode: AnyTxtNode): string {
  const encoded = Buffer.from(
    `${txtNode.raw.substring(0, 10) + JSON.stringify(txtNode.loc.start)}`
  ).toString("base64");

  return `${txtNode.type}_${encoded}`;
}

/**
 * This object has as key a`TxtNodeType` and as value a render function related to the `TxtNode` element to display.
 */
export const DEFAULT_RULES: IOMarkdownRenderRules = {
  /**
   *
   * @param header The `Header` node.
   * @param render The renderer function.
   * @returns A component ranging from `H1` to `H6`, inclusive, depending on the `header.depth` value..
   */
  Header(header: TxtHeaderNode, render: Renderer) {
    const Heading = HEADINGS_MAP[header.depth];

    return (
      <Heading key={getTxtNodeKey(header)}>
        {header.children.map(render)}
      </Heading>
    );
  },
  /**
   * @param paragraph The `Paragraph` node.
   * @param render The renderer function.
   * @returns The rendered component.
   */
  Paragraph(paragraph: TxtParagraphNode, render: Renderer) {
    return (
      <Body key={getTxtNodeKey(paragraph)}>
        {paragraph.children.map(render)}
      </Body>
    );
  },
  /**
   * @param emphasis The `Emphasis` node.
   * @param render The renderer function.
   * @returns The rendered component.
   */
  Emphasis(emphasis: TxtEmphasisNode, render: Renderer) {
    return (
      <Text key={getTxtNodeKey(emphasis)} style={{ fontStyle: "italic" }}>
        {emphasis.children.map(render)}
      </Text>
    );
  },
  /**
   * @param strong The `Strong` node.
   * @param render The renderer function.
   * @returns The rendered component.
   */
  Strong(strong: TxtStrongNode, render: Renderer) {
    return (
      <Text key={getTxtNodeKey(strong)} style={{ fontWeight: "800" }}>
        {strong.children.map(render)}
      </Text>
    );
  },
  /**
   * @param str The `Str` node.
   * @param render The renderer function.
   * @returns The rendered component.
   */
  Str(str: TxtStrNode) {
    return <Fragment key={getTxtNodeKey(str)}>{str.value}</Fragment>;
  },
  /**
   * @param link The `Link` node.
   * @param render The renderer function.
   * @returns The rendered component.
   */
  Link(link: TxtLinkNode, render: Renderer) {
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
  },
  /**
   * @param image The `Image` node.
   * @returns The rendered component.
   */
  Image(image: TxtImageNode) {
    return (
      <Image
        key={getTxtNodeKey(image)}
        accessibilityIgnoresInvertColors
        accessibilityLabel={image.alt ?? ""}
        source={{ uri: image.url }}
      />
    );
  },
  /**
   * @param list The `List` node.
   * @param render The renderer function.
   * @returns The rendered component.
   */
  List(list: TxtListNode, render: Renderer) {
    const isOrdered = list.ordered;

    function getLeftAdornment(i: number) {
      if (isOrdered) {
        return <Body>{i + 1}.</Body>;
      }

      return <Body>{BULLET_ITEM}</Body>;
    }

    return (
      <View key={getTxtNodeKey(list)} style={IOStyles.row}>
        <HSpacer size={8} />
        <View accessible={true} accessibilityRole="list">
          {list.children.map((child, i) => (
            <View key={`${child.type}_${i}`} style={IOStyles.row}>
              {getLeftAdornment(i)}
              <HSpacer size={8} />
              {render(child)}
            </View>
          ))}
        </View>
      </View>
    );
  },
  /**
   * @param listItem The `ListItem` node.
   * @param render The renderer function.
   * @returns The rendered component.
   */
  ListItem(listItem: TxtListItemNode, render: Renderer) {
    return (
      <View key={getTxtNodeKey(listItem)}>{listItem.children.map(render)}</View>
    );
  },
  /**
   * Used to remove comments from the final output.
   * @returns null.
   */
  Comment: () => null,
  /**
   * @param props The custom `Spacer` component used to add space between the first level content.
   * @returns The rendered `VSpacer` component.
   */
  Spacer: ({ key, size }) => <VSpacer key={key} size={size} />
};
