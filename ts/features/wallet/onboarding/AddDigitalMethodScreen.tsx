import { Content, View } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
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
import DigitalMethodsList from "./DigitalMethodsList";

type Props = ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  whiteContent: {
    backgroundColor: IOColors.white,
    flex: 1
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.newPaymentMethod.contextualHelpTitle",
  body: "wallet.newPaymentMethod.contextualHelpContent"
};

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
            <DigitalMethodsList />
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
