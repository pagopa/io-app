import React, { useCallback } from "react";
import {
  Body,
  ButtonLinkProps,
  ButtonSolidProps,
  Divider,
  GradientScrollView,
  H2,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import { FlatList } from "react-native-gesture-handler";
import { ListRenderItemInfo } from "react-native";
import {
  BodyProps,
  ComposedBodyFromArray
} from "../core/typography/ComposedBodyFromArray";

export type PropsScreenWithListItems = {
  title?: string;
  subtitle?: string | Array<BodyProps>;
  renderItems: Array<ListItemInfo>;
  listItemHeaderLabel?: string;
  primaryActionProps: Pick<
    ButtonSolidProps,
    "label" | "accessibilityLabel" | "onPress" | "testID" | "fullWidth"
  >;
  secondaryActionProps?: Pick<
    ButtonLinkProps,
    "label" | "accessibilityLabel" | "onPress" | "testID"
  >;
  isHeaderVisible?: boolean;
};

const ScreenWithListItems = (props: PropsScreenWithListItems) => {
  const {
    title,
    subtitle,
    renderItems,
    listItemHeaderLabel,
    primaryActionProps,
    secondaryActionProps
  } = props;

  const keyExtractor = useCallback(
    (item: ListItemInfo, index: number) => `${item.value}-${index}`,
    []
  );

  const renderProfileNavItem = useCallback(
    ({ item }: ListRenderItemInfo<ListItemInfo>) => {
      const { label, value } = item;
      const accessibilityLabel = `${label}; ${value}`;

      return <ListItemInfo {...item} accessibilityLabel={accessibilityLabel} />;
    },
    []
  );

  return (
    <GradientScrollView
      primaryActionProps={primaryActionProps}
      secondaryActionProps={secondaryActionProps}
    >
      <H2>{title}</H2>
      {subtitle && (
        <>
          <VSpacer size={8} />
          {typeof subtitle === "string" ? (
            <Body>{subtitle}</Body>
          ) : (
            <ComposedBodyFromArray body={subtitle} />
          )}
        </>
      )}
      {listItemHeaderLabel && (
        <>
          <VSpacer size={16} />
          <ListItemHeader label={listItemHeaderLabel} />
        </>
      )}
      <FlatList
        scrollEnabled={false}
        keyExtractor={keyExtractor}
        data={renderItems}
        ItemSeparatorComponent={Divider}
        renderItem={renderProfileNavItem}
      />
    </GradientScrollView>
  );
};

export default ScreenWithListItems;
