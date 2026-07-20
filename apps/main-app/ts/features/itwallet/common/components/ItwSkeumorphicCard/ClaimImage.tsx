import {
  Blur,
  Canvas,
  Skia,
  Image as SkiaImage
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
    height: number;
    width: number;
  }>();

  const image = useMemo(() => {
    const base64Data = base64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
    const data = Skia.Data.fromBase64(base64Data);
    return Skia.Image.MakeImageFromEncoded(data);
  }, [base64]);

  return (
    <View
      onLayout={event => {
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
      style={{ flex: 1 }}
    >
      <Canvas style={{ flex: 1 }}>
        {dimensions && (
          <SkiaImage
            fit="contain"
            height={dimensions.height}
            image={image}
            width={dimensions.width}
            x={0}
            y={0}
          >
            <Blur blur={blur} />
          </SkiaImage>
        )}
      </Canvas>
    </View>
  );
};
