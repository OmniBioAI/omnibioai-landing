(function(){
  var wrap=document.getElementById('live-ecosystem-stats');
  var elLines=document.getElementById('live-stat-lines');
  var elRepos=document.getElementById('live-stat-repos');
  var elCoverage=document.getElementById('live-stat-coverage');
  if(!wrap||!elLines||!elRepos||!elCoverage)return;
  var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animateNumber(el,target,format,duration){
    function markUpdated(){
      el.classList.remove('updated');
      void el.offsetWidth;
      el.classList.add('updated');
    }
    if(reduceMotion){el.textContent=format(target);markUpdated();return}
    var start=null;
    function step(ts){
      if(!start)start=ts;
      var p=Math.min(1,(ts-start)/duration);
      var eased=1-Math.pow(1-p,3);
      el.textContent=format(target*eased);
      if(p<1)requestAnimationFrame(step);else markUpdated();
    }
    requestAnimationFrame(step);
  }
  fetch('https://control.omnibioai.org/report/public-stats')
    .then(function(r){if(!r.ok)throw new Error('bad status');return r.json()})
    .then(function(data){
      if(typeof data.total_lines!=='number'||typeof data.repos_measured!=='number'||typeof data.ecosystem_coverage_percent!=='number')return;
      wrap.hidden=false;
      animateNumber(elLines,data.total_lines,function(v){return (v/1e6).toFixed(1)+'M+'},1200);
      animateNumber(elRepos,data.repos_measured,function(v){return Math.round(v).toString()},900);
      animateNumber(elCoverage,data.ecosystem_coverage_percent,function(v){return v.toFixed(1)+'%'},1200);
    })
    .catch(function(){});
})();
