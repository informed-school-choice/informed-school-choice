# Informed School Choice

Website for *Approximating the Equilibrium Effects of Informed School Choice* by Claudia Allende, Francisco Gallego, and Christopher Neilson.

Live site: https://school-choice-equilibrium-effects-information.org/

This is a fresh, website-only repository. `dist/` contains the public pages, scripts, styles, figures, papers, and aggregate data needed by the interactive website. The research code, private records, and numerical outputs remain in the separate research repository.

Run `npm run dev` and open http://127.0.0.1:4173 to preview locally. Run `npm test` to check public assets, source hashes, privacy boundaries, choice-probability invariants, and experimental-mixture identities. No dependency installation or build step is required.

GitHub Pages publishes `dist/` from the `main` branch. Both the website source and published site are public.

The map shows aggregated residential areas, not family homes or complete choice menus. Family-level choice probabilities remain unavailable until the matched fitted-model inputs are verified. The policy lab separates current-paper scenarios from clearly labeled archived September supplemental outputs; it does not run an equilibrium solver in the browser.

The representative-area choice interface requires an export with verified fitted-model parity, complete 2011 school menus, matched node geometry, and the restricted two-kappa treatment specification. The validator checks the export's declarations and probability sums; those declarations must be substantiated against the research model before publication. The current public cache is intentionally empty. A representative-area prediction does not need an observed participant-to-home link; the separate observed-family view remains inactive until that link is verified. Do not substitute the sampled destination schools in `markets.json` for complete model menus.

## Manuscript release and policy sources

The downloadable paper and online appendix are the finalized October 2026 release merged in paper PR #131. The source is pinned to commit `0803db2475ed08a49338f3208eb83fec238a50ed` (identical paper assets in merged master `f967f1ee0de91963f4f2c7545cc716652579c6b1`). The stable working-paper link is https://consiliumbots.github.io/working-papers-cb/AGN_2019/latest.pdf; the NBER record is https://doi.org/10.3386/w35837. `dist/sources.json` records document hashes and source provenance.

The full-take-up benchmark and +10% marginal-cost scenario use the current main capacity table. Partial take-up, targeting, and public-school response preserve archived September supplemental outputs from research commit `0b3f98a8eaa3bc68cad6840386a2a71611d9de1a`. Their source table remains in the research repository but is not included in the October paper or online appendix. Its full-take-up reference differs from the current main benchmark; cross-release differences are not isolated policy effects. Standard errors are shown only for matching main-table estimates.

Only the baseline experimental-sample density figure appears in the current paper. The demand, capacity, and school-response figures are archived September supplemental outputs, pinned by hashes and source commit in `dist/distributions.json`. Labels distinguish these from the current baseline and from population means. Population distributions and family predictions stay unavailable until verified exports exist.

`verify-policy-sources.mjs` checks scenario values and reported standard errors against pinned copies of the current main table and archived supplemental table, checks the default figures shown without JavaScript, and verifies the empty population-distribution version. These source-table copies contain only aggregate results. The archived table must not be described as part of the current paper or appendix.
