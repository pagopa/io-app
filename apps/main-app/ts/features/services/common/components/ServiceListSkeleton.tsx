import {
  Divider,
  IOListItemStyles,
  IOListItemVisualParams,
  IOSkeleton,
  IOVisualCostants,
  VSpacer
} from "@io-app/design-system";
import { Fragment } from "react";
import { View } from "react-native";

type ServiceListSkeletonProps = {
  /**
   * Whether to show the avatar. The avatar is shown by default. Setting this to
   * `false` hides the avatar.
   */
  avatarShown?: boolean;
  /**
   * Whether to show the section title. The section title is hidden by default.
   * Setting this to `true` shows the section title.
   */
  sectionTitleShown?: boolean;
  /** The number of items in the list. The default value is `3`. */
  size?: number;
};

export const ServiceListSkeleton = ({
  avatarShown = true,
  sectionTitleShown = false,
  size = 3
}: ServiceListSkeletonProps) => (
  <View testID="service-list-skeleton">
    {sectionTitleShown && (
      <>
        <VSpacer size={16} />
        <IOSkeleton height={16} radius={8} shape="rectangle" width={62} />
        <VSpacer size={16} />
      </>
    )}
    {Array.from({ length: size }).map((_, index) => (
      <Fragment key={index}>
        <ServiceListItemSkeleton avatarShown={avatarShown} />
        {index < size - 1 ? <Divider /> : undefined}
      </Fragment>
    ))}
  </View>
);

const ServiceListItemSkeleton = ({
  avatarShown = true
}: Pick<ServiceListSkeletonProps, "avatarShown">) => (
  <View style={IOListItemStyles.listItem}>
    <View style={IOListItemStyles.listItemInner}>
      {avatarShown && (
        <View style={{ marginRight: IOListItemVisualParams.iconMargin }}>
          <IOSkeleton
            radius={IOVisualCostants.avatarRadiusSizeSmall}
            shape="square"
            size={IOVisualCostants.avatarSizeSmall}
          />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <IOSkeleton height={16} radius={8} shape="rectangle" width={"60%"} />
      </View>
    </View>
  </View>
);
