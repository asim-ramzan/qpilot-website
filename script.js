// QPilot single-page site: scrollspy nav, scroll-reveal, count-up, card glow, pricing toggle, contact mailto.
// All motion respects prefers-reduced-motion (guarded below).
(function(){
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- scrollspy + sliding pill ----
  var links = Array.prototype.slice.call(document.querySelectorAll('#qsiteNavLinks a'));
  var pill = document.getElementById('qNavPill');
  var sections = links.map(function(a){ return document.getElementById(a.dataset.sec); });

  function movePill(link){
    if(!pill || !link) return;
    pill.style.left = link.offsetLeft + 'px';
    pill.style.width = link.offsetWidth + 'px';
  }
  function setActive(link){
    links.forEach(function(l){ l.classList.remove('active'); });
    link.classList.add('active');
    movePill(link);
  }
  if(links.length) setActive(links[0]);
  window.addEventListener('resize', function(){
    var cur = document.querySelector('#qsiteNavLinks a.active');
    if(cur) movePill(cur);
  });

  if('IntersectionObserver' in window){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          var i = sections.indexOf(e.target);
          if(i > -1) setActive(links[i]);
        }
      });
    }, {rootMargin:'-45% 0px -50% 0px'});
    sections.forEach(function(s){ if(s) spy.observe(s); });
  }

  window.addEventListener('scroll', function(){
    var nav = document.getElementById('qNav');
    if(nav) nav.classList.toggle('scrolled', window.scrollY > 10);
  });

  // ---- scroll-reveal ----
  if('IntersectionObserver' in window && !reduced){
    var reveal = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting) e.target.classList.add('in'); });
    }, {threshold:.12});
    document.querySelectorAll('.reveal').forEach(function(el){ reveal.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }

  // ---- count-up ----
  if('IntersectionObserver' in window){
    var counters = document.querySelectorAll('.cnt');
    var cObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          var el = e.target, to = +el.dataset.to, dur = reduced ? 0 : 900, t0 = performance.now();
          function tick(t){
            var p = Math.min((t - t0) / dur, 1);
            el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
            if(p < 1) requestAnimationFrame(tick);
          }
          if(dur === 0){ el.textContent = to; } else { requestAnimationFrame(tick); }
          cObs.unobserve(el);
        }
      });
    }, {threshold:.5});
    counters.forEach(function(c){ cObs.observe(c); });
  }

  // ---- card cursor glow ----
  if(!reduced){
    document.querySelectorAll('.qsite-card').forEach(function(c){
      c.addEventListener('mousemove', function(e){
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }
})();

// ---- pricing toggle ----
function qpToggleBilling(){
  var btn = document.getElementById('qpToggle');
  var annual = !btn.classList.contains('annual');
  btn.classList.toggle('annual', annual);
  document.getElementById('qpLabelMonthly').classList.toggle('on', !annual);
  document.getElementById('qpLabelAnnual').classList.toggle('on', annual);
  document.querySelectorAll('.qp-amt-monthly').forEach(function(el){ el.style.display = annual ? 'none' : 'inline'; });
  document.querySelectorAll('.qp-amt-annual').forEach(function(el){ el.style.display = annual ? 'inline' : 'none'; });
}

// ---- pricing card -> pre-select plan in contact form ----
function qpPickPlan(plan){
  var sel = document.getElementById('qc-plan');
  if(!sel) return;
  for(var i=0;i<sel.options.length;i++){
    if(sel.options[i].value === plan){ sel.selectedIndex = i; break; }
  }
}

// ---- contact form: no backend on this static site, so we hand off to the
// visitor's email client via mailto:, addressed straight to the inbox that
// should receive every lead. Swap for a form-service POST (e.g. Formspree)
// later if silent, no-click delivery is needed. ----
document.addEventListener('DOMContentLoaded', function(){
  var form = document.getElementById('qcForm');
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('qc-name').value.trim();
    var email = document.getElementById('qc-email').value.trim();
    var company = document.getElementById('qc-company').value.trim();
    var plan = document.getElementById('qc-plan').value;
    var message = document.getElementById('qc-message').value.trim();

    var subject = 'QPilot inquiry from ' + name + (company ? ' (' + company + ')' : '');
    var bodyLines = [
      message, '', '---',
      'Name: ' + name,
      'Email: ' + email,
      company ? 'Company: ' + company : null,
      plan ? 'Interested plan: ' + plan : null,
    ].filter(Boolean);

    var mailto = 'mailto:asim.ramzan21@gmail.com'
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(bodyLines.join('\n'));
    window.location.href = mailto;
  });
});
