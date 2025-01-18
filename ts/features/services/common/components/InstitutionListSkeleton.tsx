import { Fragment } from "react";
import { View } from "react-native";
import {
  Divider,
  IOListItemStyles,
  IOListItemVisualParams,
  IOStyles,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import Placeholder from "rn-placeholder";

export const InstitutionListItemSkeleton = () => (
  <View style={IOListItemStyles.listItem} accessible={false}>
    <View style={IOListItemStyles.listItemInner}>
      <View style={{ marginRight: IOListItemVisualParams.iconMargin }}>
        <Placeholder.Box
          animate="fade"
          height={IOVisualCostants.avatarSizeSmall}
          width={IOVisualCostants.avatarSizeSmall}
          radius={100}
        />
      </View>
      <View style={IOStyles.flex}>
        <Placeholder.Box animate="fade" radius={8} width={"60%"} height={16} />
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
