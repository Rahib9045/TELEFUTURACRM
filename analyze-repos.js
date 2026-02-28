const fs = require('fs');

const token = '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';
const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'NodeJS-Repo-Analyzer'
};

async function analyzeRepos() {
    console.log('Fetching repositories...');
    const res = await fetch('https://api.github.com/user/repos?per_page=100&type=owner', { headers });

    if (!res.ok) {
        console.error('Failed to fetch repositories:', await res.text());
        return;
    }

    const repos = await res.json();
    console.log(`Found ${repos.length} repositories.`);

    const summaries = [];

    for (const repo of repos) {
        console.log(`Analyzing: ${repo.full_name}...`);
        let readmeText = '';

        // Attempt to fetch README
        try {
            const readmeRes = await fetch(`https://api.github.com/repos/${repo.full_name}/readme`, { headers });
            if (readmeRes.ok) {
                const readmeData = await readmeRes.json();
                readmeText = Buffer.from(readmeData.content, 'base64').toString('utf-8');
            } else {
                // If no README, fetch the root directory contents to get an idea of the project
                const dirRes = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/`, { headers });
                if (dirRes.ok) {
                    const dirData = await dirRes.json();
                    const files = dirData.map(f => f.name).join(', ');
                    readmeText = `[NO README] Root files: ${files}`;
                }
            }
        } catch (e) {
            readmeText = '[ERROR FETCHING DETAILS]';
        }

        summaries.push({
            name: repo.full_name,
            description: repo.description || 'No description provided.',
            language: repo.language || 'Unknown',
            private: repo.private,
            readme: readmeText.substring(0, 1500) // Truncate to save space
        });
    }

    fs.writeFileSync('github-summary.json', JSON.stringify(summaries, null, 2));
    console.log('Analysis saved to github-summary.json');
}

analyzeRepos();
