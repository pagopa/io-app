import { Fragment } from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";

type LoadingSkeletonProps = {
  lines?: number;
  testID?: string;
};

const skeletonLineWidths = [
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
      {[...Array(lines)].map((_, i) => (
        <Fragment key={`MD_SK_RF_${i}`}>
          <Placeholder.Box
            width={skeletonLineWidths[i % skeletonLineWidths.length]}
            animate={"fade"}
            color={IOColors["grey-100"]}
            height={21}
            radius={4}
            key={`MD_SK_PB_${i}`}
          />
          {i + 1 < lines && <VSpacer size={8} key={`MD_SK_VS_${i}`} />}
        </Fragment>
      ))}
    </View>
  </View>
);
