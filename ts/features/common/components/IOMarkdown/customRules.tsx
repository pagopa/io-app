import { Fragment } from "react";
import {
  TxtHeaderNode,
  TxtHtmlNode,
  TxtLinkNode
} from "@textlint/ast-node-types";
import {
  Body,
  IOSpacer,
  IOToast,
  MdH1,
  MdH2,
  MdH3,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
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
    const theme = useIOTheme();
    const Heading = HEADINGS_MAP[header.depth];

    const spacerValues: {
      [key: number]: { before: IOSpacer; after: IOSpacer };
    } = {
      1: { before: 16, after: 4 },
      2: { before: 16, after: 8 },
      3: { before: 8, after: 4 }
    };

    const { before: marginStart, after: marginEnd } = spacerValues[
      header.depth
    ] || {
      before: 0,
      after: 0
    };

    const allLinkData = extractAllLinksFromRootNode(
      header,
      screenReaderEnabled
    );
    const nodeKey = getTxtNodeKey(header);

    return (
      <Fragment key={nodeKey}>
        <VSpacer size={marginStart} />
        <Heading color={theme["textHeading-default"]}>
          {header.children.map(render)}
        </Heading>
        <VSpacer size={marginEnd} />
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
