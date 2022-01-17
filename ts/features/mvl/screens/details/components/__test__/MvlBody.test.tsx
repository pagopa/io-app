import {
  act,
  fireEvent,
  render,
  RenderAPI
} from "@testing-library/react-native";
import React from "react";
import I18n from "../../../../../../i18n";
import { mvlMockBody } from "../../../../types/__mock__/mvlMock";
import { MvlBody } from "../MvlBody";

describe("MvlBody", () => {
  jest.useFakeTimers();

  describe("When the HTML is an empty string", () => {
    it("Should render neither the `html` option nor the switch separator", async () => {
      const { queryByText } = renderComponent({
        body: { ...mvlMockBody, html: "" }
      });
      expect(queryByText(I18n.t("features.mvl.details.body.html"))).toBeNull();
      expect(queryByText(" | ")).toBeNull();
    });
  });

  describe("When the component is rendered with a valid payload", () => {
    it("Should start with the plain text and render the selector", () => {
      const res = renderComponent({ body: mvlMockBody });
      checkPlainTextView(res);
    });

    describe("And the user taps on 'html'", () => {
      it("Should render the html and change the selector", async () => {
        const res = renderComponent({ body: mvlMockBody });
        const html = res.queryByText(I18n.t("features.mvl.details.body.html"));
        if (html !== null) {
          await act(async () => fireEvent(html, "onPress"));
          htmlStateSelector(res);
          expect(res.queryByTestId("h1")).not.toBeNull();
        } else {
          fail("html should be defined");
        }
      });
      describe("And the user taps on 'plain text'", () => {
        it("Should render again the plain text and change the selector", async () => {
          const res = renderComponent({ body: mvlMockBody });
          const html = res.queryByText(
            I18n.t("features.mvl.details.body.html")
          );
          if (html !== null) {
            await act(async () => fireEvent(html, "onPress"));

            const plain = res.queryByText(
              I18n.t("features.mvl.details.body.plain")
            );

            if (plain !== null) {
              await act(async () => fireEvent(plain, "onPress"));

              checkPlainTextView(res);
            } else {
              fail("plain should be defined");
            }
          } else {
            fail("html should be defined");
          }
        });
      });
    });
  });
  describe("When the component is rendered with an empty payload", () => {
    it("Should render only the selector without a plain body", () => {
      const res = renderComponent({ body: { plain: "", html: "" } });
      expect(
        res.queryByText(I18n.t("features.mvl.details.body.plain"))
      ).not.toBeNull();
    });
  });
});

const plainStateSelector = (component: RenderAPI) => {
  const html = component.queryByText(I18n.t("features.mvl.details.body.html"));
  const plain = component.queryByText(
    I18n.t("features.mvl.details.body.plain")
  );
  expect(html).not.toBeNull();
  expect(html?.props.accessibilityRole).toBe("link");
  expect(plain).not.toBeNull();
};

const htmlStateSelector = (component: RenderAPI) => {
  const plain = component.queryByText(
    I18n.t("features.mvl.details.body.plain")
  );

  expect(plain).not.toBeNull();
  expect(plain?.props.accessibilityRole).toBe("link");
  const plainHtml = component.queryByText(
    I18n.t("features.mvl.details.body.html")
  );
  expect(plainHtml?.props.accessibilityRole).not.toBe("link");
};

const checkPlainTextView = (component: RenderAPI) => {
  plainStateSelector(component);
  expect(component.queryByText(mvlMockBody.plain)).not.toBeNull();
};

const renderComponent = (props: React.ComponentProps<typeof MvlBody>) =>
  render(<MvlBody {...props} />);
