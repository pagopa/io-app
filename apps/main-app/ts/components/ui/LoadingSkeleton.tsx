import { IOSkeleton, VStack } from "@io-app/design-system";
import I18n from "i18next";
import { DimensionValue, View } from "react-native";

type LoadingSkeletonProps = {
  lines?: number;
  testID?: string;
};

const skeletonLineWidths: Array<DimensionValue> = [
  "98%",
  "86%",
  "92%",
  "80%",
  "90%",
  "96%",
  "84%",
  "88%",
  "94%"
];

export const LoadingSkeleton = ({
  lines = skeletonLineWidths.length,
  testID
}: LoadingSkeletonProps) => (
  <View
    accessibilityHint={I18n.t("global.accessibility.activityIndicator.hint")}
    accessibilityLabel={I18n.t("global.accessibility.activityIndicator.label")}
    accessible={true}
    testID={testID}
  >
    <View
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      <VStack space={8}>
        {[...Array(lines)].map((_, i) => (
          <IOSkeleton
            height={21}
            key={`MD_SK_PB_${i}`}
            radius={4}
            shape="rectangle"
            width={skeletonLineWidths[i % skeletonLineWidths.length]}
          />
        ))}
      </VStack>
    </View>
  </View>
);
