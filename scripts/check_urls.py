#!/usr/bin/python3

import os
import glob
import re
import requests
import multiprocessing as mp
import ssl
import certifi
from slack import WebClient
from slack.errors import SlackApiError

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36'
}
MAX_TIMEOUT = 5
manager = mp.Manager()
invalid_uris = manager.list()
global_uris = set()
SLACK_TOKEN = os.environ["SLACK_API_TOKEN"]
SLACK_CHANNEL = "C012Q68D1U4"


"""
Scan the chosen directory, and the sub-directories and returns the execution of readFile from the found collection of files
"""


def scanDirectory(path):
    files = glob.glob(path + '/**/*.md', recursive=True)
    return readFile(files)


"""
Reads the collection of files passed as parameter and returns the set of uris found inside all the files
"""


def readFile(files):
    uris = set()
    for path in files:
        with open(path, 'r') as f:
            for line in f.readlines():
                result = re.search(r"\[(.*?)\]\((.*?)\)", line)
                if(result and not "ioit://" in result.group(2)):
                    uris.add(result.group(2))
    return uris


"""
Tests the uri passed as a parameter making an http get request.
If it causes an exeption or an error code it appends the url to the collection of invalid_uris
"""


def testhttpuri(uri):
    try:
        r = requests.get(uri, headers=HEADERS, timeout=MAX_TIMEOUT)
        if r.status_code != requests.codes.ok:
            print(uri, r.status_code)
            invalid_uris.append(uri)
    except:
        print("failed to connect")
        invalid_uris.append(uri)


"""
Sends the report of the check to slack to notify the status of the static texts of the app
"""


def send_slack_message():
    try:
        # avoid ssl certificate warning
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        rtm_client = WebClient(
            token=SLACK_TOKEN, ssl=ssl_context
        )
        if len(invalid_uris) > 0:
            for url in invalid_uris:
                invalid_uris_message = invalid_uris_message + "- " + url + "\n"
            message = ":warning: There are %d uris that are not working properly please check them: \n%s" % (
                len(invalid_uris), "\n".join(invalid_uris_message))
            rtm_client.chat_postMessage(
                channel=SLACK_CHANNEL,
                text={
                    "type": "mrkdwn",
                    "text": message
                }
            )
        else:
            rtm_client.chat_postMessage(
                channel=SLACK_CHANNEL,
                text={
                    "type": "mrkdwn",
                    "text": ":white_check_mark: There are no incorrect urls"
                }
            )
    except SlackApiError as e:
        # You will get a SlackApiError if "ok" is False
        assert e.response["ok"] is False
        # str like 'invalid_auth', 'channel_not_found'
        assert e.response["error"]
        print(f"Got an error: {e.response['error']}")


global_uris = scanDirectory("./locales")

pool = mp.Pool(mp.cpu_count())
pool.map(testhttpuri, [uri for uri in global_uris])
pool.close()

send_slack_message()
