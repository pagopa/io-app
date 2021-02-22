import * as React from "react";
import { connect } from "react-redux";
import { FlatList, ListRenderItemInfo, SafeAreaView } from "react-native";
import { Input, Item, View } from "native-base";
import { nullType } from "io-ts";
import { debounce } from "lodash";
import { GlobalState } from "../../../../../store/reducers/types";
import { Dispatch } from "../../../../../store/actions/types";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import CgnMerchantListItem from "../../components/merchants/CgnMerchantListItem";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import IconFont from "../../../../../components/ui/IconFont";
import { availableMerchants } from "../../__mock__/availableMerchants";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type TmpMerchantType = {
  name: string;
  category: string;
  location: string;
};

/**
 * Screen that renders the list of the merchants which has an active discount for CGN
 * @param props
 * @constructor
 */
const CgnMerchantsListScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const [searchValue, setSearchValue] = React.useState("");
  const [merchantList, setMerchantsList] = React.useState(props.merchants);

  const performSearch = (
    text: string,
    merchantList: ReadonlyArray<TmpMerchantType>
  ) => {
    if (text.length === 0) {
      setMerchantsList(props.merchants);
      return;
    }
    const resultList = merchantList.filter(
      m => m.name.toLowerCase().indexOf(text.toLowerCase()) > -1
    );
    setMerchantsList(resultList);
  };

  const debounceRef = React.useRef(debounce(performSearch, 300));

  React.useEffect(() => {
    debounceRef.current(searchValue, props.merchants);
  }, [searchValue, props.merchants]);

  return (
    <BaseScreenComponent
      goBack
      headerTitle={I18n.t("bonus.cgn.merchantsList.navigationTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
          <H1>{I18n.t("bonus.cgn.merchantsList.screenTitle")}</H1>
          <Item>
            <Input
              value={searchValue}
              autoFocus={true}
              onChangeText={setSearchValue}
              placeholderTextColor={IOColors.bluegreyLight}
              placeholder={I18n.t("global.buttons.search")}
            />
            <IconFont name="io-search" color={IOColors.bluegrey} />
          </Item>
          <View spacer />
          <FlatList
            scrollEnabled={true}
            data={merchantList}
            ItemSeparatorComponent={() => (
              <ItemSeparatorComponent noPadded={true} />
            )}
            renderItem={(listItem: ListRenderItemInfo<TmpMerchantType>) => (
              <CgnMerchantListItem
                category={listItem.item.category}
                name={listItem.item.name}
                location={listItem.item.location}
                onPress={props.navigateToMerchantDetail}
              />
            )}
            keyExtractor={c => `${c.name}-${c.category}`}
          />
        </View>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (_: GlobalState) => ({
  // FIXME replace with selector when available
  merchants: availableMerchants
});

const mapDispatchToProps = (_: Dispatch) => ({
  // FIXME Replace with correct navigation action when available
  navigateToMerchantDetail: () => nullType
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnMerchantsListScreen);
