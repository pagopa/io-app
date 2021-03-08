import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Body } from "../../../../../../components/core/typography/Body";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import { cancelButtonProps } from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { walletAddPrivativeCancel } from "../../store/actions";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.privative.headerTitle"),
  title: I18n.t("wallet.onboarding.privative.choosePrivativeIssuer.title"),
  body: I18n.t("wallet.onboarding.privative.choosePrivativeIssuer.body")
});

const ChoosePrivativeIssuerComponent = (props: Props): React.ReactElement => {
  const { headerTitle, title, body } = loadLocales();
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={headerTitle}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
          <H1>{title}</H1>
          <View spacer={true} />
          <Body>{body}</Body>
        </View>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={cancelButtonProps(props.cancel)}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddPrivativeCancel())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChoosePrivativeIssuerComponent);
