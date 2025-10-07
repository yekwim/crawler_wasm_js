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
'use strict';
(self.webpackChunk_webdollar_front_webdollar = self.webpackChunk_webdollar_front_webdollar || []).push([
    [649],
    {
        259: function (e, o, t) {
            t.r(o), t.d(o, {
                default: function () {
                    return l;
                }
            });
            var a = {
                    name: 'transactions-page',
                    components: { layout: t(3407).Z },
                    methods: {
                        clearIndexedDB: function () {
                            window.indexedDB.deleteDatabase('_pouch_validateDB'), window.indexedDB.deleteDatabase('_pouch_defaultDB'), window.indexedDB.deleteDatabase('_pouch_walletDB'), window.indexedDB.deleteDatabase('_pouch_blockchainDB3'), window.indexedDB.deleteDatabase('_pouch_blockchainDB2'), window.indexedDB.deleteDatabase('_pouch_blockchainDB'), window.localStorage.removeItem('_pouch_check_localstorage'), window.localStorage.removeItem('_pouch_validateDB'), window.localStorage.removeItem('_pouch_defaultDB'), window.localStorage.removeItem('_pouch_blockchainDB3'), window.localStorage.removeItem('_pouch_blockchainDB2'), window.localStorage.removeItem('_pouch_validateDB'), window.localStorage.removeItem('_pouch_walletDB'), alert('The indexedDB was cleared!'), this.getAllIndexedDBs();
                        },
                        getAllIndexedDBs: function () {
                            window.indexedDB.databases().onsuccess = function (e, o) {
                                var t = e.target.result;
                                for (var a in t)
                                    indexedDB.deleteDatabase(t[a]);
                            };
                        }
                    }
                }, l = (0, t(1900).Z)(a, function () {
                    var e = this, o = e.$createElement, t = e._self._c || o;
                    return t('layout', [t('div', {
                            attrs: { slot: 'content' },
                            slot: 'content'
                        }, [t('div', {
                                staticStyle: {
                                    'margin-top': '200px',
                                    'margin-left': '100px',
                                    'margin-bottom': '900px'
                                }
                            }, [t('button', {
                                    staticStyle: {
                                        'background-color': 'yellow',
                                        height: '100px'
                                    },
                                    on: { click: e.clearIndexedDB }
                                }, [e._v('Clear IndexedDB')])])])]);
                }, [], !1, null, null, null).exports;
        }
    }
]);