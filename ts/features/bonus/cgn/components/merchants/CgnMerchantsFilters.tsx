import {
  FooterActionsInline,
  H4,
  HeaderSecondLevel,
  VSpacer
} from "@pagopa/io-app-design-system";
import _ from "lodash";

import { FunctionComponent, useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  ListRenderItemInfo,
  Platform,
  SafeAreaView,
  ScrollView,
  View
} from "react-native";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import { LabelledItem } from "../../../../../components/LabelledItem";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { Category, OrderType, categories, orders } from "../../utils/filters";
import CategoryCheckbox from "./search/CategoryCheckbox";
import { DistanceSlider } from "./search/DistanceSlider";
import OrderOption from "./search/OrderOption";

type Props = {
  onClose: () => void;
  onConfirm: () => void;
  isLocal: boolean;
};

/**
 * This component is unused and could be deprecated since it's not used in the app.
 */
const CgnMerchantsFilters: FunctionComponent<Props> = (props: Props) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [checkedCategories, setCheckedCategories] = useState<
    ReadonlyArray<string>
  >([]);
  const [distance, setDistance] = useState<number>(20);
  const [selectedOrder, setSelectedOrder] = useState<string>(
    orders.distance.value
  );

  const onOrderSelect = (value: string) => {
    setSelectedOrder(value);
    Keyboard.dismiss();
  };

  const renderOrderItem = (listItem: ListRenderItemInfo<OrderType>) => (
    <OrderOption
      text={I18n.t(listItem.item.label)}
      value={listItem.item.value}
      checked={selectedOrder.includes(listItem.item.value)}
      onPress={onOrderSelect}
    />
  );

  const onCheckBoxPress = (value: string) => {
    const filteredCategories = checkedCategories.filter(c => c !== value);
    setCheckedCategories(
      checkedCategories.length !== filteredCategories.length
        ? filteredCategories
        : [...checkedCategories, value]
    );
    Keyboard.dismiss();
  };

  const renderCategoryItem = (listItem: ListRenderItemInfo<Category>) => (
    <CategoryCheckbox
      text={I18n.t(listItem.item.nameKey)}
      value={listItem.item.type}
      checked={checkedCategories.includes(listItem.item.type)}
      onPress={onCheckBoxPress}
      icon={listItem.item.icon}
    />
  );

  const onRemoveButton = () => {
    setSearchValue("");
    setSelectedOrder(orders.distance.value);
    setCheckedCategories([]);
    props.onClose();
  };

  const selectedFilters =
    checkedCategories.length + (searchValue.length > 0 ? 1 : 0);

  const confirmButtonLabel: string = useMemo(
    () =>
      I18n.t("bonus.cgn.merchantsList.filter.cta.confirm", {
        defaultValue: I18n.t(
          "bonus.cgn.merchantsList.filter.cta.confirm.other",
          {
            count: selectedFilters
          }
        ),
        count: selectedFilters
      }),
    [selectedFilters]
  );

  return (
    <>
      <HeaderSecondLevel
        title={I18n.t("bonus.cgn.merchantsList.filter.title")}
        type="singleAction"
        firstAction={{
          icon: "closeLarge",
          onPress: props.onClose,
          accessibilityLabel: I18n.t("global.buttons.close"),
          testID: "contextualInfo_closeButton"
        }}
      />
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView
          style={IOStyles.flex}
          bounces={false}
          keyboardShouldPersistTaps={"handled"}
        >
          <View style={IOStyles.horizontalContentPadding}>
            <H4>{I18n.t("bonus.cgn.merchantsList.filter.searchTitle")}</H4>
            <LabelledItem
              inputProps={{
                value: searchValue,
                onChangeText: setSearchValue,
                placeholder: I18n.t(
                  "bonus.cgn.merchantsList.filter.inputPlaceholder"
                )
              }}
              icon="search"
            />

            <VSpacer size={24} />
            {props.isLocal && (
              <>
                <H4>{I18n.t("bonus.cgn.merchantsList.filter.addressTitle")}</H4>
                <LabelledItem
                  inputProps={{
                    value: address,
                    onChangeText: setAddress,
                    placeholder: I18n.t(
                      "bonus.cgn.merchantsList.filter.addressPlaceholder"
                    )
                  }}
                  icon={
                    Platform.OS === "ios" ? "locationiOS" : "locationAndroid"
                  }
                />
                <VSpacer size={16} />
                <DistanceSlider
                  value={distance}
                  onValueChange={setDistance}
                  disabled={address.length === 0}
                />
                <VSpacer size={24} />
              </>
            )}
            <H4>{I18n.t("bonus.cgn.merchantsList.filter.categories")}</H4>
            <VSpacer size={8} />
            <FlatList
              data={_.values(categories)}
              keyExtractor={cat => cat.type}
              ItemSeparatorComponent={() => (
                <ItemSeparatorComponent noPadded={true} />
              )}
              renderItem={renderCategoryItem}
              keyboardShouldPersistTaps={"handled"}
            />
            <VSpacer size={24} />
            {props.isLocal && (
              <>
                <H4>{I18n.t("bonus.cgn.merchantsList.filter.orderTitle")}</H4>
                <VSpacer size={8} />
                <FlatList
                  data={_.values(orders)}
                  keyExtractor={ord => ord.value}
                  ItemSeparatorComponent={() => (
                    <ItemSeparatorComponent noPadded={true} />
                  )}
                  renderItem={renderOrderItem}
                  keyboardShouldPersistTaps={"handled"}
                />
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      <FooterActionsInline
        startAction={{
          color: "primary",
          label: I18n.t("bonus.cgn.merchantsList.filter.cta.cancel"),
          onPress: onRemoveButton
        }}
        endAction={{
          color: "primary",
          label: confirmButtonLabel,
          onPress: props.onConfirm
        }}
      />
    </>
  );
};

export default CgnMerchantsFilters;
