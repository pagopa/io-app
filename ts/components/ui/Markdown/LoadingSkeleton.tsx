import React from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";

type LoadingSkeletonProps = {
  testID?: string;
};

export const LoadingSkeleton = ({ testID }: LoadingSkeletonProps) => (
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
      <Placeholder.Box
        width={"98%"}
        animate={"fade"}
        color={IOColors["grey-100"]}
        height={21}
        radius={4}
      />
      <VSpacer size={8} />
      <Placeholder.Box
        width={"86%"}
        animate={"fade"}
        color={IOColors["grey-100"]}
        height={21}
        radius={4}
      />
      <VSpacer size={8} />
      <Placeholder.Box
        width={"92%"}
        animate={"fade"}
        color={IOColors["grey-100"]}
        height={21}
        radius={4}
      />
      <VSpacer size={8} />
      <Placeholder.Box
        width={"80%"}
        animate={"fade"}
        color={IOColors["grey-100"]}
        height={21}
        radius={4}
      />
      <VSpacer size={8} />
      <Placeholder.Box
        width={"90%"}
        animate={"fade"}
        color={IOColors["grey-100"]}
        height={21}
        radius={4}
      />
      <VSpacer size={8} />
      <Placeholder.Box
        width={"96%"}
        animate={"fade"}
        color={IOColors["grey-100"]}
        height={21}
        radius={4}
      />
      <VSpacer size={8} />
      <Placeholder.Box
        width={"84%"}
        animate={"fade"}
        color={IOColors["grey-100"]}
        height={21}
        radius={4}
      />
      <VSpacer size={8} />
      <Placeholder.Box
        width={"88%"}
        animate={"fade"}
        color={IOColors["grey-100"]}
        height={21}
        radius={4}
      />
      <VSpacer size={8} />
      <Placeholder.Box
        width={"94%"}
        animate={"fade"}
        color={IOColors["grey-100"]}
        height={21}
        radius={4}
      />
    </View>
  </View>
);
