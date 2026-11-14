(function(){
  var badge=document.getElementById('gh-stars');
  var countEl=document.getElementById('gh-stars-count');
  if(!badge||!countEl)return;
  fetch('https://api.github.com/repos/OmniBioAI/omnibioai-studio')
    .then(function(r){if(!r.ok)throw new Error('bad status');return r.json()})
    .then(function(repo){
      if(typeof repo.stargazers_count!=='number')return;
      countEl.textContent=repo.stargazers_count.toLocaleString('en-US');
      badge.hidden=false;
    })
    .catch(function(){});
})();
