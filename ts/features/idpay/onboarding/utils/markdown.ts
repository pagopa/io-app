import { BodySmall } from "@pagopa/io-app-design-system";
import { createElement } from "react";
import { getTxtNodeKey } from "../../../../components/IOMarkdown/renderRules";
import { IOMarkdownRenderRules } from "../../../../components/IOMarkdown/types";
import { handleOpenLink } from "../../../common/components/IOMarkdown/customRules";

export const generateSmallTosMarkdownRules = (
  linkTo: (path: string) => void
): Partial<IOMarkdownRenderRules> => ({
  Link(link, render) {
    return createElement(
      BodySmall,
      {
        key: getTxtNodeKey(link),
        asLink: true,
        avoidPressable: true,
        onPress: () => handleOpenLink(linkTo, link.url)
      },
      link.children.map(render)
    );
  },
  Str(str) {
    // This step is necessary to avoid rendering link without colors
    const isInsideLink = str.parent?.type === "Link";
    if (isInsideLink) {
      return str.value;
    }
    return createElement(BodySmall, { key: getTxtNodeKey(str) }, str.value);
  }
});
