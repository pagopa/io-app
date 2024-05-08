import React, { ComponentProps } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  ContentWrapper,
  IOColors,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import { ServicesHeader, ServicesHeaderSkeleton } from "./ServicesHeader";

const WINDOW_HEIGHT = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors["grey-50"]
  }
});

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

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: extraBottomPadding,
          paddingTop: WINDOW_HEIGHT + headerHeight,
          marginTop: -WINDOW_HEIGHT
        }
      ]}
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
