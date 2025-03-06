import {
  Canvas,
  Image as SkiaImage,
  Blur,
  Skia,
  Group,
  Mask
} from "@shopify/react-native-skia";
import { useMemo } from "react";

type BlurredImageProps = {
  base64: string;
  width: number;
  height: number;
  blur?: number;
};

export const BlurredImage = ({
  base64,
  width,
  height,
  blur = 0
}: BlurredImageProps) => {
  const base64Data = base64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

  const image = useMemo(() => {
    const data = Skia.Data.fromBase64(base64Data);
    return Skia.Image.MakeImageFromEncoded(data);
  }, [base64Data]);

  return (
    <Canvas
      style={{ flex: 1, aspectRatio: 1 }}
      accessibilityIgnoresInvertColors={true}
    >
      <Group>
        <Mask
          mask={
            <SkiaImage
              image={image}
              fit="cover"
              width={width}
              height={height}
            />
          }
          clip={true}
        >
          <SkiaImage
            image={image}
            fit="contain"
            x={-6}
            y={0}
            width={width}
            height={height}
          />
          <Blur blur={blur} />
        </Mask>
      </Group>
    </Canvas>
  );
};
