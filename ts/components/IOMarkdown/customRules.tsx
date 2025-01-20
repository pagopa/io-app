import { Fragment } from "react";
import { TxtHeaderNode, TxtLinkNode } from "@textlint/ast-node-types";
import { Body, IOToast, MdH1, MdH2, MdH3 } from "@pagopa/io-app-design-system";
import { isIoInternalLink } from "../ui/Markdown/handlers/link";
import { handleInternalLink } from "../../utils/internalLink";
import { openWebUrl } from "../../utils/url";
import I18n from "../../i18n";
import {
  generateAccesibilityLinkViewsIfNeeded,
  getTxtNodeKey
} from "./renderRules";
import { IOMarkdownRenderRules, Renderer } from "./types";
import { extractAllLinksFromRootNode } from "./markdownRenderer";

const HEADINGS_MAP = {
  1: MdH1,
  2: MdH2,
  3: MdH3,
  4: Body,
  5: Body,
  6: Body
};

const handleOpenLink = (linkTo: (path: string) => void, url: string) => {
  if (isIoInternalLink(url)) {
    handleInternalLink(linkTo, url);
  } else {
    openWebUrl(url, () => {
      IOToast.error(I18n.t("global.jserror.title"));
    });
  }
};

export const generateMessagesAndServicesRules = (
  linkTo: (path: string) => void
): Partial<IOMarkdownRenderRules> => ({
  Header(header: TxtHeaderNode, render: Renderer) {
    const Heading = HEADINGS_MAP[header.depth];

    const allLinkData = extractAllLinksFromRootNode(header);
    const nodeKey = getTxtNodeKey(header);

    return (
      <Fragment key={nodeKey}>
        <Heading>{header.children.map(render)}</Heading>
        {generateAccesibilityLinkViewsIfNeeded(
          allLinkData,
          nodeKey,
          (url: string) => handleOpenLink(linkTo, url)
        )}
      </Fragment>
    );
  },
  Link(link: TxtLinkNode, render: Renderer) {
    return (
      <Body
        weight="Semibold"
        asLink
        key={getTxtNodeKey(link)}
        onPress={() => handleOpenLink(linkTo, link.url)}
      >
        {link.children.map(render)}
      </Body>
    );
  }
});
