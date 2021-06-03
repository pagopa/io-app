import { useEffect, useState } from "react";
import * as React from "react";
import { ActivityIndicator, SafeAreaView } from "react-native";
import { NavigationActions, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../components/infoScreen/InfoScreenComponent";
import { LoadingErrorComponent } from "../../features/bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { navigateToEuCovidCertificateDetailScreen } from "../../features/euCovidCert/navigation/actions";
import { EUCovidCertificateAuthCode } from "../../features/euCovidCert/types/EUCovidCertificate";
import I18n from "../../i18n";
import { navigateToMessageDetailScreenAction } from "../../store/actions/navigation";
import { messageStateByIdSelector } from "../../store/reducers/entities/messages/messagesById";
import { GlobalState } from "../../store/reducers/types";
import { InferNavigationParams } from "../../types/react";
import { MessageDetailScreen } from "./MessageDetailScreen";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationInjectedProps<InferNavigationParams<typeof MessageDetailScreen>>;

const LoadingMessageDetails = () => (
  <SafeAreaView
    accessible={true}
    style={IOStyles.flex}
    testID={"LoadMessageDetails"}
  >
    <InfoScreenComponent
      image={
        <ActivityIndicator
          color={"black"}
          accessible={false}
          importantForAccessibility={"no-hide-descendants"}
          accessibilityElementsHidden={true}
          testID={"activityIndicator"}
        />
      }
      title={I18n.t("messageDetails.loadingText")}
    />
  </SafeAreaView>
);

const MessageRouterScreen = (props: Props): React.ReactElement => {
  const [isLoading, setIsLoading] = useState(true);
  const messageId = props.navigation.getParam("messageId");
  const messageState = props.messageState(messageId);

  useEffect(() => {
    props.navigateToEuCovidCertificate(
      "asd" as EUCovidCertificateAuthCode,
      messageId
    );
  }, []);

  return (
    <LoadingErrorComponent
      isLoading={isLoading}
      loadingCaption={I18n.t("messageDetails.loadingText")}
      onAbort={props.cancel}
      onRetry={() => console.log("retry")}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(NavigationActions.back()),
  navigateToDetails: (messageId: string) => {
    dispatch(NavigationActions.back());
    dispatch(navigateToMessageDetailScreenAction({ messageId }));
  },
  navigateToEuCovidCertificate: (
    authCode: EUCovidCertificateAuthCode,
    messageId: string
  ) => {
    dispatch(NavigationActions.back());
    dispatch(navigateToEuCovidCertificateDetailScreen(authCode, messageId));
  }
});
const mapStateToProps = (state: GlobalState) => ({
  messageState: (messageId: string) =>
    messageStateByIdSelector(messageId)(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessageRouterScreen);
