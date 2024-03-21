import os
import ssl
from os.path import join

import certifi
import urllib3
from slack import WebClient
from slack.errors import SlackApiError

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

SLACK_TOKEN = os.environ.get("IO_APP_SLACK_HELPER_BOT_TOKEN", None)
TEST_FILE = os.environ.get("TEST", None)
tagged_people = ["<!here>"]
SLACK_CHANNEL = "#io_dev_app_feed"
BUILD_ID = os.environ.get("BUILD_ID", None)
BASE_ACTION_URI = "https://github.com/pagopa/io-app/actions/runs/"

def send_slack_message():
    """
    Sends the report of the check to slack to notify the status of the E2E tests of the app
    :return:
    """
    try:
        # avoid ssl certificate warning
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        rtm_client = WebClient(
            token=SLACK_TOKEN, ssl=ssl_context
        )
        tags = " ".join(tagged_people)
        message = "[E2E Tests] :warning: %s e2e test %s have failed (<%s%s|here>)" % (
            tags, TEST_FILE, BASE_ACTION_URI, BUILD_ID)
        message_blocks = []
        message_blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": message
            }
        })
        rtm_client.chat_postMessage(
            channel=SLACK_CHANNEL,
            blocks=message_blocks
        )
            

    except SlackApiError as e:
        # You will get a SlackApiError if "ok" is False
        assert e.response["ok"] is False
        # str like 'invalid_auth', 'channel_not_found'
        assert e.response["error"]
        print(f"Got an error: {e.response['error']}")

if SLACK_TOKEN:
    send_slack_message()
else:
    print("no SLACK token provided")