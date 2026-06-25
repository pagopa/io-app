import {
  HSpacer,
  IOSpacingScale,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { FlatList, FlatListProps, StyleSheet } from "react-native";

import { TestID, WithTestID } from "../../../../types/WithTestID";
import {
  CARD_WIDTH,
  FeaturedInstitutionCard,
  FeaturedInstitutionCardProps,
  FeaturedInstitutionCardSkeleton
} from "./FeaturedInstitutionCard";

export type FeaturedInstitutionsCarouselProps = WithTestID<{
  institutions: Array<FeaturedInstitutionCardProps>;
}>;

const CARD_SPACING: IOSpacingScale = 8;
const CARD_TOTAL_WIDTH = CARD_WIDTH + CARD_SPACING;

const style = StyleSheet.create({
  list: {
    marginHorizontal: -IOVisualCostants.appMarginDefault,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

const FeaturedInstitutionsCarouselBaseComponent = <T,>({
  data,
  ...props
}: WithTestID<FlatListProps<T>>) => (
  <FlatList
    {...props}
    data={data}
    decelerationRate="fast"
    getItemLayout={(_, index) => ({
      offset: CARD_TOTAL_WIDTH * index,
      length: CARD_TOTAL_WIDTH,
      index
    })}
    horizontal={true}
    ItemSeparatorComponent={() => <HSpacer size={CARD_SPACING} />}
    keyExtractor={(_, index) => `featured_institution_card_${index.toString()}`}
    ListFooterComponent={() => <HSpacer size={48} />}
    showsHorizontalScrollIndicator={false}
    snapToAlignment="start"
    snapToInterval={CARD_TOTAL_WIDTH}
    style={style.list}
  />
);

const FeaturedInstitutionsCarousel = ({
  institutions,
  testID
}: FeaturedInstitutionsCarouselProps) => (
  <FeaturedInstitutionsCarouselBaseComponent
    data={institutions}
    renderItem={({ item }) => <FeaturedInstitutionCard {...item} />}
    testID={testID}
  />
);

const FeaturedInstitutionsCarouselSkeleton = ({ testID }: TestID) => (
  <FeaturedInstitutionsCarouselBaseComponent
    data={Array.from({ length: 3 })}
    renderItem={() => <FeaturedInstitutionCardSkeleton />}
    scrollEnabled
    testID={testID}
  />
);

export { FeaturedInstitutionsCarousel, FeaturedInstitutionsCarouselSkeleton };
