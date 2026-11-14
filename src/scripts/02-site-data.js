(function(){
  var status=document.getElementById('site-data-status');
  var cacheKey='omnibioai-site-data-v1';
  function apply(data,state){
    if(!data||!data.catalogs)return false;
    Object.keys(data.catalogs).forEach(function(key){
      document.querySelectorAll('[data-site-stat="'+key+'"]')
        .forEach(function(el){el.textContent=String(data.catalogs[key])});
    });
    if(status){
      var date=data.updated_at?' · updated '+data.updated_at:'';
      status.textContent=(state==='cache'?'Catalog data from cache':'Catalog data live')+date;
      status.setAttribute('data-state',state);
    }
    return true;
  }
  function readCache(){
    try{return JSON.parse(localStorage.getItem(cacheKey)||'null')}catch(e){return null}
  }
  var cached=readCache();
  if(cached)apply(cached,'cache');
  var controller=window.AbortController?new AbortController():null;
  var timer=controller?setTimeout(function(){controller.abort()},5000):null;
  fetch('data/site-data.json',{cache:'no-cache',signal:controller&&controller.signal})
    .then(function(r){if(!r.ok)throw new Error('catalog data unavailable');return r.json()})
    .then(function(data){
      if(!apply(data,'live'))throw new Error('invalid catalog data');
      try{localStorage.setItem(cacheKey,JSON.stringify(data))}catch(e){}
    })
    .catch(function(){
      if(status&&!cached){status.textContent='Catalog data unavailable · showing built-in values';status.setAttribute('data-state','error')}
    })
    .finally(function(){if(timer)clearTimeout(timer)});
})();
