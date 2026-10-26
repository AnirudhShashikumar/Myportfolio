import collections
import gzip
import json
import sys
from pathlib import Path

for relative in sys.argv[1:] or ['before/mobile-stacks', 'after']:
    root = Path('docs/qa/direct-anchor-performance') / relative
    profile = json.loads((root / 'mobile-cpu.json').read_text())
    nodes = {n['id']: n for n in profile['nodes']}
    parents = {kid: n['id'] for n in profile['nodes'] for kid in n.get('children', [])}
    events = json.load(gzip.open(root / 'mobile-trace.json.gz'))['traceEvents']
    main = next(e for e in events if e['name'] == 'thread_name' and e['args'].get('name') == 'CrRendererMain')
    main_events = [e for e in events if e.get('ph') == 'X' and e['pid'] == main['pid'] and e['tid'] == main['tid']]
    time = profile['startTime']
    samples = []
    for node, delta in zip(profile['samples'], profile['timeDeltas']):
        time += delta
        samples.append((time, node, delta))
    result = []
    for task in main_events:
        if task['name'] != 'RunTask' or task.get('dur', 0) < 50000:
            continue
        counter = collections.Counter()
        stacks = collections.Counter()
        for at, node, delta in samples:
            if task['ts'] <= at < task['ts'] + task['dur']:
                counter[node] += delta
                chain = []
                while node in nodes:
                    frame = nodes[node]['callFrame']
                    chain.append((frame['functionName'], frame['url'], frame['columnNumber']))
                    node = parents.get(node)
                stacks[tuple(chain[:16])] += delta
        nested = [e for e in main_events if task['ts'] <= e['ts'] < task['ts'] + task['dur']]
        result.append({
            'traceStartUs': task['ts'], 'durationMs': task['dur'] / 1000,
            'inclusiveCategoriesMs': {name: sum(e.get('dur', 0) / 1000 for e in nested if e['name'] == name) for name in ['EvaluateScript', 'FunctionCall', 'Layout', 'UpdateLayoutTree']},
            'evaluations': [e.get('args', {}).get('data') for e in nested if e['name'] == 'EvaluateScript'],
            'topSelfSamples': [{'ms': round(count / 1000, 2), 'frame': nodes[node]['callFrame']} for node, count in counter.most_common(8)],
            'topStacks': [{'selfMs': round(value / 1000, 2), 'leafToRoot': list(key)} for key, value in stacks.most_common(5)],
        })
    (root / 'analysis.json').write_text(json.dumps(result, indent=2) + '\n')
    print(relative, [(round(r['durationMs'], 1), r['inclusiveCategoriesMs']) for r in result])
