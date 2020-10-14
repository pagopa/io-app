import { Content } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";

import { NavigationScreenProps } from "react-navigation";
import { IOStyles } from "../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import { H1 } from "../../components/core/typography/H1";
import { H4 } from "../../components/core/typography/H4";
import ROUTES from "../../navigation/routes";

type Props = NavigationScreenProps;

/**
 * A screen to explain how the account removal works.
 * Here user can ask to delete his account
 */
const RemoveAccountInfo: React.FunctionComponent<Props> = props => {
  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: () =>
      props.navigation.navigate(ROUTES.PROFILE_REMOVE_ACCOUNT_DETAILS),
    title: I18n.t("profile.main.privacy.removeAccount.info.cta")
  };

  const footerComponent = (
    <FooterWithButtons type={"SingleButton"} leftButton={continueButtonProps} />
  );
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("profile.main.title")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <Content>
          <H1>{I18n.t("profile.main.privacy.removeAccount.title")}</H1>
          <H4 weight="Regular">
            {I18n.t("profile.main.privacy.removeAccount.info.body")}
          </H4>
        </Content>
        {footerComponent}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default RemoveAccountInfo;
