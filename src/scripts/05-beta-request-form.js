function handleSubmit(e){
  e.preventDefault();
  if(!document.getElementById('platform-value').value){
    document.getElementById('platform-error').style.display='block';return;
  }
  var btn=document.getElementById('submit-btn');
  var errEl=document.getElementById('submit-error');
  btn.disabled=true;btn.textContent='Sending...';
  errEl.style.display='none';
  var payload={
    first_name:document.getElementById('first-name').value.trim(),
    last_name:document.getElementById('last-name').value.trim(),
    email:document.getElementById('email').value.trim(),
    institution:document.getElementById('institution').value.trim(),
    role:document.getElementById('role').value,
    platform:document.getElementById('platform-value').value,
    use_case:document.getElementById('use-case').value,
    research:document.getElementById('research').value.trim()
  };
  fetch('https://beta-requests.mandecent-gupta.workers.dev/submit',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  }).then(function(r){
    if(!r.ok) throw new Error('HTTP '+r.status);
    btn.textContent='✓ Submitted';
    e.target.reset();
    document.querySelectorAll('.platform-card').forEach(c=>{c.classList.remove('selected');c.setAttribute('aria-checked','false')});
    document.getElementById('platform-value').value='';
    var t=document.getElementById('toast');
    t.classList.add('show');
    setTimeout(function(){t.classList.remove('show')},3000);
  }).catch(function(){
    btn.disabled=false;btn.textContent='Submit Request';
    errEl.style.display='block';
  });
}
