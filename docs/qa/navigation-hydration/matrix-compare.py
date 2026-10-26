import json
from pathlib import Path

old = Path('docs/qa/direct-anchor-performance/after/regression/production')
new = Path('docs/qa/navigation-hydration/after/regression/production')
results = []
for engine in ['chrome', 'webkit']:
    a, b = [json.loads((root / f'matrix-{engine}.json').read_text()) for root in [old, new]]
    issues = []
    assert len(a['viewports']) == len(b['viewports'])
    states = 0
    errors = failures = overflows = horizontal = scrub = broken = 0
    for left, right in zip(a['viewports'], b['viewports']):
        size = [right['width'], right['height']]
        assert [left['width'], left['height']] == size
        if len(left['samples']) != len(right['samples']):
            issues.append([size, 'sample-count'])
            continue
        states += len(right['samples'])
        errors += len(right['errors'])
        failures += len(right['failed'])
        broken += sum(1 for image in right['images'] if image['complete'] and not image['naturalWidth'])
        for i, (x, y) in enumerate(zip(left['samples'], right['samples'])):
            for key in ['region', 'height', 'triggerCount', 'aboutMode']:
                if x.get(key) != y.get(key):
                    issues.append([size, i, key, x.get(key), y.get(key)])
            if abs(x['y'] - y['y']) > 1:
                issues.append([size, i, 'scrollY', x['y'], y['y']])
            overflows += bool(y['overflow'])
            horizontal += len(y['horizontal'])
            scrub += len(y['mismatches'])
    row = dict(engine=engine, viewports=len(b['viewports']), states=states, geometryDifferences=issues, pageErrors=errors, failedRequests=failures, documentOverflows=overflows, horizontalTextCandidates=horizontal, scrubMismatches=scrub, loadedBrokenImages=broken)
    results.append(row)
    print(row)
    assert not any([issues, errors, failures, overflows, horizontal, scrub, broken])
Path('docs/qa/navigation-hydration/after/matrix-comparison.json').write_text(json.dumps(results, indent=2) + '\n')
