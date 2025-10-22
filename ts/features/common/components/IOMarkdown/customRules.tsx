import {
  Body,
  IOSpacer,
  IOToast,
  MdH1,
  MdH2,
  MdH3
} from "@pagopa/io-app-design-system";
import {
  TxtHeaderNode,
  TxtHtmlNode,
  TxtLinkNode,
  TxtStrNode
} from "@textlint/ast-node-types";
import I18n from "i18next";
import {
  headerNodeToReactNative,
  htmlNodeToReactNative,
  linkNodeToReactNative,
  strNodeToReactNative
} from "../../../../components/IOMarkdown/renderRules";
import {
  IOMarkdownRenderRules,
  Renderer
} from "../../../../components/IOMarkdown/types";
import {
  isHttpLink,
  isHttpsLink,
  isIoInternalLink
} from "../../../../components/ui/Markdown/handlers/link";
import { isTestEnv } from "../../../../utils/environment";
import { handleInternalLink } from "../../../../utils/internalLink";
import { openWebUrl } from "../../../../utils/url";

type HeadingMargins = {
  marginStart: IOSpacer;
  marginEnd: IOSpacer;
};

const HEADINGS_MAP = {
  1: MdH1,
  2: MdH2,
  3: MdH3,
  4: Body,
  5: Body,
  6: Body
};

const SPACER_VALUES: {
  [key: number]: HeadingMargins;
} = {
  1: { marginStart: 16, marginEnd: 4 },
  2: { marginStart: 16, marginEnd: 8 }
};

const DEFAULT_HEADING_MARGINS: HeadingMargins = {
  marginStart: 8,
  marginEnd: 4
};

export const handleOpenLink = (linkTo: (path: string) => void, url: string) => {
  if (isIoInternalLink(url)) {
    handleInternalLink(linkTo, url);
    // Non-secure HTTP links have to be supported since
    // there are older messages with external http-links
    // that redirect to https upon opening
  } else if (isHttpsLink(url) || isHttpLink(url)) {
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
    const { marginStart, marginEnd } =
      SPACER_VALUES[header.depth] || DEFAULT_HEADING_MARGINS;
    return headerNodeToReactNative(
      header,
      HEADINGS_MAP,
      (url: string) => handleOpenLink(linkTo, url),
      render,
      screenReaderEnabled,
      marginStart,
      marginEnd
    );
  },
  Link(link: TxtLinkNode, render: Renderer) {
    return linkNodeToReactNative(
      link,
      { onPress: () => handleOpenLink(linkTo, link.url) },
      render
    );
  },
  Html: (html: TxtHtmlNode) => {
    const backwardCompatibleValue = replaceBrWithNewline(html.value);
    return htmlNodeToReactNative(backwardCompatibleValue, html, html.parent);
  },
  Str(str: TxtStrNode) {
    const backwardCompatibleValue = replaceBrWithNewline(str.value);
    return strNodeToReactNative(backwardCompatibleValue, str);
  }
});

const replaceBrWithNewline = (input: string): string =>
  input.replace(/<br\s*\/?>/gi, "\n");

export const testable = isTestEnv
  ? {
      DEFAULT_HEADING_MARGINS,
      HEADINGS_MAP,
      SPACER_VALUES,
      handleOpenLink,
      replaceBrWithNewline
    }
  : undefined;
