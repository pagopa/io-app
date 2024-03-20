import * as React from "react";
import { Image, ImageSourcePropType, View } from "react-native";
import Placeholder from "rn-placeholder";
import { IOColors } from "@pagopa/io-app-design-system";

type PaymentCardBankLogoProps = {
  source: ImageSourcePropType;
  height: number;
  accessibilityLabel?: string;
};

export const PaymentCardBankLogo = ({
  source,
  height,
  accessibilityLabel
}: PaymentCardBankLogoProps) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [imageWidth, setImageWidth] = React.useState<number>();
  return (
    <View>
      <Image
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        source={source}
        style={{
          height,
          width: imageWidth,
          resizeMode: "contain"
        }}
        onLoad={({ nativeEvent }) => {
          const scale = height / nativeEvent.source.height;
          setImageWidth(nativeEvent.source.width * scale);
        }}
        onLoadEnd={() => setIsLoading(false)}
      />
      {isLoading && (
        <View style={{ position: "absolute" }}>
          <Placeholder.Box
            color={IOColors["grey-200"]}
            animate="fade"
            radius={8}
            height={height}
            width={200}
          />
        </View>
      )}
    </View>
  );
};
