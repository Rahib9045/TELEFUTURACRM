const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../src/data/smartphones.json');
let data = {};

try {
    data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
} catch (e) {
    console.error("Could not read existing smartphones.json");
    process.exit(1);
}

const nonPhoneRegex = /ipad|watch|macbook|airpods|vision|\btab\b|\bpad\b|tablet|\bband\b|\bbuds\b/i;

let updatedData = {};

for (const brand in data) {
    const originalModels = data[brand];

    // 1. Filter out tablets, watches, earbuds
    let models = originalModels.filter(name => !nonPhoneRegex.test(name));

    // 2. Sort intelligently by highest generation number
    models.sort((a, b) => {
        const numA = parseInt((a.match(/\d+/) || ["0"])[0], 10);
        const numB = parseInt((b.match(/\d+/) || ["0"])[0], 10);

        if (numB === numA) return b.localeCompare(a);
        return numB - numA;
    });

    // 3. Keep top 60 models 
    updatedData[brand] = models.slice(0, 60);
    console.log(`✅ Filtered ${brand}: kept ${updatedData[brand].length} models (out of ${originalModels.length})`);
}

fs.writeFileSync(jsonPath, JSON.stringify(updatedData, null, 2));
console.log(`\n💾 Saved updated list to ${jsonPath}`);
