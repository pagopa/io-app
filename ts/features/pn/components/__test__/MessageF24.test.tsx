import React from "react";
import { createStore } from "redux";
import { act, fireEvent, within } from "@testing-library/react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { UIAttachment } from "../../../messages/types";
import { MessageF24 } from "../MessageF24";
import I18n from "../../../../i18n";
import {
  mockOtherAttachment,
  mockPdfAttachment
} from "../../../messages/__mocks__/attachment";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { Download } from "../../../messages/store/reducers/downloads";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";

const mockOpenPreview = jest.fn();

jest.mock("../../../messages/hooks/useAttachmentDownload", () => ({
  useAttachmentDownload: (
    _attachment: UIAttachment,
    _openPreview: (attachment: UIAttachment) => void
  ) => ({
    onAttachmentSelect: mockOpenPreview,
    downloadPot: { kind: "PotNone" } as pot.Pot<Download, Error>
  })
}));

const mockPresentBottomSheet = jest.fn();

jest.mock("../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetAutoresizableModal: () => ({
    present: mockPresentBottomSheet
  })
}));

describe("MessageF24 component", () => {
  beforeEach(() => {
    mockOpenPreview.mockReset();
    mockPresentBottomSheet.mockReset();
  });

  describe("when there is only one F24", () => {
    it("should match the snapshot", () => {
      const component = renderComponent([mockPdfAttachment], mockOpenPreview);
      expect(component.toJSON()).toMatchSnapshot();
    });

    it("should render only one attachment", () => {
      const { getByTestId } = renderComponent(
        [mockPdfAttachment],
        mockOpenPreview
      );
      const f24Container = getByTestId("f24-list-container");
      const attachments =
        within(f24Container).queryAllByTestId("message-attachment");
      expect(attachments.length).toBe(1);
    });

    it("should call openPreview function when the attachment is pressed", async () => {
      const { getByTestId } = renderComponent(
        [mockPdfAttachment],
        mockOpenPreview
      );
      const f24Container = getByTestId("f24-list-container");
      const attachments =
        within(f24Container).queryAllByTestId("message-attachment");
      expect(attachments.length).toBe(1);

      await act(() => {
        fireEvent.press(attachments[0]);
      });
      expect(mockOpenPreview).toBeCalledTimes(1);
    });
  });

  describe("when there are multiple F24", () => {
    it("should match the snapshot", () => {
      const component = renderComponent(
        [mockPdfAttachment, mockOtherAttachment],
        mockOpenPreview
      );
      expect(component.toJSON()).toMatchSnapshot();
    });

    it("should render the 'Show all' button", () => {
      const component = renderComponent(
        [mockPdfAttachment, mockOtherAttachment],
        mockOpenPreview
      );
      expect(
        component.queryByText(I18n.t("features.pn.details.f24Section.showAll"))
      ).toBeTruthy();
    });

    it("should call present function when the 'Show all' button is pressed", async () => {
      const component = renderComponent(
        [mockPdfAttachment, mockOtherAttachment],
        mockOpenPreview
      );
      const showAllButton = component.getByText(
        I18n.t("features.pn.details.f24Section.showAll")
      );
      await act(() => {
        fireEvent.press(showAllButton);
      });
      expect(mockPresentBottomSheet).toBeCalledTimes(1);
    });
  });
});

const renderComponent = (
  attachments: ReadonlyArray<UIAttachment>,
  openPreview: (attachment: UIAttachment) => void
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext(
    () => <MessageF24 attachments={attachments} openPreview={openPreview} />,
    "DUMMY",
    {},
    store
  );
};
