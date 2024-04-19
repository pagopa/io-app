import React, { JSXElementConstructor } from "react";
import { ToastProvider } from "@pagopa/io-app-design-system";
import { Modal } from "react-native";

function withModalAndToastProvider<P extends object>(
  Component: JSXElementConstructor<P>
) {
  return (props: P) => (
    <Modal>
      <ToastProvider>
        <Component {...props} />
      </ToastProvider>
    </Modal>
  );
}
export default withModalAndToastProvider;
