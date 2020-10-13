import * as pot from "italia-ts-commons/lib/pot";
import { Content, View } from "native-base";
import * as React from "react";
import { StyleSheet, SafeAreaView } from "react-native";

import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { ReduxProps } from "../../store/actions/types";
import {
  resetUserDataProcessingRequest,
  upsertUserDataProcessing
} from "../../store/actions/userDataProcessing";
import { GlobalState } from "../../store/reducers/types";
import { userDataProcessingSelector } from "../../store/reducers/userDataProcessing";
import themeVariables from "../../theme/variables";
import { showToast } from "../../utils/showToast";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { H1 } from "../../components/core/typography/H1";
import { H4 } from "../../components/core/typography/H4";
import { none } from "fp-ts/lib/OptionT";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps &
  OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * A screen to explain how the account removal works.
 * Here user can ask to delete his account
 */
const RemoveAccountInfo: React.FunctionComponent<Props> = props => {
  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: () => none,
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

// class RemoveAccountInfo extends React.PureComponent<Props, State> {
//   constructor(props: Props) {
//     super(props);
//     this.state = { isMarkdownLoaded: false };
//   }

//   public componentDidUpdate(prevProps: Props) {
//     const prev =
//       prevProps.userDataProcessing[UserDataProcessingChoiceEnum.DOWNLOAD];
//     const curr = this.props.userDataProcessing[
//       UserDataProcessingChoiceEnum.DOWNLOAD
//     ];
//     // the request to download has been done
//     if (pot.isUpdating(prev) && pot.isSome(curr)) {
//       // we got an error
//       if (pot.isError(curr)) {
//         showToast(I18n.t("profile.main.privacy.exportData.error"));
//         return;
//       }
//       // success, go back!
//       this.props.navigation.goBack();
//     }
//   }

//   private handleContinuePress = (): void => {
//     this.props.navigation.navigate(ROUTES.PROFILE_REMOVE_ACCOUNT_DETAILS);
//   };

//   public render() {
//     const ContainerComponent = withLoadingSpinner(() => (
//       <BaseScreenComponent
//         goBack={true}
//         headerTitle={I18n.t("profile.main.title")}
//       >
//         <ScreenContent
//           title={I18n.t("profile.main.privacy.removeAccountInfo.title")}
//           bounces={false}
//         >
//           <View style={styles.markdownContainer}>
//             <Markdown
//               onLoadEnd={() => this.setState({ isMarkdownLoaded: true })}
//             >
//               {I18n.t("profile.main.privacy.removeAccountInfo.body")}
//             </Markdown>
//             {this.state.isMarkdownLoaded && <EdgeBorderComponent />}
//           </View>
//         </ScreenContent>
//         {this.state.isMarkdownLoaded && (
//           <FooterWithButtons
//             type={"SingleButton"}
//             leftButton={{
//               block: true,
//               primary: true,
//               onPress: this.handleContinuePress,
//               title: I18n.t("profile.main.privacy.removeAccountInfo.cta")
//             }}
//           />
//         )}
//       </BaseScreenComponent>
//     ));
//     return <ContainerComponent isLoading={this.props.isLoading} />;
//   }
// }

const mapDispatchToProps = (dispatch: Dispatch) => ({
  upsertUserDataProcessing: () =>
    dispatch(
      upsertUserDataProcessing.request(UserDataProcessingChoiceEnum.DOWNLOAD)
    )
});

function mapStateToProps(state: GlobalState) {
  const userDataProcessing = userDataProcessingSelector(state);
  const isLoading =
    pot.isLoading(userDataProcessing.DOWNLOAD) ||
    pot.isUpdating(userDataProcessing.DOWNLOAD);
  return {
    userDataProcessing,
    isLoading
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RemoveAccountInfo);
