import {
  Divider,
  IOListItemStyles,
  IOListItemVisualParams,
  IOSkeleton,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Fragment } from "react";
import { View } from "react-native";

const InstitutionListItemSkeleton = () => (
  <View
    accessible={true}
    accessibilityState={{ busy: true }}
    style={IOListItemStyles.listItem}
  >
    <View style={IOListItemStyles.listItemInner}>
      <View style={{ marginRight: IOListItemVisualParams.iconMargin }}>
        <IOSkeleton
          shape="square"
          size={IOVisualCostants.avatarSizeSmall}
          radius={IOVisualCostants.avatarRadiusSizeSmall}
        />
      </View>
      <View style={{ flex: 1 }}>
        <IOSkeleton shape="rectangle" radius={8} width={"60%"} height={16} />
      </View>
    </View>
  </View>
);

type InstitutionListSkeletonProps = {
  showSectionTitle?: boolean;
  size?: number;
};

export const InstitutionListSkeleton = ({
  showSectionTitle = false,
  size = 3
}: InstitutionListSkeletonProps) => (
  <View testID="institutions-skeleton">
    {showSectionTitle && (
      <View accessible={true} accessibilityState={{ busy: true }}>
        <VSpacer size={16} />
        <IOSkeleton shape="rectangle" radius={8} width={62} height={16} />
        <VSpacer size={16} />
      </View>
    )}
    {Array.from({ length: size }).map((_, index) => (
      <Fragment key={index}>
        <InstitutionListItemSkeleton />
        {index < size - 1 ? <Divider /> : undefined}
      </Fragment>
    ))}
  </View>
);
