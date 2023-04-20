import { render } from "@testing-library/react-native";
import React from "react";

import I18n from "../../../../i18n";
import { successReloadMessagesPayload } from "../../../../__mocks__/messages";
import Content from "../Content";

const message = successReloadMessagesPayload.messages[0];

describe("MessageDetailData component", () => {
  describe("when service's contact detail are not defined", () => {
    it("should match the snapshot", () => {
      const component = render(
        <Content
          message={message}
          goToServiceDetail={() => void 0}
          serviceContacts={{}}
        />
      );
      expect(component.toJSON()).toMatchSnapshot();
    });
  });

  describe("when service's contact detail are present", () => {
    it("should render the phone", () => {
      const { queryByText } = render(
        <Content
          message={message}
          goToServiceDetail={() => void 0}
          serviceContacts={{ phone: "+356123432" }}
        />
      );
      expect(queryByText(I18n.t("messageDetails.call"))).not.toBeNull();
    });

    it("should render the email", () => {
      const { queryByText } = render(
        <Content
          message={message}
          goToServiceDetail={() => void 0}
          serviceContacts={{ email: "p@g.i" }}
        />
      );
      expect(queryByText(I18n.t("messageDetails.write"))).not.toBeNull();
    });
  });
});
