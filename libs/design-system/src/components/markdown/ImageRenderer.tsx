import { useLayoutEffect, useState } from "react";
import { Dimensions, Image } from "react-native";

import type { MarkdownNode } from "./types";

import { IOVisualCostants } from "../../core";

type ImageRendererProps = {
  node: MarkdownNode;
};

/**
 * Stateful component that renders a remote image with auto-sizing. Uses
 * `Image.getSize()` to determine intrinsic dimensions, then constrains width to
 * the available screen width.
 */
export const ImageRenderer = ({ node }: ImageRendererProps) => {
  const src = node.attributes?.src ?? "";
  const alt = node.attributes?.alt ?? "";

  const [imageSize, setImageSize] = useState({
    width: 0,
    aspectRatio: 1
  });

  const screenWidth =
    Dimensions.get("window").width - IOVisualCostants.appMarginDefault * 2;

  useLayoutEffect(() => {
    if (!src) {
      return;
    }
    Image.getSize(src, (width, height) => {
      const aspectRatio = width / height;
      const constrainedWidth = Math.min(width, screenWidth);
      setImageSize({ width: constrainedWidth, aspectRatio });
    });
  }, [screenWidth, src]);

  if (!src) {
    return null;
  }

  return (
    <Image
      accessibilityIgnoresInvertColors
      accessibilityLabel={alt}
      key={node.key}
      resizeMode="contain"
      source={{ uri: src }}
      style={imageSize}
    />
  );
};
