import { Content, View } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet, TextInput } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { connect } from "react-redux";
import { Label } from "../../components/core/typography/Label";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import Switch from "../../components/ui/Switch";
import { Monospace } from "../../components/core/typography/Monospace";
import RegionServiceWebView from "../../components/RegionServiceWebView";
import { Dispatch } from "../../store/actions/types";
import { navigateBack } from "../../store/actions/navigation";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import IconFont from "../../components/ui/IconFont";
import customVariables from "../../theme/variables";

type Props = ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  textInput: { flex: 1, padding: 1, borderWidth: 1, height: 30 },
  center: { alignItems: "center" },
  contentCenter: { justifyContent: "center" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  debugArea: {
    position: "absolute",
    bottom: 0,
    zIndex: 10,
    height: heightPercentageToDP("15%")
  }
});

const WebPlayground: React.FunctionComponent<Props> = (props: Props) => {
  const [navigationURI, setNavigationUri] = React.useState("");
  const [loadUri, setLoadUri] = React.useState("");
  const [webMessage, setWebMessage] = React.useState("");
  const [showDebug, setShowDebug] = React.useState(false);

  return (
    <BaseScreenComponent goBack={true}>
      <SafeAreaView style={styles.flex}>
        <Content contentContainerStyle={styles.flex}>
          <View style={styles.row}>
            <TextInput
              style={styles.textInput}
              onChangeText={setNavigationUri}
              value={navigationURI}
            />
            <View hspacer={true} />
            <ButtonDefaultOpacity
              style={styles.contentCenter}
              onPress={() => setLoadUri(navigationURI)}
            >
              <IconFont
                name={"io-right"}
                style={{
                  color: customVariables.colorWhite
                }}
              />
            </ButtonDefaultOpacity>
          </View>
          <View spacer={true} />
          <View style={styles.row}>
            <Label color={"bluegrey"}>{"Show debug"}</Label>
            <Switch value={showDebug} onValueChange={setShowDebug} />
          </View>
          <View spacer={true} />
          <View style={{ flex: 1 }}>
            {showDebug && <Monospace>{webMessage}</Monospace>}
            <RegionServiceWebView
              uri={loadUri}
              onModalClose={props.goBack}
              handleWebMessage={setWebMessage}
            />
          </View>
        </Content>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => dispatch(navigateBack())
});

export default connect(undefined, mapDispatchToProps)(WebPlayground);
