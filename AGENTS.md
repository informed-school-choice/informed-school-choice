# Website repository

- This repository contains only the public paper website and its publication tools. Keep manuscript source, raw family records, numerical checkpoints, and private model exports in the research repository.
- Everything in `dist/` is public when GitHub Pages deploys. Do not add precise household locations, family identifiers, or unmatched treatment/location pairs.
- The map's residential cells are aggregates. `dist/family-choices.json` stays inactive until the fitted model inputs and probability parity are verified.
- Keep policy scenarios tied to the manuscript; never invent a numerical projection to fill a missing export.
- Publish the static `dist/` directory from `main` through GitHub Pages. The website source and deployed site are public; keep private research materials in the separate paper repository.
- Run `npm test` after edits to the public site. Keep any output, logs, and release records in the durable, ignored `output/` directory.
