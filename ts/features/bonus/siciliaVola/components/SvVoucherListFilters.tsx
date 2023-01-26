import * as React from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Body, Container, Left, ListItem, Right } from "native-base";
import { View, Keyboard, SafeAreaView, ScrollView } from "react-native";
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
import { GlobalState } from "../../../../store/reducers/types";
import { possibleVoucherStateSelector } from "../store/reducers/voucherList/possibleVoucherState";
import { isReady } from "../../bpd/model/RemoteValue";
import { StatoVoucherBean } from "../../../../../definitions/api_sicilia_vola/StatoVoucherBean";
import { H4 } from "../../../../components/core/typography/H4";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { svSetFilter } from "../store/actions/voucherList";
import { FilterState } from "../store/reducers/voucherList/filters";
import { VSpacer } from "../../../../components/core/spacer/Spacer";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> & {
    onClose: () => void;
    onConfirm: () => void;
  };

/**
 * Component used to show and select the possible voucher state option using a radio button
 * @param text
 * @param value
 * @param onPress
 * @param checked
 * @constructor
 */
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
  const [searchValue, setSearchValue] = useState<string | undefined>(undefined);
  const [departureDate, setDepartureDate] = useState<Date | undefined>(
    undefined
  );
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);

  const [voucherStatus, setVoucherStatus] = useState<number | undefined>(
    undefined
  );

  const onVoucherStatusSelect = (value: number) => {
    setVoucherStatus(value);
    Keyboard.dismiss();
  };

  const renderVoucherStateItem = (possibleState: StatoVoucherBean) =>
    possibleState.idStato && possibleState.statoDesc ? (
      <PossibleVoucherStateOption
        text={possibleState.statoDesc}
        value={possibleState.idStato}
        checked={possibleState.idStato === voucherStatus}
        onPress={onVoucherStatusSelect}
      />
    ) : null;

  /**
   * Clean the filter locally and in the store
   */
  const onRemoveButton = () => {
    setSearchValue(undefined);
    setVoucherStatus(undefined);
    setDepartureDate(undefined);
    setReturnDate(undefined);
    props.updateFilter({});
    props.onClose();
  };

  const onConfirmButton = () => {
    props.updateFilter({
      codiceVoucher: searchValue,
      idStato: voucherStatus,
      dataDa: departureDate,
      dataA: returnDate
    });
    props.onConfirm();
  };

  const selectedFilters =
    (voucherStatus !== undefined ? 1 : 0) +
    (departureDate !== undefined ? 1 : 0) +
    (returnDate !== undefined ? 1 : 0) +
    (searchValue && searchValue.length > 0 ? 1 : 0);

  return (
    <Container>
      <AppHeader>
        <Left />
        <Body style={{ alignItems: "center" }}>
          <H5 weight={"SemiBold"} color={"bluegrey"}>
            {I18n.t("bonus.sv.voucherList.filter.title")}
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
          style={IOStyles.flex}
          bounces={false}
          keyboardShouldPersistTaps={"handled"}
        >
          <View style={IOStyles.horizontalContentPadding}>
            <LabelledItem
              iconPosition={"right"}
              inputProps={{
                value: searchValue,
                onChangeText: setSearchValue,
                placeholder: I18n.t(
                  "bonus.sv.voucherList.filter.searchValuePlaceholder"
                ),
                maxLength: 10
              }}
              icon="io-search"
            />
            <VSpacer size={24} />
            {isReady(props.possibleVoucherState) && (
              <>
                <H2>
                  {I18n.t("bonus.sv.voucherList.filter.stateSection.title")}
                </H2>
                <VSpacer size={8} />
                {props.possibleVoucherState.value.map((pVS, i) => (
                  <View key={i}>
                    {renderVoucherStateItem(pVS)}
                    <ItemSeparatorComponent noPadded={true} />
                  </View>
                ))}
                <VSpacer size={24} />
              </>
            )}
            <>
              <H2>{I18n.t("bonus.sv.voucherList.filter.dateSection.title")}</H2>
              <VSpacer size={8} />
              <DateTimePicker
                label={I18n.t(
                  "bonus.sv.voucherList.filter.dateSection.departure"
                )}
                date={departureDate}
                onConfirm={setDepartureDate}
              />
              <VSpacer size={16} />
              <DateTimePicker
                label={I18n.t("bonus.sv.voucherList.filter.dateSection.return")}
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
            I18n.t("bonus.sv.voucherList.filter.cta.removeFilter")
          )}
          rightButton={confirmButtonProps(
            onConfirmButton,
            I18n.t("bonus.sv.voucherList.filter.cta.applyFilter", {
              defaultValue: I18n.t(
                "bonus.sv.voucherList.filter.cta.applyFilter.other",
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateFilter: (filter: FilterState) => dispatch(svSetFilter(filter))
});
const mapStateToProps = (state: GlobalState) => ({
  possibleVoucherState: possibleVoucherStateSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SvVoucherListFilters);
