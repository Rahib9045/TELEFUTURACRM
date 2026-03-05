const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "2fbe8e9f5bmsh62b3b6b84b12261p1f0690jsn7a2262eb7dce";
const HOST = 'mobile-phone-specs-database.p.rapidapi.com';

const endpointsToTest = [
    '/v4/models',
    '/v4/models/by-brand',
    '/api/v4/models',
    '/models/manufacturer/Samsung',
    '/device/Samsung',
    '/brand/Samsung/models',
    '/api/models/Samsung',
    '/v1/models/Samsung',
    '/brands/Samsung',
    '/api/brands/Samsung/models',
    '/v4/brands?name=Samsung',
    '/v4/brand/Samsung'
];

async function testEndpoints() {
    console.log("Starting RapidAPI Endpoint Discovery...");
    for (const endpoint of endpointsToTest) {
        const url = `https://${HOST}${endpoint}`;
        try {
            const res = await fetch(url, {
                headers: {
                    'x-rapidapi-key': RAPIDAPI_KEY,
                    'x-rapidapi-host': HOST
                }
            });
            console.log(`[${res.status}] ${endpoint}`);
            if (res.ok) {
                const data = await res.json();
                console.log("✅ SUCCESS:", JSON.stringify(data).substring(0, 100));
                return;
            } else {
                const text = await res.text();
                console.log("   ->", text.substring(0, 200));
            }
        } catch (e) {
            console.error(`ERROR on ${endpoint}:`, e.message);
        }
    }
}
testEndpoints();
