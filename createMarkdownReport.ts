import fs from 'node:fs';
import path from 'node:path';

const resultFiles = fs.readdirSync('test-results').filter(file => file.startsWith('results_') && file.endsWith('.json'));

interface Result extends Array<string | number | boolean> {
  0: string;  // resource
  1: string;  // type
  2: number;  // desktopValue
  3: number;  // mobileValue
  4: boolean; // goal
}

interface Results {
  url: string;
  results: Result[];
}

interface AllResults {
  [url: string]: {
    desktop: Result[];
    mobile: Result[];
  };
}

const allResults: AllResults = {};

for (const file of resultFiles) {
  const [_, device, ...urlParts] = file.split('_');
  const results: Results = JSON.parse(fs.readFileSync(path.join('test-results', file), 'utf-8'));
  const url = results.url; // JSONファイルから正しいURLを取得

  if (!allResults[url]) {
    allResults[url] = { desktop: [], mobile: [] };
  }

  if (device === 'mobile') {
    allResults[url].mobile = results.results;
  } else {
    allResults[url].desktop = results.results;
  }
}

console.log(allResults);

const markdownContent = Object.entries(allResults).map(([url, { desktop, mobile }]) => {
  const mergedResults = desktop.map((result: Result, index: number) => {
    const mobileResult = mobile[index] || ['', '', 0, 0, false];
    return `| ${result[0]} | ${result[1]} | ${result[2]} | ${mobileResult[2]} | ${result[3]} | ${result[4] ? '達成' : '未達成' } |`;
  }).join('\n');
  return `## ${url}\n\n| Resource | Type | Desktop | Mobile | Goal | Result |\n| --- | --- | --- | --- | --- | --- |\n${mergedResults}`;
}).join('\n\n');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join('report', `${timestamp}_report.md`);

fs.writeFileSync(reportPath, markdownContent);

