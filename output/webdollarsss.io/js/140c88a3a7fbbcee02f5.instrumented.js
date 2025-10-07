window.__instrumentation__ = {
    capturedCalls: [],
    performanceMetrics: new Map(),
    capture: function (type, callId, timestamp) {
        this.capturedCalls.push({
            type: type,
            id: callId,
            timestamp: timestamp,
            performanceTime: performance.now()
        });
        if (!this.performanceMetrics.has(type)) {
            this.performanceMetrics.set(type, []);
        }
        this.performanceMetrics.get(type).push(performance.now());
        console.log(`[INSTRUMENTATION] ${ type } call captured: ${ callId }`);
    },
    getMetrics: function () {
        const metrics = {};
        for (const [type, times] of this.performanceMetrics) {
            metrics[type] = {
                count: times.length,
                avgTime: times.reduce((a, b) => a + b, 0) / times.length,
                minTime: Math.min(...times),
                maxTime: Math.max(...times)
            };
        }
        return metrics;
    },
    getCapturedCalls: function () {
        return this.capturedCalls;
    }
};
(self.webpackChunk_webdollar_front_webdollar = self.webpackChunk_webdollar_front_webdollar || []).push([
    [592],
    {
        499: function (e, t, n) {
            const o = n(590);
            e.exports = o;
        },
        590: function (e, t, n) {
            'use strict';
            n.r(t), n.d(t, {
                default: function () {
                    return a;
                }
            });
            var o = {
                    name: 'Collapse',
                    data: () => ({ active: !1 }),
                    props: {
                        selected: {
                            type: Boolean,
                            required: !0,
                            default: !1
                        }
                    },
                    created() {
                        this._isCollapseItem = !0, this.active = this.selected;
                    },
                    ready() {
                        this.active && this.$emit('collapse-open', this.index);
                    },
                    methods: {
                        toggle() {
                            this.active = !this.active, this.active && this.$emit('collapse-open', this.index);
                        }
                    }
                }, r = (0, n(1900).Z)(o, function () {
                    var e = this, t = e.$createElement, n = e._self._c || t;
                    return n('div', {
                        staticClass: 'collapse collapse-item',
                        class: { 'is-active': e.active }
                    }, [
                        n('div', {
                            staticClass: 'collapse-header touchable',
                            attrs: {
                                role: 'tab',
                                'aria-expanded': e.active ? 'true' : 'fase'
                            },
                            on: {
                                click: function (t) {
                                    return t.preventDefault(), e.toggle.apply(null, arguments);
                                }
                            }
                        }, [e._t('collapse-header')], 2),
                        e._v(' '),
                        n('transition', { attrs: { name: 'fade' } }, [e.active ? n('div', { staticClass: 'collapse-content' }, [n('div', { staticClass: 'collapse-content-box' }, [e._t('collapse-body')], 2)]) : e._e()])
                    ], 1);
                }, [], !1, null, null, null), a = r.exports;
        },
        3399: function (e, t, n) {
            'use strict';
            n.r(t), n.d(t, {
                default: function () {
                    return i;
                }
            });
            var o = n(6680), r = n(5026), a = {
                    name: 'faq-page',
                    components: {
                        layout: o.Z,
                        'faq-hero': r.Z
                    }
                }, i = (0, n(1900).Z)(a, function () {
                    var e = this.$createElement, t = this._self._c || e;
                    return t('layout', [t('div', {
                            attrs: { slot: 'content' },
                            slot: 'content'
                        }, [t('faq-hero')], 1)]);
                }, [], !1, null, null, null).exports;
        },
        3081: function (e) {
            e.exports = function () {
                'use strict';
                function e(t) {
                    return e = 'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator ? function (e) {
                        return typeof e;
                    } : function (e) {
                        return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? 'symbol' : typeof e;
                    }, e(t);
                }
                function t() {
                    return t = Object.assign || function (e) {
                        for (var t = 1; t < arguments.length; t++) {
                            var n = arguments[t];
                            for (var o in n)
                                Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o]);
                        }
                        return e;
                    }, t.apply(this, arguments);
                }
                var n = 4, o = 0.001, r = 1e-7, a = 10, i = 11, l = 1 / (i - 1), u = 'function' == typeof Float32Array;
                function c(e, t) {
                    return 1 - 3 * t + 3 * e;
                }
                function s(e, t) {
                    return 3 * t - 6 * e;
                }
                function f(e) {
                    return 3 * e;
                }
                function d(e, t, n) {
                    return ((c(t, n) * e + s(t, n)) * e + f(t)) * e;
                }
                function p(e, t, n) {
                    return 3 * c(t, n) * e * e + 2 * s(t, n) * e + f(t);
                }
                function v(e, t, n, o, i) {
                    var l, u, c = 0;
                    do {
                        (l = d(u = t + (n - t) / 2, o, i) - e) > 0 ? n = u : t = u;
                    } while (Math.abs(l) > r && ++c < a);
                    return u;
                }
                function y(e, t, o, r) {
                    for (var a = 0; a < n; ++a) {
                        var i = p(t, o, r);
                        if (0 === i)
                            return t;
                        t -= (d(t, o, r) - e) / i;
                    }
                    return t;
                }
                function m(e) {
                    return e;
                }
                var h = function (e, t, n, r) {
                        if (!(0 <= e && e <= 1 && 0 <= n && n <= 1))
                            throw new Error('bezier x values must be in [0, 1] range');
                        if (e === t && n === r)
                            return m;
                        for (var a = u ? new Float32Array(i) : new Array(i), c = 0; c < i; ++c)
                            a[c] = d(c * l, e, n);
                        function s(t) {
                            for (var r = 0, u = 1, c = i - 1; u !== c && a[u] <= t; ++u)
                                r += l;
                            --u;
                            var s = r + (t - a[u]) / (a[u + 1] - a[u]) * l, f = p(s, e, n);
                            return f >= o ? y(t, s, e, n) : 0 === f ? s : v(t, r, r + l, e, n);
                        }
                        return function (e) {
                            return 0 === e ? 0 : 1 === e ? 1 : d(s(e), t, r);
                        };
                    }, b = {
                        ease: [
                            0.25,
                            0.1,
                            0.25,
                            1
                        ],
                        linear: [
                            0,
                            0,
                            1,
                            1
                        ],
                        'ease-in': [
                            0.42,
                            0,
                            1,
                            1
                        ],
                        'ease-out': [
                            0,
                            0,
                            0.58,
                            1
                        ],
                        'ease-in-out': [
                            0.42,
                            0,
                            0.58,
                            1
                        ]
                    }, w = !1;
                try {
                    var g = Object.defineProperty({}, 'passive', {
                        get: function () {
                            w = !0;
                        }
                    });
                    window.addEventListener('test', null, g);
                } catch (e) {
                }
                var C = {
                        $: function (e) {
                            return 'string' != typeof e ? e : document.querySelector(e);
                        },
                        on: function (e, t, n) {
                            var o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : { passive: !1 };
                            t instanceof Array || (t = [t]);
                            for (var r = 0; r < t.length; r++)
                                e.addEventListener(t[r], n, !!w && o);
                        },
                        off: function (e, t, n) {
                            t instanceof Array || (t = [t]);
                            for (var o = 0; o < t.length; o++)
                                e.removeEventListener(t[o], n);
                        },
                        cumulativeOffset: function (e) {
                            var t = 0, n = 0;
                            do {
                                t += e.offsetTop || 0, n += e.offsetLeft || 0, e = e.offsetParent;
                            } while (e);
                            return {
                                top: t,
                                left: n
                            };
                        }
                    }, _ = [
                        'mousedown',
                        'wheel',
                        'DOMMouseScroll',
                        'mousewheel',
                        'keyup',
                        'touchmove'
                    ], x = {
                        container: 'body',
                        duration: 500,
                        lazy: !0,
                        easing: 'ease',
                        offset: 0,
                        force: !0,
                        cancelable: !0,
                        onStart: !1,
                        onDone: !1,
                        onCancel: !1,
                        x: !1,
                        y: !0
                    };
                function O(e) {
                    x = t({}, x, e);
                }
                var S = function () {
                        var t, n, o, r, a, i, l, u, c, s, f, d, p, v, y, m, w, g, O, S, L, T, E, P, k, $, q, A = function (e) {
                                u && (E = e, S = !0);
                            };
                        function D(e) {
                            var t = e.scrollTop;
                            return 'body' === e.tagName.toLowerCase() && (t = t || document.documentElement.scrollTop), t;
                        }
                        function V(e) {
                            var t = e.scrollLeft;
                            return 'body' === e.tagName.toLowerCase() && (t = t || document.documentElement.scrollLeft), t;
                        }
                        function z() {
                            L = C.cumulativeOffset(n), T = C.cumulativeOffset(t), d && (y = T.left - L.left + i, g = y - v), p && (w = T.top - L.top + i, O = w - m);
                        }
                        function M(e) {
                            if (S)
                                return j();
                            k || (k = e), a || z(), $ = e - k, q = Math.min($ / o, 1), q = P(q), F(n, m + O * q, v + g * q), $ < o ? window.requestAnimationFrame(M) : j();
                        }
                        function j() {
                            S || F(n, w, y), k = !1, C.off(n, _, A), S && f && f(E, t), !S && s && s(t);
                        }
                        function F(e, t, n) {
                            p && (e.scrollTop = t), d && (e.scrollLeft = n), 'body' === e.tagName.toLowerCase() && (p && (document.documentElement.scrollTop = t), d && (document.documentElement.scrollLeft = n));
                        }
                        function H(y, L) {
                            var T = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
                            if ('object' === e(L) ? T = L : 'number' == typeof L && (T.duration = L), !(t = C.$(y)))
                                return console.warn('[vue-scrollto warn]: Trying to scroll to an element that is not on the page: ' + y);
                            if (n = C.$(T.container || x.container), o = T.hasOwnProperty('duration') ? T.duration : x.duration, a = T.hasOwnProperty('lazy') ? T.lazy : x.lazy, r = T.easing || x.easing, i = T.hasOwnProperty('offset') ? T.offset : x.offset, l = T.hasOwnProperty('force') ? !1 !== T.force : x.force, u = T.hasOwnProperty('cancelable') ? !1 !== T.cancelable : x.cancelable, c = T.onStart || x.onStart, s = T.onDone || x.onDone, f = T.onCancel || x.onCancel, d = void 0 === T.x ? x.x : T.x, p = void 0 === T.y ? x.y : T.y, 'function' == typeof i && (i = i(t, n)), v = V(n), m = D(n), z(), S = !1, !l) {
                                var k = 'body' === n.tagName.toLowerCase() ? document.documentElement.clientHeight || window.innerHeight : n.offsetHeight, $ = m, q = $ + k, j = w - i, F = j + t.offsetHeight;
                                if (j >= $ && F <= q)
                                    return void (s && s(t));
                            }
                            if (c && c(t), O || g)
                                return 'string' == typeof r && (r = b[r] || b.ease), P = h.apply(h, r), C.on(n, _, A, { passive: !0 }), window.requestAnimationFrame(M), function () {
                                    E = null, S = !0;
                                };
                            s && s(t);
                        }
                        return H;
                    }, L = S(), T = [];
                function E(e) {
                    for (var t = 0; t < T.length; ++t)
                        if (T[t].el === e)
                            return T.splice(t, 1), !0;
                    return !1;
                }
                function P(e) {
                    for (var t = 0; t < T.length; ++t)
                        if (T[t].el === e)
                            return T[t];
                }
                function k(e) {
                    var t = P(e);
                    return t || (T.push(t = {
                        el: e,
                        binding: {}
                    }), t);
                }
                function $(e) {
                    var t = k(this).binding;
                    if (t.value) {
                        if (e.preventDefault(), 'string' == typeof t.value)
                            return L(t.value);
                        L(t.value.el || t.value.element, t.value);
                    }
                }
                var q = {
                        bind: function (e, t) {
                            k(e).binding = t, C.on(e, 'click', $);
                        },
                        unbind: function (e) {
                            E(e), C.off(e, 'click', $);
                        },
                        update: function (e, t) {
                            k(e).binding = t;
                        }
                    }, A = {
                        bind: q.bind,
                        unbind: q.unbind,
                        update: q.update,
                        beforeMount: q.bind,
                        unmounted: q.unbind,
                        updated: q.update,
                        scrollTo: L,
                        bindings: T
                    }, D = function (e, t) {
                        t && O(t), e.directive('scroll-to', A), (e.config.globalProperties || e.prototype).$scrollTo = A.scrollTo;
                    };
                return 'undefined' != typeof window && window.Vue && (window.VueScrollTo = A, window.VueScrollTo.setDefaults = O, window.VueScrollTo.scroller = S, window.Vue.use && window.Vue.use(D)), A.install = D, A;
            }();
        }
    }
]);
__instrumentation__.capture('WebSocket', 'call_1759369824818_rx12tkd3i', 1759369824818);
__instrumentation__.capture('WebSocket', 'call_1759369824818_4274ur8nj', 1759369824818);
__instrumentation__.capture('WebSocket', 'call_1759369824818_r7fshsue8', 1759369824818);