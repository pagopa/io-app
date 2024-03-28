import {
  ButtonOutline,
  ButtonSolid,
  Divider,
  HSpacer,
  IOColors,
  IOStyles,
  IOToast,
  IOVisualCostants,
  IconButtonContained,
  ListItemSwitch,
  VSpacer
} from "@pagopa/io-app-design-system";
import CookieManager, { Cookie } from "@react-native-cookies/cookies";
import * as React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from "react-native";
import { connect } from "react-redux";
import URLParse from "url-parse";
import { LabelledItem } from "../../components/LabelledItem";
import RegionServiceWebView from "../../components/RegionServiceWebView";
import { Monospace } from "../../components/core/typography/Monospace";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { navigateBack } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";

type Props = ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  textInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: IOColors["grey-450"],
    height: 40
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
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

  useHeaderSecondLevel({
    title: "MyPortal Web"
  });

  const setCookieOnDomain = () => {
    if (loadUri === "") {
      IOToast.info("Missing domain");
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
        IOToast.success("cookie correctly set");
      })
      .catch(_ => IOToast.error("Unable to set Cookie"));
  };

  const clearCookies = () => {
    CookieManager.clearAll(true)
      .then(() => IOToast.success("Cookies cleared"))
      .catch(_ => IOToast.error("Unable to remove Cookies"));
  };

  const handleUriInput = (text: string) => {
    setNavigationUri(text.toLowerCase());
  };

  return (
    <SafeAreaView style={styles.flex}>
      <ScrollView
        contentContainerStyle={[
          { paddingHorizontal: IOVisualCostants.appMarginDefault },
          IOStyles.flex
        ]}
      >
        <View style={styles.row}>
          <TextInput
            accessibilityLabel="URL address"
            style={styles.textInput}
            onChangeText={handleUriInput}
            value={navigationURI}
          />
          <HSpacer size={16} />
          <IconButtonContained
            onPress={() => setLoadUri(navigationURI)}
            icon="arrowRight"
            accessibilityLabel={"Imposta la pagina web"}
          />
        </View>
        <VSpacer size={8} />
        <View style={styles.row}>
          <ButtonSolid
            onPress={() => setReloadKey(r => r + 1)}
            icon="reload"
            label="Reload"
            accessibilityLabel={"Reload"}
          />
          <ButtonOutline
            onPress={clearCookies}
            label="Clear cookies"
            accessibilityLabel="Clear cookies"
          />
        </View>
        <VSpacer size={8} />

        <ListItemSwitch
          label="Show debug"
          value={showDebug}
          onSwitchValueChange={setShowDebug}
        />
        <Divider />
        <ListItemSwitch
          label="Save a cookie"
          value={saveCookie}
          onSwitchValueChange={setSaveCookie}
        />
        <View style={{ flex: 1 }}>
          {saveCookie && (
            <>
              <LabelledItem
                label={"Cookie name"}
                inputProps={{
                  value: cookieName,
                  returnKeyType: "done",
                  onChangeText: setCookieName
                }}
              />
              <LabelledItem
                label={"Cookie value"}
                inputProps={{
                  value: cookieValue,
                  returnKeyType: "done",
                  onChangeText: setCookieValue
                }}
              />
              <VSpacer size={8} />
              <ButtonSolid
                onPress={() => setCookieOnDomain()}
                label="Save"
                accessibilityLabel={"Save"}
              />
              <VSpacer size={8} />
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
      </ScrollView>
    </SafeAreaView>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  goBack: () => navigateBack()
});

export default connect(undefined, mapDispatchToProps)(WebPlayground);
