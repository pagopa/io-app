import type { RenderResult } from "@testing-library/react-native";

import { IOThemeContextProvider } from "@io-app/design-system";
import { ComponentType } from "react";
import { StyleSheet } from "react-native";

/**
 * Renders `Component` in dark mode, overriding the light theme of
 * `renderScreenWithNavigationStoreContext`
 */
export const withDarkTheme = <P extends object>(
  Component: ComponentType<P>
) => {
  const DarkThemed = (props: P) => (
    <IOThemeContextProvider theme="dark">
      <Component {...props} />
    </IOThemeContextProvider>
  );
  return DarkThemed;
};

type RenderedNode = Exclude<RenderedTree, Array<unknown> | null>;
type RenderedTree = ReturnType<RenderResult["toJSON"]>;

/** Host nodes of a rendered tree (`toJSON()`) that match `predicate` */
export const findAllNodes = (
  tree: RenderedTree,
  predicate: (node: RenderedNode) => boolean
): ReadonlyArray<RenderedNode> => {
  if (tree === null) {
    return [];
  }
  if (Array.isArray(tree)) {
    return tree.flatMap(node => findAllNodes(node, predicate));
  }
  const children = (tree.children ?? []).filter(
    (child): child is RenderedNode => typeof child !== "string"
  );
  return [
    ...(predicate(tree) ? [tree] : []),
    ...children.flatMap(child => findAllNodes(child, predicate))
  ];
};

/** Host nodes whose flattened style has every given value */
export const findAllByStyle = (
  tree: RenderedTree,
  style: Record<string, unknown>
) =>
  findAllNodes(tree, node => {
    const flattened: Record<string, unknown> =
      StyleSheet.flatten(node.props.style) ?? {};
    return Object.entries(style).every(
      ([key, value]) => flattened[key] === value
    );
  });
