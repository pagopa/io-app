import { Container, Content, List, View } from "native-base";
import React from "react";
import { BackHandler, StyleSheet } from "react-native";

import { connect } from "react-redux";
import I18n from "../i18n";
import { LogoutOption, logoutRequest } from "../store/actions/authentication";
import { Dispatch } from "../store/actions/types";
import { isLogoutRequested } from "../store/reducers/authentication";
import { GlobalState } from "../store/reducers/types";
import variables from "../theme/variables";
import { withLoadingSpinner } from "./helpers/withLoadingSpinner";
import ListItemComponent from "./screens/ListItemComponent";
import FooterWithButtons from "./ui/FooterWithButtons";

type OwnProps = {
  onCancel: () => void;
  header?: React.ReactNode;
};

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  content: {
    padding: variables.contentPadding,
    paddingTop: 48
  },
  separator: {
    height: 40,
    width: "100%"
  },
  itemLeft: {
    flexDirection: "column",
    alignItems: "flex-start"
  },
  itemLeftText: {
    alignSelf: "flex-start"
  }
});

/**
 * A modal that allow the user to select the logout method of choice
 */
class SelectLogoutOption extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  private onBackPress = () => {
    this.props.onCancel();
    // Returning true is mandatory to avoid the default press action to be
    // triggered as if the modal was not visible
    return true;
  };
  public render() {
    // Using the loading spinner HOC to avoid reimplementing the Loading component
    const ContainerComponent = withLoadingSpinner(() => (
      <Container>
        <Content style={styles.content}>
          {this.props.header || null}
          <List>
            <ListItemComponent
              title={I18n.t("profile.logout.cta.keepData.title")}
              subTitle={I18n.t("profile.logout.cta.keepData.description")}
              onPress={() => this.props.logout({ keepUserData: true })}
              useExtendedSubTitle={true}
            />

            <ListItemComponent
              title={I18n.t("profile.logout.cta.resetData.title")}
              subTitle={I18n.t("profile.logout.cta.resetData.description")}
              onPress={() => this.props.logout({ keepUserData: false })}
              useExtendedSubTitle={true}
            />
          </List>
          <View style={styles.separator} />
        </Content>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            bordered: true,
            onPress: this.props.onCancel,
            title: I18n.t("global.buttons.cancel"),
            block: true
          }}
        />
      </Container>
    ));

    return <ContainerComponent isLoading={this.props.isLogoutInProgress} />;
  }

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }
}

const mapStateToProps = (state: GlobalState) => ({
    isLogoutInProgress: isLogoutRequested(state)
  });

const mapDispatchToProps = (dispatch: Dispatch) => ({
  logout: (logoutOption: LogoutOption) => dispatch(logoutRequest(logoutOption))
});

export default connect(mapStateToProps, mapDispatchToProps)(SelectLogoutOption);
