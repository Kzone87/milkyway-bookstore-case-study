import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');

assert.ok(html.includes('<link rel="stylesheet" href="./styles.css">'), 'index.html must load styles.css');
assert.ok(css.length > 1000, 'styles.css looks unexpectedly small');
assert.ok(readme.includes('Contribution evidence index'), 'README evidence index is missing');

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]));
for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.has(match[1]), `missing internal anchor target: #${match[1]}`);
}

const requiredPullRequests = [1, 5, 7, 9, 11, 23, 33, 43, 49];
for (const number of requiredPullRequests) {
    const url = `https://github.com/fullstackteampj/MillkyWay/pull/${number}`;
    assert.ok(html.includes(url), `visual case study is missing PR #${number}`);
    assert.ok(readme.includes(url), `README is missing PR #${number}`);
}

for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    assert.match(match[0], /rel="noreferrer"/, `external target=_blank link is missing rel=noreferrer: ${match[0]}`);
}

console.log('Case study structure and evidence links are valid.');
