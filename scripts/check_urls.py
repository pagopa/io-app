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

uris = []
invalid_uris = []

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
        print(invalid_uris)
        
scanDirectory("./locales")

pool = mp.Pool(mp.cpu_count())
pool.map(testhttpuri, [uri for uri in uris])
pool.close()