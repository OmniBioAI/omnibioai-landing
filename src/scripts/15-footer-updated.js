(function(){
  var el=document.getElementById('footer-updated');
  if(!el)return;
  fetch('https://api.github.com/repos/OmniBioAI/omnibioai-landing/commits/main')
    .then(function(r){if(!r.ok)throw new Error('bad status');return r.json()})
    .then(function(commit){
      var dateStr=commit&&commit.commit&&commit.commit.committer&&commit.commit.committer.date;
      if(!dateStr)return;
      var d=new Date(dateStr);
      el.textContent='Last updated '+d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    })
    .catch(function(){});
})();
