import {
  Divider,
  IOSkeleton,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { View } from "react-native";

type Props = {
  count?: number;
  hasIcons?: boolean;
};

export function CgnMerchantListSkeleton(props: Props) {
  const { hasIcons = false, count = 6 } = props;

  return (
    <View testID="CgnMerchantListSkeleton">
      {new Array(count).fill(null).map((_, index) => (
        <View key={index} testID={`CgnMerchantListSkeleton-Item-${index}`}>
          <View
            style={{
              paddingVertical: 13,
              paddingHorizontal: hasIcons
                ? 0
                : IOVisualCostants.appMarginDefault
            }}
          >
            <IOSkeleton
              height={24}
              radius={8}
              shape="rectangle"
              testID={`CgnMerchantListSkeleton-Placeholder-${index}`}
              width="100%"
            />
          </View>
          <Divider />
        </View>
      ))}
    </View>
  );
}
