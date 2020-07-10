import os
import re
import ssl
from multiprocessing import Manager, Pool, cpu_count
from os.path import dirname, abspath, join
from pathlib import Path
from sys import argv

import certifi
import requests
from slack import WebClient
from slack.errors import SlackApiError

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36'
}
MAX_TIMEOUT = 7
global_uris = set()
SLACK_TOKEN = os.environ.get("IO_APP_SLACK_TOKEN_CHECK_URLS", None)
tagged_people = ["<@UTVS9R0SF>"]
SLACK_CHANNEL = "#io_status"


def scan_directory(path, exts=['*.ts']):
    """
      Scan the chosen directory, and the sub-directories and returns the execution of readFile from the found collection of files
      :param path: directory to scan
      :param ext: file extension to retrieve
      :return: a list of all file matching the given extension
    """
    path = path[:-1] if path[-1] == "/" else path
    files = []
    for ext in exts:
        files.extend(list(Path(path).rglob(ext)))
    return readFile(files)


def extract_uris(text):
    # Anything that isn't a square closing bracket
    name_regex = "[^]]+"
    # http:// or https:// followed by anything but a closing paren
    url_regex = "http[s]?://[^)]+"
    markup_regex = '\[({0})]\(\s*({1})\s*\)'.format(name_regex, url_regex)
    md_uris = re.findall(markup_regex, text)
    # find all url not included in markdown syntax
    uris = re.findall("http[s]?://[^)]+?(?=[\\*|\s*|\\n*\\t*\\n*])", text)
    result_md = set(map(lambda r: r[1],md_uris))
    result_uri = set(map(lambda r: r.replace("\\n","").replace('",''',""),uris))
    # merging sets
    result = result_md.union(result_uri)
    return list(filter(lambda r: not r.lower().startswith("ioit://"), result))


def readFile(files):
    """
    Reads the collection of files passed as parameter and returns the set of uris found inside all the files
    :param files: an iterable of file paths
    :return: a set contain all uri found
    """
    uri_set = set()
    for path in files:
        with open(path, 'r') as f:
            content = f.read()
            uris = extract_uris(content)
            uri_set = uri_set.union(uris)
    return uri_set


def test_protocol(uri):
    """
    check if the protocol is http (it could cause a crash inside the app cause http is not allow)
    :param uri:
    :return:
    """
    if re.search(r'^http:', uri, re.IGNORECASE) is not None:
      return "%s has not https protocol" % (uri)
    return None

def test_availability(uri):
    """
        Tests the uri passed as argument making an http get request.
        If it causes an exception or an error code the uri will be returned
        :param uri: the uri to test
        :return: the uri if it is problematic, None otherwise
        """
    try:
        r = requests.get(uri, headers=HEADERS, timeout=MAX_TIMEOUT)
        if r.ok:
            return None
        return "%s status code %d" % (uri, r.status_code)
    except Exception as e:
        return "%s -> %s" % (uri,str(e))



def test_http_uri(uri):
    # a list of test to apply
    tests = [test_availability,test_protocol]
    for t in tests:
        res = t(uri)
        if res is not None:
            return res


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
            invalid_uris_message = "\n".join(
                list(map(lambda iu: "- " + iu, invalid_uris)))
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


run_test = len(argv) > 1 and argv[1] == "run_tests"
# since this code is executed multiple time for each process spawned
# we have to ensure the init part is execute only the first time
if not run_test and __name__ == '__main__':
    manager = Manager()
    print("scanning locales folder...")
    all_uris = scan_directory(
        abspath(join(dirname(__file__), "../..", "locales")))
    pool = Pool(cpu_count())
    invalid_uri_processing = []
    print("found and processing %d uris..." % len(all_uris))
    for uri in all_uris:
        invalid_uri_processing.append(
            pool.apply_async(test_http_uri, args=(uri,)))
    # get all processes results
    invalid_uris = list(map(lambda r: r.get(), invalid_uri_processing))
    # remove None results from list
    invalid_uris = list(filter(lambda r: r is not None, invalid_uris))
    pool.close()
    print('found %d broken uris' % len(invalid_uris))
    if len(invalid_uris):
        print("\n".join(list(map(lambda iu: "- " + iu, invalid_uris))))
    if len(invalid_uris) > 0:
        if SLACK_TOKEN:
            send_slack_message(invalid_uris)
        else:
            print("no SLACK token provided")

if run_test:
    print("running tests...")
    a_text_with_urls = '''[a](http://foo.com)
    [a](http://goo.gl)
    [a](https://foo.com)
    [a](https://www.foo.com)
    [a](https://www.foo.com/)
    [a](https://www.foo.com/bar)
    [a](http://goo.gl/1 http://goo.gl/2
    foo [a](http://goo.gl/1) [a](http://goo.gl/(2))
    [a](http://foo.com/.) [a](http://foo.com/)! [a](http://foo.com/),
    This url does not have a protocol: goo.gl/1
    [a](http://firstround.com/review/thoughts-on-gender-and-radical-candor/?ct=t(How_Does_Your_Leadership_Team_Rate_12_3_2015))
    [a](https://google.com)

    https:google.com

    www.cool.com.au

    [a](http://www.cool.com.au)

    [a](http://www.cool.com.au/ersdfs)

    [a](http://www.cool.com.au/ersdfs?dfd=dfgd@s=1)

    [a](http://www.cool.com:81/index.html)'''

    test1 = extract_uris("[hello world](http://test.com)")
    assert len(test1) == 1
    assert test1 == "http://test.com"

    test2 = extract_uris(
        "[a](https://test2.com) hello world [b](http://test.com)")
    assert len(test2) == 2
    assert test2 == "https://test2.com"
    assert test2 == "http://test.com"

    test3 = extract_uris(
        "[a](https://www.test.com)      site.it        [b](https://empty)")
    assert len(test3) == 2
    assert test3 == "https://www.test.com"
    assert test3 == "https://empty"

    test4 = extract_uris(a_text_with_urls)
    assert len(test4) == 17

    test5 = extract_uris("bla bla http://www.google.it")
    assert len(test5) == 1

    print("all tests passed")
