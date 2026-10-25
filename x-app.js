/* ==========================================================
   X App · Roche 插件 · v1.0.0（第一步：信息流 + 个人主页 + 让角色发帖）
   - 数据全部存在 roche.storage（插件私有）：
       profile  我的资料   posts  所有帖子   meta  版本信息
   - 后续版本只会“加”功能，不会改这三个名字，所以升级不会丢数据
   ========================================================== */
(function () {
  'use strict'

  var PLUGIN_ID = 'x-app'
  var APP_ID = 'x-app-home'
  var VERSION = '1.0.0'
  var ROOT = 'roche-plugin-x-app'

  /* ---------------- 样式（全部限制在 .roche-plugin-x-app 下） ---------------- */
  var CSS = `
.${ROOT}{position:relative;height:100%;width:100%;display:flex;flex-direction:column;background:#fff;color:#0f1419;overflow:hidden;font-family:-apple-system,"SF Pro Text","Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
.${ROOT} *{box-sizing:border-box}
.${ROOT} button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
.${ROOT} svg{display:block}
.${ROOT} .x-ic{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.${ROOT} .x-ic.fill{fill:currentColor;stroke:none}
.${ROOT} .x-top{display:flex;align-items:center;gap:12px;padding:calc(env(safe-area-inset-top,0px) + 8px) 14px 8px;background:rgba(255,255,255,.92);border-bottom:.5px solid #eff3f4;flex-shrink:0}
.${ROOT} .x-top .x-logo{flex:1;display:flex;justify-content:center}
.${ROOT} .x-top .x-logo svg{width:26px;height:26px}
.${ROOT} .x-ava{border-radius:50%;background:#cfd9de;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700}
.${ROOT} .x-ava img{width:100%;height:100%;object-fit:cover}
.${ROOT} .x-top .x-ava{width:34px;height:34px;font-size:15px}
.${ROOT} .x-iconbtn{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.${ROOT} .x-iconbtn:active{background:#eff3f4}
.${ROOT} .x-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:140px}
.${ROOT} .x-tabs{display:flex;border-top:.5px solid #eff3f4;background:rgba(255,255,255,.96);padding-bottom:env(safe-area-inset-bottom,0px);flex-shrink:0}
.${ROOT} .x-tabs button{flex:1;height:50px;display:flex;align-items:center;justify-content:center;color:#536471}
.${ROOT} .x-tabs button.on{color:#0f1419}
.${ROOT} .x-tabs .x-ic{width:26px;height:26px}
.${ROOT} .x-fab{position:absolute;right:18px;bottom:calc(env(safe-area-inset-bottom,0px) + 68px);width:56px;height:56px;border-radius:50%;background:#0f1419;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,.25);z-index:5}
.${ROOT} .x-fab:active{transform:scale(.94)}
.${ROOT} .x-menu{position:absolute;right:18px;bottom:calc(env(safe-area-inset-bottom,0px) + 132px);background:#fff;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.18);overflow:hidden;z-index:6;min-width:210px}
.${ROOT} .x-menu button{display:flex;align-items:center;gap:12px;width:100%;padding:14px 16px;font-size:16px;font-weight:600;text-align:left}
.${ROOT} .x-menu button+button{border-top:.5px solid #eff3f4}
.${ROOT} .x-menu button:active{background:#f7f9f9}
.${ROOT} .x-post{display:flex;gap:10px;padding:12px 16px;border-bottom:.5px solid #eff3f4}
.${ROOT} .x-post .x-ava{width:42px;height:42px;font-size:17px}
.${ROOT} .x-pbody{flex:1;min-width:0}
.${ROOT} .x-phead{display:flex;align-items:center;gap:5px;font-size:15px;line-height:1.3}
.${ROOT} .x-pname{font-weight:700;max-width:42%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.${ROOT} .x-psub{color:#536471;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.${ROOT} .x-pmore{margin-left:auto;color:#536471;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50%;flex-shrink:0}
.${ROOT} .x-ptext{font-size:15.5px;line-height:1.45;white-space:pre-wrap;word-break:break-word;margin-top:2px}
.${ROOT} .x-pimg{margin-top:10px;border-radius:16px;overflow:hidden;border:.5px solid #eff3f4}
.${ROOT} .x-pimg img{width:100%;display:block;max-height:420px;object-fit:cover}
.${ROOT} .x-acts{display:flex;justify-content:space-between;margin-top:8px;max-width:340px;color:#536471}
.${ROOT} .x-act{display:flex;align-items:center;gap:6px;font-size:13px;min-width:44px;height:30px}
.${ROOT} .x-act .x-ic{width:19px;height:19px}
.${ROOT} .x-act.liked{color:#f91880}
.${ROOT} .x-act.liked .x-ic{fill:#f91880}
.${ROOT} .x-act.reposted{color:#00ba7c}
.${ROOT} .x-empty{padding:60px 30px;text-align:center;color:#536471;font-size:15px;line-height:1.6}
.${ROOT} .x-empty b{display:block;color:#0f1419;font-size:22px;margin-bottom:6px}
.${ROOT} .x-banner{height:130px;background:linear-gradient(135deg,#3b4047,#8f97a3);background-size:cover;background-position:center;position:relative}
.${ROOT} .x-prof{padding:0 16px 12px;position:relative}
.${ROOT} .x-prof .x-ava{width:84px;height:84px;font-size:34px;border:4px solid #fff;margin-top:-42px;background:#cfd9de}
.${ROOT} .x-editbtn{position:absolute;right:16px;top:10px;height:34px;padding:0 16px;border:1px solid #cfd9de;border-radius:999px;font-weight:700;font-size:14px}
.${ROOT} .x-editbtn:active{background:#f7f9f9}
.${ROOT} .x-pn{font-size:20px;font-weight:800;margin-top:8px;line-height:1.2}
.${ROOT} .x-ph{color:#536471;font-size:15px;margin-top:1px}
.${ROOT} .x-bio{margin-top:10px;font-size:15px;line-height:1.45;white-space:pre-wrap;word-break:break-word}
.${ROOT} .x-meta{margin-top:10px;color:#536471;font-size:14px;display:flex;align-items:center;gap:6px}
.${ROOT} .x-meta .x-ic{width:17px;height:17px}
.${ROOT} .x-counts{display:flex;gap:18px;margin-top:10px;font-size:14px;color:#536471}
.${ROOT} .x-counts b{color:#0f1419;font-size:15px}
.${ROOT} .x-ptab{display:flex;border-bottom:.5px solid #eff3f4}
.${ROOT} .x-ptab div{flex:1;text-align:center;padding:14px 0;font-weight:700;font-size:15px;position:relative}
.${ROOT} .x-ptab div:after{content:"";position:absolute;left:50%;bottom:0;width:48px;height:4px;margin-left:-24px;border-radius:2px;background:#0f1419}
.${ROOT} .x-ptitle{flex:1;min-width:0}
.${ROOT} .x-ptitle b{display:block;font-size:18px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.${ROOT} .x-ptitle span{font-size:13px;color:#536471}
.${ROOT} .x-sheet{position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;justify-content:flex-end}
.${ROOT} .x-sheet-back{position:absolute;inset:0;background:rgba(0,0,0,.4)}
.${ROOT} .x-sheet-card{position:relative;background:#fff;border-radius:22px 22px 0 0;padding:16px 16px calc(env(safe-area-inset-bottom,0px) + 16px);max-height:88%;overflow-y:auto}
.${ROOT} .x-sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.${ROOT} .x-sh h3{margin:0;font-size:18px;font-weight:800}
.${ROOT} .x-btn{height:36px;padding:0 18px;border-radius:999px;background:#0f1419;color:#fff;font-weight:700;font-size:15px}
.${ROOT} .x-btn.ghost{background:#fff;color:#0f1419;border:1px solid #cfd9de}
.${ROOT} .x-btn[disabled]{opacity:.4}
.${ROOT} textarea,.${ROOT} input[type=text],.${ROOT} input[type=number]{width:100%;border:1px solid #cfd9de;border-radius:12px;padding:11px 12px;font:inherit;font-size:16px;outline:none;background:#fff;color:#0f1419}
.${ROOT} textarea{resize:none;min-height:110px;line-height:1.45}
.${ROOT} label{display:block;font-size:13px;color:#536471;margin:12px 0 5px}
.${ROOT} .x-row{display:flex;gap:10px}
.${ROOT} .x-row>*{flex:1}
.${ROOT} .x-tool{display:flex;align-items:center;gap:10px;margin-top:10px}
.${ROOT} .x-prev{margin-top:10px;position:relative;border-radius:14px;overflow:hidden}
.${ROOT} .x-prev img{width:100%;max-height:240px;object-fit:cover;display:block}
.${ROOT} .x-prev button{position:absolute;right:8px;top:8px;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;display:flex;align-items:center;justify-content:center}
.${ROOT} .x-chars{display:flex;gap:10px;overflow-x:auto;padding:4px 0 8px}
.${ROOT} .x-char{flex-shrink:0;width:74px;text-align:center;font-size:12px;color:#536471;opacity:.55}
.${ROOT} .x-char.on{opacity:1;color:#0f1419;font-weight:700}
.${ROOT} .x-char .x-ava{width:54px;height:54px;margin:0 auto 4px;font-size:22px;border:2px solid transparent}
.${ROOT} .x-char.on .x-ava{border-color:#0f1419}
.${ROOT} .x-hint{font-size:12.5px;color:#536471;line-height:1.5;margin-top:6px}
.${ROOT} .x-pick{display:flex;align-items:center;gap:12px}
.${ROOT} .x-pick .x-ava{width:56px;height:56px;font-size:22px}
`

  /* ---------------- 小工具 ---------------- */
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
  function uid() {
    return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'p' + Date.now() + Math.random().toString(16).slice(2)
  }
  function initial(name) {
    return esc(String(name || '?').trim().charAt(0).toUpperCase() || '?')
  }

  /* 图标（内联 SVG） */
  var I = {
    x: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.9 2H22l-7.2 8.2L23 22h-6.5l-5-6.6L5.7 22H2.6l7.7-8.8L2 2h6.6l4.5 6L18.9 2zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20z"/></svg>',
    home: '<svg class="x-ic" viewBox="0 0 24 24"><path d="M12 3 3 10.4V21h6.4v-6.2h5.2V21H21V10.4z"/></svg>',
    homeOn: '<svg class="x-ic fill" viewBox="0 0 24 24"><path d="M12 2.6 2 10.8V22h7.6v-6.4h4.8V22H22V10.8z"/></svg>',
    user: '<svg class="x-ic" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4.2"/><path d="M4 21c0-4.4 3.6-7.4 8-7.4s8 3 8 7.4"/></svg>',
    userOn: '<svg class="x-ic fill" viewBox="0 0 24 24"><circle cx="12" cy="7.6" r="4.6"/><path d="M3.4 22c0-4.8 3.8-8 8.6-8s8.6 3.2 8.6 8z"/></svg>',
    back: '<svg class="x-ic" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    close: '<svg class="x-ic" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    pen: '<svg class="x-ic" viewBox="0 0 24 24" style="width:26px;height:26px"><path d="M4 20l1-4.2L16.6 4.2a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8.2 19z"/><path d="M14.5 6.3l3.2 3.2"/></svg>',
    reply: '<svg class="x-ic" viewBox="0 0 24 24"><path d="M3 11.5C3 7.4 6.4 4 10.5 4h3C17.6 4 21 7.4 21 11.5S17.6 19 13.5 19H12l-5 3v-3.3C4.6 17.6 3 14.8 3 11.5z"/></svg>',
    repost: '<svg class="x-ic" viewBox="0 0 24 24"><path d="M17 3l4 4-4 4M3 11V9a2 2 0 0 1 2-2h16M7 21l-4-4 4-4M21 13v2a2 2 0 0 1-2 2H3"/></svg>',
    heart: '<svg class="x-ic" viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 2.9 4.6 6.4 4.6c2 0 3.6 1.1 4.6 2.7l1 1.6 1-1.6c1-1.6 2.6-2.7 4.6-2.7 3.5 0 5.5 3.7 4 7.1C19.5 16.4 12 21 12 21z"/></svg>',
    share: '<svg class="x-ic" viewBox="0 0 24 24"><path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
    more: '<svg class="x-ic fill" viewBox="0 0 24 24" style="width:20px;height:20px"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
    image: '<svg class="x-ic" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M4 18l5.5-5 4 3.5 3-2.5L21 17"/></svg>',
    spark: '<svg class="x-ic" viewBox="0 0 24 24"><path d="M12 3l1.9 5.4L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.6z"/><path d="M19 16v4M17 18h4"/></svg>',
    cal: '<svg class="x-ic" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>'
  }

  /* ---------------- 注册插件 ---------------- */
  window.RochePlugin.register({
    id: PLUGIN_ID,
    name: 'X',
    version: VERSION,
    apps: [
      {
        id: APP_ID,
        name: 'X',
        icon: 'alternate_email',
        iconImage: '',
        async mount(container, roche) {
          /* ---- 状态 ---- */
          var profile = null
          var posts = []
          var view = 'home' // home | profile
          var sheetEl = null
          var menuOpen = false
          var draft = { text: '', image: '' }
          var charState = { list: [], sel: '', topic: '', preview: '', busy: false }
          var editImgs = { avatar: null, banner: null }

          var styleEl = document.createElement('style')
          styleEl.textContent = CSS
          container.replaceChildren()
          var root = document.createElement('div')
          root.className = ROOT
          container.appendChild(styleEl)
          container.appendChild(root)

          /* ---- 读 / 存 ---- */
          async function load() {
            profile = await roche.storage.get('profile')
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
              } catch (e) { /* 没有人设也没关系 */ }
              await roche.storage.set('profile', profile)
            }
            posts = (await roche.storage.get('posts')) || []
            await roche.storage.set('meta', { schema: 1, pluginVersion: VERSION })
          }
          async function saveProfile() { await roche.storage.set('profile', profile) }
          async function savePosts() { await roche.storage.set('posts', posts) }

          /* ---- 选图（压缩后存成 dataURL） ---- */
          function pickImage(opts) {
            return new Promise(function (resolve) {
              var input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
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

          /* ---- 渲染：帖子 ---- */
          function authorOf(p) {
            if (p.kind === 'me') return { name: profile.name, handle: profile.handle, avatar: profile.avatar }
            return { name: p.name, handle: p.handle, avatar: p.avatar }
          }
          function avatarHtml(a) {
            return '<div class="x-ava">' + (a.avatar ? '<img src="' + esc(a.avatar) + '" alt="">' : initial(a.name)) + '</div>'
          }
          function postHtml(p) {
            var a = authorOf(p)
            return '<div class="x-post" data-id="' + esc(p.id) + '">' + avatarHtml(a) +
              '<div class="x-pbody">' +
              '<div class="x-phead"><span class="x-pname">' + esc(a.name) + '</span><span class="x-psub">@' + esc(a.handle) + ' · ' + ago(p.createdAt) + '</span>' +
              '<button class="x-pmore" data-act="menu" data-id="' + esc(p.id) + '">' + I.more + '</button></div>' +
              (p.text ? '<div class="x-ptext">' + esc(p.text) + '</div>' : '') +
              (p.image ? '<div class="x-pimg"><img src="' + esc(p.image) + '" alt=""></div>' : '') +
              '<div class="x-acts">' +
              '<button class="x-act" data-act="reply" data-id="' + esc(p.id) + '">' + I.reply + '<span>' + fmt(p.replies) + '</span></button>' +
              '<button class="x-act' + (p.reposted ? ' reposted' : '') + '" data-act="repost" data-id="' + esc(p.id) + '">' + I.repost + '<span>' + fmt(p.reposts) + '</span></button>' +
              '<button class="x-act' + (p.liked ? ' liked' : '') + '" data-act="like" data-id="' + esc(p.id) + '">' + I.heart + '<span>' + fmt(p.likes) + '</span></button>' +
              '<button class="x-act" data-act="share" data-id="' + esc(p.id) + '">' + I.share + '</button>' +
              '</div></div></div>'
          }

          /* ---- 渲染：页面 ---- */
          function render() {
            var h = ''
            if (view === 'home') {
              var list = posts.slice().sort(function (a, b) { return b.createdAt - a.createdAt })
              h += '<div class="x-top"><button data-act="go-profile" style="display:flex">' +
                '<div class="x-ava">' + (profile.avatar ? '<img src="' + esc(profile.avatar) + '" alt="">' : initial(profile.name)) + '</div></button>' +
                '<div class="x-logo">' + I.x + '</div>' +
                '<button class="x-iconbtn" data-act="exit" title="Back to Roche">' + I.close + '</button></div>'
              h += '<div class="x-scroll">' + (list.length ? list.map(postHtml).join('') :
                '<div class="x-empty"><b>Welcome to X</b>还没有帖子。<br>点右下角的按钮，写第一条，或者让角色替你发一条。</div>') + '</div>'
            } else {
              var mine = posts.filter(function (p) { return p.kind === 'me' }).sort(function (a, b) { return b.createdAt - a.createdAt })
              var d = new Date(profile.joinedAt || Date.now())
              h += '<div class="x-top"><button class="x-iconbtn" data-act="go-home">' + I.back + '</button>' +
                '<div class="x-ptitle"><b>' + esc(profile.name) + '</b><span>' + mine.length + ' posts</span></div></div>'
              h += '<div class="x-scroll">' +
                '<div class="x-banner"' + (profile.banner ? ' style="background-image:url(\'' + esc(profile.banner) + '\')"' : '') + '></div>' +
                '<div class="x-prof">' +
                '<div class="x-ava">' + (profile.avatar ? '<img src="' + esc(profile.avatar) + '" alt="">' : initial(profile.name)) + '</div>' +
                '<button class="x-editbtn" data-act="edit-profile">Edit profile</button>' +
                '<div class="x-pn">' + esc(profile.name) + '</div>' +
                '<div class="x-ph">@' + esc(profile.handle) + '</div>' +
                (profile.bio ? '<div class="x-bio">' + esc(profile.bio) + '</div>' : '') +
                '<div class="x-meta">' + I.cal + '<span>Joined ' + MON[d.getMonth()] + ' ' + d.getFullYear() + '</span></div>' +
                '<div class="x-counts"><span><b>' + fmt(profile.following) + '</b> Following</span><span><b>' + fmt(profile.followers) + '</b> Followers</span></div>' +
                '</div>' +
                '<div class="x-ptab"><div>Posts</div></div>' +
                (mine.length ? mine.map(postHtml).join('') : '<div class="x-empty">还没有发过帖子</div>') +
                '</div>'
            }
            h += '<button class="x-fab" data-act="fab">' + I.pen + '</button>'
            if (menuOpen) {
              h += '<div class="x-menu"><button data-act="open-compose">' + I.pen.replace('style="width:26px;height:26px"', '') + 'Write a post</button>' +
                '<button data-act="open-charpost">' + I.spark + 'Post as a character</button></div>'
            }
            h += '<div class="x-tabs"><button class="' + (view === 'home' ? 'on' : '') + '" data-act="go-home">' + (view === 'home' ? I.homeOn : I.home) + '</button>' +
              '<button class="' + (view === 'profile' ? 'on' : '') + '" data-act="go-profile">' + (view === 'profile' ? I.userOn : I.user) + '</button></div>'

            var keep = sheetEl
            if (keep && keep.parentNode) keep.parentNode.removeChild(keep)
            root.innerHTML = h
            if (keep) root.appendChild(keep)
          }

          /* ---- 弹出层 ---- */
          function closeSheet() {
            if (sheetEl && sheetEl.parentNode) sheetEl.parentNode.removeChild(sheetEl)
            sheetEl = null
          }
          function openSheet(html) {
            closeSheet()
            var el = document.createElement('div')
            el.className = 'x-sheet'
            el.innerHTML = '<div class="x-sheet-back" data-act="sheet-close"></div><div class="x-sheet-card">' + html + '</div>'
            root.appendChild(el)
            sheetEl = el
            return el
          }
          function q(sel) { return sheetEl ? sheetEl.querySelector(sel) : null }

          /* 写帖子 */
          function openCompose() {
            draft = { text: '', image: '' }
            var el = openSheet(
              '<div class="x-sh"><button class="x-btn ghost" data-act="sheet-close">Cancel</button><button class="x-btn" data-act="submit-post">Post</button></div>' +
              '<textarea data-f="ctext" placeholder="What\'s happening?"></textarea>' +
              '<div data-f="cimg"></div>' +
              '<div class="x-tool"><button class="x-iconbtn" data-act="pick-post-image">' + I.image + '</button></div>')
            setTimeout(function () { var t = el.querySelector('[data-f=ctext]'); if (t) t.focus() }, 80)
          }
          function refreshDraftImage() {
            var box = q('[data-f=cimg]')
            if (!box) return
            box.innerHTML = draft.image ? '<div class="x-prev"><img src="' + esc(draft.image) + '" alt=""><button data-act="remove-post-image">' + I.close.replace('class="x-ic"', 'class="x-ic" style="width:16px;height:16px"') + '</button></div>' : ''
          }

          /* 编辑资料 */
          function openEdit() {
            editImgs = { avatar: null, banner: null }
            openSheet(
              '<div class="x-sh"><button class="x-btn ghost" data-act="sheet-close">Cancel</button><h3>Edit profile</h3><button class="x-btn" data-act="save-profile">Save</button></div>' +
              '<div class="x-pick"><div class="x-ava" data-f="pa">' + (profile.avatar ? '<img src="' + esc(profile.avatar) + '" alt="">' : initial(profile.name)) + '</div>' +
              '<button class="x-btn ghost" data-act="pick-avatar">更换头像</button><button class="x-btn ghost" data-act="pick-banner">更换背景图</button></div>' +
              '<label>Name</label><input type="text" data-f="name" value="' + esc(profile.name) + '" maxlength="40">' +
              '<label>Handle（不用写 @）</label><input type="text" data-f="handle" value="' + esc(profile.handle) + '" maxlength="30">' +
              '<label>Bio（个性签名）</label><textarea data-f="bio" maxlength="160" style="min-height:80px">' + esc(profile.bio) + '</textarea>' +
              '<div class="x-row"><div><label>Following</label><input type="number" data-f="following" value="' + (Number(profile.following) || 0) + '" min="0"></div>' +
              '<div><label>Followers</label><input type="number" data-f="followers" value="' + (Number(profile.followers) || 0) + '" min="0"></div></div>' +
              '<div class="x-hint">关注数和粉丝数只是你自己填的数字，不是真实数据。</div>')
          }

          /* 让角色发帖 */
          async function openCharPost() {
            charState = { list: [], sel: '', topic: '', preview: '', busy: false }
            openSheet('<div class="x-sh"><h3>Post as a character</h3><button class="x-btn ghost" data-act="sheet-close">Close</button></div><div class="x-hint">正在读取角色…</div>')
            try { charState.list = (await roche.character.list()) || [] } catch (e) { charState.list = [] }
            if (charState.list.length) charState.sel = charState.list[0].id
            drawCharSheet()
          }
          function drawCharSheet() {
            if (!sheetEl) return
            var cs = charState
            var card = sheetEl.querySelector('.x-sheet-card')
            if (!cs.list.length) {
              card.innerHTML = '<div class="x-sh"><h3>Post as a character</h3><button class="x-btn ghost" data-act="sheet-close">Close</button></div><div class="x-hint">没有读取到角色。请先在 Roche 里创建角色。</div>'
              return
            }
            var chips = cs.list.map(function (c) {
              var nm = c.handle || c.name
              return '<button class="x-char' + (c.id === cs.sel ? ' on' : '') + '" data-act="pick-char" data-id="' + esc(c.id) + '">' +
                '<div class="x-ava">' + (c.avatar ? '<img src="' + esc(c.avatar) + '" alt="">' : initial(nm)) + '</div>' + esc(nm) + '</button>'
            }).join('')
            card.innerHTML =
              '<div class="x-sh"><h3>Post as a character</h3><button class="x-btn ghost" data-act="sheet-close">Close</button></div>' +
              '<div class="x-chars">' + chips + '</div>' +
              '<label>想让 TA 发什么？（可以留空，让 TA 自己想）</label><input type="text" data-f="topic" value="' + esc(cs.topic) + '" placeholder="例如：下雨天、今天的晚饭">' +
              '<div class="x-tool"><button class="x-btn" data-act="gen-char"' + (cs.busy ? ' disabled' : '') + '>' + (cs.busy ? 'Generating…' : (cs.preview ? 'Regenerate' : 'Generate')) + '</button></div>' +
              (cs.preview ? '<label>预览（可以直接改）</label><textarea data-f="cprev">' + esc(cs.preview) + '</textarea>' +
                '<div class="x-tool"><button class="x-btn" data-act="publish-char">Post</button></div>' : '') +
              '<div class="x-hint">会用 Roche 当前设置的聊天接口，按这个角色的人设写一条帖子。</div>'
          }
          async function generateChar() {
            var cs = charState
            var c = cs.list.filter(function (x) { return x.id === cs.sel })[0]
            if (!c) return
            var t = q('[data-f=topic]'); if (t) cs.topic = t.value
            cs.busy = true; drawCharSheet()
            try {
              var full = c
              try { full = (await roche.character.get(c.id)) || c } catch (e) { /* 用列表里的 */ }
              var personaText = full.persona || full.bio || ''
              var me = ''
              try {
                var u = await roche.persona.getActiveUserPersona()
                if (u) me = (u.name || u.handle || '') + (u.bio ? '（' + u.bio + '）' : '')
              } catch (e) { /* 忽略 */ }
              var sys = '你正在扮演下面这个角色，在社交平台 X 上发一条帖子。\n' +
                '角色名：' + (full.name || '') + '\n昵称：' + (full.handle || '') + '\n人设：' + personaText + '\n' +
                (me ? '平台上另一位用户是：' + me + '\n' : '') +
                '要求：只输出帖子正文；口吻和人设一致；不超过 140 个字；不要加引号、不要加解释、不要加表情以外的多余符号。'
              var res = await roche.ai.chat({
                messages: [
                  { role: 'system', content: sys },
                  { role: 'user', content: cs.topic ? '主题：' + cs.topic : '随意发一条你此刻想发的帖子。' }
                ],
                temperature: 0.9
              })
              var text = String((res && res.text) || '').trim().replace(/^["“「]+|["”」]+$/g, '').trim()
              cs.preview = text || ''
              if (!text) roche.ui.toast('没有生成出内容，换个主题再试试')
            } catch (e) {
              roche.ui.toast('生成失败：' + (e && e.message ? e.message : '请检查聊天接口设置'))
            }
            cs.busy = false; drawCharSheet()
          }

          /* ---- 事件（统一在 root 上处理） ---- */
          root.addEventListener('click', async function (e) {
            var btn = e.target.closest('[data-act]')
            if (!btn || !root.contains(btn)) return
            var act = btn.getAttribute('data-act')
            var id = btn.getAttribute('data-id')
            var post = id ? posts.filter(function (p) { return p.id === id })[0] : null

            if (act !== 'fab') { if (menuOpen) { menuOpen = false } }

            switch (act) {
              case 'exit': roche.ui.closeApp(); return
              case 'go-home': view = 'home'; menuOpen = false; render(); return
              case 'go-profile': view = 'profile'; menuOpen = false; render(); return
              case 'fab': menuOpen = !menuOpen; render(); return
              case 'open-compose': menuOpen = false; render(); openCompose(); return
              case 'open-charpost': menuOpen = false; render(); openCharPost(); return
              case 'sheet-close': closeSheet(); render(); return

              case 'pick-post-image': {
                var img = await pickImage({ max: 1000, q: 0.8 })
                if (img) { draft.image = img; refreshDraftImage() }
                return
              }
              case 'remove-post-image': draft.image = ''; refreshDraftImage(); return
              case 'submit-post': {
                var tx = q('[data-f=ctext]'); var text = tx ? tx.value.trim() : ''
                if (!text && !draft.image) { roche.ui.toast('先写点什么吧'); return }
                posts.push({ id: uid(), kind: 'me', text: text, image: draft.image, createdAt: Date.now(), likes: 0, reposts: 0, replies: 0, liked: false, reposted: false })
                await savePosts(); closeSheet(); view = view; render(); roche.ui.toast('已发布')
                return
              }

              case 'like':
                if (post) { post.liked = !post.liked; post.likes = Math.max(0, (post.likes || 0) + (post.liked ? 1 : -1)); await savePosts(); render() }
                return
              case 'repost':
                if (post) { post.reposted = !post.reposted; post.reposts = Math.max(0, (post.reposts || 0) + (post.reposted ? 1 : -1)); await savePosts(); render() }
                return
              case 'reply': roche.ui.toast('评论功能会在后面的版本加入'); return
              case 'share':
                if (post) {
                  try { await navigator.clipboard.writeText(post.text || ''); roche.ui.toast('已复制帖子内容') } catch (er) { roche.ui.toast('复制失败') }
                }
                return
              case 'menu':
                if (post) {
                  var ok = await roche.ui.confirm({ title: '删除这条帖子？', message: '删除后无法恢复。' })
                  if (ok) { posts = posts.filter(function (p) { return p.id !== id }); await savePosts(); render() }
                }
                return

              case 'edit-profile': openEdit(); return
              case 'pick-avatar': {
                var a = await pickImage({ w: 320, h: 320, q: 0.85 })
                if (a) { editImgs.avatar = a; var pa = q('[data-f=pa]'); if (pa) pa.innerHTML = '<img src="' + esc(a) + '" alt="">' }
                return
              }
              case 'pick-banner': {
                var b = await pickImage({ w: 1000, h: 333, q: 0.82 })
                if (b) { editImgs.banner = b; roche.ui.toast('背景图已选好，点 Save 保存') }
                return
              }
              case 'save-profile': {
                var g = function (n) { var el = q('[data-f=' + n + ']'); return el ? el.value : '' }
                profile.name = g('name').trim() || profile.name
                profile.handle = (g('handle').trim().replace(/^@+/, '').replace(/\s+/g, '_')) || profile.handle
                profile.bio = g('bio').trim()
                profile.following = Math.max(0, parseInt(g('following'), 10) || 0)
                profile.followers = Math.max(0, parseInt(g('followers'), 10) || 0)
                if (editImgs.avatar) profile.avatar = editImgs.avatar
                if (editImgs.banner) profile.banner = editImgs.banner
                await saveProfile(); closeSheet(); render(); roche.ui.toast('已保存')
                return
              }

              case 'pick-char': {
                var t = q('[data-f=topic]'); if (t) charState.topic = t.value
                charState.sel = id; charState.preview = ''; drawCharSheet(); return
              }
              case 'gen-char': await generateChar(); return
              case 'publish-char': {
                var pv = q('[data-f=cprev]'); var txt = pv ? pv.value.trim() : ''
                var ch = charState.list.filter(function (x) { return x.id === charState.sel })[0]
                if (!txt || !ch) return
                posts.push({
                  id: uid(), kind: 'char', charId: ch.id,
                  name: ch.name || ch.handle || 'Character', handle: String(ch.handle || ch.name || 'character').replace(/\s+/g, '_'),
                  avatar: ch.avatar || '', text: txt, image: '', createdAt: Date.now(),
                  likes: Math.floor(Math.random() * 40) + 3, reposts: Math.floor(Math.random() * 8), replies: 0, liked: false, reposted: false
                })
                await savePosts(); closeSheet(); view = 'home'; render(); roche.ui.toast('已发布')
                return
              }
            }
          })

          /* ---- 启动 ---- */
          try {
            await load()
            render()
          } catch (err) {
            root.innerHTML = '<div class="x-empty"><b>出错了</b>' + esc(err && err.message ? err.message : err) + '</div>'
          }
        },

        async unmount(container, roche) {
          container.replaceChildren()
        }
      }
    ]
  })
})()
