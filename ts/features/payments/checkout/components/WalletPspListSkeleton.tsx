import {
  Divider,
  HSpacer,
  IOSkeleton,
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

const PspSkeleton = ({ showFeatured }: PspSkeletonProps) => (
  <View
    style={{
      flex: 1,
      marginVertical: 8,
      justifyContent: "space-between",
      flexDirection: "row"
    }}
  >
    <View style={{ flex: 1 }}>
      <IOSkeleton shape="rectangle" height={16} width="50%" radius={4} />
      {showFeatured && (
        <>
          <VSpacer size={8} />
          <IOSkeleton shape="rectangle" height={16} width="40%" radius={4} />
        </>
      )}
    </View>
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <IOSkeleton shape="rectangle" height={16} width={26} radius={4} />
      <HSpacer size={8} />
      <IOSkeleton shape="rectangle" height={24} width={26} radius={20} />
    </View>
  </View>
);
