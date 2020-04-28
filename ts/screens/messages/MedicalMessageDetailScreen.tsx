import { fromNullable } from "fp-ts/lib/Either";
import I18n from "i18n-js";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { messageStateByIdSelector } from "../../store/reducers/entities/messages/messagesById";
import { GlobalState } from "../../store/reducers/types";

type NavigationParams = Readonly<{
  messageId: string;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

class MedicalMessageDetailScreen extends React.PureComponent<Props> {
  public render() {
    return (
      <BaseScreenComponent
        headerTitle={I18n.t("messageDetails.headerTitle")}
        goBack={true}
      />
    );
  }
}

const mapStateToProps = (state: GlobalState, props: OwnProps) => {
  const messageId = props.navigation.getParam("messageId");
  return fromNullable(messageStateByIdSelector(messageId)(state));
};

export default connect(mapStateToProps)(MedicalMessageDetailScreen);
