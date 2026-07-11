/**
 * Curated Platform Guide screenshots — unique, informative shots only.
 * FE must be http://localhost:3000 (matches API host).
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'docs/assets/guide');
const FE = (process.env.FE_BASE || 'http://localhost:3000').replace(/\/$/, '');
const API = (process.env.API_BASE || 'http://localhost:5141').replace(/\/$/, '');

const CREDS = {
  creator: {
    email: process.env.SMOKE_CREATOR_EMAIL || 'creator@knightkings.com',
    password: process.env.SMOKE_CREATOR_PASSWORD || 'Creator#2026',
  },
  admin: {
    email: process.env.SMOKE_ADMIN_EMAIL || 'admin@knightkings.com',
    password: process.env.SMOKE_ADMIN_PASSWORD || 'Admin#2026',
  },
  superadmin: {
    email: process.env.SMOKE_SUPERADMIN_EMAIL || 'superadmin@knightkings.com',
    password: process.env.SMOKE_SUPERADMIN_PASSWORD || 'SuperAdmin#2026',
  },
};

fs.mkdirSync(OUT, { recursive: true });
const log = (...a) => console.log('[capture]', ...a);
const sample = { videoId: null, creatorId: null, paidVideoId: null };

async function loadSampleIds() {
  const r = await fetch(`${API}/video/search?limit=10`);
  const j = await r.json();
  const videos = j.videos || [];
  sample.videoId = videos.find((v) => v.monetization?.type === 'free')?._id || videos[0]?._id;
  sample.paidVideoId =
    videos.find((v) => ['paid', 'rent'].includes(v.monetization?.type))?._id || videos[1]?._id;
  sample.creatorId = videos[0]?.creatorId?._id || videos[0]?.creatorId || null;
  log('samples', sample);
}

async function acceptCompliance(context) {
  await context.addInitScript(() => {
    try {
      localStorage.setItem('xp_age_verified_18', '1');
      localStorage.setItem('xp_cookie_consent', 'all');
      localStorage.setItem('xpeacock-theme', 'dark');
      document.cookie = 'xp_age_verified_18=1; path=/; max-age=31536000; SameSite=Lax';
      document.cookie = 'xp_cookie_consent=all; path=/; max-age=31536000; SameSite=Lax';
    } catch {}
  });
}

async function dismissDevOverlay(page) {
  await page.evaluate(() => {
    document.querySelectorAll('nextjs-portal, [data-nextjs-dialog], #__next-build-watcher').forEach((el) => {
      try {
        el.remove();
      } catch {}
    });
  }).catch(() => {});
  await page.keyboard.press('Escape').catch(() => {});
}

async function waitForSettled(page, { expectVideos = false, extraMs = 1600 } = {}) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await dismissDevOverlay(page);

  if (expectVideos) {
    await page
      .waitForFunction(() => {
        if (document.querySelectorAll('a[href*="/watch/"] img[src]').length > 0) return true;
        return /No Videos|No results|Connection Issue/i.test(document.body?.innerText || '');
      }, { timeout: 45000 })
      .catch(() => {});
  } else {
    await page
      .waitForFunction(() => document.querySelectorAll('.aspect-video .animate-shimmer').length === 0, {
        timeout: 20000,
      })
      .catch(() => {});
  }

  await page
    .waitForFunction(() => document.querySelectorAll('.theme-soft-fill-strong.animate-pulse').length === 0, {
      timeout: 10000,
    })
    .catch(() => {});

  await dismissDevOverlay(page);
  await page.waitForTimeout(extraMs);
}

async function shot(page, name, opts = {}) {
  await waitForSettled(page, {
    expectVideos: !!opts.expectVideos,
    extraMs: opts.settle ?? 1600,
  });
  await dismissDevOverlay(page);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: !!opts.fullPage });
  log('shot', name);
}

async function newContext(browser, { mobile = false, accept = true } = {}) {
  const context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  if (accept) await acceptCompliance(context);
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  return { context, page };
}

async function safeGoto(page, urlPath) {
  await page.goto(`${FE}${urlPath}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
}

async function login(page, email, password) {
  await safeGoto(page, '/login');
  await page.waitForSelector('#email', { timeout: 20000 });
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.getByRole('button', { name: /^sign in$/i }).click();
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(400);
    if (!page.url().includes('/login')) break;
  }
  if (page.url().includes('/login')) {
    throw new Error(`Login failed ${email}`);
  }
  await waitForSettled(page, { extraMs: 1000 });
  log('logged in', email);
}

async function section(name, fn) {
  try {
    log('section', name);
    await fn();
  } catch (e) {
    log('SECTION FAILED', name, e.message);
  }
}

async function run() {
  for (const f of fs.readdirSync(OUT)) {
    if (f.endsWith('.png') || f === 'manifest.json') fs.unlinkSync(path.join(OUT, f));
  }

  await loadSampleIds();
  const browser = await chromium.launch({ headless: true });

  await section('public', async () => {
    // Overlays (fresh context, no accept)
    {
      const { context, page } = await newContext(browser, { accept: false });
      await safeGoto(page, '/');
      await page.waitForTimeout(1800);
      await shot(page, '01-age-gate', { settle: 800 });
      const yes = page.getByRole('button', { name: /i am 18|enter|yes|confirm|continue/i }).first();
      if (await yes.count()) {
        await yes.click();
        await page.waitForTimeout(1200);
      }
      await shot(page, '02-cookie-consent', { settle: 800 });
      await context.close();
    }

    const { context, page } = await newContext(browser);
    await safeGoto(page, '/');
    await shot(page, '03-home', { fullPage: true, expectVideos: true, settle: 2200 });
    await safeGoto(page, '/categories');
    await shot(page, '04-categories', { fullPage: true, settle: 2000 });
    await safeGoto(page, '/search?q=AA');
    await shot(page, '05-search', { fullPage: true, expectVideos: true, settle: 2000 });
    if (sample.creatorId) {
      await safeGoto(page, `/channel/${sample.creatorId}`);
      await shot(page, '06-channel', { fullPage: true, expectVideos: true, settle: 2000 });
    }
    if (sample.videoId) {
      await safeGoto(page, `/watch/${sample.videoId}`);
      await shot(page, '07-watch-free', { fullPage: true, settle: 2500 });
    }
    if (sample.paidVideoId) {
      await safeGoto(page, `/watch/${sample.paidVideoId}`);
      await shot(page, '08-watch-paywall', { fullPage: true, settle: 2500 });
    }
    await safeGoto(page, '/subscriptions');
    await shot(page, '09-subscriptions', { fullPage: true, settle: 2000 });
    await safeGoto(page, '/login');
    await shot(page, '10-login', { settle: 1200 });
    await safeGoto(page, '/signup?role=creator');
    await shot(page, '11-signup', { settle: 1200 });
    await safeGoto(page, '/support');
    await shot(page, '12-support', { fullPage: true, settle: 1500 });
    await safeGoto(page, '/terms');
    await shot(page, '13-legal', { fullPage: true, settle: 1200 });
    await context.close();

    const mob = await newContext(browser, { mobile: true });
    await safeGoto(mob.page, '/');
    await shot(mob.page, '14-mobile', { expectVideos: true, settle: 2000 });
    await mob.context.close();
  });

  await section('viewer-creator', async () => {
    const { context, page } = await newContext(browser);
    await login(page, CREDS.creator.email, CREDS.creator.password);

    await safeGoto(page, '/liked');
    await shot(page, '15-liked', { fullPage: true, settle: 1800 });
    await safeGoto(page, '/profile');
    await shot(page, '16-profile', { fullPage: true, settle: 1800 });
    await safeGoto(page, '/subscriptions');
    await shot(page, '17-subscribe-checkout', { fullPage: true, settle: 2000 });

    if (sample.videoId) {
      await safeGoto(page, `/watch/${sample.videoId}`);
      await waitForSettled(page, { settle: 2000 });
      const report = page.getByRole('button', { name: /report/i }).first();
      if (await report.count()) {
        await report.click();
        await page.waitForTimeout(700);
        await shot(page, '18-report-modal', { settle: 600 });
        await page.keyboard.press('Escape').catch(() => {});
      }
    }

    await safeGoto(page, '/dashboard');
    await shot(page, '19-creator-dashboard', { fullPage: true, settle: 2500 });
    await safeGoto(page, '/dashboard/videos');
    await shot(page, '20-creator-videos', { fullPage: true, settle: 2500 });
    const uploadBtn = page.getByRole('button', { name: /upload|add video|new video/i }).first();
    if (await uploadBtn.count()) {
      await uploadBtn.click();
      await page.waitForTimeout(1000);
      await shot(page, '21-upload-wizard', { settle: 800 });
      await page.keyboard.press('Escape').catch(() => {});
    }
    await safeGoto(page, '/dashboard/channels');
    await shot(page, '22-creator-channels', { fullPage: true, settle: 2000 });
    await safeGoto(page, '/dashboard/payouts');
    await shot(page, '23-creator-payouts', { fullPage: true, settle: 2000 });
    await safeGoto(page, '/dashboard/settings');
    await shot(page, '24-creator-settings', { fullPage: true, settle: 2000 });
    await context.close();
  });

  await section('admin', async () => {
    const { context, page } = await newContext(browser);
    await login(page, CREDS.admin.email, CREDS.admin.password);
    await safeGoto(page, '/dashboard/admin/moderation');
    await shot(page, '25-moderation', { fullPage: true, settle: 2000 });
    await safeGoto(page, '/dashboard/admin/support');
    await shot(page, '26-admin-support', { fullPage: true, settle: 2000 });
    await safeGoto(page, '/dashboard/admin/verification');
    await shot(page, '27-verification', { fullPage: true, settle: 2000 });
    await safeGoto(page, '/dashboard/users');
    await shot(page, '28-users', { fullPage: true, settle: 2000 });
    await context.close();
  });

  await section('superadmin', async () => {
    const { context, page } = await newContext(browser);
    await login(page, CREDS.superadmin.email, CREDS.superadmin.password);
    await safeGoto(page, '/dashboard/admin/payouts');
    await shot(page, '29-admin-payouts', { fullPage: true, settle: 2000 });
    await safeGoto(page, '/dashboard/admin/subscriptions?tab=plans');
    await shot(page, '30-plans', { fullPage: true, settle: 2000 });
    await safeGoto(page, '/dashboard/admin/subscriptions?tab=promos');
    await shot(page, '31-promos', { fullPage: true, settle: 2000 });
    await safeGoto(page, '/dashboard/admin/subscriptions?tab=stats');
    await page.waitForSelector('text=/Platform Statistics|Failed to load|Latest Month/i', { timeout: 20000 }).catch(() => {});
    await dismissDevOverlay(page);
    await shot(page, '32-stats', { fullPage: true, settle: 2200 });
    await safeGoto(page, '/dashboard/admin/subscriptions?tab=audits');
    await shot(page, '33-payment-audits', { fullPage: true, settle: 2000 });
    await context.close();
  });

  await browser.close();
  const files = fs.readdirSync(OUT).filter((f) => f.endsWith('.png')).sort();
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ at: new Date().toISOString(), fe: FE, sample, files }, null, 2));
  log('done', files.length, 'screenshots');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
