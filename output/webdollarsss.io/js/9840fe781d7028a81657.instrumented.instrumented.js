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
    [883],
    {
        8883: function (t, a, s) {
            s.d(a, {
                Z: function () {
                    return p;
                }
            });
            var e = s(499), i = s.n(e), r = {
                    name: 'CollapsePartners',
                    extends: i(),
                    methods: {
                        toggle: function () {
                            i().methods.toggle.call(this);
                            var t = this.$vnode.data.ref;
                            void 0 !== t && this.$router.replace('/partners/' + t);
                        }
                    }
                }, l = s(1900), n = (0, l.Z)(r, undefined, undefined, !1, null, null, null).exports, o = s(3081), c = {
                    name: 'YourComponent',
                    components: { CollapseFaq: n },
                    mounted: function () {
                        var t = this.$route.params.qHash;
                        if (void 0 !== t && this.$refs.hasOwnProperty(t)) {
                            var a = this.$refs[t];
                            a.toggle(), o.scrollTo(a.$el);
                        }
                    }
                }, p = (0, l.Z)(c, function () {
                    var t = this, a = t.$createElement, s = t._self._c || a;
                    return s('div', { attrs: { id: 'faqSection' } }, [
                        s('span', { staticClass: 'alignCenter bigMarginTop pageTitle' }, [t._v(t._s(t.$i18n.t('heroes.partners.partners')))]),
                        t._v(' '),
                        s('div', { staticClass: 'partnerContainer sectionCenteredWidth' }, [s('div', { staticClass: 'faqSection' }, [
                                s('collapse-faq', {
                                    ref: 'exchanges',
                                    attrs: {
                                        selected: !1,
                                        id: 'exchanges'
                                    }
                                }, [
                                    s('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [t._v('\n          ' + t._s(t.$i18n.t('heroes.partners.exchanges')) + '\n        ')]),
                                    t._v(' '),
                                    s('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [
                                        s('div', { staticClass: 'partnerWrapper threeTeamColums' }, [
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://p2pb2b.io/trade/WEBD_ETH',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/P2PB2B.png',
                                                                alt: 'P2PB2B',
                                                                title: 'P2PB2B.io'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' }, [s('ul', { staticClass: 'partner-list' }, [
                                                            s('li', [s('a', {
                                                                    staticClass: 'fa fa-earth',
                                                                    attrs: {
                                                                        href: 'https://p2pb2b.io/trade/WEBD_ETH',
                                                                        rel: 'noopener',
                                                                        target: '_blank',
                                                                        'aria-label': 'website'
                                                                    }
                                                                })]),
                                                            t._v(' '),
                                                            s('li', [s('a', {
                                                                    staticClass: 'fa fa-twitter',
                                                                    attrs: {
                                                                        href: 'https://twitter.com/p2pb2b',
                                                                        rel: 'noopener',
                                                                        target: '_blank',
                                                                        'aria-label': 'twitter'
                                                                    }
                                                                })])
                                                        ])])
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('P2PB2B')]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamRole' }, [t._v(t._s(t.$i18n.t('heroes.partners.cryptoExchange')))]),
                                                t._v(' '),
                                                s('p', { staticClass: 'description' }, [t._v(t._s(t.$i18n.t('heroes.partners.p2pb2bDescription')))])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://webd.timi.ro/cart.php?gid=1',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/WebDollarCarbon.png',
                                                                alt: 'WebdTimi',
                                                                title: 'WebdTimi'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' }, [s('ul', { staticClass: 'partner-list' }, [
                                                            s('li', [s('a', {
                                                                    staticClass: 'fa fa-earth',
                                                                    attrs: {
                                                                        href: 'https://webd.timi.ro/cart.php?gid=1',
                                                                        rel: 'noopener',
                                                                        target: '_blank',
                                                                        'aria-label': 'website'
                                                                    }
                                                                })]),
                                                            t._v(' '),
                                                            s('li', [s('a', {
                                                                    staticClass: 'fa fa-twitter',
                                                                    attrs: {
                                                                        href: 'https://twitter.com/webdollar_io',
                                                                        rel: 'noopener',
                                                                        target: '_blank',
                                                                        'aria-label': 'twitter'
                                                                    }
                                                                })])
                                                        ])])
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('WebD Timi')]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamRole' }, [t._v(t._s(t.$i18n.t('heroes.partners.cryptoExchange')))]),
                                                t._v(' '),
                                                s('p', { staticClass: 'description' }, [t._v(t._s(t.$i18n.t('heroes.partners.webdTimiDescription')))])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://bitrabbit.com/markets/webd_eth',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/IndoEx.png',
                                                                alt: 'INDOEX',
                                                                title: 'IndoEx'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' }, [s('ul', { staticClass: 'partner-list' }, [
                                                            s('li', [s('a', {
                                                                    staticClass: 'fa fa-earth',
                                                                    attrs: {
                                                                        href: 'https://international.indoex.io/trade/WEBD_ETH',
                                                                        rel: 'noopener',
                                                                        target: '_blank',
                                                                        'aria-label': 'website'
                                                                    }
                                                                })]),
                                                            t._v(' '),
                                                            s('li', [s('a', {
                                                                    staticClass: 'fa fa-twitter',
                                                                    attrs: {
                                                                        href: 'https://twitter.com/Indoex_LTD',
                                                                        rel: 'noopener',
                                                                        target: '_blank',
                                                                        'aria-label': 'twitter'
                                                                    }
                                                                })])
                                                        ])])
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('IndoEx')]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamRole' }, [t._v(t._s(t.$i18n.t('heroes.partners.cryptoExchange')))]),
                                                t._v(' '),
                                                s('p', { staticClass: 'description' }, [t._v(t._s(t.$i18n.t('heroes.partners.indoexDescription')))])
                                            ])
                                        ]),
                                        t._v(' '),
                                        s('div', { staticClass: 'partnerWrapper threeTeamColums' }, [
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://vindax.com/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/VinDAX.jpeg',
                                                                alt: 'VinDAX',
                                                                title: 'VinDAX'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' }, [s('ul', { staticClass: 'partner-list' }, [
                                                            s('li', [s('a', {
                                                                    staticClass: 'fa fa-earth',
                                                                    attrs: {
                                                                        href: 'https://vindax.com/exchange-base.html?symbol=WEBD_ETH/',
                                                                        rel: 'noopener',
                                                                        target: '_blank',
                                                                        'aria-label': 'website'
                                                                    }
                                                                })]),
                                                            t._v(' '),
                                                            s('li', [s('a', {
                                                                    staticClass: 'fa fa-twitter',
                                                                    attrs: {
                                                                        href: 'https://twitter.com/BitMahavi',
                                                                        rel: 'noopener',
                                                                        target: '_blank',
                                                                        'aria-label': 'twitter'
                                                                    }
                                                                })])
                                                        ])])
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('VinDAX')]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamRole' }, [t._v(t._s(t.$i18n.t('heroes.partners.cryptoExchange')))]),
                                                t._v(' '),
                                                s('p', { staticClass: 'description' }, [t._v(t._s(t.$i18n.t('heroes.partners.vindaxDescription')))])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://bankcex.com/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/BankCEX.png',
                                                                alt: 'BankCEX',
                                                                title: 'BankCEX'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' }, [s('ul', { staticClass: 'partner-list' }, [
                                                            s('li', [s('a', {
                                                                    staticClass: 'fa fa-earth',
                                                                    attrs: {
                                                                        href: 'https://bankcex.com/exchange-base.html?symbol=WEBD_BTC',
                                                                        rel: 'noopener',
                                                                        target: '_blank',
                                                                        'aria-label': 'website'
                                                                    }
                                                                })]),
                                                            t._v(' '),
                                                            s('li', [s('a', {
                                                                    staticClass: 'fa fa-twitter',
                                                                    attrs: {
                                                                        href: 'https://twitter.com/BankCoin2018',
                                                                        rel: 'noopener',
                                                                        target: '_blank',
                                                                        'aria-label': 'twitter'
                                                                    }
                                                                })])
                                                        ])])
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('BankCEX')]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamRole' }, [t._v(t._s(t.$i18n.t('heroes.partners.cryptoExchange')))]),
                                                t._v(' '),
                                                s('p', { staticClass: 'description' }, [t._v(t._s(t.$i18n.t('heroes.partners.bankcexDescription')))])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://t.me/webdollar_tip_bot',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/Tipbot.png',
                                                                alt: 'WebDollarTipBot',
                                                                title: 'WebDollar Tip Bot'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' }, [s('ul', { staticClass: 'partner-list' }, [
                                                            s('li', [s('a', {
                                                                    staticClass: 'fa fa-earth',
                                                                    attrs: {
                                                                        href: 'https://pay.hostero.eu/tipbot',
                                                                        rel: 'noopener',
                                                                        target: '_blank',
                                                                        'aria-label': 'website'
                                                                    }
                                                                })]),
                                                            t._v(' '),
                                                            s('li', [s('a', {
                                                                    staticClass: 'fa fa-twitter',
                                                                    attrs: {
                                                                        href: 'https://twitter.com/hosteroeu',
                                                                        rel: 'noopener',
                                                                        target: '_blank',
                                                                        'aria-label': 'twitter'
                                                                    }
                                                                })])
                                                        ])])
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('WebDollar Tip Bot')]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamRole' }, [t._v(t._s(t.$i18n.t('heroes.partners.telegramBotForMakingTips')))]),
                                                t._v(' '),
                                                s('p', { staticClass: 'description' }, [t._v(t._s(t.$i18n.t('heroes.partners.webdollarTipBotDescription')))])
                                            ])
                                        ])
                                    ])
                                ]),
                                t._v(' '),
                                s('collapse-faq', {
                                    ref: 'trackers',
                                    attrs: {
                                        selected: !1,
                                        id: 'trackers'
                                    }
                                }, [
                                    s('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [t._v('\n          ' + t._s(t.$i18n.t('heroes.partners.trackers')) + '\n        ')]),
                                    t._v(' '),
                                    s('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [
                                        s('div', { staticClass: 'partnerWrapper fourTeamColums' }, [
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://coinmarketcap.com/currencies/webdollar/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/CoinMarketCap.png',
                                                                alt: 'CoinMarketCap',
                                                                title: 'CoinMarketCap'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('CoinMarketCap')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://www.coingecko.com/en/coins/webdollar?utm_content=webdollar&utm_medium=search_coin&utm_source=coingecko',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/CoinGecko.png',
                                                                alt: 'CoinGecko',
                                                                title: 'CoinGecko'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('CoinGecko')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://play.google.com/store/apps/details?id=com.blockfolio.blockfolio&hl=en_US',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/BlockFolio.png',
                                                                alt: 'Blockfolio',
                                                                title: 'Blockfolio'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('Blockfolio')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://play.google.com/store/apps/details?id=io.getdelta.android',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/Delta.png',
                                                                alt: 'Delta',
                                                                title: 'Delta'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('Delta')])
                                            ])
                                        ]),
                                        t._v(' '),
                                        s('div', { staticClass: 'partnerWrapper fourTeamColums' }, [
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://coinpaprika.com/coin/webd-webdollar/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/CoinPaprika.png',
                                                                alt: 'CoinPaprika',
                                                                title: 'CoinPaprika'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('CoinPaprika')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://digitalcoinprice.com/coins/webdollar',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/DigitalCoinPrice.png',
                                                                alt: 'Digitalcoin',
                                                                title: 'Digitalcoin'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('DigitalCoin')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://coincheckup.com/coins/webdollar/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/CoinCheckUp.png',
                                                                alt: 'Coin Check Up',
                                                                title: 'Coin Check Up'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('Coin Check Up')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://walletinvestor.com/forecast/webdollar-prediction',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/WalletInvestor.png',
                                                                alt: 'Wallet Investor',
                                                                title: 'Wallet Investor'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('Wallet Investor')])
                                            ])
                                        ]),
                                        t._v(' '),
                                        s('div', { staticClass: 'partnerWrapper fourTeamColums' }, [
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://coinmarketcal.com/en/coin/webdollar',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/CoinMarketCal.png',
                                                                alt: 'CoinMarketCal',
                                                                title: 'CoinMarketCal'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('CoinMarketCal')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://coinranking.com/coin/webdollar-webd',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/CoinRanking.png',
                                                                alt: 'Coinranking',
                                                                title: 'Coinranking'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('Coinranking')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://www.livecoinwatch.com/price/WebDollar-WEBD',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/LiveCoinWatch.png',
                                                                alt: 'LiveCoinWatch',
                                                                title: 'LiveCoinWatch'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('Livecoinwatch')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://coincodex.com/crypto/webdollar/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/CoinCodex.png',
                                                                alt: 'Coincodex',
                                                                title: 'CoinCodex'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('Coincodex')])
                                            ])
                                        ]),
                                        t._v(' '),
                                        s('div', { staticClass: 'partnerWrapper fourTeamColums' }, [
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://neironix.io/cryptocurrency/webd',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/Neironix.png',
                                                                alt: 'Neironix',
                                                                title: 'Neironix'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('Neironix')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://coingolive.com/en/coins/webdollar/usd/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/CoinGoLive.png',
                                                                alt: 'CoinGoLive',
                                                                title: 'CoinGoLive'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('Coingolive')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://cointobuy.io/webdollar',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/CoinToBuy.png',
                                                                alt: 'CoinToBuy',
                                                                title: 'CoinToBuy'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('CoinToBuy')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://coinutil.net/currencies/webdollar?hl=en',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/CoinUtil.png',
                                                                alt: 'CoinUtil',
                                                                title: 'CoinUtil'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('CoinUtil')])
                                            ])
                                        ]),
                                        t._v(' '),
                                        s('div', { staticClass: 'partnerWrapper fourTeamColums' }, [
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://pricemycoin.com/currencies/WEBD',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/PriceMyCoin.png',
                                                                alt: 'PriceMyCoin',
                                                                title: 'PriceMyCoin'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('PriceMyCoin')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://bitscreener.com/coins/webdollar',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/BitScreener.png',
                                                                alt: 'BitScreener',
                                                                title: 'BitScreener'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('BitScreener')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://cmc.io/coins/webdollar',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/CMC.io.png',
                                                                alt: 'CMC.io',
                                                                title: 'CMC.io'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('CMC.io')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://cryptocoinworld.io/webdollar-price/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/CryptoCoinWorld.png',
                                                                alt: 'CryptoCoinWorld',
                                                                title: 'CryptoCoinWorld'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('CryptoCoinWorld')])
                                            ])
                                        ]),
                                        t._v(' '),
                                        s('div', { staticClass: 'partnerWrapper fourTeamColums' }, [
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://coinexpressway.com/Coin/webdollar',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/CoinExpressWay.png',
                                                                alt: 'CoinExpressWay',
                                                                title: 'CoinExpressWay'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('CoinExpressWay')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://coinkurs.com/webdollar-kurs-dollar.html',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/CoinKurs.png',
                                                                alt: 'CoinKurs',
                                                                title: 'CoinKurs'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('CoinKurs')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://www.marketbeat.com/cryptocurrencies/webdollar/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/MarketBeat.png',
                                                                alt: 'MarketBeat',
                                                                title: 'MarketBeat'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('MarketBeat')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://wallmine.com/crypto/webd/charts',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/WallMine.png',
                                                                alt: 'WallMine',
                                                                title: 'WallMine'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('WallMine')])
                                            ])
                                        ]),
                                        t._v(' '),
                                        s('div', { staticClass: 'partnerWrapper fourTeamColums' }, [
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://www.coinmarkets.net/currencies/webdollar/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/CoinMarkets.png',
                                                                alt: 'CoinMarkets',
                                                                title: 'CoinMarkets'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('CoinMarkets')])
                                            ]),
                                            t._v(' '),
                                            s('div', [
                                                s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://rates.ninja/cryptocurrency/webdollar',
                                                            target: '_blank'
                                                        }
                                                    }, [s('img', {
                                                            staticClass: 'partner-logo',
                                                            attrs: {
                                                                src: '/public/assets/images/partners/RatesNinja.png',
                                                                alt: 'RatesNinja',
                                                                title: 'RatesNinja'
                                                            }
                                                        })]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ]),
                                                t._v(' '),
                                                s('span', { staticClass: 'teamName' }, [t._v('Rates.Ninja')])
                                            ])
                                        ])
                                    ])
                                ]),
                                t._v(' '),
                                s('collapse-faq', {
                                    ref: 'businesses',
                                    attrs: {
                                        selected: !1,
                                        id: 'businesses'
                                    }
                                }, [
                                    s('div', {
                                        attrs: { slot: 'collapse-header' },
                                        slot: 'collapse-header'
                                    }, [t._v('\n          ' + t._s(t.$i18n.t('heroes.partners.businesses')) + '\n        ')]),
                                    t._v(' '),
                                    s('div', {
                                        attrs: { slot: 'collapse-body' },
                                        slot: 'collapse-body'
                                    }, [
                                        s('div', { staticClass: 'partnerWrapper twoTeamColums' }, [
                                            s('div', [s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://www.hostero.eu',
                                                            target: '_blank'
                                                        }
                                                    }, [s('span', { staticClass: 'business-name' }, [t._v('Hostero')])]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ])]),
                                            t._v(' '),
                                            s('div', [s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'http://www.webdollar.shop/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('span', { staticClass: 'business-name' }, [t._v('Webd.Shop')])]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ])])
                                        ]),
                                        t._v(' '),
                                        s('div', { staticClass: 'partnerWrapper twoTeamColums' }, [
                                            s('div', [s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://www.facebook.com/mojitoolanu/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('span', { staticClass: 'business-name' }, [t._v('Mojito Club')])]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ])]),
                                            t._v(' '),
                                            s('div', [s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'http://www.ale-teo.com/en/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('span', { staticClass: 'business-name' }, [t._v('Ale-Teo')])]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ])])
                                        ]),
                                        t._v(' '),
                                        s('div', { staticClass: 'partnerWrapper twoTeamColums' }, [
                                            s('div', [s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://psihosexolog.ro/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('span', { staticClass: 'business-name' }, [t._v('dr. Radu Balanean')])]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ])]),
                                            t._v(' '),
                                            s('div', [s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://shop.aji.ro/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('span', { staticClass: 'business-name' }, [t._v('Shop Aji')])]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ])])
                                        ]),
                                        t._v(' '),
                                        s('div', { staticClass: 'partnerWrapper twoTeamColums' }, [
                                            s('div', [s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'http://teajuta.ro/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('span', { staticClass: 'business-name' }, [t._v('teajuta.ro')])]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ])]),
                                            t._v(' '),
                                            s('div', [s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://cursformatori.ro/',
                                                            target: '_blank'
                                                        }
                                                    }, [s('span', { staticClass: 'business-name' }, [t._v('ITSC')])]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ])])
                                        ]),
                                        t._v(' '),
                                        s('div', { staticClass: 'partnerWrapper twoTeamColums' }, [
                                            s('div', [s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://steemit.com/crypto/@concorde/first-crypto-coffee-in-romania-cryptopayments-accepted',
                                                            target: '_blank'
                                                        }
                                                    }, [s('span', { staticClass: 'business-name' }, [t._v('Crypto Coffee')])]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ])]),
                                            t._v(' '),
                                            s('div', [s('div', { staticClass: 'team-pic' }, [
                                                    s('a', {
                                                        attrs: {
                                                            href: 'https://e-primariata.ro',
                                                            target: '_blank'
                                                        }
                                                    }, [s('span', { staticClass: 'business-name' }, [t._v('E-primariaTa.ro')])]),
                                                    t._v(' '),
                                                    s('div', { staticClass: 'partners-box' })
                                                ])])
                                        ])
                                    ])
                                ])
                            ], 1)]),
                        t._v(' '),
                        s('center', [s('h2', { staticClass: 'bottom-message' }, [
                                t._v('\n      ' + t._s(t.$i18n.t('heroes.partners.wantToBecomePartner')) + ' '),
                                s('br'),
                                t._v(' '),
                                s('a', {
                                    attrs: {
                                        href: 'https://t.me/WebDollar',
                                        target: '_blank'
                                    }
                                }, [t._v(t._s(t.$i18n.t('heroes.partners.talkToUsOnTelegram')))])
                            ])])
                    ], 1);
                }, [], !1, null, null, null).exports;
        }
    }
]);