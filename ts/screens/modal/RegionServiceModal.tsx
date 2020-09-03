import CookieManager, { Cookie } from "@react-native-community/cookies";
import { View } from 'native-base';
import * as React from "react";
import { Alert, Modal, TextInput } from "react-native";
import { heightPercentageToDP } from 'react-native-responsive-screen';
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { RTron } from '../../boot/configureStoreAndPersistor';
import { Monospace } from '../../components/core/typography/Monospace';
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import ActivityIndicator from '../../components/ui/ActivityIndicator';
import customVariables from '../../theme/variables';
import { getCurrentLocale } from '../../utils/locale';
import { showToast } from '../../utils/showToast';
import { APP_EVENT_HANDLER, AVOID_ZOOM_JS, closeInjectedScript } from "../../utils/webview";

type Props = {
  onModalClose: () => void;
  modalVisible: boolean;
};

const RegionServiceModal: React.FunctionComponent<Props> = (props: Props) => {
  const [navigationURI, setNavigationUri] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const cookie: Cookie = {
      name: "test",
      value: "test",
      domain: "192.168.1.20", //the domain on which you need to add the cookie, in this case the IP on your machine
      path: "/",
      version: "1",
      expires: "2021-05-30T12:30:00.00-05:00"
    };
    /**
     * the domain on which you need to add the cookie, in this case the IP on your machine
     * this value and domain value on cookie MUST match
     * this parameter is considered only by Android.
     */
    CookieManager.set("http://192.168.1.20", cookie);

    if(navigationURI === "") {
      setNavigationUri("http://192.168.1.20:3000/test-html")
    }
  });

  const handleWebviewMessage = (event: WebViewMessageEvent) => {
    setMessage(event.nativeEvent.data);
    
    const data = JSON.parse(event.nativeEvent.data);
    const locale = getCurrentLocale();

    switch (data.type) {
      case "CLOSE_MODAL":
        props.onModalClose();
        return;
      case "START_LOAD":
        setLoading(true);
        return;
      case "END_LOAD":
        setLoading(false);
        return;
      case "SHOW_SUCCESS":
        showToast(data.payload[locale], "success");
        return;
      case "SHOW_ERROR":
        showToast(data.payload[locale], "danger");
        return;
      case "SHOW_ALERT":
        Alert.alert(data.payload[locale].title, data.payload[locale].description);
        return;
      default:
        return;
    }
  };

  return (
    <Modal visible={props.modalVisible} onRequestClose={props.onModalClose}>
      <BaseScreenComponent goBack={() => props.onModalClose()}>
        <View style={{paddingHorizontal: customVariables.contentPadding}}>
          <TextInput style={{padding: 1, borderWidth: 1, height: 30}} onChangeText={t => setNavigationUri(t)} value={navigationURI}/>
          <View style={{height: heightPercentageToDP("50%")}}>
            <WebView
              source={{ uri: navigationURI }}
              textZoom={100}
              injectedJavaScript={closeInjectedScript(AVOID_ZOOM_JS + APP_EVENT_HANDLER)}
              onMessage={handleWebviewMessage}
              sharedCookiesEnabled={true}
            />
          </View>
          {loading && <ActivityIndicator color={customVariables.brandDarkGray}/>}
          <Monospace>
            {message}
          </Monospace>
        </View>
      </BaseScreenComponent>
    </Modal>
  );
};

export default RegionServiceModal;
