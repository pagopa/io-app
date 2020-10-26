import { Content, View } from "native-base";
import URLParse from "url-parse";
import * as React from "react";
import { SafeAreaView, StyleSheet, TextInput } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { connect } from "react-redux";
import CookieManager, { Cookie } from "@react-native-community/cookies";
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
import { LabelledItem } from "../../components/LabelledItem";
import { showToast } from "../../utils/showToast";

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
  const [cookieName, setCookieName] = React.useState("");
  const [cookieValue, setCookieValue] = React.useState("");
  const [loadUri, setLoadUri] = React.useState("");
  const [webMessage, setWebMessage] = React.useState("");
  const [showDebug, setShowDebug] = React.useState(false);
  const [saveCookie, setSaveCookie] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);

  const setCookieOnDomain = () => {
    if (loadUri === "") {
      showToast("Missing domain");
      return;
    }
    const url = new URLParse(loadUri, true);

    const cookie: Cookie = {
      name: cookieName,
      value: cookieValue,
      domain: url.hostname,
      path: "/"
    };

    CookieManager.set(url.origin, cookie, true)
      .then(_ => {
        showToast("cookie correctly set", "success");
      })
      .catch(_ => showToast("Unable to set Cookie"));
  };

  const clearCookies = () => {
    CookieManager.clearAll(true)
      .then(() => showToast("Cookies cleared", "success"))
      .catch(_ => showToast("Unable to remove Cookies"));
  };

  const handleUriInput = (text: string) => {
    setNavigationUri(text.toLowerCase());
  };

  return (
    <BaseScreenComponent goBack={true}>
      <SafeAreaView style={styles.flex}>
        <Content contentContainerStyle={styles.flex}>
          <View style={styles.row}>
            <TextInput
              style={styles.textInput}
              onChangeText={handleUriInput}
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
            <ButtonDefaultOpacity
              style={styles.contentCenter}
              onPress={() => setReloadKey(r => r + 1)}
            >
              <Label color={"white"}>Reload</Label>
            </ButtonDefaultOpacity>
            <ButtonDefaultOpacity
              style={styles.contentCenter}
              onPress={clearCookies}
            >
              <Label color={"white"}>Clear cookies</Label>
            </ButtonDefaultOpacity>
          </View>
          <View spacer={true} />
          <View style={styles.row}>
            <Label color={"bluegrey"}>{"Show debug"}</Label>
            <Switch value={showDebug} onValueChange={setShowDebug} />
          </View>
          <View spacer={true} />
          <View style={styles.row}>
            <Label color={"bluegrey"}>{"Save a cookie"}</Label>
            <Switch value={saveCookie} onValueChange={setSaveCookie} />
          </View>
          <View spacer={true} />
          <View style={{ flex: 1 }}>
            {saveCookie && (
              <>
                <LabelledItem
                  type={"text"}
                  label={"Cookie name"}
                  inputProps={{
                    value: cookieName,
                    returnKeyType: "done",
                    onChangeText: setCookieName
                  }}
                />
                <LabelledItem
                  type={"text"}
                  label={"Cookie value"}
                  inputProps={{
                    value: cookieValue,
                    returnKeyType: "done",
                    onChangeText: setCookieValue
                  }}
                />
                <View spacer={true} small={true} />
                <ButtonDefaultOpacity
                  style={styles.contentCenter}
                  onPress={() => setCookieOnDomain()}
                >
                  <Label color={"white"}>Save</Label>
                </ButtonDefaultOpacity>
              </>
            )}
            {showDebug && <Monospace>{webMessage}</Monospace>}
            <RegionServiceWebView
              key={`${reloadKey}_webview`}
              uri={loadUri}
              onWebviewClose={props.goBack}
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
