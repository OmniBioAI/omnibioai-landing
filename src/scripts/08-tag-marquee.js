(function(){
  var track=document.getElementById('tag-marquee-track');
  if(!track)return;
  var names=Array.prototype.map.call(document.querySelectorAll('#enterprise-integrations .int-name'),function(el){
    return el.textContent.replace(/\s+/g,' ').trim();
  }).filter(Boolean);
  if(!names.length)return;
  var frag=document.createDocumentFragment();
  names.concat(names).forEach(function(name){
    var span=document.createElement('span');
    span.className='marquee-tag';
    span.textContent=name;
    frag.appendChild(span);
  });
  track.appendChild(frag);
  track.style.animationDuration=Math.max(24,names.length*0.9)+'s';
  var marquee=track.parentElement;
  function pause(){track.style.animationPlayState='paused'}
  function resume(){track.style.animationPlayState=''}
  marquee.addEventListener('focusin',pause);
  marquee.addEventListener('focusout',resume);
})();
