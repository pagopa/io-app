import {
  Badge,
  Body,
  H6,
  IOColors,
  IOStyles,
  ListItemNav
} from "@pagopa/io-app-design-system";
import { Keyboard, Text, View, StyleSheet } from "react-native";
import I18n from "../../../../../i18n";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import CGN_ROUTES from "../../navigation/routes";
import { SearchItem } from "../../../../../../definitions/cgn/merchants/SearchItem";
import { highlightSearchText } from "../../../../../utils/highlightSearchText";

export const TEXT_LEGNTH_WITH_BADGE = 60;
export const TEXT_LEGNTH_WITHOUT_BADGE = 100;

const styles = StyleSheet.create({
  listItemTextContainer: {
    flexGrow: 1,
    flexShrink: 1
  },
  highlightYes: {
    backgroundColor: IOColors["turquoise-150"]
  }
});

export function MerchantSearchResultListItem({
  item,
  searchText
}: {
  item: SearchItem;
  searchText: string;
}) {
  const navigation = useIONavigation();
  return (
    <View style={IOStyles.horizontalContentPadding}>
      <ListItemNav
        onPress={() => {
          navigation.navigate(CGN_ROUTES.DETAILS.MAIN, {
            screen: CGN_ROUTES.DETAILS.MERCHANTS.DETAIL,
            params: {
              merchantID: item.id
            }
          });
          Keyboard.dismiss();
        }}
        value={
          <View style={IOStyles.rowSpaceBetween}>
            <View style={styles.listItemTextContainer}>
              <H6>{highlightText({ text: item.name, searchText })}</H6>
              <Body numberOfLines={2} ellipsizeMode="tail">
                {highlightText({
                  text: item.description,
                  searchText,
                  estimatedTextLengthToDisplay: item.newDiscounts
                    ? TEXT_LEGNTH_WITH_BADGE
                    : TEXT_LEGNTH_WITHOUT_BADGE
                })}
              </Body>
            </View>
            {item.newDiscounts && (
              <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
                <Badge
                  variant="cgn"
                  text={I18n.t("bonus.cgn.merchantsList.news")}
                />
              </View>
            )}
          </View>
        }
        accessibilityLabel={item.name}
      />
    </View>
  );
}

function highlightText({
  searchText,
  text,
  estimatedTextLengthToDisplay
}: {
  text: string;
  searchText: string;
  estimatedTextLengthToDisplay?: number;
}) {
  const chunks = highlightSearchText({
    text,
    searchText,
    estimatedTextLengthToDisplay
  });
  return chunks.map((chunk, index) => (
    <Text
      key={index}
      style={chunk.highlighted ? styles.highlightYes : undefined}
    >
      {chunk.text}
    </Text>
  ));
}
