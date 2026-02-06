import { act, renderHook } from "@testing-library/react-native";
import {
  AAR_SUB_CATEGORY_ID,
  useAarStartSendZendeskSupport
} from "../useAarStartSendZendeskSupport";
import {
  addTicketCustomField,
  appendLog,
  resetCustomFields,
  resetLog,
  zendeskCategoryId,
  zendeskSendCategory
} from "../../../../../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../../../../zendesk/store/actions";

const mockDispatch = jest.fn();

jest.mock("../../../../../../../utils/supportAssistance", () => ({
  ...jest.requireActual("../../../../../../../utils/supportAssistance"),
  resetCustomFields: jest.fn(),
  resetLog: jest.fn(),
  appendLog: jest.fn(),
  addTicketCustomField: jest.fn()
}));

jest.mock("../../../../../../../store/hooks", () => ({
  useIODispatch: () => mockDispatch
}));

describe("AAR_SUB_CATEGORY_ID", () => {
  it("should match the expected value", () => {
    expect(AAR_SUB_CATEGORY_ID).toBe("39752564743313");
  });
});

describe("useAarStartSendZendeskSupport", () => {
  describe.each<Parameters<typeof useAarStartSendZendeskSupport>[0]>([
    "io_problema_notifica_send_qr",
    "io_problema_notifica_send_qr_altra_persona"
  ])('Zendesk second level tag: "%s"', secondLevelTag => {
    afterEach(jest.clearAllMocks);

    it.each(["SOME_ERROR", "ANY_ERROR", "GENERIC_ERROR", undefined])(
      'should populate the zendesk custom fields and dispatch the zendesk start request when error is: "%s"',
      errorName => {
        const { result } = renderHook(useAarStartSendZendeskSupport, {
          initialProps: secondLevelTag
        });

        expect(addTicketCustomField).not.toHaveBeenCalled();
        expect(appendLog).not.toHaveBeenCalled();
        expect(resetCustomFields).not.toHaveBeenCalled();
        expect(resetLog).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();

        act(() => {
          result.current(errorName);
        });

        expect(resetCustomFields).toHaveBeenCalledTimes(1);
        expect(resetLog).toHaveBeenCalledTimes(1);
        expect(addTicketCustomField).toHaveBeenCalledTimes(2);
        expect(addTicketCustomField).toHaveBeenCalledWith(
          zendeskCategoryId,
          zendeskSendCategory.value
        );
        expect(addTicketCustomField).toHaveBeenCalledWith(
          AAR_SUB_CATEGORY_ID,
          secondLevelTag
        );

        if (errorName != null && errorName.trim().length > 0) {
          expect(appendLog).toHaveBeenCalledTimes(1);
          expect(appendLog).toHaveBeenCalledWith(errorName);
        } else {
          expect(appendLog).not.toHaveBeenCalled();
        }

        expect(mockDispatch).toHaveBeenCalledTimes(2);
        expect(mockDispatch).toHaveBeenCalledWith(
          zendeskSupportStart({
            startingRoute: "n/a",
            assistanceType: {
              send: true
            }
          })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
          zendeskSelectedCategory(zendeskSendCategory)
        );
      }
    );
  });
});
