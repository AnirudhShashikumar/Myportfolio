# Rejected readiness-gate trial

This intermediate build moved the WebGL preflight into a viewport-readiness memo and conditionally mounted the dynamic graphics component. All three desktop first draws were later than baseline (493–527ms, compared with 383–400ms). It was replaced with a capability check inside the existing eager dynamic loader. These measurements are retained as trial evidence and are not the final after results. No timeline or visual layer was changed.
