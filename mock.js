/*
 * ProfitTable app mockup — prototype shortcut.
 *
 * A tiny stand-in for the StateTag runtime: one state object, $read / $write, and vanilla custom elements
 * that re-render when state is written. Nothing here is the real runtime; it exists so the page can be
 * written the STA way (HTML-first, x- tags) and clicked through.
 */
(function () {
    'use strict';

    const data = window.mockData;

    // ---------------------------------------------------------------- state

    const state = {
        loc: 'harbour',
        view: 'products',                 // products | invoices | suppliers
        open: {product: null, invoice: null, items: false, supplier: null},
        month: null,                      // index of the selected bar, or null
        overlay: null,                    // camera | search | locations | team
        menu: false,
        pages: 0,                         // pages captured in the open camera
        toast: null,
        photo: null,                      // invoice id shown in the photo viewer
        query: '',
        captured: {harbour: [], dockside: []}
    };

    const loc = () => data.locations[state.loc];

    function $read(path) {
        const keys = path.split('.');
        const root = keys[0] === 'location' ? (keys.shift(), loc()) : state;
        return keys.reduce((o, k) => (o == null ? o : o[k]), root);
    }

    function $write(path, value) {
        const keys = path.split('.');
        const last = keys.pop();
        const target = keys.reduce((o, k) => o[k], state);
        if (!(last in target)) throw new Error('Undeclared locus: ' + path);
        target[last] = value;
        changed();
    }

    const changed = () => document.dispatchEvent(new CustomEvent('sta-write'));

    // ---------------------------------------------------------------- derived data

    function products() {
        return loc().buys.map(b => {
            const c = data.catalog[b.pid];
            const has = c.members >= data.minMembers;
            const pct = has ? (b.you - c.avg) / c.avg * 100 : null;
            const status = !has ? 'nodata' : pct > 3 ? 'over' : pct < -3 ? 'under' : 'inline';
            const saving = status === 'over' ? (b.you - c.avg) * b.annualQty : 0;
            return Object.assign({}, c, b, {id: b.pid, has, pct, status, saving});
        });
    }

    const product = id => products().find(p => p.id === id);

    function invoices() {
        return state.captured[state.loc].concat(loc().invoices).map(inv => {
            const items = inv.items.map((it, index) => {
                if (!it.pid) return Object.assign({index, line: it.amount, atAvg: it.amount, over: 0, p: null}, it);
                const p = product(it.pid);
                const qty = it.packs * it.perPack;
                const line = qty * p.you;
                const atAvg = p.has ? qty * p.avg : line;
                return Object.assign({index, p, qty, line, atAvg, over: p.status === 'over' ? line - atAvg : 0}, it);
            });
            const sum = k => items.reduce((t, i) => t + i[k], 0);
            return Object.assign({}, inv, {
                items,
                total: sum('line'),
                atAvg: sum('atAvg'),
                overAmount: sum('over'),
                overCount: items.filter(i => i.over > 0).length,
                checks: items.filter(i => i.check).length
            });
        });
    }

    function suppliers() {
        const map = {};
        products().forEach(p => {
            const s = map[p.supplier] || (map[p.supplier] = {name: p.supplier, products: [], spend: 0, bSpend: 0, bAvg: 0, saving: 0});
            s.products.push(p);
            s.spend += p.you * p.annualQty;
            s.saving += p.saving;
            if (p.has) {
                s.bSpend += p.you * p.annualQty;
                s.bAvg += p.avg * p.annualQty;
            }
        });
        return Object.values(map).map(s => {
            s.pct = s.bAvg ? (s.bSpend - s.bAvg) / s.bAvg * 100 : null;
            s.status = s.pct == null ? 'nodata' : s.pct > 3 ? 'over' : s.pct < -3 ? 'under' : 'inline';
            return s;
        }).sort((a, b) => b.saving - a.saving || b.spend - a.spend);
    }

    // ---------------------------------------------------------------- formatting

    const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
    const money = (n, dec) => '$' + Number(n).toLocaleString('en-US', {minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0});
    const per = p => money(p.you, true) + '/' + p.unit;
    const pct1 = n => Math.abs(n).toFixed(1) + '%';
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const niceDate = iso => MONTHS[+iso.slice(5, 7) - 1] + ' ' + (+iso.slice(8, 10));
    const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');

    const ICONS = {
        store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/>',
        camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
        search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
        team: '<circle cx="12" cy="9" r="3"/><path d="M6.5 19v-1a5.5 5.5 0 0 1 11 0v1"/><path d="M19 7.5a2.5 2.5 0 0 1 0 5M5 7.5a2.5 2.5 0 0 0 0 5"/>',
        user: '<circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/>',
        close: '<path d="M6 6l12 12M18 6L6 18"/>',
        image: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 17l5-5 4 4 3-3 4 4"/>',
        list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
        check: '<path d="M5 12l5 5 9-10"/>',
        chevron: '<path d="M6 9l6 6 6-6"/>',
        mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
        plus: '<path d="M12 5v14M5 12h14"/>',
        lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
    };
    const icon = name => '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';

    function pill(status, pct) {
        if (status === 'over') return '<span class="pill over">▲ ' + pct1(pct) + '</span>';
        if (status === 'under') return '<span class="pill under">▼ ' + pct1(pct) + '</span>';
        if (status === 'inline') return '<span class="pill inline">≈ avg</span>';
        return '<span class="pill nodata">no data</span>';
    }

    // ---------------------------------------------------------------- small charts

    function rangeBar(p) {
        const pos = v => Math.max(0, Math.min(100, (v - p.min) / (p.max - p.min) * 100));
        return '<div class="range">' +
            '<div class="range-track">' +
            '<i class="range-avg" style="left:' + pos(p.avg) + '%"></i>' +
            '<i class="range-you ' + p.status + '" style="left:' + pos(p.you) + '%"></i>' +
            '</div>' +
            '<div class="range-labels"><span>lowest ' + money(p.min, true) + '</span><span>highest ' + money(p.max, true) + '</span></div>' +
            '<div class="legend"><span><i class="dot you ' + p.status + '"></i>You ' + money(p.you, true) + '</span>' +
            '<span><i class="tick"></i>Members average ' + money(p.avg, true) + '</span></div>' +
            '</div>';
    }

    function sparkline(p) {
        const steps = 6, W = 300, H = 64, pad = 8;
        const series = (from, to) => Array.from({length: steps}, (_, i) => from + (to - from) * i / (steps - 1));
        const you = series(p.from, p.you);
        const avg = p.has ? series(p.avgFrom, p.avg) : null;
        const all = you.concat(avg || []);
        const lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), span = (hi - lo) || 1;
        const x = i => pad + i * (W - pad * 2) / (steps - 1);
        const y = v => H - pad - (v - lo) / span * (H - pad * 2);
        const line = (s, cls) => '<polyline class="' + cls + '" points="' + s.map((v, i) => x(i).toFixed(1) + ',' + y(v).toFixed(1)).join(' ') + '"/>' +
            '<circle class="' + cls + '" cx="' + x(steps - 1) + '" cy="' + y(s[steps - 1]).toFixed(1) + '" r="3"/>';
        const change = (p.you - p.from) / p.from * 100;
        return '<div class="spark">' +
            '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Price over the last six months">' +
            (avg ? line(avg, 'avg') : '') + line(you, 'you ' + p.status) + '</svg>' +
            '<div class="range-labels"><span>Jun</span><span>Nov</span></div>' +
            '<p class="fine">Your price ' + (Math.abs(change) < 0.5 ? 'has held steady' : (change > 0 ? 'is up ' : 'is down ') + pct1(change)) + ' over six months' +
            (avg ? '; the members average ' + (Math.abs((p.avg - p.avgFrom) / p.avgFrom * 100) < 0.5 ? 'held steady' : (p.avg > p.avgFrom ? 'rose ' : 'fell ') + pct1((p.avg - p.avgFrom) / p.avgFrom * 100)) : '') + '.</p>' +
            '</div>';
    }

    // ---------------------------------------------------------------- tag base

    class Tag extends HTMLElement {
        connectedCallback() {
            this.render();
            document.addEventListener('sta-write', () => this.render());
        }
        render() {}
    }
    const define = (name, render) => customElements.define(name, class extends Tag {
        render() { this.innerHTML = render.call(this) || ''; }
    });

    define('x-icon', function () { return icon(this.getAttribute('name')); });
    define('x-text-html', function () { return esc($read(this.getAttribute('locus'))); });

    // ---------------------------------------------------------------- title bar

    define('x-profile-menu', function () {
        const u = data.user;
        return '<button type="button" class="profile-btn" aria-label="Profile menu" onclick="stateTagApp.commands.toggleMenu(event)">' + icon('user') + '</button>' +
            (state.menu ? '<div class="menu">' +
                '<div class="menu-who"><b>' + esc(u.name) + '</b><small>' + esc(u.role) + ' · ' + esc(u.plan) + '</small></div>' +
                ['Account', 'Plan and billing', 'Notifications', 'How your data is shared'].map(label =>
                    '<button type="button" onclick="stateTagApp.commands.menu(\'' + label + '\')">' + label + '</button>').join('') +
                '<button type="button" class="quiet" onclick="stateTagApp.commands.menu(\'Sign out\')">Sign out</button>' +
                '</div>' : '');
    });

    // ---------------------------------------------------------------- graphic space

    define('x-savings-ring', function () {
        const ps = products().filter(p => p.has);
        const over = ps.filter(p => p.status === 'over');
        const total = over.reduce((t, p) => t + p.saving, 0);
        const C = 2 * Math.PI * 34;
        const share = ps.length ? over.length / ps.length : 0;
        return '<button type="button" class="ring" onclick="stateTagApp.commands.setView(\'products\')" aria-label="Potential savings">' +
            '<svg viewBox="0 0 80 80"><circle class="ring-bg" cx="40" cy="40" r="34"/>' +
            '<circle class="ring-fg" cx="40" cy="40" r="34" stroke-dasharray="' + (C * share).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 40 40)"/></svg>' +
            '<span class="ring-text"><b>' + (total >= 1000 ? '$' + (total / 1000).toFixed(1) + 'k' : money(total)) + '</b><small>a year</small></span>' +
            '</button>' +
            '<p class="ring-cap"><b>Potential savings</b>' + over.length + ' of ' + plural(ps.length, 'product') + ' above the members average</p>';
    });

    define('x-over-chart', function () {
        const months = loc().months;
        const max = Math.max.apply(null, months.map(m => m.over));
        const sel = state.month == null ? null : months[state.month];
        return '<p class="chart-title">Paid over average, by month</p>' +
            '<div class="bars">' + months.map((m, i) =>
                '<button type="button" class="bar' + (state.month === i ? ' sel' : '') + (m.partial ? ' partial' : '') + '" onclick="stateTagApp.commands.setMonth(' + i + ')" aria-label="' + m.label + '">' +
                '<i style="height:' + Math.max(6, m.over / max * 100) + '%"></i><span>' + m.label + '</span></button>').join('') + '</div>' +
            '<p class="chart-cap">' + (sel
                ? '<b>' + sel.label + (sel.partial ? ' so far' : '') + ':</b> ' + money(sel.over) + ' over average on ' + money(sel.spend) + ' of invoices'
                : 'Tap a month for detail') + '</p>';
    });

    // ---------------------------------------------------------------- view tabs

    define('x-view-tabs', function () {
        const tabs = [['products', 'Products', products().length], ['invoices', 'Invoices', invoices().length], ['suppliers', 'Suppliers', suppliers().length]];
        return '<div class="tabs" role="tablist">' + tabs.map(t =>
            '<button type="button" role="tab" aria-selected="' + (state.view === t[0]) + '" class="' + (state.view === t[0] ? 'on' : '') + '" onclick="stateTagApp.commands.setView(\'' + t[0] + '\')">' +
            t[1] + ' <small>' + t[2] + '</small></button>').join('') + '</div>';
    });

    // ---------------------------------------------------------------- products (the benchmark list)

    function productBody(p) {
        const g = data.peerGroup;
        if (!p.has) {
            return '<p>Only ' + plural(p.members, 'restaurant') + ' in your group ' + (p.members === 1 ? 'buys' : 'buy') + ' this so far. A comparison appears once ' + data.minMembers + ' do, so no single restaurant’s price can be picked out.</p>' +
                '<p class="label">Your own price, ' + per(p) + '</p>' + sparkline(p);
        }
        const sentence = 'You pay <b>' + money(p.you, true) + '</b> per ' + p.unit + '. ' + plural(p.members, 'restaurant') + ' average <b>' + money(p.avg, true) + '</b>. ' +
            (p.status === 'over' ? 'You’re <b>' + pct1(p.pct) + ' over</b>, about <b>' + money(p.saving) + ' a year</b> at your volume.'
                : p.status === 'under' ? 'You’re <b>' + pct1(p.pct) + ' under</b>.'
                    : 'You’re in line with the group.');
        const advice = p.status === 'over'
            ? '<div class="advice over"><b>What to do</b>Ask ' + esc(p.supplier) + ' to match ' + money(p.avg, true) + ' per ' + p.unit + '. Bring two facts: other members pay ' + money(p.min, true) + ' to ' + money(p.max, true) + ', and you buy about ' + p.annualQty.toLocaleString('en-US') + ' ' + p.unit + (p.unit.length > 2 ? 's' : '') + ' a year.</div>'
            : p.status === 'under'
                ? '<div class="advice under"><b>Good deal</b>You’re among the lower prices in the group. Nothing to do.</div>'
                : '<div class="advice"><b>Fair price</b>Close to what the group pays. Nothing to do.</div>';
        return '<p>' + sentence + '</p>' + rangeBar(p) + advice +
            '<p class="label">Price over six months</p>' + sparkline(p) +
            '<p class="label">What this is based on</p>' +
            '<div class="chips"><span>' + plural(p.members, 'restaurant') + '</span><span>' + esc(g.region) + '</span><span>' + esc(g.segment) + '</span><span>' + esc(g.window) + '</span></div>' +
            '<p class="fine">Matched from your invoices: ' + p.printed.map(s => '<code>' + esc(s) + '</code>').join(' ') + '</p>';
    }

    function productRow(p) {
        const open = state.open.product === p.id;
        return '<article class="row' + (open ? ' open' : '') + '" data-id="product-' + p.id + '">' +
            '<button type="button" class="row-head" aria-expanded="' + open + '" onclick="stateTagApp.commands.toggle(\'product\',\'' + p.id + '\')">' +
            pill(p.status, p.pct) +
            '<span class="row-main"><b>' + esc(p.name) + '</b><small>' + per(p) + (p.has ? ' · members ' + money(p.avg, true) : '') + '</small></span>' +
            (p.saving ? '<span class="row-amt"><b>' + money(p.saving) + '</b><small>a year</small></span>' : '<span class="row-amt"></span>') +
            '</button>' +
            (open ? '<div class="row-body">' + productBody(p) + '</div>' : '') +
            '</article>';
    }

    define('x-products', function () {
        this.hidden = state.view !== 'products';
        if (this.hidden) return '';
        const ps = products();
        const groups = [
            ['over', 'Paying over the average', (a, b) => b.saving - a.saving],
            ['inline', 'In line with the group', (a, b) => a.name.localeCompare(b.name)],
            ['under', 'Better than the average', (a, b) => a.pct - b.pct],
            ['nodata', 'Not enough restaurants yet', (a, b) => a.name.localeCompare(b.name)]
        ];
        return groups.map(g => {
            const list = ps.filter(p => p.status === g[0]).sort(g[2]);
            return list.length ? '<h2 class="group">' + g[1] + ' <small>' + list.length + '</small></h2>' + list.map(productRow).join('') : '';
        }).join('');
    });

    // ---------------------------------------------------------------- invoices (the receipt card, three levels)

    function itemRow(inv, it) {
        if (!it.p) {
            return '<div class="item"><div class="item-top"><span class="item-name">' + esc(it.printed) + '<small>Not a product we compare</small></span>' +
                '<span class="item-amt">' + money(it.line, true) + '</span><span class="pill none"></span></div></div>';
        }
        const p = it.p;
        const note = !p.has ? 'Too few restaurants buy this to compare yet.'
            : p.status === 'over' ? per(p) + '. Members average ' + money(p.avg, true) + '. <b>' + money(it.over, true) + ' over</b> on this line.'
                : p.status === 'under' ? per(p) + '. Members average ' + money(p.avg, true) + '. You’re ahead on this one.'
                    : per(p) + '. In line with the members average of ' + money(p.avg, true) + '.';
        return '<div class="item">' +
            '<div class="item-top" onclick="stateTagApp.commands.go(\'product\',\'' + p.id + '\')">' +
            '<span class="item-name">' + esc(it.printed) + '<small>' + esc(p.name) + ' · ' + it.packs + ' × ' + it.perPack + ' ' + p.unit + '</small></span>' +
            '<span class="item-amt">' + money(it.line, true) + '</span>' + pill(p.status, p.pct) + '</div>' +
            '<p class="item-note">' + note + '</p>' +
            (it.check ? '<div class="check"><b>Please check</b>' + esc(it.check) +
                '<span class="check-actions"><button type="button" onclick="stateTagApp.commands.resolveCheck(\'' + inv.id + '\',' + it.index + ',true)">Looks right</button>' +
                '<button type="button" class="ghost" onclick="stateTagApp.commands.resolveCheck(\'' + inv.id + '\',' + it.index + ',false)">Fix it</button></span></div>' : '') +
            '</div>';
    }

    function invoiceCard(inv) {
        if (inv.reading) {
            return '<article class="row reading"><div class="row-head"><span class="spinner"></span>' +
                '<span class="row-main"><b>Reading ' + plural(inv.pages, 'page') + '…</b><small>Finding the supplier, products and prices</small></span></div></article>';
        }
        const open = state.open.invoice === inv.id;
        const badge = inv.checks ? '<span class="badge check">Check ' + inv.checks + '</span>'
            : inv.overCount ? '<span class="badge over">Over ' + inv.overCount + ' · ' + money(inv.overAmount) + '</span>'
                : '<span class="badge ok">OK</span>';
        const summary = inv.overCount
            ? plural(inv.overCount, 'line') + ' above the members average, ' + money(inv.overAmount, true) + ' in total: ' + inv.items.filter(i => i.over > 0).map(i => i.p.name.toLowerCase()).join(', ') + '.'
            : 'Every line we can compare is at or below the members average.';
        return '<article class="row' + (open ? ' open' : '') + (inv.isNew ? ' new' : '') + '" data-id="invoice-' + inv.id + '">' +
            '<button type="button" class="row-head" aria-expanded="' + open + '" onclick="stateTagApp.commands.toggle(\'invoice\',\'' + inv.id + '\')">' +
            '<span class="inv-date">' + niceDate(inv.date) + '</span>' +
            '<span class="row-main"><b>' + esc(inv.supplier) + '</b><small>' + badge + '</small></span>' +
            '<span class="row-amt"><b>' + money(inv.total, true) + '</b></span>' +
            '</button>' +
            (open ? '<div class="row-body">' +
                '<div class="stats"><div><small>Invoice</small>' + esc(inv.number) + '</div><div><small>You paid</small><b>' + money(inv.total, true) + '</b></div>' +
                '<div><small>At members average</small>' + money(inv.atAvg, true) + '</div></div>' +
                '<p>' + summary + '</p>' +
                '<div class="seg"><button type="button" onclick="stateTagApp.commands.photo(\'' + inv.id + '\')">' + icon('image') + ' Photo</button>' +
                '<button type="button" class="' + (state.open.items ? 'on' : '') + '" onclick="stateTagApp.commands.toggleItems()">' + icon('list') + ' ' + plural(inv.items.length, 'line') + '</button></div>' +
                (state.open.items ? '<div class="items">' + inv.items.map(it => itemRow(inv, it)).join('') + '</div>' : '') +
                '</div>' : '') +
            '</article>';
    }

    define('x-invoices', function () {
        this.hidden = state.view !== 'invoices';
        if (this.hidden) return '';
        return invoices().map(invoiceCard).join('') +
            '<p class="fine center">Photograph a statement or invoice with <b>Scan</b> to add it here.</p>';
    });

    // ---------------------------------------------------------------- suppliers

    define('x-suppliers', function () {
        this.hidden = state.view !== 'suppliers';
        if (this.hidden) return '';
        return suppliers().map(s => {
            const open = state.open.supplier === s.name;
            return '<article class="row' + (open ? ' open' : '') + '" data-id="supplier-' + esc(s.name) + '">' +
                '<button type="button" class="row-head" aria-expanded="' + open + '" onclick="stateTagApp.commands.toggle(\'supplier\',\'' + esc(s.name).replace(/&#39;/g, "\\'") + '\')">' +
                pill(s.status, s.pct) +
                '<span class="row-main"><b>' + esc(s.name) + '</b><small>' + plural(s.products.length, 'product') + ' · ' + money(s.spend) + ' a year</small></span>' +
                (s.saving ? '<span class="row-amt"><b>' + money(s.saving) + '</b><small>a year</small></span>' : '<span class="row-amt"></span>') +
                '</button>' +
                (open ? '<div class="row-body">' +
                    '<p>' + (s.status === 'over' ? 'Across what you buy here, you pay <b>' + pct1(s.pct) + ' more</b> than the members average.'
                        : s.status === 'under' ? 'Across what you buy here, you pay <b>' + pct1(s.pct) + ' less</b> than the members average.'
                            : s.status === 'inline' ? 'Across what you buy here, you’re in line with the members average.'
                                : 'Too few restaurants buy these products to compare yet.') + '</p>' +
                    '<div class="items">' + s.products.slice().sort((a, b) => b.saving - a.saving).map(p =>
                        '<div class="item"><div class="item-top" onclick="stateTagApp.commands.go(\'product\',\'' + p.id + '\')">' +
                        '<span class="item-name">' + esc(p.name) + '<small>' + per(p) + '</small></span>' +
                        '<span class="item-amt">' + (p.saving ? money(p.saving) + '/yr' : '') + '</span>' + pill(p.status, p.pct) + '</div></div>').join('') + '</div>' +
                    '</div>' : '') +
                '</article>';
        }).join('');
    });

    // ---------------------------------------------------------------- overlays

    const sheet = (title, body) => '<div class="backdrop" onclick="stateTagApp.commands.close()"></div>' +
        '<div class="sheet" role="dialog" aria-label="' + title + '"><div class="sheet-head"><h2>' + title + '</h2>' +
        '<button type="button" class="icon-btn" aria-label="Close" onclick="stateTagApp.commands.close()">' + icon('close') + '</button></div>' + body + '</div>';

    define('x-locations', function () {
        if (state.overlay !== 'locations') return '';
        return sheet('Locations', Object.keys(data.locations).map(id =>
                '<button type="button" class="pick' + (id === state.loc ? ' on' : '') + '" onclick="stateTagApp.commands.setLoc(\'' + id + '\')">' + icon('store') +
                '<span>' + esc(data.locations[id].name) + '</span>' + (id === state.loc ? icon('check') : '') + '</button>').join('') +
            '<button type="button" class="pick quiet" onclick="stateTagApp.commands.toast(\'Adding a location is not part of this mockup\')">' + icon('plus') + '<span>Add a location</span></button>');
    });

    define('x-team', function () {
        if (state.overlay !== 'team') return '';
        const g = data.peerGroup;
        return sheet('Team', '<p class="label">People at ' + esc(loc().name) + '</p>' +
            data.team.map(m => '<div class="person"><span class="avatar">' + esc(m.name.split(' ').map(w => w[0]).join('')) + '</span>' +
                '<span class="row-main"><b>' + esc(m.name) + (m.you ? ' (you)' : '') + '</b><small>' + esc(m.role) + (m.pending ? ' · invited' : '') + '</small></span></div>').join('') +
            '<button type="button" class="pick quiet" onclick="stateTagApp.commands.toast(\'Inviting people is not part of this mockup\')">' + icon('plus') + '<span>Invite someone</span></button>' +
            '<p class="label">Your comparison group</p>' +
            '<div class="advice">' + icon('lock') + '<b>' + g.restaurants + ' restaurants · ' + esc(g.region) + ' · ' + esc(g.segment) + '</b>' +
            'Nobody in the group sees your name, your suppliers or your invoices. A price is only compared when at least ' + data.minMembers + ' restaurants buy the product.</div>');
    });

    define('x-photo', function () {
        if (!state.photo) return '';
        const inv = invoices().find(i => i.id === state.photo);
        return '<div class="backdrop dark" onclick="stateTagApp.commands.photo(null)"></div>' +
            '<div class="paper" onclick="stateTagApp.commands.photo(null)"><b>' + esc(inv.supplier.toUpperCase()) + '</b><span>' + esc(inv.number) + ' · ' + esc(inv.date) + '</span><hr>' +
            inv.items.map(it => '<span class="paper-line"><i>' + esc(it.printed) + '</i><i>' + it.line.toFixed(2) + '</i></span>').join('') +
            '<hr><span class="paper-line"><b>TOTAL</b><b>' + inv.total.toFixed(2) + '</b></span>' +
            '<em>Stand-in for the photographed page</em></div>';
    });

    define('x-camera', function () {
        if (state.overlay !== 'camera') return '';
        const n = state.pages;
        return '<div class="camera">' +
            '<div class="cam-top"><button type="button" class="icon-btn light" aria-label="Close camera" onclick="stateTagApp.commands.close()">' + icon('close') + '</button>' +
            '<span>' + (n ? plural(n, 'page') + ' captured' : 'Fit the whole page in the frame') + '</span></div>' +
            '<div class="viewfinder"><div class="frame' + (n ? ' flash' : '') + '"><div class="paper mini"><b>INVOICE</b><hr>' + '<span class="paper-line"><i></i><i></i></span>'.repeat(6) + '</div></div></div>' +
            '<div class="cam-bottom">' +
            '<span class="thumbs">' + (n ? '<i></i>'.repeat(Math.min(n, 3)) + '<b>' + n + '</b>' : '') + '</span>' +
            '<button type="button" class="shutter" aria-label="Capture page" onclick="stateTagApp.commands.shoot()"></button>' +
            '<button type="button" class="done" ' + (n ? '' : 'disabled') + ' onclick="stateTagApp.commands.doneCamera()">Done</button>' +
            '</div></div>';
    });

    // Search keeps its input mounted and only re-renders the results, so typing never loses focus.
    customElements.define('x-search', class extends Tag {
        render() {
            if (state.overlay !== 'search') {
                this.innerHTML = '';
                return;
            }
            if (!this.querySelector('input')) {
                this.innerHTML = '<div class="search"><div class="search-bar">' + icon('search') +
                    '<input type="search" placeholder="Product, supplier or invoice" aria-label="Search" autocomplete="off">' +
                    '<button type="button" class="icon-btn" aria-label="Search by voice" onclick="stateTagApp.commands.toast(\'Voice search is not part of this mockup\')">' + icon('mic') + '</button>' +
                    '<button type="button" class="icon-btn" aria-label="Close search" onclick="stateTagApp.commands.close()">' + icon('close') + '</button></div>' +
                    '<div class="results"></div></div>';
                const input = this.querySelector('input');
                input.value = state.query;
                input.addEventListener('input', () => {
                    state.query = input.value;
                    this.results();
                });
                input.focus();
            }
            this.results();
        }

        results() {
            const q = state.query.trim().toLowerCase();
            const hit = (...parts) => !q || parts.join(' ').toLowerCase().includes(q);
            const ps = products().filter(p => hit(p.name, p.supplier, p.printed.join(' ')));
            const ss = suppliers().filter(s => hit(s.name));
            const is = invoices().filter(i => !i.reading && hit(i.supplier, i.number, i.items.map(x => x.printed).join(' ')));
            const row = (kind, id, main, sub, right) => '<button type="button" class="pick" onclick="stateTagApp.commands.go(\'' + kind + '\',\'' + id + '\')">' +
                '<span class="row-main"><b>' + main + '</b><small>' + sub + '</small></span>' + right + '</button>';
            const section = (title, rows) => rows.length ? '<h2 class="group">' + title + ' <small>' + rows.length + '</small></h2>' + rows.join('') : '';
            const html = section('Products', ps.map(p => row('product', p.id, esc(p.name), per(p) + ' · ' + esc(p.supplier), pill(p.status, p.pct)))) +
                section('Suppliers', ss.map(s => row('supplier', esc(s.name).replace(/&#39;/g, "\\'"), esc(s.name), plural(s.products.length, 'product'), pill(s.status, s.pct)))) +
                section('Invoices', is.map(i => row('invoice', i.id, esc(i.supplier), niceDate(i.date) + ' · ' + esc(i.number), '<span class="row-amt"><b>' + money(i.total, true) + '</b></span>')));
            this.querySelector('.results').innerHTML = html || '<p class="fine center">Nothing matches “' + esc(state.query) + '”.</p>';
        }
    });

    define('x-toast', function () {
        return state.toast ? '<div class="toast" role="status">' + esc(state.toast) + '</div>' : '';
    });

    // ---------------------------------------------------------------- commands

    let toastTimer = null, captureCount = 0;

    const commands = {
        open(name) {
            state.menu = false;
            state.query = '';
            $write('overlay', name);
        },
        close() { $write('overlay', null); },
        toggleMenu(event) {
            event.stopPropagation();
            $write('menu', !state.menu);
        },
        menu(label) {
            state.menu = false;
            commands.toast(label + ' is not part of this mockup');
        },
        toast(message) {
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => $write('toast', null), 2600);
            $write('toast', message);
        },
        setView(view) {
            $write('view', view);
            document.getElementById('linear-space').scrollTop = 0;
        },
        setMonth(i) { $write('month', state.month === i ? null : i); },
        setLoc(id) {
            state.open = {product: null, invoice: null, items: false, supplier: null};
            state.month = null;
            state.overlay = null;
            $write('loc', id);
            document.getElementById('linear-space').scrollTop = 0;
        },
        toggle(kind, id) {
            if (kind === 'invoice') state.open.items = false;
            $write('open.' + kind, state.open[kind] === id ? null : id);
        },
        toggleItems() { $write('open.items', !state.open.items); },
        go(kind, id) {
            state.overlay = null;
            state.view = kind + 's';
            if (kind === 'invoice') state.open.items = true;
            $write('open.' + kind, id);
            const el = document.querySelector('[data-id="' + kind + '-' + CSS.escape(id) + '"]');
            if (el) el.scrollIntoView({block: 'start', behavior: 'smooth'});
        },
        photo(id) { $write('photo', id); },
        openCamera() {
            state.menu = false;
            state.pages = 0;
            $write('overlay', 'camera');
        },
        shoot() { $write('pages', state.pages + 1); },
        doneCamera() {
            const where = state.loc;
            const source = data.locations[where].incoming;
            const inv = Object.assign({}, source, {
                id: source.id + '-' + (++captureCount),
                pages: state.pages,
                reading: true,
                isNew: true,
                items: source.items.map(i => Object.assign({}, i))
            });
            state.captured[where].unshift(inv);
            state.overlay = null;
            state.view = 'invoices';
            state.open.invoice = null;
            changed();
            document.getElementById('linear-space').scrollTop = 0;
            setTimeout(() => {
                inv.reading = false;
                if (state.loc === where && state.view === 'invoices') {
                    state.open.invoice = inv.id;
                    state.open.items = true;
                }
                changed();
            }, 2200);
        },
        resolveCheck(invoiceId, index, confirmed) {
            const inv = state.captured[state.loc].find(i => i.id === invoiceId);
            inv.items[index].check = null;
            commands.toast(confirmed ? 'Thanks, confirmed' : 'Editing a line is not part of this mockup');
        }
    };

    document.addEventListener('click', e => {
        if (state.menu && !e.target.closest('x-profile-menu')) $write('menu', false);
    });

    window.stateTagApp = {$read, $write, commands};
})();
