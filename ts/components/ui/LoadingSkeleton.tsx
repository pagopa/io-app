import { IOSkeleton, VStack } from "@pagopa/io-app-design-system";
import { DimensionValue, View } from "react-native";
import I18n from "i18next";

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
    accessible={true}
    accessibilityLabel={I18n.t("global.accessibility.activityIndicator.label")}
    accessibilityHint={I18n.t("global.accessibility.activityIndicator.hint")}
    testID={testID}
  >
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden={true}
    >
      <VStack space={8}>
        {[...Array(lines)].map((_, i) => (
          <IOSkeleton
            key={`MD_SK_PB_${i}`}
            shape="rectangle"
            width={skeletonLineWidths[i % skeletonLineWidths.length]}
            height={21}
            radius={4}
          />
        ))}
      </VStack>
    </View>
  </View>
);
