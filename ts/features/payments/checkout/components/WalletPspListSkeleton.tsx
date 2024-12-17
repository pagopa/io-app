import {
  Divider,
  HSpacer,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import Placeholder from "rn-placeholder";

export const WalletPspListSkeleton = () => (
  <>
    <PspSkeleton showFeatured />
    <Divider />
    <PspSkeleton />
    <Divider />
    <PspSkeleton />
  </>
);

type PspSkeletonProps = {
  showFeatured?: boolean;
};

export const PspSkeleton = ({ showFeatured }: PspSkeletonProps) => (
  <View
    style={[IOStyles.flex, IOStyles.rowSpaceBetween, { marginVertical: 8 }]}
  >
    <View style={IOStyles.flex}>
      <Placeholder.Box height={18} width="50%" radius={4} />
      {showFeatured && (
        <>
          <VSpacer size={8} />
          <Placeholder.Line width="40%" />
        </>
      )}
    </View>
    <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
      <Placeholder.Box height={18} width={26} radius={4} />
      <HSpacer size={8} />
      <Placeholder.Box height={26} width={26} radius={20} />
    </View>
  </View>
);
