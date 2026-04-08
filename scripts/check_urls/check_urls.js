#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');
const { WebClient } = require('@slack/web-api');

const SLACK_TOKEN = process.env.IO_APP_SLACK_HELPER_BOT_TOKEN;
const SLACK_CHANNEL = '#io_dev_app_status';

const MAX_TIMEOUT_MS = 20000;
const MAX_CONCURRENCY = 20;

const REPO_ROOT = path.resolve(__dirname, '..', '..');

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36'
};

const REMOTE_CONTENT_URIS = [
  'https://assets.io.pagopa.it/bonus/bonus_available_v2.json',
  'https://assets.io.pagopa.it/contextualhelp/data.json',
  'https://assets.io.pagopa.it/status/backend.json'
];

const FILES_BLACK_LIST = new Set([
  'testFaker.ts',
  'PayWebViewModal.tsx',
  'paymentPayloads.ts',
  'message.ts',
  'supportAssistance.ts',
  'ZendeskAskPermissions.tsx'
]);

const URLS_BLACK_LIST = new Set([
  // 403 when this check runs (in the middle of the night)
  'https://id.lepida.it/docs/manuale_utente.pdf',
  // returns a 404 anytime the check runs but it actually works fine
  'https://checkout.pagopa.it/dona',
  // Mixpanel EU endpoint
  'https://api-eu.mixpanel.com',
  // Profile 412 status error / already taken type
  'https://ioapp.it/problems/email-already-taken',
  // EIC UAT endpoint
  'https://collaudo.idserver.servizicie.interno.gov.it/idp',
  // localhost is not reachable
  'https://localhost',
]);

/**
 * Extract HTTP/HTTPS URLs from text, excluding blacklisted ones.
 */
function extractUrls(text, blackList = new Set()) {
  const urlRegex = /https?:\/\/[^\s"'`<>)\]},\\]+/g;
  const urls = new Set();
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    // Strip trailing punctuation that may be part of surrounding syntax
    const url = match[0].replace(/[.,:;!?)\]}'"`\\]+$/, '');
    if (!blackList.has(url)) {
      urls.add(url);
    }
  }
  return urls;
}

/**
 * Recursively collect all files with .ts, .tsx, or .json extensions under dirPath.
 */
function getFiles(dirPath) {
  const results = [];
  for (const item of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, item.name);
    if (item.isDirectory()) {
      results.push(...getFiles(fullPath));
    } else if (/\.(ts|tsx|json)$/.test(item.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Scan a directory and return a Map of URL -> [source file basenames].
 */
function scanDirectory(dirPath, fileBlackList, urlsBlackList) {
  const urlMap = new Map();

  for (const filePath of getFiles(dirPath)) {
    const basename = path.basename(filePath);
    if (fileBlackList.has(basename)) continue;
    // Exclude test, mock, and snapshot files
    if (/(__tests?__|__mocks?__|\.snap)$/.test(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    for (const url of extractUrls(content, urlsBlackList)) {
      if (urlMap.has(url)) {
        urlMap.get(url).push(basename);
      } else {
        urlMap.set(url, [basename]);
      }
    }
  }

  return urlMap;
}

// Reuse a single HTTPS agent with SSL verification disabled across all requests
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Test a URL for availability.
 * Returns null if reachable (2xx/3xx), or an error string if broken.
 */
async function testAvailability(url) {
  try {
    const response = await axios.get(url, {
      headers: HEADERS,
      timeout: MAX_TIMEOUT_MS,
      maxRedirects: 5,
      httpsAgent,
      // Capture the status code without throwing so we can inspect it below
      validateStatus: () => true
    });
    return response.status < 400 ? null : `status code ${response.status}`;
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return `Timeout after ${MAX_TIMEOUT_MS}ms`;
    }
    if (error.code === 'ENOTFOUND') {
      return `DNS lookup failed for ${url}`;
    }
    return `Error - ${error.message}`;
  }
}

/**
 * Fetch text content from a remote URI, returning null on failure.
 */
async function loadRemoteContent(uri) {
  try {
    const response = await axios.get(uri, {
      headers: HEADERS,
      timeout: MAX_TIMEOUT_MS,
      httpsAgent,
      validateStatus: status => status < 400
    });
    return response.data ? JSON.stringify(response.data) : null;
  } catch {
    return null;
  }
}

/**
 * Run async tasks with a bounded concurrency limit.
 */
async function runWithConcurrency(items, concurrency, fn) {
  const results = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker)
  );
  return results;
}

/**
 * Send a Slack notification listing all broken URLs.
 */
async function sendSlackMessage(invalidUrls) {
  if (!SLACK_TOKEN) {
    console.log('No SLACK token provided, skipping notification.');
    return;
  }

  const client = new WebClient(SLACK_TOKEN);

  try {
    await client.chat.postMessage({
      channel: SLACK_CHANNEL,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `[URLs Check] :warning: <!here> There are ${invalidUrls.length} uris in *IO App* that are not working`
          }
        }
      ]
    });

  } catch (error) {
    console.error(`Slack error: ${error.message}`);
  }
}

async function main() {
  const allUris = new Map();

  // Scan local source directories
  console.log('Scanning local folders...');

  for (const [dirPath, blackList] of [
    [path.join(REPO_ROOT, 'locales'), new Set()],
    [path.join(REPO_ROOT, 'ts'), FILES_BLACK_LIST]
  ]) {
    const found = scanDirectory(dirPath, blackList, URLS_BLACK_LIST);
    console.log(`Found ${found.size} URIs in ${dirPath}`);
    for (const [uri, sources] of found) {
      if (allUris.has(uri)) {
        allUris.get(uri).push(...sources);
      } else {
        allUris.set(uri, [...sources]);
      }
    }
  }

  // Fetch and scan remote content files
  console.log('Scanning remote resources...');
  for (const remoteUri of REMOTE_CONTENT_URIS) {
    const content = await loadRemoteContent(remoteUri);
    if (content) {
      const sourceName = path.basename(remoteUri);
      for (const url of extractUrls(content, URLS_BLACK_LIST)) {
        if (!allUris.has(url)) {
          allUris.set(url, [sourceName]);
        }
      }
    }
  }

  console.log(`Found ${allUris.size} URIs. Testing availability...`);

  const uriEntries = [...allUris.entries()];
  const results = await runWithConcurrency(
    uriEntries,
    MAX_CONCURRENCY,
    async ([uri, sources]) => {
      const error = await testAvailability(uri);
      return { uri, source: sources.join('|'), error, hasError: error !== null };
    }
  );

  const invalidUris = results.filter(r => r.hasError);
  console.log(`\nFound ${invalidUris.length} broken or invalid URIs`);

  if (invalidUris.length > 0) {
    console.log('\nErrors:');
    for (const { source, error, uri } of invalidUris) {
      console.log(`  [${source}][${error}] -> ${uri}`);
    }
    await sendSlackMessage(invalidUris);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
