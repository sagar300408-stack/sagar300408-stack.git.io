/**
 * Originyx Content Engine - E2E Verification Script
 * This script runs smoke tests and API contract validations post-deployment.
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const ROUTES_TO_TEST = [
    '/',
    '/services/',
    '/case-studies/',
    '/insights/',
    '/admin/',
    '/api/v1/content',
    '/api/v1/search?q=test'
];

async function fetchRoute(route) {
    return new Promise((resolve, reject) => {
        const client = BASE_URL.startsWith('https') ? https : http;
        const req = client.get(`${BASE_URL}${route}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, data, headers: res.headers });
            });
        });
        req.on('error', reject);
    });
}

async function verifyAPIContract() {
    console.log(`\n🔍 Verifying API Contract: /api/v1/content...`);
    const { status, data } = await fetchRoute('/api/v1/content');
    
    if (status !== 200) {
        throw new Error(`API returned status ${status}. Expected 200.`);
    }

    let parsed;
    try {
        parsed = JSON.parse(data);
    } catch (e) {
        throw new Error('API did not return valid JSON.');
    }

    if (!parsed.data || !Array.isArray(parsed.data)) {
        throw new Error('API Contract Violation: Missing "data" array.');
    }

    if (!parsed.meta || typeof parsed.meta.limit !== 'number') {
        throw new Error('API Contract Violation: Missing "meta" object with "limit".');
    }

    if (parsed.data.length > 0) {
        const item = parsed.data[0];
        const requiredKeys = ['id', 'title', 'slug', 'created_at', 'type'];
        for (const key of requiredKeys) {
            if (!(key in item)) {
                throw new Error(`API Contract Violation: Insight object missing required key "${key}".`);
            }
        }
    } else {
        console.log(`   ℹ️ Database is empty (0 insights returned). API Schema structure is valid.`);
    }

    console.log('   ✅ API Contract verified.');
}

async function runSmokeTests() {
    console.log(`\n🚀 Starting Smoke Tests against ${BASE_URL}...`);
    let hasError = false;

    for (const route of ROUTES_TO_TEST) {
        try {
            const { status } = await fetchRoute(route);
            if (status >= 200 && status < 400) {
                console.log(`   ✅ [${status}] ${route}`);
            } else {
                console.error(`   ❌ [${status}] ${route}`);
                hasError = true;
            }
        } catch (e) {
            console.error(`   ❌ [FAIL] ${route} - ${e.message}`);
            hasError = true;
        }
    }

    if (hasError) {
        throw new Error('Smoke tests failed. Review the logs above.');
    }
}

async function runAll() {
    try {
        await runSmokeTests();
        await verifyAPIContract();
        console.log(`\n🎉 All Phase 1 Integrations Verified Successfully!\n`);
        process.exit(0);
    } catch (error) {
        console.error(`\n🔥 VERIFICATION FAILED: ${error.message}\n`);
        process.exit(1);
    }
}

runAll();
