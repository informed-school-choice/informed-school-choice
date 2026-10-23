import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import vm from 'node:vm';

const read = name => readFileSync(path.join('dist', name), 'utf8');
const context = {window:{}};
vm.runInNewContext(read('data.js'), context);
const policy = JSON.parse(JSON.stringify(context.window.POLICY_DATA));
const sources = JSON.parse(read('sources.json'));
const table = name => read(`assets/sources/${name}`);
const groups = ['All', 'SEP', 'Non-SEP'];

function panel(text, letter) {
  const start = text.indexOf(`Panel ${letter}:`);
  assert.ok(start >= 0, `Missing manuscript panel ${letter}`);
  return text.slice(start, text.indexOf('\\midrule', start) === -1 ? text.indexOf('\\bottomrule', start) : text.indexOf('\\midrule', start));
}
function cells(line) {
  return line.split('&').slice(1).map(value => {
    const number = value.match(/-?\d+\.\d+/);
    return number ? Number(number[0]) : null;
  });
}
function rows(text, standardErrors = false) {
  const lines = text.split(/\r?\n/);
  return groups.map(group => {
    const index = lines.findIndex(line => line.startsWith(`${group} (`));
    assert.ok(index >= 0, `Missing ${group} row`);
    return cells(lines[index + Number(standardErrors)]);
  });
}

const main = table('CapacityCounterfactualTable.tex');
const means = rows(panel(main, 'A'));
const effects = rows(panel(main, 'B'));
const errors = rows(panel(main, 'B'), true);
const columns = (rows, last = 3) => rows.map(row => [row[0], row[1], row[2], row[last]]);
assert.deepEqual(policy.baseline.values, columns(means));
assert.deepEqual(policy.cost10.values, columns(means, 4));
assert.deepEqual(policy.baseline.effects, columns(effects).map(row => [0, ...row.slice(1)]));
assert.deepEqual(policy.cost10.effects, columns(effects, 4).map(row => [0, ...row.slice(1)]));
assert.deepEqual(policy.baseline.se, columns(errors));
assert.deepEqual(policy.cost10.se, columns(errors, 4));
for (const key of ['baseline', 'cost10']) {
  assert.equal(policy[key].sourceTable, 'CapacityCounterfactualTable.tex');
  assert.equal(policy[key].sourcePanel, 'A/B');
  assert.equal(policy[key].includedInCurrentManuscript, true);
  assert.equal(policy[key].researchSourceCommit, sources.researchSourceCommit);
}

const robustness = table('CounterfactualRobustness.tex');
for (const [key, letter] of Object.entries({sepOnly:'B', nonSepOnly:'C', publicResponds:'D', takeup75:'E', takeup50:'F'})) {
  assert.deepEqual(policy[key].values, rows(panel(robustness, letter)), `${key} must match its archived supplemental run`);
  assert.equal(policy[key].se, undefined, 'Do not borrow main-paper standard errors for another run');
  assert.equal(policy[key].sourceTable, 'CounterfactualRobustness.tex');
  assert.equal(policy[key].sourcePanel, letter);
  assert.equal(policy[key].includedInCurrentManuscript, false);
  assert.equal(policy[key].researchSourceCommit, sources.archivedSupplementalSource.researchSourceCommit);
  assert.equal(policy[key].sourceVersion, sources.archivedSupplementalSource.version);
}
assert.notDeepEqual(policy.baseline.values, rows(panel(robustness, 'A')), 'Review source notices if current and archived benchmarks change');

const html = read('index.html');
const contents = id => html.match(new RegExp(`<strong id="${id}">([^<]+)`))?.[1];
assert.equal(contents('effect'), `+${policy.baseline.effects[0][3].toFixed(3)}`);
assert.equal(contents('quality'), policy.baseline.values[0][3].toFixed(3));
assert.equal(contents('mobile-effect'), `+${policy.baseline.effects[0][3].toFixed(3)} SD`);
assert.equal(contents('va-mean-after'), policy.baseline.values[0][3].toFixed(3));
assert.match(html, /differences across these runs do not isolate policy changes/);
assert.match(html, /archived September supplemental outputs, omitted from the October paper and online appendix/);
assert.ok(html.includes(sources.canonicalPaperUrl));
assert.ok(html.includes(sources.canonicalAppendixUrl));
assert.ok(html.includes(sources.projectUrl));
assert.ok(html.includes(sources.nberUrl));
assert.equal(policy.sourceVersion, sources.version);
const population = JSON.parse(read('va-simulations.json'));
assert.equal(population.sourceVersion, policy.sourceVersion);
assert.equal(population.status, 'awaiting-model-outputs');
assert.equal(population.records.length, 0, 'New distribution exports require a separate model-parity review');
const distributions = JSON.parse(read('distributions.json'));
assert.equal(distributions.researchSourceCommit, sources.archivedSupplementalSource.researchSourceCommit);
assert.equal(distributions.sourceVersion, sources.archivedSupplementalSource.version);
for (const figure of distributions.figures) {
  assert.equal(figure.includedInCurrentManuscript, figure.id === 'baseline');
  assert.equal(figure.source.researchSourceCommit, distributions.researchSourceCommit);
  if (figure.id !== 'baseline') assert.match(figure.releaseNote, /Not included in the October paper or online appendix/);
}

// When the research checkout is available, verify the public table snapshots
// against their pinned Git release, independent of its current working branch.
const research = path.resolve('../informationExperimentEquilibrium');
if (existsSync(path.join(research, '.git'))) {
  for (const source of sources.sources.filter(item => item.asset?.startsWith('assets/sources/'))) {
    const pinned = execFileSync('git', ['-C', research, 'show', `${source.researchSourceCommit ?? sources.researchSourceCommit}:${source.source}`]);
    assert.equal(createHash('sha256').update(pinned).digest('hex'), source.sha256, source.source);
    assert.deepEqual(pinned, readFileSync(path.join('dist', source.asset)));
  }
  for (const figure of distributions.figures) {
    const pinned = execFileSync('git', ['-C', research, 'show', `${figure.source.researchSourceCommit}:${figure.source.path}`]);
    assert.equal(createHash('sha256').update(pinned).digest('hex'), figure.source.sha256, figure.source.path);
  }
  console.log('PASS: policy source tables and archived figures match their pinned research releases.');
}
console.log('PASS: policy values match the current main table or identified archive; defaults, release links, and archive labels agree.');
