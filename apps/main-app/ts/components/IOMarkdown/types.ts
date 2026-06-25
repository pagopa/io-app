import { VSpacer } from "@pagopa/io-app-design-system";
import {
  AnyTxtNode,
  ASTNodeTypes,
  TxtBlockQuoteNode,
  TxtBreakNode,
  TxtCodeBlockNode,
  TxtCodeNode,
  TxtEmphasisNode,
  TxtHeaderNode,
  TxtHorizontalRuleNode,
  TxtHtmlNode,
  TxtImageNode,
  TxtLinkNode,
  TxtListItemNode,
  TxtListNode,
  TxtParagraphNode,
  TxtStrNode,
  TxtStrongNode
} from "@textlint/ast-node-types";
import { ComponentProps, ReactNode } from "react";

export type AnyTxtNodeWithSpacer =
  | AnyTxtNode
  | { key: string; size: number; type: "Spacer" };
export type IOMarkdownRenderRules = RendererMap;
export type Renderer = (txtNode: AnyTxtNodeWithSpacer) => ReactNode;

export type RuleRenderer<P, F extends Renderer | void = void> = (
  param: P,
  renderer: F,
  screenReaderEnabled: boolean
) => ReactNode;
type RendererMap = {
  [ASTNodeTypes.Comment]: RuleRenderer<null>;
  Spacer: RuleRenderer<ComponentProps<typeof VSpacer> & { key: string }>;
} & {
  [K in keyof TxtNodeMap]: RuleRenderer<TxtNodeMap[K], Renderer>;
};

type TxtNodeMap = {
  [ASTNodeTypes.BlockQuote]: TxtBlockQuoteNode;
  [ASTNodeTypes.Break]: TxtBreakNode;
  [ASTNodeTypes.Code]: TxtCodeNode;
  [ASTNodeTypes.CodeBlock]: TxtCodeBlockNode;
  [ASTNodeTypes.Emphasis]: TxtEmphasisNode;
  [ASTNodeTypes.Header]: TxtHeaderNode;
  [ASTNodeTypes.HorizontalRule]: TxtHorizontalRuleNode;
  [ASTNodeTypes.Html]: TxtHtmlNode;
  [ASTNodeTypes.Image]: TxtImageNode;
  [ASTNodeTypes.Link]: TxtLinkNode;
  [ASTNodeTypes.List]: TxtListNode;
  [ASTNodeTypes.ListItem]: TxtListItemNode;
  [ASTNodeTypes.Paragraph]: TxtParagraphNode;
  [ASTNodeTypes.Str]: TxtStrNode;
  [ASTNodeTypes.Strong]: TxtStrongNode;
};
