/* Keep catalog figures data-driven while retaining the server-rendered values
   as an offline fallback. The JSON is one versioned source for all mirrored
   counts on this page. */
(function(){
  var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sections=document.querySelectorAll('section');
  if(reduceMotion||!('IntersectionObserver' in window)){
    Array.prototype.forEach.call(sections,function(section){section.classList.add('is-visible')});
    return;
  }
  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting)return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },{threshold:0.12,rootMargin:'0px 0px -8%'});
  Array.prototype.forEach.call(sections,function(section){
    section.classList.add('reveal-on-scroll');
    observer.observe(section);
  });
})();
