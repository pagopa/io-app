import React, { ComponentProps, useMemo } from "react";
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
import { View } from "react-native";
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

const ItemsList = ({ items }: { items: Array<ListItemInfo> }) => (
  <View>
    {items.map((item, index) => (
      <View key={`${item.value}-${index}`}>
        <ListItemInfo
          {...item}
          accessibilityLabel={`${item.label}; ${item.value}`}
        />
        {index < items.length - 1 && <Divider />}
      </View>
    ))}
  </View>
);

const ScreenWithListItems = (props: PropsScreenWithListItems) => {
  const {
    title,
    subtitle,
    renderItems,
    listItemHeaderLabel,
    primaryActionProps,
    secondaryActionProps
  } = props;

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
      <ItemsList items={renderItems} />
    </IOScrollView>
  );
};

export default ScreenWithListItems;
