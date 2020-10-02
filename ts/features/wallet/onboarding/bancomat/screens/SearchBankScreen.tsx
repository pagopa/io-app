import { Content, Input, Item, Label, Text, View } from "native-base";
import * as React from "react";
import { FlatList, ListRenderItemInfo, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Link } from "../../../../../components/core/typography/Link";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { GlobalState } from "../../../../../store/reducers/types";
import IconFont from "../../../../../components/ui/IconFont";
import { BankPreviewItem } from "../components/BankPreviewItems";
import { abis } from "../mock/mockData";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import I18n from "../../../../../i18n";
import { navigateBack } from "../../../../../store/actions/navigation";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { withLightModalContext } from "../../../../../components/helpers/withLightModalContext";
import { LightModalContextInterface } from "../../../../../components/ui/LightModal";
import TosBonusComponent from "../../../../bonus/bonusVacanze/components/TosBonusComponent";

type Props = LightModalContextInterface &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;
/**
 * This screen allows the user to choose a specific bank to search for their Bancomat.
 * the user can also choose not to specify any bank and search for all Bancomat in his name
 * @constructor
 */
const SearchBankScreen: React.FunctionComponent<Props> = (props: Props) => {
  const [searchText, setSearchText] = React.useState("");
  const [filteredList, setFilteredList] = React.useState(
    [] as typeof props.bankList
  );

  const [isSearchStarted, setIsSearchStarted] = React.useState(false);

  const renderListItem = (isList: boolean) => (
    info: ListRenderItemInfo<any>
  ) => (
    <BankPreviewItem
      bank={info.item}
      inList={isList}
      onPress={props.onItemPress}
    />
  );

  const handleFilter = (text: string) => {
    setIsSearchStarted(true);
    const resultList = props.bankList.filter(
      bank =>
        bank.abi.toLowerCase().indexOf(text.toLowerCase()) > -1 ||
        bank.name.toLowerCase().indexOf(text.toLowerCase()) > -1
    );
    setFilteredList(resultList);
    setSearchText(text);
  };

  const keyExtractor = (bank: any): string => bank.abi;

  const openTosModal = () => {
    props.showModal(
      <TosBonusComponent
        tos_url={"https://google.com"}
        onClose={props.hideModal}
      />
    );
  };

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("bonus.bpd.searchAbi.title")}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Content style={{ flex: 1 }}>
          {!isSearchStarted && (
            <>
              <View spacer={true} large={true} />
              <Text>
                <Text bold={true}>
                  {I18n.t("bonus.bpd.searchAbi.description.text1")}
                </Text>
                {I18n.t("bonus.bpd.searchAbi.description.text2")}
                <Link onPress={openTosModal}>
                  {I18n.t("bonus.bpd.searchAbi.description.text3")}
                </Link>
              </Text>
            </>
          )}
          <View spacer={true} />
          <Label>{I18n.t("bonus.bpd.searchAbi.bankName")}</Label>
          <Item>
            <Input
              placeholder={I18n.t("bonus.bpd.searchAbi.bankName")}
              value={searchText}
              onChangeText={handleFilter}
            />
            <IconFont name="io-search" />
          </Item>
          <View spacer={true} />
          <FlatList
            data={filteredList}
            renderItem={renderListItem(true)}
            keyExtractor={keyExtractor}
          />
        </Content>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps(
            props.onCanel,
            I18n.t("global.buttons.cancel")
          )}
          rightButton={confirmButtonProps(
            props.onContinue,
            I18n.t("global.buttons.continue")
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onCanel: () => dispatch(navigateBack()),
  onItemPress: () => null,
  onContinue: () => null
});

const mapStateToProps = (_: GlobalState) => ({
  bankList: abis
});

export default withLightModalContext(
  connect(mapStateToProps, mapDispatchToProps)(SearchBankScreen)
);
