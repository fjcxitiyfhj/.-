/* ==========================================================
   X App · Roche 插件 · v2.0.0
   版块：Home（Recommend / Following）· Super（超话）· Discover（搜索 + 下一天热搜）
         · Messages（互动通知）· Me（我的主页）· Char 主页（可改头像/背景/名字/签名）
   角色功能：自动发帖（打开 App 时补发 + 打开期间定时）、评论回复、点赞/评论
   记忆互通：把你的点赞/评论注入到角色的单聊上下文（chat.contextProvider）
   数据（roche.storage）：profile posts charProfiles topics trends settings notifs meta
   → 这些名字从 v1 起固定，升级只加不改，不会丢数据
   ========================================================== */
(function () {
  'use strict'

  var PLUGIN_ID = 'x-app'
  var APP_ID = 'x-app-home'
  var VERSION = '2.0.0'
  var ROOT = 'roche-plugin-x-app'
  var CTX_KEY = 'roche-plugin-x-app:chat-context'

  /* ====================== 样式 ====================== */
  var CSS = `
.${ROOT}{--x-top:0px;position:relative;height:100%;width:100%;display:flex;flex-direction:column;background:#f4f4f6;color:#0b0b0d;overflow:hidden;font-family:-apple-system,"SF Pro Text","Helvetica Neue",Arial,"PingFang SC",sans-serif;-webkit-font-smoothing:antialiased}
.${ROOT} *{box-sizing:border-box}
.${ROOT} button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
.${ROOT} svg{display:block}
.${ROOT} .x-ic{width:18.7px;height:18.7px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.${ROOT} .x-ic.f{fill:currentColor;stroke:none}
.${ROOT} .x-top{display:flex;align-items:center;gap:6.8px;padding:calc(var(--x-top) + 6.8px) 11.9px 6.8px;flex-shrink:0;border-bottom:.4.2px solid #e4e4e8;background:#f4f4f6}
.${ROOT} .x-top.ov{position:absolute;left:0;right:0;top:0;z-index:4;border:0;background:none}
.${ROOT} .x-logo{flex:1;display:flex;justify-content:center}
.${ROOT} .x-logo svg{width:25.5px;height:25.5px}
.${ROOT} .x-tr{display:flex;gap:6.8px;min-width:39.1px;justify-content:flex-end}
.${ROOT} .x-cb{width:39.1px;height:39.1px;border-radius:50%;background:#fff;border:.4.2px solid #e4e4e8;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.${ROOT} .x-cb:active{transform:scale(.93)}
.${ROOT} .x-cb.dark{background:#0b0b0d;color:#fff;border-color:#0b0b0d}
.${ROOT} .x-cb.glass{background:rgba(0,0,0,.32);color:#fff;border:1px solid rgba(255,255,255,.3);backdrop-filter:blur(11.9px);-webkit-backdrop-filter:blur(11.9px)}
.${ROOT} .x-cb .x-ic{width:17px;height:17px}
.${ROOT} .x-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:120px}
.${ROOT} .x-card{background:#fff;border-radius:18.7px;margin:0 11.9px 10.2px;border:.4.2px solid rgba(0,0,0,.04);overflow:hidden}
.${ROOT} .x-ava{border-radius:50%;background:#2b2b2f;color:#fff;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:800}
.${ROOT} .x-ava img{width:100%;height:100%;object-fit:cover}
.${ROOT} .x-htabs{display:flex;justify-content:center;gap:28.9px;padding:11.9px 11.9px 0;border-bottom:.4.2px solid #e4e4e8;margin-bottom:10.2px;background:#f4f4f6}
.${ROOT} .x-htabs button{font-size:17px;font-weight:800;color:#8a8a90;padding-bottom:8.5px;position:relative}
.${ROOT} .x-htabs button.on{color:#0b0b0d}
.${ROOT} .x-htabs button.on:after{content:"";position:absolute;left:50%;bottom:0;width:30.6px;height:3.4px;margin-left:-15.3px;border-radius:2px;background:#0b0b0d}
.${ROOT} .x-comp{display:flex;gap:8.5px;align-items:center;padding:13.6px 11.9px;margin-top:2px}
.${ROOT} .x-comp .x-ava{width:44.2px;height:44.2px;font-size:17.8px}
.${ROOT} .x-comp-mid{flex:1;min-width:0}
.${ROOT} .x-comp input{width:100%;border:0;outline:0;font-size:16px;font-weight:700;background:none;color:#0b0b0d;padding:0}
.${ROOT} .x-comp input::placeholder{color:#0b0b0d}
.${ROOT} .x-tools{display:flex;gap:8.5px;margin-top:5.1px;color:#76767c;font-size:11.9px;font-weight:600;flex-wrap:wrap}
.${ROOT} .x-tools button{display:flex;align-items:center;gap:4.2px}
.${ROOT} .x-tools .x-ic{width:14.4px;height:14.4px}
.${ROOT} .x-postbtn{height:42.5px;padding:0 17px;border-radius:999px;background:#0b0b0d;color:#fff;font-weight:800;font-size:15.3px;flex-shrink:0}
.${ROOT} .x-chip{display:inline-flex;align-items:center;gap:5.1px;background:#f0f0f3;border-radius:999px;padding:3.4px 8.5px;font-size:11px;margin-top:6.8px}
.${ROOT} .x-post{display:flex;gap:9.3px;padding:11.9px 13.6px;border-bottom:.4.2px solid #efeff2}
.${ROOT} .x-post:last-child{border-bottom:0}
.${ROOT} .x-post .x-ava{width:37.4px;height:37.4px;font-size:15.3px}
.${ROOT} .x-pb{flex:1;min-width:0}
.${ROOT} .x-ph{display:flex;align-items:center;gap:4.2px;font-size:12.8px;line-height:1.3}
.${ROOT} .x-pn{font-weight:800;max-width:44%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.${ROOT} .x-ps{color:#76767c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.${ROOT} .x-pm{margin-left:auto;color:#76767c;width:25.5px;height:25.5px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.${ROOT} .x-pt{font-size:13.6px;line-height:1.45;white-space:pre-wrap;word-break:break-word;margin-top:3px}
.${ROOT} .x-tag{color:#0b0b0d;font-weight:800;text-decoration:underline;text-decoration-color:#c9c9cf}
.${ROOT} .x-pi{margin-top:8.5px;border-radius:13.6px;overflow:hidden;border:.4.2px solid #ececf0}
.${ROOT} .x-pi img{width:100%;display:block;max-height:420px;object-fit:cover}
.${ROOT} .x-acts{display:flex;justify-content:space-between;margin-top:6.8px;max-width:330px;color:#76767c}
.${ROOT} .x-act{display:flex;align-items:center;gap:5.1px;font-size:11.9px;min-width:39.1px;height:25.5px}
.${ROOT} .x-act .x-ic{width:16.1px;height:16.1px}
.${ROOT} .x-act.liked{color:#f91880}.${ROOT} .x-act.liked .x-ic{fill:#f91880}
.${ROOT} .x-act.rp{color:#00a870}
.${ROOT} .x-empty{padding:39.1px 20.4px;text-align:center;color:#76767c;font-size:13.6px;font-weight:700;line-height:1.7}
.${ROOT} .x-nav{position:absolute;left:11.9px;right:11.9px;bottom:11.9px;height:57.8px;background:rgba(255,255,255,.97);border:.4.2px solid #e4e4e8;border-radius:28.9px;display:flex;align-items:center;padding:5.1px;box-shadow:0 6.8px 22.1px rgba(0,0,0,.08);z-index:8}
.${ROOT} .x-nv{flex:1;height:100%;border-radius:23.8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:11px;font-weight:800;color:#6b6b72;letter-spacing:.2px}
.${ROOT} .x-nv .x-ic{width:20.4px;height:20.4px}
.${ROOT} .x-nv{position:relative}
.${ROOT} .x-nv.on{background:#050505;color:#fff;flex:1.25;--x-needle:#050505}
.${ROOT} .x-nv .x-badge{position:absolute;top:6.8px;left:calc(50% + 5.1px);min-width:13.6px;height:13.6px;padding:0 3.4px;border-radius:6.8px;background:#f91880;color:#fff;font-size:11px;line-height:13.6px;text-align:center}
.${ROOT} .x-sec{display:flex;align-items:center;justify-content:space-between;padding:15.3px 15.3px 6.8px;font-size:15.3px;font-weight:800}
.${ROOT} .x-sec span{font-size:13.6px;color:#76767c;font-weight:700}
.${ROOT} .x-soft{background:#f4f4f6;border-radius:17px;margin:5.1px 13.6px 13.6px;padding:22.1px 10.2px;text-align:center;color:#76767c;font-weight:700;font-size:13.6px}
.${ROOT} .x-row{display:flex;align-items:center;gap:10.2px;padding:11.9px 13.6px;border-top:.4.2px solid #efeff2}
.${ROOT} .x-row:first-child{border-top:0}
.${ROOT} .x-rt{flex:1;min-width:0}
.${ROOT} .x-rt b{display:block;font-size:14.4px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.${ROOT} .x-rt span{display:block;font-size:11.9px;color:#76767c;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.${ROOT} .x-rh{font-size:14.4px;font-weight:800;color:#76767c}
.${ROOT} .x-fol{height:28.9px;padding:0 13.6px;border-radius:999px;background:#0b0b0d;color:#fff;font-weight:800;font-size:11.9px;flex-shrink:0}
.${ROOT} .x-fol.on{background:#fff;color:#0b0b0d;border:1px solid #d7d7dc}
.${ROOT} .x-search{display:flex;align-items:center;gap:8.5px;background:#fff;border-radius:999px;margin:11.9px 11.9px 10.2px;padding:0 15.3px;height:49.3px;color:#76767c}
.${ROOT} .x-search input{flex:1;border:0;outline:0;background:none;font-size:16px;font-weight:700;color:#0b0b0d;min-width:0}
.${ROOT} .x-search input::placeholder{color:#76767c}
.${ROOT} .x-big{display:flex;align-items:center;justify-content:center;gap:8.5px;height:56.1px;margin:0 11.9px 11.9px;border-radius:999px;background:#050505;color:#fff;font-weight:800;font-size:17px;width:calc(100% - 23.8px)}
.${ROOT} .x-big[disabled]{opacity:.55}
.${ROOT} .x-tr2{display:flex;align-items:center;gap:10.2px;padding:17px 15.3px;border-top:.4.2px solid #efeff2}
.${ROOT} .x-tr2:first-child{border-top:0}
.${ROOT} .x-tr2 small{display:block;font-size:13.6px;color:#76767c;font-weight:600}
.${ROOT} .x-tr2 b{display:block;font-size:18.7px;font-weight:900;margin-top:2px}
.${ROOT} .x-tr2 em{margin-left:auto;font-style:normal;font-weight:900;font-size:17px;color:#76767c}
.${ROOT} .x-banner{height:200px;background:linear-gradient(135deg,#3b4047,#8f97a3);background-size:cover;background-position:center;flex-shrink:0}
.${ROOT} .x-pcard{margin:-28.9px 11.9px 10.2px;background:#fff;border-radius:22.1px;padding:17px 15.3px 15.3px;position:relative}
.${ROOT} .x-pcard .x-bigava{width:112px;height:112px;font-size:37.4px;border:0}
.${ROOT} .x-pbtns{position:absolute;right:15.3px;top:81.6px;display:flex;gap:6.8px}
.${ROOT} .x-pill{height:39.1px;padding:0 18.7px;border-radius:999px;border:1.5px solid #dcdce2;font-weight:800;font-size:14.4px;background:#fff}
.${ROOT} .x-pill.dark{background:#050505;color:#fff;border-color:#050505}
.${ROOT} .x-nm{font-size:27.2px;font-weight:900;line-height:1.1;margin-top:17px;display:flex;align-items:center;gap:6.8px}
.${ROOT} .x-hd{font-size:17px;color:#76767c;font-weight:600;margin-top:5.1px}
.${ROOT} .x-bio{font-size:15.3px;line-height:1.45;margin-top:10.2px;white-space:pre-wrap;word-break:break-word}
.${ROOT} .x-stats{display:flex;gap:10.2px;margin-top:13.6px}
.${ROOT} .x-stat{flex:1;background:#f4f4f6;border-radius:18.7px;padding:13.6px 13.6px 11.9px}
.${ROOT} .x-stat b{display:block;font-size:25.5px;font-weight:900;line-height:1.1}
.${ROOT} .x-stat span{display:block;font-size:13.6px;color:#76767c;font-weight:700;margin-top:5.1px}
.${ROOT} .x-ptabs{display:flex;background:#fff;border-radius:999px;margin:0 11.9px 10.2px;padding:0 17px}
.${ROOT} .x-ptabs button{flex:1;padding:15.3px 0 13.6px;font-size:17px;font-weight:800;color:#8a8a90;position:relative}
.${ROOT} .x-ptabs button.on{color:#0b0b0d}
.${ROOT} .x-ptabs button.on:after{content:"";position:absolute;left:50%;bottom:6.8px;width:32.3px;height:3.4px;margin-left:-16.1px;border-radius:2px;background:#0b0b0d}
.${ROOT} .x-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;padding:3px}
.${ROOT} .x-grid div{aspect-ratio:1;background:#ececef center/cover no-repeat;border-radius:5.1px}
.${ROOT} .x-banner-bar{position:absolute;left:0;right:0;top:calc(var(--x-top) + 56.1px);background:#0b0b0d;color:#fff;font-size:11px;font-weight:700;text-align:center;padding:5.1px;z-index:6;opacity:.9}
.${ROOT} .x-cm{padding:10.2px 13.6px;display:flex;gap:8.5px;border-top:.4.2px solid #efeff2}
.${ROOT} .x-cm .x-ava{width:30.6px;height:30.6px;font-size:12.8px}
.${ROOT} .x-cm .x-cb2{flex:1;min-width:0}
.${ROOT} .x-cm .x-ct{font-size:13.2px;line-height:1.45;white-space:pre-wrap;word-break:break-word;margin-top:2px}
.${ROOT} .x-cin{position:absolute;left:0;right:0;bottom:0;background:#fff;border-top:.4.2px solid #e4e4e8;padding:8.5px 11.9px 13.6px;display:flex;gap:8.5px;z-index:7}
.${ROOT} .x-cin input{flex:1;height:37.4px;border-radius:999px;border:1px solid #dcdce2;padding:0 13.6px;font-size:16px;outline:0}
.${ROOT} .x-dot{width:7.6px;height:7.6px;border-radius:50%;background:#f91880;flex-shrink:0}
.${ROOT} .x-sheet{position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;justify-content:flex-end}
.${ROOT} .x-sheet-back{position:absolute;inset:0;background:rgba(0,0,0,.42)}
.${ROOT} .x-sheet-card{position:relative;background:#fff;border-radius:20.4px 20.4px 0 0;padding:13.6px 13.6px 20.4px;max-height:92%;overflow-y:auto;-webkit-overflow-scrolling:touch}
.${ROOT} .x-sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:10.2px;gap:6.8px}
.${ROOT} .x-sh h3{margin:0;font-size:15.3px;font-weight:800}
.${ROOT} .x-btn{height:32.3px;padding:0 15.3px;border-radius:999px;background:#0b0b0d;color:#fff;font-weight:800;font-size:12.8px;flex-shrink:0}
.${ROOT} .x-btn.ghost{background:#fff;color:#0b0b0d;border:1px solid #d7d7dc}
.${ROOT} .x-btn.danger{background:#fff;color:#d4183d;border:1px solid #f0b8c4}
.${ROOT} .x-btn[disabled]{opacity:.4}
.${ROOT} textarea,.${ROOT} .x-sheet input[type=text],.${ROOT} .x-sheet input[type=number],.${ROOT} select{width:100%;border:1px solid #d7d7dc;border-radius:10.2px;padding:9.3px 10.2px;font:inherit;font-size:13.6px;outline:none;background:#fff;color:#0b0b0d}
.${ROOT} textarea{resize:none;min-height:100px;line-height:1.45}
.${ROOT} label.x-l{display:block;font-size:11px;color:#76767c;margin:11.9px 0 4.2px;font-weight:700}
.${ROOT} .x-two{display:flex;gap:8.5px}.${ROOT} .x-two>*{flex:1}
.${ROOT} .x-tool{display:flex;align-items:center;gap:8.5px;margin-top:8.5px;flex-wrap:wrap}
.${ROOT} .x-prev{margin-top:8.5px;position:relative;border-radius:11.9px;overflow:hidden}
.${ROOT} .x-prev img{width:100%;max-height:240px;object-fit:cover;display:block}
.${ROOT} .x-prev button{position:absolute;right:6.8px;top:6.8px;width:25.5px;height:25.5px;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;display:flex;align-items:center;justify-content:center}
.${ROOT} .x-hint{font-size:11px;color:#76767c;line-height:1.55;margin-top:5.1px}
.${ROOT} .x-ck{display:flex;align-items:center;gap:8.5px;padding:7.6px 0;font-size:12.8px;font-weight:600}
.${ROOT} .x-ck input{width:17px;height:17px;accent-color:#0b0b0d;flex-shrink:0}
.${ROOT} .x-h4{font-size:12.8px;font-weight:800;margin:18.7px 0 3.4px;padding-top:11.9px;border-top:.4.2px solid #ececf0}
.${ROOT} .x-wb{margin-left:11.9px;border-left:1.5px solid #ececf0;padding-left:8.5px}
.${ROOT} .x-chars{display:flex;gap:8.5px;overflow-x:auto;padding:3.4px 0 6.8px}
.${ROOT} .x-chr{flex-shrink:0;width:64.6px;text-align:center;font-size:11px;color:#76767c;opacity:.55}
.${ROOT} .x-chr.on{opacity:1;color:#0b0b0d;font-weight:800}
.${ROOT} .x-chr .x-ava{width:45.9px;height:45.9px;margin:0 auto 3.4px;font-size:18.7px;border:2px solid transparent}
.${ROOT} .x-chr.on .x-ava{border-color:#0b0b0d}
.${ROOT} .x-pick{display:flex;align-items:center;gap:10.2px;flex-wrap:wrap}
.${ROOT} .x-pick .x-ava{width:51px;height:51px;font-size:20.4px}
`

  /* ====================== 小工具 ====================== */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    })
  }
  function fmt(n) {
    n = Number(n) || 0
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
    if (n >= 1e4) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
    return String(n)
  }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  function ago(ts) {
    var s = (Date.now() - ts) / 1000
    if (s < 60) return 'now'
    if (s < 3600) return Math.floor(s / 60) + 'm'
    if (s < 86400) return Math.floor(s / 3600) + 'h'
    var d = new Date(ts)
    return MON[d.getMonth()] + ' ' + d.getDate()
  }
  function agoZh(ts) {
    var s = (Date.now() - ts) / 1000
    if (s < 90) return '刚刚'
    if (s < 3600) return Math.floor(s / 60) + '分钟前'
    if (s < 86400) return Math.floor(s / 3600) + '小时前'
    return Math.floor(s / 86400) + '天前'
  }
  function uid() {
    return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'p' + Date.now() + Math.random().toString(16).slice(2)
  }
  function initial(name) { return esc(String(name || '?').trim().charAt(0).toUpperCase() || '?') }
  function clip(s, n) { s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n) + '…' : s }
  function hash(s) { var h = 0; s = String(s); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)) }
  function clean(t) {
    t = String(t || '').trim()
    t = t.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim()
    t = t.replace(/^["“「『]+|["”」』]+$/g, '').trim()
    t = t.replace(/^(帖子|正文|回复|评论|Post|Reply)\s*[:：]\s*/i, '').trim()
    return t
  }

  function ic(p, f) { return '<svg class="x-ic' + (f ? ' f' : '') + '" viewBox="0 0 24 24">' + p + '</svg>' }
  var I = {
    x: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.9 2H22l-7.2 8.2L23 22h-6.5l-5-6.6L5.7 22H2.6l7.7-8.8L2 2h6.6l4.5 6L18.9 2zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20z"/></svg>',
    back: ic('<path d="M15 5l-7 7 7 7"/>'),
    search: ic('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
    pen: ic('<path d="M4 20l1-4.2L16.6 4.2a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8.2 19z"/><path d="M14.5 6.3l3.2 3.2"/>'),
    gear: ic('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    plus: ic('<path d="M12 5v14M5 12h14"/>'),
    check: ic('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    close: ic('<path d="M6 6l12 12M18 6 6 18"/>'),
    reply: ic('<path d="M3 11.5C3 7.4 6.4 4 10.5 4h3C17.6 4 21 7.4 21 11.5S17.6 19 13.5 19H12l-5 3v-3.3C4.6 17.6 3 14.8 3 11.5z"/>'),
    repost: ic('<path d="M17 3l4 4-4 4M3 11V9a2 2 0 0 1 2-2h16M7 21l-4-4 4-4M21 13v2a2 2 0 0 1-2 2H3"/>'),
    heart: ic('<path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 2.9 4.6 6.4 4.6c2 0 3.6 1.1 4.6 2.7l1 1.6 1-1.6c1-1.6 2.6-2.7 4.6-2.7 3.5 0 5.5 3.7 4 7.1C19.5 16.4 12 21 12 21z"/>'),
    share: ic('<path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>'),
    more: ic('<circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/>', 1),
    image: ic('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M4 18l5.5-5 4 3.5 3-2.5L21 17"/>'),
    hash: ic('<path d="M5 9h15M4 15h15M10 4 8 20M16 4l-2 16"/>'),
    spark: ic('<path d="M12 3l1.9 5.4L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.6z"/><path d="M19 16v4M17 18h4"/>'),
    arrow: ic('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    chev: ic('<path d="M6 9l6 6 6-6"/>'),
    home: ic('<path d="M12 3 3 10.4V21h6.4v-6.2h5.2V21H21V10.4z"/>', 1),
    super: ic('<path d="M5 9h15M4 15h15M10 4 8 20M16 4l-2 16" stroke-width="2.6"/>'),
    compass: ic('<circle cx="12" cy="12" r="9" fill="currentColor" stroke="none"/><path d="M15.5 8.5l-2 5-5 2 2-5z" style="stroke:var(--x-needle,#fff);fill:var(--x-needle,#fff)" stroke-width="1.4"/>'),
    mail: ic('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>'),
    me: ic('<circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.6 3-5.6 7-5.6s7 2 7 5.6z"/>'),
    cal: ic('<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>')
  }

  /* ====================== 默认设置 ====================== */
  var DEFAULT_STYLE = '像真人随手发的社交平台帖子：口语化，有具体的小细节或情绪；不总结、不升华、不说教；不用排比和华丽比喻；不要“仿佛/宛如/不禁/或许/似乎”这类文艺腔；不要刻意以“今天/此刻”点题开头；不要出现“作为……”；允许半句话、省略号、碎碎念。'
  function defaultSettings() {
    return {
      auto: { enabled: false, intervalMin: 60, maxCatchup: 2, chars: {} },
      lang: 'zh', length: 'short', emoji: 'some', hashtags: 'rare', style: DEFAULT_STYLE,
      ctx: { chat: 20, mem: true },
      wb: { cats: [], entries: [], limit: 1500 },
      reply: { on: true },
      interact: { on: true, chance: 60, max: 2 },
      img: { chance: 0 },
      mem: { inject: true, write: false }
    }
  }
  function mergeSettings(saved) {
    var d = defaultSettings()
    if (!saved) return d
    Object.keys(d).forEach(function (k) {
      if (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k])) d[k] = Object.assign(d[k], saved[k] || {})
      else if (saved[k] !== undefined) d[k] = saved[k]
    })
    return d
  }

  /* ====================== 主聊天注入（记忆互通） ====================== */
  function readCtx(ctx) {
    try {
      var cid = (ctx && ctx.contact && ctx.contact.id) || (ctx && ctx.conversation && ctx.conversation.contactId)
      var raw = localStorage.getItem(CTX_KEY)
      if (!cid || !raw) return null
      var o = JSON.parse(raw)
      if (!o || o.on === false) return null
      return (o.map && o.map[cid]) || null
    } catch (e) { return null }
  }

  /* ====================== 注册插件 ====================== */
  window.RochePlugin.register({
    id: PLUGIN_ID,
    name: 'X',
    version: VERSION,
    chat: {
      scope: { conversationTypes: ['direct'] },
      contextProvider: function (ctx) { return readCtx(ctx) }
    },
    apps: [{
      id: APP_ID,
      name: 'X',
      icon: 'alternate_email',
      iconImage: '',
      async mount(container, roche) {
        var S = roche.storage
        var profile, posts = [], charProfiles = {}, topics = [], trends = { day: 0, list: [] }, settings, notifs = [], meta = {}
        var chars = [], charMap = {}, fullCache = {}
        var stack = [{ t: 'home' }]
        var homeTab = 'rec', ptab = 'posts', searchQ = ''
        var qtext = '', qimg = ''
        var sheetEl = null, draft = { text: '', image: '' }
        var charState = { sel: '', topic: '', preview: '', busy: false }
        var editImgs = { avatar: null, banner: null }
        var autoBusy = false, banner = '', timer = null, dayBusy = false, alive = true
        var wbTree = null

        var styleEl = document.createElement('style')
        styleEl.textContent = CSS
        container.replaceChildren()
        var root = document.createElement('div')
        root.className = ROOT
        container.appendChild(styleEl)
        container.appendChild(root)

        /* ---------- 存取 ---------- */
        async function load() {
          profile = await S.get('profile')
          if (!profile) {
            profile = { name: 'Nana', handle: 'nana', bio: '', avatar: '', banner: '', following: 0, followers: 0, joinedAt: Date.now() }
            try {
              var u = await roche.persona.getActiveUserPersona()
              if (u) {
                profile.name = u.name || u.handle || profile.name
                profile.handle = String(u.handle || u.name || profile.handle).replace(/\s+/g, '_')
                profile.bio = u.bio || ''
                profile.avatar = u.avatar || ''
              }
            } catch (e) {}
            await S.set('profile', profile)
          }
          posts = (await S.get('posts')) || []
          posts.forEach(function (p) { p.comments = p.comments || []; p.topics = p.topics || [] })
          charProfiles = (await S.get('charProfiles')) || {}
          topics = (await S.get('topics')) || []
          trends = (await S.get('trends')) || { day: 0, list: [] }
          settings = mergeSettings(await S.get('settings'))
          notifs = (await S.get('notifs')) || []
          meta = (await S.get('meta')) || {}
          meta.schema = 2; meta.pluginVersion = VERSION; meta.lastAuto = meta.lastAuto || {}
          try { chars = (await roche.character.list()) || [] } catch (e) { chars = [] }
          chars.forEach(function (c) { charMap[c.id] = c })
          await S.set('meta', meta)
        }
        var sProfile = function () { return S.set('profile', profile) }
        var sPosts = function () { return S.set('posts', posts) }
        var sCP = function () { return S.set('charProfiles', charProfiles) }
        var sTopics = function () { return S.set('topics', topics) }
        var sTrends = function () { return S.set('trends', trends) }
        var sSettings = function () { return S.set('settings', settings) }
        var sNotifs = function () { return S.set('notifs', notifs.slice(0, 200)) }
        var sMeta = function () { return S.set('meta', meta) }

        /* ---------- 角色资料（可在 X 里单独改，不影响 Roche 本体） ---------- */
        function cp(id) { return charProfiles[id] || {} }
        function cName(c) { return cp(c.id).name || c.handle || c.name || 'Character' }
        function cHandle(c) { return String(cp(c.id).handle || c.handle || c.name || 'character').replace(/^@+/, '').replace(/\s+/g, '_') }
        function cAvatar(c) { return cp(c.id).avatar || c.avatar || '' }
        function cBio(c) { var o = cp(c.id); return o.bio != null ? o.bio : (c.bio || '') }
        function cFollowers(c) { var o = cp(c.id); return o.followers != null ? o.followers : 800 + hash(c.id) % 90000 }
        function cFollowing(c) { var o = cp(c.id); return o.following != null ? o.following : 20 + hash(c.id + 'f') % 900 }
        function isFollowed(c) { return cp(c.id).followed !== false }
        function charOf(p) {
          if (charMap[p.charId]) return charMap[p.charId]
          return { id: p.charId, name: p.name || 'Character', handle: p.handle || '', avatar: p.avatar || '' }
        }
        function authorOf(p) {
          if (p.kind === 'me') return { me: true, name: profile.name, handle: profile.handle, avatar: profile.avatar }
          var c = charOf(p)
          return { me: false, id: c.id, name: cName(c), handle: cHandle(c), avatar: cAvatar(c) }
        }
        function authorOfComment(cm) {
          if (cm.kind === 'me') return { me: true, name: profile.name, handle: profile.handle, avatar: profile.avatar }
          var c = charMap[cm.charId] || { id: cm.charId, name: cm.name || 'Character' }
          return { me: false, id: c.id, name: cName(c), handle: cHandle(c), avatar: cAvatar(c) }
        }

        /* ---------- 选图 ---------- */
        function pickImage(opts) {
          return new Promise(function (resolve) {
            var input = document.createElement('input')
            input.type = 'file'; input.accept = 'image/*'
            input.onchange = function () {
              var f = input.files && input.files[0]
              if (!f) return resolve('')
              var reader = new FileReader()
              reader.onload = function () {
                var img = new Image()
                img.onload = function () {
                  var c = document.createElement('canvas')
                  if (opts.w && opts.h) {
                    c.width = opts.w; c.height = opts.h
                    var s = Math.max(opts.w / img.width, opts.h / img.height)
                    var dw = img.width * s, dh = img.height * s
                    c.getContext('2d').drawImage(img, (opts.w - dw) / 2, (opts.h - dh) / 2, dw, dh)
                  } else {
                    var k = Math.min(1, (opts.max || 1000) / Math.max(img.width, img.height))
                    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
                    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
                  }
                  resolve(c.toDataURL('image/jpeg', opts.q || 0.82))
                }
                img.onerror = function () { roche.ui.toast('图片读取失败'); resolve('') }
                img.src = reader.result
              }
              reader.onerror = function () { resolve('') }
              reader.readAsDataURL(f)
            }
            input.click()
          })
        }

        /* ====================== AI 与上下文 ====================== */
        async function ask(messages, temp) {
          var r = await roche.ai.chat({ messages: messages, temperature: temp == null ? 0.9 : temp })
          var t = typeof r === 'string' ? r : (r && (r.text || r.content)) || ''
          return String(t).trim()
        }
        async function getFull(id) {
          if (!fullCache[id]) {
            try { fullCache[id] = (await roche.character.get(id)) || charMap[id] || {} } catch (e) { fullCache[id] = charMap[id] || {} }
          }
          return fullCache[id]
        }
        async function memoryCtx(c) {
          var full = await getFull(c.id)
          var cid = full.conversationId || c.conversationId
          var chat = '', mem = ''
          if (cid && settings.ctx.chat > 0) {
            try {
              var ms = (await roche.memory.getShortTerm({ conversationId: cid, limit: settings.ctx.chat })) || []
              chat = ms.filter(function (m) { return m && m.text }).slice(-settings.ctx.chat).map(function (m) {
                return (m.senderHandle || m.senderName || '?') + '：' + clip(m.text, 80)
              }).join('\n')
            } catch (e) {}
          }
          if (cid && settings.ctx.mem) {
            try {
              var lt = (await roche.memory.getLongTerm({ conversationId: cid, limit: 60 })) || {}
              var core = (lt.core && (lt.core.summary || lt.core.text)) || ''
              var facts = (lt.facts || []).map(function (f) { return f.summaryText || f.action || f.text || '' }).filter(Boolean).slice(-25).join('\n')
              mem = clip([core, facts].filter(Boolean).join('\n'), 1500)
            } catch (e) {}
          }
          return { chat: chat, mem: mem }
        }
        function entryText(e) {
          var t = e.title || e.name || (Array.isArray(e.keys) ? e.keys.join('/') : e.keys) || ''
          var b = e.content || e.text || e.description || ''
          return (t ? t + '：' : '') + clip(b, 220)
        }
        function wbWalk(nodes, inSel, out, onEntry) {
          ;(nodes || []).forEach(function (n) {
            var selfSel = inSel || settings.wb.cats.indexOf(n.id) >= 0
            ;(n.entries || []).forEach(function (e) { onEntry(e, selfSel, out) })
            wbWalk(n.children || n.categories || n.subCategories, selfSel, out, onEntry)
          })
        }
        async function worldbookText() {
          var w = settings.wb
          if (!w.cats.length && !w.entries.length) return ''
          var out = []
          try {
            var tree = await roche.worldbook.getCategoryTree()
            var roots = Array.isArray(tree) ? tree : (tree && (tree.categories || tree.children)) || (tree ? [tree] : [])
            wbWalk(roots, false, out, function (e, sel, o) { if (sel || w.entries.indexOf(e.id) >= 0) o.push(entryText(e)) })
          } catch (e) {
            try {
              var cats = (await roche.worldbook.list()) || []
              for (var i = 0; i < cats.length; i++) {
                if (w.cats.indexOf(cats[i].id) < 0) continue
                var es = (await roche.worldbook.getEntries({ categoryId: cats[i].id })) || []
                es.forEach(function (x) { out.push(entryText(x)) })
              }
            } catch (e2) {}
          }
          return clip(out.join('\n'), w.limit || 1500)
        }
        function styleRules() {
          var L = { zh: '用简体中文写', en: 'Write in English', ja: '日本語で書いてください', ko: '한국어로 작성하세요', mix: '用中英混合的口吻写（像在海外生活的人）', auto: '语言跟随角色人设里本来的说话习惯' }
          var N = { short: '不超过 40 个字', medium: '不超过 100 个字', long: '不超过 200 个字' }
          var E = { none: '不要用 emoji', some: '偶尔用一两个 emoji', lots: '可以多用 emoji' }
          var H = { none: '不要加 #话题', rare: '偶尔（少数时候）加一个 #话题', often: '经常带一个 #话题' }
          return [L[settings.lang] || L.zh, N[settings.length] || N.short, E[settings.emoji] || E.some, H[settings.hashtags] || H.rare, settings.style].filter(Boolean).join('；')
        }
        async function postMessages(c, opts) {
          var full = await getFull(c.id)
          var persona = full.persona || full.bio || c.bio || ''
          var me = ''
          try { var u = await roche.persona.getActiveUserPersona(); if (u) me = (u.name || u.handle || '') + (u.bio ? '（' + u.bio + '）' : '') } catch (e) {}
          var mc = await memoryCtx(c)
          var wb = await worldbookText()
          var recent = posts.filter(function (p) { return p.kind === 'char' && p.charId === c.id }).sort(function (a, b) { return b.createdAt - a.createdAt }).slice(0, 3).map(function (p) { return '「' + clip(p.text, 60) + '」' }).join(' ')
          var hot = (trends.list || []).slice(0, 3).map(function (t) { return '#' + t.tag }).join(' ')
          var sys = '你是「' + (full.name || c.name || '') + '」（昵称：' + (full.handle || c.handle || '') + '），现在要在社交平台 X（类似微博/推特）上发一条帖子。你就是这个人本人，不要提到自己是 AI。\n' +
            '【你的设定】\n' + persona + '\n' +
            (me ? '【用户（你认识的人）】' + me + '\n' : '') +
            (wb ? '【世界观设定】\n' + wb + '\n' : '') +
            (mc.mem ? '【你记得的事】\n' + mc.mem + '\n' : '') +
            (mc.chat ? '【你和用户最近的聊天】\n' + mc.chat + '\n' : '') +
            (hot ? '【平台热搜】' + hot + '（和你无关就不用提）\n' : '') +
            (recent ? '【你最近发过的（不要重复）】' + recent + '\n' : '') +
            '【写作要求】只输出帖子正文，不要引号和解释；' + styleRules() + '。'
          var now = new Date(opts.ts || Date.now())
          var user = '现在是 ' + now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日 ' + now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0') + '。' +
            (opts.topic ? '这条帖子的主题/发在：' + opts.topic + '。' : '随意发一条你此刻想发的。')
          return [{ role: 'system', content: sys }, { role: 'user', content: user }]
        }
        function imgUrl(r) {
          if (!r) return ''
          if (typeof r === 'string') return r
          return r.url || r.dataUrl || r.image || (r.b64 ? 'data:image/png;base64,' + r.b64 : '') || (r.data && r.data[0] && (r.data[0].url || (r.data[0].b64_json ? 'data:image/png;base64,' + r.data[0].b64_json : ''))) || ''
        }
        async function maybeImage(text, force) {
          if (!force && !(settings.img.chance > 0 && Math.random() * 100 < settings.img.chance)) return ''
          try {
            var p = await ask([{ role: 'system', content: '把下面这条社交平台帖子配一张图，只输出一条英文生图提示词（40 词内，画面具体，不要出现文字）。' }, { role: 'user', content: text }], 0.7)
            return imgUrl(await roche.ai.generateImage({ prompt: clean(p) }))
          } catch (e) { return '' }
        }
        async function makeCharPost(c, opts) {
          opts = opts || {}
          var text = clean(await ask(await postMessages(c, opts), 0.95))
          if (!text) throw new Error('没有生成出内容')
          if (opts.topicName && text.indexOf('#' + opts.topicName) < 0) text += ' #' + opts.topicName
          var image = await maybeImage(text, opts.forceImage)
          return {
            id: uid(), kind: 'char', charId: c.id, name: c.name || c.handle || '', handle: c.handle || c.name || '', avatar: c.avatar || '',
            text: text, image: image, createdAt: opts.ts || Date.now(), likes: rnd(3, 80), reposts: rnd(0, 9), replies: 0,
            liked: false, reposted: false, comments: [], topics: extractTags(text)
          }
        }
        function extractTags(t) {
          var m = String(t || '').match(/#[^\s#，。,.!！?？]+/g) || []
          return m.map(function (x) { return x.slice(1) })
        }

        /* ---------- 主聊天注入 + （可选）写入主记忆 ---------- */
        function buildChatCtx(c) {
          var L = []
          var mine = posts.filter(function (p) { return p.kind === 'char' && p.charId === c.id }).sort(function (a, b) { return b.createdAt - a.createdAt })
          if (mine.length) L.push('你最近在 X 上发过：' + mine.slice(0, 4).map(function (p) { return '「' + clip(p.text, 50) + '」（' + agoZh(p.createdAt) + '）' }).join('；'))
          var liked = mine.filter(function (p) { return p.liked }).slice(0, 4)
          if (liked.length) L.push('用户点赞了你的帖子：' + liked.map(function (p) { return '「' + clip(p.text, 40) + '」' }).join('；'))
          var cms = []
          mine.forEach(function (p) {
            p.comments.forEach(function (cm, i) {
              if (cm.kind === 'me') {
                var rep = p.comments.filter(function (r) { return r.replyTo === cm.id && r.kind === 'char' })[0]
                cms.push({ t: cm.createdAt, s: '用户评论了你的帖子「' + clip(p.text, 30) + '」：「' + clip(cm.text, 60) + '」' + (rep ? '，你回复：「' + clip(rep.text, 50) + '」' : '') })
              }
            })
          })
          cms.sort(function (a, b) { return b.t - a.t })
          if (cms.length) L.push(cms.slice(0, 4).map(function (x) { return x.s }).join('\n'))
          var my = posts.filter(function (p) { return p.kind === 'me' }).sort(function (a, b) { return b.createdAt - a.createdAt }).slice(0, 3)
          if (my.length) L.push('用户自己在 X 上发过：' + my.map(function (p) { return '「' + clip(p.text, 40) + '」' }).join('；'))
          if (!L.length) return ''
          return '【X 平台动态】以下是你和用户在 X（社交平台）上的近况，聊天时可以自然地提起，但不要生硬复述，也不要每次都提：\n' + L.join('\n')
        }
        function mirrorCtx() {
          try {
            var map = {}
            chars.forEach(function (c) { var t = buildChatCtx(c); if (t) map[c.id] = t })
            localStorage.setItem(CTX_KEY, JSON.stringify({ v: 1, on: !!settings.mem.inject, t: Date.now(), map: map }))
          } catch (e) {}
        }
        async function remember(c, summary, action) {
          if (!settings.mem.write) return
          try {
            var full = await getFull(c.id)
            var cid = full.conversationId || c.conversationId
            if (!cid) return
            await roche.memory.write({ conversationId: cid, summaryText: summary, who: ['用户', cName(c)], action: action, when: '刚刚', where: 'X', source: 'plugin' })
          } catch (e) {}
        }
        function addNotif(n) {
          n.id = uid(); n.createdAt = n.createdAt || Date.now(); n.read = false
          notifs.unshift(n)
        }

        /* ---------- 评论回复 / 角色互动 ---------- */
        async function charReply(post, comment) {
          var c = charMap[post.charId]
          if (!c) return
          try {
            var full = await getFull(c.id)
            var mc = await memoryCtx(c)
            var wb = await worldbookText()
            var sys = '你是「' + (full.name || c.name) + '」，在社交平台 X 上回复用户在你帖子下的评论。你就是这个人本人。\n【你的设定】\n' + (full.persona || full.bio || '') + '\n' +
              (wb ? '【世界观设定】\n' + wb + '\n' : '') + (mc.mem ? '【你记得的事】\n' + mc.mem + '\n' : '') + (mc.chat ? '【你和用户最近的聊天】\n' + mc.chat + '\n' : '') +
              '【你的帖子】' + post.text + '\n【要求】只输出回复正文；不超过 60 字；' + styleRules()
            var text = clean(await ask([{ role: 'system', content: sys }, { role: 'user', content: '用户评论：' + comment.text }], 0.9))
            if (!text) return
            post.comments.push({ id: uid(), kind: 'char', charId: c.id, text: text, createdAt: Date.now(), replyTo: comment.id })
            post.replies = post.comments.length
            addNotif({ type: 'reply', charId: c.id, postId: post.id, text: text })
            await sPosts(); await sNotifs(); mirrorCtx()
            await remember(c, cName(c) + '在 X 上回复了用户的评论：' + clip(text, 60), '回复了用户在 X 上的评论')
            refresh()
          } catch (e) { roche.ui.toast('角色回复失败：' + (e && e.message ? e.message : '请检查聊天接口')) }
        }
        async function charsReactToMyPost(post) {
          if (!settings.interact.on) return
          var cands = chars.filter(isFollowed).sort(function () { return Math.random() - 0.5 }).slice(0, settings.interact.max)
          for (var i = 0; i < cands.length; i++) {
            if (Math.random() * 100 > settings.interact.chance) continue
            var c = cands[i]
            try {
              var full = await getFull(c.id)
              var mc = await memoryCtx(c)
              var sys = '你是「' + (full.name || c.name) + '」，在社交平台 X 上给用户的一条帖子写评论。你就是这个人本人。\n【你的设定】\n' + (full.persona || full.bio || '') + '\n' +
                (mc.chat ? '【你和用户最近的聊天】\n' + mc.chat + '\n' : '') + '【要求】只输出评论正文；不超过 40 字；' + styleRules()
              var text = clean(await ask([{ role: 'system', content: sys }, { role: 'user', content: '用户的帖子：' + post.text }], 0.9))
              if (!text) continue
              post.comments.push({ id: uid(), kind: 'char', charId: c.id, text: text, createdAt: Date.now() })
              post.replies = post.comments.length; post.likes = (post.likes || 0) + 1
              addNotif({ type: 'comment', charId: c.id, postId: post.id, text: text })
              await sPosts(); await sNotifs(); mirrorCtx(); refresh()
            } catch (e) { break }
          }
        }

        /* ---------- 自动发帖（打开时补发 + 打开期间定时） ---------- */
        async function runAuto(manual) {
          var a = settings.auto
          if (autoBusy || (!a.enabled && !manual) || !alive) return
          var ids = chars.filter(function (c) { return a.chars[c.id] }).map(function (c) { return c.id })
          if (!ids.length) { if (manual) roche.ui.toast('还没有勾选要自动发帖的角色'); return }
          autoBusy = true
          var made = 0
          try {
            var now = Date.now(), iv = Math.max(5, a.intervalMin) * 60000
            for (var i = 0; i < ids.length && alive; i++) {
              var c = charMap[ids[i]]
              if (!c) continue
              if (!meta.lastAuto[c.id]) { meta.lastAuto[c.id] = manual ? now - iv : now; await sMeta(); if (!manual) continue }
              var last = meta.lastAuto[c.id]
              var due = Math.floor((now - last) / iv)
              var n = Math.min(a.maxCatchup, due)
              if (manual && n < 1) n = 1
              for (var k = 1; k <= n && alive; k++) {
                banner = cName(c) + ' 正在发帖…'; refresh()
                var tp = topics.filter(function (t) { return t.followed })
                var topic = tp.length && Math.random() < 0.3 ? tp[rnd(0, tp.length - 1)] : null
                var p = await makeCharPost(c, { ts: Math.min(now, last + iv * k), topic: topic ? '超话 #' + topic.name : '', topicName: topic ? topic.name : '' })
                posts.push(p); made++
                await sPosts()
              }
              meta.lastAuto[c.id] = due > 0 ? last + iv * due : now
              await sMeta()
            }
          } catch (e) {
            if (manual) roche.ui.toast('自动发帖失败：' + (e && e.message ? e.message : '请检查聊天接口'))
          }
          autoBusy = false; banner = ''
          if (made) { mirrorCtx(); if (manual) roche.ui.toast('发了 ' + made + ' 条') }
          refresh()
        }

        /* ---------- 下一天（热搜） ---------- */
        async function nextDay() {
          if (dayBusy) return
          dayBusy = true; refresh()
          try {
            var wb = await worldbookText()
            var names = chars.slice(0, 8).map(function (c) { return cName(c) }).join('、')
            var rec = posts.slice().sort(function (a, b) { return b.createdAt - a.createdAt }).slice(0, 6).map(function (p) { return clip(p.text, 30) }).join(' | ')
            var L = { zh: '中文', en: 'English', ja: '日本語', ko: '한국어', mix: '中英混合', auto: '中文' }[settings.lang] || '中文'
            var sys = '你是社交平台 X 的热搜编辑。为“新的一天”生成 5 条热搜话题，要符合下面的世界观和近期动态，像真实平台的热搜，有生活感，不要太夸张。语言：' + L + '。\n' +
              (wb ? '【世界观设定】\n' + wb + '\n' : '') + (names ? '【平台上的人】' + names + '\n' : '') + (rec ? '【近期帖子】' + rec + '\n' : '') +
              '只输出 JSON 数组，不要任何解释，格式：[{"cat":"Entertainment","tag":"话题名（不带#）","heat":"52.8K"}]，cat 用英文分类名（Entertainment/Community/City/Life/Music 等）。'
            var raw = await ask([{ role: 'system', content: sys }, { role: 'user', content: '生成第 ' + (trends.day + 1) + ' 天的热搜。' }], 0.9)
            var m = raw.match(/\[[\s\S]*\]/)
            var arr = JSON.parse(m ? m[0] : raw)
            arr = arr.filter(function (x) { return x && x.tag }).slice(0, 6).map(function (x) { return { cat: String(x.cat || 'Trending'), tag: String(x.tag).replace(/^#/, ''), heat: String(x.heat || fmt(rnd(2000, 90000))) } })
            if (!arr.length) throw new Error('没有解析到热搜')
            trends = { day: trends.day + 1, list: arr, ts: Date.now() }
            await sTrends()
            roche.ui.toast('第 ' + trends.day + ' 天')
          } catch (e) { roche.ui.toast('生成热搜失败：' + (e && e.message ? e.message : '请检查聊天接口')) }
          dayBusy = false; refresh()
        }

        /* ====================== 渲染 ====================== */
        function cur() { return stack[stack.length - 1] }
        function isTab(t) { return ['home', 'super', 'discover', 'messages', 'me'].indexOf(t) >= 0 }
        function go(v) { if (isTab(v.t)) stack = [v]; else stack.push(v); closeMenu(); render() }
        function back() { if (stack.length > 1) { stack.pop(); render() } else roche.ui.closeApp() }
        function closeMenu() {}
        function refresh() { if (alive) render() }

        function ava(a, size, extra) {
          size = size ? Math.round(size * 0.86) : size
          return '<div class="x-ava ' + (extra || '') + '"' + (size ? ' style="width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * .4) + 'px"' : '') + '>' +
            (a.avatar ? '<img src="' + esc(a.avatar) + '" alt="">' : initial(a.name)) + '</div>'
        }
        function tagify(text) {
          return esc(text).replace(/#([^\s#，。,.!！?？&]+)/g, function (m, t) { return '<span class="x-tag" data-act="open-topic" data-name="' + t + '">#' + t + '</span>' })
        }
        function postHtml(p, opt) {
          opt = opt || {}
          var a = authorOf(p)
          var who = a.me ? '' : ' data-act="open-char" data-id="' + esc(a.id) + '"'
          return '<div class="x-post">' +
            '<div' + who + ' style="cursor:pointer">' + ava(a, 44) + '</div>' +
            '<div class="x-pb"><div class="x-ph"><span class="x-pn"' + who + '>' + esc(a.name) + '</span><span class="x-ps">@' + esc(a.handle) + ' · ' + ago(p.createdAt) + '</span>' +
            '<button class="x-pm" data-act="pmenu" data-id="' + esc(p.id) + '">' + I.more + '</button></div>' +
            (p.text ? '<div class="x-pt" data-act="open-post" data-id="' + esc(p.id) + '">' + tagify(p.text) + '</div>' : '') +
            (p.image ? '<div class="x-pi" data-act="open-post" data-id="' + esc(p.id) + '"><img src="' + esc(p.image) + '" alt=""></div>' : '') +
            '<div class="x-acts">' +
            '<button class="x-act" data-act="open-post" data-id="' + esc(p.id) + '">' + I.reply + '<span>' + fmt(p.comments.length) + '</span></button>' +
            '<button class="x-act' + (p.reposted ? ' rp' : '') + '" data-act="repost" data-id="' + esc(p.id) + '">' + I.repost + '<span>' + fmt(p.reposts) + '</span></button>' +
            '<button class="x-act' + (p.liked ? ' liked' : '') + '" data-act="like" data-id="' + esc(p.id) + '">' + I.heart + '<span>' + fmt(p.likes) + '</span></button>' +
            '<button class="x-act" data-act="share" data-id="' + esc(p.id) + '">' + I.share + '</button>' +
            '</div></div></div>'
        }
        function feedHtml(list, emptyText) {
          if (!list.length) return '<div class="x-empty">' + (emptyText || '暂无内容') + '</div>'
          return '<div class="x-card">' + list.map(function (p) { return postHtml(p) }).join('') + '</div>'
        }
        function sorted(list) { return list.slice().sort(function (a, b) { return b.createdAt - a.createdAt }) }
        function cb(act, icon, cls, id) { return '<button class="x-cb ' + (cls || '') + '" data-act="' + act + '"' + (id ? ' data-id="' + esc(id) + '"' : '') + '>' + icon + '</button>' }
        function topbar(left, right) { return '<div class="x-top">' + left + '<div class="x-logo">' + I.x + '</div><div class="x-tr">' + (right || '') + '</div></div>' }
        function navHtml() {
          var t = cur().t
          var items = [['home', 'Home', I.home], ['super', 'Super', I.super], ['discover', 'Discover', I.compass], ['messages', 'Messages', I.mail], ['me', 'Me', I.me]]
          var unread = notifs.filter(function (n) { return !n.read }).length
          return '<div class="x-nav">' + items.map(function (it) {
            return '<button class="x-nv' + (t === it[0] ? ' on' : '') + '" data-act="tab" data-id="' + it[0] + '">' + it[2] + '<span>' + it[1] + '</span>' + (it[0] === 'messages' && unread ? '<i class="x-badge">' + (unread > 9 ? '9+' : unread) + '</i>' : '') + '</button>'
          }).join('') + '</div>'
        }

        function viewHome() {
          var list
          if (homeTab === 'fol') list = posts.filter(function (p) { return p.kind === 'me' || isFollowed(charOf(p)) })
          else list = posts.slice()
          list = sorted(list)
          return topbar(cb('exit', I.back), cb('tab', I.search, '', 'discover') + cb('open-compose', I.pen, 'dark') + cb('open-settings', I.gear)) +
            '<div class="x-htabs"><button class="' + (homeTab === 'rec' ? 'on' : '') + '" data-act="htab" data-id="rec">Recommend</button><button class="' + (homeTab === 'fol' ? 'on' : '') + '" data-act="htab" data-id="fol">Following</button></div>' +
            '<div class="x-scroll">' +
            '<div class="x-card x-comp">' + ava({ avatar: profile.avatar, name: profile.name }, 56) +
            '<div class="x-comp-mid"><input type="text" data-f="qtext" placeholder="有什么新鲜事？" value="' + esc(qtext) + '">' +
            '<div class="x-tools"><button data-act="pick-q-image">' + I.image + 'Image</button><button data-act="q-topic">' + I.hash + 'Topic</button><button data-act="open-charpost">' + I.spark + 'Char</button></div>' +
            (qimg ? '<span class="x-chip">已选图片 <button data-act="clear-q-image">' + I.close.replace('class="x-ic"', 'class="x-ic" style="width:13px;height:13px"') + '</button></span>' : '') +
            '</div><button class="x-postbtn" data-act="q-post">Post</button></div>' +
            feedHtml(list, homeTab === 'fol' ? '还没有关注的人的帖子<br>去角色主页点 Following，或在设置里打开自动发帖。' : '暂无内容。<br>点右上角的设置，打开“自动发帖”，或点 Char 让角色发一条。') +
            '</div>'
        }
        function viewSuper() {
          var fol = topics.filter(function (t) { return t.followed })
          function trow(t) {
            var n = postsOfTopic(t.name).length
            return '<div class="x-row"><div class="x-rt" data-act="open-topic" data-name="' + esc(t.name) + '" style="cursor:pointer"><b>#' + esc(t.name) + '</b><span>' + esc(t.desc || '暂无简介') + ' · ' + n + ' posts</span></div>' +
              '<button class="x-fol' + (t.followed ? ' on' : '') + '" data-act="topic-follow" data-id="' + esc(t.id) + '">' + (t.followed ? 'Following' : 'Follow') + '</button></div>'
          }
          return topbar(cb('exit', I.back), cb('new-topic', I.plus)) +
            '<div class="x-scroll" style="padding-top:12px">' +
            '<div class="x-card"><div class="x-sec">关注的超话<span>' + fol.length + ' followed</span></div>' +
            (fol.length ? fol.map(trow).join('') : '<div class="x-soft">暂无关注</div>') + '</div>' +
            (topics.length > fol.length ? '<div class="x-card"><div class="x-sec">全部超话</div>' + topics.filter(function (t) { return !t.followed }).map(trow).join('') + '</div>' : '') +
            '</div>'
        }
        function postsOfTopic(name) {
          return posts.filter(function (p) { return (p.text || '').indexOf('#' + name) >= 0 })
        }
        function viewTopic(v) {
          var t = topics.filter(function (x) { return x.name === v.name })[0]
          var list = sorted(postsOfTopic(v.name))
          return topbar(cb('back', I.back), t ? '<button class="x-fol' + (t.followed ? ' on' : '') + '" data-act="topic-follow" data-id="' + esc(t.id) + '">' + (t.followed ? 'Following' : 'Follow') + '</button>' : cb('make-topic', I.plus, '', v.name)) +
            '<div class="x-scroll" style="padding-top:12px"><div class="x-card"><div class="x-sec" style="padding-bottom:14px">#' + esc(v.name) + '<span>' + list.length + ' posts</span></div>' + (t && t.desc ? '<div style="padding:0 18px 16px;color:#76767c;font-size:15px">' + esc(t.desc) + '</div>' : '') + '</div>' +
            feedHtml(list, '这个话题下还没有帖子') + '</div>'
        }
        function viewDiscover() {
          var tl = trends.list || []
          return topbar(cb('exit', I.back), cb('focus-search', I.search)) +
            '<div class="x-scroll"><div class="x-search">' + I.search + '<input type="text" data-f="sq" placeholder="搜索话题、用户、超话" value="' + esc(searchQ) + '"></div>' +
            '<div data-f="sres">' + searchHtml() + '</div></div>'
        }
        function discoverBody() {
          var tl = trends.list || []
          return '<button class="x-big" data-act="next-day"' + (dayBusy ? ' disabled' : '') + '>' + (dayBusy ? 'Generating…' : '下一天 ' + I.arrow) + '</button>' +
            (tl.length ? '<div class="x-card">' + tl.map(function (t) {
              return '<div class="x-tr2" data-act="open-topic" data-name="' + esc(t.tag) + '" style="cursor:pointer"><div><small>' + esc(t.cat) + ' · Trending</small><b>#' + esc(t.tag) + '</b></div><em>' + esc(t.heat) + '</em></div>'
            }).join('') + '</div>' : '<div class="x-empty">还没有热搜。<br>点“下一天”，让 AI 按你的世界观生成今天的热搜。</div>')
        }
        function searchHtml() {
          var q = searchQ.trim().toLowerCase()
          if (!q) return discoverBody()
          var us = chars.filter(function (c) { return (cName(c) + cHandle(c)).toLowerCase().indexOf(q) >= 0 })
          var ts = topics.filter(function (t) { return t.name.toLowerCase().indexOf(q) >= 0 })
          var ps = sorted(posts.filter(function (p) { return (p.text || '').toLowerCase().indexOf(q) >= 0 })).slice(0, 30)
          var h = ''
          if (us.length) h += '<div class="x-card"><div class="x-sec">Users</div>' + us.map(function (c) {
            return '<div class="x-row" data-act="open-char" data-id="' + esc(c.id) + '" style="cursor:pointer">' + ava({ avatar: cAvatar(c), name: cName(c) }, 46) + '<div class="x-rt"><b>' + esc(cName(c)) + '</b><span>@' + esc(cHandle(c)) + '</span></div></div>'
          }).join('') + '</div>'
          if (ts.length) h += '<div class="x-card"><div class="x-sec">Topics</div>' + ts.map(function (t) {
            return '<div class="x-row" data-act="open-topic" data-name="' + esc(t.name) + '" style="cursor:pointer"><div class="x-rt"><b>#' + esc(t.name) + '</b><span>' + esc(t.desc || '') + '</span></div></div>'
          }).join('') + '</div>'
          if (ps.length) h += '<div class="x-sec">Posts</div>' + feedHtml(ps)
          return h || '<div class="x-empty">没有找到相关内容</div>'
        }
        function viewMessages() {
          var list = notifs.slice(0, 80)
          var txt = { like: '赞了你的帖子', comment: '评论了你的帖子：', reply: '回复了你的评论：', post: '发了新帖子：' }
          return topbar(cb('exit', I.back), cb('read-all', I.check)) +
            '<div class="x-scroll" style="padding-top:12px">' +
            (list.length ? '<div class="x-card">' + list.map(function (n) {
              var c = charMap[n.charId] || { id: n.charId, name: 'Character' }
              return '<div class="x-row" data-act="open-post" data-id="' + esc(n.postId) + '" style="cursor:pointer">' + ava({ avatar: cAvatar(c), name: cName(c) }, 46) +
                '<div class="x-rt"><b>' + esc(cName(c)) + ' <span style="display:inline;color:#76767c;font-weight:600;font-size:14px">' + agoZh(n.createdAt) + '</span></b><span style="white-space:normal">' + (txt[n.type] || '') + esc(clip(n.text, 60)) + '</span></div>' +
                (n.read ? '' : '<div class="x-dot"></div>') + '</div>'
            }).join('') + '</div>' : '<div class="x-empty">暂无消息<br>角色评论、回复你的时候，会出现在这里。</div>') + '</div>'
        }
        function profileCard(o) {
          // o: {avatar, name, handle, bio, followers, following, postsN, joined, btns}
          return '<div class="x-pcard"><div class="x-ava x-bigava">' + (o.avatar ? '<img src="' + esc(o.avatar) + '" alt="">' : initial(o.name)) + '</div>' +
            '<div class="x-pbtns">' + o.btns + '</div>' +
            '<div class="x-nm">' + esc(o.name) + '</div><div class="x-hd">@' + esc(o.handle) + '</div>' +
            '<div class="x-bio">' + (o.bio ? esc(o.bio) : '<span style="color:#76767c">暂无签名</span>') + '</div>' +
            '<div class="x-stats"><div class="x-stat"><b>' + fmt(o.postsN) + '</b><span>Posts</span></div><div class="x-stat"><b>' + fmt(o.followers) + '</b><span>Followers</span></div><div class="x-stat"><b>' + fmt(o.following) + '</b><span>Following</span></div></div></div>'
        }
        function ptabsHtml() {
          return '<div class="x-ptabs"><button class="' + (ptab === 'posts' ? 'on' : '') + '" data-act="ptab" data-id="posts">Posts</button><button class="' + (ptab === 'photos' ? 'on' : '') + '" data-act="ptab" data-id="photos">Photos</button></div>'
        }
        function listOrGrid(list) {
          if (ptab === 'photos') {
            var ph = list.filter(function (p) { return p.image })
            return ph.length ? '<div class="x-grid">' + ph.map(function (p) { return '<div data-act="open-post" data-id="' + esc(p.id) + '" style="background-image:url(\'' + esc(p.image) + '\')"></div>' }).join('') + '</div>' : '<div class="x-empty">暂无图片</div>'
          }
          return feedHtml(list, '暂无帖子')
        }
        function viewMe() {
          var mine = sorted(posts.filter(function (p) { return p.kind === 'me' }))
          return '<div class="x-scroll" style="padding-bottom:120px"><div class="x-banner"' + (profile.banner ? ' style="background-image:url(\'' + esc(profile.banner) + '\')"' : '') + '></div>' +
            '<div class="x-top ov">' + cb('exit', I.back, 'glass') + '<div class="x-logo"></div><div class="x-tr">' + cb('tab', I.mail, 'glass', 'messages') + cb('open-settings', I.gear, 'glass') + '</div></div>' +
            profileCard({ avatar: profile.avatar, name: profile.name, handle: profile.handle, bio: profile.bio, followers: profile.followers, following: profile.following, postsN: mine.length, btns: '<button class="x-pill" data-act="edit-profile">Edit profile</button>' }) +
            ptabsHtml() + listOrGrid(mine) + '</div>'
        }
        function viewChar(v) {
          var c = charMap[v.id] || { id: v.id, name: 'Character' }
          var list = sorted(posts.filter(function (p) { return p.kind === 'char' && p.charId === c.id }))
          var o = cp(c.id)
          return '<div class="x-scroll"><div class="x-banner"' + (o.banner ? ' style="background-image:url(\'' + esc(o.banner) + '\')"' : '') + '></div>' +
            '<div class="x-top ov">' + cb('back', I.back, 'glass') + '<div class="x-logo"></div><div class="x-tr">' + cb('post-now', I.spark, 'glass', c.id) + '</div></div>' +
            profileCard({ avatar: cAvatar(c), name: cName(c), handle: cHandle(c), bio: cBio(c), followers: cFollowers(c), following: cFollowing(c), postsN: list.length,
              btns: '<button class="x-pill ' + (isFollowed(c) ? 'dark' : '') + '" data-act="char-follow" data-id="' + esc(c.id) + '">' + (isFollowed(c) ? '已关注' : 'Follow') + '</button><button class="x-pill" data-act="edit-char" data-id="' + esc(c.id) + '">Edit</button>' }) +
            ptabsHtml() + listOrGrid(list) + '</div>'
        }
        function viewPost(v) {
          var p = posts.filter(function (x) { return x.id === v.id })[0]
          if (!p) return topbar(cb('back', I.back)) + '<div class="x-empty">这条帖子不存在了</div>'
          var cms = p.comments.slice().sort(function (a, b) { return a.createdAt - b.createdAt })
          return topbar(cb('back', I.back)) +
            '<div class="x-scroll" style="padding-top:12px;padding-bottom:90px"><div class="x-card">' + postHtml(p) + '</div>' +
            (cms.length ? '<div class="x-card">' + cms.map(function (cm) {
              var a = authorOfComment(cm)
              return '<div class="x-cm">' + ava(a, 36) + '<div class="x-cb2"><div class="x-ph"><span class="x-pn">' + esc(a.name) + '</span><span class="x-ps">@' + esc(a.handle) + ' · ' + ago(cm.createdAt) + '</span></div><div class="x-ct">' + esc(cm.text) + '</div></div></div>'
            }).join('') + '</div>' : '<div class="x-empty" style="padding:24px">还没有评论，来说点什么</div>') + '</div>' +
            '<div class="x-cin"><input type="text" data-f="cmtext" placeholder="Post your reply"><button class="x-btn" data-act="send-comment" data-id="' + esc(p.id) + '">Reply</button></div>'
        }

        function render() {
          var v = cur()
          var sc = root.querySelector('.x-scroll')
          var st = sc ? sc.scrollTop : 0
          var h = ''
          if (v.t === 'home') h = viewHome()
          else if (v.t === 'super') h = viewSuper()
          else if (v.t === 'discover') h = viewDiscover()
          else if (v.t === 'messages') h = viewMessages()
          else if (v.t === 'me') h = viewMe()
          else if (v.t === 'char') h = viewChar(v)
          else if (v.t === 'topic') h = viewTopic(v)
          else if (v.t === 'post') h = viewPost(v)
          if (isTab(v.t)) h += navHtml()
          if (banner) h += '<div class="x-banner-bar">' + esc(banner) + '</div>'
          var keep = sheetEl
          if (keep && keep.parentNode) keep.parentNode.removeChild(keep)
          root.innerHTML = h
          if (keep) root.appendChild(keep)
          var sc2 = root.querySelector('.x-scroll')
          if (sc2 && st && root.__lastView === (v.t + (v.id || v.name || ''))) sc2.scrollTop = st
          root.__lastView = v.t + (v.id || v.name || '')
        }

        /* ====================== 弹出层 ====================== */
        function closeSheet() { if (sheetEl && sheetEl.parentNode) sheetEl.parentNode.removeChild(sheetEl); sheetEl = null }
        function openSheet(html) {
          closeSheet()
          var el = document.createElement('div')
          el.className = 'x-sheet'
          el.innerHTML = '<div class="x-sheet-back" data-act="sheet-close"></div><div class="x-sheet-card">' + html + '</div>'
          root.appendChild(el); sheetEl = el
          return el
        }
        function q(sel) { return sheetEl ? sheetEl.querySelector(sel) : null }
        function gv(n) { var e = q('[data-f=' + n + ']'); return e ? e.value : '' }
        function gc(n) { var e = q('[data-f=' + n + ']'); return !!(e && e.checked) }

        function openCompose(pre) {
          draft = { text: pre || '', image: '' }
          var el = openSheet('<div class="x-sh"><button class="x-btn ghost" data-act="sheet-close">Cancel</button><button class="x-btn" data-act="submit-post">Post</button></div>' +
            '<textarea data-f="ctext" placeholder="What\'s happening?">' + esc(draft.text) + '</textarea><div data-f="cimg"></div>' +
            '<div class="x-tool"><button class="x-btn ghost" data-act="pick-post-image">图片</button><button class="x-btn ghost" data-act="ai-image">AI 生图</button><button class="x-btn ghost" data-act="sheet-topic">#话题</button></div>')
          setTimeout(function () { var t = el.querySelector('[data-f=ctext]'); if (t) t.focus() }, 80)
        }
        function refreshDraftImage() {
          var box = q('[data-f=cimg]'); if (!box) return
          box.innerHTML = draft.image ? '<div class="x-prev"><img src="' + esc(draft.image) + '" alt=""><button data-act="remove-post-image">' + I.close.replace('class="x-ic"', 'class="x-ic" style="width:16px;height:16px"') + '</button></div>' : ''
        }
        function openTopicPicker(onPick) {
          var list = topics.map(function (t) { return '<button class="x-row" style="width:100%;text-align:left" data-act="topic-pick" data-name="' + esc(t.name) + '"><div class="x-rt"><b>#' + esc(t.name) + '</b></div></button>' }).join('')
          openSheet('<div class="x-sh"><h3>选择话题</h3><button class="x-btn ghost" data-act="sheet-close">关闭</button></div>' + (list || '<div class="x-hint">还没有话题，去 Super 里新建一个。</div>'))
        }
        function openNewTopic(name) {
          openSheet('<div class="x-sh"><button class="x-btn ghost" data-act="sheet-close">Cancel</button><h3>新建超话</h3><button class="x-btn" data-act="save-topic">Save</button></div>' +
            '<label class="x-l">话题名（不用写 #）</label><input type="text" data-f="tname" maxlength="24" value="' + esc(name || '') + '">' +
            '<label class="x-l">简介</label><input type="text" data-f="tdesc" maxlength="60">')
        }
        function editForm(title, o, isChar) {
          editImgs = { avatar: null, banner: null }
          openSheet('<div class="x-sh"><button class="x-btn ghost" data-act="sheet-close">Cancel</button><h3>' + title + '</h3><button class="x-btn" data-act="' + (isChar ? 'save-char' : 'save-profile') + '"' + (isChar ? ' data-id="' + esc(o.id) + '"' : '') + '>Save</button></div>' +
            '<div class="x-pick"><div class="x-ava" data-f="pa">' + (o.avatar ? '<img src="' + esc(o.avatar) + '" alt="">' : initial(o.name)) + '</div><button class="x-btn ghost" data-act="pick-avatar">更换头像</button><button class="x-btn ghost" data-act="pick-banner">更换背景图</button></div>' +
            '<label class="x-l">Name</label><input type="text" data-f="name" value="' + esc(o.name) + '" maxlength="40">' +
            '<label class="x-l">Handle（不用写 @）</label><input type="text" data-f="handle" value="' + esc(o.handle) + '" maxlength="30">' +
            '<label class="x-l">Bio（个性签名）</label><textarea data-f="bio" maxlength="160" style="min-height:80px">' + esc(o.bio) + '</textarea>' +
            '<div class="x-two"><div><label class="x-l">Following</label><input type="number" data-f="following" value="' + (Number(o.following) || 0) + '" min="0"></div><div><label class="x-l">Followers</label><input type="number" data-f="followers" value="' + (Number(o.followers) || 0) + '" min="0"></div></div>' +
            '<div class="x-hint">关注数、粉丝数只是你自己填的数字。' + (isChar ? '这里改的只在 X 里生效，不会改 Roche 里角色本身的资料。' : '') + '</div>' +
            (isChar ? '<div class="x-tool"><button class="x-btn danger" data-act="reset-char" data-id="' + esc(o.id) + '">恢复成 Roche 里的资料</button></div>' : ''))
        }
        function openCharPost(preId) {
          charState = { sel: preId || (chars[0] && chars[0].id) || '', topic: '', preview: '', busy: false }
          drawCharSheet(true)
        }
        function drawCharSheet(first) {
          var cs = charState
          var html
          if (!chars.length) html = '<div class="x-sh"><h3>让角色发帖</h3><button class="x-btn ghost" data-act="sheet-close">关闭</button></div><div class="x-hint">没有读取到角色。请先在 Roche 里创建角色。</div>'
          else {
            html = '<div class="x-sh"><h3>让角色发帖</h3><button class="x-btn ghost" data-act="sheet-close">关闭</button></div><div class="x-chars">' + chars.map(function (c) {
              return '<button class="x-chr' + (c.id === cs.sel ? ' on' : '') + '" data-act="pick-char" data-id="' + esc(c.id) + '">' + ava({ avatar: cAvatar(c), name: cName(c) }, 54) + esc(clip(cName(c), 6)) + '</button>'
            }).join('') + '</div>' +
              '<label class="x-l">想让 TA 发什么？（可留空，让 TA 自己想）</label><input type="text" data-f="topic" value="' + esc(cs.topic) + '" placeholder="例如：下雨天、#某个超话">' +
              '<div class="x-tool"><button class="x-btn" data-act="gen-char"' + (cs.busy ? ' disabled' : '') + '>' + (cs.busy ? 'Generating…' : (cs.preview ? 'Regenerate' : 'Generate')) + '</button></div>' +
              (cs.preview ? '<label class="x-l">预览（可以直接改）</label><textarea data-f="cprev">' + esc(cs.preview) + '</textarea><div class="x-tool"><button class="x-btn" data-act="publish-char">Post</button></div>' : '') +
              '<div class="x-hint">会按设置里的语言、格式、世界书、记忆来写。</div>'
          }
          if (first) openSheet(html)
          else if (sheetEl) sheetEl.querySelector('.x-sheet-card').innerHTML = html
        }
        async function genChar() {
          var cs = charState, c = charMap[cs.sel]; if (!c) return
          cs.topic = gv('topic'); cs.busy = true; drawCharSheet()
          try {
            var t = cs.topic.replace(/^#/, '')
            var p = await makeCharPost(c, { topic: cs.topic, topicName: topics.some(function (x) { return x.name === t }) ? t : '' })
            cs.preview = p.text; cs.previewImage = p.image
          } catch (e) { roche.ui.toast('生成失败：' + (e && e.message ? e.message : '请检查聊天接口设置')) }
          cs.busy = false; drawCharSheet()
        }

        async function openSettings() {
          var s = settings
          function sel(name, val, opts) { return '<select data-f="' + name + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(val) === String(o[0]) ? ' selected' : '') + '>' + o[1] + '</option>' }).join('') + '</select>' }
          function ck(name, val, label) { return '<label class="x-ck"><input type="checkbox" data-f="' + name + '"' + (val ? ' checked' : '') + '>' + label + '</label>' }
          openSheet('<div class="x-hint">正在读取世界书…</div>')
          try { wbTree = await roche.worldbook.getCategoryTree() } catch (e) { wbTree = null }
          var roots = wbTree ? (Array.isArray(wbTree) ? wbTree : (wbTree.categories || wbTree.children || [wbTree])) : []
          function wbHtml(nodes) {
            return (nodes || []).map(function (n) {
              return '<div><label class="x-ck"><input type="checkbox" data-wbc="' + esc(n.id) + '"' + (s.wb.cats.indexOf(n.id) >= 0 ? ' checked' : '') + '><b>' + esc(n.name || n.title || '分类') + '</b></label>' +
                '<div class="x-wb">' + (n.entries || []).map(function (e) { return '<label class="x-ck"><input type="checkbox" data-wbe="' + esc(e.id) + '"' + (s.wb.entries.indexOf(e.id) >= 0 ? ' checked' : '') + '>' + esc(clip(e.title || e.name || '词条', 20)) + '</label>' }).join('') +
                wbHtml(n.children || n.categories || n.subCategories) + '</div></div>'
            }).join('')
          }
          var charCk = chars.length ? chars.map(function (c) { return ck('ac-' + c.id, s.auto.chars[c.id], esc(cName(c))) }).join('') : '<div class="x-hint">没有读取到角色</div>'
          sheetEl.querySelector('.x-sheet-card').innerHTML =
            '<div class="x-sh"><button class="x-btn ghost" data-act="sheet-close">Cancel</button><h3>设置</h3><button class="x-btn" data-act="save-settings">Save</button></div>' +
            '<div class="x-h4" style="border:0;margin-top:0;padding-top:0">自动发帖</div>' + ck('auto-on', s.auto.enabled, '让勾选的角色自动发帖') +
            '<label class="x-l">发帖间隔</label>' + sel('auto-iv', s.auto.intervalMin, [[15, '15 分钟'], [30, '30 分钟'], [60, '1 小时'], [120, '2 小时'], [240, '4 小时'], [480, '8 小时'], [1440, '24 小时']]) +
            '<label class="x-l">一次打开最多补发几条</label>' + sel('auto-max', s.auto.maxCatchup, [[1, '1 条'], [2, '2 条'], [3, '3 条'], [5, '5 条']]) +
            '<label class="x-l">哪些角色会自动发帖</label>' + charCk +
            '<div class="x-hint">说明：插件没有后台，所以是“打开 X 时按间隔补发 + 打开期间定时发”，补发的帖子时间会分散在你离开的这段时间里。</div>' +
            '<div class="x-tool"><button class="x-btn ghost" data-act="run-auto-now">保存并立刻发一轮</button></div>' +
            '<div class="x-h4">发帖格式</div>' +
            '<label class="x-l">语言</label>' + sel('lang', s.lang, [['zh', '中文'], ['en', 'English'], ['ja', '日本語'], ['ko', '한국어'], ['mix', '中英混合'], ['auto', '跟随角色人设']]) +
            '<div class="x-two"><div><label class="x-l">长度</label>' + sel('length', s.length, [['short', '短（≤40字）'], ['medium', '中（≤100字）'], ['long', '长（≤200字）']]) + '</div>' +
            '<div><label class="x-l">Emoji</label>' + sel('emoji', s.emoji, [['none', '不用'], ['some', '偶尔'], ['lots', '多用']]) + '</div></div>' +
            '<label class="x-l">#话题</label>' + sel('hashtags', s.hashtags, [['none', '不加'], ['rare', '偶尔'], ['often', '经常']]) +
            '<label class="x-l">文风提示词（想让它更像真人，就改这里）</label><textarea data-f="style" style="min-height:130px">' + esc(s.style) + '</textarea>' +
            '<div class="x-tool"><button class="x-btn ghost" data-act="reset-style">恢复默认文风</button></div>' +
            '<div class="x-h4">写帖子时参考什么</div>' +
            '<label class="x-l">和角色最近的聊天（条数）</label>' + sel('ctx-chat', s.ctx.chat, [[0, '不参考'], [10, '10 条'], [20, '20 条'], [40, '40 条']]) +
            ck('ctx-mem', s.ctx.mem, '参考角色的长期记忆（核心记忆 + 事实记忆）') +
            '<label class="x-l">关联世界书（只勾你想让 X 用到的部分）</label>' + (roots.length ? wbHtml(roots) : '<div class="x-hint">没有读取到世界书</div>') +
            '<label class="x-l">世界书最多用多少字</label>' + sel('wb-limit', s.wb.limit, [[800, '800'], [1500, '1500'], [3000, '3000']]) +
            '<div class="x-h4">互动</div>' + ck('reply-on', s.reply.on, '我评论角色的帖子后，角色自动回复') +
            ck('inter-on', s.interact.on, '我发帖后，关注的角色可能来评论') +
            '<label class="x-l">角色发帖时自动配图的概率</label>' + sel('img-chance', s.img.chance, [[0, '不配图'], [10, '10%'], [25, '25%'], [50, '50%']]) +
            '<div class="x-hint">配图用 Roche 设置里当前的生图配置。</div>' +
            '<div class="x-h4">记忆互通</div>' + ck('mem-inject', s.mem.inject, '把我的点赞/评论告诉角色（注入到 TA 的单聊上下文，聊天时会提起；推荐）') +
            ck('mem-write', s.mem.write, '同时写入角色的长期记忆（会写进 Roche 主记忆，卸载插件也不会删）') +
            '<div class="x-h4">数据</div><div class="x-tool"><button class="x-btn danger" data-act="reset-all">清空 X 里的帖子和设置</button></div>'
        }
        async function saveSettings() {
          var s = settings
          s.auto.enabled = gc('auto-on'); s.auto.intervalMin = parseInt(gv('auto-iv'), 10) || 60; s.auto.maxCatchup = parseInt(gv('auto-max'), 10) || 2
          chars.forEach(function (c) {
            var on = gc('ac-' + c.id)
            if (on && !s.auto.chars[c.id]) meta.lastAuto[c.id] = Date.now()
            s.auto.chars[c.id] = on
          })
          s.lang = gv('lang'); s.length = gv('length'); s.emoji = gv('emoji'); s.hashtags = gv('hashtags'); s.style = gv('style')
          s.ctx.chat = parseInt(gv('ctx-chat'), 10) || 0; s.ctx.mem = gc('ctx-mem')
          s.wb.cats = [].slice.call(sheetEl.querySelectorAll('[data-wbc]')).filter(function (e) { return e.checked }).map(function (e) { return e.getAttribute('data-wbc') })
          s.wb.entries = [].slice.call(sheetEl.querySelectorAll('[data-wbe]')).filter(function (e) { return e.checked }).map(function (e) { return e.getAttribute('data-wbe') })
          s.wb.limit = parseInt(gv('wb-limit'), 10) || 1500
          s.reply.on = gc('reply-on'); s.interact.on = gc('inter-on'); s.img.chance = parseInt(gv('img-chance'), 10) || 0
          s.mem.inject = gc('mem-inject'); s.mem.write = gc('mem-write')
          await sSettings(); await sMeta(); mirrorCtx()
        }

        /* ====================== 事件 ====================== */
        root.addEventListener('input', function (e) {
          var f = e.target && e.target.getAttribute && e.target.getAttribute('data-f')
          if (f === 'qtext') qtext = e.target.value
          if (f === 'sq') { searchQ = e.target.value; var box = root.querySelector('[data-f=sres]'); if (box) box.innerHTML = searchHtml() }
        })
        root.addEventListener('click', async function (e) {
          var btn = e.target.closest('[data-act]')
          if (!btn || !root.contains(btn)) return
          var act = btn.getAttribute('data-act'), id = btn.getAttribute('data-id'), name = btn.getAttribute('data-name')
          var post = id ? posts.filter(function (p) { return p.id === id })[0] : null
          switch (act) {
            case 'exit': roche.ui.closeApp(); return
            case 'back': back(); return
            case 'tab': go({ t: id }); return
            case 'htab': homeTab = id; render(); return
            case 'ptab': ptab = id; render(); return
            case 'open-char': go({ t: 'char', id: id }); return
            case 'open-topic': go({ t: 'topic', name: name }); return
            case 'open-post': go({ t: 'post', id: id }); return
            case 'focus-search': { var si = root.querySelector('[data-f=sq]'); if (si) si.focus(); return }
            case 'sheet-close': closeSheet(); return
            case 'open-settings': openSettings(); return
            case 'open-compose': openCompose(qtext); return
            case 'open-charpost': openCharPost(); return
            case 'edit-profile': editForm('Edit profile', profile, false); return
            case 'edit-char': { var c = charMap[id]; if (c) editForm('Edit', { id: c.id, name: cName(c), handle: cHandle(c), bio: cBio(c), avatar: cAvatar(c), following: cFollowing(c), followers: cFollowers(c) }, true); return }
            case 'new-topic': openNewTopic(''); return
            case 'make-topic': openNewTopic(name || id); return
            case 'read-all': notifs.forEach(function (n) { n.read = true }); await sNotifs(); render(); return

            case 'pick-q-image': { var im = await pickImage({ max: 1000, q: 0.8 }); if (im) { qimg = im; render() } return }
            case 'clear-q-image': qimg = ''; render(); return
            case 'q-topic': {
              if (!topics.length) { roche.ui.toast('先去 Super 新建一个话题'); return }
              openTopicPicker(); sheetEl.setAttribute('data-from', 'q'); return
            }
            case 'sheet-topic': { var keepText = gv('ctext'); openTopicPicker(); sheetEl.setAttribute('data-from', 'compose'); sheetEl.setAttribute('data-text', keepText); return }
            case 'topic-pick': {
              var from = sheetEl && sheetEl.getAttribute('data-from'), prevText = (sheetEl && sheetEl.getAttribute('data-text')) || ''
              if (from === 'compose') { closeSheet(); openCompose((prevText ? prevText + ' ' : '') + '#' + name + ' ') } else { qtext = (qtext ? qtext + ' ' : '') + '#' + name + ' '; closeSheet(); render() }
              return
            }
            case 'q-post': {
              var t0 = qtext.trim()
              if (!t0 && !qimg) { roche.ui.toast('先写点什么吧'); return }
              await publishMine(t0, qimg); qtext = ''; qimg = ''; return
            }
            case 'pick-post-image': { var im2 = await pickImage({ max: 1000, q: 0.8 }); if (im2) { draft.image = im2; refreshDraftImage() } return }
            case 'ai-image': {
              var pr = window.prompt ? window.prompt('想生成一张什么样的图？（用中文或英文描述）') : ''
              if (!pr) return
              roche.ui.toast('生成中…')
              try { var url = imgUrl(await roche.ai.generateImage({ prompt: pr })); if (url) { draft.image = url; refreshDraftImage() } else roche.ui.toast('没有拿到图片') } catch (er) { roche.ui.toast('生图失败：' + (er && er.message ? er.message : '请检查生图设置')) }
              return
            }
            case 'remove-post-image': draft.image = ''; refreshDraftImage(); return
            case 'submit-post': {
              var tx = gv('ctext').trim()
              if (!tx && !draft.image) { roche.ui.toast('先写点什么吧'); return }
              var img = draft.image; closeSheet(); await publishMine(tx, img); return
            }

            case 'like':
              if (post) {
                post.liked = !post.liked; post.likes = Math.max(0, (post.likes || 0) + (post.liked ? 1 : -1))
                await sPosts(); mirrorCtx(); render()
                if (post.liked && post.kind === 'char' && !post.memLiked) {
                  post.memLiked = true; await sPosts()
                  var cc = charMap[post.charId]; if (cc) remember(cc, '用户在 X 上点赞了' + cName(cc) + '的帖子「' + clip(post.text, 40) + '」', '点赞了' + cName(cc) + '在 X 上的帖子')
                }
              }
              return
            case 'repost': if (post) { post.reposted = !post.reposted; post.reposts = Math.max(0, (post.reposts || 0) + (post.reposted ? 1 : -1)); await sPosts(); render() } return
            case 'share': if (post) { try { await navigator.clipboard.writeText(post.text || ''); roche.ui.toast('已复制帖子内容') } catch (er) { roche.ui.toast('复制失败') } } return
            case 'pmenu':
              if (post) {
                var ok = await roche.ui.confirm({ title: '删除这条帖子？', message: '删除后无法恢复。' })
                if (ok) { posts = posts.filter(function (p) { return p.id !== id }); await sPosts(); mirrorCtx(); if (cur().t === 'post') back(); else render() }
              }
              return
            case 'send-comment': {
              var inp = root.querySelector('[data-f=cmtext]'); var tv = inp ? inp.value.trim() : ''
              if (!tv || !post) return
              var cm = { id: uid(), kind: 'me', text: tv, createdAt: Date.now() }
              post.comments.push(cm); post.replies = post.comments.length
              await sPosts(); mirrorCtx(); render()
              if (post.kind === 'char') {
                var cc2 = charMap[post.charId]
                if (cc2) remember(cc2, '用户在 X 上评论了' + cName(cc2) + '的帖子「' + clip(post.text, 30) + '」：' + clip(tv, 60), '评论了' + cName(cc2) + '在 X 上的帖子')
                if (settings.reply.on) { banner = cName(cc2 || {}) + ' 正在回复…'; render(); await charReply(post, cm); banner = ''; render() }
              }
              return
            }

            case 'tab-noop': return
            case 'topic-follow': { var t = topics.filter(function (x) { return x.id === id })[0]; if (t) { t.followed = !t.followed; await sTopics(); render() } return }
            case 'save-topic': {
              var nm = gv('tname').trim().replace(/^#+/, '').replace(/\s+/g, '')
              if (!nm) { roche.ui.toast('话题名不能为空'); return }
              if (topics.some(function (x) { return x.name === nm })) { roche.ui.toast('这个话题已经有了'); return }
              topics.push({ id: uid(), name: nm, desc: gv('tdesc').trim(), followed: true, createdAt: Date.now() })
              await sTopics(); closeSheet(); render(); return
            }
            case 'char-follow': { var cf = charMap[id]; if (cf) { charProfiles[id] = charProfiles[id] || {}; charProfiles[id].followed = !isFollowed(cf); await sCP(); render() } return }
            case 'post-now': { openCharPost(id); return }
            case 'next-day': await nextDay(); return

            case 'pick-avatar': { var a = await pickImage({ w: 320, h: 320, q: 0.85 }); if (a) { editImgs.avatar = a; var pa = q('[data-f=pa]'); if (pa) pa.innerHTML = '<img src="' + esc(a) + '" alt="">' } return }
            case 'pick-banner': { var b = await pickImage({ w: 1000, h: 400, q: 0.82 }); if (b) { editImgs.banner = b; roche.ui.toast('背景图已选好，点 Save 保存') } return }
            case 'save-profile': {
              profile.name = gv('name').trim() || profile.name
              profile.handle = (gv('handle').trim().replace(/^@+/, '').replace(/\s+/g, '_')) || profile.handle
              profile.bio = gv('bio').trim()
              profile.following = Math.max(0, parseInt(gv('following'), 10) || 0); profile.followers = Math.max(0, parseInt(gv('followers'), 10) || 0)
              if (editImgs.avatar) profile.avatar = editImgs.avatar
              if (editImgs.banner) profile.banner = editImgs.banner
              await sProfile(); closeSheet(); render(); roche.ui.toast('已保存'); return
            }
            case 'save-char': {
              var o = charProfiles[id] = charProfiles[id] || {}
              o.name = gv('name').trim() || undefined; o.handle = gv('handle').trim().replace(/^@+/, '').replace(/\s+/g, '_') || undefined
              o.bio = gv('bio').trim(); o.following = Math.max(0, parseInt(gv('following'), 10) || 0); o.followers = Math.max(0, parseInt(gv('followers'), 10) || 0)
              if (editImgs.avatar) o.avatar = editImgs.avatar
              if (editImgs.banner) o.banner = editImgs.banner
              await sCP(); closeSheet(); render(); roche.ui.toast('已保存'); return
            }
            case 'reset-char': { var ok2 = await roche.ui.confirm({ title: '恢复默认？', message: '会清掉你在 X 里对这个角色改的头像、背景、名字和签名。' }); if (ok2) { var keepF = charProfiles[id] && charProfiles[id].followed; delete charProfiles[id]; if (keepF === false) charProfiles[id] = { followed: false }; await sCP(); closeSheet(); render() } return }

            case 'pick-char': { charState.topic = gv('topic'); charState.sel = id; charState.preview = ''; drawCharSheet(); return }
            case 'gen-char': await genChar(); return
            case 'publish-char': {
              var pv = gv('cprev').trim(), ch = charMap[charState.sel]
              if (!pv || !ch) return
              var np = { id: uid(), kind: 'char', charId: ch.id, name: ch.name || ch.handle || '', handle: ch.handle || ch.name || '', avatar: ch.avatar || '', text: pv, image: charState.previewImage || '', createdAt: Date.now(), likes: rnd(3, 60), reposts: rnd(0, 8), replies: 0, liked: false, reposted: false, comments: [], topics: extractTags(pv) }
              posts.push(np); await sPosts(); mirrorCtx(); closeSheet(); render(); roche.ui.toast('已发布'); return
            }

            case 'save-settings': await saveSettings(); closeSheet(); render(); roche.ui.toast('已保存'); return
            case 'run-auto-now': await saveSettings(); closeSheet(); runAuto(true); return
            case 'reset-style': { var ta = q('[data-f=style]'); if (ta) ta.value = DEFAULT_STYLE; return }
            case 'reset-all': {
              var ok3 = await roche.ui.confirm({ title: '清空 X 数据？', message: '帖子、话题、热搜、通知和设置都会被清掉，且无法恢复。' })
              if (ok3) {
                posts = []; topics = []; trends = { day: 0, list: [] }; notifs = []; charProfiles = {}; settings = defaultSettings(); meta.lastAuto = {}
                await Promise.all([sPosts(), sTopics(), sTrends(), sNotifs(), sCP(), sSettings(), sMeta()]); mirrorCtx(); closeSheet(); render()
              }
              return
            }
          }
        })

        async function publishMine(text, image) {
          var p = { id: uid(), kind: 'me', text: text, image: image || '', createdAt: Date.now(), likes: 0, reposts: 0, replies: 0, liked: false, reposted: false, comments: [], topics: extractTags(text) }
          posts.push(p)
          if (p.topics.length) {
            p.topics.forEach(function (n) { if (!topics.some(function (t) { return t.name === n })) topics.push({ id: uid(), name: n, desc: '', followed: false, createdAt: Date.now() }) })
            await sTopics()
          }
          await sPosts(); mirrorCtx(); render(); roche.ui.toast('已发布')
          charsReactToMyPost(p)
        }

        /* ====================== 启动 ====================== */
        try {
          await load()
          mirrorCtx()
          render()
          setTimeout(function () { runAuto(false) }, 600)
          timer = setInterval(function () { runAuto(false) }, 60000)
        } catch (err) {
          root.innerHTML = '<div class="x-empty"><b>出错了</b><br>' + esc(err && err.message ? err.message : err) + '</div>'
        }

        container.__xCleanup = function () { alive = false; if (timer) clearInterval(timer) }
      },

      async unmount(container) {
        if (container && container.__xCleanup) container.__xCleanup()
        container.replaceChildren()
      }
    }]
  })
})()
