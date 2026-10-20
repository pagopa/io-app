import { ContentWrapper, H6, VStack, WithTestID } from "@io-app/design-system";

import {
  AnimatedPictogram,
  IOAnimatedPictograms
} from "../../../../components/ui/AnimatedPictogram";

export type EmptyListProps = WithTestID<{
  pictogram: IOAnimatedPictograms;
  title: string;
}>;

export const EmptyList = ({ pictogram, title, testID }: EmptyListProps) => (
  <ContentWrapper testID={testID}>
    <VStack space={24} style={{ alignItems: "center" }}>
      <AnimatedPictogram name={pictogram} size={120} />
      <H6 style={{ textAlign: "center" }}>{title}</H6>
    </VStack>
  </ContentWrapper>
);
