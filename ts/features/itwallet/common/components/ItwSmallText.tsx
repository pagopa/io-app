import { IOToast, LabelSmall } from "@pagopa/io-app-design-system";
import React, { ReactNode } from "react";
import Markdown, { ASTNode } from "react-native-markdown-display";
import I18n from "../../../../i18n";
import { openWebUrl } from "../../../../utils/url";

type ItwSmallTextProps = {
  children?: string;
};

const rules = {
  paragraph: (node: ASTNode, children: Array<ReactNode>) => (
    <LabelSmall
      key={node.key}
      weight={"Regular"}
      color={"bluegrey"}
      testID="itwSmallTextParagraph"
    >
      {children}
    </LabelSmall>
  ),
  link: (node: ASTNode, children: Array<ReactNode>) => (
    <LabelSmall
      key={node.key}
      color={"blue"}
      onPress={() =>
        openWebUrl(node.attributes.href, () =>
          IOToast.error(I18n.t("global.jserror.title"))
        )
      }
      numberOfLines={1}
      testID="itwSmallTextLink"
    >
      {children}
    </LabelSmall>
  )
};

/**
 * This component renders a small text, with optional link, using react components starting from a markdown text.
 * Main components are mapped into rules object.
 * @param children - contains the text to be converted in react elements.
 */
export const ItwSmallText: React.FC<ItwSmallTextProps> = ({ children }) => (
  <Markdown rules={rules}>{children}</Markdown>
);
