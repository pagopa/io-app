import { entries, range, size } from "lodash";
import * as React from "react";
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  StyleSheet,
  View
} from "react-native";

import { cardIcons } from "./card/Logo";

// list of cards to be displayed
const displayedCards: { [key: string]: any } = {
  MASTERCARD: cardIcons.MASTERCARD,
  MAESTRO: cardIcons.MAESTRO,
  VISA: cardIcons.VISA,
  VISAELECTRON: cardIcons.VISAELECTRON,
  AMEX: cardIcons.AMEX,
  POSTEPAY: cardIcons.POSTEPAY,
  DINER: cardIcons.DINERS
};

const styles = StyleSheet.create({
  addCardImage: {
    width: 60,
    height: 45,
    resizeMode: "contain",
    marginTop: 5
  }
});

type Props = {
  columns: number;
};

type CardItemTuple = [string, any];

const renderCardItem = (itemInfo: ListRenderItemInfo<CardItemTuple>) => (
  <View style={{ flex: 1, flexDirection: "row" }}>
    {itemInfo.item[1] && (
      <Image style={styles.addCardImage} source={itemInfo.item[1]} />
    )}
  </View>
);

const cardItemKey = (item: CardItemTuple) => item[0];

export const CardList: React.SFC<Props> = props => (
  <FlatList
    numColumns={props.columns}
    data={entries(displayedCards).concat(
      // padding with empty items so as to have a # of cols
      // divisible by CARD_LOGOS_COLUMNS (to line them up properly)
      range(props.columns - (size(displayedCards) % props.columns)).map(
        (__): [string, any] => ["", undefined]
      )
    )}
    renderItem={renderCardItem}
    keyExtractor={cardItemKey}
  />
);
