import {
  ContentWrapper,
  H6,
  IOPictograms,
  Pictogram,
  VStack,
  WithTestID
} from "@io-app/design-system";

export type EmptyListProps = WithTestID<{
  pictogram: IOPictograms;
  title: string;
}>;

export const EmptyList = ({ pictogram, title, testID }: EmptyListProps) => (
  <ContentWrapper testID={testID}>
    <VStack space={24} style={{ alignItems: "center" }}>
      <Pictogram name={pictogram} size={120} />
      <H6 style={{ textAlign: "center" }}>{title}</H6>
    </VStack>
  </ContentWrapper>
);
