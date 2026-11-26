# Direction review

19 passenger lines; 25 directed call sequences checked against freshly retrieved GTAMap transit data.

12 directions explicitly carry cw/acw labels (MT, AR, 1618, SL, CL and HL). The other 13 have a listed order but no explicit cw/acw label. No reverse services or alphabetic ordering were inferred.



Source: https://gtamap.io/data/transit/gta6.json?v=ae10a7b6

SHA-256: ae10a7b6ba5881c8ce0687750c74dc8c47787dbb96e0da408d29a2de6884b408



All 25 imported sequences match the source, including consecutive-duplicate normalization and explicit loop closure. Ordered calls can be mapped to one traversal of their source path; retraced/shared corridors make geometry alone ambiguous. This checks source consistency, not independent accuracy in the game.



16/18 — user observation:

Catalan Blvd, Bayside (Stop P) → Catalan Blvd, Bayside (Stop S), northbound, was reported from the game. It matches the cw call sequence. Q → O is listed in the opposite direction but has not been separately observed here. P and S are absent from 1618 ccw; Q and O are absent from 1618 cw. 15 distinct stops belong only to cw, 15 only to ccw, and 6 are shared. Stop letters are identifiers, not a sequence to sort.



DISPLAY ISSUES FIXED:

Selecting a line from a one-direction-only stop now chooses a direction serving that stop. Geographic line detail now offers direction selection, filters paths and stops to it, draws arrows along the ordered path and shows the selected stop's previous/next call. The underlying route graph did not require reversal for the reported P → S segment.



The complete per-pattern table is in [direction-audit.txt](../public/direction-audit.txt).
