(function(){
  var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function parseStat(text){
    var m=text.trim().match(/^([\d,]*\.?\d+)([A-Za-z%]*)(\+)?$/);
    if(!m)return null;
    var raw=m[1];
    var hasComma=raw.indexOf(',')!==-1;
    var decMatch=raw.match(/\.(\d+)$/);
    var decimals=decMatch?decMatch[1].length:0;
    var value=parseFloat(raw.replace(/,/g,''));
    if(isNaN(value))return null;
    return{value:value,decimals:decimals,suffix:m[2]||'',plus:!!m[3],hasComma:hasComma};
  }
  function formatStat(current,info){
    var num=info.decimals>0?current.toFixed(info.decimals):String(Math.round(current));
    if(info.hasComma){
      var parts=num.split('.');
      parts[0]=parseInt(parts[0],10).toLocaleString('en-US');
      num=parts.join('.');
    }
    return num+info.suffix+(info.plus?'+':'');
  }
  function animateStat(el,info,delay){
    var duration=1200,start=null;
    setTimeout(function(){
      function step(ts){
        if(!start)start=ts;
        var p=Math.min(1,(ts-start)/duration);
        var eased=1-Math.pow(1-p,3);
        el.textContent=formatStat(info.value*eased,info);
        if(p<1)requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    },delay);
  }
  var groups=document.querySelectorAll('.stats-row, .rag-stats-grid');
  groups.forEach(function(group){
    var items=Array.prototype.slice.call(group.querySelectorAll('.stat-num, .rag-stat-num'));
    var parsed=items.map(function(el){return{el:el,info:parseStat(el.textContent)}}).filter(function(x){return x.info});
    if(!parsed.length||reduceMotion)return;
    parsed.forEach(function(x){x.el.textContent=formatStat(0,x.info)});
    var done=false;
    var observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting&&!done){
          done=true;
          parsed.forEach(function(x,i){animateStat(x.el,x.info,i*80)});
          observer.unobserve(group);
        }
      });
    },{threshold:0.3});
    observer.observe(group);
  });
})();
