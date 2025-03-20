import { Fragment } from "react";
import { View } from "react-native";
import {
  Divider,
  IOListItemStyles,
  IOStyles
} from "@pagopa/io-app-design-system";
import Placeholder from "rn-placeholder";

const ServiceListItemSkeleton = () => (
  <View
    accessible={true}
    accessibilityState={{ busy: true }}
    style={IOListItemStyles.listItem}
  >
    <View style={IOListItemStyles.listItemInner}>
      <View style={IOStyles.flex}>
        <Placeholder.Box animate="fade" radius={8} width={"60%"} height={16} />
      </View>
    </View>
  </View>
);

type ServiceListSkeletonProps = {
  size?: number;
};

export const ServiceListSkeleton = ({ size = 3 }: ServiceListSkeletonProps) => (
  <View testID="intitution-services-list-skeleton">
    {Array.from({ length: size }).map((_, index) => (
      <Fragment key={index}>
        <ServiceListItemSkeleton />
        {index < size - 1 ? <Divider /> : undefined}
      </Fragment>
    ))}
  </View>
);
