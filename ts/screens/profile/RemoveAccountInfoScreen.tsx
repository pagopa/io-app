import { Body, ContentWrapper } from "@pagopa/io-app-design-system";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../i18n";
import { navigateToRemoveAccountDetailScreen } from "../../store/actions/navigation";
import { loadBonusBeforeRemoveAccount } from "../../store/actions/profile";

type Props = ReturnType<typeof mapDispatchToProps>;

/**
 * A screen to explain how the account removal works.
 * Here user can ask to delete his account
 */
const RemoveAccountInfo: React.FunctionComponent<Props> = props => {
  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: () => {
      props.loadBonus();
      props.navigateToRemoveAccountDetail();
    },
    title: I18n.t("profile.main.privacy.removeAccount.info.cta")
  };

  const footerComponent = (
    <SafeAreaView>
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={continueButtonProps}
      />
    </SafeAreaView>
  );
  return (
    <RNavScreenWithLargeHeader
      title={{
        label: I18n.t("profile.main.privacy.removeAccount.title")
      }}
      fixedBottomSlot={footerComponent}
    >
      <ContentWrapper>
        <Body weight="Regular">
          {I18n.t("profile.main.privacy.removeAccount.info.body")}
        </Body>
      </ContentWrapper>
    </RNavScreenWithLargeHeader>
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadBonus: () => dispatch(loadBonusBeforeRemoveAccount()),
  navigateToRemoveAccountDetail: () => navigateToRemoveAccountDetailScreen()
});
export default connect(undefined, mapDispatchToProps)(RemoveAccountInfo);
