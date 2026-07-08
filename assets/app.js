/* ============================================================
   留学录取智能评估系统 V4
   - P0 修复：GPA 自动识别 4 分制并换算 + 院校缩写/别名映射
   - P1 改进：跨专业距离分级（近/中/远）+ 软背景加分 + 多语言支持
   - 移动优先交互优化
   ============================================================ */
(function() {
  'use strict';

  var DATA = window.ADMISSION_DATA;
  if (!DATA) { console.error('数据未加载'); return; }

  // ==================== 院校列表 ====================
  var S985 = "北京大学 清华大学 复旦大学 上海交通大学 浙江大学 南京大学 中国科学技术大学 华中科技大学 武汉大学 西安交通大学 哈尔滨工业大学 中山大学 同济大学 北京航空航天大学 北京师范大学 四川大学 东南大学 中国人民大学 南开大学 天津大学 山东大学 西北工业大学 厦门大学 中南大学 大连理工大学 吉林大学 电子科技大学 湖南大学 重庆大学 北京理工大学 华南理工大学 中国农业大学 西北农林科技大学 华东师范大学 兰州大学 国防科技大学 中央民族大学 东北大学 郑州大学 中国海洋大学".split(' ');
  var S211 = "湖南师范大学 武汉理工大学 西安电子科技大学 上海大学 苏州大学 暨南大学 华中师范大学 西南大学 西南交通大学 陕西师范大学 华中农业大学 北京科技大学 北京交通大学 南京师范大学 南京理工大学 南京农业大学 中国矿业大学 中国地质大学 哈尔滨工程大学 合肥工业大学 福州大学 中南财经政法大学 上海财经大学 西南财经大学 长安大学 太原理工大学 云南大学 贵州大学 广西大学 海南大学 南昌大学 内蒙古大学 新疆大学 宁夏大学 青海大学 石河子大学 延边大学 西藏大学 北京邮电大学 北京林业大学 北京中医药大学 北京外国语大学 北京体育大学 中央财经大学 对外经济贸易大学 中国政法大学 中央音乐学院 中央美术学院 华北电力大学 辽宁大学 东北师范大学 东华大学 华东理工大学 上海外国语大学 河海大学 江南大学 中国药科大学".split(' ');

  // ⭐ V4: 院校缩写/别名映射
  var SCHOOL_ALIASES = {
    '哈工大':'哈尔滨工业大学','哈工程':'哈尔滨工程大学','吉大':'吉林大学',
    '华科':'华中科技大学','西交':'西安交通大学','西工大':'西北工业大学',
    '人大':'中国人民大学','北航':'北京航空航天大学','北理':'北京理工大学',
    '北邮':'北京邮电大学','北师':'北京师范大学','北外':'北京外国语大学',
    '上财':'上海财经大学','上外':'上海外国语大学','华理':'华东理工大学',
    '央财':'中央财经大学','对外经贸':'对外经济贸易大学','中政':'中国政法大学',
    '华政':'华东政法大学','东华':'东华大学','河海':'河海大学',
    '南大':'南京大学','东南':'东南大学','浙大':'浙江大学','山大':'山东大学',
    '中山':'中山大学','华南师范':'华南师范大学','华中师范':'华中师范大学',
    '西电':'西安电子科技大学','成电':'电子科技大学','川大':'四川大学',
    '重大':'重庆大学','中南':'中南大学','湖大':'湖南大学','厦大':'厦门大学',
    '兰大':'兰州大学','海大':'中国海洋大学','中海大':'中国海洋大学',
    '南开':'南开大学','天大':'天津大学','同济':'同济大学','武大':'武汉大学',
    '中南财经':'中南财经政法大学','中南财':'中南财经政法大学',
    '西南交':'西南交通大学','西南财':'西南财经大学','中科大':'中国科学技术大学',
    '上大':'上海大学','苏大':'苏州大学','暨大':'暨南大学',
    '华农':'华中农业大学','西农':'西北农林科技大学','农大':'中国农业大学',
    '矿大':'中国矿业大学','地大':'中国地质大学',
    '港中深':'香港中文大学（深圳）','UIC':'北京师范大学-香港浸会大学联合国际学院',
    '北师港浸':'北京师范大学-香港浸会大学联合国际学院',
    '温肯':'温州肯恩大学','宁诺':'宁波诺丁汉大学','西浦':'西交利物浦大学',
    '昆杜':'昆山杜克大学','上纽':'上海纽约大学',
    '深大':'深圳大学','广外':'广东外语外贸大学','华师':'华东师范大学',
    '中农':'中国农业大学','国科大':'中国科学院大学','社科大':'中国社会科学院大学',
    '南科大':'南方科技大学','上科大':'上海科技大学',
    '大工':'大连理工大学','东大':'东北大学',
  };

  function resolveSchool(input) {
    var trimmed = (input || '').trim();
    if (SCHOOL_ALIASES[trimmed]) return SCHOOL_ALIASES[trimmed];
    return trimmed;
  }

  // ⭐ V4: 院校层次识别（支持缩写）
  function inferLayer(school) {
    if (!school) return '双非及其他';
    var s = resolveSchool(school);
    for (var i = 0; i < S985.length; i++) {
      if (s.indexOf(S985[i]) >= 0 || S985[i].indexOf(s) >= 0) return '985';
    }
    for (var i = 0; i < S211.length; i++) {
      if (s.indexOf(S211[i]) >= 0 || S211[i].indexOf(s) >= 0) return '211';
    }
    if (s.indexOf('中外合作') >= 0 || s.indexOf('西交利物浦') >= 0 ||
        s.indexOf('宁波诺丁汉') >= 0 || s.indexOf('昆山杜克') >= 0 ||
        s.indexOf('上海纽约') >= 0 || s.indexOf('香港中文大学（深圳）') >= 0 ||
        s.indexOf('温州肯恩') >= 0 || s.indexOf('广东以色列') >= 0 ||
        s.indexOf('联合国际学院') >= 0 || s.indexOf('北师大浸') >= 0) return '中外合作';
    return '双非及其他';
  }

  // ==================== ⭐ V4: GPA 自动识别 ====================
  function detectGpaScale(val) {
    if (val <= 0) return '100';
    // 典型 4 分制信号：值 ≤5 且大概率在 2-4.5 之间
    if (val <= 5.5) return '4';
    // 典型百分制：值 > 10
    return '100';
  }

  function normalizeGPA(val, scale) {
    if (!scale) scale = detectGpaScale(val);
    if (scale === '4') {
      return Math.min(100, Math.round(val * 25 * 100) / 100);
    }
    return val;
  }

  // ==================== ⭐ V4: 跨专业距离 ====================
  // near: 高度相关/常见自然过渡 | far: 极少见/极难
  // 未列出的默认 medium
  var CROSS_NEAR = {
    '数学/统计': ['计算机/AI/数据','金融/会计','经济学','管理/市场','电子/通信/自动化'],
    '计算机/AI/数据': ['数学/统计','电子/通信/自动化','管理/市场','金融/会计'],
    '金融/会计': ['经济学','管理/市场','数学/统计'],
    '经济学': ['金融/会计','管理/市场','社科/政治/公共','数学/统计'],
    '电子/通信/自动化': ['计算机/AI/数据','机械/制造/航空','数学/统计'],
    '机械/制造/航空': ['电子/通信/自动化','材料/化工','计算机/AI/数据'],
    '材料/化工': ['物化生/自然科学','机械/制造/航空'],
    '物化生/自然科学': ['材料/化工','医学/健康','数学/统计'],
    '管理/市场': ['经济学','金融/会计','社科/政治/公共','计算机/AI/数据'],
    '社科/政治/公共': ['经济学','管理/市场','法学','教育'],
    '传媒/新闻': ['语言/文学','管理/市场','艺术/设计'],
    '语言/文学': ['传媒/新闻','教育','社科/政治/公共'],
    '土木/环境/能源': ['建筑/城市/景观','管理/市场'],
    '建筑/城市/景观': ['土木/环境/能源','艺术/设计'],
    '教育': ['语言/文学','社科/政治/公共'],
    '法学': ['社科/政治/公共','管理/市场'],
    '艺术/设计': ['传媒/新闻','建筑/城市/景观'],
    '医学/健康': ['物化生/自然科学','数学/统计'],
  };

  var CROSS_FAR = {
    '语言/文学': ['计算机/AI/数据','机械/制造/航空','材料/化工','医学/健康','电子/通信/自动化'],
    '艺术/设计': ['计算机/AI/数据','金融/会计','医学/健康','材料/化工'],
    '医学/健康': ['计算机/AI/数据','金融/会计','艺术/设计','建筑/城市/景观'],
    '教育': ['计算机/AI/数据','机械/制造/航空','材料/化工','医学/健康'],
    '法学': ['计算机/AI/数据','机械/制造/航空','医学/健康','材料/化工'],
    '传媒/新闻': ['计算机/AI/数据','机械/制造/航空','材料/化工','医学/健康'],
    '物化生/自然科学': ['金融/会计','法学','艺术/设计'],
    '土木/环境/能源': ['金融/会计','法学','艺术/设计'],
    '建筑/城市/景观': ['医学/健康','金融/会计'],
    '机械/制造/航空': ['金融/会计','法学','医学/健康','艺术/设计'],
    '材料/化工': ['金融/会计','法学','艺术/设计'],
    '金融/会计': ['机械/制造/航空','材料/化工','物化生/自然科学','医学/健康'],
    '经济学': ['机械/制造/航空','材料/化工','物化生/自然科学','医学/健康'],
    '电子/通信/自动化': ['金融/会计','法学','医学/健康','艺术/设计'],
  };

  function getCrossInfo(ugMajor, targetField) {
    if (ugMajor === targetField) {
      return { isCross: false, distance: 'same', label: '本专业', penalty: 0, bonus: 0 };
    }
    var near = CROSS_NEAR[ugMajor] || [];
    var far = CROSS_FAR[ugMajor] || [];
    if (near.indexOf(targetField) >= 0) {
      return { isCross: true, distance: 'near', label: '近跨专业（常见过渡）', penalty: 0, bonus: 0 };
    }
    if (far.indexOf(targetField) >= 0) {
      return { isCross: true, distance: 'far', label: '远跨专业（难度较高）', penalty: -8, bonus: 0 };
    }
    return { isCross: true, distance: 'medium', label: '中度跨专业', penalty: -3, bonus: 0 };
  }

  // ==================== ⭐ V4: 软背景加分 ====================
  function calcSoftBonus(checks) {
    var count = 0;
    if (checks.research) count++;
    if (checks.intern) count++;
    if (checks.competition) count++;
    if (checks.paper) count++;
    var bonuses = [0, 3, 5, 7, 8];
    return bonuses[Math.min(count, 4)];
  }

  // ==================== ⭐ V4: 多语言 → 等效雅思 ====================
  function toIeltsEquivalent(val, type) {
    if (type === 'ielts' || !type || !val) return val;
    if (type === 'toefl') {
      // 托福 100 → 雅思 7.0, 120 → 9.0
      return Math.round(Math.max(4.0, Math.min(9.0, val * 0.065 + 0.5)) * 10) / 10;
    }
    if (type === 'cet6') {
      // 六级 500 → ~雅思 6.0, 600 → ~7.0
      return Math.round(Math.max(4.0, Math.min(9.0, (val - 200) / 50 + 2)) * 10) / 10;
    }
    return null;
  }

  // ==================== 百分位计算 ====================
  function calcPercentile(val, q) {
    if (!q || q[0] == null) return 50;
    var p25 = q[0], p50 = q[1], p75 = q[2];
    if (val < p25) { var span = p50 - p25; if (span <= 0) span = 5; return Math.max(0, 25 - ((p25 - val) / span) * 20); }
    if (val < p50) { var span = p50 - p25; if (span <= 0) return 37; return 25 + ((val - p25) / span) * 25; }
    if (val < p75) { var span = p75 - p50; if (span <= 0) return 62; return 50 + ((val - p50) / span) * 25; }
    var span = p75 - p50; if (span <= 0) span = 5;
    return Math.min(99, 75 + ((val - p75) / span) * 20);
  }

  function calcOverall(gpaPct, langPct, hasLang) {
    if (!hasLang || langPct == null) return gpaPct;
    return gpaPct * 0.65 + langPct * 0.35;
  }

  function classifyTier(overall) {
    if (overall < 35) return 'reach';
    if (overall < 65) return 'match';
    return 'safe';
  }

  // ==================== 初始化 ====================
  var el;
  if (el = document.getElementById('stat-cases')) el.textContent = DATA.meta.total_cases.toLocaleString();
  if (el = document.getElementById('stat-schools')) el.textContent = DATA.schools.length;
  if (el = document.getElementById('stat-combos')) el.textContent = DATA.meta.combos_count;

  // ==================== ⭐ V4: 院校可搜索下拉 ====================
  var schoolInput = document.getElementById('undergrad');
  var schoolDropdown = document.getElementById('school-dropdown');
  var layerDisplay = document.getElementById('layer-display');

  // 收集所有院校：从 data.js schools + 985/211 列表 + 常见双非
  var allSchoolsSet = {};
  DATA.schools.forEach(function(s) { allSchoolsSet[s.school] = true; });
  S985.forEach(function(s) { allSchoolsSet[s] = true; });
  S211.forEach(function(s) { allSchoolsSet[s] = true; });
  var extraSchools = ['深圳大学','华东政法大学','上海政法学院','首都经济贸易大学',
    '南京审计大学','浙江工商大学','广东外语外贸大学','上海理工大学',
    '杭州电子科技大学','南京信息工程大学','广东工业大学','广州大学',
    '上海海事大学','北京工业大学','南方科技大学','中国科学院大学',
    '澳门科技大学','澳门大学','香港中文大学（深圳）','温州肯恩大学',
    '北京师范大学-香港浸会大学联合国际学院','广东以色列理工学院','香港浸会大学',
    '香港教育大学','香港岭南大学','香港树仁大学','香港恒生大学',
    '中国社会科学院大学','外交学院','国际关系学院','北京语言大学',
    '上海对外经贸大学','南京邮电大学','南京工业大学'];
  extraSchools.forEach(function(s) { allSchoolsSet[s] = true; });
  var ALL_SCHOOLS = Object.keys(allSchoolsSet).sort();

  // 为搜索构建索引（含别名）
  var schoolSearchIndex = [];
  ALL_SCHOOLS.forEach(function(s) {
    schoolSearchIndex.push({ full: s, search: s });
  });
  // 别名也加入搜索
  Object.keys(SCHOOL_ALIASES).forEach(function(alias) {
    schoolSearchIndex.push({ full: SCHOOL_ALIASES[alias], search: alias + ' ' + SCHOOL_ALIASES[alias] });
  });

  function updateLayerBadge() {
    var v = schoolInput.value.trim();
    if (v.length >= 2) {
      var layer = inferLayer(v);
      var cls = layer === '985' ? 'l985' : layer === '211' ? 'l211' :
                layer === '中外合作' ? 'l中外' : 'l双非';
      var resolved = resolveSchool(v);
      var display = (resolved !== v && resolved) ? layer + '（识别为：' + resolved + '）' : layer;
      layerDisplay.innerHTML = '<span class="layer-badge ' + cls + '">' + display + '</span>';
    } else { layerDisplay.innerHTML = ''; }
  }

  function filterSchools(query) {
    var q = query.toLowerCase().trim();
    if (q.length < 1) return ALL_SCHOOLS.slice(0, 30);
    var results = [];
    schoolSearchIndex.forEach(function(entry) {
      if (entry.search.toLowerCase().indexOf(q) >= 0) {
        if (results.indexOf(entry.full) < 0) results.push(entry.full);
      }
    });
    // 模糊匹配
    if (results.length < 5) {
      ALL_SCHOOLS.forEach(function(s) {
        if (results.indexOf(s) >= 0) return;
        var match = 0;
        for (var i = 0; i < q.length; i++) {
          if (s.toLowerCase().indexOf(q[i]) >= 0) match++;
        }
        if (match >= q.length * 0.7) results.push(s);
      });
    }
    return results.slice(0, 20);
  }

  function showDropdown(results) {
    if (!results || results.length === 0) {
      schoolDropdown.innerHTML = '<div class="sd-item" style="color:var(--muted);cursor:default;">未找到匹配院校，请手动输入全称</div>';
      schoolDropdown.style.display = 'block';
      return;
    }
    var html = '';
    results.forEach(function(s) {
      var aliasHint = '';
      Object.keys(SCHOOL_ALIASES).forEach(function(k) {
        if (SCHOOL_ALIASES[k] === s) { aliasHint = ' <small>（' + k + '）</small>'; }
      });
      html += '<div class="sd-item" data-school="' + s.replace(/"/g, '&quot;') + '">' + s + aliasHint + '</div>';
    });
    schoolDropdown.innerHTML = html;
    schoolDropdown.style.display = 'block';

    // 绑定点击
    var items = schoolDropdown.querySelectorAll('.sd-item');
    items.forEach(function(item) {
      item.addEventListener('click', function() {
        schoolInput.value = this.getAttribute('data-school');
        schoolDropdown.style.display = 'none';
        updateLayerBadge();
        updateCrossStatus();
      });
    });
  }

  schoolInput.addEventListener('input', function() {
    updateLayerBadge();
    showDropdown(filterSchools(this.value));
  });
  schoolInput.addEventListener('focus', function() {
    showDropdown(filterSchools(this.value));
  });
  schoolInput.addEventListener('blur', function() {
    setTimeout(function() { schoolDropdown.style.display = 'none'; }, 200);
  });
  document.addEventListener('click', function(e) {
    if (!schoolInput.contains(e.target) && !schoolDropdown.contains(e.target)) {
      schoolDropdown.style.display = 'none';
    }
  });

  // ==================== ⭐ V4: GPA 模式切换 ====================
  var gpaScale = '100';
  var gpaScaleBtns = document.querySelectorAll('.gpa-tab');
  var gpaInput100 = document.getElementById('gpa');
  var gpaInput4 = document.getElementById('gpa-4');
  var gpaHintText = document.getElementById('gpa-hint');

  gpaScaleBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      gpaScaleBtns.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      gpaScale = this.getAttribute('data-scale');
      if (gpaScale === '4') {
        gpaInput100.style.display = 'none';
        gpaInput4.style.display = 'block';
        gpaHintText.textContent = '最终将自动转换为百分制进行对比';
        // 如果百分制输入框有值, 尝试转换
        if (gpaInput100.value && parseFloat(gpaInput100.value) > 5.5) {
          gpaInput4.value = Math.round(parseFloat(gpaInput100.value) / 25 * 100) / 100;
        }
      } else {
        gpaInput100.style.display = 'block';
        gpaInput4.style.display = 'none';
        gpaHintText.textContent = '4分制请切换标签，系统会自动换算';
        if (gpaInput4.value) {
          gpaInput100.value = Math.round(parseFloat(gpaInput4.value) * 25 * 100) / 100;
        }
      }
    });
  });

  // 智能检测：用户输入后检测量纲
  gpaInput100.addEventListener('input', function() {
    var v = parseFloat(this.value);
    if (!isNaN(v) && v > 0 && v < 5.5) {
      gpaHintText.textContent = '⚠ 输入值偏低，是否为4分制？请切换到「4分制」标签';
      gpaHintText.style.color = '#c9622e';
    } else {
      gpaHintText.textContent = '4分制请切换标签，系统会自动换算';
      gpaHintText.style.color = '';
    }
  });

  // ==================== 跨专业状态（含距离） ====================
  var undergradMajorSel = document.getElementById('undergrad-major');
  var fieldSel = document.getElementById('field');
  var crossStatus = document.getElementById('cross-status');

  function updateCrossStatus() {
    var ug = undergradMajorSel.value, tgt = fieldSel.value;
    if (ug && tgt) {
      crossStatus.style.display = 'block';
      var info = getCrossInfo(ug, tgt);
      if (info.distance === 'same') {
        crossStatus.innerHTML = '<span class="cross-badge same">✓ 本专业：本科与目标领域一致</span>';
      } else if (info.distance === 'near') {
        crossStatus.innerHTML = '<span class="cross-badge near">🔄 近跨专业：常见自然过渡，录取难度接近本专业</span>';
      } else if (info.distance === 'medium') {
        crossStatus.innerHTML = '<span class="cross-badge medium">⚠ 中度跨专业：有一定跨度，建议材料突出关联性</span>';
      } else {
        crossStatus.innerHTML = '<span class="cross-badge far">⚠⚠ 远跨专业：跨度较大，录取难度显著提高</span>';
      }
    } else { crossStatus.style.display = 'none'; }
  }
  undergradMajorSel.addEventListener('change', updateCrossStatus);
  fieldSel.addEventListener('change', updateCrossStatus);

  // ==================== 语言类型切换 ====================
  var regionChecks = document.getElementById('region-checks');
  var langTypeSelect = document.getElementById('lang-type');
  var langInputGroup = document.getElementById('lang-input-group');
  var langInput = document.getElementById('lang-score');
  var langPlaceholder = '请输入成绩';

  langTypeSelect.addEventListener('change', function() {
    var type = this.value;
    langInputGroup.style.display = type ? 'flex' : 'none';
    if (type === 'ielts') { langInput.placeholder = '如 7.0'; langInput.step = '0.5'; langInput.max = '9'; langInput.min = '0'; }
    else if (type === 'toefl') { langInput.placeholder = '如 100'; langInput.step = '1'; langInput.max = '120'; langInput.min = '0'; }
    else if (type === 'cet6') { langInput.placeholder = '如 500'; langInput.step = '1'; langInput.max = '710'; langInput.min = '0'; }
    langInput.value = '';
  });

  // ==================== 评估主流程 ====================
  window.runEvaluation = function() {
    var schoolRaw = schoolInput.value.trim();
    var undergradMajor = undergradMajorSel.value;
    var gpaRaw = parseFloat(gpaScale === '4' ? gpaInput4.value : gpaInput100.value);
    var langType = langTypeSelect.value;
    var langRaw = langType ? parseFloat(langInput.value) : NaN;
    var field = fieldSel.value;
    var selectedRegions = [];
    regionChecks.querySelectorAll('input:checked').forEach(function(cb) { selectedRegions.push(cb.value); });

    // 软背景
    var softChecks = {
      research: document.getElementById('cb-research') && document.getElementById('cb-research').checked,
      intern: document.getElementById('cb-intern') && document.getElementById('cb-intern').checked,
      competition: document.getElementById('cb-competition') && document.getElementById('cb-competition').checked,
      paper: document.getElementById('cb-paper') && document.getElementById('cb-paper').checked
    };

    // 校验
    if (!schoolRaw) { alert('请选择本科院校'); return; }
    if (!undergradMajor) { alert('请选择本科专业领域'); return; }
    if (isNaN(gpaRaw) || gpaRaw <= 0) { alert('请输入有效的 GPA'); return; }
    if (gpaScale === '100' && gpaRaw > 100) { alert('百分制 GPA 应在 0-100 之间'); return; }
    if (gpaScale === '4' && gpaRaw > 4.5) { alert('4 分制 GPA 应在 0-4.5 之间'); return; }
    if (langType && isNaN(langRaw)) { alert('请输入语言成绩'); return; }
    if (!field) { alert('请选择意向专业领域'); return; }
    if (selectedRegions.length === 0) { alert('请至少选择一个意向地区'); return; }

    // 归一化
    var gpa = normalizeGPA(gpaRaw, gpaScale);
    var ieltsEquiv = toIeltsEquivalent(langRaw, langType);
    var hasIelts = ieltsEquiv != null && !isNaN(ieltsEquiv);

    var school = resolveSchool(schoolRaw);
    var layer = inferLayer(schoolRaw);
    var crossInfo = getCrossInfo(undergradMajor, field);
    var softBonus = calcSoftBonus(softChecks);
    var crossType = crossInfo.isCross ? 'cross' : 'same';

    // 候选：同 field+region+n>=3, 按优先级
    var candidates = [];
    DATA.combos.forEach(function(c) {
      if (c.field !== field) return;
      if (selectedRegions.indexOf(c.region) < 0) return;
      if (c.n < 3) return;
      var priority = 0;
      if (c.tier === layer) {
        priority = c.cross === crossType ? 4 : (c.cross === 'all' ? 3 : 0);
      } else if (c.tier === 'all') {
        priority = c.cross === crossType ? 2 : (c.cross === 'all' ? 1 : 0);
      }
      if (priority > 0) {
        candidates.push({ combo: c, priority: priority, key: c.school });
      }
    });

    // 每个学校取最高优先级
    var schoolMap = {};
    candidates.forEach(function(item) {
      var existing = schoolMap[item.key];
      if (!existing || item.priority > existing.priority) {
        schoolMap[item.key] = item;
      }
    });

    var results = [];
    Object.keys(schoolMap).forEach(function(k) {
      var item = schoolMap[k];
      var c = item.combo;
      var useTier = (item.priority >= 3);
      var useCross = (item.priority === 4 || item.priority === 2);

      var gpaPct = calcPercentile(gpa, c.gpa);
      var ieltsPct = hasIelts && c.ielts ? calcPercentile(ieltsEquiv, c.ielts) : null;
      var overall = calcOverall(gpaPct, ieltsPct, hasIelts);

      // 层次惩罚
      var tierPenalty = 0;
      var layerKey = c.school + '||' + c.field;
      var layerInfo = DATA.layer_ref[layerKey];
      if (!useTier && layerInfo && layerInfo[layer]) {
        var tierPct = layerInfo[layer];
        if (tierPct < 15) tierPenalty = -15;
        else if (tierPct < 25) tierPenalty = -8;
      }

      // ⭐ V4: 跨专业惩罚 + 软背景加分
      var crossPenalty = crossInfo.penalty;
      var adjustedOverall = Math.max(0, overall + tierPenalty + crossPenalty + softBonus);

      var tier = classifyTier(adjustedOverall);

      results.push({
        school: c.school, region: c.region, field: c.field, n: c.n,
        gpaQ: c.gpa, ieltsQ: c.ielts,
        gpaPct: Math.round(gpaPct),
        ieltsPct: ieltsPct != null ? Math.round(ieltsPct) : null,
        overall: Math.round(overall),
        adjustedOverall: Math.round(adjustedOverall),
        tier: tier,
        useTier: useTier,
        useCross: useCross,
        tierPenalty: tierPenalty,
        crossPenalty: crossPenalty,
        softBonus: softBonus,
        isCross: crossInfo.isCross,
        crossDistance: crossInfo.distance,
        layerKey: layerKey
      });
    });

    results.sort(function(a, b) { return b.adjustedOverall - a.adjustedOverall; });

    var reach = results.filter(function(r) { return r.tier === 'reach'; }).slice(0, 8);
    var match = results.filter(function(r) { return r.tier === 'match'; }).slice(0, 10);
    var safe = results.filter(function(r) { return r.tier === 'safe'; }).slice(0, 6);

    renderResults({
      school: school, schoolRaw: schoolRaw, undergradMajor: undergradMajor,
      gpa: gpa, gpaRaw: gpaRaw, gpaScale: gpaScale,
      ieltsEquiv: ieltsEquiv, langType: langType, langRaw: langRaw,
      field: field, layer: layer, regions: selectedRegions,
      hasIelts: hasIelts, isCross: crossInfo.isCross,
      crossDistance: crossInfo.distance, crossLabel: crossInfo.label,
      softChecks: softChecks, softBonus: softBonus
    }, { reach: reach, match: match, safe: safe });
  };

  // ==================== 渲染 ====================
  function renderResults(student, tiers) {
    var html = '';

    html += '<div class="data-note"><div class="title">📌 算法说明</div>';
    html += '基于历史录取案例。';
    html += '<strong></strong>：① GPA 自动识别 4/100 分制；② 院校缩写/别名识别；③ 跨专业距离分级（近/中/远）；④ 软背景（科研/实习/竞赛/论文）加分；⑤ 多语言支持（雅思/托福/六级）。</div>';

    // 学生画像
    html += '<div class="student-summary"><h3>学生画像</h3><div class="tags">';
    html += '<span class="tag">院校：' + student.school + '</span>';
    html += '<span class="tag">层次：<span class="v">' + student.layer + '</span></span>';
    html += '<span class="tag">本科：<span class="v">' + student.undergradMajor + '</span></span>';
    html += '<span class="tag">GPA：<span class="v">' + student.gpa + '</span>';
    if (student.gpaScale === '4') html += '<small>（' + student.gpaRaw + '/4.0 → ' + student.gpa + ' 百分制）</small>';
    html += '</span>';
    if (student.hasIelts) {
      var langLabel = student.langType === 'toefl' ? '托福' : student.langType === 'cet6' ? '六级' : '雅思';
      html += '<span class="tag">' + langLabel + '：<span class="v">' + student.langRaw + '</span>（等效雅思 ' + student.ieltsEquiv + '）</span>';
    }
    html += '<span class="tag">目标：<span class="v">' + student.field + '</span></span>';
    html += '<span class="tag">地区：<span class="v">' + student.regions.join('、') + '</span></span>';
    if (student.isCross) {
      var distCls = student.crossDistance === 'near' ? 'near' : student.crossDistance === 'far' ? 'far' : 'medium';
      html += '<span class="tag" style="background:var(--bg-cross-' + distCls + ');color:var(--cross-' + distCls + ');font-weight:700;">⚠ ' + student.crossLabel + '</span>';
    } else {
      html += '<span class="tag" style="background:#e8f5ee;color:#2a9d8f;font-weight:700;">✓ 本专业</span>';
    }
    if (student.softBonus > 0) {
      var softParts = [];
      if (student.softChecks.research) softParts.push('科研');
      if (student.softChecks.intern) softParts.push('实习');
      if (student.softChecks.competition) softParts.push('竞赛');
      if (student.softChecks.paper) softParts.push('论文');
      html += '<span class="tag" style="background:#f0e8fe;color:#7c3aed;font-weight:700;">🔬 软背景 +' + student.softBonus + '（' + softParts.join('+') + '）</span>';
    }
    html += '</div></div>';

    var totalRecs = tiers.reach.length + tiers.match.length + tiers.safe.length;
    if (totalRecs === 0) {
      html += '<div class="results-empty"><div class="icon">🔍</div><p>未找到匹配的候选方案。<br>建议：尝试更换专业领域或增加意向地区。</p></div>';
      document.getElementById('results').innerHTML = html;
      return;
    }

    // 层次调整提示
    var hasTierAdjust = tiers.reach.concat(tiers.match, tiers.safe).some(function(r) { return !r.useTier && r.tierPenalty < 0; });
    if (hasTierAdjust) {
      html += '<div class="data-note" style="background:#fef0e8;border-color:#e8b974;color:#7a4f1e;"><div class="title" style="color:#9a6b2e;">⚠ 层次调整说明</div>';
      html += '该生为 <strong>' + student.layer + '</strong> 背景，部分推荐院校的' + student.layer + '录取案例较少，系统使用了全局基准并进行了<strong>层次惩罚</strong>。标注「全局基准」的院校推荐结果相对乐观，实际难度可能高于显示分数。</div>';
    }

    if (student.isCross && student.crossDistance === 'far') {
      html += '<div class="data-note" style="background:#fef0f0;border-color:#e8a0a0;color:#7a2020;"><div class="title" style="color:#9a2b2b;">⚠ 远跨专业警告</div>';
      html += '该生为<strong>远跨专业</strong>申请，录取难度显著高于本专业申请者。系统已应用<strong>跨专业惩罚（-8分）</strong>，强烈建议在申请材料中充分论证与目标专业的关联性。</div>';
    } else if (student.isCross) {
      html += '<div class="data-note" style="background:#fef3e8;border-color:#e8b974;color:#7a4f1e;"><div class="title" style="color:#9a6b2e;">⚠ 跨专业评估提示</div>';
      html += '该生为<strong>跨专业</strong>申请，系统已使用跨专业录取者的历史分布作为基准。建议在申请材料中突出与目标专业的关联性。</div>';
    }

    if (student.softBonus > 0) {
      html += '<div class="data-note" style="background:#f0f5fe;border-color:#a0c0e8;color:#1a3a6e;"><div class="title" style="color:#1a56db;">🔬 软背景加分说明</div>';
      html += '基于您填写的科研/实习/竞赛/论文经历，整体评估已获得<strong> +' + student.softBonus + ' 分</strong>的软背景加成。此加分为辅助参考，不能完全替代对申请材料的综合评估。</div>';
    }

    if (tiers.reach.length > 0) {
      html += renderTier('reach', '冲刺', '历史录取者中多数成绩高于该生，录取难度较大', tiers.reach, student);
    } else {
      html += '<div class="result-section"><div class="result-header reach"><h3>冲刺</h3><span class="count">0</span></div><div style="padding:1.5rem;color:var(--muted);font-size:0.88rem;text-align:center;">当前条件下无冲刺院校</div></div>';
    }
    if (tiers.match.length > 0) {
      html += renderTier('match', '匹配', '学生成绩处于历史录取分布的中段，录取把握较大', tiers.match, student);
    } else {
      html += '<div class="result-section"><div class="result-header match"><h3>匹配</h3><span class="count">0</span></div><div style="padding:1.5rem;color:var(--muted);font-size:0.88rem;text-align:center;">当前条件下无匹配院校</div></div>';
    }
    if (tiers.safe.length > 0) {
      html += renderTier('safe', '保底', '学生成绩高于历史录取者多数，录取把握高', tiers.safe, student);
    } else {
      html += '<div class="result-section"><div class="result-header safe"><h3>保底</h3><span class="count">0</span></div><div style="padding:1.5rem;color:var(--muted);font-size:0.88rem;text-align:center;">当前条件下无保底院校</div></div>';
    }

    html += '<div class="disclaimer"><strong>⚠️ 结果说明</strong><br>';
    html += '1. V4 算法使用 <strong>同层次院校基准</strong>进行对比（985 vs 985、双非 vs 双非），避免跨层次误判。<br>';
    html += '2. 标注「全局基准」的院校表示该层次历史案例不足，使用全局统计+层次惩罚，结果相对保守。<br>';
    html += '3. 仅含录取成功案例，"冲刺/匹配/保底"为相对定位，<strong>非绝对录取概率</strong>。<br>';
    html += '4. 软背景加分为辅助参考；建议结合顾问人工经验综合判断。</div>';

    document.getElementById('results').innerHTML = html;

    document.querySelectorAll('.rec-item').forEach(function(item) {
      item.addEventListener('click', function() { this.classList.toggle('expanded'); });
    });

    // 滚动到结果区
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderTier(tier, name, desc, list, student) {
    var html = '<div class="result-section">';
    html += '<div class="result-header ' + tier + '"><h3>' + name + '</h3>';
    html += '<span class="desc">' + desc + '</span>';
    html += '<span class="count">' + list.length + ' 所</span></div>';
    html += '<div class="rec-list">';
    list.forEach(function(r) { html += renderRecItem(r, tier, student); });
    html += '</div></div>';
    return html;
  }

  function renderRecItem(r, tier, student) {
    var html = '<div class="rec-item">';
    html += '<div class="rec-item-top">';
    html += '<span class="school-name">' + r.school + '</span>';
    html += '<span class="region-tag">' + r.region + '</span>';

    var benchmarkLabel = '', benchmarkStyle = '';
    if (r.useTier && r.useCross) {
      benchmarkLabel = student.isCross ? '跨专业+同层次' : '本专业+同层次';
      benchmarkStyle = 'background:#e8f5ee;color:#2a9d8f;';
    } else if (r.useTier) {
      benchmarkLabel = '同层次基准';
      benchmarkStyle = 'background:#e8f5ee;color:#2a9d8f;';
    } else if (r.useCross) {
      benchmarkLabel = student.isCross ? '跨专业基准' : '本专业基准';
      benchmarkStyle = 'background:#e8f0fe;color:#1a56db;';
    } else {
      benchmarkLabel = '全局基准';
      benchmarkStyle = 'background:#fef3e8;color:#c9622e;';
    }
    html += '<span class="region-tag" style="' + benchmarkStyle + '">' + benchmarkLabel + '</span>';

    var scoreDisplay = r.adjustedOverall;
    var scoreStyle = (r.tierPenalty < 0 || r.crossPenalty < 0) ? 'color:#c9622e;' : '';
    html += '<span class="score ' + tier + '" style="' + scoreStyle + '">' + scoreDisplay + '</span>';
    html += '</div>';

    html += '<div class="field-row">';
    html += '<span class="field-tag">' + r.field + '</span>';
    html += '<span class="field-tag">历史案例 <span class="n">' + r.n + '</span> 例</span>';
    if (r.gpaQ && r.gpaQ[0] != null) {
      html += '<span class="field-tag">GPA P25-P75: <span class="n">' + r.gpaQ[0] + '-' + r.gpaQ[2] + '</span></span>';
    }
    if (r.ieltsQ && r.ieltsQ[0] != null) {
      html += '<span class="field-tag">雅思: <span class="n">' + r.ieltsQ[0] + '-' + r.ieltsQ[2] + '</span></span>';
    }
    if (r.tierPenalty < 0) {
      html += '<span class="field-tag" style="background:#fef3e8;color:#c9622e;">⚠ 层次惩罚 ' + r.tierPenalty + '</span>';
    }
    if (r.crossPenalty < 0) {
      html += '<span class="field-tag" style="background:#fef0f0;color:#9a2b2b;">⚠ 跨专业惩罚 ' + r.crossPenalty + '</span>';
    }
    if (r.softBonus > 0) {
      html += '<span class="field-tag" style="background:#f0e8fe;color:#7c3aed;">🔬 软背景 +' + r.softBonus + '</span>';
    }
    html += '</div>';

    // 展开详情
    html += '<div class="rec-detail">';
    html += '<div class="bar-row">';
    html += '<div class="bar-label"><span>GPA 定位</span><span>该生 <span class="v">' + student.gpa + '</span> / 中位 <span class="v">' + (r.gpaQ[1] || '-') + '</span> / 百分位 <span class="v">' + r.gpaPct + '%</span></span></div>';
    html += renderBar(r.gpaQ, student.gpa);
    html += '</div>';
    if (student.hasIelts && r.ieltsQ && r.ieltsQ[0] != null) {
      html += '<div class="bar-row">';
      html += '<div class="bar-label"><span>语言 定位</span><span>该生 <span class="v">' + student.ieltsEquiv + '</span> / 中位 <span class="v">' + r.ieltsQ[1] + '</span> / 百分位 <span class="v">' + (r.ieltsPct != null ? r.ieltsPct : '-') + '%</span></span></div>';
      html += renderBar(r.ieltsQ, student.ieltsEquiv);
      html += '</div>';
    }

    // 分数拆解
    html += '<div class="layer-info">📈 分数明细：GPA 百分位 ' + r.gpaPct + '%';
    if (r.ieltsPct != null) html += ' + 语言百分位 ' + r.ieltsPct + '%（权重 65/35）';
    html += ' = 综合 ' + r.overall;
    if (r.tierPenalty < 0) html += ' <span style="color:#c9622e;">层次惩罚 ' + r.tierPenalty + '</span>';
    if (r.crossPenalty < 0) html += ' <span style="color:#c9622e;">跨专业惩罚 ' + r.crossPenalty + '</span>';
    if (r.softBonus > 0) html += ' <span style="color:#7c3aed;">软背景 +' + r.softBonus + '</span>';
    html += ' = <strong>最终 ' + r.adjustedOverall + '</strong></div>';

    // 层次分布
    var layerInfo = DATA.layer_ref[r.layerKey];
    if (layerInfo) {
      var parts = [];
      if (layerInfo['985']) parts.push('985 ' + layerInfo['985'] + '%');
      if (layerInfo['211']) parts.push('211 ' + layerInfo['211'] + '%');
      if (layerInfo['双非及其他']) parts.push('双非 ' + layerInfo['双非及其他'] + '%');
      if (layerInfo['中外合作']) parts.push('中外合作 ' + layerInfo['中外合作'] + '%');
      html += '<div class="layer-info">📊 该校该专业录取生源层次：' + parts.join(' ｜ ') + '<br>';
      var pct = layerInfo[student.layer] || 0;
      html += '该生为 <strong>' + student.layer + '</strong>（占比 ' + pct + '%），';
      if (pct >= 30) html += '<strong style="color:var(--safe)">生源结构匹配度高</strong>';
      else if (pct >= 15) html += '<strong style="color:var(--match)">有一定代表性</strong>';
      else html += '<strong style="color:var(--reach)">该层次生源较少，需强软背景支撑</strong>';
      html += '</div>';
    }

    // 跨专业比例
    var crossRatio = DATA.cross_ratio[r.layerKey];
    if (crossRatio != null) {
      html += '<div class="layer-info" style="background:#fef9f0;">🔄 该校该专业历史录取中，跨专业申请者占 <strong style="color:#c9622e;">' + crossRatio + '%</strong>';
      if (student.isCross) {
        if (crossRatio >= 40) html += '，对跨专业<strong style="color:var(--safe)">接受度较高</strong>';
        else if (crossRatio >= 20) html += '，对跨专业<strong style="color:var(--match)">有一定接受度</strong>';
        else html += '，跨专业<strong style="color:var(--reach)">接受度较低</strong>';
      }
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function renderBar(q, val) {
    if (!q || q[0] == null) return '<div class="bar-track"></div>';
    var min = q[0] - (q[2] - q[0]) * 0.3;
    var max = q[2] + (q[2] - q[0]) * 0.3;
    var range = max - min; if (range <= 0) range = 10;
    var p25Pos = Math.max(0, Math.min(100, ((q[0] - min) / range) * 100));
    var p75Pos = Math.max(0, Math.min(100, ((q[2] - min) / range) * 100));
    var valPos = Math.max(0, Math.min(100, ((val - min) / range) * 100));
    var p50Pos = Math.max(0, Math.min(100, ((q[1] - min) / range) * 100));
    var html = '<div class="bar-track">';
    html += '<div class="bar-fill" style="left:' + p25Pos + '%;width:' + (p75Pos - p25Pos) + '%;background:var(--bg3);"></div>';
    html += '<div class="bar-marker" style="left:' + p50Pos + '%;background:var(--muted);opacity:0.5;"></div>';
    html += '<div class="bar-marker" style="left:' + valPos + '%;background:var(--accent);"></div>';
    html += '</div>';
    return html;
  }

  // 回车提交
  document.getElementById('gpa').addEventListener('keydown', function(e) { if (e.key === 'Enter') runEvaluation(); });
  document.getElementById('gpa-4').addEventListener('keydown', function(e) { if (e.key === 'Enter') runEvaluation(); });
  document.getElementById('lang-score').addEventListener('keydown', function(e) { if (e.key === 'Enter') runEvaluation(); });

})();
