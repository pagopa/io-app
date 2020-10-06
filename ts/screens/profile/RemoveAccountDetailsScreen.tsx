import { censor } from "fp-ts/lib/Writer";
import * as pot from "italia-ts-commons/lib/pot";
import { View, Text, List, Radio } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import DetailedlistItemComponent from "../../components/screens/DetailedlistItemComponent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
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
import IconFont from "./../../components/ui/IconFont";
import { title } from "process";
import reactotron from "reactotron-react-native";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps &
  OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  isMarkdownLoaded: boolean;
  selectedMotivation: number;
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

type PropsItem = Readonly<{
  items: Array<string>;
  title: string;
  key: string;
  selected: number;
  onPress: (selected: number) => void;
}>;

const RenderListItem: React.FunctionComponent<PropsItem> = (
  props: PropsItem
) => {
  const styles = {
    title: {
      paddingTop: 10,
      paddingBottom: 10
    },
    item: {
      flexDirection: "row" as const,
      flex: 1,
      paddingTop: 10,
      paddingBottom: 10
    },
    icon: {
      paddingBottom: 15,
      paddingRight: 20
    }
  };

  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  reactotron.log(selectedIndex);

  return (
    <View>
      <Text style={styles.title}>{props.title}</Text>
      <View
        style={{
          flex: 1,
          flexDirection: "column"
        }}
      >
        {props.items.map((item, key) => (
          <View key={`${props.key}_${key}`} style={styles.item}>
            <IconFont
              name={selectedIndex === key ? "io-radio-on" : "io-radio-off"}
              size={24}
              color={themeVariables.contentPrimaryBackground}
              onPress={() => {
                setSelectedIndex(key);
                props.onPress(key);
              }}
              style={styles.icon}
            />
            <Text style={{ flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * A screen to explain how the account removal works.
 * Here user can ask to delete his account
 */
class RemoveAccountDetails extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isMarkdownLoaded: false,
      selectedMotivation: -1
    };
  }

  public componentDidUpdate(prevProps: Props) {
    const prev =
      prevProps.userDataProcessing[UserDataProcessingChoiceEnum.DOWNLOAD];
    const curr = this.props.userDataProcessing[
      UserDataProcessingChoiceEnum.DOWNLOAD
    ];
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

  private handleContinuePress = (): void => {
    this.props.navigation.navigate(ROUTES.PROFILE_DOWNLOAD_DATA);
  };

  public render() {
    const ContainerComponent = withLoadingSpinner(() => (
      <TopScreenComponent
        goBack={true}
        headerTitle={I18n.t("profile.main.title")}
      >
        <ScreenContent
          title={I18n.t("profile.main.privacy.removeAccountInfo.title")}
          bounces={false}
        >
          <Text
            style={{
              paddingHorizontal: themeVariables.contentPadding
            }}
          >
            {I18n.t("send_email_messages.subtitle")}
            <Text bold={true}>Pippo</Text>
            <Text>{I18n.t("global.symbols.question")}</Text>
          </Text>

          <List withContentLateralPadding={true} style={{ paddingTop: 6 }}>
            <RenderListItem
              title="Qual'è il motivo della cancellazione?"
              key="delete_reason"
              items={[
                "Non ritengo più utile IO",
                "Non mi sento al sicuro su IO",
                "Non ho mai usato l'app",
                "Nessuno dei precedenti"
              ]}
              selected={this.state.selectedMotivation}
              onPress={motivationIndex => {
                this.setState(
                  {
                    selectedMotivation: motivationIndex
                  },
                  () => {
                    reactotron.log("parent:" + this.state.selectedMotivation);
                  }
                );
              }}
            />
          </List>
        </ScreenContent>
        {this.state.isMarkdownLoaded && (
          <FooterWithButtons
            type={"SingleButton"}
            leftButton={{
              block: true,
              primary: true,
              onPress: this.handleContinuePress,
              title: I18n.t("profile.main.privacy.removeAccountInfo.cta")
            }}
          />
        )}
      </TopScreenComponent>
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
)(RemoveAccountDetails);
