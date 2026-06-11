import { IOToast } from "@pagopa/io-app-design-system";
import { TxtLinkNode, TxtParagraphNode } from "@textlint/ast-node-types";
import I18n from "i18next";
import {
  ParagraphSize,
  linkNodeToReactNative,
  paragraphNodeToReactNative
} from "../../../../components/IOMarkdown/renderRules";
import { Renderer } from "../../../../components/IOMarkdown/types";
import { openWebUrl } from "../../../../utils/url";

type Options = {
  /**
   * The callback to call when the link is pressed
   */
  linkCallback: () => void;
  /**
   * Optional action to perform when the link is pressed.
   * If omitted, the link opens the underlying URL.
   */
  onPress?: (url: string) => void;
  /**
   * The size of the paragraph nodes to render
   */
  paragraphSize?: ParagraphSize;
};

/**
 * Generate custom rules for the markdown component used in IT-Wallet screens
 * @param options {@link Options} to customize the markdown rules
 * @returns the rules for the markdown component
 */
export const generateItwIOMarkdownRules = ({
  paragraphSize,
  linkCallback,
  onPress
}: Options) => ({
  Link(link: TxtLinkNode, render: Renderer) {
    return linkNodeToReactNative(
      link,
      {
        size: paragraphSize,
        onPress: () => {
          linkCallback();
          if (onPress) {
            onPress(link.url);
            return;
          }
          openWebUrl(link.url, () =>
            IOToast.error(I18n.t("global.jserror.title"))
          );
        }
      },
      render
    );
  },
  Paragraph(
    paragraph: TxtParagraphNode,
    render: Renderer,
    screenReaderEnabled: boolean
  ) {
    return paragraphNodeToReactNative(
      paragraph,
      { screenReaderEnabled, size: paragraphSize },
      render
    );
  }
});
