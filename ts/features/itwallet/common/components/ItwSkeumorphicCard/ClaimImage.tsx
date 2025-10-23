import {
  Canvas,
  Image as SkiaImage,
  Blur,
  Skia
} from "@shopify/react-native-skia";
import { useMemo, useState } from "react";
import { View } from "react-native";

type ClaimImageProps = {
  base64: string;
  blur?: number;
};

/**
 * Renders an image from a base64 encoded string with an optional blur effect.
 * The image is displayed on a Skia canvas, and the blur level can be adjusted
 * via the `blur` prop.
 */
export const ClaimImage = ({ base64, blur = 0 }: ClaimImageProps) => {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>();

  const image = useMemo(() => {
    const base64Data = base64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
    const data = Skia.Data.fromBase64(base64Data);
    return Skia.Image.MakeImageFromEncoded(data);
  }, [base64]);

  return (
    <View
      style={{ flex: 1 }}
      onLayout={event => {
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
      <Canvas style={{ flex: 1 }}>
        {dimensions && (
          <SkiaImage
            image={image}
            fit="contain"
            x={0}
            y={0}
            width={dimensions.width}
            height={dimensions.height}
          >
            <Blur blur={blur} />
          </SkiaImage>
        )}
      </Canvas>
    </View>
  );
};
