import {
  Badge,
  Body,
  Divider,
  H6,
  IOColors,
  IOSpacingScale,
  IOStyles,
  ListItemNav,
  SearchInput,
  SearchInputRef
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
  ViewStyle
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { INonEmptyStringTag } from "@pagopa/ts-commons/lib/strings";
import I18n from "../../../../../i18n";
import {
  IOStackNavigationProp,
  useIONavigation
} from "../../../../../navigation/params/AppParamsList";
import { EmptyList } from "../../../../messages/components/Search/EmptyList";
import { useDebouncedValue } from "../../../../../hooks/useDebouncedValue";
import CGN_ROUTES from "../../navigation/routes";
import { CgnDetailsParamsList } from "../../navigation/params";

const INPUT_PADDING: IOSpacingScale = 16;
const MIN_SEARCH_TEXT_LENGTH: number = 3;
const SEARCH_DELAY: number = 300;

export function CgnMerchantSearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useIONavigation();

  const searchInputRef = useRef<SearchInputRef>(null);
  const [searchText, setSearchText] = useState<string>("");
  const debouncedSearchText = useDebouncedValue({
    initial: "",
    value: searchText,
    delay: SEARCH_DELAY
  });

  const containerStyle: ViewStyle = useMemo(
    () => ({
      ...IOStyles.horizontalContentPadding,
      marginTop: insets.top,
      paddingVertical: INPUT_PADDING
    }),
    [insets.top]
  );

  const merchants = useSimpleQuery({
    isActive: debouncedSearchText.trim().length >= MIN_SEARCH_TEXT_LENGTH,
    params: debouncedSearchText.trim(),
    fetcher: searchMerchants
  });

  const renderItemCallback = useCallback(
    (itemInfo: ListRenderItemInfo<Merchant>) => (
      <MerchantSearchResultListItem
        item={itemInfo.item}
        searchText={debouncedSearchText}
      />
    ),
    [debouncedSearchText]
  );

  const renderListEmptyComponent = useCallback(() => {
    if (searchText.trim().length < MIN_SEARCH_TEXT_LENGTH) {
      return (
        <EmptyList
          pictogram="searchLens"
          title={I18n.t("bonus.cgn.merchantSearch.emptyList")}
        />
      );
    }

    return null;
  }, [searchText]);

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
        data={merchants.data?.length !== 0 ? merchants.data : undefined}
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

function MerchantSearchResultListItem({
  item,
  searchText
}: {
  item: Merchant;
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
            <View style={{ flexGrow: 1, flexShrink: 1 }}>
              <H6>{highlightText(item.name, searchText)}</H6>
              <Body numberOfLines={2} ellipsizeMode="tail">
                {highlightText(item.description, searchText)}
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

function highlightText(text: string, searchText: string) {
  const chunks = highlightSearchText(text, searchText);
  return chunks.map((chunk, index) => (
    <Text
      key={index}
      style={{
        backgroundColor: chunk.highlighted
          ? IOColors["turquoise-150"]
          : undefined
      }}
    >
      {chunk.text}
    </Text>
  ));
}

type HighlightChunk = { highlighted: boolean; text: string };

/** Highlights search results client side that were made with ILIKE sql operator server side */
function highlightSearchText(
  text: string,
  searchText: string
): Array<HighlightChunk> {
  const textLowerCase = text.toLowerCase();
  const searchTextLowerCase = searchText.toLowerCase();
  const matchMap = new Array(text.length).fill(false);
  // eslint-disable-next-line functional/no-let
  for (let textIndex = 0; textIndex < text.length; ) {
    const matchStart = textLowerCase.indexOf(searchTextLowerCase, textIndex);
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
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
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

// TODO redux-saga when new API defintion is up; ingore for code review

type Merchant = {
  id: string & INonEmptyStringTag;
  name: string;
  description: string;
  newDiscounts: boolean;
};

// this is a simplified version of useQuery from react-query or useSWR
// eslint-disable-next-line sonarjs/cognitive-complexity
function useSimpleQuery<Params, Data>({
  isActive,
  params,
  fetcher
}: {
  params: Params;
  fetcher(params: Params): Promise<Data>;
  isActive: boolean;
}): { data: undefined | Data; isLoading: boolean } {
  const nextIdRef = useRef(1);
  const [state, setState] = useState<
    | { type: "idle" }
    | { type: "loading"; requestId: number }
    | { type: "loaded"; data: Data }
    | { type: "error"; error: unknown }
  >({ type: "idle" });
  useEffect(() => {
    if (isActive) {
      // eslint-disable-next-line functional/immutable-data
      const requestId = nextIdRef.current++;
      setState({ type: "loading", requestId });
      fetcher(params).then(
        data => {
          setState(prevState => {
            if (
              prevState.type === "loading" &&
              prevState.requestId === requestId
            ) {
              return { type: "loaded", data };
            } else {
              return prevState;
            }
          });
        },
        error => {
          setState(prevState => {
            if (
              prevState.type === "loading" &&
              prevState.requestId === requestId
            ) {
              return { type: "error", error };
            } else {
              return prevState;
            }
          });
        }
      );
    } else {
      setState({ type: "idle" });
    }
  }, [fetcher, isActive, params]);
  return {
    isLoading: state.type === "loading",
    data: state.type === "loaded" ? state.data : undefined
  };
}

async function searchMerchants(searchText: string): Promise<Array<Merchant>> {
  const all = new Array(100).fill(null).map(
    (_, index): Merchant => ({
      id: String(index) as string & INonEmptyStringTag,
      name: `Merchant ${index}`,
      description: `Description ${index} lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua`,
      newDiscounts: Boolean(index % 2)
    })
  );
  await new Promise(resolve => setTimeout(resolve, 1500));
  return all.filter(
    merchant =>
      merchant.name.toLowerCase().includes(searchText.toLowerCase()) ||
      merchant.description.toLowerCase().includes(searchText.toLowerCase())
  );
}
