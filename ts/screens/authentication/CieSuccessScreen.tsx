import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import variables from "../../theme/variables";

const ICON_SIZE = 80;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 100
  },
  icon: {
    color: variables.brandPrimary
  },
  text: {
    textAlign: "center",
    marginTop: 10
  }
});

class CieSuccessScreen extends React.Component<Props> {
  public render(): React.ReactNode {
    return (
      <BaseScreenComponent goBack={true}>
        <View style={styles.container}>
          <IconFont style={styles.icon} name="io-success" size={ICON_SIZE} />
          <View spacer={true} />
          <Text style={styles.text}>
            {I18n.t("authentication.landing.cieLoginWait")}
          </Text>
        </View>
      </BaseScreenComponent>
    );
  }
}

export default CieSuccessScreen;
