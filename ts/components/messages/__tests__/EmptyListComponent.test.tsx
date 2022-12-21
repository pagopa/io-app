import { render } from "@testing-library/react-native";
import React from "react";

import I18n from "../../../i18n";
import { EmptyListComponent } from "../EmptyListComponent";

describe("EmptyListComponent", () => {
  it("matches the snapshot", () => {
    expect(
      render(
        <EmptyListComponent
          image={require("../../../../img/messages/empty-message-list-icon.png")}
          title={I18n.t("messages.inbox.emptyMessage.title")}
          subtitle={I18n.t("messages.inbox.emptyMessage.subtitle")}
        />
      ).toJSON()
    ).toMatchSnapshot();
  });
});
