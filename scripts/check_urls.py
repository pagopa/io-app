#!/usr/bin/python3

import os

def scanDirectory(path):
    entries = os.listdir(path)
    for entry in entries:
        if os.path.isfile(os.path.join(path, entry)) and ".md" in entry:
            readFile(os.path.join(path, entry))
        if (os.path.isdir(os.path.join(path, entry))):
            scanDirectory(os.path.join(path, entry))

import re
import requests
import multiprocessing as mp

manager = mp.Manager()
invalid_uris = manager.list()
uris = []


def readFile(path):
    with open(path, 'r') as f:
        for line in f.readlines():
            result = re.search(r"\[(.*?)\]\((.*?)\)", line)
            if(result and not "ioit://" in result.group(2)):
                uris.append(result.group(2))

def testhttpuri(uri):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36'
        }
        r = requests.get(uri, headers=headers, timeout = 5)
        if r.status_code != requests.codes.ok:
            print(uri,r.status_code)
            invalid_uris.append(uri)
    except:
        print("failed to connect")
        invalid_uris.append(uri)
        
scanDirectory("./locales")

pool = mp.Pool(mp.cpu_count())
pool.map(testhttpuri, [uri for uri in uris])
pool.close()

print(invalid_uris)
# import ssl
# import certifi
# from slack import WebClient
# from slack.errors import SlackApiError

# slack_token = os.environ["SLACK_API_TOKEN"]
# client = WebClient(token=slack_token)

# def send_slack_message():
#     try:
#         # avoid ssl certificate warning
#         ssl_context = ssl.create_default_context(cafile=certifi.where())
#         slack_token = slack_token
#         rtm_client = WebClient(
#             token=slack_token, ssl=ssl_context
#         )
#         if(len(invalid_uris) > 0):
#             for url in invalid_uris:
#                 invalid_uris_message = invalid_uris_message + "- " + url + "\n"
#             rtm_client.chat_postMessage(
#                 channel="C012Q68D1U4",
#                 text= {
#                     "type": "mrkdwn",
#                     "text": ":warning: There are " + len(invalid_uris) + " uris that are not working properly please check them: \n" +
#                         invalid_uris
#                 }
#             )
#         else:
#             rtm_client.chat_postMessage(
#                 channel="C012Q68D1U4",
#                 text= {
#                     "type": "mrkdwn",
#                     "text": ":white_check_mark: There are no incorrect urls"
#                 }
#             )
#     except SlackApiError as e:
#         # You will get a SlackApiError if "ok" is False
#         assert e.response["ok"] is False
#         # str like 'invalid_auth', 'channel_not_found'
#         assert e.response["error"]
#         print(f"Got an error: {e.response['error']}")

# send_slack_message()