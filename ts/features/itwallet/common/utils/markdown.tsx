import { Body, IOToast } from "@pagopa/io-app-design-system";
import { TxtLinkNode } from "@textlint/ast-node-types";
import { getTxtNodeKey } from "../../../../components/IOMarkdown/renderRules";
import { Renderer } from "../../../../components/IOMarkdown/types";
import I18n from "../../../../i18n";
import { openWebUrl } from "../../../../utils/url";

/**
 * Generate a rule for the markdown component that opens a link and calls a callback
 * @param callback - the callback to call when the link is pressed
 * @returns the rule for the markdown component
 */
export const generateLinkRuleWithCallback = (callback: () => void) => ({
  Link(link: TxtLinkNode, render: Renderer) {
    return (
      <Body
        weight="Semibold"
        asLink
        key={getTxtNodeKey(link)}
        onPress={() => {
          openWebUrl(link.url, () =>
            IOToast.error(I18n.t("global.jserror.title"))
          );
          callback();
        }}
      >
        {link.children.map(render)}
      </Body>
    );
  }
});
