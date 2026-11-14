(function(){
  function initStack(grid){
    var cards=Array.prototype.slice.call(grid.children).filter(function(el){return el.classList.contains('int-card')});
    if(cards.length<2)return;
    grid.classList.add('is-stack');
    var maxH=0;
    cards.forEach(function(c){maxH=Math.max(maxH,c.offsetHeight)});
    grid.style.height=maxH+'px';
    var order=cards.slice();
    var STK=['stk-0','stk-1','stk-2'];
    function render(skip){
      order.forEach(function(c,i){
        if(c===skip)return;
        c.classList.remove('stk-0','stk-1','stk-2','stk-rest','stk-exit');
        c.classList.add(i<3?STK[i]:'stk-rest');
        if(i===0){c.removeAttribute('tabindex');c.removeAttribute('aria-hidden')}
        else{c.setAttribute('tabindex','-1');c.setAttribute('aria-hidden','true')}
      });
    }
    render();
    var posEl=document.createElement('span');
    posEl.className='int-stack-pos';
    posEl.setAttribute('aria-hidden','true');
    grid.insertAdjacentElement('afterend',posEl);
    var idx=0;
    function updatePos(){posEl.textContent=(idx+1)+' / '+cards.length}
    updatePos();
    var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduceMotion)return;
    var paused=false;
    grid.addEventListener('mouseenter',function(){paused=true});
    grid.addEventListener('mouseleave',function(){paused=false});
    grid.addEventListener('focusin',function(){paused=true});
    grid.addEventListener('focusout',function(){paused=false});
    var visible=true;
    var observer=new IntersectionObserver(function(entries){
      entries.forEach(function(e){visible=e.isIntersecting});
    },{threshold:0.1});
    observer.observe(grid);
    setInterval(function(){
      if(paused||!visible)return;
      var exiting=order.shift();
      order.push(exiting);
      exiting.classList.remove('stk-0','stk-1','stk-2','stk-rest');
      exiting.classList.add('stk-exit');
      render(exiting);
      idx=(idx+1)%cards.length;
      updatePos();
      setTimeout(function(){
        exiting.classList.remove('stk-exit');
        exiting.classList.add('stk-rest');
        exiting.setAttribute('tabindex','-1');
        exiting.setAttribute('aria-hidden','true');
      },650);
    },3400);
    var resizeTimer=null;
    window.addEventListener('resize',function(){
      clearTimeout(resizeTimer);
      resizeTimer=setTimeout(function(){
        var h=0;
        cards.forEach(function(c){h=Math.max(h,c.offsetHeight)});
        grid.style.height=h+'px';
      },200);
    });
  }
  document.querySelectorAll('#enterprise-integrations .int-grid, #reference-databases .int-grid').forEach(initStack);
})();
