(function(){
  var nav=document.querySelector('nav');
  var toggle=document.getElementById('nav-toggle');
  var more=document.getElementById('nav-more');
  var moreBtn=document.getElementById('nav-more-btn');
  function setMenu(open){nav.classList.toggle('open',open);toggle.setAttribute('aria-expanded',open);toggle.setAttribute('aria-label',open?'Close menu':'Open menu')}
  function setMore(open){more.classList.toggle('open',open);moreBtn.setAttribute('aria-expanded',open)}
  toggle.addEventListener('click',function(){setMenu(!nav.classList.contains('open'))});
  moreBtn.addEventListener('click',function(){setMore(!more.classList.contains('open'))});
  document.getElementById('nav-links').addEventListener('click',function(e){if(e.target.closest('a')){setMenu(false);setMore(false)}});
  document.addEventListener('click',function(e){if(!more.contains(e.target))setMore(false);if(!nav.contains(e.target))setMenu(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){setMore(false);setMenu(false)}});
})();
