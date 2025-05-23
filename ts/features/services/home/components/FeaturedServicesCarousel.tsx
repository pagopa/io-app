import {
  HSpacer,
  IOSpacingScale,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { FlatList, FlatListProps, StyleSheet } from "react-native";
import { TestID, WithTestID } from "../../../../types/WithTestID";
import {
  CARD_WIDTH,
  FeaturedServiceCard,
  FeaturedServiceCardProps,
  FeaturedServiceCardSkeleton
} from "./FeaturedServiceCard";

export type FeaturedServicesCarouselProps = WithTestID<{
  services: Array<FeaturedServiceCardProps>;
}>;

const CARD_SPACING: IOSpacingScale = 8;
const CARD_TOTAL_WIDTH = CARD_WIDTH + CARD_SPACING;

const style = StyleSheet.create({
  list: {
    marginHorizontal: -IOVisualCostants.appMarginDefault,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

const FeaturedServicesCarouselBaseComponent = <T,>({
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
    keyExtractor={(_, index) => `featured_service_card_${index.toString()}`}
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

const FeaturedServicesCarousel = ({
  services,
  testID
}: FeaturedServicesCarouselProps) => (
  <FeaturedServicesCarouselBaseComponent
    testID={testID}
    data={services}
    renderItem={({ item }) => <FeaturedServiceCard {...item} />}
  />
);

const FeaturedServicesCarouselSkeleton = ({ testID }: TestID) => (
  <FeaturedServicesCarouselBaseComponent
    testID={testID}
    data={Array.from({ length: 5 })}
    renderItem={() => <FeaturedServiceCardSkeleton />}
    scrollEnabled
  />
);

export { FeaturedServicesCarousel, FeaturedServicesCarouselSkeleton };
