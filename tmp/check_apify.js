const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const token = env.split('\n').find(l => l.startsWith('APIFY_API_TOKEN=')).split('=')[1].trim();

async function check() {
    const runsRes = await fetch(`https://api.apify.com/v2/actor-runs?token=${token}&desc=true&limit=10`);
    const runsData = await runsRes.json();
    const runs = runsData.data.items;

    for (const run of runs) {
        if (run.status !== 'SUCCEEDED') continue;
        const dataRes = await fetch(`https://api.apify.com/v2/datasets/${run.defaultDatasetId}/items?token=${token}&limit=1`);
        const items = await dataRes.json();
        
        if (items.length > 0) {
            if (run.actId === 'shoya/malt-profile-scraper' || run.actorId === 'shoya/malt-profile-scraper' || run.actorId === 'shoya~~malt-profile-scraper') {
                console.log("\n--- MALT FULL OBJ ---");
                console.log(items[0]);
            }
            if (run.actId === 'clearpath/wellfound-api-ppe' || run.actorId === 'clearpath/wellfound-api-ppe' || run.actorId === 'clearpath~~wellfound-api-ppe') {
                console.log("\n--- WELLFOUND FULL OBJ ---");
                console.log(items[0]);
            }
        }
    }
}
check().catch(console.error);
