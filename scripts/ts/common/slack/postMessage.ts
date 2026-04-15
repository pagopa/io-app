import { URL } from "url";
import fetch from "node-fetch";

const endpoint = "https://slack.com/api/chat.postMessage";
const slackToken = process.env.IO_APP_SLACK_HELPER_BOT_TOKEN;

/**
 * Use the Slack API to post a message in a specific channel, using the IO-App helper bot
 * @param text The message to post
 * @param channel The target channel
 * @param unfurlMessage default true, the message will unfurl the links
 */
export const slackPostMessage = async (
  text: string,
  channel: string,
  unfurlMessage: boolean = true
): Promise<unknown> => {
  const url = new URL(endpoint);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${slackToken}`,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      channel,
      text,
      unfurl_links: unfurlMessage,
      unfurl_media: unfurlMessage
    })
  });

  if (res.status !== 200) {
    throw new Error(`Response status ${res.status} ${res.statusText}`);
  }
  const jsonResponse = await res.json();
  if (jsonResponse.ok === false) {
    throw new Error(
      `An error occurred with the Slack API: ${jsonResponse.error}`
    );
  }

  return jsonResponse;
};
