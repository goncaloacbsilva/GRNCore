# GRN Core Performance Report

Generated: 2026-08-17T13:08:44.770Z
Browser: chromium
Viewport: 1440x1000
Commit: a976c6d
Scenario timeout: 240000.00 ms

## Notes

| Benchmark   | Tier       | Format |      Timeout | Message                                                    |
| ----------- | ---------- | ------ | -----------: | ---------------------------------------------------------- |
| interaction | large      | n/a    | 240000.00 ms | Skipped after timeout: Scenario exceeded 240000ms timeout. |
| interaction | very-large | n/a    | 240000.00 ms | Skipped after timeout: Scenario exceeded 240000ms timeout. |
| interchange | very-large | bnet   | 240000.00 ms | Skipped after timeout: Scenario exceeded 240000ms timeout. |

## Interactive Latency

| Task               | Tier   | Nodes | Edges | Rules | Expression chars | Polarity issues |    Median |       P95 | Samples |
| ------------------ | ------ | ----: | ----: | ----: | ---------------: | --------------: | --------: | --------: | ------: |
| node-selection     | small  |    10 |    12 |     9 |               40 |               0 | 296.00 ms | 296.00 ms |       1 |
| node-repositioning | small  |    10 |    12 |     9 |               40 |               0 | 110.20 ms | 110.20 ms |       1 |
| edge-creation      | small  |    10 |    12 |     9 |               40 |               0 | 296.80 ms | 296.80 ms |       1 |
| canvas-panning     | small  |    10 |    12 |     9 |               40 |               0 |  63.30 ms |  63.30 ms |       1 |
| zooming            | small  |    10 |    12 |     9 |               40 |               0 |  48.70 ms |  48.70 ms |       1 |
| node-selection     | medium |   100 |   180 |    99 |              906 |               0 | 413.10 ms | 413.10 ms |       1 |
| node-repositioning | medium |   100 |   180 |    99 |              906 |               0 | 215.00 ms | 215.00 ms |       1 |
| edge-creation      | medium |   100 |   180 |    99 |              906 |               0 | 668.30 ms | 668.30 ms |       1 |
| canvas-panning     | medium |   100 |   180 |    99 |              906 |               0 |  89.60 ms |  89.60 ms |       1 |
| zooming            | medium |   100 |   180 |    99 |              906 |               0 | 245.70 ms | 245.70 ms |       1 |

## Import/Export

| Format | Tier       | Nodes | Edges | Rules | Expression chars | Polarity issues |      Size | Export Median | Import Median | Samples |
| ------ | ---------- | ----: | ----: | ----: | ---------------: | --------------: | --------: | ------------: | ------------: | ------: |
| bnet   | small      |    10 |    12 |     9 |               40 |               0 |     107 B |       0.10 ms |       2.20 ms |       1 |
| sbml   | small      |    10 |    12 |     9 |               40 |               0 |  13.6 KiB |       2.50 ms |       4.80 ms |       1 |
| ginml  | small      |    10 |    12 |     9 |               40 |               0 |   3.7 KiB |       1.40 ms |       3.80 ms |       1 |
| bnet   | medium     |   100 |   180 |    99 |              906 |               0 |   1.5 KiB |       0.20 ms |      25.30 ms |       1 |
| sbml   | medium     |   100 |   180 |    99 |              906 |               0 | 154.1 KiB |      12.50 ms |      22.40 ms |       1 |
| ginml  | medium     |   100 |   180 |    99 |              906 |               0 |  40.6 KiB |       3.30 ms |      17.50 ms |       1 |
| bnet   | large      |  1000 |  2400 |   999 |            16485 |               0 |  22.8 KiB |       0.50 ms |    8875.70 ms |       1 |
| sbml   | large      |  1000 |  2400 |   999 |            16485 |               0 |   1.7 MiB |     108.40 ms |     186.90 ms |       1 |
| ginml  | large      |  1000 |  2400 |   999 |            16485 |               0 | 498.4 KiB |      53.30 ms |     539.40 ms |       1 |
| sbml   | very-large | 10000 | 40000 |  9999 |           368897 |               0 |  23.2 MiB |    3439.40 ms |    7446.60 ms |       1 |
| ginml  | very-large | 10000 | 40000 |  9999 |           368897 |               0 |   7.3 MiB |    9357.70 ms |   92986.50 ms |       1 |

## History

| Step | History Depth |   Modify |      Undo |      Redo |     Heap |
| ---: | ------------: | -------: | --------: | --------: | -------: |
|    1 |             1 | 82.30 ms | 144.00 ms | 179.20 ms | 87.5 MiB |
|   10 |            10 | 47.10 ms | 174.40 ms | 145.40 ms | 87.5 MiB |
|   20 |            20 | 46.40 ms | 159.00 ms | 137.00 ms | 87.5 MiB |
|   30 |            30 | 48.30 ms | 174.60 ms | 145.50 ms | 87.5 MiB |
|   40 |            40 | 48.00 ms | 174.30 ms | 146.40 ms | 87.5 MiB |
|   50 |            50 | 58.80 ms | 174.40 ms | 128.00 ms | 87.5 MiB |
|   60 |            60 | 57.00 ms | 131.10 ms | 145.30 ms | 87.5 MiB |
|   70 |            70 | 44.70 ms | 165.80 ms | 145.60 ms | 87.5 MiB |
|   80 |            80 | 46.40 ms | 177.10 ms | 149.20 ms | 87.5 MiB |
|   90 |            90 | 61.70 ms | 167.50 ms | 137.50 ms | 87.5 MiB |
|  100 |           100 | 50.20 ms | 124.50 ms | 128.20 ms | 87.5 MiB |
|  105 |           100 | 43.70 ms | 182.30 ms | 136.80 ms | 87.5 MiB |
