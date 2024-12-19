import React, { ComponentProps } from "react";
import { Dimensions, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  ContentWrapper,
  IOColors,
  useIOTheme,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import { ServicesHeader, ServicesHeaderSkeleton } from "./ServicesHeader";

const WINDOW_HEIGHT = Dimensions.get("window").height;

export type ServicesHeaderSectionProps = WithTestID<
  | ({
      isLoading?: false;
      extraBottomPadding?: number;
    } & ComponentProps<typeof ServicesHeader>)
  | {
      isLoading: true;
      extraBottomPadding?: number;
    }
>;

export const ServicesHeaderSection = ({
  extraBottomPadding,
  ...rest
}: ServicesHeaderSectionProps) => {
  const headerHeight = useHeaderHeight();
  const theme = useIOTheme();

  return (
    <View
      style={{
        backgroundColor: IOColors[theme["appBackground-secondary"]],
        paddingBottom: extraBottomPadding,
        paddingTop: WINDOW_HEIGHT + headerHeight,
        marginTop: -WINDOW_HEIGHT
      }}
    >
      <ContentWrapper>
        {rest.isLoading ? (
          <ServicesHeaderSkeleton />
        ) : (
          <ServicesHeader {...rest} />
        )}
        <VSpacer size={16} />
      </ContentWrapper>
    </View>
  );
};
