import { ContentWrapper, VSpacer, WithTestID } from "@io-app/design-system";
import { ComponentProps } from "react";
import { Dimensions, View } from "react-native";

import { useFeatureColors } from "../../../../hooks/useFeatureColors";
import { servicesColors } from "./colors";
import { ServicesHeader, ServicesHeaderSkeleton } from "./ServicesHeader";

const WINDOW_HEIGHT = Dimensions.get("window").height;

export type ServicesHeaderSectionProps = WithTestID<
  | (ComponentProps<typeof ServicesHeader> & {
      extraBottomPadding?: number;
      isLoading?: false;
    })
  | {
      extraBottomPadding?: number;
      isLoading: true;
    }
>;

export const ServicesHeaderSection = ({
  extraBottomPadding,
  ...rest
}: ServicesHeaderSectionProps) => {
  const { header } = useFeatureColors(servicesColors);

  return (
    <View
      style={{
        backgroundColor: header.background,
        paddingBottom: extraBottomPadding,
        paddingTop: WINDOW_HEIGHT,
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
