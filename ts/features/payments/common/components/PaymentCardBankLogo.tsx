import { IOColors, WithTestID } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Image, View } from "react-native";
import Placeholder from "rn-placeholder";
import { getBankLogosCdnUri } from "../../../../components/ui/utils/strings";

type PaymentCardBankLogoProps = {
  abiCode: string;
  height: number;
  accessibilityLabel?: string;
};

export const PaymentCardBankLogo = ({
  abiCode,
  height,
  accessibilityLabel,
  testID
}: WithTestID<PaymentCardBankLogoProps>) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [imageWidth, setImageWidth] = React.useState<number>(50);
  return (
    <View testID={testID}>
      <Image
        accessibilityIgnoresInvertColors
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        source={{ uri: getBankLogosCdnUri(abiCode) }}
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
