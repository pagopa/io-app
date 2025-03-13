import {
  Divider,
  IOListItemStyles,
  IOListItemVisualParams,
  IOSkeleton,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { Fragment } from "react";
import { View } from "react-native";

export const InstitutionListItemSkeleton = () => (
  <View style={IOListItemStyles.listItem} accessible={false}>
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
  size?: number;
};

export const InstitutionListSkeleton = ({
  size = 3
}: InstitutionListSkeletonProps) => (
  <View testID="institutions-skeleton">
    {Array.from({ length: size }).map((_, index) => (
      <Fragment key={index}>
        <InstitutionListItemSkeleton />
        {index < size - 1 ? <Divider /> : undefined}
      </Fragment>
    ))}
  </View>
);
