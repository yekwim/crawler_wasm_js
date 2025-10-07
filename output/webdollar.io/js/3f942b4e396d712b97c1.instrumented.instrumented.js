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
    [26],
    {
        5026: function (e, s, l) {
            l.d(s, {
                Z: function () {
                    return c;
                }
            });
            var o = l(499), a = l.n(o), t = {
                    name: 'CollapseFaq',
                    extends: a(),
                    methods: {
                        toggle: function () {
                            a().methods.toggle.call(this);
                            var e = this.$vnode.data.ref;
                            void 0 !== e && this.$router.replace('/faq/' + e);
                        }
                    }
                }, r = l(1900), n = (0, r.Z)(t, undefined, undefined, !1, null, null, null).exports, d = l(3081), i = {
                    name: 'YourComponent',
                    components: { CollapseFaq: n },
                    mounted: function () {
                        var e = this.$route.params.qHash;
                        if (void 0 !== e && this.$refs.hasOwnProperty(e)) {
                            var s = this.$refs[e];
                            s.toggle(), d.scrollTo(s.$el);
                        }
                    }
                }, c = (0, r.Z)(i, function () {
                    var e = this, s = e.$createElement, l = e._self._c || s;
                    return l('div', { attrs: { id: 'faqSection' } }, [
                        l('span', { staticClass: 'alignCenter bigMarginTop pageTitle' }, [e._v(e._s(e.$i18n.t('heroes.faq.cryptocurrencyExplained')))]),
                        e._v(' '),
                        l('div', { staticClass: 'faqContainer sectionCenteredWidth' }, [
                            l('div', { staticClass: 'faqSection' }, [
                                l('collapse-faq', {
                                    ref: 'WhatIsWebDollar',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatIsWebdollar')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatIsWebdollarAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'WhatsItLikeUsingWebDollar',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatItsLikeUsingWebd')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatItsLikeUsingWebdAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'WhatsValueOfWebDollarInFiatCurrency',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatsValueOfWebDollarInFiatCurrency')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatsValueOfWebDollarInFiatCurrencyAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'WhatAreRisksOfMiningWebDollarInBrowser',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatAreRisksOfMiningWebDollarInBrowser')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatAreRisksOfMiningWebDollarInBrowserAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'HowIsWebDollarDifferent',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.howIsWebDollarDifferent')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.howIsWebDollarDifferentAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'WhereAreTheWalletsStored',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whereAreTheWalletsStored')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whereAreTheWalletsStoredAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'SupportSmartContracts',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.supportSmartContracts')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.supportSmartContractsAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'MyBalanceSwitchedToZero',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.myBalanceSwitchedToZero')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.myBalanceSwitchedToZeroAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'WhatIsPotentialBalance',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatIsPotentialBalance')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatIsPotentialBalanceAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'PoolMiningLinkChangeForTerminalMiners',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.poolMiningLinkChangeForTerminalMiners')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.poolMiningLinkChangeForTerminalMinersAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'WhatIsPoW',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatIsPoW')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatIsPoWAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'HowWillPoSWorkOnConsensus',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.howWillPoSWorkOnConsensus')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.howWillPoSWorkOnConsensusAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'MineInPoSFromScratchOrBuyInOrderToStake',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.mineInPoSFromScratchOrBuyInOrderToStake')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.mineInPoSFromScratchOrBuyInOrderToStakeAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'IsWebDollarAToken',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.isWebDollarAToken')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.isWebDollarATokenAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'CompatibleBrowsers',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.compatibleBrowsers')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.compatibleBrowsersAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'DoesItWorkOnIphoneIos',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.doesItWorkOnIphoneIos')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.doesItWorkOnIphoneIosAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'HowDoIBackupWebdWallet',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.howDoIBackupWebdWallet')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        domProps: { innerHTML: e._s(e.$i18n.t('heroes.faq.howDoIBackupWebdWalletAnswer')) },
                                        slot: 'collapse-body'
                                    })
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'HowCanIUseTGTipBot',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.howCanIUseTGTipBot')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        domProps: { innerHTML: e._s(e.$i18n.t('heroes.faq.howCanIUseTGTipBotAnswer')) },
                                        slot: 'collapse-body'
                                    })
                                ])
                            ], 1),
                            e._v(' '),
                            l('div', { staticClass: 'faqSection' }, [
                                l('collapse-faq', {
                                    ref: 'HowAreWEBDsCreated',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.howAreWEBDsCreated')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.howAreWEBDsCreatedAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'WhatCanIDoWithWebDollars',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatCanIDoWithWebDollars')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatCanIDoWithWebDollarsAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'HowCanIGetWebDollars',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.howCanIGetWebDollars')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        domProps: { innerHTML: e._s(e.$i18n.t('heroes.faq.howCanIGetWebDollarsAnswer')) },
                                        slot: 'collapse-body'
                                    })
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'HowMuchWebdEarnIn24HoursMining',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.howMuchWebdEarnIn24HoursMining')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.howMuchWebdEarnIn24HoursMiningAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'HowAreWalletsSecured',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.howAreWalletsSecured')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.howAreWalletsSecuredAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'UseOtherWallets',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.useOtherWallets')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.useOtherWalletsAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'ImportWalletBrowser',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.importWalletBrowser')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.importWalletBrowserAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'WhatIsAvailableBalance',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatIsAvailableBalance')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatIsAvailableBalanceAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'PotentialBalanceUpAndDown',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.potentialBalanceUpAndDown')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.potentialBalanceUpAndDownAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'WhatIsPoS',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatIsPoS')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whatIsPoSAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'WhenMiningInPoSKeepAllOfStakeInOneWallet',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whenMiningInPoSKeepAllOfStakeInOneWallet')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whenMiningInPoSKeepAllOfStakeInOneWalletAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'StakingMyCoinsWithPOSRequiresCertainTypeOfDevice',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.stakingMyCoinsWithPOSRequiresCertainTypeOfDevice')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.stakingMyCoinsWithPOSRequiresCertainTypeOfDeviceAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'HelpTheProjectWhomDoIContact',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.helpTheProjectWhomDoIContact')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.helpTheProjectWhomDoIContactAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'ImplementWEBDAsAPaymentOption',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.implementWEBDAsAPaymentOption')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        domProps: { innerHTML: e._s(e.$i18n.t('heroes.faq.implementWEBDAsAPaymentOptionAnswer')) },
                                        slot: 'collapse-body'
                                    })
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'DoesItWorkOnAndroidPhones',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.doesItWorkOnAndroidPhones')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.doesItWorkOnAndroidPhonesAnswer')) + '\n                ')])
                                ]),
                                e._v(' '),
                                l('collapse-faq', {
                                    ref: 'WhereCanISeeTheSourceCode',
                                    attrs: { selected: !1 }
                                }, [
                                    l('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [e._v('\n                    ' + e._s(e.$i18n.t('heroes.faq.whereCanISeeTheSourceCode')) + '\n                ')]),
                                    e._v(' '),
                                    l('div', {
                                        attrs: { slot: 'collapse-body' },
                                        domProps: { innerHTML: e._s(e.$i18n.t('heroes.faq.whereCanISeeTheSourceCodeAnswer')) },
                                        slot: 'collapse-body'
                                    })
                                ])
                            ], 1)
                        ]),
                        e._v(' '),
                        l('Center', [l('h2', {
                                staticStyle: {
                                    'margin-top': '40px',
                                    'letter-spacing': '1px'
                                },
                                domProps: { innerHTML: e._s(e.$i18n.t('heroes.faq.stillHaveQuestionsTelegram')) }
                            })])
                    ], 1);
                }, [], !1, null, null, null).exports;
        }
    }
]);