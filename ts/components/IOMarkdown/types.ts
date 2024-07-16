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
  AnyTxtNode
} from "@textlint/ast-node-types";
import { ReactNode, ComponentProps } from "react";

export type Renderer = (txtNode: AnyTxtNodeWithSpacer) => ReactNode;
export type RuleRenderer<P, F extends Renderer | void = void> = (
  param: P,
  renderer: F
) => ReactNode;
export type AnyTxtNodeWithSpacer =
  | AnyTxtNode
  | { type: "Spacer"; size: number; key: string };

export type IOMarkdownRenderRules = {
  [ASTNodeTypes.Header]: RuleRenderer<TxtHeaderNode, Renderer>;
  [ASTNodeTypes.Paragraph]: RuleRenderer<TxtParagraphNode, Renderer>;
  [ASTNodeTypes.Str]: RuleRenderer<TxtStrNode, Renderer>;
  [ASTNodeTypes.Strong]: RuleRenderer<TxtStrongNode, Renderer>;
  [ASTNodeTypes.Emphasis]: RuleRenderer<TxtEmphasisNode, Renderer>;
  [ASTNodeTypes.Comment]: RuleRenderer<null>;
  [ASTNodeTypes.Link]: RuleRenderer<TxtLinkNode, Renderer>;
  [ASTNodeTypes.List]: RuleRenderer<TxtListNode, Renderer>;
  [ASTNodeTypes.ListItem]: RuleRenderer<TxtListItemNode, Renderer>;
  [ASTNodeTypes.Image]: RuleRenderer<TxtImageNode, Renderer>;
  Spacer: RuleRenderer<ComponentProps<typeof VSpacer> & { key: string }>;
};
