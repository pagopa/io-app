import { TxtHeaderNode, TxtLinkNode } from "@textlint/ast-node-types";
import {
  Body,
  IOToast,
  Label,
  MdH1,
  MdH2,
  MdH3
} from "@pagopa/io-app-design-system";
import React from "react";
import { isIoInternalLink } from "../ui/Markdown/handlers/link";
import { handleInternalLink } from "../../utils/internalLink";
import { openWebUrl } from "../../utils/url";
import I18n from "../../i18n";
import { getTxtNodeKey } from "./renderRules";
import { IOMarkdownRenderRules, Renderer } from "./types";

const HEADINGS_MAP = {
  1: MdH1,
  2: MdH2,
  3: MdH3,
  4: Body,
  5: Body,
  6: Body
};

export const generateMessagesAndServicesRules = (
  linkTo: (path: string) => void
): Partial<IOMarkdownRenderRules> => ({
  Header(header: TxtHeaderNode, render: Renderer) {
    const Heading = HEADINGS_MAP[header.depth];

    return (
      <Heading key={getTxtNodeKey(header)}>
        {header.children.map(render)}
      </Heading>
    );
  },
  Link(link: TxtLinkNode, render: Renderer) {
    const handlePress = () => {
      if (isIoInternalLink(link.url)) {
        handleInternalLink(linkTo, link.url);
      } else {
        openWebUrl(link.url, () => {
          IOToast.error(I18n.t("global.jserror.title"));
        });
      }
    };

    return (
      <Label asLink key={getTxtNodeKey(link)} onPress={handlePress}>
        {link.children.map(render)}
      </Label>
    );
  }
});
