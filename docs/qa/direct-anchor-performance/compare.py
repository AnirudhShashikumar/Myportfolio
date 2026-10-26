import collections
import json
import statistics
from pathlib import Path

root = Path('docs/qa/direct-anchor-performance')

def distribution(values):
    return {'values': values, 'median': statistics.median(values), 'min': min(values), 'max': max(values)}

def cls(shifts):
    maximum = total = 0
    first = previous = None
    for entry in shifts:
        if entry['recentInput']:
            continue
        time = entry['time']
        if first is None or time - previous > 1000 or time - first > 5000:
            total = 0
            first = time
        total += entry['value']
        previous = time
        maximum = max(maximum, total)
    return maximum

comparison = {}
for phase in ['before', 'after']:
    runs = json.loads((root / phase / 'anchors.json').read_text())
    groups = collections.defaultdict(list)
    for run in runs:
        groups[f"{run['profile']}:{run['hash'] or '/'}:{run['navigation']['type']}"].append(run)
    summary = {}
    for name, values in groups.items():
        metrics = collections.defaultdict(list)
        for run in values:
            final = run['final']
            target = min(max(0, final['targetTop'] - final['margin']), final['height'] - (844 if run['profile'] == 'mobile' else 900))
            js = [r for r in run['resources'] if r['url'].split('?')[0].endswith('.js')]
            for key, value in {
                'cls': cls(run['shifts']),
                'shiftEntries': len([s for s in run['shifts'] if not s['recentInput']]),
                'landingErrorPx': abs(final['y'] - target),
                'documentHeightPx': final['height'],
                'longTasks': len(run['tasks']),
                'maximumTaskMs': max([t['duration'] for t in run['tasks']], default=0),
                'totalLongTaskMs': sum(t['duration'] for t in run['tasks']),
                'jsEncodedBodyBytes': sum(r['encodedBody'] for r in js),
                'jsRequests': len(js),
                'lcpCandidateMs': run['lcp'][-1]['time'] if run['lcp'] else 0,
                'firstWebGLDrawMs': run['draw'] or 0,
                'ttfbMs': run['navigation']['responseStart'] - run['navigation']['requestStart'],
            }.items():
                metrics[key].append(value)
        summary[name] = {key: distribution(v) for key, v in metrics.items()}
    life = json.loads((root / phase / 'lifecycle.json').read_text())
    comparison[phase] = {'startup': summary, 'frameSweeps': life['scroll'], 'graphicsActivity': life['activity'], 'memoryCycles': life['memory']}
assert comparison['before']['startup'].keys() == comparison['after']['startup'].keys()
(root / 'comparison.json').write_text(json.dumps(comparison, indent=2) + '\n')
for name in comparison['before']['startup']:
    print(name)
    for key in ['cls', 'longTasks', 'maximumTaskMs', 'jsEncodedBodyBytes', 'firstWebGLDrawMs', 'lcpCandidateMs', 'landingErrorPx']:
        a, b = [comparison[p]['startup'][name][key] for p in ['before', 'after']]
        print(f"  {key}: {a['values']} -> {b['values']} (medians {a['median']:.2f} -> {b['median']:.2f})")
