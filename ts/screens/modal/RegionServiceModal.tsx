import CookieManager, { Cookie } from "@react-native-community/cookies";
import * as React from "react";
import { Modal } from "react-native";
import WebView from "react-native-webview";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../../utils/webview";

type Props = {
  onModalClose: () => void;
  modalVisible: boolean;
};

const RegionServiceModal: React.FunctionComponent<Props> = (props: Props) => {
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
  });
  return (
    <Modal visible={props.modalVisible} onRequestClose={props.onModalClose}>
      <BaseScreenComponent goBack={() => props.onModalClose()}>
        <WebView
          source={{ uri: "http://192.168.1.20:3000/test-html" }}
          textZoom={100}
          injectedJavaScript={closeInjectedScript(AVOID_ZOOM_JS)}
          // onMessage={(event: WebViewMessageEvent) => {
          //   RTron.log(event.nativeEvent.data);
          // }}
          sharedCookiesEnabled={true}
        />
      </BaseScreenComponent>
    </Modal>
  );
};

export default RegionServiceModal;
