function filterIntegrations(section,group){
  section.querySelectorAll('.int-filter').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.group===group)});
  section.querySelectorAll('.int-group').forEach(function(g){g.hidden=group!=='all'&&g.dataset.group!==group});
}
document.querySelectorAll('.int-filter').forEach(function(b){b.addEventListener('click',function(){filterIntegrations(b.closest('section'),b.dataset.group)})});
