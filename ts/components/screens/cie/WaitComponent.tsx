import { Millisecond } from "italia-ts-commons/lib/units";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import I18n from "../../../i18n";
import variables from "../../../theme/variables";
import IconFont from "../../ui/IconFont";

interface Props {}

interface State {
  delay: boolean;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "center"
  },
  column: {
    flexDirection: "column",
    justifyContent: "center"
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: -100
  },
  icon: {
    fontFamily: "io-icon-font",
    color: variables.brandPrimary,
    lineHeight: 0
  },
  text: {
    textAlign: "center",
    marginTop: 10
  }
});

// DELAY_TIME contain the number of millisecond that the component must wait before disappearing
const DELAY_TIME = 5000 as Millisecond;

// This component allows to show a temporary waiting message
class WaitComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      delay: false
    };
  }

  public componentDidMount() {
    setTimeout(() => {
      this.setState({
        delay: true
      });
    }, DELAY_TIME);
  }

  public render() {
    return (
      <View
        style={[
          styles.container,
          { display: this.state.delay ? "none" : "flex" }
        ]}
      >
        <View style={styles.column}>
          <View style={styles.row}>
            <IconFont
              style={{ justifyContent: "center" }}
              name="io-success"
              color={variables.textLinkColor}
              size={80}
            />
          </View>
          <View spacer={true} />
          <Text style={styles.text}>
            {I18n.t("authentication.landing.cieLoginWait")}
          </Text>
        </View>
      </View>
    );
  }
}
export default WaitComponent;
