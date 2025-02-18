import { Fragment } from "react";
import {
  TxtHeaderNode,
  TxtHtmlNode,
  TxtLinkNode
} from "@textlint/ast-node-types";
import { Body, IOToast, MdH1, MdH2, MdH3 } from "@pagopa/io-app-design-system";
import {
  isHttpsLink,
  isIoInternalLink
} from "../../../../components/ui/Markdown/handlers/link";
import { handleInternalLink } from "../../../../utils/internalLink";
import { openWebUrl } from "../../../../utils/url";
import I18n from "../../../../i18n";
import {
  generateAccesibilityLinkViewsIfNeeded,
  getTxtNodeKey
} from "../../../../components/IOMarkdown/renderRules";
import {
  IOMarkdownRenderRules,
  Renderer
} from "../../../../components/IOMarkdown/types";
import { extractAllLinksFromRootNode } from "../../../../components/IOMarkdown/markdownRenderer";
import { isTestEnv } from "../../../../utils/environment";

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
  } else if (isHttpsLink(url)) {
    openWebUrl(url, () => {
      IOToast.error(I18n.t("global.jserror.title"));
    });
  } else {
    IOToast.warning(I18n.t("messageDetails.markdownLinkUnsupported"));
  }
};

export const generateMessagesAndServicesRules = (
  linkTo: (path: string) => void
): Partial<IOMarkdownRenderRules> => ({
  Header(
    header: TxtHeaderNode,
    render: Renderer,
    screenReaderEnabled: boolean
  ) {
    const Heading = HEADINGS_MAP[header.depth];

    const allLinkData = extractAllLinksFromRootNode(
      header,
      screenReaderEnabled
    );
    const nodeKey = getTxtNodeKey(header);

    return (
      <Fragment key={nodeKey}>
        <Heading>{header.children.map(render)}</Heading>
        {generateAccesibilityLinkViewsIfNeeded(
          allLinkData,
          nodeKey,
          (url: string) => handleOpenLink(linkTo, url),
          screenReaderEnabled
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
  },
  Html: (_html: TxtHtmlNode) => undefined
});

export const generatePreconditionsRules =
  (): Partial<IOMarkdownRenderRules> => ({
    Html: (_html: TxtHtmlNode) => undefined
  });

export const testable = isTestEnv ? { handleOpenLink } : undefined;
