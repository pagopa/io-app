declare module "simple-markdown" {
  export const defaultRules = Object;

  export type SingleASTNode = {
    type: string,
    [key: string]: any
  };

  export type ASTNode = SingleASTNode | Array<SingleASTNode>;

  export type State = {
    [key: string]: any
  };

  export type Parser = (
    source: string,
    state?: ?State
  ) => ASTNode;

  export type Output<Result> = (
    node: ASTNode,
    state?: ?State
  ) => Result;

  export type NodeOutput<Result> = (
    node: SingleASTNode,
    nestedOutput: Output<Result>,
    state: State
  ) => Result;

  export type ReactOutput = Output<React.ReactNode>;

  export type ReactNodeOutput = NodeOutput<React.ReactNode>;

  export function parserFor(rules: ParserRules, defaultState?: ?State): Parser

  export function ruleOutput<Rule extends Object>(rules: OutputRules<Rule>, param: $Keys<Rule>): NodeOutput<any>

  export function reactFor(ReactNodeOutput): ReactOutput
}
