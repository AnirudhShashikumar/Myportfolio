"""Summarize retained lab measurements; never substitute emitted size for transfer."""
from pathlib import Path
import csv
import heapq
import json
import statistics
from urllib.parse import urlparse

ROOT = Path('docs/qa/performance-f10-f12')


def read(path):
    return json.loads(path.read_text())


def covered_units(functions):
    ranges = [r for f in functions for r in f['ranges']]
    points = {}
    for index, entry in enumerate(ranges):
        points.setdefault(entry['startOffset'], [[], []])[0].append(index)
        points.setdefault(entry['endOffset'], [[], []])[1].append(index)
    active, heap, previous, used = set(), [], 0, 0
    for position, (starts, ends) in sorted(points.items()):
        while heap and heap[0][1] not in active:
            heapq.heappop(heap)
        if heap and heap[0][2] > 0:
            used += position - previous
        for index in ends:
            active.discard(index)
        for index in starts:
            active.add(index)
            entry = ranges[index]
            heapq.heappush(heap, (entry['endOffset'] - entry['startOffset'], index, entry['count']))
        previous = position
    return used


result = {}
for phase in ['before', 'after']:
    folder = ROOT / phase
    loads = read(folder / 'loads.json') + read(folder / 'capability.json')
    assert len(loads) == 15
    assert not any(run['errors'] for run in loads)
    with (folder/'resource-waterfall.csv').open('w', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=['profile','iteration','url','type','start','end','duration','encodedBodyBytes','decodedBodyBytes','transferBytes'])
        writer.writeheader()
        for run in loads:
            nav = run['navigation']
            writer.writerow({'profile':run['profile'],'iteration':run['iteration'],'url':nav['name'],'type':'document','start':nav['startTime'],'end':nav['responseEnd'],'duration':nav['responseEnd']-nav['startTime'],'encodedBodyBytes':nav['encodedBodySize'],'decodedBodyBytes':nav['decodedBodySize'],'transferBytes':nav['transferSize']})
            for resource in run['resources']:
                writer.writerow({'profile':run['profile'],'iteration':run['iteration'],**resource})
    rows = []
    for profile in sorted({r['profile'] for r in loads}):
        runs = [r for r in loads if r['profile'] == profile]
        metrics = []
        for run in runs:
            # Include preloaded JavaScript with initiatorType=link (webpack runtime).
            scripts = [r for r in run['resources'] if urlparse(r['url']).path.endswith('.js')]
            tasks = run['metrics']['tasks']
            nav = run['navigation']
            metrics.append({
                'scriptRequests': len(scripts),
                'scriptEncodedBodyBytes': sum(r['encodedBodyBytes'] for r in scripts),
                'scriptDecodedBodyBytes': sum(r['decodedBodyBytes'] for r in scripts),
                'scriptTransferBytes': sum(r['transferBytes'] for r in scripts),
                'cdpScriptWireBytes': sum(r['wireBytes'] for r in run['network'] if r['type'] == 'Script'),
                'scriptMilliseconds': run['cdpMetrics']['ScriptDuration'] * 1000,
                'taskMilliseconds': run['cdpMetrics']['TaskDuration'] * 1000,
                'longTaskCount': len(tasks), 'longTaskMilliseconds': sum(t['duration'] for t in tasks),
                'maxLongTaskMilliseconds': max([t['duration'] for t in tasks], default=0),
                'lcpCandidateMilliseconds': run['metrics']['lcp'][-1]['time'] if run['metrics']['lcp'] else None,
                'initialCLS': sum(e['value'] for e in run['metrics']['shifts'] if not e['recentInput']),
                'firstDrawMilliseconds': run['metrics']['firstDraw'],
                'contextCount': len(run['metrics']['contexts']),
                'contextCreationMilliseconds': sum(e['end']-e['start'] for e in run['metrics']['contexts']),
                'heapUsedBytes': run['heap']['usedSize'],
                'loadMilliseconds': nav['loadEventEnd'], 'ttfbMilliseconds': nav['responseStart']-nav['requestStart'],
                'imageEncodedBodyBytes': sum(r['encodedBodyBytes'] for r in run['resources'] if r['type'] == 'img'),
                'fontEncodedBodyBytes': sum(r['encodedBodyBytes'] for r in run['resources'] if '.woff2' in r['url']),
                'errorCount': len(run['errors']),
            })
        median = {k: statistics.median([r[k] for r in metrics]) if all(r[k] is not None for r in metrics) else None for k in metrics[0]}
        rows.append({'profile':profile,'runs':metrics,'median':median})
    execution = []
    for name in ['desktop-home', 'mobile-home', 'desktop-no-webgl']:
        data = read(folder / (name + '-coverage.json'))
        parsed = {e['scriptId']:e for e in data['parsedScripts']}
        scripts = [{'url':entry['url'],'kind':'static' if '/_next/static/' in entry['url'] else 'inline document','parsedUTF16Units':parsed.get(entry['scriptId'],{}).get('length',0),'coveredUTF16Units':covered_units(entry['functions'])} for entry in data['coverage'] if entry['url'].startswith('http://127.0.0.1:3001/')]
        summary = {'profile':name,'units':'V8 UTF-16 source offsets; covered ranges are not CPU time, transferred bytes or a removal budget','scripts':scripts,'parsedUTF16Units':sum(e['parsedUTF16Units'] for e in scripts),'coveredUTF16Units':sum(e['coveredUTF16Units'] for e in scripts)}
        (folder / (name + '-execution-summary.json')).write_text(json.dumps(summary,indent=2)+'\n')
        execution.append(summary)
    result[phase] = {'profiles':rows,'execution':execution,'lifecycle':read(folder/'lifecycle.json')}
result['deltas'] = []
for before, after in zip(result['before']['profiles'],result['after']['profiles']):
    assert before['profile'] == after['profile']
    result['deltas'].append({'profile':before['profile'], 'afterMinusBefore':{k:after['median'][k]-v if v is not None and after['median'][k] is not None else None for k,v in before['median'].items()}})
(ROOT/'comparison.json').write_text(json.dumps(result,indent=2)+'\n')
after_buffers = [sample['allocations']['createBuffer'] for sample in result['after']['lifecycle']['memory']]
assert len(after_buffers) == 5 and len(set(after_buffers)) == 1
print('Saved comparison.json with run distributions and medians; diagnostic traces kept separate.')
