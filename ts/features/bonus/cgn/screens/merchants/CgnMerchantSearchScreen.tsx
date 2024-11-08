import {
  Badge,
  Body,
  Divider,
  H6,
  IOColors,
  IOSpacingScale,
  IOStyles,
  IOVisualCostants,
  ListItemNav,
  Pictogram,
  SearchInput,
  SearchInputRef,
  VSpacer
} from "@pagopa/io-app-design-system";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  FlatList,
  Keyboard,
  ListRenderItemInfo,
  Platform,
  Text,
  View,
  ViewStyle,
  StyleSheet
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import I18n from "../../../../../i18n";
import {
  IOStackNavigationProp,
  useIONavigation
} from "../../../../../navigation/params/AppParamsList";
import { useDebouncedValue } from "../../../../../hooks/useDebouncedValue";
import CGN_ROUTES from "../../navigation/routes";
import { CgnDetailsParamsList } from "../../navigation/params";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import {
  cgnMerchantsCountSelector,
  cgnSearchMerchantsSelector
} from "../../store/reducers/merchants";
import { getValue } from "../../../../../common/model/RemoteValue";
import { SearchItem } from "../../../../../../definitions/cgn/merchants/SearchItem";
import {
  cgnMerchantsCount,
  cgnSearchMerchants
} from "../../store/actions/merchants";

const INPUT_PADDING: IOSpacingScale = 16;
const MIN_SEARCH_TEXT_LENGTH: number = 3;
const SEARCH_DELAY: number = 300;

export function CgnMerchantSearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const searchInputRef = useRef<SearchInputRef>(null);
  const [searchText, setSearchText] = useState<string>("");
  const searchTextDebouncedTrimmed = useDebouncedValue({
    initial: "",
    value: searchText,
    delay: SEARCH_DELAY
  }).trim();

  const containerStyle: ViewStyle = useMemo(
    () => ({
      ...IOStyles.horizontalContentPadding,
      marginTop: insets.top,
      paddingVertical: INPUT_PADDING
    }),
    [insets.top]
  );

  const merchantsRemoteValue = useIOSelector(cgnSearchMerchantsSelector);
  const isSearchActive =
    searchTextDebouncedTrimmed.length >= MIN_SEARCH_TEXT_LENGTH;
  const merchants = isSearchActive ? getValue(merchantsRemoteValue) : undefined;
  useEffect(() => {
    if (isSearchActive) {
      dispatch(
        cgnSearchMerchants.request({
          token: searchTextDebouncedTrimmed as NonEmptyString
        })
      );
    }
  }, [dispatch, isSearchActive, searchTextDebouncedTrimmed]);

  const renderItemCallback = useCallback(
    (itemInfo: ListRenderItemInfo<SearchItem>) => (
      <MerchantSearchResultListItem
        item={itemInfo.item}
        searchText={searchTextDebouncedTrimmed}
      />
    ),
    [searchTextDebouncedTrimmed]
  );

  const merchantsCountRemoteValue = useIOSelector(cgnMerchantsCountSelector);
  useEffect(() => {
    dispatch(cgnMerchantsCount.request());
  }, [dispatch]);
  const merchantsCount = getValue(merchantsCountRemoteValue);

  const renderListEmptyComponent = useCallback(() => {
    if (searchText.trim().length < MIN_SEARCH_TEXT_LENGTH) {
      return <EmptyListShortQuery merchantCount={merchantsCount} />;
    }
    if (merchants?.length === 0) {
      return <EmptyListNoResults />;
    }
    return null;
  }, [merchants?.length, merchantsCount, searchText]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      searchInputRef.current?.focus();
    }, [])
  );

  return (
    <>
      <View style={containerStyle}>
        <SearchInput
          accessibilityLabel={I18n.t(
            "bonus.cgn.merchantSearch.input.placeholder"
          )}
          autoFocus={true}
          cancelButtonLabel={I18n.t("bonus.cgn.merchantSearch.input.cancel")}
          clearAccessibilityLabel={I18n.t(
            "bonus.cgn.merchantSearch.input.clear"
          )}
          keepCancelVisible={true}
          onCancel={handleCancel}
          onChangeText={setSearchText}
          placeholder={I18n.t("bonus.cgn.merchantSearch.input.placeholder")}
          ref={searchInputRef}
          value={searchText}
        />
      </View>
      <FlatList
        ItemSeparatorComponent={() => <Divider />}
        data={merchants?.length !== 0 ? merchants : undefined}
        keyExtractor={item => item.id}
        renderItem={renderItemCallback}
        ListEmptyComponent={renderListEmptyComponent}
        keyboardDismissMode={Platform.select({
          ios: "interactive",
          default: "on-drag"
        })}
        keyboardShouldPersistTaps="handled"
      />
    </>
  );
}

const styles = StyleSheet.create({
  emptyListContainer: {
    marginHorizontal: IOVisualCostants.appMarginDefault
  },
  emptyListText: {
    textAlign: "center"
  },
  listItemTextContainer: {
    flexGrow: 1,
    flexShrink: 1
  },
  highlightYes: {
    backgroundColor: IOColors["turquoise-150"]
  }
});

function EmptyListShortQuery({
  merchantCount
}: {
  merchantCount: number | undefined;
}) {
  return (
    <View style={styles.emptyListContainer}>
      <View style={IOStyles.alignCenter}>
        <Pictogram name="searchLens" size={120} />
        <VSpacer size={24} />
      </View>
      <H6 style={styles.emptyListText}>
        {I18n.t("bonus.cgn.merchantSearch.emptyList.shortQuery.title", {
          merchantCount
        })}
      </H6>
    </View>
  );
}

function EmptyListNoResults() {
  return (
    <View style={styles.emptyListContainer}>
      <View style={IOStyles.alignCenter}>
        <Pictogram name="umbrellaNew" size={120} />
        <VSpacer size={24} />
      </View>
      <H6 style={styles.emptyListText}>
        {I18n.t("bonus.cgn.merchantSearch.emptyList.noResults.title")}
      </H6>
      <VSpacer size={8} />
      <Body style={styles.emptyListText}>
        {I18n.t("bonus.cgn.merchantSearch.emptyList.noResults.subtitle")}
      </Body>
    </View>
  );
}

function MerchantSearchResultListItem({
  item,
  searchText
}: {
  item: SearchItem;
  searchText: string;
}) {
  const { navigate } =
    useNavigation<
      IOStackNavigationProp<CgnDetailsParamsList, "CGN_MERCHANTS_SEARCH">
    >();
  return (
    <View style={IOStyles.horizontalContentPadding}>
      <ListItemNav
        onPress={() => {
          navigate(CGN_ROUTES.DETAILS.MERCHANTS.DETAIL, {
            merchantID: item.id
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
                  esimatedTextLengthToDisplay: item.newDiscounts ? 60 : 100
                })}
              </Body>
            </View>
            {item.newDiscounts && (
              <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter]}>
                <Badge
                  variant="purple"
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
  esimatedTextLengthToDisplay
}: {
  text: string;
  searchText: string;
  esimatedTextLengthToDisplay?: number;
}) {
  const chunks = highlightSearchText({
    text,
    searchText,
    esimatedTextLengthToDisplay
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

type HighlightChunk = { highlighted: boolean; text: string };

/**
 * Highlights search results client side that were made with ILIKE sql operator server side.
 * Tries to center the first match in the available space if esimatedTextLengthToDisplay provided
 */
function highlightSearchText({
  text,
  searchText,
  esimatedTextLengthToDisplay
}: {
  text: string;
  searchText: string;
  esimatedTextLengthToDisplay?: number;
}): Array<HighlightChunk> {
  const textLowerCase = text.toLowerCase();
  const searchTextLowerCase = searchText.toLowerCase();
  const firstOccurrence = textLowerCase.indexOf(searchTextLowerCase);
  const relevantText =
    esimatedTextLengthToDisplay === undefined || firstOccurrence === -1
      ? text
      : "..." +
        text.slice(
          firstOccurrence -
            Math.trunc(
              esimatedTextLengthToDisplay * 0.5 - searchText.length * 0.5
            )
        );
  const relevantTextLowerCase = relevantText.toLowerCase();
  const matchMap = new Array(relevantText.length).fill(false);
  // eslint-disable-next-line functional/no-let
  for (let textIndex = 0; textIndex < relevantText.length; ) {
    const matchStart = relevantTextLowerCase.indexOf(
      searchTextLowerCase,
      textIndex
    );
    if (matchStart === -1) {
      break;
    }
    for (
      // eslint-disable-next-line functional/no-let
      let searchTextIndex = 0;
      searchTextIndex < searchText.length;
      searchTextIndex++
    ) {
      // eslint-disable-next-line functional/immutable-data
      matchMap[matchStart + searchTextIndex] = true;
    }
    textIndex = matchStart + searchText.length;
  }
  const chunks: Array<HighlightChunk> = [];
  // eslint-disable-next-line functional/no-let
  let currentChunk: HighlightChunk = { highlighted: false, text: "" };
  // eslint-disable-next-line functional/no-let
  for (let index = 0; index < relevantText.length; index++) {
    const char = relevantText[index];
    const isHighlighted = matchMap[index];
    if (currentChunk.highlighted === isHighlighted) {
      // eslint-disable-next-line functional/immutable-data
      currentChunk.text += char;
    } else {
      // eslint-disable-next-line functional/immutable-data
      chunks.push(currentChunk);
      currentChunk = { highlighted: isHighlighted, text: char };
    }
  }
  // eslint-disable-next-line functional/immutable-data
  chunks.push(currentChunk);
  return chunks;
}
