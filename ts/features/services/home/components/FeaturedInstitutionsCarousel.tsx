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
    horizontal={true}
    ItemSeparatorComponent={() => <HSpacer size={CARD_SPACING} />}
    data={data}
    style={style.list}
    ListFooterComponent={() => <HSpacer size={48} />}
    showsHorizontalScrollIndicator={false}
    keyExtractor={(_, index) => `featured_institution_card_${index.toString()}`}
    decelerationRate="fast"
    snapToInterval={CARD_TOTAL_WIDTH}
    snapToAlignment="start"
    getItemLayout={(_, index) => ({
      offset: CARD_TOTAL_WIDTH * index,
      length: CARD_TOTAL_WIDTH,
      index
    })}
  />
);

const FeaturedInstitutionsCarousel = ({
  institutions,
  testID
}: FeaturedInstitutionsCarouselProps) => (
  <FeaturedInstitutionsCarouselBaseComponent
    testID={testID}
    data={institutions}
    renderItem={({ item }) => <FeaturedInstitutionCard {...item} />}
  />
);

const FeaturedInstitutionsCarouselSkeleton = ({ testID }: TestID) => (
  <FeaturedInstitutionsCarouselBaseComponent
    testID={testID}
    data={Array.from({ length: 3 })}
    renderItem={() => <FeaturedInstitutionCardSkeleton />}
    scrollEnabled
  />
);

export { FeaturedInstitutionsCarousel, FeaturedInstitutionsCarouselSkeleton };
