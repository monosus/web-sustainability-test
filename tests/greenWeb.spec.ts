import fs from 'node:fs';
import { expect, test } from '@playwright/test';
import { goals } from '../goals'; // goals.tsをインポート
import { urls } from '../urls'; // URLをインポート

for (const url of urls) { // forEachをfor ofに変更
  test(`check page sustainability for  ${url}`, async ({ page, browserName, context }) => { // browserNameを追加
    const isMobile = browserName === 'webkit'; // モバイルかどうかを判定

    await page.goto(url);

    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map((resource) => {
        const resourceEntry = resource as PerformanceResourceTiming;
        const size = Math.round(resourceEntry.transferSize || (resourceEntry.responseEnd - resourceEntry.responseStart)); // サイズを計算し整数に変換
        return {
          name: resourceEntry.name,
          type: resourceEntry.initiatorType,
          size: size,
        };
      });
    });

    // ページ自身のリソースを追加
    resources.push({
      name: url,
      type: 'html',
      size: Math.round(await page.evaluate(() => document.documentElement.outerHTML.length))
    });

    const resourceSummary = {
      videos: { weight: 0, requests: 0 },
      images: { weight: 0, requests: 0 },
      js: { weight: 0, requests: 0 },
      fonts: { weight: 0, requests: 0 },
      css: { weight: 0, requests: 0 },
      html: { weight: 0, requests: 0 },
      thirdparty: { weight: 0, requests: 0 },
    };

    for (const resource of resources) { // forEachをfor ofに変更
      const resourceUrl = new URL(resource.name);
      const pathname = resourceUrl.pathname;
      const extension = pathname.split('.').pop(); // 拡張子を取得
      const isThirdParty = resourceUrl.origin !== new URL(url).origin;

      if (isThirdParty) {
        resourceSummary.thirdparty.weight += resource.size;
        resourceSummary.thirdparty.requests += 1;
      } else {
        if (resource.type === 'img' || extension === 'svg') {
          resourceSummary.images.weight += resource.size;
          resourceSummary.images.requests += 1;
        } else if (resource.type === 'script') {
          resourceSummary.js.weight += resource.size;
          resourceSummary.js.requests += 1;
        } else if (extension === 'css') {
          resourceSummary.css.weight += resource.size;
          resourceSummary.css.requests += 1;
        } else if (resource.type === 'font' || extension === 'woff' || extension === 'woff2') {
          resourceSummary.fonts.weight += resource.size;
          resourceSummary.fonts.requests += 1;
        } else if (resource.type === 'html' || extension === 'html') {
          resourceSummary.html.weight += resource.size;
          resourceSummary.html.requests += 1;
        } else if (resource.type === 'video' || extension === 'mp4' || extension === 'webm') {
          resourceSummary.videos.weight += resource.size;
          resourceSummary.videos.requests += 1;
        }
      }
    }

    const totalWeight = Object.values(resourceSummary).reduce((acc, curr) => acc + curr.weight, 0);
    const totalRequests = Object.values(resourceSummary).reduce((acc, curr) => acc + curr.requests, 0);

    const results = [];

    try {
      await test.step('Check images weight', async () => {
        const result = resourceSummary.images.weight <= goals.images.weight;
        expect(result, `Images weight exceeded: ${resourceSummary.images.weight} > ${goals.images.weight}`).toBe(true);
      });
      results.push(['images', 'weight', resourceSummary.images.weight, goals.images.weight, true]);
    } catch (error) {
      results.push(['images', 'weight', resourceSummary.images.weight, goals.images.weight, false]);
    }

    try {
      await test.step('Check images requests', async () => {
        const result = resourceSummary.images.requests <= goals.images.requests;
        expect(result, `Images requests exceeded: ${resourceSummary.images.requests} > ${goals.images.requests}`).toBe(true);
      });
      results.push(['images', 'requests', resourceSummary.images.requests, goals.images.requests, true]);
    } catch (error) {
      results.push(['images', 'requests', resourceSummary.images.requests, goals.images.requests, false]);
    }

    try {
      await test.step('Check JS weight', async () => {
        const result = resourceSummary.js.weight <= goals.js.weight;
        expect(result, `JS weight exceeded: ${resourceSummary.js.weight} > ${goals.js.weight}`).toBe(true);
      });
      results.push(['js', 'weight', resourceSummary.js.weight, goals.js.weight, true]);
    } catch (error) {
      results.push(['js', 'weight', resourceSummary.js.weight, goals.js.weight, false]);
    }

    try {
      await test.step('Check JS requests', async () => {
        const result = resourceSummary.js.requests <= goals.js.requests;
        expect(result, `JS requests exceeded: ${resourceSummary.js.requests} > ${goals.js.requests}`).toBe(true);
      });
      results.push(['js', 'requests', resourceSummary.js.requests, goals.js.requests, true]);
    } catch (error) {
      results.push(['js', 'requests', resourceSummary.js.requests, goals.js.requests, false]);
    }

    try {
      await test.step('Check CSS weight', async () => {
        const result = resourceSummary.css.weight <= goals.css.weight;
        expect(result, `CSS weight exceeded: ${resourceSummary.css.weight} > ${goals.css.weight}`).toBe(true);
      });
      results.push(['css', 'weight', resourceSummary.css.weight, goals.css.weight, true]);
    } catch (error) {
      results.push(['css', 'weight', resourceSummary.css.weight, goals.css.weight, false]);
    }

    try {
      await test.step('Check CSS requests', async () => {
        const result = resourceSummary.css.requests <= goals.css.requests;
        expect(result, `CSS requests exceeded: ${resourceSummary.css.requests} > ${goals.css.requests}`).toBe(true);
      });
      results.push(['css', 'requests', resourceSummary.css.requests, goals.css.requests, true]);
    } catch (error) {
      results.push(['css', 'requests', resourceSummary.css.requests, goals.css.requests, false]);
    }

    try {
      await test.step('Check HTML weight', async () => {
        const result = resourceSummary.html.weight <= goals.html.weight;
        expect(result, `HTML weight exceeded: ${resourceSummary.html.weight} > ${goals.html.weight}`).toBe(true);
      });
      results.push(['html', 'weight', resourceSummary.html.weight, goals.html.weight, true]);
    } catch (error) {
      results.push(['html', 'weight', resourceSummary.html.weight, goals.html.weight, false]);
    }

    try {
      await test.step('Check HTML requests', async () => {
        const result = resourceSummary.html.requests <= goals.html.requests;
        expect(result, `HTML requests exceeded: ${resourceSummary.html.requests} > ${goals.html.requests}`).toBe(true);
      });
      results.push(['html', 'requests', resourceSummary.html.requests, goals.html.requests, true]);
    } catch (error) {
      results.push(['html', 'requests', resourceSummary.html.requests, goals.html.requests, false]);
    }

    try {
      await test.step('Check thirdparty weight', async () => {
        const result = resourceSummary.thirdparty.weight <= goals.thirdparty.weight;
        expect(result, `Thirdparty weight exceeded: ${resourceSummary.thirdparty.weight} > ${goals.thirdparty.weight}`).toBe(true);
      });
      results.push(['thirdparty', 'weight', resourceSummary.thirdparty.weight, goals.thirdparty.weight, true]);
    } catch (error) {
      results.push(['thirdparty', 'weight', resourceSummary.thirdparty.weight, goals.thirdparty.weight, false]);
    }

    try {
      await test.step('Check thirdparty requests', async () => {
        const result = resourceSummary.thirdparty.requests <= goals.thirdparty.requests;
        expect(result, `Thirdparty requests exceeded: ${resourceSummary.thirdparty.requests} > ${goals.thirdparty.requests}`).toBe(true);
      });
      results.push(['thirdparty', 'requests', resourceSummary.thirdparty.requests, goals.thirdparty.requests, true]);
    } catch (error) {
      results.push(['thirdparty', 'requests', resourceSummary.thirdparty.requests, goals.thirdparty.requests, false]);
    }

    try {
      await test.step('Check total weight', async () => {
        const result = totalWeight <= goals.total.weight;
        expect(result, `Total weight exceeded: ${totalWeight} > ${goals.total.weight}`).toBe(true);
      });
      results.push(['total', 'weight', totalWeight, goals.total.weight, true]);
    } catch (error) {
      results.push(['total', 'weight', totalWeight, goals.total.weight, false]);
    }

    try {
      await test.step('Check total requests', async () => {
        const result = totalRequests <= goals.total.requests;
        expect(result, `Total requests exceeded: ${totalRequests} > ${goals.total.requests}`).toBe(true);
      });
      results.push(['total', 'requests', totalRequests, goals.total.requests, true]);
    } catch (error) {
      results.push(['total', 'requests', totalRequests, goals.total.requests, false]);
    }

    // 結果をJSONファイルに出力
    const resultFileName = `test-results/results_${isMobile ? 'mobile' : 'desktop'}_${url.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    const resultData = {
      url: url, // 正しいURLを追加
      results: results
    };
    fs.writeFileSync(resultFileName, JSON.stringify(resultData, null, 2));
  });
}
