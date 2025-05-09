import {
  ListItemHeader,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import { Platform, StyleSheet } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
  LinearTransition
} from "react-native-reanimated";
import { WalletCard } from "../types";
import { renderWalletCardFn } from "../utils";

export type WalletCardsCategoryContainerProps = WithTestID<{
  cards: ReadonlyArray<WalletCard>;
  header?: ListItemHeader;
  topElement?: JSX.Element;
  bottomElement?: JSX.Element;
}>;

// The item layout animation has a bug on Android for a FlatList that doesn't have a fixed height [https://github.com/software-mansion/react-native-reanimated/issues/5728]
// * The animations work perfectly when an item enters, but when removing an item, there is always a UI bug where the last item becomes invisible during rendering.
// * Even with an hardcoded height with the onLayout event, the bug is still present
// * The workaround is to disable the layout animation on Android
const itemLayoutAnimation =
  Platform.OS !== "android" ? LinearTransition.duration(200) : undefined;

/**
 * This component handles the rendering of cards of a specific category.
 * The component also handles logic behind card stacking and animations
 */
export const WalletCardsCategoryContainer = ({
  cards,
  header,
  topElement,
  bottomElement,
  testID
}: WalletCardsCategoryContainerProps) => (
  <Animated.View
    style={styles.container}
    testID={testID}
    layout={LinearTransition.duration(200)}
  >
    {header ? <ListItemHeader {...header} /> : <VSpacer size={16} />}
    <Animated.FlatList
      scrollEnabled={false}
      data={cards}
      renderItem={({ index, item }) =>
        renderWalletCardFn(item, index < cards.length - 1)
      }
      itemLayoutAnimation={itemLayoutAnimation}
      style={styles.cardList}
      entering={FadeInDown.duration(150)}
      exiting={FadeOutDown.duration(150)}
      ListHeaderComponent={topElement}
      ListHeaderComponentStyle={styles.listHeader}
      ListFooterComponent={bottomElement}
      ListFooterComponentStyle={styles.listFooter}
    />
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 16
  },
  listHeader: {
    marginHorizontal: 8
  },
  listFooter: {
    marginHorizontal: 8
  },
  cardList: {
    marginHorizontal: -8
  }
});
