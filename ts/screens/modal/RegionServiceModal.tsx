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
      name: "test cookie",
      value: "test",
      domain: "localhost",
      path: "/",
      version: "1",
      expires: "2021-05-30T12:30:00.00-05:00"
    };
    CookieManager.set("http://localhost:3000", cookie);
  });
  return (
    <Modal visible={props.modalVisible} onRequestClose={props.onModalClose}>
      <BaseScreenComponent goBack={() => props.onModalClose()}>
        <WebView
          source={{ uri: "http://localhost:3000/test-html" }}
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
