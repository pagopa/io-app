import {
  Banner,
  Body,
  BodyMonospace,
  Divider,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  HSpacer,
  IOPictogramsBleed,
  IOStyles,
  IOToast,
  Nullable,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  AnyTxtNode,
  TxtBlockQuoteNode,
  TxtBreakNode,
  TxtCodeBlockNode,
  TxtCodeNode,
  TxtEmphasisNode,
  TxtHeaderNode,
  TxtHorizontalRuleNode,
  TxtHtmlNode,
  TxtImageNode,
  TxtLinkNode,
  TxtListItemNode,
  TxtListNode,
  TxtParagraphNode,
  TxtParentNode,
  TxtStrNode,
  TxtStrongNode
} from "@textlint/ast-node-types";
import { Fragment, useLayoutEffect, useState } from "react";
import { Dimensions, Image, Text, View } from "react-native";
import I18n from "../../i18n";
import { openWebUrl } from "../../utils/url";
import { IOMarkdownRenderRules, Renderer } from "./types";

const BULLET_ITEM_FULL = "\u2022";
const BULLET_ITEM_EMPTY = "\u25E6";
const HEADINGS_MAP = {
  1: H1,
  2: H2,
  3: H3,
  4: H4,
  5: H5,
  6: H6
};
const PICTOGRAM_REGEXP = /^\s*>\s{0,4}\[!(.*?)\]/;
const HEADING_REGEXP = /^\s*>\s{0,4}#{1,6}\s+(.+)/m;
const STARTS_WITH_PICTOGRAM = new RegExp(
  PICTOGRAM_REGEXP.source + "s*\n( {0,4})>"
);
const PICTOGRAM_REGEXP_GLOB = new RegExp(PICTOGRAM_REGEXP.source, "g");
const HEADING_REGEXP_GLOB_MULTI = new RegExp(HEADING_REGEXP.source, "gm");

export function getPictogramName(value?: Nullable<string>): IOPictogramsBleed {
  const isValidPictogram =
    value && Boolean(IOPictogramsBleed[value as IOPictogramsBleed]);
  return isValidPictogram ? (value as IOPictogramsBleed) : "notification";
}

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

/**
 *
 * @param node The node to scan.
 * @param nodeType If defined this function checks how many nodes of this type wrap the interested node, otherwise it takes all the nodes.
 * @returns The `node` nesting level.
 */
function getNodeNestingLevel<T extends AnyTxtNode | undefined>(
  node: T,
  nodeType?: AnyTxtNode["type"]
): number {
  if (typeof node === "undefined" || !("parent" in node)) {
    return 0;
  }
  const current = nodeType ? Number(node?.parent?.type === nodeType) : 1;

  return current + getNodeNestingLevel(node.parent, nodeType);
}

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
      <Text key={getTxtNodeKey(strong)} style={{ fontWeight: "600" }}>
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
      <Body
        weight="Semibold"
        asLink
        key={getTxtNodeKey(link)}
        onPress={handleOpenLink}
      >
        {link.children.map(render)}
      </Body>
    );
  },
  /**
   * @param image The `Image` node.
   * @returns The rendered component.
   */
  Image(image: TxtImageNode) {
    const [imageSize, setImageSize] = useState({
      width: 0,
      aspectRatio: 1
    });
    const screenWidth =
      Dimensions.get("screen").width -
      IOStyles.horizontalContentPadding.paddingHorizontal * 2;

    useLayoutEffect(() => {
      Image.getSize(image.url, (width, height) => {
        const aspectRatio = width / height;
        const maxScreenWidth = width > screenWidth ? screenWidth : width;

        setImageSize({ width: maxScreenWidth, aspectRatio });
      });
    }, [screenWidth, image.url]);

    return (
      <Image
        key={getTxtNodeKey(image)}
        accessibilityIgnoresInvertColors
        style={imageSize}
        resizeMode="contain"
        accessibilityLabel={image.alt ?? ""}
        source={{
          uri: image.url
        }}
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
    const nestingLevel = getNodeNestingLevel(list, "List");
    const bulletItem =
      nestingLevel % 2 === 1 ? BULLET_ITEM_EMPTY : BULLET_ITEM_FULL;
    const isFirstList = nestingLevel === 0;

    function getLeftAdornment(i: number) {
      if (isOrdered) {
        return <Body>{i + 1}.</Body>;
      }

      return <Body>{bulletItem}</Body>;
    }

    return (
      <View key={getTxtNodeKey(list)}>
        {isFirstList && <VSpacer size={8} />}
        <View style={IOStyles.row}>
          {isFirstList && <HSpacer size={12} />}
          <View
            style={[IOStyles.flex, { flexGrow: 1 }]}
            accessible={true}
            accessibilityRole="list"
          >
            {list.children.map((child, i) => (
              <View accessible key={`${child.type}_${i}`} style={IOStyles.row}>
                {getLeftAdornment(i)}
                <HSpacer size={8} />
                {render(child)}
              </View>
            ))}
          </View>
        </View>
        {isFirstList && <VSpacer size={8} />}
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
      <View
        accessible={false}
        style={[IOStyles.flex, { flexShrink: 1 }]}
        key={getTxtNodeKey(listItem)}
      >
        {listItem.children.map(render)}
      </View>
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
  Spacer: ({ key, size }) => <VSpacer key={key} size={size} />,
  /**
   *
   * @param blockQuote The `BlockQuote` node.
   * @returns The `Banner` component configured with the `BlockQuote` content.
   */
  BlockQuote: (blockQuote: TxtBlockQuoteNode) => {
    const pictogramName = blockQuote.raw.match(STARTS_WITH_PICTOGRAM);
    const title = HEADING_REGEXP.exec(blockQuote.raw);
    const content = blockQuote.raw
      .replace(PICTOGRAM_REGEXP_GLOB, "")
      .replace(HEADING_REGEXP_GLOB_MULTI, "")
      .replace(/^>*/gm, "")
      .trim();

    return (
      <Banner
        key={getTxtNodeKey(blockQuote)}
        pictogramName={getPictogramName(pictogramName?.[1])}
        color="neutral"
        title={title?.[1]}
        content={content}
      />
    );
  },
  /**
   * @param codeBlock The `CodeBlock` node.
   * @returns A `Body` containing the `raw` content.
   */
  CodeBlock: (codeBlock: TxtCodeBlockNode) => (
    <Body key={getTxtNodeKey(codeBlock)}>{codeBlock.raw}</Body>
  ),
  /**
   * @param code The `Code` node.
   * @returns A `Body` containing the `value` content.
   */
  Code: (code: TxtCodeNode) => (
    <BodyMonospace key={getTxtNodeKey(code)}>{code.value}</BodyMonospace>
  ),
  /**
   * @param breakNode The `Break` node.
   * @returns A new line character.
   */
  Break: (breakNode: TxtBreakNode) => (
    <Fragment key={getTxtNodeKey(breakNode)}>{"\n"}</Fragment>
  ),
  /**
   * @param html The `Html` node.
   * @returns A new line character in case of `<br/>` value, otherwise `null`.
   */
  Html: (html: TxtHtmlNode) => {
    const val = html.value.split(/<([^\s/>]+)\s*\/>/);
    const [, value] = val;

    if (value === "br") {
      return <Fragment key={getTxtNodeKey(html)}>{"\n"}</Fragment>;
    }

    return null;
  },
  /**
   * @param horizontalRule The `HorizontalRule` node.
   * @returns A `Divider` component.
   */
  HorizontalRule: (horizontalRule: TxtHorizontalRuleNode) => (
    <Divider key={getTxtNodeKey(horizontalRule)} />
  )
};
