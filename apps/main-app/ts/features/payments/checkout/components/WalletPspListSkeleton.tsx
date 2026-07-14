import { Divider, HSpacer, IOSkeleton, VSpacer } from "@io-app/design-system";
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
      <IOSkeleton height={16} radius={4} shape="rectangle" width="50%" />
      {showFeatured && (
        <>
          <VSpacer size={8} />
          <IOSkeleton height={16} radius={4} shape="rectangle" width="40%" />
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
      <IOSkeleton height={16} radius={4} shape="rectangle" width={26} />
      <HSpacer size={8} />
      <IOSkeleton height={24} radius={20} shape="rectangle" width={26} />
    </View>
  </View>
);
