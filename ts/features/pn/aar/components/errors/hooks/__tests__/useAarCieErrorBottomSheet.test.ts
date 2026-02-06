import { act, render, renderHook } from "@testing-library/react-native";
import { useAarCieErrorBottomSheet } from "../useAarCieErrorBottomSheet";
import { useAarStartSendZendeskSupport } from "../useAarStartSendZendeskSupport";
import * as SendAarErrorModule from "../../SendAARErrorComponent";

type SendAarZendeskSecondLevelTag = Parameters<
  typeof useAarCieErrorBottomSheet
>[0]["zendeskSecondLevelTag"];

const errorNames = ["ANY_ERROR", "GENERIC_ERROR", "SOME_ERROR", undefined];

const mockPresent = jest.fn();
const mockDismiss = jest.fn();
const mockOnStartAssistance = jest.fn();
const mockOnCopyToClipboard = jest.fn();
const mockStartZendeskSupport = jest.fn();

jest.mock("../useAarStartSendZendeskSupport", () => ({
  useAarStartSendZendeskSupport: jest.fn(() => mockStartZendeskSupport)
}));

jest.mock("../../../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: jest.fn(({ component }) => ({
    bottomSheet: component,
    present: mockPresent,
    dismiss: mockDismiss
  }))
}));

jest.mock("i18next", () => ({
  t: (s: string) => s
}));

describe("useAarCieErrorBottomSheet", () => {
  describe.each<SendAarZendeskSecondLevelTag>([
    "io_problema_notifica_send_qr",
    "io_problema_notifica_send_qr_altra_persona"
  ])('ZendeskSecondLevelTag: "%s"', secondLevelTag => {
    afterEach(jest.clearAllMocks);

    it.each(errorNames)(
      'should match the snapshot for error: "%s"',
      async errorName => {
        const { result } = renderHook(useAarCieErrorBottomSheet, {
          initialProps: {
            zendeskSecondLevelTag: secondLevelTag,
            errorName
          }
        });
        const component = render(result.current.bottomSheet);

        expect(component.toJSON()).toMatchSnapshot();
      }
    );

    it('should call "useAarStartSendZendeskSupport" with the right zendeskSecondLevelTag value', () => {
      renderHook(useAarCieErrorBottomSheet, {
        initialProps: {
          zendeskSecondLevelTag: secondLevelTag,
          errorName: undefined
        }
      });

      expect(useAarStartSendZendeskSupport).toHaveBeenCalledTimes(1);
      expect(useAarStartSendZendeskSupport).toHaveBeenCalledWith(
        secondLevelTag
      );
    });

    it('should call the bottom-sheet "present" function once when the returned "present" is pressed', () => {
      const { result } = renderHook(useAarCieErrorBottomSheet, {
        initialProps: {
          zendeskSecondLevelTag: secondLevelTag,
          errorName: undefined
        }
      });

      expect(mockPresent).not.toHaveBeenCalled();
      expect(mockDismiss).not.toHaveBeenCalled();

      act(() => {
        result.current.present();
      });

      expect(mockPresent).toHaveBeenCalledTimes(1);
      expect(mockDismiss).not.toHaveBeenCalled();
    });

    describe.each(errorNames)(
      'sendAarErrorSupportBottomSheetComponent for errorName: "%s"',
      errorName => {
        const spyOnSendAarErrorSupportBottomSheetComponent = jest.spyOn(
          SendAarErrorModule,
          "sendAarErrorSupportBottomSheetComponent"
        );

        it('should call "sendAarErrorSupportBottomSheetComponent" with the correct parameters', () => {
          renderHook(useAarCieErrorBottomSheet, {
            initialProps: {
              zendeskSecondLevelTag: secondLevelTag,
              errorName
            }
          });

          expect(
            spyOnSendAarErrorSupportBottomSheetComponent
          ).toHaveBeenCalledTimes(1);
          expect(
            spyOnSendAarErrorSupportBottomSheetComponent
          ).toHaveBeenCalledWith(
            expect.any(Function),
            errorName,
            expect.any(Function)
          );
        });

        it('should call "onStartAssistance" and "onCopyToClipboard" when they are defined', () => {
          renderHook(useAarCieErrorBottomSheet, {
            initialProps: {
              zendeskSecondLevelTag: secondLevelTag,
              errorName,
              onCopyToClipboard: mockOnCopyToClipboard,
              onStartAssistance: mockOnStartAssistance
            }
          });

          expect(
            spyOnSendAarErrorSupportBottomSheetComponent
          ).toHaveBeenCalledTimes(1);
          expect(mockOnCopyToClipboard).not.toHaveBeenCalled();
          expect(mockOnStartAssistance).not.toHaveBeenCalled();
          expect(mockStartZendeskSupport).not.toHaveBeenCalled();
          expect(mockDismiss).not.toHaveBeenCalled();

          const onStartAssistance =
            spyOnSendAarErrorSupportBottomSheetComponent.mock.calls[0][0];
          const onCopyToClipboard =
            spyOnSendAarErrorSupportBottomSheetComponent.mock.calls[0][2]!;

          act(() => {
            onStartAssistance();
          });

          expect(mockOnStartAssistance).toHaveBeenCalledTimes(1);
          expect(mockOnStartAssistance).toHaveBeenCalledWith(errorName ?? "");
          expect(mockDismiss).toHaveBeenCalledTimes(1);
          expect(mockStartZendeskSupport).toHaveBeenCalledTimes(1);
          expect(mockStartZendeskSupport).toHaveBeenCalledWith(errorName);
          expect(mockOnCopyToClipboard).not.toHaveBeenCalled();

          // clear mock
          mockOnStartAssistance.mockClear();
          mockStartZendeskSupport.mockClear();
          mockDismiss.mockClear();

          act(() => {
            onCopyToClipboard();
          });

          expect(mockOnCopyToClipboard).toHaveBeenCalledTimes(1);
          expect(mockOnCopyToClipboard).toHaveBeenCalledWith(errorName ?? "");
          expect(mockOnStartAssistance).not.toHaveBeenCalled();
          expect(mockStartZendeskSupport).not.toHaveBeenCalled();
          expect(mockDismiss).not.toHaveBeenCalled();
        });

        it('should not call "onStartAssistance" and "onCopyToClipboard" when they are not defined', () => {
          renderHook(useAarCieErrorBottomSheet, {
            initialProps: {
              zendeskSecondLevelTag: secondLevelTag,
              errorName
            }
          });

          expect(
            spyOnSendAarErrorSupportBottomSheetComponent
          ).toHaveBeenCalledTimes(1);
          expect(mockOnCopyToClipboard).not.toHaveBeenCalled();
          expect(mockOnStartAssistance).not.toHaveBeenCalled();
          expect(mockStartZendeskSupport).not.toHaveBeenCalled();
          expect(mockDismiss).not.toHaveBeenCalled();

          const onStartAssistance =
            spyOnSendAarErrorSupportBottomSheetComponent.mock.calls[0][0];
          const onCopyToClipboard =
            spyOnSendAarErrorSupportBottomSheetComponent.mock.calls[0][2]!;

          act(() => {
            onStartAssistance();
          });

          expect(mockStartZendeskSupport).toHaveBeenCalledTimes(1);
          expect(mockStartZendeskSupport).toHaveBeenCalledWith(errorName);
          expect(mockDismiss).toHaveBeenCalledTimes(1);
          expect(mockOnCopyToClipboard).not.toHaveBeenCalled();
          expect(mockOnStartAssistance).not.toHaveBeenCalled();

          // clear mock
          mockStartZendeskSupport.mockClear();
          mockDismiss.mockClear();

          act(() => {
            onCopyToClipboard();
          });

          expect(mockOnCopyToClipboard).not.toHaveBeenCalled();
          expect(mockDismiss).not.toHaveBeenCalled();
          expect(mockOnStartAssistance).not.toHaveBeenCalled();
          expect(mockStartZendeskSupport).not.toHaveBeenCalled();
        });
      }
    );
  });
});
