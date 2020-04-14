import I18n from "i18n-js";
import { BugReporting } from "instabug-reactnative";
import { H3, Text, View } from "native-base";
import * as React from "react";
import ButtonWithImage from "./ButtonWithImage";

type Props = Readonly<{
  setReportType: (type: BugReporting.reportType) => void;
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
        <View spacer={true} extrasmall={true} />
        <ButtonWithImage
          icon={"io-send-message"}
          onClick={() =>
            this.props.setReportType(BugReporting.reportType.question)
          }
          text={I18n.t("instabug.contextualHelp.buttonChat")}
          disabled={false}
          light={true}
        />
        <View spacer={true} />
        <Text>{I18n.t("instabug.contextualHelp.descriptionChat")}</Text>
        <View spacer={true} />

        <ButtonWithImage
          icon={"io-bug"}
          onClick={() => this.props.setReportType(BugReporting.reportType.bug)}
          text={I18n.t("instabug.contextualHelp.buttonBug")}
          disabled={false}
          light={true}
        />
        <View spacer={true} />
        <Text>{I18n.t("instabug.contextualHelp.descriptionBug")}</Text>
      </React.Fragment>
    );
  }
}

export default InstabugAssistanceComponent;
