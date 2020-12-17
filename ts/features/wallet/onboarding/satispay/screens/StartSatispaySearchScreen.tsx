import { View } from "native-base";
import * as React from "react";
import { Image, SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { StyleSheet } from "react-native";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { Link } from "../../../../../components/core/typography/Link";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { openWebUrl } from "../../../../../utils/url";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { navigateToOnboardingSatispaySearchAvailableUserAccount } from "../navigation/action";
import {
  searchUserSatispay,
  walletAddSatispayBack,
  walletAddSatispayCancel
} from "../store/actions";
import satispayLogo from "../../../../../../img/wallet/payment-methods/satispay-logo.png";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  title: { flex: 1, paddingRight: 16, marginTop: -8 },
  image: { width: 100, height: 25 },
  row: { flexDirection: "row", flex: 1 }
});

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.satispay.headerTitle"),
  title: I18n.t("wallet.onboarding.satispay.start.title"),
  body: I18n.t("wallet.onboarding.satispay.start.body"),
  cta: I18n.t("wallet.onboarding.satispay.start.cta")
});

const disclaimerLink = "https://io.italia.it/app-content/privacy_satispay.html";

/**
 * Entrypoint for the satispay onboarding. The user can choose to start the search or
 * cancel and return back.
 * @constructor
 */
const StartSatispaySearchScreen: React.FunctionComponent<Props> = props => {
  const { headerTitle, title, body, cta } = loadLocales();
  return (
    <BaseScreenComponent
      goBack={props.goBack}
      headerTitle={headerTitle}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <View style={IOStyles.horizontalContentPadding}>
            <View spacer={true} large={true} />
            <View style={styles.row}>
              <H1 style={styles.title}>{title}</H1>
              <Image
                source={satispayLogo}
                style={styles.image}
                resizeMode={"contain"}
              />
            </View>
            <View spacer={true} large={true} />
            <Body>{body}</Body>
            <View spacer={true} large={true} />
            <Link onPress={() => openWebUrl(disclaimerLink)}>{cta}</Link>
          </View>
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps(
            props.cancel,
            I18n.t("global.buttons.cancel")
          )}
          rightButton={confirmButtonProps(
            props.search,
            I18n.t("global.buttons.continue")
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => dispatch(walletAddSatispayBack()),
  cancel: () => dispatch(walletAddSatispayCancel()),
  search: () => {
    dispatch(searchUserSatispay.request());
    dispatch(navigateToOnboardingSatispaySearchAvailableUserAccount());
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StartSatispaySearchScreen);
