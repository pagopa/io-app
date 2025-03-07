import {
  Canvas,
  Image as SkiaImage,
  Blur,
  Skia
} from "@shopify/react-native-skia";
import { useMemo, useState } from "react";

type BlurredImageProps = {
  base64: string;
  width: number;
  height: number;
  blur?: number;
};

export const BlurredImage = ({ base64, blur = 0 }: BlurredImageProps) => {
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
    <Canvas
      style={{ flex: 1 }}
      onLayout={event => {
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
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
  );
};
