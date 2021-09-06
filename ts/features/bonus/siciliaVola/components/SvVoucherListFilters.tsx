import * as React from "react";
import { useState } from "react";
import { Body, Container, Left, ListItem, Right, View } from "native-base";
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
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../bonusVacanze/components/buttons/ButtonConfigurations";
import { LabelledItem } from "../../../../components/LabelledItem";
import DateTimePicker from "../../../../components/ui/DateTimePicker";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../store/reducers/types";
import { possibleVoucherStateSelector } from "../store/reducers/voucherList/possibleVoucherState";
import { isReady } from "../../bpd/model/RemoteValue";
import { StatoVoucherBean } from "../../../../../definitions/api_sicilia_vola/StatoVoucherBean";
import { H4 } from "../../../../components/core/typography/H4";
import { IOColors } from "../../../../components/core/variables/IOColors";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> & {
    onClose: () => void;
    onConfirm: () => void;
  };

const PossibleVoucherStateOption = ({
  text,
  value,
  onPress,
  checked
}: {
  text: string;
  value: number;
  onPress: (value: number) => void;
  checked: boolean;
}) => (
  <ListItem
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12
    }}
    onPress={() => onPress(value)}
  >
    <H4 weight={checked ? "SemiBold" : "Regular"} color={"bluegreyDark"}>
      {text}
    </H4>
    <IconFont
      name={checked ? "io-radio-on" : "io-radio-off"}
      size={22}
      color={checked ? IOColors.blue : IOColors.bluegrey}
    />
  </ListItem>
);

const SvVoucherListFilters: React.FunctionComponent<Props> = (props: Props) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [departureDate, setDepartureDate] = useState<Date | undefined>(
    undefined
  );
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);

  const [voucherStatusState, setVoucherStatusState] = useState<
    number | undefined
  >(undefined);

  const onVoucherStatusSelect = (value: number) => {
    setVoucherStatusState(value);
    Keyboard.dismiss();
  };

  const renderVoucherStateItem = (
    listItem: ListRenderItemInfo<StatoVoucherBean>
  ) =>
    listItem.item.idStato && listItem.item.statoDesc ? (
      <PossibleVoucherStateOption
        text={listItem.item.statoDesc}
        value={listItem.item.idStato}
        checked={listItem.item.idStato === voucherStatusState}
        onPress={onVoucherStatusSelect}
      />
    ) : null;

  const onRemoveButton = () => {
    setSearchValue("");
    setVoucherStatusState(undefined);
  };

  const selectedFilters =
    (voucherStatusState !== undefined ? 1 : 0) +
    (departureDate !== undefined ? 1 : 0) +
    (returnDate !== undefined ? 1 : 0) +
    (searchValue.length > 0 ? 1 : 0);

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
            {isReady(props.possibleVoucherState) && (
              <>
                <H2>{"Stato"}</H2>
                <View spacer small />
                <FlatList
                  data={props.possibleVoucherState.value}
                  keyExtractor={pVS => pVS.statoDesc ?? ""}
                  ItemSeparatorComponent={() => (
                    <ItemSeparatorComponent noPadded={true} />
                  )}
                  renderItem={renderVoucherStateItem}
                  keyboardShouldPersistTaps={"handled"}
                />
                <View spacer large />
              </>
            )}
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

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (state: GlobalState) => ({
  possibleVoucherState: possibleVoucherStateSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SvVoucherListFilters);
