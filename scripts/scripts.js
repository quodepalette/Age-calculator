(function(){
  const daySelect = document.getElementById('day');
  const monthSelect = document.getElementById('month');
  const yearSelect = document.getElementById('year');
  const calcBtn = document.getElementById('calcBtn');
  const errorMsg = document.getElementById('errorMsg');
  const resultSection = document.getElementById('result');

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const today = new Date();
  const currentYear = today.getFullYear();

  // populate months
  months.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i + 1;
    opt.textContent = m;
    monthSelect.appendChild(opt);
  });

  // populate years (current year down to 120 years back)
  for (let y = currentYear; y >= currentYear - 120; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }

  function daysInMonth(month, year){
    return new Date(year, month, 0).getDate();
  }

  function populateDays(){
    const month = parseInt(monthSelect.value, 10);
    const year = parseInt(yearSelect.value, 10);
    const numDays = daysInMonth(month, year);
    const prevSelected = parseInt(daySelect.value, 10) || 1;

    daySelect.innerHTML = '';
    for (let d = 1; d <= numDays; d++) {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      daySelect.appendChild(opt);
    }
    daySelect.value = Math.min(prevSelected, numDays);
  }

  // sensible defaults
  monthSelect.value = 1;
  yearSelect.value = currentYear - 25;
  populateDays();
  daySelect.value = 1;

  monthSelect.addEventListener('change', populateDays);
  yearSelect.addEventListener('change', populateDays);

  function stripTime(d){
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function calculateAge(birth, ref){
    let years = ref.getFullYear() - birth.getFullYear();
    let months = ref.getMonth() - birth.getMonth();
    let days = ref.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonthDate = new Date(ref.getFullYear(), ref.getMonth(), 0);
      days += prevMonthDate.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years, months, days };
  }

  function nextBirthdayInfo(birth, ref){
    const refClean = stripTime(ref);
    let next = new Date(refClean.getFullYear(), birth.getMonth(), birth.getDate());
    if (next < refClean) {
      next = new Date(refClean.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const msPerDay = 86400000;
    const daysUntil = Math.round((next - refClean) / msPerDay);

    let last = new Date(next.getFullYear() - 1, birth.getMonth(), birth.getDate());
    const totalCycle = Math.round((next - last) / msPerDay) || 365;
    const daysSinceLast = totalCycle - daysUntil;
    const percent = Math.max(0, Math.min(100, (daysSinceLast / totalCycle) * 100));

    return { daysUntil, percent };
  }

  function animateNumber(el, target, duration){
    const start = 0;
    const startTime = performance.now();
    function tick(now){
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(start + (target - start) * eased);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  let birthDateGlobal = null;
  let liveInterval = null;
  let akanGender = 'male';

  const ZODIAC = [
    { name:"Capricorn", symbol:"♑", start:[12,22], end:[1,19] },
    { name:"Aquarius",  symbol:"♒", start:[1,20],  end:[2,18] },
    { name:"Pisces",    symbol:"♓", start:[2,19],  end:[3,20] },
    { name:"Aries",     symbol:"♈", start:[3,21],  end:[4,19] },
    { name:"Taurus",    symbol:"♉", start:[4,20],  end:[5,20] },
    { name:"Gemini",    symbol:"♊", start:[5,21],  end:[6,20] },
    { name:"Cancer",    symbol:"♋", start:[6,21],  end:[7,22] },
    { name:"Leo",       symbol:"♌", start:[7,23],  end:[8,22] },
    { name:"Virgo",     symbol:"♍", start:[8,23],  end:[9,22] },
    { name:"Libra",     symbol:"♎", start:[9,23],  end:[10,22] },
    { name:"Scorpio",   symbol:"♏", start:[10,23], end:[11,21] },
    { name:"Sagittarius", symbol:"♐", start:[11,22], end:[12,21] }
  ];

  function getZodiac(month, day){
    for (const z of ZODIAC) {
      const [sm, sd] = z.start;
      const [em, ed] = z.end;
      if (sm > em) {
        if ((month === sm && day >= sd) || (month === em && day <= ed)) return z;
      } else {
        if ((month === sm && day >= sd) || (month === em && day <= ed)) return z;
      }
    }
    return ZODIAC[0];
  }

  const AKAN_DAYS = {
    0: { male:"Kwasi",  female:"Akosua" }, // Sunday
    1: { male:"Kwadwo", female:"Adwoa"  }, // Monday
    2: { male:"Kwabena", female:"Abena" }, // Tuesday
    3: { male:"Kwaku",  female:"Akua"   }, // Wednesday
    4: { male:"Yaw",    female:"Yaa"    }, // Thursday
    5: { male:"Kofi",   female:"Afua"   }, // Friday
    6: { male:"Kwame",  female:"Ama"    }  // Saturday
  };

  const BIRTHSTONES = ["Garnet","Amethyst","Aquamarine","Diamond","Emerald","Pearl","Ruby","Peridot","Sapphire","Opal","Topaz","Turquoise"];

  function getGeneration(year){
    if (year >= 2013) return "Generation Alpha";
    if (year >= 1997) return "Generation Z";
    if (year >= 1981) return "Millennial";
    if (year >= 1965) return "Generation X";
    if (year >= 1946) return "Baby Boomer";
    if (year >= 1928) return "Silent Generation";
    return "Greatest Generation";
  }

  let akanDayIndexGlobal = null;

  function updateAkanDisplay(){
    if (akanDayIndexGlobal === null) return;
    document.getElementById('akanName').textContent = AKAN_DAYS[akanDayIndexGlobal][akanGender];
  }

  document.querySelectorAll('.akan-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.akan-btn').forEach(function(b){
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      akanGender = btn.dataset.gender;
      updateAkanDisplay();
    });
  });

  function updateLiveSeconds(){
    if (!birthDateGlobal) return;
    const now = new Date();
    const seconds = Math.floor((now - birthDateGlobal) / 1000);
    document.getElementById('liveSeconds').textContent = seconds.toLocaleString('en-US');
  }

  // ---------- Celebrity birthdays (live from Wikipedia "On this day" API) ----------
  const celebCache = {};       // keyed by "MM-DD" -> processed, sorted list
  let celebFullList = [];
  let celebShown = 0;
  const CELEB_BATCH = 6;
  let celebRequestId = 0;      // guards against out-of-order responses if user recalculates quickly

  function stripToPlainText(html){
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
  }

  // Matches Wikipedia's short-description wording for singers and actors
  // (e.g. "American actor", "English singer-songwriter", "voice actress").
  const SINGER_ACTOR_RE = /\b(actor|actress|singer|vocalist|singer-songwriter)\b/i;

  function isSingerOrActor(c){
    if (SINGER_ACTOR_RE.test(c.desc)) return true;
    // fall back to the article's opening extract if the short description was missing/unhelpful
    if (!c.desc && c.extract && SINGER_ACTOR_RE.test(c.extract.slice(0, 200))) return true;
    return false;
  }

  async function fetchCelebrities(month, day){
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const key = mm + '-' + dd;
    const thisRequest = ++celebRequestId;

    const grid = document.getElementById('celebGrid');
    const loading = document.getElementById('celebLoading');
    const errorEl = document.getElementById('celebError');
    const moreBtn = document.getElementById('celebMoreBtn');

    grid.innerHTML = '';
    errorEl.hidden = true;
    moreBtn.hidden = true;
    loading.hidden = false;
    loading.textContent = 'Loading famous birthdays…';

    try {
      let list = celebCache[key];

      if (!list) {
        const res = await fetch('https://en.wikipedia.org/api/rest_v1/feed/onthisday/births/' + mm + '/' + dd);
        if (!res.ok) throw new Error('Request failed: ' + res.status);
        const data = await res.json();

        list = (data.births || [])
          .map(function(item){
            const page = item.pages && item.pages[0];
            if (!page) return null;
            if (!page.thumbnail || !page.thumbnail.source) return null; // require a real photo
            if (page.namespace && page.namespace.id !== 0) return null; // skip non-article pages

            const name = (page.titles && page.titles.normalized) ||
                         (page.title ? page.title.replace(/_/g, ' ') : '');
            if (!name) return null;

            const pageUrl = (page.content_urls && page.content_urls.desktop && page.content_urls.desktop.page) ||
                             ('https://en.wikipedia.org/wiki/' + encodeURIComponent(page.title || name.replace(/ /g, '_')));

            const shortDesc = stripToPlainText(page.description);
            const extract = stripToPlainText(page.extract);

            return {
              name: name,
              desc: shortDesc || extract.slice(0, 90),
              extract: extract,
              year: item.year,
              img: page.thumbnail.source,
              url: pageUrl
            };
          })
          .filter(Boolean)
          .filter(isSingerOrActor)
          .sort(function(a, b){ return b.year - a.year; }); // more recent birth years first

        celebCache[key] = list;
      }

      if (thisRequest !== celebRequestId) return; // a newer request has superseded this one
      loading.hidden = true;

      if (!list.length) {
        errorEl.textContent = 'No singers or actors with photos found for this date on Wikipedia.';
        errorEl.hidden = false;
        return;
      }

      celebFullList = list;
      celebShown = 0;
      renderMoreCelebs();

    } catch (err) {
      if (thisRequest !== celebRequestId) return;
      loading.hidden = true;
      errorEl.textContent = "Couldn't load famous birthdays right now — check your internet connection and try again.";
      errorEl.hidden = false;
    }
  }

  function renderMoreCelebs(){
    const grid = document.getElementById('celebGrid');
    const moreBtn = document.getElementById('celebMoreBtn');
    const next = celebFullList.slice(celebShown, celebShown + CELEB_BATCH);

    next.forEach(function(c){
      const a = document.createElement('a');
      a.className = 'celeb-card';
      a.href = c.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.title = c.name + (c.desc ? ' — ' + c.desc : '');

      const photoWrap = document.createElement('div');
      photoWrap.className = 'celeb-photo-wrap';
      const img = document.createElement('img');
      img.className = 'celeb-photo';
      img.src = c.img;
      img.alt = c.name;
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      img.onerror = function(){
        photoWrap.innerHTML = '<span class="celeb-photo-fallback">🎂</span>';
      };
      photoWrap.appendChild(img);

      const info = document.createElement('div');
      info.className = 'celeb-info';

      const nameEl = document.createElement('div');
      nameEl.className = 'celeb-name';
      nameEl.textContent = c.name;

      const descEl = document.createElement('div');
      descEl.className = 'celeb-desc';
      descEl.textContent = c.desc;

      const yearEl = document.createElement('div');
      yearEl.className = 'celeb-year';
      yearEl.textContent = 'Born ' + c.year;

      info.appendChild(nameEl);
      if (c.desc) info.appendChild(descEl);
      info.appendChild(yearEl);

      a.appendChild(photoWrap);
      a.appendChild(info);
      grid.appendChild(a);
    });

    celebShown += next.length;
    moreBtn.hidden = celebShown >= celebFullList.length;
  }

  document.getElementById('celebMoreBtn').addEventListener('click', renderMoreCelebs);

  // ---------- Info icon tooltips (tap-to-open on touch devices) ----------
  document.querySelectorAll('.info-icon').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      const wasOpen = btn.classList.contains('open');
      document.querySelectorAll('.info-icon.open').forEach(function(b){ b.classList.remove('open'); });
      if (!wasOpen) btn.classList.add('open');
    });
  });
  document.addEventListener('click', function(){
    document.querySelectorAll('.info-icon.open').forEach(function(b){ b.classList.remove('open'); });
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') {
      document.querySelectorAll('.info-icon.open').forEach(function(b){ b.classList.remove('open'); });
    }
  });

  // ---------- Age difference + zodiac compatibility ----------
  const ELEMENTS = {
    Aries:'Fire', Leo:'Fire', Sagittarius:'Fire',
    Taurus:'Earth', Virgo:'Earth', Capricorn:'Earth',
    Gemini:'Air', Libra:'Air', Aquarius:'Air',
    Cancer:'Water', Scorpio:'Water', Pisces:'Water'
  };

  function getCompatibility(signA, signB){
    if (signA === signB) {
      return { percent: 92, text: "Same sign — you two read each other like an open book, for better or worse." };
    }
    const elA = ELEMENTS[signA];
    const elB = ELEMENTS[signB];
    if (elA === elB) {
      return { percent: 88, text: "Same element (" + elA + ") — an easy, natural rhythm together." };
    }
    const harmonious = (elA === 'Fire' && elB === 'Air') || (elA === 'Air' && elB === 'Fire') ||
                        (elA === 'Earth' && elB === 'Water') || (elA === 'Water' && elB === 'Earth');
    if (harmonious) {
      return { percent: 78, text: elA + " and " + elB + " — you bring out each other's best qualities." };
    }
    const grounding = (elA === 'Earth' && elB === 'Fire') || (elA === 'Fire' && elB === 'Earth') ||
                       (elA === 'Water' && elB === 'Air') || (elA === 'Air' && elB === 'Water');
    if (grounding) {
      return { percent: 60, text: elA + " and " + elB + " — different paces, but you can balance each other out." };
    }
    return { percent: 45, text: elA + " and " + elB + " — an opposites dynamic. Takes real effort to sync up." };
  }

  const diffNameA = document.getElementById('diffNameA');
  const diffNameB = document.getElementById('diffNameB');
  const diffDateA = document.getElementById('diffDateA');
  const diffDateB = document.getElementById('diffDateB');
  const diffBtn = document.getElementById('diffBtn');
  const diffErrorEl = document.getElementById('diffError');
  const diffResultEl = document.getElementById('diffResult');

  diffBtn.addEventListener('click', function(){
    diffErrorEl.hidden = true;

    if (!diffDateA.value || !diffDateB.value) {
      diffErrorEl.textContent = "Pick both birthdays to compare.";
      diffErrorEl.hidden = false;
      diffResultEl.hidden = true;
      return;
    }

    const nameA = diffNameA.value.trim() || "Person A";
    const nameB = diffNameB.value.trim() || "Person B";

    const partsA = diffDateA.value.split('-').map(Number);
    const partsB = diffDateB.value.split('-').map(Number);
    const birthA = new Date(partsA[0], partsA[1] - 1, partsA[2]);
    const birthB = new Date(partsB[0], partsB[1] - 1, partsB[2]);
    const now = new Date();

    if (stripTime(birthA) > stripTime(now) || stripTime(birthB) > stripTime(now)) {
      diffErrorEl.textContent = "Both dates need to be in the past.";
      diffErrorEl.hidden = false;
      diffResultEl.hidden = true;
      return;
    }

    const older = birthA <= birthB ? birthA : birthB;
    const younger = birthA <= birthB ? birthB : birthA;
    const gap = calculateAge(older, younger);

    animateNumber(document.getElementById('diffYears'), gap.years, 700);
    animateNumber(document.getElementById('diffMonths'), gap.months, 700);
    animateNumber(document.getElementById('diffDays'), gap.days, 700);

    document.getElementById('diffPairNames').innerHTML = nameA + " <span>&amp;</span> " + nameB;

    const olderName = birthA <= birthB ? nameA : nameB;
    const whoOlder = olderName + " is older";
    document.getElementById('diffWhoOlder').textContent = whoOlder + (gap.years === 0 && gap.months === 0 && gap.days === 0 ? " — actually, same day!" : "");

    const zodiacA = getZodiac(partsA[1], partsA[2]);
    const zodiacB = getZodiac(partsB[1], partsB[2]);
    document.getElementById('diffSignAIcon').textContent = zodiacA.symbol;
    document.getElementById('diffSignAName').textContent = zodiacA.name;
    document.getElementById('diffSignALabel').textContent = nameA + "'s sign";
    document.getElementById('diffSignBIcon').textContent = zodiacB.symbol;
    document.getElementById('diffSignBName').textContent = zodiacB.name;
    document.getElementById('diffSignBLabel').textContent = nameB + "'s sign";

    const compat = getCompatibility(zodiacA.name, zodiacB.name);
    const circumference = 207.3;
    const offset = circumference - (compat.percent / 100) * circumference;
    document.getElementById('compatRingFg').style.strokeDashoffset = offset;
    document.getElementById('compatPct').textContent = compat.percent + "%";
    document.getElementById('compatLabel').textContent = nameA + " + " + nameB;
    document.getElementById('compatDesc').textContent = compat.text;

    diffResultEl.hidden = false;
    diffResultEl.style.animation = 'none';
    void diffResultEl.offsetWidth;
    diffResultEl.style.animation = '';
  });

  // ---------- Family ages tracker ----------
  const FAMILY_KEY = 'joerl_family_members';
  const familyNameInput = document.getElementById('familyName');
  const familyDateInput = document.getElementById('familyDate');
  const familyAddBtn = document.getElementById('familyAddBtn');
  const familyErrorEl = document.getElementById('familyError');
  const familyListEl = document.getElementById('familyList');
  const familyEmptyEl = document.getElementById('familyEmpty');
  const familyExportRow = document.getElementById('familyExportRow');
  const familyExportCsvBtn = document.getElementById('familyExportCsvBtn');
  const familyExportPdfBtn = document.getElementById('familyExportPdfBtn');

  function loadFamily(){
    try {
      const raw = localStorage.getItem(FAMILY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveFamily(list){
    try { localStorage.setItem(FAMILY_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function formatFamilyAge(dob){
    const parts = dob.split('-').map(Number);
    const birth = new Date(parts[0], parts[1] - 1, parts[2]);
    const now = new Date();
    const age = calculateAge(birth, now);
    const bits = [];
    bits.push(age.years + (age.years === 1 ? " yr" : " yrs"));
    bits.push(age.months + (age.months === 1 ? " mo" : " mos"));
    bits.push(age.days + (age.days === 1 ? " day" : " days"));
    return bits.join(', ');
  }

  function formatNextBirthday(birth){
    const bday = nextBirthdayInfo(birth, new Date());
    if (bday.daysUntil === 0) return "Birthday is today! \uD83C\uDF89";
    return "Next birthday in <b>" + bday.daysUntil + (bday.daysUntil === 1 ? " day" : " days") + "</b>";
  }

  function renderFamily(){
    const list = loadFamily();
    familyListEl.innerHTML = '';

    if (!list.length) {
      familyEmptyEl.hidden = false;
      familyExportRow.hidden = true;
      return;
    }
    familyEmptyEl.hidden = true;
    familyExportRow.hidden = false;

    const sorted = list.slice().sort(function(a, b){
      return new Date(a.dob) - new Date(b.dob);
    });

    sorted.forEach(function(member){
      const parts = member.dob.split('-').map(Number);
      const birth = new Date(parts[0], parts[1] - 1, parts[2]);
      const gender = member.gender === 'female' ? 'female' : 'male';

      const item = document.createElement('div');
      item.className = 'family-item';

      const top = document.createElement('div');
      top.className = 'family-item-top';

      const main = document.createElement('div');
      main.className = 'family-item-main';

      const nameEl = document.createElement('span');
      nameEl.className = 'family-name';
      nameEl.textContent = member.name;

      const ageEl = document.createElement('span');
      ageEl.className = 'family-age';
      ageEl.textContent = formatFamilyAge(member.dob);

      main.appendChild(nameEl);
      main.appendChild(ageEl);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'family-remove';
      removeBtn.type = 'button';
      removeBtn.setAttribute('aria-label', 'Remove ' + member.name);
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', function(){
        const updated = loadFamily().filter(function(m){ return m.id !== member.id; });
        saveFamily(updated);
        renderFamily();
      });

      top.appendChild(main);
      top.appendChild(removeBtn);

      // ---- Badges: zodiac, Akan day name, birthstone, generation ----
      const badges = document.createElement('div');
      badges.className = 'family-badges';

      const zodiac = getZodiac(parts[1], parts[2]);
      const zodiacBadge = document.createElement('div');
      zodiacBadge.className = 'family-badge';
      zodiacBadge.innerHTML =
        '<span class="family-badge-icon">' + zodiac.symbol + '</span>' +
        '<span class="family-badge-value">' + zodiac.name + '</span>' +
        '<span class="family-badge-label">Zodiac</span>';
      badges.appendChild(zodiacBadge);

      const akanDayIndex = birth.getDay();
      const akanBadge = document.createElement('div');
      akanBadge.className = 'family-badge family-badge-akan';
      const akanValueEl = document.createElement('span');
      akanValueEl.className = 'family-badge-value';
      akanValueEl.textContent = AKAN_DAYS[akanDayIndex][gender];
      const akanLabelEl = document.createElement('span');
      akanLabelEl.className = 'family-badge-label';
      akanLabelEl.textContent = 'Akan name';
      const akanToggle = document.createElement('div');
      akanToggle.className = 'family-akan-toggle';
      ['male', 'female'].forEach(function(g){
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'family-akan-btn' + (gender === g ? ' active' : '');
        btn.textContent = g === 'male' ? 'M' : 'F';
        btn.setAttribute('aria-label', (g === 'male' ? 'Male' : 'Female') + ' Akan name for ' + member.name);
        btn.setAttribute('aria-pressed', gender === g ? 'true' : 'false');
        btn.addEventListener('click', function(){
          const updated = loadFamily().map(function(m){
            if (m.id === member.id) m.gender = g;
            return m;
          });
          saveFamily(updated);
          renderFamily();
        });
        akanToggle.appendChild(btn);
      });
      akanBadge.appendChild(akanValueEl);
      akanBadge.appendChild(akanLabelEl);
      akanBadge.appendChild(akanToggle);
      badges.appendChild(akanBadge);

      const birthstoneBadge = document.createElement('div');
      birthstoneBadge.className = 'family-badge';
      birthstoneBadge.innerHTML =
        '<span class="family-badge-icon">\uD83D\uDC8E</span>' +
        '<span class="family-badge-value">' + BIRTHSTONES[parts[1] - 1] + '</span>' +
        '<span class="family-badge-label">Birthstone</span>';
      badges.appendChild(birthstoneBadge);

      const generationBadge = document.createElement('div');
      generationBadge.className = 'family-badge';
      generationBadge.innerHTML =
        '<span class="family-badge-icon">\uD83D\uDD70\uFE0F</span>' +
        '<span class="family-badge-value">' + getGeneration(parts[0]) + '</span>' +
        '<span class="family-badge-label">Generation</span>';
      badges.appendChild(generationBadge);

      const nextBday = document.createElement('p');
      nextBday.className = 'family-next-birthday';
      nextBday.innerHTML = formatNextBirthday(birth);

      item.appendChild(top);
      item.appendChild(badges);
      item.appendChild(nextBday);
      familyListEl.appendChild(item);
    });
  }

  // ---- Export: shared row-building for CSV + PDF ----
  function formatDob(dob){
    const parts = dob.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
  }

  function formatNextBirthdayPlain(birth){
    const bday = nextBirthdayInfo(birth, new Date());
    if (bday.daysUntil === 0) return "Today!";
    return "In " + bday.daysUntil + (bday.daysUntil === 1 ? " day" : " days");
  }

  function getFamilyExportRows(){
    const list = loadFamily().slice().sort(function(a, b){
      return new Date(a.dob) - new Date(b.dob);
    });
    return list.map(function(member){
      const parts = member.dob.split('-').map(Number);
      const birth = new Date(parts[0], parts[1] - 1, parts[2]);
      const gender = member.gender === 'female' ? 'female' : 'male';
      const zodiac = getZodiac(parts[1], parts[2]);
      return {
        name: member.name,
        birthday: formatDob(member.dob),
        age: formatFamilyAge(member.dob),
        zodiac: zodiac.name,
        akanName: AKAN_DAYS[birth.getDay()][gender],
        birthstone: BIRTHSTONES[parts[1] - 1],
        generation: getGeneration(parts[0]),
        nextBirthday: formatNextBirthdayPlain(birth)
      };
    });
  }

  function csvEscape(value){
    const str = String(value);
    if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  }

  function downloadBlob(blob, filename){
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  }

  familyExportCsvBtn.addEventListener('click', function(){
    const rows = getFamilyExportRows();
    if (!rows.length) return;
    const headers = ['Name', 'Birthday', 'Age', 'Zodiac', 'Akan Day Name', 'Birthstone', 'Generation', 'Next Birthday'];
    const lines = [headers.join(',')];
    rows.forEach(function(r){
      lines.push([r.name, r.birthday, r.age, r.zodiac, r.akanName, r.birthstone, r.generation, r.nextBirthday]
        .map(csvEscape).join(','));
    });
    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, 'family-ages.csv');
  });

  familyExportPdfBtn.addEventListener('click', function(){
    const rows = getFamilyExportRows();
    if (!rows.length) return;

    if (!window.jspdf || !window.jspdf.jsPDF) {
      familyErrorEl.textContent = "PDF export is still loading — give it a second and try again.";
      familyErrorEl.hidden = false;
      return;
    }
    familyErrorEl.hidden = true;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Family Ages Tracker', 40, 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text('Exported ' + new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }), 40, 58);

    doc.autoTable({
      startY: 72,
      head: [['Name', 'Birthday', 'Age', 'Zodiac', 'Akan Day Name', 'Birthstone', 'Generation', 'Next Birthday']],
      body: rows.map(function(r){
        return [r.name, r.birthday, r.age, r.zodiac, r.akanName, r.birthstone, r.generation, r.nextBirthday];
      }),
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [232, 184, 75], textColor: [26, 19, 0] },
      alternateRowStyles: { fillColor: [247, 247, 250] }
    });

    doc.save('family-ages.pdf');
  });

  familyAddBtn.addEventListener('click', function(){
    familyErrorEl.hidden = true;
    const name = familyNameInput.value.trim();
    const dob = familyDateInput.value;

    if (!name || !dob) {
      familyErrorEl.textContent = "Enter a name and birthday.";
      familyErrorEl.hidden = false;
      return;
    }
    const parts = dob.split('-').map(Number);
    const birth = new Date(parts[0], parts[1] - 1, parts[2]);
    if (stripTime(birth) > stripTime(new Date())) {
      familyErrorEl.textContent = "That birthday hasn't happened yet.";
      familyErrorEl.hidden = false;
      return;
    }

    const list = loadFamily();
    list.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), name: name, dob: dob, gender: 'male' });
    saveFamily(list);

    familyNameInput.value = '';
    familyDateInput.value = '';
    renderFamily();
  });

  renderFamily();

  calcBtn.addEventListener('click', function(){
    const day = parseInt(daySelect.value, 10);
    const month = parseInt(monthSelect.value, 10) - 1;
    const year = parseInt(yearSelect.value, 10);

    const birth = new Date(year, month, day);
    const now = new Date();

    if (stripTime(birth) > stripTime(now)) {
      errorMsg.textContent = "That date hasn't happened yet — pick a date in the past.";
      errorMsg.hidden = false;
      resultSection.hidden = true;
      return;
    }
    errorMsg.hidden = true;

    birthDateGlobal = birth;

    const age = calculateAge(birth, now);
    animateNumber(document.getElementById('numYears'), age.years, 900);
    animateNumber(document.getElementById('numMonths'), age.months, 900);
    animateNumber(document.getElementById('numDays'), age.days, 900);

    const msPerDay = 86400000;
    const totalDays = Math.floor((stripTime(now) - stripTime(birth)) / msPerDay);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = Math.floor((now - birth) / 3600000);
    const weekday = birth.toLocaleDateString('en-US', { weekday: 'long' });

    document.getElementById('statDays').textContent = totalDays.toLocaleString('en-US');
    document.getElementById('statWeeks').textContent = totalWeeks.toLocaleString('en-US');
    document.getElementById('statHours').textContent = totalHours.toLocaleString('en-US');
    document.getElementById('statWeekday').textContent = weekday;

    const bday = nextBirthdayInfo(birth, now);
    const headline = document.getElementById('birthdayHeadline');
    const daysEl = document.getElementById('birthdayDays');
    if (bday.daysUntil === 0) {
      headline.textContent = "Today!";
      daysEl.textContent = "Happy birthday 🎉";
    } else {
      headline.textContent = "Next birthday in";
      daysEl.textContent = bday.daysUntil + (bday.daysUntil === 1 ? " day" : " days");
    }

    const circumference = 207.3;
    const offset = circumference - (bday.percent / 100) * circumference;
    document.getElementById('ringFg').style.strokeDashoffset = offset;
    document.getElementById('ringPct').textContent = Math.round(bday.percent) + "%";

    // birth profile: zodiac, Akan day name, birthstone, generation
    const zodiac = getZodiac(month + 1, day);
    document.getElementById('zodiacIcon').textContent = zodiac.symbol;
    document.getElementById('zodiacName').textContent = zodiac.name;

    akanDayIndexGlobal = birth.getDay();
    updateAkanDisplay();

    document.getElementById('birthstoneName').textContent = BIRTHSTONES[month];
    document.getElementById('generationName').textContent = getGeneration(year);

    // celebrities born on this month/day (any year)
    fetchCelebrities(month + 1, day);

    resultSection.hidden = false;
    resultSection.style.animation = 'none';
    void resultSection.offsetWidth;
    resultSection.style.animation = '';

    if (liveInterval) clearInterval(liveInterval);
    updateLiveSeconds();
    liveInterval = setInterval(updateLiveSeconds, 1000);

    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // footer year
  document.getElementById('footerYear').textContent = new Date().getFullYear();

  // back to top button
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', function(){
    if (window.scrollY > 400) backToTop.classList.add('visible');
    else backToTop.classList.remove('visible');
  });
  backToTop.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();
