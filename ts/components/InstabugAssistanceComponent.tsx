import { BugReporting } from "instabug-reactnative";
import { H3, Text, View } from "native-base";
import * as React from "react";
import I18n from "../i18n";
import AdviceComponent from "./AdviceComponent";
import ButtonWithImage from "./ButtonWithImage";

type Props = Readonly<{
  requestAssistance: (type: BugReporting.reportType) => void;
}>;

/**
 * A component to display the buttons to access a new chat with the assistance via Instabug.
 * The logic to manage the Instabug APIs is inerithed from the withInstabugHelper HOC.
 */
class InstabugAssistanceComponent extends React.PureComponent<Props> {
  public render() {
    return (
      <React.Fragment>
        <H3>{I18n.t("instabug.contextualHelp.title1")}</H3>
        <View spacer={true} />
        <Text>{I18n.t("instabug.contextualHelp.description")}</Text>
        <View spacer={true} />
        <Text>{I18n.t("instabug.contextualHelp.descriptionChat")}</Text>
        <View spacer={true} large={true} />
        <AdviceComponent
          adviceMessage={I18n.t("instabug.contextualHelp.assistanceWorkHours")}
        />
        <View spacer={true} />
        <ButtonWithImage
          icon={"io-bug"}
          onPress={() =>
            this.props.requestAssistance(BugReporting.reportType.bug)
          }
          text={I18n.t("instabug.contextualHelp.buttonBug")}
          disabled={false}
          light={true}
        />
        <View spacer={true} />
        <Text>{I18n.t("instabug.contextualHelp.descriptionBug")}</Text>
        <View spacer={true} />
        <ButtonWithImage
          icon={"io-send-message"}
          onPress={() =>
            this.props.requestAssistance(BugReporting.reportType.question)
          }
          text={I18n.t("instabug.contextualHelp.buttonChat")}
          disabled={false}
          light={true}
        />
      </React.Fragment>
    );
  }
}

export default InstabugAssistanceComponent;
