import {
  Divider,
  HSpacer,
  IOSkeleton,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { View } from "react-native";

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
      <IOSkeleton shape="rectangle" height={16} width="50%" radius={4} />
      {showFeatured && (
        <>
          <VSpacer size={8} />
          <IOSkeleton shape="rectangle" height={16} width="40%" radius={4} />
        </>
      )}
    </View>
    <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
      <IOSkeleton shape="rectangle" height={16} width={26} radius={4} />
      <HSpacer size={8} />
      <IOSkeleton shape="rectangle" height={24} width={26} radius={20} />
    </View>
  </View>
);
