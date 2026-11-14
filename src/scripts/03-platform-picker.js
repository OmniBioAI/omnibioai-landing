function selectPlatform(p){
  document.querySelectorAll('.platform-card').forEach(c=>{c.classList.remove('selected');c.setAttribute('aria-checked','false')});
  var el=document.getElementById('platform-'+p);
  if(el){el.classList.add('selected');el.setAttribute('aria-checked','true');document.getElementById('platform-value').value=p;document.getElementById('platform-error').style.display='none'}
}
function platformKey(e,p){
  if(e.key==='Enter'||e.key===' '){e.preventDefault();selectPlatform(p)}
}
