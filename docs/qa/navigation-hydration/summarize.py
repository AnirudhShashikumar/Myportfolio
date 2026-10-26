"""Summarize recorded evidence; never infer a pass from a missing result."""
import hashlib
import json
import subprocess
from pathlib import Path

root = Path('docs/qa/navigation-hydration')
read = lambda name: json.loads((root / name).read_text())


def cls(entries):
    maximum = total = 0
    start = previous = None
    for entry in sorted((e for e in entries if not e['recentInput']), key=lambda e: e['time']):
        if start is None or entry['time'] - previous > 1000 or entry['time'] - start > 5000:
            start, total = entry['time'], 0
        total += entry['value']
        previous = entry['time']
        maximum = max(maximum, total)
    return maximum


comparison = []
for phase in ['before', 'after']:
    data = read(f'{phase}/anchors.json')
    for fragment in ['', '#work', '#about', '#contact']:
        for action in ['navigate', 'refresh']:
            rows = [r for r in data if r['hash'] == fragment and r['action'] == action]
            assert len(rows) == 3
            js = [[x for x in r['resources'] if '/_next/static/' in x['url'] and x['url'].split('?')[0].endswith('.js')] for r in rows]
            comparison.append(dict(phase=phase, fragment=fragment or '/', action=action,
                                   cls=[cls(r['shifts']) for r in rows],
                                   encodedJavaScriptBodyBytes=[sum(x['encodedBody'] for x in files) for files in js],
                                   javaScriptRequests=[len(files) for files in js],
                                   finalHeights=[r['final']['height'] for r in rows],
                                   finalLandingErrors=[r['final']['error'] for r in rows],
                                   errors=[r['errors'] for r in rows]))
(root / 'comparison.json').write_text(json.dumps(comparison, indent=2) + '\n')

hashes = read('before/source-hashes.json')
changed = [name for name, digest in hashes.items() if hashlib.sha256(Path(name).read_bytes()).hexdigest() != digest]
assert set(changed) == {'src/components/system/SmoothScroll.tsx', 'src/components/system/ScrollMotion.tsx'}
git = lambda *args: subprocess.check_output(['git', *args], text=True).strip()
start = (root / 'before/git-head.txt').read_text().strip()
final_head = git('rev-parse', 'HEAD')
subprocess.run(['git', 'merge-base', '--is-ancestor', start, final_head], check=True)
assert git('diff', '--cached', '--name-only') == (root / 'before/index-paths.txt').read_text().strip()
fonts_before = json.loads(Path('docs/qa/performance-f10-f12/after/font-comparison.json').read_text())['hashes']
fonts_after = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in Path('.next/static/media').glob('*.woff2')}
assert fonts_before == fonts_after
shared_history = git('log', '--format=%H %s', f'{start}..{final_head}').splitlines()
preserved = dict(startHead=start, observedFinalHead=final_head, sharedHeadAdvanced=final_head != start,
                 startRemainsAncestor=True, observedInterveningSharedCommits=shared_history,
                 gitMutationCommandsPerformedByThisAgent=False, startingFileCount=len(hashes),
                 changedStartingFiles=changed, unchangedStartingFileCount=len(hashes) - len(changed),
                 indexUnchanged=True, fontFileCount=len(fonts_after), fontHashesIdentical=True,
                 dependencyFilesUnchanged=True, assetAndGraphicsSourcesUnchanged=True)
(root / 'after/preservation.json').write_text(json.dumps(preserved, indent=2) + '\n')
(root / 'after/font-comparison.json').write_text(json.dumps(dict(allIdentical=True, fileCount=len(fonts_after), hashes=fonts_after), indent=2) + '\n')

history = read('after/history/results.json')
assert len(history) == 9
assert all(len(r['cases']) == 24 and not r['errors'] for r in history)
details = read('after/history-details.json')
assert len(details) == 24
bookmarks = read('after/reader-bookmarks.json')
assert len(bookmarks) == 8
assert all(r['after']['commands'] == [] for r in bookmarks)
before_rapid, after_rapid = [read(f'{phase}/rapid-history.json') for phase in ['before', 'after']]
assert len(before_rapid) == len(after_rapid) == 3
assert not any(r['accurate'] for r in before_rapid)
assert all(r['accurate'] for r in after_rapid)
commands = read('after/regression/commands.json')
assert len(commands) == 13 and all(r['exitCode'] == 0 for r in commands)
summary = dict(rapidBeforeFailures=sum(not r['accurate'] for r in before_rapid), rapidAfterFailures=sum(not r['accurate'] for r in after_rapid),
               historyProfiles=len(history), rapidTraversals=sum(len(r['cases']) for r in history),
               historySamples=sum(len(c['frames']) for r in history for c in r['cases']),
               continuousTraversalCases=2 * len(details),
               continuousPostPopstateFrames=sum(sum(f['phase'] == phase and f['time'] >= next(e['time'] for e in row['events'] if e['name'] == 'popstate' and e['phase'] == phase and e['when'] == 'before-owner') for f in row['frames']) for row in details for phase in ['back', 'forward']),
               deepHistoryCases=len(bookmarks), regressionSuites=len(commands),
               settledNavigationLandings=sum(len(r['states']) for r in read('after/navigation/results.json')),
               compositorProfiles=len(read('after/paint/results.json')))
(root / 'after/summary.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps(summary, indent=2))
