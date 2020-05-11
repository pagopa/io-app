#!/usr/bin/python3
import glob
import re
import requests
import ssl
import certifi
import os
from multiprocessing import Manager, Pool, cpu_count
from slack import WebClient
from slack.errors import SlackApiError
from os.path import dirname, abspath, join

HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36'
}
MAX_TIMEOUT = 5
global_uris = set()
SLACK_TOKEN = os.environ.get("SLACK_API_TOKEN", None)
tagged_people = ["<@UTVS9R0SF>"]
SLACK_CHANNEL = "#io_status"


def scan_directory(path, ext='/**/*.md'):
  """
    Scan the chosen directory, and the sub-directories and returns the execution of readFile from the found collection of files
    :param path: directory to scan
    :param ext: file extension to retrieve
    :return: a list of all file matching the given extension
  """
  path = path[:-1] if path[-1] == "/" else path
  files = glob.glob(path + ext, recursive=True)
  return readFile(files)


def readFile(files):
  """
  Reads the collection of files passed as parameter and returns the set of uris found inside all the files
  :param files: an iterable of file paths
  :return: a set contain all uri found
  """
  uris = set()
  for path in files:
    with open(path, 'r') as f:
      for line in f.readlines():
        result = re.search(r"\[(.*?)\]\((.*?)\)", line)
        if result and "ioit://" not in result.group(2):
          uris.add(result.group(2))
  return uris


def test_http_uri(uri):
  """
  Tests the uri passed as a parameter making an http get request.
  If it causes an exception or an error code it appends the url to the collection of invalid_uris
  :param uri: the uri to test
  :return: the uri if it is problematic, None otherwise
  """
  try:
    r = requests.get(uri, headers=HEADERS, timeout=MAX_TIMEOUT)
    if r.status_code != requests.codes.ok:
      invalid_uris.append(uri)
      return None
  except:
    print("failed to connect:" + uri)
    # invalid_uris.append(uri)
    return uri


def send_slack_message(invalid_uris):
  """
  Sends the report of the check to slack to notify the status of the static texts of the app
  :return:
  """
  try:
    # avoid ssl certificate warning
    ssl_context = ssl.create_default_context(cafile=certifi.where())
    rtm_client = WebClient(
      token=SLACK_TOKEN, ssl=ssl_context
    )
    if len(invalid_uris) > 0:
      invalid_uris_message = "\n".join(list(map(lambda iu: "- " + iu, invalid_uris)))
      tags = " ".join(tagged_people)
      message = "%s :warning: There are %d uris in *IO App* that are not working:\n%s" % (tags,
        len(invalid_uris), invalid_uris_message)
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


# since this code is executed multiple time for each process spawned
# we have to ensure the init part is execute only the first time
if __name__ == '__main__':
  manager = Manager()
  print("scanning locales folder...")
  all_uris = scan_directory(abspath(join(dirname(__file__), "..", "locales")))
  pool = Pool(cpu_count())
  invalid_uri_processing = []
  print("found and processing %d uris..." % len(all_uris))
  for uri in all_uris:
    invalid_uri_processing.append(pool.apply_async(test_http_uri, args=(uri,)))
  # get all processes results
  invalid_uris = list(map(lambda r: r.get(), invalid_uri_processing))
  # remove None results from list
  invalid_uris = list(filter(lambda r: r is not None, invalid_uris))
  pool.close()
  print('found %d broken uri' % len(invalid_uris))
  if len(invalid_uris) > 0:
    if SLACK_TOKEN:
      send_slack_message(invalid_uris)
    else:
      print("no SLACK token provided")
