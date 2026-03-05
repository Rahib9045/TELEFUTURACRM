const fs = require('fs');
const path = require('path');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Brands we care about
const TARGET_BRANDS = [
    "Apple", "Samsung", "Xiaomi", "OPPO", "realme",
    "Google", "Motorola", "Honor", "Nothing", "Vivo"
];

async function fetchFromRapidAPI(endpoint) {
    const url = `https://mobile-phone-specs-database.p.rapidapi.com${endpoint}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'mobile-phone-specs-database.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const textUrl = await response.text();
            console.error(`API Fetch Error: Status ${response.status} for ${endpoint}`, textUrl);
            return null;
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("API Fetch Exception:", error);
        return null;
    }
}

async function syncSmartphones() {
    if (!RAPIDAPI_KEY) {
        console.error("❌ Error: RAPIDAPI_KEY environment variable is missing.");
        process.exit(1);
    }

    console.log("🔄 Starting smartphone synchronization...");

    let updatedData = {};

    // Try to read existing data first to preserve it in case the API rate limits us
    const jsonPath = path.join(__dirname, '../src/data/smartphones.json');
    try {
        if (fs.existsSync(jsonPath)) {
            updatedData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        }
    } catch (e) {
        console.warn("Could not read existing smartphones.json, starting fresh.");
    }

    // RapidAPI Mobile Phone Specs Database endpoint:
    // GET /v1/models/by-brand?brandName={brand}
    // Returns: [{ "modelValue": "Galaxy S24 Ultra" }, ...]

    let hasUpdates = false;

    for (const brand of TARGET_BRANDS) {
        console.log(`Fetching latest models for ${brand}...`);

        // Add a delay to avoid hitting rate limits (e.g. max 1 req per few seconds)
        await new Promise(resolve => setTimeout(resolve, 4000));

        const data = await fetchFromRapidAPI(`/gsm/get-models-by-brandname/${encodeURIComponent(brand)}`);

        if (data && Array.isArray(data)) {
            // Extract the model strings from the objects
            const nonPhoneRegex = /ipad|watch|macbook|airpods|vision|\btab\b|\bpad\b|tablet|\bband\b|\bbuds\b/i;
            const models = data
                .map(item => item.modelValue)
                .filter(Boolean)
                .filter(name => !nonPhoneRegex.test(name));

            if (models.length > 0) {
                // Since the API does not provide release dates and the list is in arbitrary order,
                // we sort the models intelligently by extracting the highest generation number 
                // in the model name (e.g. iPhone 16 > iPhone 14, S25 > S22).
                models.sort((a, b) => {
                    const numA = parseInt((a.match(/\d+/) || ["0"])[0], 10);
                    const numB = parseInt((b.match(/\d+/) || ["0"])[0], 10);

                    // If the numbers are equal (e.g. iPhone 16 vs iPhone 16 Pro),
                    // sort alphabetically so they cluster nicely.
                    if (numB === numA) return b.localeCompare(a);
                    return numB - numA;
                });

                // Keep the top 60 highest numbered models to cover ~2-3 years 
                updatedData[brand] = models.slice(0, 60);
                hasUpdates = true;
                console.log(`✅ Successfully synced ${updatedData[brand].length} models for ${brand}`);
            } else {
                console.warn(`⚠️ No models returned for ${brand}`);
            }
        } else {
            console.error(`❌ Failed to fetch data for ${brand}`);
        }
    }

    if (hasUpdates) {
        // Write back to file system
        fs.writeFileSync(jsonPath, JSON.stringify(updatedData, null, 2));
        console.log(`\n💾 Saved updated list to ${jsonPath}`);
    } else {
        console.log(`\n⚠️ Sync finished but no new data was fetched. Check API key limits.`);
    }
}

syncSmartphones();
