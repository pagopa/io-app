import { Fragment } from "react";
import { View } from "react-native";
import {
  Divider,
  IOListItemStyles,
  IOListItemVisualParams,
  IOSkeleton,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";

type ServiceListSkeletonProps = {
  /**
   * Whether to show the avatar. The avatar is shown by default.
   * Setting this to `false` hides the avatar.
   */
  avatarShown?: boolean;
  /**
   * Whether to show the section title. The section title is hidden by default.
   * Setting this to `true` shows the section title.
   */
  sectionTitleShown?: boolean;
  /**
   * The number of items in the list. The default value is `3`.
   */
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
        <IOSkeleton shape="rectangle" radius={8} width={62} height={16} />
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
            shape="square"
            size={IOVisualCostants.avatarSizeSmall}
            radius={IOVisualCostants.avatarRadiusSizeSmall}
          />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <IOSkeleton shape="rectangle" radius={8} width={"60%"} height={16} />
      </View>
    </View>
  </View>
);
