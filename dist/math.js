'use strict';
// Treatment utility is transcribed from SchoolChoiceModel2.tex, equation eq:treated_utility.
// The choice fraction expands the paper's conditional logit; its a index denotes C/T.
window.PaperMath = (() => {
 const equations = {
  treatment: {
   tex: String.raw`V_{ij}^T = \kappa_k \cdot V_{ij}^C + \psi_k^q\, q_j + \psi_k^{op}\, \text{op}_{ij} + \psi_k^d\, d_{ij}`,
   compact: String.raw`\begin{aligned} V_{ij}^T &= \kappa_k \cdot V_{ij}^C \\ &\quad + \psi_k^q\, q_j \\ &\quad + \psi_k^{op}\, \text{op}_{ij} + \psi_k^d\, d_{ij} \end{aligned}`
  },
  choice: {
   tex: String.raw`s_j^{\text{loc},k,a} = \int \frac{\exp\!\left(V_{ij}^{a}(z)\right)}{\sum_{\ell\in\mathcal{J}_m}\exp\!\left(V_{i\ell}^{a}(z)\right)}\,d\Phi(z)`,
   compact: String.raw`\begin{aligned} s_j^{\text{loc},k,a} &= \\ &\hspace{-1.5em}\int \frac{\exp\!\left(V_{ij}^{a}(z)\right)}{\sum_{\ell\in\mathcal{J}_m}\exp\!\left(V_{i\ell}^{a}(z)\right)}\,d\Phi(z) \end{aligned}`
  }
 };
 const render = (tex, displayMode) => katex.renderToString(tex, {
  displayMode, output:'htmlAndMathml', throwOnError:true, strict:'error', trust:false
 });
 return {
  equations,
  inline: tex => render(tex, false),
  block: name => {
   const equation=equations[name];
   if(!equation)throw new Error('Unknown paper equation: '+name);
   return '<div class="paper-math" data-equation="'+name+'"><div class="math-wide">'+render(equation.tex,true)+'</div><div class="math-compact">'+render(equation.compact,true)+'</div></div>';
  }
 };
})();
