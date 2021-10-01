import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { Alert, StyleSheet } from "react-native";

import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { ReduxProps } from "../../store/actions/types";
import {
  resetUserDataProcessingRequest,
  upsertUserDataProcessing
} from "../../store/actions/userDataProcessing";
import { GlobalState } from "../../store/reducers/types";
import { userDataProcessingSelector } from "../../store/reducers/userDataProcessing";
import themeVariables from "../../theme/variables";
import { showToast } from "../../utils/showToast";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps &
  OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  isMarkdownLoaded: boolean;
};

const styles = StyleSheet.create({
  mainContent: {
    flex: 1
  },
  markdownContainer: {
    paddingLeft: themeVariables.contentPadding,
    paddingRight: themeVariables.contentPadding
  }
});

/**
 * A screen to explain how profile data export works.
 * Here user can ask to download his data
 */
class DownloadProfileDataScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isMarkdownLoaded: false };
  }

  public componentDidUpdate(prevProps: Props) {
    const prev =
      prevProps.userDataProcessing[UserDataProcessingChoiceEnum.DOWNLOAD];
    const curr =
      this.props.userDataProcessing[UserDataProcessingChoiceEnum.DOWNLOAD];
    // the request to download has been done
    if (pot.isUpdating(prev) && pot.isSome(curr)) {
      // we got an error
      if (pot.isError(curr)) {
        showToast(I18n.t("profile.main.privacy.exportData.error"));
        return;
      }
      // success, go back!
      this.props.navigation.goBack();
    }
  }

  private handleDownloadPress = (): void => {
    Alert.alert(
      I18n.t("profile.main.privacy.exportData.alert.requestTitle"),
      undefined,
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel",
          onPress: () => this.props.resetRequest()
        },
        {
          text: I18n.t("global.buttons.continue"),
          style: "default",
          onPress: () => {
            this.props.upsertUserDataProcessing();
          }
        }
      ]
    );
  };

  public render() {
    const ContainerComponent = withLoadingSpinner(() => (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("profile.main.privacy.exportData.title")}
      >
        <ScreenContent
          title={I18n.t("profile.main.privacy.exportData.title")}
          subtitle={I18n.t("profile.main.privacy.exportData.info.title")}
          bounces={false}
        >
          <View style={styles.markdownContainer}>
            <Markdown
              onLoadEnd={() => this.setState({ isMarkdownLoaded: true })}
            >
              {I18n.t("profile.main.privacy.exportData.info.body")}
            </Markdown>
            {this.state.isMarkdownLoaded && <EdgeBorderComponent />}
          </View>
        </ScreenContent>
        {this.state.isMarkdownLoaded && (
          <FooterWithButtons
            type={"SingleButton"}
            leftButton={{
              block: true,
              primary: true,
              onPress: this.handleDownloadPress,
              title: I18n.t("profile.main.privacy.exportData.cta")
            }}
          />
        )}
      </BaseScreenComponent>
    ));
    return <ContainerComponent isLoading={this.props.isLoading} />;
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  upsertUserDataProcessing: () =>
    dispatch(
      upsertUserDataProcessing.request(UserDataProcessingChoiceEnum.DOWNLOAD)
    ),
  resetRequest: () =>
    dispatch(
      resetUserDataProcessingRequest(UserDataProcessingChoiceEnum.DOWNLOAD)
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DownloadProfileDataScreen);
