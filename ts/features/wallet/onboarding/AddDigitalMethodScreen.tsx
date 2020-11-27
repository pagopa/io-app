import { Content, Image, ListItem, View } from "native-base";
import * as React from "react";
import {
  FlatList,
  ImageSourcePropType,
  ListRenderItemInfo,
  SafeAreaView,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import I18n from "../../../i18n";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import { IOColors } from "../../../components/core/variables/IOColors";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { GlobalState } from "../../../store/reducers/types";
import { Dispatch } from "../../../store/actions/types";
import { navigateBack } from "../../../store/actions/navigation";
import { H3 } from "../../../components/core/typography/H3";
import { H5 } from "../../../components/core/typography/H5";

type Props = ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  whiteContent: {
    backgroundColor: IOColors.white,
    flex: 1
  },
  listItem: {
    marginLeft: 0,
    paddingRight: 0,
    flexDirection: "row"
  },
  logo: { width: 80, height: 40, resizeMode: "cover" }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.newPaymentMethod.contextualHelpTitle",
  body: "wallet.newPaymentMethod.contextualHelpContent"
};

type DigitalPaymentItem = {
  name: string;
  subtitle: string;
  logo?: ImageSourcePropType;
  onPress?: () => void;
  implemented?: boolean;
};

const getMethods = (_: Props): ReadonlyArray<DigitalPaymentItem> => [
  {
    name: "BANCOMAT Pay",
    subtitle: "Paga con BANCOMAT Pay",
    logo: require("../../../../img/wallet/payment-methods/bancomatpay-logo.png"),
    implemented: true
  },
  {
    name: "Satispay",
    subtitle: "Paga con Satispay",
    logo: require("../../../../img/wallet/cards-icons/satispay.png"),
    implemented: true
  },
  {
    name: I18n.t("wallet.methods.postepay.name"),
    subtitle: I18n.t("wallet.methods.postepay.description"),
    implemented: false
  },
  {
    name: I18n.t("wallet.methods.digital.name"),
    subtitle: I18n.t("wallet.methods.digital.description"),
    implemented: false
  },
  {
    name: I18n.t("wallet.methods.bonus.name"),
    subtitle: I18n.t("wallet.methods.bonus.description"),
    implemented: false
  }
];

const AddDigitalMethodScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const cancelButtonProps = {
    block: true,
    light: true,
    bordered: true,
    onPress: props.navigateBack,
    title: I18n.t("global.buttons.cancel")
  };

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["wallet", "wallet_methods"]}
      headerTitle={I18n.t("wallet.addPaymentMethodTitle")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <Content
          noPadded={true}
          scrollEnabled={false}
          style={styles.whiteContent}
        >
          <View style={IOStyles.horizontalContentPadding}>
            <FlatList
              scrollEnabled={false}
              data={getMethods(props)}
              renderItem={({ item }: ListRenderItemInfo<DigitalPaymentItem>) =>
                item.implemented && (
                  <ListItem style={styles.listItem} onPress={item.onPress}>
                    <View>
                      <H3>{item.name}</H3>
                      <H5 weight={"Regular"}>{item.subtitle}</H5>
                    </View>
                    {item.logo && (
                      <Image source={item.logo} style={styles.logo} />
                    )}
                  </ListItem>
                )
              }
              keyExtractor={item => item.name}
            />
          </View>
        </Content>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={cancelButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateBack: () => dispatch(navigateBack())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddDigitalMethodScreen);
