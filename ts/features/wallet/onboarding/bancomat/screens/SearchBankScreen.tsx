import { Input, Item, Label, Text, View } from "native-base";
import * as React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  SafeAreaView,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Link } from "../../../../../components/core/typography/Link";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { GlobalState } from "../../../../../store/reducers/types";
import IconFont from "../../../../../components/ui/IconFont";
import customVariables from "../../../../../theme/variables";
import { BankPreviewItem } from "../components/BankPreviewItems";

const styles = StyleSheet.create({
  paddedContent: {
    paddingHorizontal: customVariables.contentPadding
  }
});

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;
/**
 * This screen allows the user to choose a specific bank to search for their Bancomat.
 * the user can also choose not to specify any bank and search for all Bancomat in his name
 * @constructor
 */
const SearchBankScreen: React.FunctionComponent<Props> = (props: Props) => {
  const [searchText, setSearchText] = React.useState("");

  const renderListItem = (isList: boolean) => (
    info: ListRenderItemInfo<any>
  ) => (
    <BankPreviewItem
      bank={info.item}
      inList={isList}
      onPress={props.onItemPress}
    />
  );

  return (
    <BaseScreenComponent goBack={true} headerTitle={"Aggiungi carta Bancomat"}>
      <SafeAreaView style={styles.paddedContent}>
        <View spacer={true} large={true} />
        <Text>
          <Text bold={true}>{"Se vuoi, puoi indicare la banca"}</Text>{" "}
          {
            "su cui hai un carta Pagobancomat attiva. Altrimenti cercheremo tutte le carta associate a te: proseguendo accetti l’"
          }
          <Link>{"informativa sul trattamento dei dati personali"}</Link>
        </Text>
        <View spacer={true} />
        <Item floatingLabel>
          <Label>{"Denominazione della banca"}</Label>
          <Input value={searchText} onChangeText={setSearchText} />
          <IconFont name="io-search" />
        </Item>
        <View spacer={true} />
        <FlatList
          numColumns={2}
          data={props.bankList}
          renderItem={renderListItem(false)}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  onItemPress: () => null
});

const mapStateToProps = (_: GlobalState) => ({
  bankList: [
    {
      name: "Unicredit",
      logo_uri:
        "https://motorvalleyfest.it/wp-content/uploads/2020/05/logo_unicredit.png"
    },
    {
      name: "Intesa San Paolo",
      logo_uri:
        "https://upload.wikimedia.org/wikipedia/it/5/51/Intesa_Sanpaolo_logo.svg"
    }
  ]
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchBankScreen);
