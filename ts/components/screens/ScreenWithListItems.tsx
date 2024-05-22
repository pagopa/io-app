import React, { useCallback } from "react";
import {
  Body,
  ButtonSolid,
  ButtonSolidProps,
  ContentWrapper,
  Divider,
  H2,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
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
  action: Pick<
    ButtonSolidProps,
    "label" | "accessibilityLabel" | "onPress" | "testID" | "fullWidth"
  >;

  isHeaderVisible?: boolean;
};

const ScreenWithListItems = (props: PropsScreenWithListItems) => {
  const {
    title,
    subtitle,
    renderItems,
    listItemHeaderLabel,
    action,
    isHeaderVisible
  } = props;

  const keyExtractor = useCallback(
    (item: ListItemInfo, index: number) => `${item.value}-${index}`,
    []
  );

  const renderProfileNavItem = useCallback(
    ({ item }: ListRenderItemInfo<ListItemInfo>) => {
      const { label, value, testID, icon } = item;
      const accessibilityLabel = `${label}; ${value}`;

      return (
        <ListItemInfo
          testID={testID}
          label={label}
          value={value}
          icon={icon}
          accessibilityLabel={accessibilityLabel}
        />
      );
    },
    []
  );

  return (
    <>
      <SafeAreaView
        style={{ flexGrow: 1 }}
        edges={isHeaderVisible ? ["bottom"] : undefined}
      >
        <ContentWrapper>
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
        </ContentWrapper>
      </SafeAreaView>
      <ContentWrapper>
        <ButtonSolid fullWidth {...action} />
      </ContentWrapper>
    </>
  );
};

export default ScreenWithListItems;
