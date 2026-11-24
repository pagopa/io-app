import { SearchItem } from "@io-app/api-types/generated/definitions/cgn/merchants/SearchItem";
import {
  Badge,
  Body,
  ContentWrapper,
  H6,
  ListItemNav
} from "@io-app/design-system";
import I18n from "i18next";
import { ColorValue, Keyboard, StyleSheet, Text, View } from "react-native";

import { useFeatureColors } from "../../../../../hooks/useFeatureColors";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { highlightSearchText } from "../../../../../utils/highlightSearchText";
import { cgnColors } from "../../colors";
import CGN_ROUTES from "../../navigation/routes";

const TEXT_LEGNTH_WITH_BADGE = 60;
const TEXT_LEGNTH_WITHOUT_BADGE = 100;

const styles = StyleSheet.create({
  listItemTextContainer: {
    flexGrow: 1,
    flexShrink: 1
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
  const { merchantSearch } = useFeatureColors(cgnColors);
  return (
    <ContentWrapper>
      <ListItemNav
        accessibilityLabel={item.name}
        label={
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={styles.listItemTextContainer}>
              <H6>
                {highlightText({
                  text: item.name,
                  searchText,
                  highlightColor: merchantSearch.highlight
                })}
              </H6>
              <Body ellipsizeMode="tail" numberOfLines={2}>
                {highlightText({
                  text: item.description,
                  searchText,
                  highlightColor: merchantSearch.highlight,
                  estimatedTextLengthToDisplay: item.newDiscounts
                    ? TEXT_LEGNTH_WITH_BADGE
                    : TEXT_LEGNTH_WITHOUT_BADGE
                })}
              </Body>
            </View>
            {item.newDiscounts && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <Badge
                  text={I18n.t("bonus.cgn.merchantsList.news")}
                  variant="cgn"
                />
              </View>
            )}
          </View>
        }
        onPress={() => {
          navigation.navigate(CGN_ROUTES.DETAILS.MAIN, {
            screen: CGN_ROUTES.DETAILS.MERCHANTS.DETAIL,
            params: {
              merchantID: item.id
            }
          });
          Keyboard.dismiss();
        }}
      />
    </ContentWrapper>
  );
}

function highlightText({
  searchText,
  text,
  estimatedTextLengthToDisplay,
  highlightColor
}: {
  estimatedTextLengthToDisplay?: number;
  highlightColor: ColorValue;
  searchText: string;
  text: string;
}) {
  const chunks = highlightSearchText({
    text,
    searchText,
    estimatedTextLengthToDisplay
  });
  return chunks.map((chunk, index) => (
    <Text
      key={index}
      style={
        chunk.highlighted ? { backgroundColor: highlightColor } : undefined
      }
    >
      {chunk.text}
    </Text>
  ));
}
