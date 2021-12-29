import { fireEvent, render } from "@testing-library/react-native";
import * as React from "react";
import I18n from "../../../../../../i18n";
import { localeDateFormat } from "../../../../../../utils/locale";
import { mvlMockMetadata } from "../../../../types/__mock__/mvlMock";
import { MvlMetadata } from "../../../../types/mvlData";
import { MvlMetadataComponent } from "../MvlMetadata";

describe("MvlMetadata", () => {
  jest.useFakeTimers();
  describe("When MvlMetadataComponent is rendered for the first time", () => {
    it("Should be visible only the header", () => {
      const res = renderMvlMetadata();
      expect(
        res.queryByText(I18n.t("features.mvl.details.metadata.title"))
      ).not.toBeNull();
    });
    describe("And the header is tapped", () => {
      it("Should display the metadata information", () => {
        const res = renderMvlMetadata();
        const header = res.queryByText(
          I18n.t("features.mvl.details.metadata.title")
        );
        if (header !== null) {
          fireEvent.press(header);

          expect(
            res.queryByText(
              I18n.t("features.mvl.details.metadata.description", {
                date: localeDateFormat(
                  mvlMockMetadata.timestamp,
                  I18n.t("global.dateFormats.shortFormat")
                ),
                time: localeDateFormat(
                  mvlMockMetadata.timestamp,
                  I18n.t("global.dateFormats.timeFormatWithTimezone")
                ),
                subject: mvlMockMetadata.subject,
                sender: mvlMockMetadata.sender
              })
            )
          ).not.toBeNull();
        } else {
          fail("header not found");
        }
      });
      describe("And there are at least one cc", () => {
        it("Should display all the 7 link including the recipients link", () => {
          const res = renderMvlMetadata();
          const header = res.queryByText(
            I18n.t("features.mvl.details.metadata.title")
          );
          if (header !== null) {
            fireEvent.press(header);
            expect(res.queryAllByA11yRole("link").length).toBe(7);
            expect(
              res.queryByText(
                I18n.t("features.mvl.details.metadata.links.recipients")
              )
            ).not.toBeNull();
          } else {
            fail("header not found");
          }
        });
      });
      describe("And there aren't any cc", () => {
        it("Should display only 6 link without the recipients link", () => {
          const res = renderMvlMetadata({ ...mvlMockMetadata, cc: [] });
          const header = res.queryByText(
            I18n.t("features.mvl.details.metadata.title")
          );
          if (header !== null) {
            fireEvent.press(header);
            expect(res.queryAllByA11yRole("link").length).toBe(6);
            expect(
              res.queryByText(
                I18n.t("features.mvl.details.metadata.links.recipients")
              )
            ).toBeNull();
          } else {
            fail("header not found");
          }
        });
      });
    });
  });
});

const renderMvlMetadata = (metadata?: MvlMetadata) => {
  const metadataParams = metadata ?? mvlMockMetadata;
  return render(<MvlMetadataComponent metadata={metadataParams} />);
};
