import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { InfoBox } from "../../components/box/InfoBox";
import { Body } from "../../components/core/typography/Body";
import { H1 } from "../../components/core/typography/H1";
import { Link } from "../../components/core/typography/Link";
import { IOStyles } from "../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { setMixpanelEnabled } from "../../store/actions/mixpanel";
import { isMixpanelEnabled } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { useNavigationContext } from "../../utils/hooks/useOnFocus";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const ShareDataComponent = () => {
  const navigator = useNavigationContext();
  return (
    <>
      <H1>{I18n.t("profile.main.privacy.shareData.screen.title")}</H1>
      <View spacer={true} />
      <Body>{I18n.t("profile.main.privacy.shareData.screen.description")}</Body>
      <View spacer={true} />
      <InfoBox iconName={"io-analytics"}>
        <Body>
          {I18n.t("profile.main.privacy.shareData.screen.why.description")}
        </Body>
        <Link>{I18n.t("profile.main.privacy.shareData.screen.why.cta")}</Link>
      </InfoBox>
      <View spacer={true} />
      <InfoBox iconName={"ShowFalse"}>
        <Body>
          {I18n.t("profile.main.privacy.shareData.screen.security.description")}
        </Body>
        <Link>
          {I18n.t("profile.main.privacy.shareData.screen.security.cta")}
        </Link>
      </InfoBox>
      <View spacer={true} />
      <InfoBox iconName={"io-fornitori"}>
        <Body>
          {I18n.t("profile.main.privacy.shareData.screen.gdpr.description")}
        </Body>
        <Link>{I18n.t("profile.main.privacy.shareData.screen.gdpr.cta")}</Link>
      </InfoBox>
      <View spacer={true} />
      <Body>
        {I18n.t(
          "profile.main.privacy.shareData.screen.additionalInformation.description"
        )}
        <Link
          onPress={() =>
            navigator.navigate(ROUTES.PROFILE_PRIVACY, {
              isProfile: true
            })
          }
        >
          {I18n.t(
            "profile.main.privacy.shareData.screen.additionalInformation.cta"
          )}
        </Link>
      </Body>
    </>
  );
};

const ShareDataScreen = (props: Props): React.ReactElement => (
  <BaseScreenComponent
    goBack={true}
    headerTitle={I18n.t("profile.main.privacy.shareData.title")}
    contextualHelp={emptyContextualHelp}
  >
    <SafeAreaView style={IOStyles.flex}>
      <ScrollView style={[IOStyles.horizontalContentPadding]}>
        <ShareDataComponent />
      </ScrollView>
      {/* {props.footer} */}
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setMixpanelEnabled: (newValue: boolean) =>
    dispatch(setMixpanelEnabled(newValue))
});
const mapStateToProps = (state: GlobalState) => ({
  isMixpanelEnabled: isMixpanelEnabled(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(ShareDataScreen);
