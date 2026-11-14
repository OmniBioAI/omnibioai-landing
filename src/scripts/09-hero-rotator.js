(function(){
  var el=document.getElementById('hero-rotator');
  if(!el)return;
  var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion)return;
  var phrases=['multi-omics research','single-cell omics','proteomics & mass spec','variant interpretation','drug target discovery'];
  var i=0;
  setInterval(function(){
    el.classList.add('fade');
    setTimeout(function(){
      i=(i+1)%phrases.length;
      el.textContent=phrases[i];
      el.classList.remove('fade');
    },320);
  },3600);
})();
