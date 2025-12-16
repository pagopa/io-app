import { ThirdPartyMessageWithContent } from "../../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { toSENDMessage } from "../transformers";

describe("transformers", () => {
  describe("toSENDMessage", () => {
    it("should return undefined if decode fails", () => {
      const thirdPartyMessage = {
        created_at: new Date(),
        third_party_message: {
          attachments: [
            {
              id: "1"
            }
          ],
          details: {
            iun: "57fd16ba-726e-45a8-8b50-a8e2810f5b0a",
            notificationStatusHistory: [
              {
                activeFrom: new Date(),
                relatedTimelineElements: [],
                status: "ACCEPTED"
              }
            ],
            recipients: [
              {
                denomination: "The denomination",
                payment: {
                  creditorTaxId: "01234567890",
                  noticeCode: "111122223333444400"
                },
                recipientType: "PF",
                taxId: "RSSMGV80A41H501I"
              }
            ],
            subject: "The subject"
          }
        }
      } as unknown as ThirdPartyMessageWithContent;
      const sendMessage = toSENDMessage(thirdPartyMessage);
      expect(sendMessage).toBeUndefined();
    });
    it("should return undefined if 'details' field is missing'", () => {
      const thirdPartyMessage = {
        created_at: new Date(),
        third_party_message: {
          attachments: [
            {
              id: "1",
              url: "https://an.url/path"
            }
          ]
        }
      } as unknown as ThirdPartyMessageWithContent;
      const sendMessage = toSENDMessage(thirdPartyMessage);
      expect(sendMessage).toBeUndefined();
    });
    it("should return the SEND message", () => {
      const thirdPartyMessage = {
        created_at: new Date(),
        third_party_message: {
          attachments: [
            {
              id: "1",
              url: "https://an.url/path"
            }
          ],
          details: {
            iun: "57fd16ba-726e-45a8-8b50-a8e2810f5b0a",
            notificationStatusHistory: [
              {
                activeFrom: new Date(),
                relatedTimelineElements: [],
                status: "ACCEPTED"
              }
            ],
            recipients: [
              {
                denomination: "The denomination",
                payment: {
                  creditorTaxId: "01234567890",
                  noticeCode: "111122223333444400"
                },
                recipientType: "PF",
                taxId: "RSSMGV80A41H501I"
              }
            ],
            subject: "The subject"
          }
        }
      } as unknown as ThirdPartyMessageWithContent;
      const sendMessage = toSENDMessage(thirdPartyMessage);
      expect(sendMessage).toEqual({
        created_at: thirdPartyMessage.created_at,
        attachments: thirdPartyMessage.third_party_message.attachments,
        ...thirdPartyMessage.third_party_message.details
      });
    });
  });
});
