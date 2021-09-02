import * as React from "react";
import { useState } from "react";
import _ from "lodash";
import { Body, Container, Left, Right, View } from "native-base";
import {
  FlatList,
  Keyboard,
  ListRenderItemInfo,
  SafeAreaView,
  ScrollView
} from "react-native";
import AppHeader from "../../../../components/ui/AppHeader";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import IconFont from "../../../../components/ui/IconFont";
import { H5 } from "../../../../components/core/typography/H5";
import I18n from "../../../../i18n";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H2 } from "../../../../components/core/typography/H2";
import { orders, OrderType } from "../../cgn/utils/filters";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../bonusVacanze/components/buttons/ButtonConfigurations";
import { LabelledItem } from "../../../../components/LabelledItem";
import OrderOption from "../../cgn/components/merchants/search/OrderOption";
import DateTimePicker from "../../../../components/ui/DateTimePicker";

type Props = {
  onClose: () => void;
  onConfirm: () => void;
  isLocal: boolean;
};

const SvVoucherListFilters: React.FunctionComponent<Props> = (props: Props) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [departureDate, setDepartureDate] = useState<Date | undefined>(
    undefined
  );
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);

  const [selectedState, setSelectedOrder] = useState<string | undefined>(
    undefined
  );

  const onOrderSelect = (value: string) => {
    setSelectedOrder(value);
    Keyboard.dismiss();
  };

  const renderVoucherStateItem = (listItem: ListRenderItemInfo<OrderType>) => (
    <OrderOption
      text={I18n.t(listItem.item.label)}
      value={listItem.item.value}
      checked={listItem.item.value === selectedState}
      onPress={onOrderSelect}
    />
  );

  const onRemoveButton = () => {
    setSearchValue("");
    setSelectedOrder(orders.distance.value);
    props.onClose();
  };

  const selectedFilters = searchValue.length > 0 ? 1 : 0;

  return (
    <Container>
      <AppHeader>
        <Left />
        <Body style={{ alignItems: "center" }}>
          <H5 weight={"SemiBold"} color={"bluegrey"}>
            {"Filter vouchers"}
          </H5>
        </Body>
        <Right>
          <ButtonDefaultOpacity onPress={props.onClose} transparent={true}>
            <IconFont name="io-close" />
          </ButtonDefaultOpacity>
        </Right>
      </AppHeader>
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView
          style={[IOStyles.flex]}
          bounces={false}
          keyboardShouldPersistTaps={"handled"}
        >
          <View style={IOStyles.horizontalContentPadding}>
            <LabelledItem
              iconPosition={"right"}
              inputProps={{
                value: searchValue,
                onChangeText: setSearchValue,
                placeholder: "Cerca codice buono"
              }}
              icon="io-search"
            />
            <View spacer large />

            <>
              <H2>{"Stato"}</H2>
              <View spacer small />
              <FlatList
                data={_.values(orders)}
                keyExtractor={ord => ord.value}
                ItemSeparatorComponent={() => (
                  <ItemSeparatorComponent noPadded={true} />
                )}
                renderItem={renderVoucherStateItem}
                keyboardShouldPersistTaps={"handled"}
              />
            </>

            <View spacer large />
            <>
              <H2>{"Data"}</H2>
              <View spacer small />
              <DateTimePicker
                label={I18n.t(
                  "bonus.sv.voucherGeneration.selectFlightsDate.labels.departure"
                )}
                date={departureDate}
                onConfirm={setDepartureDate}
              />
              <View spacer />
              <DateTimePicker
                label={I18n.t(
                  "bonus.sv.voucherGeneration.selectFlightsDate.labels.return"
                )}
                date={returnDate}
                onConfirm={setReturnDate}
                minimumDate={departureDate}
              />
            </>
          </View>
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={cancelButtonProps(
            onRemoveButton,
            I18n.t("bonus.cgn.merchantsList.filter.cta.cancel")
          )}
          rightButton={confirmButtonProps(
            props.onConfirm,
            I18n.t("bonus.cgn.merchantsList.filter.cta.confirm", {
              defaultValue: I18n.t(
                "bonus.cgn.merchantsList.filter.cta.confirm.other",
                {
                  count: selectedFilters
                }
              ),
              count: selectedFilters
            })
          )}
        />
      </SafeAreaView>
    </Container>
  );
};

export default SvVoucherListFilters;
