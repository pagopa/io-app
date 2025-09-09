import { IOToast } from "@pagopa/io-app-design-system";
import { TxtLinkNode } from "@textlint/ast-node-types";
import I18n from "i18next";
import { linkNodeToReactNative } from "../../../../components/IOMarkdown/renderRules";
import { Renderer } from "../../../../components/IOMarkdown/types";
import { openWebUrl } from "../../../../utils/url";

/**
 * Generate a rule for the markdown component that opens a link and calls a callback
 * @param callback - the callback to call when the link is pressed
 * @returns the rule for the markdown component
 */
export const generateLinkRuleWithCallback = (callback: () => void) => ({
  Link(link: TxtLinkNode, render: Renderer) {
    return linkNodeToReactNative(
      link,
      () => {
        openWebUrl(link.url, () =>
          IOToast.error(I18n.t("global.jserror.title"))
        );
        callback();
      },
      render
    );
  }
});
