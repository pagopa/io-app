import { File } from "expo-file-system";
import { testSaga } from "redux-saga-test-plan";

import { removeCachedAttachment } from "../../store/actions";
import { AttachmentsDirectoryPath } from "../../utils/attachments";
import {
  handleClearAllAttachments,
  handleClearAttachment
} from "../handleClearAttachments";

jest.mock("expo-file-system", () => ({
  File: jest.fn(),
  Paths: { cache: { uri: "file:///cache/" } }
}));

describe("handleClearAttachments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("constructs the attachments directory file from an absolute URI", () => {
    const file = { exists: true, delete: jest.fn() };
    jest.mocked(File).mockReturnValue(file as unknown as File);

    testSaga(handleClearAllAttachments)
      .next()
      .call([file, file.delete])
      .next()
      .isDone();

    expect(File).toHaveBeenCalledWith(`file://${AttachmentsDirectoryPath}`);
  });

  it("constructs an attachment file from an absolute URI", () => {
    const path = "/cache/attachments/message/attachment/document.pdf";
    const file = { exists: true, delete: jest.fn() };
    jest.mocked(File).mockReturnValue(file as unknown as File);

    testSaga(
      handleClearAttachment,
      removeCachedAttachment({ path } as Parameters<
        typeof removeCachedAttachment
      >[0])
    )
      .next()
      .call([file, file.delete])
      .next()
      .isDone();

    expect(File).toHaveBeenCalledWith(`file://${path}`);
  });
});
