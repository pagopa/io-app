import React from "react";
import URLParse from "url-parse";
import { createStore } from "redux";
import {
  PayWebViewModal,
  testableGetFinishAndOutcome
} from "../PayWebViewModal";
import { applicationChangeState } from "../../../store/actions/application";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import { appReducer } from "../../../store/reducers";
import ROUTES from "../../../navigation/routes";
import I18n from "../../../i18n";

const loadingCases: ReadonlyArray<
  [
    url: string,
    finishPathName: string,
    outcomeQueryparamName: string,
    expectedResult: [isFinish: boolean, outcomeCode: string | undefined]
  ]
> = [
  ["http://mydomain.com/path", "/finish/path", "empty", [false, undefined]],
  [
    "http://mydomain.com/finish/path",
    "/finish/path",
    "empty",
    [true, undefined]
  ],
  [
    "http://mydomain.com/finish/path?empt=1234",
    "/finish/path2",
    "empty",
    [false, undefined]
  ],
  [
    "http://mydomain.com/finish/path?mycode=12345",
    "/finish/path",
    "empty",
    [true, undefined]
  ],
  [
    "http://mydomain.com/finish/path?mycode=12345",
    "/finish/path",
    "mycode",
    [true, "12345"]
  ],
  [
    "http://mydomain.com/fiNIsh/Path?MyCode=12345",
    "/finish/path",
    "mycode",
    [true, "12345"]
  ]
];

describe("getFinishAndOutcome", () => {
  test.each(loadingCases)(
    "given %p as url, %p as finishPathName, %p as outcomeQueryparamName, returns %p",
    (url, finishPathName, outcomeQueryparamName, expectedResult) => {
      const result = testableGetFinishAndOutcome!(
        new URLParse(url, true),
        finishPathName,
        outcomeQueryparamName
      );
      expect(result).toEqual(expectedResult);
    }
  );
});

describe("PayWebViewModal component", () => {
  jest.useFakeTimers();

  it("should render the screen's header", () => {
    const component = renderComponent();
    expect(
      component.getByText(I18n.t("wallet.challenge3ds.header"))
    ).toBeDefined();
  });

  it("should render the info message", () => {
    const component = renderComponent();
    expect(
      component.getByText(I18n.t("wallet.challenge3ds.description"))
    ).toBeDefined();
  });

  it("should render the info icon", () => {
    const component = renderComponent();
    expect(
      component
        .getByTestId("PayWebViewModal-description")
        .find(node => node.props.iconName === "info")
    ).toBeDefined();
  });
});

function renderComponent() {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenFakeNavRedux<GlobalState>(
    () => (
      <PayWebViewModal
        postUri={"where.to.post"}
        formData={{}}
        finishPathName={"end"}
        outcomeQueryparamName={"a query"}
        onFinish={_ => undefined}
        onGoBack={() => undefined}
        modalHeaderTitle={I18n.t("wallet.challenge3ds.header")}
      />
    ),
    ROUTES.WALLET_CHECKOUT_3DS_SCREEN,
    {},
    createStore(appReducer, globalState as any)
  );
}
