(function(){
  function setTarget(key,value){
    if(value==null||value==='')return;
    document.querySelectorAll('[data-sync-target="'+key+'"]').forEach(function(el){
      el.textContent=value;
    });
  }
  // Organisms: count the real genome table rows instead of hand-typing the
  // number a second time -- same "derive from the DOM, don't duplicate"
  // approach as the integration/database counts.
  var genomeRows=document.querySelectorAll('#genomes .genomes-table tbody tr');
  if(genomeRows.length)setTarget('organisms',genomeRows.length);
  // API routes: catalogs' tile is the source (has the fuller "8 services /
  // 109 documented" context); architecture's tile mirrors it.
  var apiRoutesSource=document.querySelector('[data-sync-source="api-routes"]');
  if(apiRoutesSource)setTarget('api-routes',apiRoutesSource.textContent.trim());
  // Literature indexes: read the RAG stat's data-value, not its live text --
  // that span is still being animated (count-up) by an earlier script when
  // this runs, so its textContent is mid-animation, not the final number.
  var litSource=document.querySelector('[data-sync-source="literature-indexes"]');
  if(litSource)setTarget('literature-indexes',litSource.getAttribute('data-value'));
  // Reference database count: the reference-databases section already
  // computes its own total live, from its actual card count (see the
  // syncCounts IIFE above, which runs before this one) -- catalogs' tile
  // mirrors that instead of carrying an independent hardcoded 129.
  var refDbSource=document.querySelector('#reference-databases .int-total strong');
  if(refDbSource)setTarget('reference-db-count',refDbSource.textContent.trim());
})();
