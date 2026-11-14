(function(){
  function syncCounts(sectionId){
    var section=document.getElementById(sectionId);
    if(!section)return;
    var groups=Array.prototype.slice.call(section.querySelectorAll('.int-group'));
    var total=0;
    groups.forEach(function(group){
      var n=group.querySelectorAll('.int-grid > .int-card').length;
      total+=n;
      var countEl=group.querySelector('.int-group-count');
      if(countEl)countEl.textContent=n;
      var key=group.getAttribute('data-group');
      var filterSpan=section.querySelector('.int-filter[data-group="'+key+'"] span');
      if(filterSpan)filterSpan.textContent=n;
    });
    var allSpan=section.querySelector('.int-filter[data-group="all"] span');
    if(allSpan)allSpan.textContent=total;
    var strongs=section.querySelectorAll('.int-total strong');
    if(strongs[0])strongs[0].textContent=total;
    if(strongs[1])strongs[1].textContent=groups.length;
    return{total:total,cards:section.querySelectorAll('.int-card')};
  }
  syncCounts('enterprise-integrations');
  var dbResult=syncCounts('reference-databases');
  if(dbResult){
    var scaffoldCount=0,licenceCount=0;
    dbResult.cards.forEach(function(card){
      if(!card.classList.contains('int-card-scaffold'))return;
      var tag=card.querySelector('.int-tag');
      var label=tag?tag.textContent.trim().toLowerCase():'';
      if(label==='licence required')licenceCount++;
      else if(label==='scaffold')scaffoldCount++;
    });
    var implementedCount=dbResult.total-scaffoldCount-licenceCount;
    var totalEl=document.querySelector('#reference-databases .int-total');
    if(totalEl){
      var breakdown=implementedCount+' implemented · '+licenceCount+' licence-required · '+scaffoldCount+' scaffolded';
      var lastStrong=totalEl.querySelectorAll('strong')[1];
      if(lastStrong&&lastStrong.nextSibling){
        lastStrong.nextSibling.textContent=' categories · '+breakdown;
      }
    }
  }
})();
