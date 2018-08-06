import { Text, View } from "native-base";
import { H3 } from "native-base";
import * as React from "react";
import { Linking } from "react-native";
import I18n from "../../i18n";

export default class TermOfUse extends React.Component {
  private openLinkByBrowser() {
    // tslint:disable: no-floating-promises
    Linking.openURL("https://www.agid.gov.it/");
  }

  public render(): React.ReactNode {
    return (
      <View>
        <Text>{I18n.t("personal_data_processing.paragraph1")}</Text>
        <View spacer={true} />
        <Text>
          {I18n.t("personal_data_processing.paragraph2-part1")}
          <Text bold={true}>
            {I18n.t("personal_data_processing.paragraph2-bold")}
          </Text>
          <Text>{I18n.t("personal_data_processing.paragraph2-part2")}</Text>
        </Text>
        <View spacer={true} />
        <Text>
          {I18n.t("personal_data_processing.paragraph3-part1")}
          <Text bold={true}>
            {I18n.t("personal_data_processing.paragraph3-bold")}
          </Text>
          <Text>{I18n.t("personal_data_processing.paragraph3-part2")}</Text>
        </Text>
        <View spacer={true} />
        <Text>{I18n.t("personal_data_processing.paragraph4")}</Text>
        <View spacer={true} />
        <Text>
          {`${I18n.t("personal_data_processing.paragraph5-part1")} `}
          <Text link={true} onPress={(): void => this.openLinkByBrowser()}>
            {I18n.t("personal_data_processing.paragraph5-link")}
          </Text>
          <Text>{I18n.t("personal_data_processing.paragraph5-part2")}</Text>
        </Text>
        <View spacer={true} />
        <Text>{I18n.t("personal_data_processing.paragraph6")}</Text>
        <View spacer={true} />
        <Text>{I18n.t("personal_data_processing.paragraph7")}</Text>
        <View spacer={true} />
        <Text>{I18n.t("personal_data_processing.paragraph8")}</Text>
        <View spacer={true} extralarge={true} />
        <H3>{I18n.t("personal_data_processing.subtitle")}</H3>
        <View spacer={true} />
        <Text>{I18n.t("personal_data_processing.paragraph9")}</Text>
        <View spacer={true} />
        <Text>{I18n.t("personal_data_processing.paragraph10")}</Text>

        <View spacer={true} />

        <Text>{I18n.t("personal_data_processing.paragraph11")}</Text>
        <View spacer={true} />
        <Text>{I18n.t("personal_data_processing.paragraph12")}</Text>
        <View spacer={true} />
        <Text>{I18n.t("personal_data_processing.paragraph13")}</Text>

        <View spacer={true} />
        <Text>{I18n.t("personal_data_processing.paragraph14")}</Text>
        <View spacer={true} />
        <Text>{I18n.t("personal_data_processing.paragraph15")}</Text>
        <View spacer={true} />
        <Text>{I18n.t("personal_data_processing.paragraph16")}</Text>
        <View spacer={true} large={true} />
      </View>
    );
  }
}
