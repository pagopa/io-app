import { IOSkeleton, VSpacer } from "@pagopa/io-app-design-system";
import { View } from "react-native";

const IdPayOnboardingDescriptionSkeleton = () => (
  <>
    {Array.from({ length: 30 }).map((_, i) => (
      <View key={i}>
        <IOSkeleton shape="rectangle" width="100%" height={21} radius={4} />
        <VSpacer size={8} />
        <IOSkeleton shape="rectangle" width="100%" height={21} radius={4} />
        <VSpacer size={8} />
        <IOSkeleton shape="rectangle" width="90%" height={21} radius={4} />
        <VSpacer size={8} />
      </View>
    ))}
  </>
);

export { IdPayOnboardingDescriptionSkeleton };
