import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ga4DevPlugin() {
  return {
    name: 'ga4-dev-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/getGA4Analytics')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const dateRangeParam = (urlObj.searchParams.get('dateRange') || '7days').toLowerCase();

          const keyPath = path.resolve(__dirname, 'functions/service-account.json');
          if (!fs.existsSync(keyPath) && !process.env.GA_SERVICE_ACCOUNT_KEY) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(
              JSON.stringify({
                configured: false,
                propertyId: '543069695',
                measurementId: 'G-7LPCET02EM',
                message: 'Service account credentials not found.',
              })
            );
          }

          const credentials = fs.existsSync(keyPath)
            ? JSON.parse(fs.readFileSync(keyPath, 'utf-8'))
            : JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY);

          const client = new BetaAnalyticsDataClient({ credentials });

          const currentYear = new Date().getFullYear();
          let startDate = '7daysAgo';
          let endDate = 'today';
          if (dateRangeParam === 'today') {
            startDate = 'today';
            endDate = 'today';
          } else if (dateRangeParam === '30days') {
            startDate = '30daysAgo';
            endDate = 'today';
          } else if (dateRangeParam === 'ytd') {
            startDate = `${currentYear}-01-01`;
            endDate = 'today';
          }

          const GA4_PROPERTY_ID = '543069695';

          // 1. Core Summary Metrics
          const [summaryResponse] = await client.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [
              { name: 'totalUsers' },
              { name: 'newUsers' },
              { name: 'activeUsers' },
              { name: 'screenPageViews' },
              { name: 'eventCount' },
            ],
          });
          const summaryRow = summaryResponse.rows?.[0]?.metricValues || [];
          const totalUsers = parseInt(summaryRow[0]?.value || '0', 10);
          const newUsers = parseInt(summaryRow[1]?.value || '0', 10);
          const activeUsers = parseInt(summaryRow[2]?.value || '0', 10);
          const screenPageViews = parseInt(summaryRow[3]?.value || '0', 10);
          const eventCount = parseInt(summaryRow[4]?.value || '0', 10);

          // 2. Events Breakdown
          const [eventsResponse] = await client.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'eventName' }],
            metrics: [{ name: 'eventCount' }],
          });
          const eventCounts = {};
          (eventsResponse.rows || []).forEach((row) => {
            const name = row.dimensionValues?.[0]?.value;
            const count = parseInt(row.metricValues?.[0]?.value || '0', 10);
            if (name) eventCounts[name] = count;
          });

          // 3. Daily & Monthly Trends
          const [trendsResponse] = await client.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'date' }],
            metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
            orderBys: [{ dimension: { dimensionName: 'date' } }],
          });
          const trends = (trendsResponse.rows || []).map((row) => {
            const rawDate = row.dimensionValues?.[0]?.value || '';
            const formattedDate =
              rawDate.length === 8 ? rawDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') : rawDate;
            return {
              date: formattedDate,
              activeUsers: parseInt(row.metricValues?.[0]?.value || '0', 10),
              pageViews: parseInt(row.metricValues?.[1]?.value || '0', 10),
            };
          });

          // 4. Top Visited Pages
          const [pagesResponse] = await client.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            limit: 10,
          });
          const topPages = (pagesResponse.rows || []).map((row) => ({
            pagePath: row.dimensionValues?.[0]?.value,
            views: parseInt(row.metricValues?.[0]?.value || '0', 10),
            users: parseInt(row.metricValues?.[1]?.value || '0', 10),
          }));

          // 5. Top Jobs
          const [jobsResponse] = await client.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }],
            dimensionFilter: {
              filter: {
                fieldName: 'pagePath',
                stringFilter: {
                  matchType: 'CONTAINS',
                  value: '/job/',
                },
              },
            },
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            limit: 10,
          });
          const topJobs = (jobsResponse.rows || []).map((row) => ({
            jobPath: row.dimensionValues?.[0]?.value,
            views: parseInt(row.metricValues?.[0]?.value || '0', 10),
          }));

          let jobDetailPageViews = eventCounts['view_job_detail'] || 0;
          if (!jobDetailPageViews) {
            topJobs.forEach((j) => {
              jobDetailPageViews += j.views;
            });
          }

          const applyButtonClicks = eventCounts['click_apply'] || eventCounts['click'] || 0;
          const resumeBuilderUsage =
            eventCounts['use_resume_builder'] ||
            topPages.find((p) => p.pagePath && (p.pagePath === '/resume' || p.pagePath.startsWith('/resume/')))?.views ||
            0;
          const atsCheckerUsage =
            eventCounts['use_ats_checker'] ||
            topPages.find((p) => p.pagePath && (p.pagePath === '/ats' || p.pagePath.startsWith('/ats/')))?.views ||
            0;
          const savedJobEngagement = eventCounts['save_job'] || eventCounts['bookmark_job'] || 0;

          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              configured: true,
              propertyId: GA4_PROPERTY_ID,
              measurementId: 'G-7LPCET02EM',
              dateRange: dateRangeParam,
              startDate,
              endDate,
              metrics: {
                totalUsers,
                newUsers,
                activeUsers,
                totalPageViews: screenPageViews,
                eventCount,
                jobDetailPageViews,
                applyButtonClicks,
                resumeBuilderUsage,
                atsCheckerUsage,
                savedJobEngagement,
              },
              events: eventCounts,
              trends,
              topPages,
              topJobs,
            })
          );
        } catch (err) {
          console.error('Vite GA4 dev middleware error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

function fantasticJobsDevPlugin() {
  return {
    name: 'fantastic-jobs-dev-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/fantastic-jobs')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const targetUrl =
            urlObj.searchParams.get('url') ||
            'https://data.fantastic.jobs/v1/active-ats?time_frame=7d&limit=100&description_format=text&title=%22Developer%22&location=India';

          const envFilePath = path.resolve(__dirname, '.env');
          let apiKey = process.env.VITE_FANTASTIC_JOBS_API_KEY || '';
          if (!apiKey && fs.existsSync(envFilePath)) {
            const envContent = fs.readFileSync(envFilePath, 'utf-8');
            const match = envContent.match(/VITE_FANTASTIC_JOBS_API_KEY=(.*)/);
            if (match) apiKey = match[1].trim();
          }

          const response = await fetch(targetUrl, {
            headers: {
              ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
          });

          const data = await response.json();
          const creditsUsed = response.headers.get('x-api-jobs-this-request') || '1';

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('x-api-jobs-this-request', creditsUsed);
          res.end(JSON.stringify(data));
        } catch (err) {
          console.error('Fantastic Jobs dev proxy error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), ga4DevPlugin(), fantasticJobsDevPlugin()],
});
