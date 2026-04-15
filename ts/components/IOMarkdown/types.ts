import { VSpacer } from "@pagopa/io-app-design-system";
import {
  TxtHeaderNode,
  TxtListNode,
  TxtListItemNode,
  TxtParagraphNode,
  TxtStrNode,
  ASTNodeTypes,
  TxtStrongNode,
  TxtEmphasisNode,
  TxtLinkNode,
  TxtImageNode,
  TxtBlockQuoteNode,
  TxtCodeBlockNode,
  TxtCodeNode,
  TxtBreakNode,
  TxtHtmlNode,
  TxtHorizontalRuleNode,
  AnyTxtNode
} from "@textlint/ast-node-types";
import { ReactNode, ComponentProps } from "react";

export type Renderer = (txtNode: AnyTxtNodeWithSpacer) => ReactNode;
export type RuleRenderer<P, F extends Renderer | void = void> = (
  param: P,
  renderer: F,
  screenReaderEnabled: boolean
) => ReactNode;
export type AnyTxtNodeWithSpacer =
  | AnyTxtNode
  | { type: "Spacer"; size: number; key: string };

type TxtNodeMap = {
  [ASTNodeTypes.Header]: TxtHeaderNode;
  [ASTNodeTypes.Paragraph]: TxtParagraphNode;
  [ASTNodeTypes.Str]: TxtStrNode;
  [ASTNodeTypes.Strong]: TxtStrongNode;
  [ASTNodeTypes.Emphasis]: TxtEmphasisNode;
  [ASTNodeTypes.Link]: TxtLinkNode;
  [ASTNodeTypes.List]: TxtListNode;
  [ASTNodeTypes.ListItem]: TxtListItemNode;
  [ASTNodeTypes.Image]: TxtImageNode;
  [ASTNodeTypes.BlockQuote]: TxtBlockQuoteNode;
  [ASTNodeTypes.CodeBlock]: TxtCodeBlockNode;
  [ASTNodeTypes.Code]: TxtCodeNode;
  [ASTNodeTypes.Break]: TxtBreakNode;
  [ASTNodeTypes.Html]: TxtHtmlNode;
  [ASTNodeTypes.HorizontalRule]: TxtHorizontalRuleNode;
};
type RendererMap = {
  [K in keyof TxtNodeMap]: RuleRenderer<TxtNodeMap[K], Renderer>;
} & {
  [ASTNodeTypes.Comment]: RuleRenderer<null>;
  Spacer: RuleRenderer<ComponentProps<typeof VSpacer> & { key: string }>;
};

export type IOMarkdownRenderRules = RendererMap;
