import * as React from "react";
import { View, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
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

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  title: { flex: 1, paddingRight: 16 },
  row: { flexDirection: "row", flex: 1 }
});

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.satispay.headerTitle"),
  title: I18n.t("wallet.onboarding.satispay.start.title"),
  body: I18n.t("wallet.onboarding.satispay.start.body"),
  cta: I18n.t("wallet.onboarding.satispay.start.cta")
});

// FIXME add the suffix "/app-content/privacy_satispay.html" once the url will be published
const disclaimerLink = "https://io.italia.it/";

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
            <VSpacer size={24} />
            <View style={styles.row}>
              <H1 style={styles.title}>{title}</H1>
            </View>
            <VSpacer size={24} />
            <Body>{body}</Body>
            <VSpacer size={24} />
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
    navigateToOnboardingSatispaySearchAvailableUserAccount();
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StartSatispaySearchScreen);
