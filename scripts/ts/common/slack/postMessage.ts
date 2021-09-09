import fetch from "node-fetch";

const endpoint = "https://slack.com/api/chat.postMessage";
const slackToken = process.env.IO_APP_SLACK_HELPER_BOT_TOKEN;

export const slackPostMessage = async (
  text: string,
  channel: string
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
      text
    })
  });
  if (res.status !== 200) {
    throw new Error(`Response status ${res.status} ${res.statusText}`);
  }
  return await res.json();
};
