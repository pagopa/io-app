import { VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";

const OnboardingDescriptionMarkdownSkeleton = () => (
  <>
    {Array.from({ length: 30 }).map((_, i) => (
      <View key={i}>
        <Placeholder.Box
          width={"100%"}
          animate={"fade"}
          height={21}
          radius={4}
        />
        <VSpacer size={8} />
        <Placeholder.Box
          width={"100%"}
          animate={"fade"}
          height={21}
          radius={4}
        />
        <VSpacer size={8} />
        <Placeholder.Box
          width={"90%"}
          animate={"fade"}
          height={21}
          radius={4}
        />
        <VSpacer size={8} />
      </View>
    ))}
  </>
);

export { OnboardingDescriptionMarkdownSkeleton };
