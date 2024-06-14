import React, { ComponentProps, useCallback, useMemo } from "react";
import {
  Body,
  ButtonLinkProps,
  ButtonSolidProps,
  Divider,
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
import { IOScrollView } from "../ui/IOScrollView";

type IOScrollViewActions = ComponentProps<typeof IOScrollView>["actions"];

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

  const actions = useMemo<IOScrollViewActions>(() => {
    if (secondaryActionProps) {
      return {
        type: "TwoButtons",
        primary: primaryActionProps,
        secondary: secondaryActionProps
      };
    }

    return {
      type: "SingleButton",
      primary: primaryActionProps
    };
  }, [primaryActionProps, secondaryActionProps]);

  return (
    <IOScrollView actions={actions}>
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
    </IOScrollView>
  );
};

export default ScreenWithListItems;
