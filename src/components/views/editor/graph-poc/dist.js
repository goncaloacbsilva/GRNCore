;(function () {
    const r = document.createElement('link').relList
    if (r && r.supports && r.supports('modulepreload')) return
    for (const u of document.querySelectorAll('link[rel="modulepreload"]')) l(u)
    new MutationObserver((u) => {
        for (const a of u)
            if (a.type === 'childList')
                for (const c of a.addedNodes)
                    c.tagName === 'LINK' && c.rel === 'modulepreload' && l(c)
    }).observe(document, {
        childList: !0,
        subtree: !0,
    })
    function i(u) {
        const a = {}
        return (
            u.integrity && (a.integrity = u.integrity),
            u.referrerPolicy && (a.referrerPolicy = u.referrerPolicy),
            u.crossOrigin === 'use-credentials'
                ? (a.credentials = 'include')
                : u.crossOrigin === 'anonymous'
                  ? (a.credentials = 'omit')
                  : (a.credentials = 'same-origin'),
            a
        )
    }
    function l(u) {
        if (u.ep) return
        u.ep = !0
        const a = i(u)
        fetch(u.href, a)
    }
})()
function qa(t) {
    return t &&
        t.__esModule &&
        Object.prototype.hasOwnProperty.call(t, 'default')
        ? t.default
        : t
}
var xa = {
        exports: {},
    },
    ei = {},
    wa = {
        exports: {},
    },
    ke = {} /**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Hd
function F0() {
    if (Hd) return ke
    Hd = 1
    var t = Symbol.for('react.element'),
        r = Symbol.for('react.portal'),
        i = Symbol.for('react.fragment'),
        l = Symbol.for('react.strict_mode'),
        u = Symbol.for('react.profiler'),
        a = Symbol.for('react.provider'),
        c = Symbol.for('react.context'),
        d = Symbol.for('react.forward_ref'),
        p = Symbol.for('react.suspense'),
        m = Symbol.for('react.memo'),
        v = Symbol.for('react.lazy'),
        g = Symbol.iterator
    function y(M) {
        return M === null || typeof M != 'object'
            ? null
            : ((M = (g && M[g]) || M['@@iterator']),
              typeof M == 'function' ? M : null)
    }
    var S = {
            isMounted: function () {
                return !1
            },
            enqueueForceUpdate: function () {},
            enqueueReplaceState: function () {},
            enqueueSetState: function () {},
        },
        _ = Object.assign,
        E = {}
    function k(M, $, te) {
        ;((this.props = M),
            (this.context = $),
            (this.refs = E),
            (this.updater = te || S))
    }
    ;((k.prototype.isReactComponent = {}),
        (k.prototype.setState = function (M, $) {
            if (typeof M != 'object' && typeof M != 'function' && M != null)
                throw Error(
                    'setState(...): takes an object of state variables to update or a function which returns an object of state variables.'
                )
            this.updater.enqueueSetState(this, M, $, 'setState')
        }),
        (k.prototype.forceUpdate = function (M) {
            this.updater.enqueueForceUpdate(this, M, 'forceUpdate')
        }))
    function C() {}
    C.prototype = k.prototype
    function I(M, $, te) {
        ;((this.props = M),
            (this.context = $),
            (this.refs = E),
            (this.updater = te || S))
    }
    var w = (I.prototype = new C())
    ;((w.constructor = I), _(w, k.prototype), (w.isPureReactComponent = !0))
    var N = Array.isArray,
        A = Object.prototype.hasOwnProperty,
        T = {
            current: null,
        },
        F = {
            key: !0,
            ref: !0,
            __self: !0,
            __source: !0,
        }
    function V(M, $, te) {
        var ee,
            le = {},
            ue = null,
            ce = null
        if ($ != null)
            for (ee in ($.ref !== void 0 && (ce = $.ref),
            $.key !== void 0 && (ue = '' + $.key),
            $))
                A.call($, ee) && !F.hasOwnProperty(ee) && (le[ee] = $[ee])
        var J = arguments.length - 2
        if (J === 1) le.children = te
        else if (1 < J) {
            for (var fe = Array(J), we = 0; we < J; we++)
                fe[we] = arguments[we + 2]
            le.children = fe
        }
        if (M && M.defaultProps)
            for (ee in ((J = M.defaultProps), J))
                le[ee] === void 0 && (le[ee] = J[ee])
        return {
            $$typeof: t,
            type: M,
            key: ue,
            ref: ce,
            props: le,
            _owner: T.current,
        }
    }
    function K(M, $) {
        return {
            $$typeof: t,
            type: M.type,
            key: $,
            ref: M.ref,
            props: M.props,
            _owner: M._owner,
        }
    }
    function ne(M) {
        return typeof M == 'object' && M !== null && M.$$typeof === t
    }
    function U(M) {
        var $ = {
            '=': '=0',
            ':': '=2',
        }
        return (
            '$' +
            M.replace(/[=:]/g, function (te) {
                return $[te]
            })
        )
    }
    var W = /\/+/g
    function Z(M, $) {
        return typeof M == 'object' && M !== null && M.key != null
            ? U('' + M.key)
            : $.toString(36)
    }
    function z(M, $, te, ee, le) {
        var ue = typeof M
        ;(ue === 'undefined' || ue === 'boolean') && (M = null)
        var ce = !1
        if (M === null) ce = !0
        else
            switch (ue) {
                case 'string':
                case 'number':
                    ce = !0
                    break
                case 'object':
                    switch (M.$$typeof) {
                        case t:
                        case r:
                            ce = !0
                    }
            }
        if (ce)
            return (
                (ce = M),
                (le = le(ce)),
                (M = ee === '' ? '.' + Z(ce, 0) : ee),
                N(le)
                    ? ((te = ''),
                      M != null && (te = M.replace(W, '$&/') + '/'),
                      z(le, $, te, '', function (we) {
                          return we
                      }))
                    : le != null &&
                      (ne(le) &&
                          (le = K(
                              le,
                              te +
                                  (!le.key || (ce && ce.key === le.key)
                                      ? ''
                                      : ('' + le.key).replace(W, '$&/') + '/') +
                                  M
                          )),
                      $.push(le)),
                1
            )
        if (((ce = 0), (ee = ee === '' ? '.' : ee + ':'), N(M)))
            for (var J = 0; J < M.length; J++) {
                ue = M[J]
                var fe = ee + Z(ue, J)
                ce += z(ue, $, te, fe, le)
            }
        else if (((fe = y(M)), typeof fe == 'function'))
            for (M = fe.call(M), J = 0; !(ue = M.next()).done; )
                ((ue = ue.value),
                    (fe = ee + Z(ue, J++)),
                    (ce += z(ue, $, te, fe, le)))
        else if (ue === 'object')
            throw (
                ($ = String(M)),
                Error(
                    'Objects are not valid as a React child (found: ' +
                        ($ === '[object Object]'
                            ? 'object with keys {' +
                              Object.keys(M).join(', ') +
                              '}'
                            : $) +
                        '). If you meant to render a collection of children, use an array instead.'
                )
            )
        return ce
    }
    function B(M, $, te) {
        if (M == null) return M
        var ee = [],
            le = 0
        return (
            z(M, ee, '', '', function (ue) {
                return $.call(te, ue, le++)
            }),
            ee
        )
    }
    function H(M) {
        if (M._status === -1) {
            var $ = M._result
            ;(($ = $()),
                $.then(
                    function (te) {
                        ;(M._status === 0 || M._status === -1) &&
                            ((M._status = 1), (M._result = te))
                    },
                    function (te) {
                        ;(M._status === 0 || M._status === -1) &&
                            ((M._status = 2), (M._result = te))
                    }
                ),
                M._status === -1 && ((M._status = 0), (M._result = $)))
        }
        if (M._status === 1) return M._result.default
        throw M._result
    }
    var b = {
            current: null,
        },
        L = {
            transition: null,
        },
        R = {
            ReactCurrentDispatcher: b,
            ReactCurrentBatchConfig: L,
            ReactCurrentOwner: T,
        }
    function j() {
        throw Error('act(...) is not supported in production builds of React.')
    }
    return (
        (ke.Children = {
            map: B,
            forEach: function (M, $, te) {
                B(
                    M,
                    function () {
                        $.apply(this, arguments)
                    },
                    te
                )
            },
            count: function (M) {
                var $ = 0
                return (
                    B(M, function () {
                        $++
                    }),
                    $
                )
            },
            toArray: function (M) {
                return (
                    B(M, function ($) {
                        return $
                    }) || []
                )
            },
            only: function (M) {
                if (!ne(M))
                    throw Error(
                        'React.Children.only expected to receive a single React element child.'
                    )
                return M
            },
        }),
        (ke.Component = k),
        (ke.Fragment = i),
        (ke.Profiler = u),
        (ke.PureComponent = I),
        (ke.StrictMode = l),
        (ke.Suspense = p),
        (ke.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = R),
        (ke.act = j),
        (ke.cloneElement = function (M, $, te) {
            if (M == null)
                throw Error(
                    'React.cloneElement(...): The argument must be a React element, but you passed ' +
                        M +
                        '.'
                )
            var ee = _({}, M.props),
                le = M.key,
                ue = M.ref,
                ce = M._owner
            if ($ != null) {
                if (
                    ($.ref !== void 0 && ((ue = $.ref), (ce = T.current)),
                    $.key !== void 0 && (le = '' + $.key),
                    M.type && M.type.defaultProps)
                )
                    var J = M.type.defaultProps
                for (fe in $)
                    A.call($, fe) &&
                        !F.hasOwnProperty(fe) &&
                        (ee[fe] =
                            $[fe] === void 0 && J !== void 0 ? J[fe] : $[fe])
            }
            var fe = arguments.length - 2
            if (fe === 1) ee.children = te
            else if (1 < fe) {
                J = Array(fe)
                for (var we = 0; we < fe; we++) J[we] = arguments[we + 2]
                ee.children = J
            }
            return {
                $$typeof: t,
                type: M.type,
                key: le,
                ref: ue,
                props: ee,
                _owner: ce,
            }
        }),
        (ke.createContext = function (M) {
            return (
                (M = {
                    $$typeof: c,
                    _currentValue: M,
                    _currentValue2: M,
                    _threadCount: 0,
                    Provider: null,
                    Consumer: null,
                    _defaultValue: null,
                    _globalName: null,
                }),
                (M.Provider = {
                    $$typeof: a,
                    _context: M,
                }),
                (M.Consumer = M)
            )
        }),
        (ke.createElement = V),
        (ke.createFactory = function (M) {
            var $ = V.bind(null, M)
            return (($.type = M), $)
        }),
        (ke.createRef = function () {
            return {
                current: null,
            }
        }),
        (ke.forwardRef = function (M) {
            return {
                $$typeof: d,
                render: M,
            }
        }),
        (ke.isValidElement = ne),
        (ke.lazy = function (M) {
            return {
                $$typeof: v,
                _payload: {
                    _status: -1,
                    _result: M,
                },
                _init: H,
            }
        }),
        (ke.memo = function (M, $) {
            return {
                $$typeof: m,
                type: M,
                compare: $ === void 0 ? null : $,
            }
        }),
        (ke.startTransition = function (M) {
            var $ = L.transition
            L.transition = {}
            try {
                M()
            } finally {
                L.transition = $
            }
        }),
        (ke.unstable_act = j),
        (ke.useCallback = function (M, $) {
            return b.current.useCallback(M, $)
        }),
        (ke.useContext = function (M) {
            return b.current.useContext(M)
        }),
        (ke.useDebugValue = function () {}),
        (ke.useDeferredValue = function (M) {
            return b.current.useDeferredValue(M)
        }),
        (ke.useEffect = function (M, $) {
            return b.current.useEffect(M, $)
        }),
        (ke.useId = function () {
            return b.current.useId()
        }),
        (ke.useImperativeHandle = function (M, $, te) {
            return b.current.useImperativeHandle(M, $, te)
        }),
        (ke.useInsertionEffect = function (M, $) {
            return b.current.useInsertionEffect(M, $)
        }),
        (ke.useLayoutEffect = function (M, $) {
            return b.current.useLayoutEffect(M, $)
        }),
        (ke.useMemo = function (M, $) {
            return b.current.useMemo(M, $)
        }),
        (ke.useReducer = function (M, $, te) {
            return b.current.useReducer(M, $, te)
        }),
        (ke.useRef = function (M) {
            return b.current.useRef(M)
        }),
        (ke.useState = function (M) {
            return b.current.useState(M)
        }),
        (ke.useSyncExternalStore = function (M, $, te) {
            return b.current.useSyncExternalStore(M, $, te)
        }),
        (ke.useTransition = function () {
            return b.current.useTransition()
        }),
        (ke.version = '18.3.1'),
        ke
    )
}
var jd
function mi() {
    return (jd || ((jd = 1), (wa.exports = F0())), wa.exports)
} /**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Vd
function H0() {
    if (Vd) return ei
    Vd = 1
    var t = mi(),
        r = Symbol.for('react.element'),
        i = Symbol.for('react.fragment'),
        l = Object.prototype.hasOwnProperty,
        u =
            t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
                .ReactCurrentOwner,
        a = {
            key: !0,
            ref: !0,
            __self: !0,
            __source: !0,
        }
    function c(d, p, m) {
        var v,
            g = {},
            y = null,
            S = null
        ;(m !== void 0 && (y = '' + m),
            p.key !== void 0 && (y = '' + p.key),
            p.ref !== void 0 && (S = p.ref))
        for (v in p) l.call(p, v) && !a.hasOwnProperty(v) && (g[v] = p[v])
        if (d && d.defaultProps)
            for (v in ((p = d.defaultProps), p))
                g[v] === void 0 && (g[v] = p[v])
        return {
            $$typeof: r,
            type: d,
            key: y,
            ref: S,
            props: g,
            _owner: u.current,
        }
    }
    return ((ei.Fragment = i), (ei.jsx = c), (ei.jsxs = c), ei)
}
var Bd
function j0() {
    return (Bd || ((Bd = 1), (xa.exports = H0())), xa.exports)
}
var Q = j0(),
    q = mi()
const Kr = qa(q)
var Us = {},
    Sa = {
        exports: {},
    },
    ft = {},
    _a = {
        exports: {},
    },
    Ea = {} /**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Ud
function V0() {
    return (
        Ud ||
            ((Ud = 1),
            (function (t) {
                function r(L, R) {
                    var j = L.length
                    L.push(R)
                    e: for (; 0 < j; ) {
                        var M = (j - 1) >>> 1,
                            $ = L[M]
                        if (0 < u($, R)) ((L[M] = R), (L[j] = $), (j = M))
                        else break e
                    }
                }
                function i(L) {
                    return L.length === 0 ? null : L[0]
                }
                function l(L) {
                    if (L.length === 0) return null
                    var R = L[0],
                        j = L.pop()
                    if (j !== R) {
                        L[0] = j
                        e: for (
                            var M = 0, $ = L.length, te = $ >>> 1;
                            M < te;
                        ) {
                            var ee = 2 * (M + 1) - 1,
                                le = L[ee],
                                ue = ee + 1,
                                ce = L[ue]
                            if (0 > u(le, j))
                                ue < $ && 0 > u(ce, le)
                                    ? ((L[M] = ce), (L[ue] = j), (M = ue))
                                    : ((L[M] = le), (L[ee] = j), (M = ee))
                            else if (ue < $ && 0 > u(ce, j))
                                ((L[M] = ce), (L[ue] = j), (M = ue))
                            else break e
                        }
                    }
                    return R
                }
                function u(L, R) {
                    var j = L.sortIndex - R.sortIndex
                    return j !== 0 ? j : L.id - R.id
                }
                if (
                    typeof performance == 'object' &&
                    typeof performance.now == 'function'
                ) {
                    var a = performance
                    t.unstable_now = function () {
                        return a.now()
                    }
                } else {
                    var c = Date,
                        d = c.now()
                    t.unstable_now = function () {
                        return c.now() - d
                    }
                }
                var p = [],
                    m = [],
                    v = 1,
                    g = null,
                    y = 3,
                    S = !1,
                    _ = !1,
                    E = !1,
                    k = typeof setTimeout == 'function' ? setTimeout : null,
                    C = typeof clearTimeout == 'function' ? clearTimeout : null,
                    I = typeof setImmediate < 'u' ? setImmediate : null
                typeof navigator < 'u' &&
                    navigator.scheduling !== void 0 &&
                    navigator.scheduling.isInputPending !== void 0 &&
                    navigator.scheduling.isInputPending.bind(
                        navigator.scheduling
                    )
                function w(L) {
                    for (var R = i(m); R !== null; ) {
                        if (R.callback === null) l(m)
                        else if (R.startTime <= L)
                            (l(m), (R.sortIndex = R.expirationTime), r(p, R))
                        else break
                        R = i(m)
                    }
                }
                function N(L) {
                    if (((E = !1), w(L), !_))
                        if (i(p) !== null) ((_ = !0), H(A))
                        else {
                            var R = i(m)
                            R !== null && b(N, R.startTime - L)
                        }
                }
                function A(L, R) {
                    ;((_ = !1), E && ((E = !1), C(V), (V = -1)), (S = !0))
                    var j = y
                    try {
                        for (
                            w(R), g = i(p);
                            g !== null &&
                            (!(g.expirationTime > R) || (L && !U()));
                        ) {
                            var M = g.callback
                            if (typeof M == 'function') {
                                ;((g.callback = null), (y = g.priorityLevel))
                                var $ = M(g.expirationTime <= R)
                                ;((R = t.unstable_now()),
                                    typeof $ == 'function'
                                        ? (g.callback = $)
                                        : g === i(p) && l(p),
                                    w(R))
                            } else l(p)
                            g = i(p)
                        }
                        if (g !== null) var te = !0
                        else {
                            var ee = i(m)
                            ;(ee !== null && b(N, ee.startTime - R), (te = !1))
                        }
                        return te
                    } finally {
                        ;((g = null), (y = j), (S = !1))
                    }
                }
                var T = !1,
                    F = null,
                    V = -1,
                    K = 5,
                    ne = -1
                function U() {
                    return !(t.unstable_now() - ne < K)
                }
                function W() {
                    if (F !== null) {
                        var L = t.unstable_now()
                        ne = L
                        var R = !0
                        try {
                            R = F(!0, L)
                        } finally {
                            R ? Z() : ((T = !1), (F = null))
                        }
                    } else T = !1
                }
                var Z
                if (typeof I == 'function')
                    Z = function () {
                        I(W)
                    }
                else if (typeof MessageChannel < 'u') {
                    var z = new MessageChannel(),
                        B = z.port2
                    ;((z.port1.onmessage = W),
                        (Z = function () {
                            B.postMessage(null)
                        }))
                } else
                    Z = function () {
                        k(W, 0)
                    }
                function H(L) {
                    ;((F = L), T || ((T = !0), Z()))
                }
                function b(L, R) {
                    V = k(function () {
                        L(t.unstable_now())
                    }, R)
                }
                ;((t.unstable_IdlePriority = 5),
                    (t.unstable_ImmediatePriority = 1),
                    (t.unstable_LowPriority = 4),
                    (t.unstable_NormalPriority = 3),
                    (t.unstable_Profiling = null),
                    (t.unstable_UserBlockingPriority = 2),
                    (t.unstable_cancelCallback = function (L) {
                        L.callback = null
                    }),
                    (t.unstable_continueExecution = function () {
                        _ || S || ((_ = !0), H(A))
                    }),
                    (t.unstable_forceFrameRate = function (L) {
                        0 > L || 125 < L
                            ? console.error(
                                  'forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported'
                              )
                            : (K = 0 < L ? Math.floor(1e3 / L) : 5)
                    }),
                    (t.unstable_getCurrentPriorityLevel = function () {
                        return y
                    }),
                    (t.unstable_getFirstCallbackNode = function () {
                        return i(p)
                    }),
                    (t.unstable_next = function (L) {
                        switch (y) {
                            case 1:
                            case 2:
                            case 3:
                                var R = 3
                                break
                            default:
                                R = y
                        }
                        var j = y
                        y = R
                        try {
                            return L()
                        } finally {
                            y = j
                        }
                    }),
                    (t.unstable_pauseExecution = function () {}),
                    (t.unstable_requestPaint = function () {}),
                    (t.unstable_runWithPriority = function (L, R) {
                        switch (L) {
                            case 1:
                            case 2:
                            case 3:
                            case 4:
                            case 5:
                                break
                            default:
                                L = 3
                        }
                        var j = y
                        y = L
                        try {
                            return R()
                        } finally {
                            y = j
                        }
                    }),
                    (t.unstable_scheduleCallback = function (L, R, j) {
                        var M = t.unstable_now()
                        switch (
                            (typeof j == 'object' && j !== null
                                ? ((j = j.delay),
                                  (j =
                                      typeof j == 'number' && 0 < j
                                          ? M + j
                                          : M))
                                : (j = M),
                            L)
                        ) {
                            case 1:
                                var $ = -1
                                break
                            case 2:
                                $ = 250
                                break
                            case 5:
                                $ = 1073741823
                                break
                            case 4:
                                $ = 1e4
                                break
                            default:
                                $ = 5e3
                        }
                        return (
                            ($ = j + $),
                            (L = {
                                id: v++,
                                callback: R,
                                priorityLevel: L,
                                startTime: j,
                                expirationTime: $,
                                sortIndex: -1,
                            }),
                            j > M
                                ? ((L.sortIndex = j),
                                  r(m, L),
                                  i(p) === null &&
                                      L === i(m) &&
                                      (E ? (C(V), (V = -1)) : (E = !0),
                                      b(N, j - M)))
                                : ((L.sortIndex = $),
                                  r(p, L),
                                  _ || S || ((_ = !0), H(A))),
                            L
                        )
                    }),
                    (t.unstable_shouldYield = U),
                    (t.unstable_wrapCallback = function (L) {
                        var R = y
                        return function () {
                            var j = y
                            y = R
                            try {
                                return L.apply(this, arguments)
                            } finally {
                                y = j
                            }
                        }
                    }))
            })(Ea)),
        Ea
    )
}
var Wd
function B0() {
    return (Wd || ((Wd = 1), (_a.exports = V0())), _a.exports)
} /**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Yd
function U0() {
    if (Yd) return ft
    Yd = 1
    var t = mi(),
        r = B0()
    function i(e) {
        for (
            var n =
                    'https://reactjs.org/docs/error-decoder.html?invariant=' +
                    e,
                o = 1;
            o < arguments.length;
            o++
        )
            n += '&args[]=' + encodeURIComponent(arguments[o])
        return (
            'Minified React error #' +
            e +
            '; visit ' +
            n +
            ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings.'
        )
    }
    var l = new Set(),
        u = {}
    function a(e, n) {
        ;(c(e, n), c(e + 'Capture', n))
    }
    function c(e, n) {
        for (u[e] = n, e = 0; e < n.length; e++) l.add(n[e])
    }
    var d = !(
            typeof window > 'u' ||
            typeof window.document > 'u' ||
            typeof window.document.createElement > 'u'
        ),
        p = Object.prototype.hasOwnProperty,
        m =
            /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
        v = {},
        g = {}
    function y(e) {
        return p.call(g, e)
            ? !0
            : p.call(v, e)
              ? !1
              : m.test(e)
                ? (g[e] = !0)
                : ((v[e] = !0), !1)
    }
    function S(e, n, o, s) {
        if (o !== null && o.type === 0) return !1
        switch (typeof n) {
            case 'function':
            case 'symbol':
                return !0
            case 'boolean':
                return s
                    ? !1
                    : o !== null
                      ? !o.acceptsBooleans
                      : ((e = e.toLowerCase().slice(0, 5)),
                        e !== 'data-' && e !== 'aria-')
            default:
                return !1
        }
    }
    function _(e, n, o, s) {
        if (n === null || typeof n > 'u' || S(e, n, o, s)) return !0
        if (s) return !1
        if (o !== null)
            switch (o.type) {
                case 3:
                    return !n
                case 4:
                    return n === !1
                case 5:
                    return isNaN(n)
                case 6:
                    return isNaN(n) || 1 > n
            }
        return !1
    }
    function E(e, n, o, s, f, h, x) {
        ;((this.acceptsBooleans = n === 2 || n === 3 || n === 4),
            (this.attributeName = s),
            (this.attributeNamespace = f),
            (this.mustUseProperty = o),
            (this.propertyName = e),
            (this.type = n),
            (this.sanitizeURL = h),
            (this.removeEmptyString = x))
    }
    var k = {}
    ;('children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style'
        .split(' ')
        .forEach(function (e) {
            k[e] = new E(e, 0, !1, e, null, !1, !1)
        }),
        [
            ['acceptCharset', 'accept-charset'],
            ['className', 'class'],
            ['htmlFor', 'for'],
            ['httpEquiv', 'http-equiv'],
        ].forEach(function (e) {
            var n = e[0]
            k[n] = new E(n, 1, !1, e[1], null, !1, !1)
        }),
        ['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(
            function (e) {
                k[e] = new E(e, 2, !1, e.toLowerCase(), null, !1, !1)
            }
        ),
        [
            'autoReverse',
            'externalResourcesRequired',
            'focusable',
            'preserveAlpha',
        ].forEach(function (e) {
            k[e] = new E(e, 2, !1, e, null, !1, !1)
        }),
        'allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope'
            .split(' ')
            .forEach(function (e) {
                k[e] = new E(e, 3, !1, e.toLowerCase(), null, !1, !1)
            }),
        ['checked', 'multiple', 'muted', 'selected'].forEach(function (e) {
            k[e] = new E(e, 3, !0, e, null, !1, !1)
        }),
        ['capture', 'download'].forEach(function (e) {
            k[e] = new E(e, 4, !1, e, null, !1, !1)
        }),
        ['cols', 'rows', 'size', 'span'].forEach(function (e) {
            k[e] = new E(e, 6, !1, e, null, !1, !1)
        }),
        ['rowSpan', 'start'].forEach(function (e) {
            k[e] = new E(e, 5, !1, e.toLowerCase(), null, !1, !1)
        }))
    var C = /[\-:]([a-z])/g
    function I(e) {
        return e[1].toUpperCase()
    }
    ;('accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height'
        .split(' ')
        .forEach(function (e) {
            var n = e.replace(C, I)
            k[n] = new E(n, 1, !1, e, null, !1, !1)
        }),
        'xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type'
            .split(' ')
            .forEach(function (e) {
                var n = e.replace(C, I)
                k[n] = new E(
                    n,
                    1,
                    !1,
                    e,
                    'http://www.w3.org/1999/xlink',
                    !1,
                    !1
                )
            }),
        ['xml:base', 'xml:lang', 'xml:space'].forEach(function (e) {
            var n = e.replace(C, I)
            k[n] = new E(
                n,
                1,
                !1,
                e,
                'http://www.w3.org/XML/1998/namespace',
                !1,
                !1
            )
        }),
        ['tabIndex', 'crossOrigin'].forEach(function (e) {
            k[e] = new E(e, 1, !1, e.toLowerCase(), null, !1, !1)
        }),
        (k.xlinkHref = new E(
            'xlinkHref',
            1,
            !1,
            'xlink:href',
            'http://www.w3.org/1999/xlink',
            !0,
            !1
        )),
        ['src', 'href', 'action', 'formAction'].forEach(function (e) {
            k[e] = new E(e, 1, !1, e.toLowerCase(), null, !0, !0)
        }))
    function w(e, n, o, s) {
        var f = k.hasOwnProperty(n) ? k[n] : null
        ;(f !== null
            ? f.type !== 0
            : s ||
              !(2 < n.length) ||
              (n[0] !== 'o' && n[0] !== 'O') ||
              (n[1] !== 'n' && n[1] !== 'N')) &&
            (_(n, o, f, s) && (o = null),
            s || f === null
                ? y(n) &&
                  (o === null
                      ? e.removeAttribute(n)
                      : e.setAttribute(n, '' + o))
                : f.mustUseProperty
                  ? (e[f.propertyName] =
                        o === null ? (f.type === 3 ? !1 : '') : o)
                  : ((n = f.attributeName),
                    (s = f.attributeNamespace),
                    o === null
                        ? e.removeAttribute(n)
                        : ((f = f.type),
                          (o = f === 3 || (f === 4 && o === !0) ? '' : '' + o),
                          s
                              ? e.setAttributeNS(s, n, o)
                              : e.setAttribute(n, o))))
    }
    var N = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
        A = Symbol.for('react.element'),
        T = Symbol.for('react.portal'),
        F = Symbol.for('react.fragment'),
        V = Symbol.for('react.strict_mode'),
        K = Symbol.for('react.profiler'),
        ne = Symbol.for('react.provider'),
        U = Symbol.for('react.context'),
        W = Symbol.for('react.forward_ref'),
        Z = Symbol.for('react.suspense'),
        z = Symbol.for('react.suspense_list'),
        B = Symbol.for('react.memo'),
        H = Symbol.for('react.lazy'),
        b = Symbol.for('react.offscreen'),
        L = Symbol.iterator
    function R(e) {
        return e === null || typeof e != 'object'
            ? null
            : ((e = (L && e[L]) || e['@@iterator']),
              typeof e == 'function' ? e : null)
    }
    var j = Object.assign,
        M
    function $(e) {
        if (M === void 0)
            try {
                throw Error()
            } catch (o) {
                var n = o.stack.trim().match(/\n( *(at )?)/)
                M = (n && n[1]) || ''
            }
        return (
            `
` +
            M +
            e
        )
    }
    var te = !1
    function ee(e, n) {
        if (!e || te) return ''
        te = !0
        var o = Error.prepareStackTrace
        Error.prepareStackTrace = void 0
        try {
            if (n)
                if (
                    ((n = function () {
                        throw Error()
                    }),
                    Object.defineProperty(n.prototype, 'props', {
                        set: function () {
                            throw Error()
                        },
                    }),
                    typeof Reflect == 'object' && Reflect.construct)
                ) {
                    try {
                        Reflect.construct(n, [])
                    } catch (G) {
                        var s = G
                    }
                    Reflect.construct(e, [], n)
                } else {
                    try {
                        n.call()
                    } catch (G) {
                        s = G
                    }
                    e.call(n.prototype)
                }
            else {
                try {
                    throw Error()
                } catch (G) {
                    s = G
                }
                e()
            }
        } catch (G) {
            if (G && s && typeof G.stack == 'string') {
                for (
                    var f = G.stack.split(`
`),
                        h = s.stack.split(`
`),
                        x = f.length - 1,
                        P = h.length - 1;
                    1 <= x && 0 <= P && f[x] !== h[P];
                )
                    P--
                for (; 1 <= x && 0 <= P; x--, P--)
                    if (f[x] !== h[P]) {
                        if (x !== 1 || P !== 1)
                            do
                                if ((x--, P--, 0 > P || f[x] !== h[P])) {
                                    var D =
                                        `
` + f[x].replace(' at new ', ' at ')
                                    return (
                                        e.displayName &&
                                            D.includes('<anonymous>') &&
                                            (D = D.replace(
                                                '<anonymous>',
                                                e.displayName
                                            )),
                                        D
                                    )
                                }
                            while (1 <= x && 0 <= P)
                        break
                    }
            }
        } finally {
            ;((te = !1), (Error.prepareStackTrace = o))
        }
        return (e = e ? e.displayName || e.name : '') ? $(e) : ''
    }
    function le(e) {
        switch (e.tag) {
            case 5:
                return $(e.type)
            case 16:
                return $('Lazy')
            case 13:
                return $('Suspense')
            case 19:
                return $('SuspenseList')
            case 0:
            case 2:
            case 15:
                return ((e = ee(e.type, !1)), e)
            case 11:
                return ((e = ee(e.type.render, !1)), e)
            case 1:
                return ((e = ee(e.type, !0)), e)
            default:
                return ''
        }
    }
    function ue(e) {
        if (e == null) return null
        if (typeof e == 'function') return e.displayName || e.name || null
        if (typeof e == 'string') return e
        switch (e) {
            case F:
                return 'Fragment'
            case T:
                return 'Portal'
            case K:
                return 'Profiler'
            case V:
                return 'StrictMode'
            case Z:
                return 'Suspense'
            case z:
                return 'SuspenseList'
        }
        if (typeof e == 'object')
            switch (e.$$typeof) {
                case U:
                    return (e.displayName || 'Context') + '.Consumer'
                case ne:
                    return (e._context.displayName || 'Context') + '.Provider'
                case W:
                    var n = e.render
                    return (
                        (e = e.displayName),
                        e ||
                            ((e = n.displayName || n.name || ''),
                            (e =
                                e !== ''
                                    ? 'ForwardRef(' + e + ')'
                                    : 'ForwardRef')),
                        e
                    )
                case B:
                    return (
                        (n = e.displayName || null),
                        n !== null ? n : ue(e.type) || 'Memo'
                    )
                case H:
                    ;((n = e._payload), (e = e._init))
                    try {
                        return ue(e(n))
                    } catch {}
            }
        return null
    }
    function ce(e) {
        var n = e.type
        switch (e.tag) {
            case 24:
                return 'Cache'
            case 9:
                return (n.displayName || 'Context') + '.Consumer'
            case 10:
                return (n._context.displayName || 'Context') + '.Provider'
            case 18:
                return 'DehydratedFragment'
            case 11:
                return (
                    (e = n.render),
                    (e = e.displayName || e.name || ''),
                    n.displayName ||
                        (e !== '' ? 'ForwardRef(' + e + ')' : 'ForwardRef')
                )
            case 7:
                return 'Fragment'
            case 5:
                return n
            case 4:
                return 'Portal'
            case 3:
                return 'Root'
            case 6:
                return 'Text'
            case 16:
                return ue(n)
            case 8:
                return n === V ? 'StrictMode' : 'Mode'
            case 22:
                return 'Offscreen'
            case 12:
                return 'Profiler'
            case 21:
                return 'Scope'
            case 13:
                return 'Suspense'
            case 19:
                return 'SuspenseList'
            case 25:
                return 'TracingMarker'
            case 1:
            case 0:
            case 17:
            case 2:
            case 14:
            case 15:
                if (typeof n == 'function')
                    return n.displayName || n.name || null
                if (typeof n == 'string') return n
        }
        return null
    }
    function J(e) {
        switch (typeof e) {
            case 'boolean':
            case 'number':
            case 'string':
            case 'undefined':
                return e
            case 'object':
                return e
            default:
                return ''
        }
    }
    function fe(e) {
        var n = e.type
        return (
            (e = e.nodeName) &&
            e.toLowerCase() === 'input' &&
            (n === 'checkbox' || n === 'radio')
        )
    }
    function we(e) {
        var n = fe(e) ? 'checked' : 'value',
            o = Object.getOwnPropertyDescriptor(e.constructor.prototype, n),
            s = '' + e[n]
        if (
            !e.hasOwnProperty(n) &&
            typeof o < 'u' &&
            typeof o.get == 'function' &&
            typeof o.set == 'function'
        ) {
            var f = o.get,
                h = o.set
            return (
                Object.defineProperty(e, n, {
                    configurable: !0,
                    get: function () {
                        return f.call(this)
                    },
                    set: function (x) {
                        ;((s = '' + x), h.call(this, x))
                    },
                }),
                Object.defineProperty(e, n, {
                    enumerable: o.enumerable,
                }),
                {
                    getValue: function () {
                        return s
                    },
                    setValue: function (x) {
                        s = '' + x
                    },
                    stopTracking: function () {
                        ;((e._valueTracker = null), delete e[n])
                    },
                }
            )
        }
    }
    function _e(e) {
        e._valueTracker || (e._valueTracker = we(e))
    }
    function Se(e) {
        if (!e) return !1
        var n = e._valueTracker
        if (!n) return !0
        var o = n.getValue(),
            s = ''
        return (
            e && (s = fe(e) ? (e.checked ? 'true' : 'false') : e.value),
            (e = s),
            e !== o ? (n.setValue(e), !0) : !1
        )
    }
    function ye(e) {
        if (
            ((e = e || (typeof document < 'u' ? document : void 0)),
            typeof e > 'u')
        )
            return null
        try {
            return e.activeElement || e.body
        } catch {
            return e.body
        }
    }
    function Ne(e, n) {
        var o = n.checked
        return j({}, n, {
            defaultChecked: void 0,
            defaultValue: void 0,
            value: void 0,
            checked: o ?? e._wrapperState.initialChecked,
        })
    }
    function Ie(e, n) {
        var o = n.defaultValue == null ? '' : n.defaultValue,
            s = n.checked != null ? n.checked : n.defaultChecked
        ;((o = J(n.value != null ? n.value : o)),
            (e._wrapperState = {
                initialChecked: s,
                initialValue: o,
                controlled:
                    n.type === 'checkbox' || n.type === 'radio'
                        ? n.checked != null
                        : n.value != null,
            }))
    }
    function Me(e, n) {
        ;((n = n.checked), n != null && w(e, 'checked', n, !1))
    }
    function Ue(e, n) {
        Me(e, n)
        var o = J(n.value),
            s = n.type
        if (o != null)
            s === 'number'
                ? ((o === 0 && e.value === '') || e.value != o) &&
                  (e.value = '' + o)
                : e.value !== '' + o && (e.value = '' + o)
        else if (s === 'submit' || s === 'reset') {
            e.removeAttribute('value')
            return
        }
        ;(n.hasOwnProperty('value')
            ? ht(e, n.type, o)
            : n.hasOwnProperty('defaultValue') &&
              ht(e, n.type, J(n.defaultValue)),
            n.checked == null &&
                n.defaultChecked != null &&
                (e.defaultChecked = !!n.defaultChecked))
    }
    function Lt(e, n, o) {
        if (n.hasOwnProperty('value') || n.hasOwnProperty('defaultValue')) {
            var s = n.type
            if (
                !(
                    (s !== 'submit' && s !== 'reset') ||
                    (n.value !== void 0 && n.value !== null)
                )
            )
                return
            ;((n = '' + e._wrapperState.initialValue),
                o || n === e.value || (e.value = n),
                (e.defaultValue = n))
        }
        ;((o = e.name),
            o !== '' && (e.name = ''),
            (e.defaultChecked = !!e._wrapperState.initialChecked),
            o !== '' && (e.name = o))
    }
    function ht(e, n, o) {
        ;(n !== 'number' || ye(e.ownerDocument) !== e) &&
            (o == null
                ? (e.defaultValue = '' + e._wrapperState.initialValue)
                : e.defaultValue !== '' + o && (e.defaultValue = '' + o))
    }
    var pt = Array.isArray
    function _t(e, n, o, s) {
        if (((e = e.options), n)) {
            n = {}
            for (var f = 0; f < o.length; f++) n['$' + o[f]] = !0
            for (o = 0; o < e.length; o++)
                ((f = n.hasOwnProperty('$' + e[o].value)),
                    e[o].selected !== f && (e[o].selected = f),
                    f && s && (e[o].defaultSelected = !0))
        } else {
            for (o = '' + J(o), n = null, f = 0; f < e.length; f++) {
                if (e[f].value === o) {
                    ;((e[f].selected = !0), s && (e[f].defaultSelected = !0))
                    return
                }
                n !== null || e[f].disabled || (n = e[f])
            }
            n !== null && (n.selected = !0)
        }
    }
    function Jt(e, n) {
        if (n.dangerouslySetInnerHTML != null) throw Error(i(91))
        return j({}, n, {
            value: void 0,
            defaultValue: void 0,
            children: '' + e._wrapperState.initialValue,
        })
    }
    function mn(e, n) {
        var o = n.value
        if (o == null) {
            if (((o = n.children), (n = n.defaultValue), o != null)) {
                if (n != null) throw Error(i(92))
                if (pt(o)) {
                    if (1 < o.length) throw Error(i(93))
                    o = o[0]
                }
                n = o
            }
            ;(n == null && (n = ''), (o = n))
        }
        e._wrapperState = {
            initialValue: J(o),
        }
    }
    function vr(e, n) {
        var o = J(n.value),
            s = J(n.defaultValue)
        ;(o != null &&
            ((o = '' + o),
            o !== e.value && (e.value = o),
            n.defaultValue == null &&
                e.defaultValue !== o &&
                (e.defaultValue = o)),
            s != null && (e.defaultValue = '' + s))
    }
    function Un(e) {
        var n = e.textContent
        n === e._wrapperState.initialValue &&
            n !== '' &&
            n !== null &&
            (e.value = n)
    }
    function en(e) {
        switch (e) {
            case 'svg':
                return 'http://www.w3.org/2000/svg'
            case 'math':
                return 'http://www.w3.org/1998/Math/MathML'
            default:
                return 'http://www.w3.org/1999/xhtml'
        }
    }
    function tn(e, n) {
        return e == null || e === 'http://www.w3.org/1999/xhtml'
            ? en(n)
            : e === 'http://www.w3.org/2000/svg' && n === 'foreignObject'
              ? 'http://www.w3.org/1999/xhtml'
              : e
    }
    var Wn,
        Ci = (function (e) {
            return typeof MSApp < 'u' && MSApp.execUnsafeLocalFunction
                ? function (n, o, s, f) {
                      MSApp.execUnsafeLocalFunction(function () {
                          return e(n, o, s, f)
                      })
                  }
                : e
        })(function (e, n) {
            if (
                e.namespaceURI !== 'http://www.w3.org/2000/svg' ||
                'innerHTML' in e
            )
                e.innerHTML = n
            else {
                for (
                    Wn = Wn || document.createElement('div'),
                        Wn.innerHTML =
                            '<svg>' + n.valueOf().toString() + '</svg>',
                        n = Wn.firstChild;
                    e.firstChild;
                )
                    e.removeChild(e.firstChild)
                for (; n.firstChild; ) e.appendChild(n.firstChild)
            }
        })
    function nn(e, n) {
        if (n) {
            var o = e.firstChild
            if (o && o === e.lastChild && o.nodeType === 3) {
                o.nodeValue = n
                return
            }
        }
        e.textContent = n
    }
    var Yn = {
            animationIterationCount: !0,
            aspectRatio: !0,
            borderImageOutset: !0,
            borderImageSlice: !0,
            borderImageWidth: !0,
            boxFlex: !0,
            boxFlexGroup: !0,
            boxOrdinalGroup: !0,
            columnCount: !0,
            columns: !0,
            flex: !0,
            flexGrow: !0,
            flexPositive: !0,
            flexShrink: !0,
            flexNegative: !0,
            flexOrder: !0,
            gridArea: !0,
            gridRow: !0,
            gridRowEnd: !0,
            gridRowSpan: !0,
            gridRowStart: !0,
            gridColumn: !0,
            gridColumnEnd: !0,
            gridColumnSpan: !0,
            gridColumnStart: !0,
            fontWeight: !0,
            lineClamp: !0,
            lineHeight: !0,
            opacity: !0,
            order: !0,
            orphans: !0,
            tabSize: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0,
            fillOpacity: !0,
            floodOpacity: !0,
            stopOpacity: !0,
            strokeDasharray: !0,
            strokeDashoffset: !0,
            strokeMiterlimit: !0,
            strokeOpacity: !0,
            strokeWidth: !0,
        },
        Ml = ['Webkit', 'ms', 'Moz', 'O']
    Object.keys(Yn).forEach(function (e) {
        Ml.forEach(function (n) {
            ;((n = n + e.charAt(0).toUpperCase() + e.substring(1)),
                (Yn[n] = Yn[e]))
        })
    })
    function Ni(e, n, o) {
        return n == null || typeof n == 'boolean' || n === ''
            ? ''
            : o ||
                typeof n != 'number' ||
                n === 0 ||
                (Yn.hasOwnProperty(e) && Yn[e])
              ? ('' + n).trim()
              : n + 'px'
    }
    function Mi(e, n) {
        e = e.style
        for (var o in n)
            if (n.hasOwnProperty(o)) {
                var s = o.indexOf('--') === 0,
                    f = Ni(o, n[o], s)
                ;(o === 'float' && (o = 'cssFloat'),
                    s ? e.setProperty(o, f) : (e[o] = f))
            }
    }
    var Pl = j(
        {
            menuitem: !0,
        },
        {
            area: !0,
            base: !0,
            br: !0,
            col: !0,
            embed: !0,
            hr: !0,
            img: !0,
            input: !0,
            keygen: !0,
            link: !0,
            meta: !0,
            param: !0,
            source: !0,
            track: !0,
            wbr: !0,
        }
    )
    function ao(e, n) {
        if (n) {
            if (
                Pl[e] &&
                (n.children != null || n.dangerouslySetInnerHTML != null)
            )
                throw Error(i(137, e))
            if (n.dangerouslySetInnerHTML != null) {
                if (n.children != null) throw Error(i(60))
                if (
                    typeof n.dangerouslySetInnerHTML != 'object' ||
                    !('__html' in n.dangerouslySetInnerHTML)
                )
                    throw Error(i(61))
            }
            if (n.style != null && typeof n.style != 'object')
                throw Error(i(62))
        }
    }
    function co(e, n) {
        if (e.indexOf('-') === -1) return typeof n.is == 'string'
        switch (e) {
            case 'annotation-xml':
            case 'color-profile':
            case 'font-face':
            case 'font-face-src':
            case 'font-face-uri':
            case 'font-face-format':
            case 'font-face-name':
            case 'missing-glyph':
                return !1
            default:
                return !0
        }
    }
    var fo = null
    function ho(e) {
        return (
            (e = e.target || e.srcElement || window),
            e.correspondingUseElement && (e = e.correspondingUseElement),
            e.nodeType === 3 ? e.parentNode : e
        )
    }
    var po = null,
        yn = null,
        vn = null
    function Pi(e) {
        if ((e = Ho(e))) {
            if (typeof po != 'function') throw Error(i(280))
            var n = e.stateNode
            n && ((n = os(n)), po(e.stateNode, e.type, n))
        }
    }
    function zi(e) {
        yn ? (vn ? vn.push(e) : (vn = [e])) : (yn = e)
    }
    function Li() {
        if (yn) {
            var e = yn,
                n = vn
            if (((vn = yn = null), Pi(e), n))
                for (e = 0; e < n.length; e++) Pi(n[e])
        }
    }
    function Ii(e, n) {
        return e(n)
    }
    function Ti() {}
    var go = !1
    function Ri(e, n, o) {
        if (go) return e(n, o)
        go = !0
        try {
            return Ii(e, n, o)
        } finally {
            ;((go = !1), (yn !== null || vn !== null) && (Ti(), Li()))
        }
    }
    function bn(e, n) {
        var o = e.stateNode
        if (o === null) return null
        var s = os(o)
        if (s === null) return null
        o = s[n]
        e: switch (n) {
            case 'onClick':
            case 'onClickCapture':
            case 'onDoubleClick':
            case 'onDoubleClickCapture':
            case 'onMouseDown':
            case 'onMouseDownCapture':
            case 'onMouseMove':
            case 'onMouseMoveCapture':
            case 'onMouseUp':
            case 'onMouseUpCapture':
            case 'onMouseEnter':
                ;((s = !s.disabled) ||
                    ((e = e.type),
                    (s = !(
                        e === 'button' ||
                        e === 'input' ||
                        e === 'select' ||
                        e === 'textarea'
                    ))),
                    (e = !s))
                break e
            default:
                e = !1
        }
        if (e) return null
        if (o && typeof o != 'function') throw Error(i(231, n, typeof o))
        return o
    }
    var mo = !1
    if (d)
        try {
            var Xn = {}
            ;(Object.defineProperty(Xn, 'passive', {
                get: function () {
                    mo = !0
                },
            }),
                window.addEventListener('test', Xn, Xn),
                window.removeEventListener('test', Xn, Xn))
        } catch {
            mo = !1
        }
    function zl(e, n, o, s, f, h, x, P, D) {
        var G = Array.prototype.slice.call(arguments, 3)
        try {
            n.apply(o, G)
        } catch (oe) {
            this.onError(oe)
        }
    }
    var Qn = !1,
        xr = null,
        wr = !1,
        yo = null,
        Ll = {
            onError: function (e) {
                ;((Qn = !0), (xr = e))
            },
        }
    function Il(e, n, o, s, f, h, x, P, D) {
        ;((Qn = !1), (xr = null), zl.apply(Ll, arguments))
    }
    function Tl(e, n, o, s, f, h, x, P, D) {
        if ((Il.apply(this, arguments), Qn)) {
            if (Qn) {
                var G = xr
                ;((Qn = !1), (xr = null))
            } else throw Error(i(198))
            wr || ((wr = !0), (yo = G))
        }
    }
    function Bt(e) {
        var n = e,
            o = e
        if (e.alternate) for (; n.return; ) n = n.return
        else {
            e = n
            do
                ((n = e),
                    (n.flags & 4098) !== 0 && (o = n.return),
                    (e = n.return))
            while (e)
        }
        return n.tag === 3 ? o : null
    }
    function vo(e) {
        if (e.tag === 13) {
            var n = e.memoizedState
            if (
                (n === null &&
                    ((e = e.alternate), e !== null && (n = e.memoizedState)),
                n !== null)
            )
                return n.dehydrated
        }
        return null
    }
    function xo(e) {
        if (Bt(e) !== e) throw Error(i(188))
    }
    function Rl(e) {
        var n = e.alternate
        if (!n) {
            if (((n = Bt(e)), n === null)) throw Error(i(188))
            return n !== e ? null : e
        }
        for (var o = e, s = n; ; ) {
            var f = o.return
            if (f === null) break
            var h = f.alternate
            if (h === null) {
                if (((s = f.return), s !== null)) {
                    o = s
                    continue
                }
                break
            }
            if (f.child === h.child) {
                for (h = f.child; h; ) {
                    if (h === o) return (xo(f), e)
                    if (h === s) return (xo(f), n)
                    h = h.sibling
                }
                throw Error(i(188))
            }
            if (o.return !== s.return) ((o = f), (s = h))
            else {
                for (var x = !1, P = f.child; P; ) {
                    if (P === o) {
                        ;((x = !0), (o = f), (s = h))
                        break
                    }
                    if (P === s) {
                        ;((x = !0), (s = f), (o = h))
                        break
                    }
                    P = P.sibling
                }
                if (!x) {
                    for (P = h.child; P; ) {
                        if (P === o) {
                            ;((x = !0), (o = h), (s = f))
                            break
                        }
                        if (P === s) {
                            ;((x = !0), (s = h), (o = f))
                            break
                        }
                        P = P.sibling
                    }
                    if (!x) throw Error(i(189))
                }
            }
            if (o.alternate !== s) throw Error(i(190))
        }
        if (o.tag !== 3) throw Error(i(188))
        return o.stateNode.current === o ? e : n
    }
    function Di(e) {
        return ((e = Rl(e)), e !== null ? Ai(e) : null)
    }
    function Ai(e) {
        if (e.tag === 5 || e.tag === 6) return e
        for (e = e.child; e !== null; ) {
            var n = Ai(e)
            if (n !== null) return n
            e = e.sibling
        }
        return null
    }
    var $i = r.unstable_scheduleCallback,
        Oi = r.unstable_cancelCallback,
        Dl = r.unstable_shouldYield,
        Fi = r.unstable_requestPaint,
        Fe = r.unstable_now,
        Al = r.unstable_getCurrentPriorityLevel,
        wo = r.unstable_ImmediatePriority,
        Hi = r.unstable_UserBlockingPriority,
        Sr = r.unstable_NormalPriority,
        $l = r.unstable_LowPriority,
        ji = r.unstable_IdlePriority,
        Kn = null,
        Et = null
    function Ol(e) {
        if (Et && typeof Et.onCommitFiberRoot == 'function')
            try {
                Et.onCommitFiberRoot(
                    Kn,
                    e,
                    void 0,
                    (e.current.flags & 128) === 128
                )
            } catch {}
    }
    var gt = Math.clz32 ? Math.clz32 : jl,
        Fl = Math.log,
        Hl = Math.LN2
    function jl(e) {
        return ((e >>>= 0), e === 0 ? 32 : (31 - ((Fl(e) / Hl) | 0)) | 0)
    }
    var _r = 64,
        Er = 4194304
    function Ut(e) {
        switch (e & -e) {
            case 1:
                return 1
            case 2:
                return 2
            case 4:
                return 4
            case 8:
                return 8
            case 16:
                return 16
            case 32:
                return 32
            case 64:
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
                return e & 4194240
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
            case 67108864:
                return e & 130023424
            case 134217728:
                return 134217728
            case 268435456:
                return 268435456
            case 536870912:
                return 536870912
            case 1073741824:
                return 1073741824
            default:
                return e
        }
    }
    function kr(e, n) {
        var o = e.pendingLanes
        if (o === 0) return 0
        var s = 0,
            f = e.suspendedLanes,
            h = e.pingedLanes,
            x = o & 268435455
        if (x !== 0) {
            var P = x & ~f
            P !== 0 ? (s = Ut(P)) : ((h &= x), h !== 0 && (s = Ut(h)))
        } else ((x = o & ~f), x !== 0 ? (s = Ut(x)) : h !== 0 && (s = Ut(h)))
        if (s === 0) return 0
        if (
            n !== 0 &&
            n !== s &&
            (n & f) === 0 &&
            ((f = s & -s),
            (h = n & -n),
            f >= h || (f === 16 && (h & 4194240) !== 0))
        )
            return n
        if (((s & 4) !== 0 && (s |= o & 16), (n = e.entangledLanes), n !== 0))
            for (e = e.entanglements, n &= s; 0 < n; )
                ((o = 31 - gt(n)), (f = 1 << o), (s |= e[o]), (n &= ~f))
        return s
    }
    function Vi(e, n) {
        switch (e) {
            case 1:
            case 2:
            case 4:
                return n + 250
            case 8:
            case 16:
            case 32:
            case 64:
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
                return n + 5e3
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
            case 67108864:
                return -1
            case 134217728:
            case 268435456:
            case 536870912:
            case 1073741824:
                return -1
            default:
                return -1
        }
    }
    function Vl(e, n) {
        for (
            var o = e.suspendedLanes,
                s = e.pingedLanes,
                f = e.expirationTimes,
                h = e.pendingLanes;
            0 < h;
        ) {
            var x = 31 - gt(h),
                P = 1 << x,
                D = f[x]
            ;(D === -1
                ? ((P & o) === 0 || (P & s) !== 0) && (f[x] = Vi(P, n))
                : D <= n && (e.expiredLanes |= P),
                (h &= ~P))
        }
    }
    function So(e) {
        return (
            (e = e.pendingLanes & -1073741825),
            e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
        )
    }
    function Cr() {
        var e = _r
        return ((_r <<= 1), (_r & 4194240) === 0 && (_r = 64), e)
    }
    function _o(e) {
        for (var n = [], o = 0; 31 > o; o++) n.push(e)
        return n
    }
    function Gn(e, n, o) {
        ;((e.pendingLanes |= n),
            n !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
            (e = e.eventTimes),
            (n = 31 - gt(n)),
            (e[n] = o))
    }
    function Bi(e, n) {
        var o = e.pendingLanes & ~n
        ;((e.pendingLanes = n),
            (e.suspendedLanes = 0),
            (e.pingedLanes = 0),
            (e.expiredLanes &= n),
            (e.mutableReadLanes &= n),
            (e.entangledLanes &= n),
            (n = e.entanglements))
        var s = e.eventTimes
        for (e = e.expirationTimes; 0 < o; ) {
            var f = 31 - gt(o),
                h = 1 << f
            ;((n[f] = 0), (s[f] = -1), (e[f] = -1), (o &= ~h))
        }
    }
    function Bl(e, n) {
        var o = (e.entangledLanes |= n)
        for (e = e.entanglements; o; ) {
            var s = 31 - gt(o),
                f = 1 << s
            ;((f & n) | (e[s] & n) && (e[s] |= n), (o &= ~f))
        }
    }
    var Le = 0
    function mc(e) {
        return (
            (e &= -e),
            1 < e ? (4 < e ? ((e & 268435455) !== 0 ? 16 : 536870912) : 4) : 1
        )
    }
    var yc,
        Ul,
        vc,
        xc,
        wc,
        Wl = !1,
        Ui = [],
        xn = null,
        wn = null,
        Sn = null,
        Eo = new Map(),
        ko = new Map(),
        _n = [],
        sm =
            'mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit'.split(
                ' '
            )
    function Sc(e, n) {
        switch (e) {
            case 'focusin':
            case 'focusout':
                xn = null
                break
            case 'dragenter':
            case 'dragleave':
                wn = null
                break
            case 'mouseover':
            case 'mouseout':
                Sn = null
                break
            case 'pointerover':
            case 'pointerout':
                Eo.delete(n.pointerId)
                break
            case 'gotpointercapture':
            case 'lostpointercapture':
                ko.delete(n.pointerId)
        }
    }
    function Co(e, n, o, s, f, h) {
        return e === null || e.nativeEvent !== h
            ? ((e = {
                  blockedOn: n,
                  domEventName: o,
                  eventSystemFlags: s,
                  nativeEvent: h,
                  targetContainers: [f],
              }),
              n !== null && ((n = Ho(n)), n !== null && Ul(n)),
              e)
            : ((e.eventSystemFlags |= s),
              (n = e.targetContainers),
              f !== null && n.indexOf(f) === -1 && n.push(f),
              e)
    }
    function lm(e, n, o, s, f) {
        switch (n) {
            case 'focusin':
                return ((xn = Co(xn, e, n, o, s, f)), !0)
            case 'dragenter':
                return ((wn = Co(wn, e, n, o, s, f)), !0)
            case 'mouseover':
                return ((Sn = Co(Sn, e, n, o, s, f)), !0)
            case 'pointerover':
                var h = f.pointerId
                return (Eo.set(h, Co(Eo.get(h) || null, e, n, o, s, f)), !0)
            case 'gotpointercapture':
                return (
                    (h = f.pointerId),
                    ko.set(h, Co(ko.get(h) || null, e, n, o, s, f)),
                    !0
                )
        }
        return !1
    }
    function _c(e) {
        var n = qn(e.target)
        if (n !== null) {
            var o = Bt(n)
            if (o !== null) {
                if (((n = o.tag), n === 13)) {
                    if (((n = vo(o)), n !== null)) {
                        ;((e.blockedOn = n),
                            wc(e.priority, function () {
                                vc(o)
                            }))
                        return
                    }
                } else if (
                    n === 3 &&
                    o.stateNode.current.memoizedState.isDehydrated
                ) {
                    e.blockedOn = o.tag === 3 ? o.stateNode.containerInfo : null
                    return
                }
            }
        }
        e.blockedOn = null
    }
    function Wi(e) {
        if (e.blockedOn !== null) return !1
        for (var n = e.targetContainers; 0 < n.length; ) {
            var o = bl(e.domEventName, e.eventSystemFlags, n[0], e.nativeEvent)
            if (o === null) {
                o = e.nativeEvent
                var s = new o.constructor(o.type, o)
                ;((fo = s), o.target.dispatchEvent(s), (fo = null))
            } else
                return ((n = Ho(o)), n !== null && Ul(n), (e.blockedOn = o), !1)
            n.shift()
        }
        return !0
    }
    function Ec(e, n, o) {
        Wi(e) && o.delete(n)
    }
    function um() {
        ;((Wl = !1),
            xn !== null && Wi(xn) && (xn = null),
            wn !== null && Wi(wn) && (wn = null),
            Sn !== null && Wi(Sn) && (Sn = null),
            Eo.forEach(Ec),
            ko.forEach(Ec))
    }
    function No(e, n) {
        e.blockedOn === n &&
            ((e.blockedOn = null),
            Wl ||
                ((Wl = !0),
                r.unstable_scheduleCallback(r.unstable_NormalPriority, um)))
    }
    function Mo(e) {
        function n(f) {
            return No(f, e)
        }
        if (0 < Ui.length) {
            No(Ui[0], e)
            for (var o = 1; o < Ui.length; o++) {
                var s = Ui[o]
                s.blockedOn === e && (s.blockedOn = null)
            }
        }
        for (
            xn !== null && No(xn, e),
                wn !== null && No(wn, e),
                Sn !== null && No(Sn, e),
                Eo.forEach(n),
                ko.forEach(n),
                o = 0;
            o < _n.length;
            o++
        )
            ((s = _n[o]), s.blockedOn === e && (s.blockedOn = null))
        for (; 0 < _n.length && ((o = _n[0]), o.blockedOn === null); )
            (_c(o), o.blockedOn === null && _n.shift())
    }
    var Nr = N.ReactCurrentBatchConfig,
        Yi = !0
    function am(e, n, o, s) {
        var f = Le,
            h = Nr.transition
        Nr.transition = null
        try {
            ;((Le = 1), Yl(e, n, o, s))
        } finally {
            ;((Le = f), (Nr.transition = h))
        }
    }
    function cm(e, n, o, s) {
        var f = Le,
            h = Nr.transition
        Nr.transition = null
        try {
            ;((Le = 4), Yl(e, n, o, s))
        } finally {
            ;((Le = f), (Nr.transition = h))
        }
    }
    function Yl(e, n, o, s) {
        if (Yi) {
            var f = bl(e, n, o, s)
            if (f === null) (au(e, n, s, bi, o), Sc(e, s))
            else if (lm(f, e, n, o, s)) s.stopPropagation()
            else if ((Sc(e, s), n & 4 && -1 < sm.indexOf(e))) {
                for (; f !== null; ) {
                    var h = Ho(f)
                    if (
                        (h !== null && yc(h),
                        (h = bl(e, n, o, s)),
                        h === null && au(e, n, s, bi, o),
                        h === f)
                    )
                        break
                    f = h
                }
                f !== null && s.stopPropagation()
            } else au(e, n, s, null, o)
        }
    }
    var bi = null
    function bl(e, n, o, s) {
        if (((bi = null), (e = ho(s)), (e = qn(e)), e !== null))
            if (((n = Bt(e)), n === null)) e = null
            else if (((o = n.tag), o === 13)) {
                if (((e = vo(n)), e !== null)) return e
                e = null
            } else if (o === 3) {
                if (n.stateNode.current.memoizedState.isDehydrated)
                    return n.tag === 3 ? n.stateNode.containerInfo : null
                e = null
            } else n !== e && (e = null)
        return ((bi = e), null)
    }
    function kc(e) {
        switch (e) {
            case 'cancel':
            case 'click':
            case 'close':
            case 'contextmenu':
            case 'copy':
            case 'cut':
            case 'auxclick':
            case 'dblclick':
            case 'dragend':
            case 'dragstart':
            case 'drop':
            case 'focusin':
            case 'focusout':
            case 'input':
            case 'invalid':
            case 'keydown':
            case 'keypress':
            case 'keyup':
            case 'mousedown':
            case 'mouseup':
            case 'paste':
            case 'pause':
            case 'play':
            case 'pointercancel':
            case 'pointerdown':
            case 'pointerup':
            case 'ratechange':
            case 'reset':
            case 'resize':
            case 'seeked':
            case 'submit':
            case 'touchcancel':
            case 'touchend':
            case 'touchstart':
            case 'volumechange':
            case 'change':
            case 'selectionchange':
            case 'textInput':
            case 'compositionstart':
            case 'compositionend':
            case 'compositionupdate':
            case 'beforeblur':
            case 'afterblur':
            case 'beforeinput':
            case 'blur':
            case 'fullscreenchange':
            case 'focus':
            case 'hashchange':
            case 'popstate':
            case 'select':
            case 'selectstart':
                return 1
            case 'drag':
            case 'dragenter':
            case 'dragexit':
            case 'dragleave':
            case 'dragover':
            case 'mousemove':
            case 'mouseout':
            case 'mouseover':
            case 'pointermove':
            case 'pointerout':
            case 'pointerover':
            case 'scroll':
            case 'toggle':
            case 'touchmove':
            case 'wheel':
            case 'mouseenter':
            case 'mouseleave':
            case 'pointerenter':
            case 'pointerleave':
                return 4
            case 'message':
                switch (Al()) {
                    case wo:
                        return 1
                    case Hi:
                        return 4
                    case Sr:
                    case $l:
                        return 16
                    case ji:
                        return 536870912
                    default:
                        return 16
                }
            default:
                return 16
        }
    }
    var En = null,
        Xl = null,
        Xi = null
    function Cc() {
        if (Xi) return Xi
        var e,
            n = Xl,
            o = n.length,
            s,
            f = 'value' in En ? En.value : En.textContent,
            h = f.length
        for (e = 0; e < o && n[e] === f[e]; e++);
        var x = o - e
        for (s = 1; s <= x && n[o - s] === f[h - s]; s++);
        return (Xi = f.slice(e, 1 < s ? 1 - s : void 0))
    }
    function Qi(e) {
        var n = e.keyCode
        return (
            'charCode' in e
                ? ((e = e.charCode), e === 0 && n === 13 && (e = 13))
                : (e = n),
            e === 10 && (e = 13),
            32 <= e || e === 13 ? e : 0
        )
    }
    function Ki() {
        return !0
    }
    function Nc() {
        return !1
    }
    function mt(e) {
        function n(o, s, f, h, x) {
            ;((this._reactName = o),
                (this._targetInst = f),
                (this.type = s),
                (this.nativeEvent = h),
                (this.target = x),
                (this.currentTarget = null))
            for (var P in e)
                e.hasOwnProperty(P) && ((o = e[P]), (this[P] = o ? o(h) : h[P]))
            return (
                (this.isDefaultPrevented = (
                    h.defaultPrevented != null
                        ? h.defaultPrevented
                        : h.returnValue === !1
                )
                    ? Ki
                    : Nc),
                (this.isPropagationStopped = Nc),
                this
            )
        }
        return (
            j(n.prototype, {
                preventDefault: function () {
                    this.defaultPrevented = !0
                    var o = this.nativeEvent
                    o &&
                        (o.preventDefault
                            ? o.preventDefault()
                            : typeof o.returnValue != 'unknown' &&
                              (o.returnValue = !1),
                        (this.isDefaultPrevented = Ki))
                },
                stopPropagation: function () {
                    var o = this.nativeEvent
                    o &&
                        (o.stopPropagation
                            ? o.stopPropagation()
                            : typeof o.cancelBubble != 'unknown' &&
                              (o.cancelBubble = !0),
                        (this.isPropagationStopped = Ki))
                },
                persist: function () {},
                isPersistent: Ki,
            }),
            n
        )
    }
    var Mr = {
            eventPhase: 0,
            bubbles: 0,
            cancelable: 0,
            timeStamp: function (e) {
                return e.timeStamp || Date.now()
            },
            defaultPrevented: 0,
            isTrusted: 0,
        },
        Ql = mt(Mr),
        Po = j({}, Mr, {
            view: 0,
            detail: 0,
        }),
        fm = mt(Po),
        Kl,
        Gl,
        zo,
        Gi = j({}, Po, {
            screenX: 0,
            screenY: 0,
            clientX: 0,
            clientY: 0,
            pageX: 0,
            pageY: 0,
            ctrlKey: 0,
            shiftKey: 0,
            altKey: 0,
            metaKey: 0,
            getModifierState: Zl,
            button: 0,
            buttons: 0,
            relatedTarget: function (e) {
                return e.relatedTarget === void 0
                    ? e.fromElement === e.srcElement
                        ? e.toElement
                        : e.fromElement
                    : e.relatedTarget
            },
            movementX: function (e) {
                return 'movementX' in e
                    ? e.movementX
                    : (e !== zo &&
                          (zo && e.type === 'mousemove'
                              ? ((Kl = e.screenX - zo.screenX),
                                (Gl = e.screenY - zo.screenY))
                              : (Gl = Kl = 0),
                          (zo = e)),
                      Kl)
            },
            movementY: function (e) {
                return 'movementY' in e ? e.movementY : Gl
            },
        }),
        Mc = mt(Gi),
        dm = j({}, Gi, {
            dataTransfer: 0,
        }),
        hm = mt(dm),
        pm = j({}, Po, {
            relatedTarget: 0,
        }),
        ql = mt(pm),
        gm = j({}, Mr, {
            animationName: 0,
            elapsedTime: 0,
            pseudoElement: 0,
        }),
        mm = mt(gm),
        ym = j({}, Mr, {
            clipboardData: function (e) {
                return 'clipboardData' in e
                    ? e.clipboardData
                    : window.clipboardData
            },
        }),
        vm = mt(ym),
        xm = j({}, Mr, {
            data: 0,
        }),
        Pc = mt(xm),
        wm = {
            Esc: 'Escape',
            Spacebar: ' ',
            Left: 'ArrowLeft',
            Up: 'ArrowUp',
            Right: 'ArrowRight',
            Down: 'ArrowDown',
            Del: 'Delete',
            Win: 'OS',
            Menu: 'ContextMenu',
            Apps: 'ContextMenu',
            Scroll: 'ScrollLock',
            MozPrintableKey: 'Unidentified',
        },
        Sm = {
            8: 'Backspace',
            9: 'Tab',
            12: 'Clear',
            13: 'Enter',
            16: 'Shift',
            17: 'Control',
            18: 'Alt',
            19: 'Pause',
            20: 'CapsLock',
            27: 'Escape',
            32: ' ',
            33: 'PageUp',
            34: 'PageDown',
            35: 'End',
            36: 'Home',
            37: 'ArrowLeft',
            38: 'ArrowUp',
            39: 'ArrowRight',
            40: 'ArrowDown',
            45: 'Insert',
            46: 'Delete',
            112: 'F1',
            113: 'F2',
            114: 'F3',
            115: 'F4',
            116: 'F5',
            117: 'F6',
            118: 'F7',
            119: 'F8',
            120: 'F9',
            121: 'F10',
            122: 'F11',
            123: 'F12',
            144: 'NumLock',
            145: 'ScrollLock',
            224: 'Meta',
        },
        _m = {
            Alt: 'altKey',
            Control: 'ctrlKey',
            Meta: 'metaKey',
            Shift: 'shiftKey',
        }
    function Em(e) {
        var n = this.nativeEvent
        return n.getModifierState
            ? n.getModifierState(e)
            : (e = _m[e])
              ? !!n[e]
              : !1
    }
    function Zl() {
        return Em
    }
    var km = j({}, Po, {
            key: function (e) {
                if (e.key) {
                    var n = wm[e.key] || e.key
                    if (n !== 'Unidentified') return n
                }
                return e.type === 'keypress'
                    ? ((e = Qi(e)), e === 13 ? 'Enter' : String.fromCharCode(e))
                    : e.type === 'keydown' || e.type === 'keyup'
                      ? Sm[e.keyCode] || 'Unidentified'
                      : ''
            },
            code: 0,
            location: 0,
            ctrlKey: 0,
            shiftKey: 0,
            altKey: 0,
            metaKey: 0,
            repeat: 0,
            locale: 0,
            getModifierState: Zl,
            charCode: function (e) {
                return e.type === 'keypress' ? Qi(e) : 0
            },
            keyCode: function (e) {
                return e.type === 'keydown' || e.type === 'keyup'
                    ? e.keyCode
                    : 0
            },
            which: function (e) {
                return e.type === 'keypress'
                    ? Qi(e)
                    : e.type === 'keydown' || e.type === 'keyup'
                      ? e.keyCode
                      : 0
            },
        }),
        Cm = mt(km),
        Nm = j({}, Gi, {
            pointerId: 0,
            width: 0,
            height: 0,
            pressure: 0,
            tangentialPressure: 0,
            tiltX: 0,
            tiltY: 0,
            twist: 0,
            pointerType: 0,
            isPrimary: 0,
        }),
        zc = mt(Nm),
        Mm = j({}, Po, {
            touches: 0,
            targetTouches: 0,
            changedTouches: 0,
            altKey: 0,
            metaKey: 0,
            ctrlKey: 0,
            shiftKey: 0,
            getModifierState: Zl,
        }),
        Pm = mt(Mm),
        zm = j({}, Mr, {
            propertyName: 0,
            elapsedTime: 0,
            pseudoElement: 0,
        }),
        Lm = mt(zm),
        Im = j({}, Gi, {
            deltaX: function (e) {
                return 'deltaX' in e
                    ? e.deltaX
                    : 'wheelDeltaX' in e
                      ? -e.wheelDeltaX
                      : 0
            },
            deltaY: function (e) {
                return 'deltaY' in e
                    ? e.deltaY
                    : 'wheelDeltaY' in e
                      ? -e.wheelDeltaY
                      : 'wheelDelta' in e
                        ? -e.wheelDelta
                        : 0
            },
            deltaZ: 0,
            deltaMode: 0,
        }),
        Tm = mt(Im),
        Rm = [9, 13, 27, 32],
        Jl = d && 'CompositionEvent' in window,
        Lo = null
    d && 'documentMode' in document && (Lo = document.documentMode)
    var Dm = d && 'TextEvent' in window && !Lo,
        Lc = d && (!Jl || (Lo && 8 < Lo && 11 >= Lo)),
        Ic = ' ',
        Tc = !1
    function Rc(e, n) {
        switch (e) {
            case 'keyup':
                return Rm.indexOf(n.keyCode) !== -1
            case 'keydown':
                return n.keyCode !== 229
            case 'keypress':
            case 'mousedown':
            case 'focusout':
                return !0
            default:
                return !1
        }
    }
    function Dc(e) {
        return (
            (e = e.detail),
            typeof e == 'object' && 'data' in e ? e.data : null
        )
    }
    var Pr = !1
    function Am(e, n) {
        switch (e) {
            case 'compositionend':
                return Dc(n)
            case 'keypress':
                return n.which !== 32 ? null : ((Tc = !0), Ic)
            case 'textInput':
                return ((e = n.data), e === Ic && Tc ? null : e)
            default:
                return null
        }
    }
    function $m(e, n) {
        if (Pr)
            return e === 'compositionend' || (!Jl && Rc(e, n))
                ? ((e = Cc()), (Xi = Xl = En = null), (Pr = !1), e)
                : null
        switch (e) {
            case 'paste':
                return null
            case 'keypress':
                if (
                    !(n.ctrlKey || n.altKey || n.metaKey) ||
                    (n.ctrlKey && n.altKey)
                ) {
                    if (n.char && 1 < n.char.length) return n.char
                    if (n.which) return String.fromCharCode(n.which)
                }
                return null
            case 'compositionend':
                return Lc && n.locale !== 'ko' ? null : n.data
            default:
                return null
        }
    }
    var Om = {
        color: !0,
        date: !0,
        datetime: !0,
        'datetime-local': !0,
        email: !0,
        month: !0,
        number: !0,
        password: !0,
        range: !0,
        search: !0,
        tel: !0,
        text: !0,
        time: !0,
        url: !0,
        week: !0,
    }
    function Ac(e) {
        var n = e && e.nodeName && e.nodeName.toLowerCase()
        return n === 'input' ? !!Om[e.type] : n === 'textarea'
    }
    function $c(e, n, o, s) {
        ;(zi(s),
            (n = ts(n, 'onChange')),
            0 < n.length &&
                ((o = new Ql('onChange', 'change', null, o, s)),
                e.push({
                    event: o,
                    listeners: n,
                })))
    }
    var Io = null,
        To = null
    function Fm(e) {
        ef(e, 0)
    }
    function qi(e) {
        var n = Rr(e)
        if (Se(n)) return e
    }
    function Hm(e, n) {
        if (e === 'change') return n
    }
    var Oc = !1
    if (d) {
        var eu
        if (d) {
            var tu = 'oninput' in document
            if (!tu) {
                var Fc = document.createElement('div')
                ;(Fc.setAttribute('oninput', 'return;'),
                    (tu = typeof Fc.oninput == 'function'))
            }
            eu = tu
        } else eu = !1
        Oc = eu && (!document.documentMode || 9 < document.documentMode)
    }
    function Hc() {
        Io && (Io.detachEvent('onpropertychange', jc), (To = Io = null))
    }
    function jc(e) {
        if (e.propertyName === 'value' && qi(To)) {
            var n = []
            ;($c(n, To, e, ho(e)), Ri(Fm, n))
        }
    }
    function jm(e, n, o) {
        e === 'focusin'
            ? (Hc(), (Io = n), (To = o), Io.attachEvent('onpropertychange', jc))
            : e === 'focusout' && Hc()
    }
    function Vm(e) {
        if (e === 'selectionchange' || e === 'keyup' || e === 'keydown')
            return qi(To)
    }
    function Bm(e, n) {
        if (e === 'click') return qi(n)
    }
    function Um(e, n) {
        if (e === 'input' || e === 'change') return qi(n)
    }
    function Wm(e, n) {
        return (e === n && (e !== 0 || 1 / e === 1 / n)) || (e !== e && n !== n)
    }
    var It = typeof Object.is == 'function' ? Object.is : Wm
    function Ro(e, n) {
        if (It(e, n)) return !0
        if (
            typeof e != 'object' ||
            e === null ||
            typeof n != 'object' ||
            n === null
        )
            return !1
        var o = Object.keys(e),
            s = Object.keys(n)
        if (o.length !== s.length) return !1
        for (s = 0; s < o.length; s++) {
            var f = o[s]
            if (!p.call(n, f) || !It(e[f], n[f])) return !1
        }
        return !0
    }
    function Vc(e) {
        for (; e && e.firstChild; ) e = e.firstChild
        return e
    }
    function Bc(e, n) {
        var o = Vc(e)
        e = 0
        for (var s; o; ) {
            if (o.nodeType === 3) {
                if (((s = e + o.textContent.length), e <= n && s >= n))
                    return {
                        node: o,
                        offset: n - e,
                    }
                e = s
            }
            e: {
                for (; o; ) {
                    if (o.nextSibling) {
                        o = o.nextSibling
                        break e
                    }
                    o = o.parentNode
                }
                o = void 0
            }
            o = Vc(o)
        }
    }
    function Uc(e, n) {
        return e && n
            ? e === n
                ? !0
                : e && e.nodeType === 3
                  ? !1
                  : n && n.nodeType === 3
                    ? Uc(e, n.parentNode)
                    : 'contains' in e
                      ? e.contains(n)
                      : e.compareDocumentPosition
                        ? !!(e.compareDocumentPosition(n) & 16)
                        : !1
            : !1
    }
    function Wc() {
        for (var e = window, n = ye(); n instanceof e.HTMLIFrameElement; ) {
            try {
                var o = typeof n.contentWindow.location.href == 'string'
            } catch {
                o = !1
            }
            if (o) e = n.contentWindow
            else break
            n = ye(e.document)
        }
        return n
    }
    function nu(e) {
        var n = e && e.nodeName && e.nodeName.toLowerCase()
        return (
            n &&
            ((n === 'input' &&
                (e.type === 'text' ||
                    e.type === 'search' ||
                    e.type === 'tel' ||
                    e.type === 'url' ||
                    e.type === 'password')) ||
                n === 'textarea' ||
                e.contentEditable === 'true')
        )
    }
    function Ym(e) {
        var n = Wc(),
            o = e.focusedElem,
            s = e.selectionRange
        if (
            n !== o &&
            o &&
            o.ownerDocument &&
            Uc(o.ownerDocument.documentElement, o)
        ) {
            if (s !== null && nu(o)) {
                if (
                    ((n = s.start),
                    (e = s.end),
                    e === void 0 && (e = n),
                    'selectionStart' in o)
                )
                    ((o.selectionStart = n),
                        (o.selectionEnd = Math.min(e, o.value.length)))
                else if (
                    ((e =
                        ((n = o.ownerDocument || document) && n.defaultView) ||
                        window),
                    e.getSelection)
                ) {
                    e = e.getSelection()
                    var f = o.textContent.length,
                        h = Math.min(s.start, f)
                    ;((s = s.end === void 0 ? h : Math.min(s.end, f)),
                        !e.extend && h > s && ((f = s), (s = h), (h = f)),
                        (f = Bc(o, h)))
                    var x = Bc(o, s)
                    f &&
                        x &&
                        (e.rangeCount !== 1 ||
                            e.anchorNode !== f.node ||
                            e.anchorOffset !== f.offset ||
                            e.focusNode !== x.node ||
                            e.focusOffset !== x.offset) &&
                        ((n = n.createRange()),
                        n.setStart(f.node, f.offset),
                        e.removeAllRanges(),
                        h > s
                            ? (e.addRange(n), e.extend(x.node, x.offset))
                            : (n.setEnd(x.node, x.offset), e.addRange(n)))
                }
            }
            for (n = [], e = o; (e = e.parentNode); )
                e.nodeType === 1 &&
                    n.push({
                        element: e,
                        left: e.scrollLeft,
                        top: e.scrollTop,
                    })
            for (
                typeof o.focus == 'function' && o.focus(), o = 0;
                o < n.length;
                o++
            )
                ((e = n[o]),
                    (e.element.scrollLeft = e.left),
                    (e.element.scrollTop = e.top))
        }
    }
    var bm = d && 'documentMode' in document && 11 >= document.documentMode,
        zr = null,
        ru = null,
        Do = null,
        ou = !1
    function Yc(e, n, o) {
        var s =
            o.window === o ? o.document : o.nodeType === 9 ? o : o.ownerDocument
        ou ||
            zr == null ||
            zr !== ye(s) ||
            ((s = zr),
            'selectionStart' in s && nu(s)
                ? (s = {
                      start: s.selectionStart,
                      end: s.selectionEnd,
                  })
                : ((s = (
                      (s.ownerDocument && s.ownerDocument.defaultView) ||
                      window
                  ).getSelection()),
                  (s = {
                      anchorNode: s.anchorNode,
                      anchorOffset: s.anchorOffset,
                      focusNode: s.focusNode,
                      focusOffset: s.focusOffset,
                  })),
            (Do && Ro(Do, s)) ||
                ((Do = s),
                (s = ts(ru, 'onSelect')),
                0 < s.length &&
                    ((n = new Ql('onSelect', 'select', null, n, o)),
                    e.push({
                        event: n,
                        listeners: s,
                    }),
                    (n.target = zr))))
    }
    function Zi(e, n) {
        var o = {}
        return (
            (o[e.toLowerCase()] = n.toLowerCase()),
            (o['Webkit' + e] = 'webkit' + n),
            (o['Moz' + e] = 'moz' + n),
            o
        )
    }
    var Lr = {
            animationend: Zi('Animation', 'AnimationEnd'),
            animationiteration: Zi('Animation', 'AnimationIteration'),
            animationstart: Zi('Animation', 'AnimationStart'),
            transitionend: Zi('Transition', 'TransitionEnd'),
        },
        iu = {},
        bc = {}
    d &&
        ((bc = document.createElement('div').style),
        'AnimationEvent' in window ||
            (delete Lr.animationend.animation,
            delete Lr.animationiteration.animation,
            delete Lr.animationstart.animation),
        'TransitionEvent' in window || delete Lr.transitionend.transition)
    function Ji(e) {
        if (iu[e]) return iu[e]
        if (!Lr[e]) return e
        var n = Lr[e],
            o
        for (o in n) if (n.hasOwnProperty(o) && o in bc) return (iu[e] = n[o])
        return e
    }
    var Xc = Ji('animationend'),
        Qc = Ji('animationiteration'),
        Kc = Ji('animationstart'),
        Gc = Ji('transitionend'),
        qc = new Map(),
        Zc =
            'abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel'.split(
                ' '
            )
    function kn(e, n) {
        ;(qc.set(e, n), a(n, [e]))
    }
    for (var su = 0; su < Zc.length; su++) {
        var lu = Zc[su],
            Xm = lu.toLowerCase(),
            Qm = lu[0].toUpperCase() + lu.slice(1)
        kn(Xm, 'on' + Qm)
    }
    ;(kn(Xc, 'onAnimationEnd'),
        kn(Qc, 'onAnimationIteration'),
        kn(Kc, 'onAnimationStart'),
        kn('dblclick', 'onDoubleClick'),
        kn('focusin', 'onFocus'),
        kn('focusout', 'onBlur'),
        kn(Gc, 'onTransitionEnd'),
        c('onMouseEnter', ['mouseout', 'mouseover']),
        c('onMouseLeave', ['mouseout', 'mouseover']),
        c('onPointerEnter', ['pointerout', 'pointerover']),
        c('onPointerLeave', ['pointerout', 'pointerover']),
        a(
            'onChange',
            'change click focusin focusout input keydown keyup selectionchange'.split(
                ' '
            )
        ),
        a(
            'onSelect',
            'focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange'.split(
                ' '
            )
        ),
        a('onBeforeInput', [
            'compositionend',
            'keypress',
            'textInput',
            'paste',
        ]),
        a(
            'onCompositionEnd',
            'compositionend focusout keydown keypress keyup mousedown'.split(
                ' '
            )
        ),
        a(
            'onCompositionStart',
            'compositionstart focusout keydown keypress keyup mousedown'.split(
                ' '
            )
        ),
        a(
            'onCompositionUpdate',
            'compositionupdate focusout keydown keypress keyup mousedown'.split(
                ' '
            )
        ))
    var Ao =
            'abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting'.split(
                ' '
            ),
        Km = new Set(
            'cancel close invalid load scroll toggle'.split(' ').concat(Ao)
        )
    function Jc(e, n, o) {
        var s = e.type || 'unknown-event'
        ;((e.currentTarget = o), Tl(s, n, void 0, e), (e.currentTarget = null))
    }
    function ef(e, n) {
        n = (n & 4) !== 0
        for (var o = 0; o < e.length; o++) {
            var s = e[o],
                f = s.event
            s = s.listeners
            e: {
                var h = void 0
                if (n)
                    for (var x = s.length - 1; 0 <= x; x--) {
                        var P = s[x],
                            D = P.instance,
                            G = P.currentTarget
                        if (
                            ((P = P.listener),
                            D !== h && f.isPropagationStopped())
                        )
                            break e
                        ;(Jc(f, P, G), (h = D))
                    }
                else
                    for (x = 0; x < s.length; x++) {
                        if (
                            ((P = s[x]),
                            (D = P.instance),
                            (G = P.currentTarget),
                            (P = P.listener),
                            D !== h && f.isPropagationStopped())
                        )
                            break e
                        ;(Jc(f, P, G), (h = D))
                    }
            }
        }
        if (wr) throw ((e = yo), (wr = !1), (yo = null), e)
    }
    function Re(e, n) {
        var o = n[gu]
        o === void 0 && (o = n[gu] = new Set())
        var s = e + '__bubble'
        o.has(s) || (tf(n, e, 2, !1), o.add(s))
    }
    function uu(e, n, o) {
        var s = 0
        ;(n && (s |= 4), tf(o, e, s, n))
    }
    var es = '_reactListening' + Math.random().toString(36).slice(2)
    function $o(e) {
        if (!e[es]) {
            ;((e[es] = !0),
                l.forEach(function (o) {
                    o !== 'selectionchange' &&
                        (Km.has(o) || uu(o, !1, e), uu(o, !0, e))
                }))
            var n = e.nodeType === 9 ? e : e.ownerDocument
            n === null || n[es] || ((n[es] = !0), uu('selectionchange', !1, n))
        }
    }
    function tf(e, n, o, s) {
        switch (kc(n)) {
            case 1:
                var f = am
                break
            case 4:
                f = cm
                break
            default:
                f = Yl
        }
        ;((o = f.bind(null, n, o, e)),
            (f = void 0),
            !mo ||
                (n !== 'touchstart' && n !== 'touchmove' && n !== 'wheel') ||
                (f = !0),
            s
                ? f !== void 0
                    ? e.addEventListener(n, o, {
                          capture: !0,
                          passive: f,
                      })
                    : e.addEventListener(n, o, !0)
                : f !== void 0
                  ? e.addEventListener(n, o, {
                        passive: f,
                    })
                  : e.addEventListener(n, o, !1))
    }
    function au(e, n, o, s, f) {
        var h = s
        if ((n & 1) === 0 && (n & 2) === 0 && s !== null)
            e: for (;;) {
                if (s === null) return
                var x = s.tag
                if (x === 3 || x === 4) {
                    var P = s.stateNode.containerInfo
                    if (P === f || (P.nodeType === 8 && P.parentNode === f))
                        break
                    if (x === 4)
                        for (x = s.return; x !== null; ) {
                            var D = x.tag
                            if (
                                (D === 3 || D === 4) &&
                                ((D = x.stateNode.containerInfo),
                                D === f ||
                                    (D.nodeType === 8 && D.parentNode === f))
                            )
                                return
                            x = x.return
                        }
                    for (; P !== null; ) {
                        if (((x = qn(P)), x === null)) return
                        if (((D = x.tag), D === 5 || D === 6)) {
                            s = h = x
                            continue e
                        }
                        P = P.parentNode
                    }
                }
                s = s.return
            }
        Ri(function () {
            var G = h,
                oe = ho(o),
                ie = []
            e: {
                var re = qc.get(e)
                if (re !== void 0) {
                    var de = Ql,
                        pe = e
                    switch (e) {
                        case 'keypress':
                            if (Qi(o) === 0) break e
                        case 'keydown':
                        case 'keyup':
                            de = Cm
                            break
                        case 'focusin':
                            ;((pe = 'focus'), (de = ql))
                            break
                        case 'focusout':
                            ;((pe = 'blur'), (de = ql))
                            break
                        case 'beforeblur':
                        case 'afterblur':
                            de = ql
                            break
                        case 'click':
                            if (o.button === 2) break e
                        case 'auxclick':
                        case 'dblclick':
                        case 'mousedown':
                        case 'mousemove':
                        case 'mouseup':
                        case 'mouseout':
                        case 'mouseover':
                        case 'contextmenu':
                            de = Mc
                            break
                        case 'drag':
                        case 'dragend':
                        case 'dragenter':
                        case 'dragexit':
                        case 'dragleave':
                        case 'dragover':
                        case 'dragstart':
                        case 'drop':
                            de = hm
                            break
                        case 'touchcancel':
                        case 'touchend':
                        case 'touchmove':
                        case 'touchstart':
                            de = Pm
                            break
                        case Xc:
                        case Qc:
                        case Kc:
                            de = mm
                            break
                        case Gc:
                            de = Lm
                            break
                        case 'scroll':
                            de = fm
                            break
                        case 'wheel':
                            de = Tm
                            break
                        case 'copy':
                        case 'cut':
                        case 'paste':
                            de = vm
                            break
                        case 'gotpointercapture':
                        case 'lostpointercapture':
                        case 'pointercancel':
                        case 'pointerdown':
                        case 'pointermove':
                        case 'pointerout':
                        case 'pointerover':
                        case 'pointerup':
                            de = zc
                    }
                    var ge = (n & 4) !== 0,
                        Be = !ge && e === 'scroll',
                        Y = ge ? (re !== null ? re + 'Capture' : null) : re
                    ge = []
                    for (var O = G, X; O !== null; ) {
                        X = O
                        var se = X.stateNode
                        if (
                            (X.tag === 5 &&
                                se !== null &&
                                ((X = se),
                                Y !== null &&
                                    ((se = bn(O, Y)),
                                    se != null && ge.push(Oo(O, se, X)))),
                            Be)
                        )
                            break
                        O = O.return
                    }
                    0 < ge.length &&
                        ((re = new de(re, pe, null, o, oe)),
                        ie.push({
                            event: re,
                            listeners: ge,
                        }))
                }
            }
            if ((n & 7) === 0) {
                e: {
                    if (
                        ((re = e === 'mouseover' || e === 'pointerover'),
                        (de = e === 'mouseout' || e === 'pointerout'),
                        re &&
                            o !== fo &&
                            (pe = o.relatedTarget || o.fromElement) &&
                            (qn(pe) || pe[rn]))
                    )
                        break e
                    if (
                        (de || re) &&
                        ((re =
                            oe.window === oe
                                ? oe
                                : (re = oe.ownerDocument)
                                  ? re.defaultView || re.parentWindow
                                  : window),
                        de
                            ? ((pe = o.relatedTarget || o.toElement),
                              (de = G),
                              (pe = pe ? qn(pe) : null),
                              pe !== null &&
                                  ((Be = Bt(pe)),
                                  pe !== Be ||
                                      (pe.tag !== 5 && pe.tag !== 6)) &&
                                  (pe = null))
                            : ((de = null), (pe = G)),
                        de !== pe)
                    ) {
                        if (
                            ((ge = Mc),
                            (se = 'onMouseLeave'),
                            (Y = 'onMouseEnter'),
                            (O = 'mouse'),
                            (e === 'pointerout' || e === 'pointerover') &&
                                ((ge = zc),
                                (se = 'onPointerLeave'),
                                (Y = 'onPointerEnter'),
                                (O = 'pointer')),
                            (Be = de == null ? re : Rr(de)),
                            (X = pe == null ? re : Rr(pe)),
                            (re = new ge(se, O + 'leave', de, o, oe)),
                            (re.target = Be),
                            (re.relatedTarget = X),
                            (se = null),
                            qn(oe) === G &&
                                ((ge = new ge(Y, O + 'enter', pe, o, oe)),
                                (ge.target = X),
                                (ge.relatedTarget = Be),
                                (se = ge)),
                            (Be = se),
                            de && pe)
                        )
                            t: {
                                for (
                                    ge = de, Y = pe, O = 0, X = ge;
                                    X;
                                    X = Ir(X)
                                )
                                    O++
                                for (X = 0, se = Y; se; se = Ir(se)) X++
                                for (; 0 < O - X; ) ((ge = Ir(ge)), O--)
                                for (; 0 < X - O; ) ((Y = Ir(Y)), X--)
                                for (; O--; ) {
                                    if (
                                        ge === Y ||
                                        (Y !== null && ge === Y.alternate)
                                    )
                                        break t
                                    ;((ge = Ir(ge)), (Y = Ir(Y)))
                                }
                                ge = null
                            }
                        else ge = null
                        ;(de !== null && nf(ie, re, de, ge, !1),
                            pe !== null &&
                                Be !== null &&
                                nf(ie, Be, pe, ge, !0))
                    }
                }
                e: {
                    if (
                        ((re = G ? Rr(G) : window),
                        (de = re.nodeName && re.nodeName.toLowerCase()),
                        de === 'select' ||
                            (de === 'input' && re.type === 'file'))
                    )
                        var me = Hm
                    else if (Ac(re))
                        if (Oc) me = Um
                        else {
                            me = Vm
                            var ve = jm
                        }
                    else
                        (de = re.nodeName) &&
                            de.toLowerCase() === 'input' &&
                            (re.type === 'checkbox' || re.type === 'radio') &&
                            (me = Bm)
                    if (me && (me = me(e, G))) {
                        $c(ie, me, o, oe)
                        break e
                    }
                    ;(ve && ve(e, re, G),
                        e === 'focusout' &&
                            (ve = re._wrapperState) &&
                            ve.controlled &&
                            re.type === 'number' &&
                            ht(re, 'number', re.value))
                }
                switch (((ve = G ? Rr(G) : window), e)) {
                    case 'focusin':
                        ;(Ac(ve) || ve.contentEditable === 'true') &&
                            ((zr = ve), (ru = G), (Do = null))
                        break
                    case 'focusout':
                        Do = ru = zr = null
                        break
                    case 'mousedown':
                        ou = !0
                        break
                    case 'contextmenu':
                    case 'mouseup':
                    case 'dragend':
                        ;((ou = !1), Yc(ie, o, oe))
                        break
                    case 'selectionchange':
                        if (bm) break
                    case 'keydown':
                    case 'keyup':
                        Yc(ie, o, oe)
                }
                var xe
                if (Jl)
                    e: {
                        switch (e) {
                            case 'compositionstart':
                                var Ee = 'onCompositionStart'
                                break e
                            case 'compositionend':
                                Ee = 'onCompositionEnd'
                                break e
                            case 'compositionupdate':
                                Ee = 'onCompositionUpdate'
                                break e
                        }
                        Ee = void 0
                    }
                else
                    Pr
                        ? Rc(e, o) && (Ee = 'onCompositionEnd')
                        : e === 'keydown' &&
                          o.keyCode === 229 &&
                          (Ee = 'onCompositionStart')
                ;(Ee &&
                    (Lc &&
                        o.locale !== 'ko' &&
                        (Pr || Ee !== 'onCompositionStart'
                            ? Ee === 'onCompositionEnd' && Pr && (xe = Cc())
                            : ((En = oe),
                              (Xl = 'value' in En ? En.value : En.textContent),
                              (Pr = !0))),
                    (ve = ts(G, Ee)),
                    0 < ve.length &&
                        ((Ee = new Pc(Ee, e, null, o, oe)),
                        ie.push({
                            event: Ee,
                            listeners: ve,
                        }),
                        xe
                            ? (Ee.data = xe)
                            : ((xe = Dc(o)), xe !== null && (Ee.data = xe)))),
                    (xe = Dm ? Am(e, o) : $m(e, o)) &&
                        ((G = ts(G, 'onBeforeInput')),
                        0 < G.length &&
                            ((oe = new Pc(
                                'onBeforeInput',
                                'beforeinput',
                                null,
                                o,
                                oe
                            )),
                            ie.push({
                                event: oe,
                                listeners: G,
                            }),
                            (oe.data = xe))))
            }
            ef(ie, n)
        })
    }
    function Oo(e, n, o) {
        return {
            instance: e,
            listener: n,
            currentTarget: o,
        }
    }
    function ts(e, n) {
        for (var o = n + 'Capture', s = []; e !== null; ) {
            var f = e,
                h = f.stateNode
            ;(f.tag === 5 &&
                h !== null &&
                ((f = h),
                (h = bn(e, o)),
                h != null && s.unshift(Oo(e, h, f)),
                (h = bn(e, n)),
                h != null && s.push(Oo(e, h, f))),
                (e = e.return))
        }
        return s
    }
    function Ir(e) {
        if (e === null) return null
        do e = e.return
        while (e && e.tag !== 5)
        return e || null
    }
    function nf(e, n, o, s, f) {
        for (var h = n._reactName, x = []; o !== null && o !== s; ) {
            var P = o,
                D = P.alternate,
                G = P.stateNode
            if (D !== null && D === s) break
            ;(P.tag === 5 &&
                G !== null &&
                ((P = G),
                f
                    ? ((D = bn(o, h)), D != null && x.unshift(Oo(o, D, P)))
                    : f || ((D = bn(o, h)), D != null && x.push(Oo(o, D, P)))),
                (o = o.return))
        }
        x.length !== 0 &&
            e.push({
                event: n,
                listeners: x,
            })
    }
    var Gm = /\r\n?/g,
        qm = /\u0000|\uFFFD/g
    function rf(e) {
        return (typeof e == 'string' ? e : '' + e)
            .replace(
                Gm,
                `
`
            )
            .replace(qm, '')
    }
    function ns(e, n, o) {
        if (((n = rf(n)), rf(e) !== n && o)) throw Error(i(425))
    }
    function rs() {}
    var cu = null,
        fu = null
    function du(e, n) {
        return (
            e === 'textarea' ||
            e === 'noscript' ||
            typeof n.children == 'string' ||
            typeof n.children == 'number' ||
            (typeof n.dangerouslySetInnerHTML == 'object' &&
                n.dangerouslySetInnerHTML !== null &&
                n.dangerouslySetInnerHTML.__html != null)
        )
    }
    var hu = typeof setTimeout == 'function' ? setTimeout : void 0,
        Zm = typeof clearTimeout == 'function' ? clearTimeout : void 0,
        of = typeof Promise == 'function' ? Promise : void 0,
        Jm =
            typeof queueMicrotask == 'function'
                ? queueMicrotask
                : typeof of < 'u'
                  ? function (e) {
                        return of.resolve(null).then(e).catch(e0)
                    }
                  : hu
    function e0(e) {
        setTimeout(function () {
            throw e
        })
    }
    function pu(e, n) {
        var o = n,
            s = 0
        do {
            var f = o.nextSibling
            if ((e.removeChild(o), f && f.nodeType === 8))
                if (((o = f.data), o === '/$')) {
                    if (s === 0) {
                        ;(e.removeChild(f), Mo(n))
                        return
                    }
                    s--
                } else (o !== '$' && o !== '$?' && o !== '$!') || s++
            o = f
        } while (o)
        Mo(n)
    }
    function Cn(e) {
        for (; e != null; e = e.nextSibling) {
            var n = e.nodeType
            if (n === 1 || n === 3) break
            if (n === 8) {
                if (((n = e.data), n === '$' || n === '$!' || n === '$?')) break
                if (n === '/$') return null
            }
        }
        return e
    }
    function sf(e) {
        e = e.previousSibling
        for (var n = 0; e; ) {
            if (e.nodeType === 8) {
                var o = e.data
                if (o === '$' || o === '$!' || o === '$?') {
                    if (n === 0) return e
                    n--
                } else o === '/$' && n++
            }
            e = e.previousSibling
        }
        return null
    }
    var Tr = Math.random().toString(36).slice(2),
        Wt = '__reactFiber$' + Tr,
        Fo = '__reactProps$' + Tr,
        rn = '__reactContainer$' + Tr,
        gu = '__reactEvents$' + Tr,
        t0 = '__reactListeners$' + Tr,
        n0 = '__reactHandles$' + Tr
    function qn(e) {
        var n = e[Wt]
        if (n) return n
        for (var o = e.parentNode; o; ) {
            if ((n = o[rn] || o[Wt])) {
                if (
                    ((o = n.alternate),
                    n.child !== null || (o !== null && o.child !== null))
                )
                    for (e = sf(e); e !== null; ) {
                        if ((o = e[Wt])) return o
                        e = sf(e)
                    }
                return n
            }
            ;((e = o), (o = e.parentNode))
        }
        return null
    }
    function Ho(e) {
        return (
            (e = e[Wt] || e[rn]),
            !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3)
                ? null
                : e
        )
    }
    function Rr(e) {
        if (e.tag === 5 || e.tag === 6) return e.stateNode
        throw Error(i(33))
    }
    function os(e) {
        return e[Fo] || null
    }
    var mu = [],
        Dr = -1
    function Nn(e) {
        return {
            current: e,
        }
    }
    function De(e) {
        0 > Dr || ((e.current = mu[Dr]), (mu[Dr] = null), Dr--)
    }
    function Te(e, n) {
        ;(Dr++, (mu[Dr] = e.current), (e.current = n))
    }
    var Mn = {},
        et = Nn(Mn),
        st = Nn(!1),
        Zn = Mn
    function Ar(e, n) {
        var o = e.type.contextTypes
        if (!o) return Mn
        var s = e.stateNode
        if (s && s.__reactInternalMemoizedUnmaskedChildContext === n)
            return s.__reactInternalMemoizedMaskedChildContext
        var f = {},
            h
        for (h in o) f[h] = n[h]
        return (
            s &&
                ((e = e.stateNode),
                (e.__reactInternalMemoizedUnmaskedChildContext = n),
                (e.__reactInternalMemoizedMaskedChildContext = f)),
            f
        )
    }
    function lt(e) {
        return ((e = e.childContextTypes), e != null)
    }
    function is() {
        ;(De(st), De(et))
    }
    function lf(e, n, o) {
        if (et.current !== Mn) throw Error(i(168))
        ;(Te(et, n), Te(st, o))
    }
    function uf(e, n, o) {
        var s = e.stateNode
        if (((n = n.childContextTypes), typeof s.getChildContext != 'function'))
            return o
        s = s.getChildContext()
        for (var f in s)
            if (!(f in n)) throw Error(i(108, ce(e) || 'Unknown', f))
        return j({}, o, s)
    }
    function ss(e) {
        return (
            (e =
                ((e = e.stateNode) &&
                    e.__reactInternalMemoizedMergedChildContext) ||
                Mn),
            (Zn = et.current),
            Te(et, e),
            Te(st, st.current),
            !0
        )
    }
    function af(e, n, o) {
        var s = e.stateNode
        if (!s) throw Error(i(169))
        ;(o
            ? ((e = uf(e, n, Zn)),
              (s.__reactInternalMemoizedMergedChildContext = e),
              De(st),
              De(et),
              Te(et, e))
            : De(st),
            Te(st, o))
    }
    var on = null,
        ls = !1,
        yu = !1
    function cf(e) {
        on === null ? (on = [e]) : on.push(e)
    }
    function r0(e) {
        ;((ls = !0), cf(e))
    }
    function Pn() {
        if (!yu && on !== null) {
            yu = !0
            var e = 0,
                n = Le
            try {
                var o = on
                for (Le = 1; e < o.length; e++) {
                    var s = o[e]
                    do s = s(!0)
                    while (s !== null)
                }
                ;((on = null), (ls = !1))
            } catch (f) {
                throw (on !== null && (on = on.slice(e + 1)), $i(wo, Pn), f)
            } finally {
                ;((Le = n), (yu = !1))
            }
        }
        return null
    }
    var $r = [],
        Or = 0,
        us = null,
        as = 0,
        kt = [],
        Ct = 0,
        Jn = null,
        sn = 1,
        ln = ''
    function er(e, n) {
        ;(($r[Or++] = as), ($r[Or++] = us), (us = e), (as = n))
    }
    function ff(e, n, o) {
        ;((kt[Ct++] = sn), (kt[Ct++] = ln), (kt[Ct++] = Jn), (Jn = e))
        var s = sn
        e = ln
        var f = 32 - gt(s) - 1
        ;((s &= ~(1 << f)), (o += 1))
        var h = 32 - gt(n) + f
        if (30 < h) {
            var x = f - (f % 5)
            ;((h = (s & ((1 << x) - 1)).toString(32)),
                (s >>= x),
                (f -= x),
                (sn = (1 << (32 - gt(n) + f)) | (o << f) | s),
                (ln = h + e))
        } else ((sn = (1 << h) | (o << f) | s), (ln = e))
    }
    function vu(e) {
        e.return !== null && (er(e, 1), ff(e, 1, 0))
    }
    function xu(e) {
        for (; e === us; )
            ((us = $r[--Or]), ($r[Or] = null), (as = $r[--Or]), ($r[Or] = null))
        for (; e === Jn; )
            ((Jn = kt[--Ct]),
                (kt[Ct] = null),
                (ln = kt[--Ct]),
                (kt[Ct] = null),
                (sn = kt[--Ct]),
                (kt[Ct] = null))
    }
    var yt = null,
        vt = null,
        Ae = !1,
        Tt = null
    function df(e, n) {
        var o = zt(5, null, null, 0)
        ;((o.elementType = 'DELETED'),
            (o.stateNode = n),
            (o.return = e),
            (n = e.deletions),
            n === null ? ((e.deletions = [o]), (e.flags |= 16)) : n.push(o))
    }
    function hf(e, n) {
        switch (e.tag) {
            case 5:
                var o = e.type
                return (
                    (n =
                        n.nodeType !== 1 ||
                        o.toLowerCase() !== n.nodeName.toLowerCase()
                            ? null
                            : n),
                    n !== null
                        ? ((e.stateNode = n),
                          (yt = e),
                          (vt = Cn(n.firstChild)),
                          !0)
                        : !1
                )
            case 6:
                return (
                    (n = e.pendingProps === '' || n.nodeType !== 3 ? null : n),
                    n !== null
                        ? ((e.stateNode = n), (yt = e), (vt = null), !0)
                        : !1
                )
            case 13:
                return (
                    (n = n.nodeType !== 8 ? null : n),
                    n !== null
                        ? ((o =
                              Jn !== null
                                  ? {
                                        id: sn,
                                        overflow: ln,
                                    }
                                  : null),
                          (e.memoizedState = {
                              dehydrated: n,
                              treeContext: o,
                              retryLane: 1073741824,
                          }),
                          (o = zt(18, null, null, 0)),
                          (o.stateNode = n),
                          (o.return = e),
                          (e.child = o),
                          (yt = e),
                          (vt = null),
                          !0)
                        : !1
                )
            default:
                return !1
        }
    }
    function wu(e) {
        return (e.mode & 1) !== 0 && (e.flags & 128) === 0
    }
    function Su(e) {
        if (Ae) {
            var n = vt
            if (n) {
                var o = n
                if (!hf(e, n)) {
                    if (wu(e)) throw Error(i(418))
                    n = Cn(o.nextSibling)
                    var s = yt
                    n && hf(e, n)
                        ? df(s, o)
                        : ((e.flags = (e.flags & -4097) | 2),
                          (Ae = !1),
                          (yt = e))
                }
            } else {
                if (wu(e)) throw Error(i(418))
                ;((e.flags = (e.flags & -4097) | 2), (Ae = !1), (yt = e))
            }
        }
    }
    function pf(e) {
        for (
            e = e.return;
            e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13;
        )
            e = e.return
        yt = e
    }
    function cs(e) {
        if (e !== yt) return !1
        if (!Ae) return (pf(e), (Ae = !0), !1)
        var n
        if (
            ((n = e.tag !== 3) &&
                !(n = e.tag !== 5) &&
                ((n = e.type),
                (n =
                    n !== 'head' &&
                    n !== 'body' &&
                    !du(e.type, e.memoizedProps))),
            n && (n = vt))
        ) {
            if (wu(e)) throw (gf(), Error(i(418)))
            for (; n; ) (df(e, n), (n = Cn(n.nextSibling)))
        }
        if ((pf(e), e.tag === 13)) {
            if (
                ((e = e.memoizedState),
                (e = e !== null ? e.dehydrated : null),
                !e)
            )
                throw Error(i(317))
            e: {
                for (e = e.nextSibling, n = 0; e; ) {
                    if (e.nodeType === 8) {
                        var o = e.data
                        if (o === '/$') {
                            if (n === 0) {
                                vt = Cn(e.nextSibling)
                                break e
                            }
                            n--
                        } else (o !== '$' && o !== '$!' && o !== '$?') || n++
                    }
                    e = e.nextSibling
                }
                vt = null
            }
        } else vt = yt ? Cn(e.stateNode.nextSibling) : null
        return !0
    }
    function gf() {
        for (var e = vt; e; ) e = Cn(e.nextSibling)
    }
    function Fr() {
        ;((vt = yt = null), (Ae = !1))
    }
    function _u(e) {
        Tt === null ? (Tt = [e]) : Tt.push(e)
    }
    var o0 = N.ReactCurrentBatchConfig
    function jo(e, n, o) {
        if (
            ((e = o.ref),
            e !== null && typeof e != 'function' && typeof e != 'object')
        ) {
            if (o._owner) {
                if (((o = o._owner), o)) {
                    if (o.tag !== 1) throw Error(i(309))
                    var s = o.stateNode
                }
                if (!s) throw Error(i(147, e))
                var f = s,
                    h = '' + e
                return n !== null &&
                    n.ref !== null &&
                    typeof n.ref == 'function' &&
                    n.ref._stringRef === h
                    ? n.ref
                    : ((n = function (x) {
                          var P = f.refs
                          x === null ? delete P[h] : (P[h] = x)
                      }),
                      (n._stringRef = h),
                      n)
            }
            if (typeof e != 'string') throw Error(i(284))
            if (!o._owner) throw Error(i(290, e))
        }
        return e
    }
    function fs(e, n) {
        throw (
            (e = Object.prototype.toString.call(n)),
            Error(
                i(
                    31,
                    e === '[object Object]'
                        ? 'object with keys {' + Object.keys(n).join(', ') + '}'
                        : e
                )
            )
        )
    }
    function mf(e) {
        var n = e._init
        return n(e._payload)
    }
    function yf(e) {
        function n(Y, O) {
            if (e) {
                var X = Y.deletions
                X === null ? ((Y.deletions = [O]), (Y.flags |= 16)) : X.push(O)
            }
        }
        function o(Y, O) {
            if (!e) return null
            for (; O !== null; ) (n(Y, O), (O = O.sibling))
            return null
        }
        function s(Y, O) {
            for (Y = new Map(); O !== null; )
                (O.key !== null ? Y.set(O.key, O) : Y.set(O.index, O),
                    (O = O.sibling))
            return Y
        }
        function f(Y, O) {
            return ((Y = $n(Y, O)), (Y.index = 0), (Y.sibling = null), Y)
        }
        function h(Y, O, X) {
            return (
                (Y.index = X),
                e
                    ? ((X = Y.alternate),
                      X !== null
                          ? ((X = X.index), X < O ? ((Y.flags |= 2), O) : X)
                          : ((Y.flags |= 2), O))
                    : ((Y.flags |= 1048576), O)
            )
        }
        function x(Y) {
            return (e && Y.alternate === null && (Y.flags |= 2), Y)
        }
        function P(Y, O, X, se) {
            return O === null || O.tag !== 6
                ? ((O = ha(X, Y.mode, se)), (O.return = Y), O)
                : ((O = f(O, X)), (O.return = Y), O)
        }
        function D(Y, O, X, se) {
            var me = X.type
            return me === F
                ? oe(Y, O, X.props.children, se, X.key)
                : O !== null &&
                    (O.elementType === me ||
                        (typeof me == 'object' &&
                            me !== null &&
                            me.$$typeof === H &&
                            mf(me) === O.type))
                  ? ((se = f(O, X.props)),
                    (se.ref = jo(Y, O, X)),
                    (se.return = Y),
                    se)
                  : ((se = As(X.type, X.key, X.props, null, Y.mode, se)),
                    (se.ref = jo(Y, O, X)),
                    (se.return = Y),
                    se)
        }
        function G(Y, O, X, se) {
            return O === null ||
                O.tag !== 4 ||
                O.stateNode.containerInfo !== X.containerInfo ||
                O.stateNode.implementation !== X.implementation
                ? ((O = pa(X, Y.mode, se)), (O.return = Y), O)
                : ((O = f(O, X.children || [])), (O.return = Y), O)
        }
        function oe(Y, O, X, se, me) {
            return O === null || O.tag !== 7
                ? ((O = ur(X, Y.mode, se, me)), (O.return = Y), O)
                : ((O = f(O, X)), (O.return = Y), O)
        }
        function ie(Y, O, X) {
            if ((typeof O == 'string' && O !== '') || typeof O == 'number')
                return ((O = ha('' + O, Y.mode, X)), (O.return = Y), O)
            if (typeof O == 'object' && O !== null) {
                switch (O.$$typeof) {
                    case A:
                        return (
                            (X = As(O.type, O.key, O.props, null, Y.mode, X)),
                            (X.ref = jo(Y, null, O)),
                            (X.return = Y),
                            X
                        )
                    case T:
                        return ((O = pa(O, Y.mode, X)), (O.return = Y), O)
                    case H:
                        var se = O._init
                        return ie(Y, se(O._payload), X)
                }
                if (pt(O) || R(O))
                    return ((O = ur(O, Y.mode, X, null)), (O.return = Y), O)
                fs(Y, O)
            }
            return null
        }
        function re(Y, O, X, se) {
            var me = O !== null ? O.key : null
            if ((typeof X == 'string' && X !== '') || typeof X == 'number')
                return me !== null ? null : P(Y, O, '' + X, se)
            if (typeof X == 'object' && X !== null) {
                switch (X.$$typeof) {
                    case A:
                        return X.key === me ? D(Y, O, X, se) : null
                    case T:
                        return X.key === me ? G(Y, O, X, se) : null
                    case H:
                        return ((me = X._init), re(Y, O, me(X._payload), se))
                }
                if (pt(X) || R(X))
                    return me !== null ? null : oe(Y, O, X, se, null)
                fs(Y, X)
            }
            return null
        }
        function de(Y, O, X, se, me) {
            if ((typeof se == 'string' && se !== '') || typeof se == 'number')
                return ((Y = Y.get(X) || null), P(O, Y, '' + se, me))
            if (typeof se == 'object' && se !== null) {
                switch (se.$$typeof) {
                    case A:
                        return (
                            (Y = Y.get(se.key === null ? X : se.key) || null),
                            D(O, Y, se, me)
                        )
                    case T:
                        return (
                            (Y = Y.get(se.key === null ? X : se.key) || null),
                            G(O, Y, se, me)
                        )
                    case H:
                        var ve = se._init
                        return de(Y, O, X, ve(se._payload), me)
                }
                if (pt(se) || R(se))
                    return ((Y = Y.get(X) || null), oe(O, Y, se, me, null))
                fs(O, se)
            }
            return null
        }
        function pe(Y, O, X, se) {
            for (
                var me = null, ve = null, xe = O, Ee = (O = 0), qe = null;
                xe !== null && Ee < X.length;
                Ee++
            ) {
                xe.index > Ee ? ((qe = xe), (xe = null)) : (qe = xe.sibling)
                var ze = re(Y, xe, X[Ee], se)
                if (ze === null) {
                    xe === null && (xe = qe)
                    break
                }
                ;(e && xe && ze.alternate === null && n(Y, xe),
                    (O = h(ze, O, Ee)),
                    ve === null ? (me = ze) : (ve.sibling = ze),
                    (ve = ze),
                    (xe = qe))
            }
            if (Ee === X.length) return (o(Y, xe), Ae && er(Y, Ee), me)
            if (xe === null) {
                for (; Ee < X.length; Ee++)
                    ((xe = ie(Y, X[Ee], se)),
                        xe !== null &&
                            ((O = h(xe, O, Ee)),
                            ve === null ? (me = xe) : (ve.sibling = xe),
                            (ve = xe)))
                return (Ae && er(Y, Ee), me)
            }
            for (xe = s(Y, xe); Ee < X.length; Ee++)
                ((qe = de(xe, Y, Ee, X[Ee], se)),
                    qe !== null &&
                        (e &&
                            qe.alternate !== null &&
                            xe.delete(qe.key === null ? Ee : qe.key),
                        (O = h(qe, O, Ee)),
                        ve === null ? (me = qe) : (ve.sibling = qe),
                        (ve = qe)))
            return (
                e &&
                    xe.forEach(function (On) {
                        return n(Y, On)
                    }),
                Ae && er(Y, Ee),
                me
            )
        }
        function ge(Y, O, X, se) {
            var me = R(X)
            if (typeof me != 'function') throw Error(i(150))
            if (((X = me.call(X)), X == null)) throw Error(i(151))
            for (
                var ve = (me = null),
                    xe = O,
                    Ee = (O = 0),
                    qe = null,
                    ze = X.next();
                xe !== null && !ze.done;
                Ee++, ze = X.next()
            ) {
                xe.index > Ee ? ((qe = xe), (xe = null)) : (qe = xe.sibling)
                var On = re(Y, xe, ze.value, se)
                if (On === null) {
                    xe === null && (xe = qe)
                    break
                }
                ;(e && xe && On.alternate === null && n(Y, xe),
                    (O = h(On, O, Ee)),
                    ve === null ? (me = On) : (ve.sibling = On),
                    (ve = On),
                    (xe = qe))
            }
            if (ze.done) return (o(Y, xe), Ae && er(Y, Ee), me)
            if (xe === null) {
                for (; !ze.done; Ee++, ze = X.next())
                    ((ze = ie(Y, ze.value, se)),
                        ze !== null &&
                            ((O = h(ze, O, Ee)),
                            ve === null ? (me = ze) : (ve.sibling = ze),
                            (ve = ze)))
                return (Ae && er(Y, Ee), me)
            }
            for (xe = s(Y, xe); !ze.done; Ee++, ze = X.next())
                ((ze = de(xe, Y, Ee, ze.value, se)),
                    ze !== null &&
                        (e &&
                            ze.alternate !== null &&
                            xe.delete(ze.key === null ? Ee : ze.key),
                        (O = h(ze, O, Ee)),
                        ve === null ? (me = ze) : (ve.sibling = ze),
                        (ve = ze)))
            return (
                e &&
                    xe.forEach(function (O0) {
                        return n(Y, O0)
                    }),
                Ae && er(Y, Ee),
                me
            )
        }
        function Be(Y, O, X, se) {
            if (
                (typeof X == 'object' &&
                    X !== null &&
                    X.type === F &&
                    X.key === null &&
                    (X = X.props.children),
                typeof X == 'object' && X !== null)
            ) {
                switch (X.$$typeof) {
                    case A:
                        e: {
                            for (var me = X.key, ve = O; ve !== null; ) {
                                if (ve.key === me) {
                                    if (((me = X.type), me === F)) {
                                        if (ve.tag === 7) {
                                            ;(o(Y, ve.sibling),
                                                (O = f(ve, X.props.children)),
                                                (O.return = Y),
                                                (Y = O))
                                            break e
                                        }
                                    } else if (
                                        ve.elementType === me ||
                                        (typeof me == 'object' &&
                                            me !== null &&
                                            me.$$typeof === H &&
                                            mf(me) === ve.type)
                                    ) {
                                        ;(o(Y, ve.sibling),
                                            (O = f(ve, X.props)),
                                            (O.ref = jo(Y, ve, X)),
                                            (O.return = Y),
                                            (Y = O))
                                        break e
                                    }
                                    o(Y, ve)
                                    break
                                } else n(Y, ve)
                                ve = ve.sibling
                            }
                            X.type === F
                                ? ((O = ur(
                                      X.props.children,
                                      Y.mode,
                                      se,
                                      X.key
                                  )),
                                  (O.return = Y),
                                  (Y = O))
                                : ((se = As(
                                      X.type,
                                      X.key,
                                      X.props,
                                      null,
                                      Y.mode,
                                      se
                                  )),
                                  (se.ref = jo(Y, O, X)),
                                  (se.return = Y),
                                  (Y = se))
                        }
                        return x(Y)
                    case T:
                        e: {
                            for (ve = X.key; O !== null; ) {
                                if (O.key === ve)
                                    if (
                                        O.tag === 4 &&
                                        O.stateNode.containerInfo ===
                                            X.containerInfo &&
                                        O.stateNode.implementation ===
                                            X.implementation
                                    ) {
                                        ;(o(Y, O.sibling),
                                            (O = f(O, X.children || [])),
                                            (O.return = Y),
                                            (Y = O))
                                        break e
                                    } else {
                                        o(Y, O)
                                        break
                                    }
                                else n(Y, O)
                                O = O.sibling
                            }
                            ;((O = pa(X, Y.mode, se)), (O.return = Y), (Y = O))
                        }
                        return x(Y)
                    case H:
                        return ((ve = X._init), Be(Y, O, ve(X._payload), se))
                }
                if (pt(X)) return pe(Y, O, X, se)
                if (R(X)) return ge(Y, O, X, se)
                fs(Y, X)
            }
            return (typeof X == 'string' && X !== '') || typeof X == 'number'
                ? ((X = '' + X),
                  O !== null && O.tag === 6
                      ? (o(Y, O.sibling),
                        (O = f(O, X)),
                        (O.return = Y),
                        (Y = O))
                      : (o(Y, O),
                        (O = ha(X, Y.mode, se)),
                        (O.return = Y),
                        (Y = O)),
                  x(Y))
                : o(Y, O)
        }
        return Be
    }
    var Hr = yf(!0),
        vf = yf(!1),
        ds = Nn(null),
        hs = null,
        jr = null,
        Eu = null
    function ku() {
        Eu = jr = hs = null
    }
    function Cu(e) {
        var n = ds.current
        ;(De(ds), (e._currentValue = n))
    }
    function Nu(e, n, o) {
        for (; e !== null; ) {
            var s = e.alternate
            if (
                ((e.childLanes & n) !== n
                    ? ((e.childLanes |= n), s !== null && (s.childLanes |= n))
                    : s !== null &&
                      (s.childLanes & n) !== n &&
                      (s.childLanes |= n),
                e === o)
            )
                break
            e = e.return
        }
    }
    function Vr(e, n) {
        ;((hs = e),
            (Eu = jr = null),
            (e = e.dependencies),
            e !== null &&
                e.firstContext !== null &&
                ((e.lanes & n) !== 0 && (ut = !0), (e.firstContext = null)))
    }
    function Nt(e) {
        var n = e._currentValue
        if (Eu !== e)
            if (
                ((e = {
                    context: e,
                    memoizedValue: n,
                    next: null,
                }),
                jr === null)
            ) {
                if (hs === null) throw Error(i(308))
                ;((jr = e),
                    (hs.dependencies = {
                        lanes: 0,
                        firstContext: e,
                    }))
            } else jr = jr.next = e
        return n
    }
    var tr = null
    function Mu(e) {
        tr === null ? (tr = [e]) : tr.push(e)
    }
    function xf(e, n, o, s) {
        var f = n.interleaved
        return (
            f === null
                ? ((o.next = o), Mu(n))
                : ((o.next = f.next), (f.next = o)),
            (n.interleaved = o),
            un(e, s)
        )
    }
    function un(e, n) {
        e.lanes |= n
        var o = e.alternate
        for (o !== null && (o.lanes |= n), o = e, e = e.return; e !== null; )
            ((e.childLanes |= n),
                (o = e.alternate),
                o !== null && (o.childLanes |= n),
                (o = e),
                (e = e.return))
        return o.tag === 3 ? o.stateNode : null
    }
    var zn = !1
    function Pu(e) {
        e.updateQueue = {
            baseState: e.memoizedState,
            firstBaseUpdate: null,
            lastBaseUpdate: null,
            shared: {
                pending: null,
                interleaved: null,
                lanes: 0,
            },
            effects: null,
        }
    }
    function wf(e, n) {
        ;((e = e.updateQueue),
            n.updateQueue === e &&
                (n.updateQueue = {
                    baseState: e.baseState,
                    firstBaseUpdate: e.firstBaseUpdate,
                    lastBaseUpdate: e.lastBaseUpdate,
                    shared: e.shared,
                    effects: e.effects,
                }))
    }
    function an(e, n) {
        return {
            eventTime: e,
            lane: n,
            tag: 0,
            payload: null,
            callback: null,
            next: null,
        }
    }
    function Ln(e, n, o) {
        var s = e.updateQueue
        if (s === null) return null
        if (((s = s.shared), (Pe & 2) !== 0)) {
            var f = s.pending
            return (
                f === null ? (n.next = n) : ((n.next = f.next), (f.next = n)),
                (s.pending = n),
                un(e, o)
            )
        }
        return (
            (f = s.interleaved),
            f === null
                ? ((n.next = n), Mu(s))
                : ((n.next = f.next), (f.next = n)),
            (s.interleaved = n),
            un(e, o)
        )
    }
    function ps(e, n, o) {
        if (
            ((n = n.updateQueue),
            n !== null && ((n = n.shared), (o & 4194240) !== 0))
        ) {
            var s = n.lanes
            ;((s &= e.pendingLanes), (o |= s), (n.lanes = o), Bl(e, o))
        }
    }
    function Sf(e, n) {
        var o = e.updateQueue,
            s = e.alternate
        if (s !== null && ((s = s.updateQueue), o === s)) {
            var f = null,
                h = null
            if (((o = o.firstBaseUpdate), o !== null)) {
                do {
                    var x = {
                        eventTime: o.eventTime,
                        lane: o.lane,
                        tag: o.tag,
                        payload: o.payload,
                        callback: o.callback,
                        next: null,
                    }
                    ;(h === null ? (f = h = x) : (h = h.next = x), (o = o.next))
                } while (o !== null)
                h === null ? (f = h = n) : (h = h.next = n)
            } else f = h = n
            ;((o = {
                baseState: s.baseState,
                firstBaseUpdate: f,
                lastBaseUpdate: h,
                shared: s.shared,
                effects: s.effects,
            }),
                (e.updateQueue = o))
            return
        }
        ;((e = o.lastBaseUpdate),
            e === null ? (o.firstBaseUpdate = n) : (e.next = n),
            (o.lastBaseUpdate = n))
    }
    function gs(e, n, o, s) {
        var f = e.updateQueue
        zn = !1
        var h = f.firstBaseUpdate,
            x = f.lastBaseUpdate,
            P = f.shared.pending
        if (P !== null) {
            f.shared.pending = null
            var D = P,
                G = D.next
            ;((D.next = null), x === null ? (h = G) : (x.next = G), (x = D))
            var oe = e.alternate
            oe !== null &&
                ((oe = oe.updateQueue),
                (P = oe.lastBaseUpdate),
                P !== x &&
                    (P === null ? (oe.firstBaseUpdate = G) : (P.next = G),
                    (oe.lastBaseUpdate = D)))
        }
        if (h !== null) {
            var ie = f.baseState
            ;((x = 0), (oe = G = D = null), (P = h))
            do {
                var re = P.lane,
                    de = P.eventTime
                if ((s & re) === re) {
                    oe !== null &&
                        (oe = oe.next =
                            {
                                eventTime: de,
                                lane: 0,
                                tag: P.tag,
                                payload: P.payload,
                                callback: P.callback,
                                next: null,
                            })
                    e: {
                        var pe = e,
                            ge = P
                        switch (((re = n), (de = o), ge.tag)) {
                            case 1:
                                if (
                                    ((pe = ge.payload), typeof pe == 'function')
                                ) {
                                    ie = pe.call(de, ie, re)
                                    break e
                                }
                                ie = pe
                                break e
                            case 3:
                                pe.flags = (pe.flags & -65537) | 128
                            case 0:
                                if (
                                    ((pe = ge.payload),
                                    (re =
                                        typeof pe == 'function'
                                            ? pe.call(de, ie, re)
                                            : pe),
                                    re == null)
                                )
                                    break e
                                ie = j({}, ie, re)
                                break e
                            case 2:
                                zn = !0
                        }
                    }
                    P.callback !== null &&
                        P.lane !== 0 &&
                        ((e.flags |= 64),
                        (re = f.effects),
                        re === null ? (f.effects = [P]) : re.push(P))
                } else
                    ((de = {
                        eventTime: de,
                        lane: re,
                        tag: P.tag,
                        payload: P.payload,
                        callback: P.callback,
                        next: null,
                    }),
                        oe === null
                            ? ((G = oe = de), (D = ie))
                            : (oe = oe.next = de),
                        (x |= re))
                if (((P = P.next), P === null)) {
                    if (((P = f.shared.pending), P === null)) break
                    ;((re = P),
                        (P = re.next),
                        (re.next = null),
                        (f.lastBaseUpdate = re),
                        (f.shared.pending = null))
                }
            } while (!0)
            if (
                (oe === null && (D = ie),
                (f.baseState = D),
                (f.firstBaseUpdate = G),
                (f.lastBaseUpdate = oe),
                (n = f.shared.interleaved),
                n !== null)
            ) {
                f = n
                do ((x |= f.lane), (f = f.next))
                while (f !== n)
            } else h === null && (f.shared.lanes = 0)
            ;((or |= x), (e.lanes = x), (e.memoizedState = ie))
        }
    }
    function _f(e, n, o) {
        if (((e = n.effects), (n.effects = null), e !== null))
            for (n = 0; n < e.length; n++) {
                var s = e[n],
                    f = s.callback
                if (f !== null) {
                    if (((s.callback = null), (s = o), typeof f != 'function'))
                        throw Error(i(191, f))
                    f.call(s)
                }
            }
    }
    var Vo = {},
        Yt = Nn(Vo),
        Bo = Nn(Vo),
        Uo = Nn(Vo)
    function nr(e) {
        if (e === Vo) throw Error(i(174))
        return e
    }
    function zu(e, n) {
        switch ((Te(Uo, n), Te(Bo, e), Te(Yt, Vo), (e = n.nodeType), e)) {
            case 9:
            case 11:
                n = (n = n.documentElement) ? n.namespaceURI : tn(null, '')
                break
            default:
                ;((e = e === 8 ? n.parentNode : n),
                    (n = e.namespaceURI || null),
                    (e = e.tagName),
                    (n = tn(n, e)))
        }
        ;(De(Yt), Te(Yt, n))
    }
    function Br() {
        ;(De(Yt), De(Bo), De(Uo))
    }
    function Ef(e) {
        nr(Uo.current)
        var n = nr(Yt.current),
            o = tn(n, e.type)
        n !== o && (Te(Bo, e), Te(Yt, o))
    }
    function Lu(e) {
        Bo.current === e && (De(Yt), De(Bo))
    }
    var He = Nn(0)
    function ms(e) {
        for (var n = e; n !== null; ) {
            if (n.tag === 13) {
                var o = n.memoizedState
                if (
                    o !== null &&
                    ((o = o.dehydrated),
                    o === null || o.data === '$?' || o.data === '$!')
                )
                    return n
            } else if (n.tag === 19 && n.memoizedProps.revealOrder !== void 0) {
                if ((n.flags & 128) !== 0) return n
            } else if (n.child !== null) {
                ;((n.child.return = n), (n = n.child))
                continue
            }
            if (n === e) break
            for (; n.sibling === null; ) {
                if (n.return === null || n.return === e) return null
                n = n.return
            }
            ;((n.sibling.return = n.return), (n = n.sibling))
        }
        return null
    }
    var Iu = []
    function Tu() {
        for (var e = 0; e < Iu.length; e++)
            Iu[e]._workInProgressVersionPrimary = null
        Iu.length = 0
    }
    var ys = N.ReactCurrentDispatcher,
        Ru = N.ReactCurrentBatchConfig,
        rr = 0,
        je = null,
        Xe = null,
        Ke = null,
        vs = !1,
        Wo = !1,
        Yo = 0,
        i0 = 0
    function tt() {
        throw Error(i(321))
    }
    function Du(e, n) {
        if (n === null) return !1
        for (var o = 0; o < n.length && o < e.length; o++)
            if (!It(e[o], n[o])) return !1
        return !0
    }
    function Au(e, n, o, s, f, h) {
        if (
            ((rr = h),
            (je = n),
            (n.memoizedState = null),
            (n.updateQueue = null),
            (n.lanes = 0),
            (ys.current = e === null || e.memoizedState === null ? a0 : c0),
            (e = o(s, f)),
            Wo)
        ) {
            h = 0
            do {
                if (((Wo = !1), (Yo = 0), 25 <= h)) throw Error(i(301))
                ;((h += 1),
                    (Ke = Xe = null),
                    (n.updateQueue = null),
                    (ys.current = f0),
                    (e = o(s, f)))
            } while (Wo)
        }
        if (
            ((ys.current = Ss),
            (n = Xe !== null && Xe.next !== null),
            (rr = 0),
            (Ke = Xe = je = null),
            (vs = !1),
            n)
        )
            throw Error(i(300))
        return e
    }
    function $u() {
        var e = Yo !== 0
        return ((Yo = 0), e)
    }
    function bt() {
        var e = {
            memoizedState: null,
            baseState: null,
            baseQueue: null,
            queue: null,
            next: null,
        }
        return (
            Ke === null ? (je.memoizedState = Ke = e) : (Ke = Ke.next = e),
            Ke
        )
    }
    function Mt() {
        if (Xe === null) {
            var e = je.alternate
            e = e !== null ? e.memoizedState : null
        } else e = Xe.next
        var n = Ke === null ? je.memoizedState : Ke.next
        if (n !== null) ((Ke = n), (Xe = e))
        else {
            if (e === null) throw Error(i(310))
            ;((Xe = e),
                (e = {
                    memoizedState: Xe.memoizedState,
                    baseState: Xe.baseState,
                    baseQueue: Xe.baseQueue,
                    queue: Xe.queue,
                    next: null,
                }),
                Ke === null ? (je.memoizedState = Ke = e) : (Ke = Ke.next = e))
        }
        return Ke
    }
    function bo(e, n) {
        return typeof n == 'function' ? n(e) : n
    }
    function Ou(e) {
        var n = Mt(),
            o = n.queue
        if (o === null) throw Error(i(311))
        o.lastRenderedReducer = e
        var s = Xe,
            f = s.baseQueue,
            h = o.pending
        if (h !== null) {
            if (f !== null) {
                var x = f.next
                ;((f.next = h.next), (h.next = x))
            }
            ;((s.baseQueue = f = h), (o.pending = null))
        }
        if (f !== null) {
            ;((h = f.next), (s = s.baseState))
            var P = (x = null),
                D = null,
                G = h
            do {
                var oe = G.lane
                if ((rr & oe) === oe)
                    (D !== null &&
                        (D = D.next =
                            {
                                lane: 0,
                                action: G.action,
                                hasEagerState: G.hasEagerState,
                                eagerState: G.eagerState,
                                next: null,
                            }),
                        (s = G.hasEagerState ? G.eagerState : e(s, G.action)))
                else {
                    var ie = {
                        lane: oe,
                        action: G.action,
                        hasEagerState: G.hasEagerState,
                        eagerState: G.eagerState,
                        next: null,
                    }
                    ;(D === null ? ((P = D = ie), (x = s)) : (D = D.next = ie),
                        (je.lanes |= oe),
                        (or |= oe))
                }
                G = G.next
            } while (G !== null && G !== h)
            ;(D === null ? (x = s) : (D.next = P),
                It(s, n.memoizedState) || (ut = !0),
                (n.memoizedState = s),
                (n.baseState = x),
                (n.baseQueue = D),
                (o.lastRenderedState = s))
        }
        if (((e = o.interleaved), e !== null)) {
            f = e
            do ((h = f.lane), (je.lanes |= h), (or |= h), (f = f.next))
            while (f !== e)
        } else f === null && (o.lanes = 0)
        return [n.memoizedState, o.dispatch]
    }
    function Fu(e) {
        var n = Mt(),
            o = n.queue
        if (o === null) throw Error(i(311))
        o.lastRenderedReducer = e
        var s = o.dispatch,
            f = o.pending,
            h = n.memoizedState
        if (f !== null) {
            o.pending = null
            var x = (f = f.next)
            do ((h = e(h, x.action)), (x = x.next))
            while (x !== f)
            ;(It(h, n.memoizedState) || (ut = !0),
                (n.memoizedState = h),
                n.baseQueue === null && (n.baseState = h),
                (o.lastRenderedState = h))
        }
        return [h, s]
    }
    function kf() {}
    function Cf(e, n) {
        var o = je,
            s = Mt(),
            f = n(),
            h = !It(s.memoizedState, f)
        if (
            (h && ((s.memoizedState = f), (ut = !0)),
            (s = s.queue),
            Hu(Pf.bind(null, o, s, e), [e]),
            s.getSnapshot !== n ||
                h ||
                (Ke !== null && Ke.memoizedState.tag & 1))
        ) {
            if (
                ((o.flags |= 2048),
                Xo(9, Mf.bind(null, o, s, f, n), void 0, null),
                Ge === null)
            )
                throw Error(i(349))
            ;(rr & 30) !== 0 || Nf(o, n, f)
        }
        return f
    }
    function Nf(e, n, o) {
        ;((e.flags |= 16384),
            (e = {
                getSnapshot: n,
                value: o,
            }),
            (n = je.updateQueue),
            n === null
                ? ((n = {
                      lastEffect: null,
                      stores: null,
                  }),
                  (je.updateQueue = n),
                  (n.stores = [e]))
                : ((o = n.stores), o === null ? (n.stores = [e]) : o.push(e)))
    }
    function Mf(e, n, o, s) {
        ;((n.value = o), (n.getSnapshot = s), zf(n) && Lf(e))
    }
    function Pf(e, n, o) {
        return o(function () {
            zf(n) && Lf(e)
        })
    }
    function zf(e) {
        var n = e.getSnapshot
        e = e.value
        try {
            var o = n()
            return !It(e, o)
        } catch {
            return !0
        }
    }
    function Lf(e) {
        var n = un(e, 1)
        n !== null && $t(n, e, 1, -1)
    }
    function If(e) {
        var n = bt()
        return (
            typeof e == 'function' && (e = e()),
            (n.memoizedState = n.baseState = e),
            (e = {
                pending: null,
                interleaved: null,
                lanes: 0,
                dispatch: null,
                lastRenderedReducer: bo,
                lastRenderedState: e,
            }),
            (n.queue = e),
            (e = e.dispatch = u0.bind(null, je, e)),
            [n.memoizedState, e]
        )
    }
    function Xo(e, n, o, s) {
        return (
            (e = {
                tag: e,
                create: n,
                destroy: o,
                deps: s,
                next: null,
            }),
            (n = je.updateQueue),
            n === null
                ? ((n = {
                      lastEffect: null,
                      stores: null,
                  }),
                  (je.updateQueue = n),
                  (n.lastEffect = e.next = e))
                : ((o = n.lastEffect),
                  o === null
                      ? (n.lastEffect = e.next = e)
                      : ((s = o.next),
                        (o.next = e),
                        (e.next = s),
                        (n.lastEffect = e))),
            e
        )
    }
    function Tf() {
        return Mt().memoizedState
    }
    function xs(e, n, o, s) {
        var f = bt()
        ;((je.flags |= e),
            (f.memoizedState = Xo(1 | n, o, void 0, s === void 0 ? null : s)))
    }
    function ws(e, n, o, s) {
        var f = Mt()
        s = s === void 0 ? null : s
        var h = void 0
        if (Xe !== null) {
            var x = Xe.memoizedState
            if (((h = x.destroy), s !== null && Du(s, x.deps))) {
                f.memoizedState = Xo(n, o, h, s)
                return
            }
        }
        ;((je.flags |= e), (f.memoizedState = Xo(1 | n, o, h, s)))
    }
    function Rf(e, n) {
        return xs(8390656, 8, e, n)
    }
    function Hu(e, n) {
        return ws(2048, 8, e, n)
    }
    function Df(e, n) {
        return ws(4, 2, e, n)
    }
    function Af(e, n) {
        return ws(4, 4, e, n)
    }
    function $f(e, n) {
        if (typeof n == 'function')
            return (
                (e = e()),
                n(e),
                function () {
                    n(null)
                }
            )
        if (n != null)
            return (
                (e = e()),
                (n.current = e),
                function () {
                    n.current = null
                }
            )
    }
    function Of(e, n, o) {
        return (
            (o = o != null ? o.concat([e]) : null),
            ws(4, 4, $f.bind(null, n, e), o)
        )
    }
    function ju() {}
    function Ff(e, n) {
        var o = Mt()
        n = n === void 0 ? null : n
        var s = o.memoizedState
        return s !== null && n !== null && Du(n, s[1])
            ? s[0]
            : ((o.memoizedState = [e, n]), e)
    }
    function Hf(e, n) {
        var o = Mt()
        n = n === void 0 ? null : n
        var s = o.memoizedState
        return s !== null && n !== null && Du(n, s[1])
            ? s[0]
            : ((e = e()), (o.memoizedState = [e, n]), e)
    }
    function jf(e, n, o) {
        return (rr & 21) === 0
            ? (e.baseState && ((e.baseState = !1), (ut = !0)),
              (e.memoizedState = o))
            : (It(o, n) ||
                  ((o = Cr()), (je.lanes |= o), (or |= o), (e.baseState = !0)),
              n)
    }
    function s0(e, n) {
        var o = Le
        ;((Le = o !== 0 && 4 > o ? o : 4), e(!0))
        var s = Ru.transition
        Ru.transition = {}
        try {
            ;(e(!1), n())
        } finally {
            ;((Le = o), (Ru.transition = s))
        }
    }
    function Vf() {
        return Mt().memoizedState
    }
    function l0(e, n, o) {
        var s = Dn(e)
        if (
            ((o = {
                lane: s,
                action: o,
                hasEagerState: !1,
                eagerState: null,
                next: null,
            }),
            Bf(e))
        )
            Uf(n, o)
        else if (((o = xf(e, n, o, s)), o !== null)) {
            var f = it()
            ;($t(o, e, s, f), Wf(o, n, s))
        }
    }
    function u0(e, n, o) {
        var s = Dn(e),
            f = {
                lane: s,
                action: o,
                hasEagerState: !1,
                eagerState: null,
                next: null,
            }
        if (Bf(e)) Uf(n, f)
        else {
            var h = e.alternate
            if (
                e.lanes === 0 &&
                (h === null || h.lanes === 0) &&
                ((h = n.lastRenderedReducer), h !== null)
            )
                try {
                    var x = n.lastRenderedState,
                        P = h(x, o)
                    if (
                        ((f.hasEagerState = !0), (f.eagerState = P), It(P, x))
                    ) {
                        var D = n.interleaved
                        ;(D === null
                            ? ((f.next = f), Mu(n))
                            : ((f.next = D.next), (D.next = f)),
                            (n.interleaved = f))
                        return
                    }
                } catch {
                } finally {
                }
            ;((o = xf(e, n, f, s)),
                o !== null && ((f = it()), $t(o, e, s, f), Wf(o, n, s)))
        }
    }
    function Bf(e) {
        var n = e.alternate
        return e === je || (n !== null && n === je)
    }
    function Uf(e, n) {
        Wo = vs = !0
        var o = e.pending
        ;(o === null ? (n.next = n) : ((n.next = o.next), (o.next = n)),
            (e.pending = n))
    }
    function Wf(e, n, o) {
        if ((o & 4194240) !== 0) {
            var s = n.lanes
            ;((s &= e.pendingLanes), (o |= s), (n.lanes = o), Bl(e, o))
        }
    }
    var Ss = {
            readContext: Nt,
            useCallback: tt,
            useContext: tt,
            useEffect: tt,
            useImperativeHandle: tt,
            useInsertionEffect: tt,
            useLayoutEffect: tt,
            useMemo: tt,
            useReducer: tt,
            useRef: tt,
            useState: tt,
            useDebugValue: tt,
            useDeferredValue: tt,
            useTransition: tt,
            useMutableSource: tt,
            useSyncExternalStore: tt,
            useId: tt,
            unstable_isNewReconciler: !1,
        },
        a0 = {
            readContext: Nt,
            useCallback: function (e, n) {
                return ((bt().memoizedState = [e, n === void 0 ? null : n]), e)
            },
            useContext: Nt,
            useEffect: Rf,
            useImperativeHandle: function (e, n, o) {
                return (
                    (o = o != null ? o.concat([e]) : null),
                    xs(4194308, 4, $f.bind(null, n, e), o)
                )
            },
            useLayoutEffect: function (e, n) {
                return xs(4194308, 4, e, n)
            },
            useInsertionEffect: function (e, n) {
                return xs(4, 2, e, n)
            },
            useMemo: function (e, n) {
                var o = bt()
                return (
                    (n = n === void 0 ? null : n),
                    (e = e()),
                    (o.memoizedState = [e, n]),
                    e
                )
            },
            useReducer: function (e, n, o) {
                var s = bt()
                return (
                    (n = o !== void 0 ? o(n) : n),
                    (s.memoizedState = s.baseState = n),
                    (e = {
                        pending: null,
                        interleaved: null,
                        lanes: 0,
                        dispatch: null,
                        lastRenderedReducer: e,
                        lastRenderedState: n,
                    }),
                    (s.queue = e),
                    (e = e.dispatch = l0.bind(null, je, e)),
                    [s.memoizedState, e]
                )
            },
            useRef: function (e) {
                var n = bt()
                return (
                    (e = {
                        current: e,
                    }),
                    (n.memoizedState = e)
                )
            },
            useState: If,
            useDebugValue: ju,
            useDeferredValue: function (e) {
                return (bt().memoizedState = e)
            },
            useTransition: function () {
                var e = If(!1),
                    n = e[0]
                return (
                    (e = s0.bind(null, e[1])),
                    (bt().memoizedState = e),
                    [n, e]
                )
            },
            useMutableSource: function () {},
            useSyncExternalStore: function (e, n, o) {
                var s = je,
                    f = bt()
                if (Ae) {
                    if (o === void 0) throw Error(i(407))
                    o = o()
                } else {
                    if (((o = n()), Ge === null)) throw Error(i(349))
                    ;(rr & 30) !== 0 || Nf(s, n, o)
                }
                f.memoizedState = o
                var h = {
                    value: o,
                    getSnapshot: n,
                }
                return (
                    (f.queue = h),
                    Rf(Pf.bind(null, s, h, e), [e]),
                    (s.flags |= 2048),
                    Xo(9, Mf.bind(null, s, h, o, n), void 0, null),
                    o
                )
            },
            useId: function () {
                var e = bt(),
                    n = Ge.identifierPrefix
                if (Ae) {
                    var o = ln,
                        s = sn
                    ;((o = (s & ~(1 << (32 - gt(s) - 1))).toString(32) + o),
                        (n = ':' + n + 'R' + o),
                        (o = Yo++),
                        0 < o && (n += 'H' + o.toString(32)),
                        (n += ':'))
                } else ((o = i0++), (n = ':' + n + 'r' + o.toString(32) + ':'))
                return (e.memoizedState = n)
            },
            unstable_isNewReconciler: !1,
        },
        c0 = {
            readContext: Nt,
            useCallback: Ff,
            useContext: Nt,
            useEffect: Hu,
            useImperativeHandle: Of,
            useInsertionEffect: Df,
            useLayoutEffect: Af,
            useMemo: Hf,
            useReducer: Ou,
            useRef: Tf,
            useState: function () {
                return Ou(bo)
            },
            useDebugValue: ju,
            useDeferredValue: function (e) {
                var n = Mt()
                return jf(n, Xe.memoizedState, e)
            },
            useTransition: function () {
                var e = Ou(bo)[0],
                    n = Mt().memoizedState
                return [e, n]
            },
            useMutableSource: kf,
            useSyncExternalStore: Cf,
            useId: Vf,
            unstable_isNewReconciler: !1,
        },
        f0 = {
            readContext: Nt,
            useCallback: Ff,
            useContext: Nt,
            useEffect: Hu,
            useImperativeHandle: Of,
            useInsertionEffect: Df,
            useLayoutEffect: Af,
            useMemo: Hf,
            useReducer: Fu,
            useRef: Tf,
            useState: function () {
                return Fu(bo)
            },
            useDebugValue: ju,
            useDeferredValue: function (e) {
                var n = Mt()
                return Xe === null
                    ? (n.memoizedState = e)
                    : jf(n, Xe.memoizedState, e)
            },
            useTransition: function () {
                var e = Fu(bo)[0],
                    n = Mt().memoizedState
                return [e, n]
            },
            useMutableSource: kf,
            useSyncExternalStore: Cf,
            useId: Vf,
            unstable_isNewReconciler: !1,
        }
    function Rt(e, n) {
        if (e && e.defaultProps) {
            ;((n = j({}, n)), (e = e.defaultProps))
            for (var o in e) n[o] === void 0 && (n[o] = e[o])
            return n
        }
        return n
    }
    function Vu(e, n, o, s) {
        ;((n = e.memoizedState),
            (o = o(s, n)),
            (o = o == null ? n : j({}, n, o)),
            (e.memoizedState = o),
            e.lanes === 0 && (e.updateQueue.baseState = o))
    }
    var _s = {
        isMounted: function (e) {
            return (e = e._reactInternals) ? Bt(e) === e : !1
        },
        enqueueSetState: function (e, n, o) {
            e = e._reactInternals
            var s = it(),
                f = Dn(e),
                h = an(s, f)
            ;((h.payload = n),
                o != null && (h.callback = o),
                (n = Ln(e, h, f)),
                n !== null && ($t(n, e, f, s), ps(n, e, f)))
        },
        enqueueReplaceState: function (e, n, o) {
            e = e._reactInternals
            var s = it(),
                f = Dn(e),
                h = an(s, f)
            ;((h.tag = 1),
                (h.payload = n),
                o != null && (h.callback = o),
                (n = Ln(e, h, f)),
                n !== null && ($t(n, e, f, s), ps(n, e, f)))
        },
        enqueueForceUpdate: function (e, n) {
            e = e._reactInternals
            var o = it(),
                s = Dn(e),
                f = an(o, s)
            ;((f.tag = 2),
                n != null && (f.callback = n),
                (n = Ln(e, f, s)),
                n !== null && ($t(n, e, s, o), ps(n, e, s)))
        },
    }
    function Yf(e, n, o, s, f, h, x) {
        return (
            (e = e.stateNode),
            typeof e.shouldComponentUpdate == 'function'
                ? e.shouldComponentUpdate(s, h, x)
                : n.prototype && n.prototype.isPureReactComponent
                  ? !Ro(o, s) || !Ro(f, h)
                  : !0
        )
    }
    function bf(e, n, o) {
        var s = !1,
            f = Mn,
            h = n.contextType
        return (
            typeof h == 'object' && h !== null
                ? (h = Nt(h))
                : ((f = lt(n) ? Zn : et.current),
                  (s = n.contextTypes),
                  (h = (s = s != null) ? Ar(e, f) : Mn)),
            (n = new n(o, h)),
            (e.memoizedState =
                n.state !== null && n.state !== void 0 ? n.state : null),
            (n.updater = _s),
            (e.stateNode = n),
            (n._reactInternals = e),
            s &&
                ((e = e.stateNode),
                (e.__reactInternalMemoizedUnmaskedChildContext = f),
                (e.__reactInternalMemoizedMaskedChildContext = h)),
            n
        )
    }
    function Xf(e, n, o, s) {
        ;((e = n.state),
            typeof n.componentWillReceiveProps == 'function' &&
                n.componentWillReceiveProps(o, s),
            typeof n.UNSAFE_componentWillReceiveProps == 'function' &&
                n.UNSAFE_componentWillReceiveProps(o, s),
            n.state !== e && _s.enqueueReplaceState(n, n.state, null))
    }
    function Bu(e, n, o, s) {
        var f = e.stateNode
        ;((f.props = o), (f.state = e.memoizedState), (f.refs = {}), Pu(e))
        var h = n.contextType
        ;(typeof h == 'object' && h !== null
            ? (f.context = Nt(h))
            : ((h = lt(n) ? Zn : et.current), (f.context = Ar(e, h))),
            (f.state = e.memoizedState),
            (h = n.getDerivedStateFromProps),
            typeof h == 'function' &&
                (Vu(e, n, h, o), (f.state = e.memoizedState)),
            typeof n.getDerivedStateFromProps == 'function' ||
                typeof f.getSnapshotBeforeUpdate == 'function' ||
                (typeof f.UNSAFE_componentWillMount != 'function' &&
                    typeof f.componentWillMount != 'function') ||
                ((n = f.state),
                typeof f.componentWillMount == 'function' &&
                    f.componentWillMount(),
                typeof f.UNSAFE_componentWillMount == 'function' &&
                    f.UNSAFE_componentWillMount(),
                n !== f.state && _s.enqueueReplaceState(f, f.state, null),
                gs(e, o, f, s),
                (f.state = e.memoizedState)),
            typeof f.componentDidMount == 'function' && (e.flags |= 4194308))
    }
    function Ur(e, n) {
        try {
            var o = '',
                s = n
            do ((o += le(s)), (s = s.return))
            while (s)
            var f = o
        } catch (h) {
            f =
                `
Error generating stack: ` +
                h.message +
                `
` +
                h.stack
        }
        return {
            value: e,
            source: n,
            stack: f,
            digest: null,
        }
    }
    function Uu(e, n, o) {
        return {
            value: e,
            source: null,
            stack: o ?? null,
            digest: n ?? null,
        }
    }
    function Wu(e, n) {
        try {
            console.error(n.value)
        } catch (o) {
            setTimeout(function () {
                throw o
            })
        }
    }
    var d0 = typeof WeakMap == 'function' ? WeakMap : Map
    function Qf(e, n, o) {
        ;((o = an(-1, o)),
            (o.tag = 3),
            (o.payload = {
                element: null,
            }))
        var s = n.value
        return (
            (o.callback = function () {
                ;(zs || ((zs = !0), (ia = s)), Wu(e, n))
            }),
            o
        )
    }
    function Kf(e, n, o) {
        ;((o = an(-1, o)), (o.tag = 3))
        var s = e.type.getDerivedStateFromError
        if (typeof s == 'function') {
            var f = n.value
            ;((o.payload = function () {
                return s(f)
            }),
                (o.callback = function () {
                    Wu(e, n)
                }))
        }
        var h = e.stateNode
        return (
            h !== null &&
                typeof h.componentDidCatch == 'function' &&
                (o.callback = function () {
                    ;(Wu(e, n),
                        typeof s != 'function' &&
                            (Tn === null
                                ? (Tn = new Set([this]))
                                : Tn.add(this)))
                    var x = n.stack
                    this.componentDidCatch(n.value, {
                        componentStack: x !== null ? x : '',
                    })
                }),
            o
        )
    }
    function Gf(e, n, o) {
        var s = e.pingCache
        if (s === null) {
            s = e.pingCache = new d0()
            var f = new Set()
            s.set(n, f)
        } else ((f = s.get(n)), f === void 0 && ((f = new Set()), s.set(n, f)))
        f.has(o) || (f.add(o), (e = N0.bind(null, e, n, o)), n.then(e, e))
    }
    function qf(e) {
        do {
            var n
            if (
                ((n = e.tag === 13) &&
                    ((n = e.memoizedState),
                    (n = n !== null ? n.dehydrated !== null : !0)),
                n)
            )
                return e
            e = e.return
        } while (e !== null)
        return null
    }
    function Zf(e, n, o, s, f) {
        return (e.mode & 1) === 0
            ? (e === n
                  ? (e.flags |= 65536)
                  : ((e.flags |= 128),
                    (o.flags |= 131072),
                    (o.flags &= -52805),
                    o.tag === 1 &&
                        (o.alternate === null
                            ? (o.tag = 17)
                            : ((n = an(-1, 1)), (n.tag = 2), Ln(o, n, 1))),
                    (o.lanes |= 1)),
              e)
            : ((e.flags |= 65536), (e.lanes = f), e)
    }
    var h0 = N.ReactCurrentOwner,
        ut = !1
    function ot(e, n, o, s) {
        n.child = e === null ? vf(n, null, o, s) : Hr(n, e.child, o, s)
    }
    function Jf(e, n, o, s, f) {
        o = o.render
        var h = n.ref
        return (
            Vr(n, f),
            (s = Au(e, n, o, s, h, f)),
            (o = $u()),
            e !== null && !ut
                ? ((n.updateQueue = e.updateQueue),
                  (n.flags &= -2053),
                  (e.lanes &= ~f),
                  cn(e, n, f))
                : (Ae && o && vu(n), (n.flags |= 1), ot(e, n, s, f), n.child)
        )
    }
    function ed(e, n, o, s, f) {
        if (e === null) {
            var h = o.type
            return typeof h == 'function' &&
                !da(h) &&
                h.defaultProps === void 0 &&
                o.compare === null &&
                o.defaultProps === void 0
                ? ((n.tag = 15), (n.type = h), td(e, n, h, s, f))
                : ((e = As(o.type, null, s, n, n.mode, f)),
                  (e.ref = n.ref),
                  (e.return = n),
                  (n.child = e))
        }
        if (((h = e.child), (e.lanes & f) === 0)) {
            var x = h.memoizedProps
            if (
                ((o = o.compare),
                (o = o !== null ? o : Ro),
                o(x, s) && e.ref === n.ref)
            )
                return cn(e, n, f)
        }
        return (
            (n.flags |= 1),
            (e = $n(h, s)),
            (e.ref = n.ref),
            (e.return = n),
            (n.child = e)
        )
    }
    function td(e, n, o, s, f) {
        if (e !== null) {
            var h = e.memoizedProps
            if (Ro(h, s) && e.ref === n.ref)
                if (((ut = !1), (n.pendingProps = s = h), (e.lanes & f) !== 0))
                    (e.flags & 131072) !== 0 && (ut = !0)
                else return ((n.lanes = e.lanes), cn(e, n, f))
        }
        return Yu(e, n, o, s, f)
    }
    function nd(e, n, o) {
        var s = n.pendingProps,
            f = s.children,
            h = e !== null ? e.memoizedState : null
        if (s.mode === 'hidden')
            if ((n.mode & 1) === 0)
                ((n.memoizedState = {
                    baseLanes: 0,
                    cachePool: null,
                    transitions: null,
                }),
                    Te(Yr, xt),
                    (xt |= o))
            else {
                if ((o & 1073741824) === 0)
                    return (
                        (e = h !== null ? h.baseLanes | o : o),
                        (n.lanes = n.childLanes = 1073741824),
                        (n.memoizedState = {
                            baseLanes: e,
                            cachePool: null,
                            transitions: null,
                        }),
                        (n.updateQueue = null),
                        Te(Yr, xt),
                        (xt |= e),
                        null
                    )
                ;((n.memoizedState = {
                    baseLanes: 0,
                    cachePool: null,
                    transitions: null,
                }),
                    (s = h !== null ? h.baseLanes : o),
                    Te(Yr, xt),
                    (xt |= s))
            }
        else
            (h !== null
                ? ((s = h.baseLanes | o), (n.memoizedState = null))
                : (s = o),
                Te(Yr, xt),
                (xt |= s))
        return (ot(e, n, f, o), n.child)
    }
    function rd(e, n) {
        var o = n.ref
        ;((e === null && o !== null) || (e !== null && e.ref !== o)) &&
            ((n.flags |= 512), (n.flags |= 2097152))
    }
    function Yu(e, n, o, s, f) {
        var h = lt(o) ? Zn : et.current
        return (
            (h = Ar(n, h)),
            Vr(n, f),
            (o = Au(e, n, o, s, h, f)),
            (s = $u()),
            e !== null && !ut
                ? ((n.updateQueue = e.updateQueue),
                  (n.flags &= -2053),
                  (e.lanes &= ~f),
                  cn(e, n, f))
                : (Ae && s && vu(n), (n.flags |= 1), ot(e, n, o, f), n.child)
        )
    }
    function od(e, n, o, s, f) {
        if (lt(o)) {
            var h = !0
            ss(n)
        } else h = !1
        if ((Vr(n, f), n.stateNode === null))
            (ks(e, n), bf(n, o, s), Bu(n, o, s, f), (s = !0))
        else if (e === null) {
            var x = n.stateNode,
                P = n.memoizedProps
            x.props = P
            var D = x.context,
                G = o.contextType
            typeof G == 'object' && G !== null
                ? (G = Nt(G))
                : ((G = lt(o) ? Zn : et.current), (G = Ar(n, G)))
            var oe = o.getDerivedStateFromProps,
                ie =
                    typeof oe == 'function' ||
                    typeof x.getSnapshotBeforeUpdate == 'function'
            ;(ie ||
                (typeof x.UNSAFE_componentWillReceiveProps != 'function' &&
                    typeof x.componentWillReceiveProps != 'function') ||
                ((P !== s || D !== G) && Xf(n, x, s, G)),
                (zn = !1))
            var re = n.memoizedState
            ;((x.state = re),
                gs(n, s, x, f),
                (D = n.memoizedState),
                P !== s || re !== D || st.current || zn
                    ? (typeof oe == 'function' &&
                          (Vu(n, o, oe, s), (D = n.memoizedState)),
                      (P = zn || Yf(n, o, P, s, re, D, G))
                          ? (ie ||
                                (typeof x.UNSAFE_componentWillMount !=
                                    'function' &&
                                    typeof x.componentWillMount !=
                                        'function') ||
                                (typeof x.componentWillMount == 'function' &&
                                    x.componentWillMount(),
                                typeof x.UNSAFE_componentWillMount ==
                                    'function' &&
                                    x.UNSAFE_componentWillMount()),
                            typeof x.componentDidMount == 'function' &&
                                (n.flags |= 4194308))
                          : (typeof x.componentDidMount == 'function' &&
                                (n.flags |= 4194308),
                            (n.memoizedProps = s),
                            (n.memoizedState = D)),
                      (x.props = s),
                      (x.state = D),
                      (x.context = G),
                      (s = P))
                    : (typeof x.componentDidMount == 'function' &&
                          (n.flags |= 4194308),
                      (s = !1)))
        } else {
            ;((x = n.stateNode),
                wf(e, n),
                (P = n.memoizedProps),
                (G = n.type === n.elementType ? P : Rt(n.type, P)),
                (x.props = G),
                (ie = n.pendingProps),
                (re = x.context),
                (D = o.contextType),
                typeof D == 'object' && D !== null
                    ? (D = Nt(D))
                    : ((D = lt(o) ? Zn : et.current), (D = Ar(n, D))))
            var de = o.getDerivedStateFromProps
            ;((oe =
                typeof de == 'function' ||
                typeof x.getSnapshotBeforeUpdate == 'function') ||
                (typeof x.UNSAFE_componentWillReceiveProps != 'function' &&
                    typeof x.componentWillReceiveProps != 'function') ||
                ((P !== ie || re !== D) && Xf(n, x, s, D)),
                (zn = !1),
                (re = n.memoizedState),
                (x.state = re),
                gs(n, s, x, f))
            var pe = n.memoizedState
            P !== ie || re !== pe || st.current || zn
                ? (typeof de == 'function' &&
                      (Vu(n, o, de, s), (pe = n.memoizedState)),
                  (G = zn || Yf(n, o, G, s, re, pe, D) || !1)
                      ? (oe ||
                            (typeof x.UNSAFE_componentWillUpdate !=
                                'function' &&
                                typeof x.componentWillUpdate != 'function') ||
                            (typeof x.componentWillUpdate == 'function' &&
                                x.componentWillUpdate(s, pe, D),
                            typeof x.UNSAFE_componentWillUpdate == 'function' &&
                                x.UNSAFE_componentWillUpdate(s, pe, D)),
                        typeof x.componentDidUpdate == 'function' &&
                            (n.flags |= 4),
                        typeof x.getSnapshotBeforeUpdate == 'function' &&
                            (n.flags |= 1024))
                      : (typeof x.componentDidUpdate != 'function' ||
                            (P === e.memoizedProps && re === e.memoizedState) ||
                            (n.flags |= 4),
                        typeof x.getSnapshotBeforeUpdate != 'function' ||
                            (P === e.memoizedProps && re === e.memoizedState) ||
                            (n.flags |= 1024),
                        (n.memoizedProps = s),
                        (n.memoizedState = pe)),
                  (x.props = s),
                  (x.state = pe),
                  (x.context = D),
                  (s = G))
                : (typeof x.componentDidUpdate != 'function' ||
                      (P === e.memoizedProps && re === e.memoizedState) ||
                      (n.flags |= 4),
                  typeof x.getSnapshotBeforeUpdate != 'function' ||
                      (P === e.memoizedProps && re === e.memoizedState) ||
                      (n.flags |= 1024),
                  (s = !1))
        }
        return bu(e, n, o, s, h, f)
    }
    function bu(e, n, o, s, f, h) {
        rd(e, n)
        var x = (n.flags & 128) !== 0
        if (!s && !x) return (f && af(n, o, !1), cn(e, n, h))
        ;((s = n.stateNode), (h0.current = n))
        var P =
            x && typeof o.getDerivedStateFromError != 'function'
                ? null
                : s.render()
        return (
            (n.flags |= 1),
            e !== null && x
                ? ((n.child = Hr(n, e.child, null, h)),
                  (n.child = Hr(n, null, P, h)))
                : ot(e, n, P, h),
            (n.memoizedState = s.state),
            f && af(n, o, !0),
            n.child
        )
    }
    function id(e) {
        var n = e.stateNode
        ;(n.pendingContext
            ? lf(e, n.pendingContext, n.pendingContext !== n.context)
            : n.context && lf(e, n.context, !1),
            zu(e, n.containerInfo))
    }
    function sd(e, n, o, s, f) {
        return (Fr(), _u(f), (n.flags |= 256), ot(e, n, o, s), n.child)
    }
    var Xu = {
        dehydrated: null,
        treeContext: null,
        retryLane: 0,
    }
    function Qu(e) {
        return {
            baseLanes: e,
            cachePool: null,
            transitions: null,
        }
    }
    function ld(e, n, o) {
        var s = n.pendingProps,
            f = He.current,
            h = !1,
            x = (n.flags & 128) !== 0,
            P
        if (
            ((P = x) ||
                (P =
                    e !== null && e.memoizedState === null
                        ? !1
                        : (f & 2) !== 0),
            P
                ? ((h = !0), (n.flags &= -129))
                : (e === null || e.memoizedState !== null) && (f |= 1),
            Te(He, f & 1),
            e === null)
        )
            return (
                Su(n),
                (e = n.memoizedState),
                e !== null && ((e = e.dehydrated), e !== null)
                    ? ((n.mode & 1) === 0
                          ? (n.lanes = 1)
                          : e.data === '$!'
                            ? (n.lanes = 8)
                            : (n.lanes = 1073741824),
                      null)
                    : ((x = s.children),
                      (e = s.fallback),
                      h
                          ? ((s = n.mode),
                            (h = n.child),
                            (x = {
                                mode: 'hidden',
                                children: x,
                            }),
                            (s & 1) === 0 && h !== null
                                ? ((h.childLanes = 0), (h.pendingProps = x))
                                : (h = $s(x, s, 0, null)),
                            (e = ur(e, s, o, null)),
                            (h.return = n),
                            (e.return = n),
                            (h.sibling = e),
                            (n.child = h),
                            (n.child.memoizedState = Qu(o)),
                            (n.memoizedState = Xu),
                            e)
                          : Ku(n, x))
            )
        if (
            ((f = e.memoizedState),
            f !== null && ((P = f.dehydrated), P !== null))
        )
            return p0(e, n, x, s, P, f, o)
        if (h) {
            ;((h = s.fallback), (x = n.mode), (f = e.child), (P = f.sibling))
            var D = {
                mode: 'hidden',
                children: s.children,
            }
            return (
                (x & 1) === 0 && n.child !== f
                    ? ((s = n.child),
                      (s.childLanes = 0),
                      (s.pendingProps = D),
                      (n.deletions = null))
                    : ((s = $n(f, D)),
                      (s.subtreeFlags = f.subtreeFlags & 14680064)),
                P !== null
                    ? (h = $n(P, h))
                    : ((h = ur(h, x, o, null)), (h.flags |= 2)),
                (h.return = n),
                (s.return = n),
                (s.sibling = h),
                (n.child = s),
                (s = h),
                (h = n.child),
                (x = e.child.memoizedState),
                (x =
                    x === null
                        ? Qu(o)
                        : {
                              baseLanes: x.baseLanes | o,
                              cachePool: null,
                              transitions: x.transitions,
                          }),
                (h.memoizedState = x),
                (h.childLanes = e.childLanes & ~o),
                (n.memoizedState = Xu),
                s
            )
        }
        return (
            (h = e.child),
            (e = h.sibling),
            (s = $n(h, {
                mode: 'visible',
                children: s.children,
            })),
            (n.mode & 1) === 0 && (s.lanes = o),
            (s.return = n),
            (s.sibling = null),
            e !== null &&
                ((o = n.deletions),
                o === null
                    ? ((n.deletions = [e]), (n.flags |= 16))
                    : o.push(e)),
            (n.child = s),
            (n.memoizedState = null),
            s
        )
    }
    function Ku(e, n) {
        return (
            (n = $s(
                {
                    mode: 'visible',
                    children: n,
                },
                e.mode,
                0,
                null
            )),
            (n.return = e),
            (e.child = n)
        )
    }
    function Es(e, n, o, s) {
        return (
            s !== null && _u(s),
            Hr(n, e.child, null, o),
            (e = Ku(n, n.pendingProps.children)),
            (e.flags |= 2),
            (n.memoizedState = null),
            e
        )
    }
    function p0(e, n, o, s, f, h, x) {
        if (o)
            return n.flags & 256
                ? ((n.flags &= -257), (s = Uu(Error(i(422)))), Es(e, n, x, s))
                : n.memoizedState !== null
                  ? ((n.child = e.child), (n.flags |= 128), null)
                  : ((h = s.fallback),
                    (f = n.mode),
                    (s = $s(
                        {
                            mode: 'visible',
                            children: s.children,
                        },
                        f,
                        0,
                        null
                    )),
                    (h = ur(h, f, x, null)),
                    (h.flags |= 2),
                    (s.return = n),
                    (h.return = n),
                    (s.sibling = h),
                    (n.child = s),
                    (n.mode & 1) !== 0 && Hr(n, e.child, null, x),
                    (n.child.memoizedState = Qu(x)),
                    (n.memoizedState = Xu),
                    h)
        if ((n.mode & 1) === 0) return Es(e, n, x, null)
        if (f.data === '$!') {
            if (((s = f.nextSibling && f.nextSibling.dataset), s))
                var P = s.dgst
            return (
                (s = P),
                (h = Error(i(419))),
                (s = Uu(h, s, void 0)),
                Es(e, n, x, s)
            )
        }
        if (((P = (x & e.childLanes) !== 0), ut || P)) {
            if (((s = Ge), s !== null)) {
                switch (x & -x) {
                    case 4:
                        f = 2
                        break
                    case 16:
                        f = 8
                        break
                    case 64:
                    case 128:
                    case 256:
                    case 512:
                    case 1024:
                    case 2048:
                    case 4096:
                    case 8192:
                    case 16384:
                    case 32768:
                    case 65536:
                    case 131072:
                    case 262144:
                    case 524288:
                    case 1048576:
                    case 2097152:
                    case 4194304:
                    case 8388608:
                    case 16777216:
                    case 33554432:
                    case 67108864:
                        f = 32
                        break
                    case 536870912:
                        f = 268435456
                        break
                    default:
                        f = 0
                }
                ;((f = (f & (s.suspendedLanes | x)) !== 0 ? 0 : f),
                    f !== 0 &&
                        f !== h.retryLane &&
                        ((h.retryLane = f), un(e, f), $t(s, e, f, -1)))
            }
            return (fa(), (s = Uu(Error(i(421)))), Es(e, n, x, s))
        }
        return f.data === '$?'
            ? ((n.flags |= 128),
              (n.child = e.child),
              (n = M0.bind(null, e)),
              (f._reactRetry = n),
              null)
            : ((e = h.treeContext),
              (vt = Cn(f.nextSibling)),
              (yt = n),
              (Ae = !0),
              (Tt = null),
              e !== null &&
                  ((kt[Ct++] = sn),
                  (kt[Ct++] = ln),
                  (kt[Ct++] = Jn),
                  (sn = e.id),
                  (ln = e.overflow),
                  (Jn = n)),
              (n = Ku(n, s.children)),
              (n.flags |= 4096),
              n)
    }
    function ud(e, n, o) {
        e.lanes |= n
        var s = e.alternate
        ;(s !== null && (s.lanes |= n), Nu(e.return, n, o))
    }
    function Gu(e, n, o, s, f) {
        var h = e.memoizedState
        h === null
            ? (e.memoizedState = {
                  isBackwards: n,
                  rendering: null,
                  renderingStartTime: 0,
                  last: s,
                  tail: o,
                  tailMode: f,
              })
            : ((h.isBackwards = n),
              (h.rendering = null),
              (h.renderingStartTime = 0),
              (h.last = s),
              (h.tail = o),
              (h.tailMode = f))
    }
    function ad(e, n, o) {
        var s = n.pendingProps,
            f = s.revealOrder,
            h = s.tail
        if ((ot(e, n, s.children, o), (s = He.current), (s & 2) !== 0))
            ((s = (s & 1) | 2), (n.flags |= 128))
        else {
            if (e !== null && (e.flags & 128) !== 0)
                e: for (e = n.child; e !== null; ) {
                    if (e.tag === 13) e.memoizedState !== null && ud(e, o, n)
                    else if (e.tag === 19) ud(e, o, n)
                    else if (e.child !== null) {
                        ;((e.child.return = e), (e = e.child))
                        continue
                    }
                    if (e === n) break e
                    for (; e.sibling === null; ) {
                        if (e.return === null || e.return === n) break e
                        e = e.return
                    }
                    ;((e.sibling.return = e.return), (e = e.sibling))
                }
            s &= 1
        }
        if ((Te(He, s), (n.mode & 1) === 0)) n.memoizedState = null
        else
            switch (f) {
                case 'forwards':
                    for (o = n.child, f = null; o !== null; )
                        ((e = o.alternate),
                            e !== null && ms(e) === null && (f = o),
                            (o = o.sibling))
                    ;((o = f),
                        o === null
                            ? ((f = n.child), (n.child = null))
                            : ((f = o.sibling), (o.sibling = null)),
                        Gu(n, !1, f, o, h))
                    break
                case 'backwards':
                    for (o = null, f = n.child, n.child = null; f !== null; ) {
                        if (((e = f.alternate), e !== null && ms(e) === null)) {
                            n.child = f
                            break
                        }
                        ;((e = f.sibling), (f.sibling = o), (o = f), (f = e))
                    }
                    Gu(n, !0, o, null, h)
                    break
                case 'together':
                    Gu(n, !1, null, null, void 0)
                    break
                default:
                    n.memoizedState = null
            }
        return n.child
    }
    function ks(e, n) {
        ;(n.mode & 1) === 0 &&
            e !== null &&
            ((e.alternate = null), (n.alternate = null), (n.flags |= 2))
    }
    function cn(e, n, o) {
        if (
            (e !== null && (n.dependencies = e.dependencies),
            (or |= n.lanes),
            (o & n.childLanes) === 0)
        )
            return null
        if (e !== null && n.child !== e.child) throw Error(i(153))
        if (n.child !== null) {
            for (
                e = n.child,
                    o = $n(e, e.pendingProps),
                    n.child = o,
                    o.return = n;
                e.sibling !== null;
            )
                ((e = e.sibling),
                    (o = o.sibling = $n(e, e.pendingProps)),
                    (o.return = n))
            o.sibling = null
        }
        return n.child
    }
    function g0(e, n, o) {
        switch (n.tag) {
            case 3:
                ;(id(n), Fr())
                break
            case 5:
                Ef(n)
                break
            case 1:
                lt(n.type) && ss(n)
                break
            case 4:
                zu(n, n.stateNode.containerInfo)
                break
            case 10:
                var s = n.type._context,
                    f = n.memoizedProps.value
                ;(Te(ds, s._currentValue), (s._currentValue = f))
                break
            case 13:
                if (((s = n.memoizedState), s !== null))
                    return s.dehydrated !== null
                        ? (Te(He, He.current & 1), (n.flags |= 128), null)
                        : (o & n.child.childLanes) !== 0
                          ? ld(e, n, o)
                          : (Te(He, He.current & 1),
                            (e = cn(e, n, o)),
                            e !== null ? e.sibling : null)
                Te(He, He.current & 1)
                break
            case 19:
                if (((s = (o & n.childLanes) !== 0), (e.flags & 128) !== 0)) {
                    if (s) return ad(e, n, o)
                    n.flags |= 128
                }
                if (
                    ((f = n.memoizedState),
                    f !== null &&
                        ((f.rendering = null),
                        (f.tail = null),
                        (f.lastEffect = null)),
                    Te(He, He.current),
                    s)
                )
                    break
                return null
            case 22:
            case 23:
                return ((n.lanes = 0), nd(e, n, o))
        }
        return cn(e, n, o)
    }
    var cd, qu, fd, dd
    ;((cd = function (e, n) {
        for (var o = n.child; o !== null; ) {
            if (o.tag === 5 || o.tag === 6) e.appendChild(o.stateNode)
            else if (o.tag !== 4 && o.child !== null) {
                ;((o.child.return = o), (o = o.child))
                continue
            }
            if (o === n) break
            for (; o.sibling === null; ) {
                if (o.return === null || o.return === n) return
                o = o.return
            }
            ;((o.sibling.return = o.return), (o = o.sibling))
        }
    }),
        (qu = function () {}),
        (fd = function (e, n, o, s) {
            var f = e.memoizedProps
            if (f !== s) {
                ;((e = n.stateNode), nr(Yt.current))
                var h = null
                switch (o) {
                    case 'input':
                        ;((f = Ne(e, f)), (s = Ne(e, s)), (h = []))
                        break
                    case 'select':
                        ;((f = j({}, f, {
                            value: void 0,
                        })),
                            (s = j({}, s, {
                                value: void 0,
                            })),
                            (h = []))
                        break
                    case 'textarea':
                        ;((f = Jt(e, f)), (s = Jt(e, s)), (h = []))
                        break
                    default:
                        typeof f.onClick != 'function' &&
                            typeof s.onClick == 'function' &&
                            (e.onclick = rs)
                }
                ao(o, s)
                var x
                o = null
                for (G in f)
                    if (
                        !s.hasOwnProperty(G) &&
                        f.hasOwnProperty(G) &&
                        f[G] != null
                    )
                        if (G === 'style') {
                            var P = f[G]
                            for (x in P)
                                P.hasOwnProperty(x) &&
                                    (o || (o = {}), (o[x] = ''))
                        } else
                            G !== 'dangerouslySetInnerHTML' &&
                                G !== 'children' &&
                                G !== 'suppressContentEditableWarning' &&
                                G !== 'suppressHydrationWarning' &&
                                G !== 'autoFocus' &&
                                (u.hasOwnProperty(G)
                                    ? h || (h = [])
                                    : (h = h || []).push(G, null))
                for (G in s) {
                    var D = s[G]
                    if (
                        ((P = f != null ? f[G] : void 0),
                        s.hasOwnProperty(G) &&
                            D !== P &&
                            (D != null || P != null))
                    )
                        if (G === 'style')
                            if (P) {
                                for (x in P)
                                    !P.hasOwnProperty(x) ||
                                        (D && D.hasOwnProperty(x)) ||
                                        (o || (o = {}), (o[x] = ''))
                                for (x in D)
                                    D.hasOwnProperty(x) &&
                                        P[x] !== D[x] &&
                                        (o || (o = {}), (o[x] = D[x]))
                            } else (o || (h || (h = []), h.push(G, o)), (o = D))
                        else
                            G === 'dangerouslySetInnerHTML'
                                ? ((D = D ? D.__html : void 0),
                                  (P = P ? P.__html : void 0),
                                  D != null &&
                                      P !== D &&
                                      (h = h || []).push(G, D))
                                : G === 'children'
                                  ? (typeof D != 'string' &&
                                        typeof D != 'number') ||
                                    (h = h || []).push(G, '' + D)
                                  : G !== 'suppressContentEditableWarning' &&
                                    G !== 'suppressHydrationWarning' &&
                                    (u.hasOwnProperty(G)
                                        ? (D != null &&
                                              G === 'onScroll' &&
                                              Re('scroll', e),
                                          h || P === D || (h = []))
                                        : (h = h || []).push(G, D))
                }
                o && (h = h || []).push('style', o)
                var G = h
                ;(n.updateQueue = G) && (n.flags |= 4)
            }
        }),
        (dd = function (e, n, o, s) {
            o !== s && (n.flags |= 4)
        }))
    function Qo(e, n) {
        if (!Ae)
            switch (e.tailMode) {
                case 'hidden':
                    n = e.tail
                    for (var o = null; n !== null; )
                        (n.alternate !== null && (o = n), (n = n.sibling))
                    o === null ? (e.tail = null) : (o.sibling = null)
                    break
                case 'collapsed':
                    o = e.tail
                    for (var s = null; o !== null; )
                        (o.alternate !== null && (s = o), (o = o.sibling))
                    s === null
                        ? n || e.tail === null
                            ? (e.tail = null)
                            : (e.tail.sibling = null)
                        : (s.sibling = null)
            }
    }
    function nt(e) {
        var n = e.alternate !== null && e.alternate.child === e.child,
            o = 0,
            s = 0
        if (n)
            for (var f = e.child; f !== null; )
                ((o |= f.lanes | f.childLanes),
                    (s |= f.subtreeFlags & 14680064),
                    (s |= f.flags & 14680064),
                    (f.return = e),
                    (f = f.sibling))
        else
            for (f = e.child; f !== null; )
                ((o |= f.lanes | f.childLanes),
                    (s |= f.subtreeFlags),
                    (s |= f.flags),
                    (f.return = e),
                    (f = f.sibling))
        return ((e.subtreeFlags |= s), (e.childLanes = o), n)
    }
    function m0(e, n, o) {
        var s = n.pendingProps
        switch ((xu(n), n.tag)) {
            case 2:
            case 16:
            case 15:
            case 0:
            case 11:
            case 7:
            case 8:
            case 12:
            case 9:
            case 14:
                return (nt(n), null)
            case 1:
                return (lt(n.type) && is(), nt(n), null)
            case 3:
                return (
                    (s = n.stateNode),
                    Br(),
                    De(st),
                    De(et),
                    Tu(),
                    s.pendingContext &&
                        ((s.context = s.pendingContext),
                        (s.pendingContext = null)),
                    (e === null || e.child === null) &&
                        (cs(n)
                            ? (n.flags |= 4)
                            : e === null ||
                              (e.memoizedState.isDehydrated &&
                                  (n.flags & 256) === 0) ||
                              ((n.flags |= 1024),
                              Tt !== null && (ua(Tt), (Tt = null)))),
                    qu(e, n),
                    nt(n),
                    null
                )
            case 5:
                Lu(n)
                var f = nr(Uo.current)
                if (((o = n.type), e !== null && n.stateNode != null))
                    (fd(e, n, o, s, f),
                        e.ref !== n.ref &&
                            ((n.flags |= 512), (n.flags |= 2097152)))
                else {
                    if (!s) {
                        if (n.stateNode === null) throw Error(i(166))
                        return (nt(n), null)
                    }
                    if (((e = nr(Yt.current)), cs(n))) {
                        ;((s = n.stateNode), (o = n.type))
                        var h = n.memoizedProps
                        switch (
                            ((s[Wt] = n),
                            (s[Fo] = h),
                            (e = (n.mode & 1) !== 0),
                            o)
                        ) {
                            case 'dialog':
                                ;(Re('cancel', s), Re('close', s))
                                break
                            case 'iframe':
                            case 'object':
                            case 'embed':
                                Re('load', s)
                                break
                            case 'video':
                            case 'audio':
                                for (f = 0; f < Ao.length; f++) Re(Ao[f], s)
                                break
                            case 'source':
                                Re('error', s)
                                break
                            case 'img':
                            case 'image':
                            case 'link':
                                ;(Re('error', s), Re('load', s))
                                break
                            case 'details':
                                Re('toggle', s)
                                break
                            case 'input':
                                ;(Ie(s, h), Re('invalid', s))
                                break
                            case 'select':
                                ;((s._wrapperState = {
                                    wasMultiple: !!h.multiple,
                                }),
                                    Re('invalid', s))
                                break
                            case 'textarea':
                                ;(mn(s, h), Re('invalid', s))
                        }
                        ;(ao(o, h), (f = null))
                        for (var x in h)
                            if (h.hasOwnProperty(x)) {
                                var P = h[x]
                                x === 'children'
                                    ? typeof P == 'string'
                                        ? s.textContent !== P &&
                                          (h.suppressHydrationWarning !== !0 &&
                                              ns(s.textContent, P, e),
                                          (f = ['children', P]))
                                        : typeof P == 'number' &&
                                          s.textContent !== '' + P &&
                                          (h.suppressHydrationWarning !== !0 &&
                                              ns(s.textContent, P, e),
                                          (f = ['children', '' + P]))
                                    : u.hasOwnProperty(x) &&
                                      P != null &&
                                      x === 'onScroll' &&
                                      Re('scroll', s)
                            }
                        switch (o) {
                            case 'input':
                                ;(_e(s), Lt(s, h, !0))
                                break
                            case 'textarea':
                                ;(_e(s), Un(s))
                                break
                            case 'select':
                            case 'option':
                                break
                            default:
                                typeof h.onClick == 'function' &&
                                    (s.onclick = rs)
                        }
                        ;((s = f),
                            (n.updateQueue = s),
                            s !== null && (n.flags |= 4))
                    } else {
                        ;((x = f.nodeType === 9 ? f : f.ownerDocument),
                            e === 'http://www.w3.org/1999/xhtml' && (e = en(o)),
                            e === 'http://www.w3.org/1999/xhtml'
                                ? o === 'script'
                                    ? ((e = x.createElement('div')),
                                      (e.innerHTML = '<script><\/script>'),
                                      (e = e.removeChild(e.firstChild)))
                                    : typeof s.is == 'string'
                                      ? (e = x.createElement(o, {
                                            is: s.is,
                                        }))
                                      : ((e = x.createElement(o)),
                                        o === 'select' &&
                                            ((x = e),
                                            s.multiple
                                                ? (x.multiple = !0)
                                                : s.size && (x.size = s.size)))
                                : (e = x.createElementNS(e, o)),
                            (e[Wt] = n),
                            (e[Fo] = s),
                            cd(e, n, !1, !1),
                            (n.stateNode = e))
                        e: {
                            switch (((x = co(o, s)), o)) {
                                case 'dialog':
                                    ;(Re('cancel', e), Re('close', e), (f = s))
                                    break
                                case 'iframe':
                                case 'object':
                                case 'embed':
                                    ;(Re('load', e), (f = s))
                                    break
                                case 'video':
                                case 'audio':
                                    for (f = 0; f < Ao.length; f++) Re(Ao[f], e)
                                    f = s
                                    break
                                case 'source':
                                    ;(Re('error', e), (f = s))
                                    break
                                case 'img':
                                case 'image':
                                case 'link':
                                    ;(Re('error', e), Re('load', e), (f = s))
                                    break
                                case 'details':
                                    ;(Re('toggle', e), (f = s))
                                    break
                                case 'input':
                                    ;(Ie(e, s),
                                        (f = Ne(e, s)),
                                        Re('invalid', e))
                                    break
                                case 'option':
                                    f = s
                                    break
                                case 'select':
                                    ;((e._wrapperState = {
                                        wasMultiple: !!s.multiple,
                                    }),
                                        (f = j({}, s, {
                                            value: void 0,
                                        })),
                                        Re('invalid', e))
                                    break
                                case 'textarea':
                                    ;(mn(e, s),
                                        (f = Jt(e, s)),
                                        Re('invalid', e))
                                    break
                                default:
                                    f = s
                            }
                            ;(ao(o, f), (P = f))
                            for (h in P)
                                if (P.hasOwnProperty(h)) {
                                    var D = P[h]
                                    h === 'style'
                                        ? Mi(e, D)
                                        : h === 'dangerouslySetInnerHTML'
                                          ? ((D = D ? D.__html : void 0),
                                            D != null && Ci(e, D))
                                          : h === 'children'
                                            ? typeof D == 'string'
                                                ? (o !== 'textarea' ||
                                                      D !== '') &&
                                                  nn(e, D)
                                                : typeof D == 'number' &&
                                                  nn(e, '' + D)
                                            : h !==
                                                  'suppressContentEditableWarning' &&
                                              h !==
                                                  'suppressHydrationWarning' &&
                                              h !== 'autoFocus' &&
                                              (u.hasOwnProperty(h)
                                                  ? D != null &&
                                                    h === 'onScroll' &&
                                                    Re('scroll', e)
                                                  : D != null && w(e, h, D, x))
                                }
                            switch (o) {
                                case 'input':
                                    ;(_e(e), Lt(e, s, !1))
                                    break
                                case 'textarea':
                                    ;(_e(e), Un(e))
                                    break
                                case 'option':
                                    s.value != null &&
                                        e.setAttribute('value', '' + J(s.value))
                                    break
                                case 'select':
                                    ;((e.multiple = !!s.multiple),
                                        (h = s.value),
                                        h != null
                                            ? _t(e, !!s.multiple, h, !1)
                                            : s.defaultValue != null &&
                                              _t(
                                                  e,
                                                  !!s.multiple,
                                                  s.defaultValue,
                                                  !0
                                              ))
                                    break
                                default:
                                    typeof f.onClick == 'function' &&
                                        (e.onclick = rs)
                            }
                            switch (o) {
                                case 'button':
                                case 'input':
                                case 'select':
                                case 'textarea':
                                    s = !!s.autoFocus
                                    break e
                                case 'img':
                                    s = !0
                                    break e
                                default:
                                    s = !1
                            }
                        }
                        s && (n.flags |= 4)
                    }
                    n.ref !== null && ((n.flags |= 512), (n.flags |= 2097152))
                }
                return (nt(n), null)
            case 6:
                if (e && n.stateNode != null) dd(e, n, e.memoizedProps, s)
                else {
                    if (typeof s != 'string' && n.stateNode === null)
                        throw Error(i(166))
                    if (((o = nr(Uo.current)), nr(Yt.current), cs(n))) {
                        if (
                            ((s = n.stateNode),
                            (o = n.memoizedProps),
                            (s[Wt] = n),
                            (h = s.nodeValue !== o) && ((e = yt), e !== null))
                        )
                            switch (e.tag) {
                                case 3:
                                    ns(s.nodeValue, o, (e.mode & 1) !== 0)
                                    break
                                case 5:
                                    e.memoizedProps.suppressHydrationWarning !==
                                        !0 &&
                                        ns(s.nodeValue, o, (e.mode & 1) !== 0)
                            }
                        h && (n.flags |= 4)
                    } else
                        ((s = (
                            o.nodeType === 9 ? o : o.ownerDocument
                        ).createTextNode(s)),
                            (s[Wt] = n),
                            (n.stateNode = s))
                }
                return (nt(n), null)
            case 13:
                if (
                    (De(He),
                    (s = n.memoizedState),
                    e === null ||
                        (e.memoizedState !== null &&
                            e.memoizedState.dehydrated !== null))
                ) {
                    if (
                        Ae &&
                        vt !== null &&
                        (n.mode & 1) !== 0 &&
                        (n.flags & 128) === 0
                    )
                        (gf(), Fr(), (n.flags |= 98560), (h = !1))
                    else if (
                        ((h = cs(n)), s !== null && s.dehydrated !== null)
                    ) {
                        if (e === null) {
                            if (!h) throw Error(i(318))
                            if (
                                ((h = n.memoizedState),
                                (h = h !== null ? h.dehydrated : null),
                                !h)
                            )
                                throw Error(i(317))
                            h[Wt] = n
                        } else
                            (Fr(),
                                (n.flags & 128) === 0 &&
                                    (n.memoizedState = null),
                                (n.flags |= 4))
                        ;(nt(n), (h = !1))
                    } else (Tt !== null && (ua(Tt), (Tt = null)), (h = !0))
                    if (!h) return n.flags & 65536 ? n : null
                }
                return (n.flags & 128) !== 0
                    ? ((n.lanes = o), n)
                    : ((s = s !== null),
                      s !== (e !== null && e.memoizedState !== null) &&
                          s &&
                          ((n.child.flags |= 8192),
                          (n.mode & 1) !== 0 &&
                              (e === null || (He.current & 1) !== 0
                                  ? Qe === 0 && (Qe = 3)
                                  : fa())),
                      n.updateQueue !== null && (n.flags |= 4),
                      nt(n),
                      null)
            case 4:
                return (
                    Br(),
                    qu(e, n),
                    e === null && $o(n.stateNode.containerInfo),
                    nt(n),
                    null
                )
            case 10:
                return (Cu(n.type._context), nt(n), null)
            case 17:
                return (lt(n.type) && is(), nt(n), null)
            case 19:
                if ((De(He), (h = n.memoizedState), h === null))
                    return (nt(n), null)
                if (
                    ((s = (n.flags & 128) !== 0), (x = h.rendering), x === null)
                )
                    if (s) Qo(h, !1)
                    else {
                        if (Qe !== 0 || (e !== null && (e.flags & 128) !== 0))
                            for (e = n.child; e !== null; ) {
                                if (((x = ms(e)), x !== null)) {
                                    for (
                                        n.flags |= 128,
                                            Qo(h, !1),
                                            s = x.updateQueue,
                                            s !== null &&
                                                ((n.updateQueue = s),
                                                (n.flags |= 4)),
                                            n.subtreeFlags = 0,
                                            s = o,
                                            o = n.child;
                                        o !== null;
                                    )
                                        ((h = o),
                                            (e = s),
                                            (h.flags &= 14680066),
                                            (x = h.alternate),
                                            x === null
                                                ? ((h.childLanes = 0),
                                                  (h.lanes = e),
                                                  (h.child = null),
                                                  (h.subtreeFlags = 0),
                                                  (h.memoizedProps = null),
                                                  (h.memoizedState = null),
                                                  (h.updateQueue = null),
                                                  (h.dependencies = null),
                                                  (h.stateNode = null))
                                                : ((h.childLanes =
                                                      x.childLanes),
                                                  (h.lanes = x.lanes),
                                                  (h.child = x.child),
                                                  (h.subtreeFlags = 0),
                                                  (h.deletions = null),
                                                  (h.memoizedProps =
                                                      x.memoizedProps),
                                                  (h.memoizedState =
                                                      x.memoizedState),
                                                  (h.updateQueue =
                                                      x.updateQueue),
                                                  (h.type = x.type),
                                                  (e = x.dependencies),
                                                  (h.dependencies =
                                                      e === null
                                                          ? null
                                                          : {
                                                                lanes: e.lanes,
                                                                firstContext:
                                                                    e.firstContext,
                                                            })),
                                            (o = o.sibling))
                                    return (
                                        Te(He, (He.current & 1) | 2),
                                        n.child
                                    )
                                }
                                e = e.sibling
                            }
                        h.tail !== null &&
                            Fe() > br &&
                            ((n.flags |= 128),
                            (s = !0),
                            Qo(h, !1),
                            (n.lanes = 4194304))
                    }
                else {
                    if (!s)
                        if (((e = ms(x)), e !== null)) {
                            if (
                                ((n.flags |= 128),
                                (s = !0),
                                (o = e.updateQueue),
                                o !== null &&
                                    ((n.updateQueue = o), (n.flags |= 4)),
                                Qo(h, !0),
                                h.tail === null &&
                                    h.tailMode === 'hidden' &&
                                    !x.alternate &&
                                    !Ae)
                            )
                                return (nt(n), null)
                        } else
                            2 * Fe() - h.renderingStartTime > br &&
                                o !== 1073741824 &&
                                ((n.flags |= 128),
                                (s = !0),
                                Qo(h, !1),
                                (n.lanes = 4194304))
                    h.isBackwards
                        ? ((x.sibling = n.child), (n.child = x))
                        : ((o = h.last),
                          o !== null ? (o.sibling = x) : (n.child = x),
                          (h.last = x))
                }
                return h.tail !== null
                    ? ((n = h.tail),
                      (h.rendering = n),
                      (h.tail = n.sibling),
                      (h.renderingStartTime = Fe()),
                      (n.sibling = null),
                      (o = He.current),
                      Te(He, s ? (o & 1) | 2 : o & 1),
                      n)
                    : (nt(n), null)
            case 22:
            case 23:
                return (
                    ca(),
                    (s = n.memoizedState !== null),
                    e !== null &&
                        (e.memoizedState !== null) !== s &&
                        (n.flags |= 8192),
                    s && (n.mode & 1) !== 0
                        ? (xt & 1073741824) !== 0 &&
                          (nt(n), n.subtreeFlags & 6 && (n.flags |= 8192))
                        : nt(n),
                    null
                )
            case 24:
                return null
            case 25:
                return null
        }
        throw Error(i(156, n.tag))
    }
    function y0(e, n) {
        switch ((xu(n), n.tag)) {
            case 1:
                return (
                    lt(n.type) && is(),
                    (e = n.flags),
                    e & 65536 ? ((n.flags = (e & -65537) | 128), n) : null
                )
            case 3:
                return (
                    Br(),
                    De(st),
                    De(et),
                    Tu(),
                    (e = n.flags),
                    (e & 65536) !== 0 && (e & 128) === 0
                        ? ((n.flags = (e & -65537) | 128), n)
                        : null
                )
            case 5:
                return (Lu(n), null)
            case 13:
                if (
                    (De(He),
                    (e = n.memoizedState),
                    e !== null && e.dehydrated !== null)
                ) {
                    if (n.alternate === null) throw Error(i(340))
                    Fr()
                }
                return (
                    (e = n.flags),
                    e & 65536 ? ((n.flags = (e & -65537) | 128), n) : null
                )
            case 19:
                return (De(He), null)
            case 4:
                return (Br(), null)
            case 10:
                return (Cu(n.type._context), null)
            case 22:
            case 23:
                return (ca(), null)
            case 24:
                return null
            default:
                return null
        }
    }
    var Cs = !1,
        rt = !1,
        v0 = typeof WeakSet == 'function' ? WeakSet : Set,
        he = null
    function Wr(e, n) {
        var o = e.ref
        if (o !== null)
            if (typeof o == 'function')
                try {
                    o(null)
                } catch (s) {
                    Ve(e, n, s)
                }
            else o.current = null
    }
    function Zu(e, n, o) {
        try {
            o()
        } catch (s) {
            Ve(e, n, s)
        }
    }
    var hd = !1
    function x0(e, n) {
        if (((cu = Yi), (e = Wc()), nu(e))) {
            if ('selectionStart' in e)
                var o = {
                    start: e.selectionStart,
                    end: e.selectionEnd,
                }
            else
                e: {
                    o = ((o = e.ownerDocument) && o.defaultView) || window
                    var s = o.getSelection && o.getSelection()
                    if (s && s.rangeCount !== 0) {
                        o = s.anchorNode
                        var f = s.anchorOffset,
                            h = s.focusNode
                        s = s.focusOffset
                        try {
                            ;(o.nodeType, h.nodeType)
                        } catch {
                            o = null
                            break e
                        }
                        var x = 0,
                            P = -1,
                            D = -1,
                            G = 0,
                            oe = 0,
                            ie = e,
                            re = null
                        t: for (;;) {
                            for (
                                var de;
                                ie !== o ||
                                    (f !== 0 && ie.nodeType !== 3) ||
                                    (P = x + f),
                                    ie !== h ||
                                        (s !== 0 && ie.nodeType !== 3) ||
                                        (D = x + s),
                                    ie.nodeType === 3 &&
                                        (x += ie.nodeValue.length),
                                    (de = ie.firstChild) !== null;
                            )
                                ((re = ie), (ie = de))
                            for (;;) {
                                if (ie === e) break t
                                if (
                                    (re === o && ++G === f && (P = x),
                                    re === h && ++oe === s && (D = x),
                                    (de = ie.nextSibling) !== null)
                                )
                                    break
                                ;((ie = re), (re = ie.parentNode))
                            }
                            ie = de
                        }
                        o =
                            P === -1 || D === -1
                                ? null
                                : {
                                      start: P,
                                      end: D,
                                  }
                    } else o = null
                }
            o = o || {
                start: 0,
                end: 0,
            }
        } else o = null
        for (
            fu = {
                focusedElem: e,
                selectionRange: o,
            },
                Yi = !1,
                he = n;
            he !== null;
        )
            if (
                ((n = he),
                (e = n.child),
                (n.subtreeFlags & 1028) !== 0 && e !== null)
            )
                ((e.return = n), (he = e))
            else
                for (; he !== null; ) {
                    n = he
                    try {
                        var pe = n.alternate
                        if ((n.flags & 1024) !== 0)
                            switch (n.tag) {
                                case 0:
                                case 11:
                                case 15:
                                    break
                                case 1:
                                    if (pe !== null) {
                                        var ge = pe.memoizedProps,
                                            Be = pe.memoizedState,
                                            Y = n.stateNode,
                                            O = Y.getSnapshotBeforeUpdate(
                                                n.elementType === n.type
                                                    ? ge
                                                    : Rt(n.type, ge),
                                                Be
                                            )
                                        Y.__reactInternalSnapshotBeforeUpdate =
                                            O
                                    }
                                    break
                                case 3:
                                    var X = n.stateNode.containerInfo
                                    X.nodeType === 1
                                        ? (X.textContent = '')
                                        : X.nodeType === 9 &&
                                          X.documentElement &&
                                          X.removeChild(X.documentElement)
                                    break
                                case 5:
                                case 6:
                                case 4:
                                case 17:
                                    break
                                default:
                                    throw Error(i(163))
                            }
                    } catch (se) {
                        Ve(n, n.return, se)
                    }
                    if (((e = n.sibling), e !== null)) {
                        ;((e.return = n.return), (he = e))
                        break
                    }
                    he = n.return
                }
        return ((pe = hd), (hd = !1), pe)
    }
    function Ko(e, n, o) {
        var s = n.updateQueue
        if (((s = s !== null ? s.lastEffect : null), s !== null)) {
            var f = (s = s.next)
            do {
                if ((f.tag & e) === e) {
                    var h = f.destroy
                    ;((f.destroy = void 0), h !== void 0 && Zu(n, o, h))
                }
                f = f.next
            } while (f !== s)
        }
    }
    function Ns(e, n) {
        if (
            ((n = n.updateQueue),
            (n = n !== null ? n.lastEffect : null),
            n !== null)
        ) {
            var o = (n = n.next)
            do {
                if ((o.tag & e) === e) {
                    var s = o.create
                    o.destroy = s()
                }
                o = o.next
            } while (o !== n)
        }
    }
    function Ju(e) {
        var n = e.ref
        if (n !== null) {
            var o = e.stateNode
            switch (e.tag) {
                case 5:
                    e = o
                    break
                default:
                    e = o
            }
            typeof n == 'function' ? n(e) : (n.current = e)
        }
    }
    function pd(e) {
        var n = e.alternate
        ;(n !== null && ((e.alternate = null), pd(n)),
            (e.child = null),
            (e.deletions = null),
            (e.sibling = null),
            e.tag === 5 &&
                ((n = e.stateNode),
                n !== null &&
                    (delete n[Wt],
                    delete n[Fo],
                    delete n[gu],
                    delete n[t0],
                    delete n[n0])),
            (e.stateNode = null),
            (e.return = null),
            (e.dependencies = null),
            (e.memoizedProps = null),
            (e.memoizedState = null),
            (e.pendingProps = null),
            (e.stateNode = null),
            (e.updateQueue = null))
    }
    function gd(e) {
        return e.tag === 5 || e.tag === 3 || e.tag === 4
    }
    function md(e) {
        e: for (;;) {
            for (; e.sibling === null; ) {
                if (e.return === null || gd(e.return)) return null
                e = e.return
            }
            for (
                e.sibling.return = e.return, e = e.sibling;
                e.tag !== 5 && e.tag !== 6 && e.tag !== 18;
            ) {
                if (e.flags & 2 || e.child === null || e.tag === 4) continue e
                ;((e.child.return = e), (e = e.child))
            }
            if (!(e.flags & 2)) return e.stateNode
        }
    }
    function ea(e, n, o) {
        var s = e.tag
        if (s === 5 || s === 6)
            ((e = e.stateNode),
                n
                    ? o.nodeType === 8
                        ? o.parentNode.insertBefore(e, n)
                        : o.insertBefore(e, n)
                    : (o.nodeType === 8
                          ? ((n = o.parentNode), n.insertBefore(e, o))
                          : ((n = o), n.appendChild(e)),
                      (o = o._reactRootContainer),
                      o != null || n.onclick !== null || (n.onclick = rs)))
        else if (s !== 4 && ((e = e.child), e !== null))
            for (ea(e, n, o), e = e.sibling; e !== null; )
                (ea(e, n, o), (e = e.sibling))
    }
    function ta(e, n, o) {
        var s = e.tag
        if (s === 5 || s === 6)
            ((e = e.stateNode), n ? o.insertBefore(e, n) : o.appendChild(e))
        else if (s !== 4 && ((e = e.child), e !== null))
            for (ta(e, n, o), e = e.sibling; e !== null; )
                (ta(e, n, o), (e = e.sibling))
    }
    var Ze = null,
        Dt = !1
    function In(e, n, o) {
        for (o = o.child; o !== null; ) (yd(e, n, o), (o = o.sibling))
    }
    function yd(e, n, o) {
        if (Et && typeof Et.onCommitFiberUnmount == 'function')
            try {
                Et.onCommitFiberUnmount(Kn, o)
            } catch {}
        switch (o.tag) {
            case 5:
                rt || Wr(o, n)
            case 6:
                var s = Ze,
                    f = Dt
                ;((Ze = null),
                    In(e, n, o),
                    (Ze = s),
                    (Dt = f),
                    Ze !== null &&
                        (Dt
                            ? ((e = Ze),
                              (o = o.stateNode),
                              e.nodeType === 8
                                  ? e.parentNode.removeChild(o)
                                  : e.removeChild(o))
                            : Ze.removeChild(o.stateNode)))
                break
            case 18:
                Ze !== null &&
                    (Dt
                        ? ((e = Ze),
                          (o = o.stateNode),
                          e.nodeType === 8
                              ? pu(e.parentNode, o)
                              : e.nodeType === 1 && pu(e, o),
                          Mo(e))
                        : pu(Ze, o.stateNode))
                break
            case 4:
                ;((s = Ze),
                    (f = Dt),
                    (Ze = o.stateNode.containerInfo),
                    (Dt = !0),
                    In(e, n, o),
                    (Ze = s),
                    (Dt = f))
                break
            case 0:
            case 11:
            case 14:
            case 15:
                if (
                    !rt &&
                    ((s = o.updateQueue),
                    s !== null && ((s = s.lastEffect), s !== null))
                ) {
                    f = s = s.next
                    do {
                        var h = f,
                            x = h.destroy
                        ;((h = h.tag),
                            x !== void 0 &&
                                ((h & 2) !== 0 || (h & 4) !== 0) &&
                                Zu(o, n, x),
                            (f = f.next))
                    } while (f !== s)
                }
                In(e, n, o)
                break
            case 1:
                if (
                    !rt &&
                    (Wr(o, n),
                    (s = o.stateNode),
                    typeof s.componentWillUnmount == 'function')
                )
                    try {
                        ;((s.props = o.memoizedProps),
                            (s.state = o.memoizedState),
                            s.componentWillUnmount())
                    } catch (P) {
                        Ve(o, n, P)
                    }
                In(e, n, o)
                break
            case 21:
                In(e, n, o)
                break
            case 22:
                o.mode & 1
                    ? ((rt = (s = rt) || o.memoizedState !== null),
                      In(e, n, o),
                      (rt = s))
                    : In(e, n, o)
                break
            default:
                In(e, n, o)
        }
    }
    function vd(e) {
        var n = e.updateQueue
        if (n !== null) {
            e.updateQueue = null
            var o = e.stateNode
            ;(o === null && (o = e.stateNode = new v0()),
                n.forEach(function (s) {
                    var f = P0.bind(null, e, s)
                    o.has(s) || (o.add(s), s.then(f, f))
                }))
        }
    }
    function At(e, n) {
        var o = n.deletions
        if (o !== null)
            for (var s = 0; s < o.length; s++) {
                var f = o[s]
                try {
                    var h = e,
                        x = n,
                        P = x
                    e: for (; P !== null; ) {
                        switch (P.tag) {
                            case 5:
                                ;((Ze = P.stateNode), (Dt = !1))
                                break e
                            case 3:
                                ;((Ze = P.stateNode.containerInfo), (Dt = !0))
                                break e
                            case 4:
                                ;((Ze = P.stateNode.containerInfo), (Dt = !0))
                                break e
                        }
                        P = P.return
                    }
                    if (Ze === null) throw Error(i(160))
                    ;(yd(h, x, f), (Ze = null), (Dt = !1))
                    var D = f.alternate
                    ;(D !== null && (D.return = null), (f.return = null))
                } catch (G) {
                    Ve(f, n, G)
                }
            }
        if (n.subtreeFlags & 12854)
            for (n = n.child; n !== null; ) (xd(n, e), (n = n.sibling))
    }
    function xd(e, n) {
        var o = e.alternate,
            s = e.flags
        switch (e.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
                if ((At(n, e), Xt(e), s & 4)) {
                    try {
                        ;(Ko(3, e, e.return), Ns(3, e))
                    } catch (ge) {
                        Ve(e, e.return, ge)
                    }
                    try {
                        Ko(5, e, e.return)
                    } catch (ge) {
                        Ve(e, e.return, ge)
                    }
                }
                break
            case 1:
                ;(At(n, e), Xt(e), s & 512 && o !== null && Wr(o, o.return))
                break
            case 5:
                if (
                    (At(n, e),
                    Xt(e),
                    s & 512 && o !== null && Wr(o, o.return),
                    e.flags & 32)
                ) {
                    var f = e.stateNode
                    try {
                        nn(f, '')
                    } catch (ge) {
                        Ve(e, e.return, ge)
                    }
                }
                if (s & 4 && ((f = e.stateNode), f != null)) {
                    var h = e.memoizedProps,
                        x = o !== null ? o.memoizedProps : h,
                        P = e.type,
                        D = e.updateQueue
                    if (((e.updateQueue = null), D !== null))
                        try {
                            ;(P === 'input' &&
                                h.type === 'radio' &&
                                h.name != null &&
                                Me(f, h),
                                co(P, x))
                            var G = co(P, h)
                            for (x = 0; x < D.length; x += 2) {
                                var oe = D[x],
                                    ie = D[x + 1]
                                oe === 'style'
                                    ? Mi(f, ie)
                                    : oe === 'dangerouslySetInnerHTML'
                                      ? Ci(f, ie)
                                      : oe === 'children'
                                        ? nn(f, ie)
                                        : w(f, oe, ie, G)
                            }
                            switch (P) {
                                case 'input':
                                    Ue(f, h)
                                    break
                                case 'textarea':
                                    vr(f, h)
                                    break
                                case 'select':
                                    var re = f._wrapperState.wasMultiple
                                    f._wrapperState.wasMultiple = !!h.multiple
                                    var de = h.value
                                    de != null
                                        ? _t(f, !!h.multiple, de, !1)
                                        : re !== !!h.multiple &&
                                          (h.defaultValue != null
                                              ? _t(
                                                    f,
                                                    !!h.multiple,
                                                    h.defaultValue,
                                                    !0
                                                )
                                              : _t(
                                                    f,
                                                    !!h.multiple,
                                                    h.multiple ? [] : '',
                                                    !1
                                                ))
                            }
                            f[Fo] = h
                        } catch (ge) {
                            Ve(e, e.return, ge)
                        }
                }
                break
            case 6:
                if ((At(n, e), Xt(e), s & 4)) {
                    if (e.stateNode === null) throw Error(i(162))
                    ;((f = e.stateNode), (h = e.memoizedProps))
                    try {
                        f.nodeValue = h
                    } catch (ge) {
                        Ve(e, e.return, ge)
                    }
                }
                break
            case 3:
                if (
                    (At(n, e),
                    Xt(e),
                    s & 4 && o !== null && o.memoizedState.isDehydrated)
                )
                    try {
                        Mo(n.containerInfo)
                    } catch (ge) {
                        Ve(e, e.return, ge)
                    }
                break
            case 4:
                ;(At(n, e), Xt(e))
                break
            case 13:
                ;(At(n, e),
                    Xt(e),
                    (f = e.child),
                    f.flags & 8192 &&
                        ((h = f.memoizedState !== null),
                        (f.stateNode.isHidden = h),
                        !h ||
                            (f.alternate !== null &&
                                f.alternate.memoizedState !== null) ||
                            (oa = Fe())),
                    s & 4 && vd(e))
                break
            case 22:
                if (
                    ((oe = o !== null && o.memoizedState !== null),
                    e.mode & 1
                        ? ((rt = (G = rt) || oe), At(n, e), (rt = G))
                        : At(n, e),
                    Xt(e),
                    s & 8192)
                ) {
                    if (
                        ((G = e.memoizedState !== null),
                        (e.stateNode.isHidden = G) && !oe && (e.mode & 1) !== 0)
                    )
                        for (he = e, oe = e.child; oe !== null; ) {
                            for (ie = he = oe; he !== null; ) {
                                switch (((re = he), (de = re.child), re.tag)) {
                                    case 0:
                                    case 11:
                                    case 14:
                                    case 15:
                                        Ko(4, re, re.return)
                                        break
                                    case 1:
                                        Wr(re, re.return)
                                        var pe = re.stateNode
                                        if (
                                            typeof pe.componentWillUnmount ==
                                            'function'
                                        ) {
                                            ;((s = re), (o = re.return))
                                            try {
                                                ;((n = s),
                                                    (pe.props =
                                                        n.memoizedProps),
                                                    (pe.state =
                                                        n.memoizedState),
                                                    pe.componentWillUnmount())
                                            } catch (ge) {
                                                Ve(s, o, ge)
                                            }
                                        }
                                        break
                                    case 5:
                                        Wr(re, re.return)
                                        break
                                    case 22:
                                        if (re.memoizedState !== null) {
                                            _d(ie)
                                            continue
                                        }
                                }
                                de !== null
                                    ? ((de.return = re), (he = de))
                                    : _d(ie)
                            }
                            oe = oe.sibling
                        }
                    e: for (oe = null, ie = e; ; ) {
                        if (ie.tag === 5) {
                            if (oe === null) {
                                oe = ie
                                try {
                                    ;((f = ie.stateNode),
                                        G
                                            ? ((h = f.style),
                                              typeof h.setProperty == 'function'
                                                  ? h.setProperty(
                                                        'display',
                                                        'none',
                                                        'important'
                                                    )
                                                  : (h.display = 'none'))
                                            : ((P = ie.stateNode),
                                              (D = ie.memoizedProps.style),
                                              (x =
                                                  D != null &&
                                                  D.hasOwnProperty('display')
                                                      ? D.display
                                                      : null),
                                              (P.style.display = Ni(
                                                  'display',
                                                  x
                                              ))))
                                } catch (ge) {
                                    Ve(e, e.return, ge)
                                }
                            }
                        } else if (ie.tag === 6) {
                            if (oe === null)
                                try {
                                    ie.stateNode.nodeValue = G
                                        ? ''
                                        : ie.memoizedProps
                                } catch (ge) {
                                    Ve(e, e.return, ge)
                                }
                        } else if (
                            ((ie.tag !== 22 && ie.tag !== 23) ||
                                ie.memoizedState === null ||
                                ie === e) &&
                            ie.child !== null
                        ) {
                            ;((ie.child.return = ie), (ie = ie.child))
                            continue
                        }
                        if (ie === e) break e
                        for (; ie.sibling === null; ) {
                            if (ie.return === null || ie.return === e) break e
                            ;(oe === ie && (oe = null), (ie = ie.return))
                        }
                        ;(oe === ie && (oe = null),
                            (ie.sibling.return = ie.return),
                            (ie = ie.sibling))
                    }
                }
                break
            case 19:
                ;(At(n, e), Xt(e), s & 4 && vd(e))
                break
            case 21:
                break
            default:
                ;(At(n, e), Xt(e))
        }
    }
    function Xt(e) {
        var n = e.flags
        if (n & 2) {
            try {
                e: {
                    for (var o = e.return; o !== null; ) {
                        if (gd(o)) {
                            var s = o
                            break e
                        }
                        o = o.return
                    }
                    throw Error(i(160))
                }
                switch (s.tag) {
                    case 5:
                        var f = s.stateNode
                        s.flags & 32 && (nn(f, ''), (s.flags &= -33))
                        var h = md(e)
                        ta(e, h, f)
                        break
                    case 3:
                    case 4:
                        var x = s.stateNode.containerInfo,
                            P = md(e)
                        ea(e, P, x)
                        break
                    default:
                        throw Error(i(161))
                }
            } catch (D) {
                Ve(e, e.return, D)
            }
            e.flags &= -3
        }
        n & 4096 && (e.flags &= -4097)
    }
    function w0(e, n, o) {
        ;((he = e), wd(e))
    }
    function wd(e, n, o) {
        for (var s = (e.mode & 1) !== 0; he !== null; ) {
            var f = he,
                h = f.child
            if (f.tag === 22 && s) {
                var x = f.memoizedState !== null || Cs
                if (!x) {
                    var P = f.alternate,
                        D = (P !== null && P.memoizedState !== null) || rt
                    P = Cs
                    var G = rt
                    if (((Cs = x), (rt = D) && !G))
                        for (he = f; he !== null; )
                            ((x = he),
                                (D = x.child),
                                x.tag === 22 && x.memoizedState !== null
                                    ? Ed(f)
                                    : D !== null
                                      ? ((D.return = x), (he = D))
                                      : Ed(f))
                    for (; h !== null; ) ((he = h), wd(h), (h = h.sibling))
                    ;((he = f), (Cs = P), (rt = G))
                }
                Sd(e)
            } else
                (f.subtreeFlags & 8772) !== 0 && h !== null
                    ? ((h.return = f), (he = h))
                    : Sd(e)
        }
    }
    function Sd(e) {
        for (; he !== null; ) {
            var n = he
            if ((n.flags & 8772) !== 0) {
                var o = n.alternate
                try {
                    if ((n.flags & 8772) !== 0)
                        switch (n.tag) {
                            case 0:
                            case 11:
                            case 15:
                                rt || Ns(5, n)
                                break
                            case 1:
                                var s = n.stateNode
                                if (n.flags & 4 && !rt)
                                    if (o === null) s.componentDidMount()
                                    else {
                                        var f =
                                            n.elementType === n.type
                                                ? o.memoizedProps
                                                : Rt(n.type, o.memoizedProps)
                                        s.componentDidUpdate(
                                            f,
                                            o.memoizedState,
                                            s.__reactInternalSnapshotBeforeUpdate
                                        )
                                    }
                                var h = n.updateQueue
                                h !== null && _f(n, h, s)
                                break
                            case 3:
                                var x = n.updateQueue
                                if (x !== null) {
                                    if (((o = null), n.child !== null))
                                        switch (n.child.tag) {
                                            case 5:
                                                o = n.child.stateNode
                                                break
                                            case 1:
                                                o = n.child.stateNode
                                        }
                                    _f(n, x, o)
                                }
                                break
                            case 5:
                                var P = n.stateNode
                                if (o === null && n.flags & 4) {
                                    o = P
                                    var D = n.memoizedProps
                                    switch (n.type) {
                                        case 'button':
                                        case 'input':
                                        case 'select':
                                        case 'textarea':
                                            D.autoFocus && o.focus()
                                            break
                                        case 'img':
                                            D.src && (o.src = D.src)
                                    }
                                }
                                break
                            case 6:
                                break
                            case 4:
                                break
                            case 12:
                                break
                            case 13:
                                if (n.memoizedState === null) {
                                    var G = n.alternate
                                    if (G !== null) {
                                        var oe = G.memoizedState
                                        if (oe !== null) {
                                            var ie = oe.dehydrated
                                            ie !== null && Mo(ie)
                                        }
                                    }
                                }
                                break
                            case 19:
                            case 17:
                            case 21:
                            case 22:
                            case 23:
                            case 25:
                                break
                            default:
                                throw Error(i(163))
                        }
                    rt || (n.flags & 512 && Ju(n))
                } catch (re) {
                    Ve(n, n.return, re)
                }
            }
            if (n === e) {
                he = null
                break
            }
            if (((o = n.sibling), o !== null)) {
                ;((o.return = n.return), (he = o))
                break
            }
            he = n.return
        }
    }
    function _d(e) {
        for (; he !== null; ) {
            var n = he
            if (n === e) {
                he = null
                break
            }
            var o = n.sibling
            if (o !== null) {
                ;((o.return = n.return), (he = o))
                break
            }
            he = n.return
        }
    }
    function Ed(e) {
        for (; he !== null; ) {
            var n = he
            try {
                switch (n.tag) {
                    case 0:
                    case 11:
                    case 15:
                        var o = n.return
                        try {
                            Ns(4, n)
                        } catch (D) {
                            Ve(n, o, D)
                        }
                        break
                    case 1:
                        var s = n.stateNode
                        if (typeof s.componentDidMount == 'function') {
                            var f = n.return
                            try {
                                s.componentDidMount()
                            } catch (D) {
                                Ve(n, f, D)
                            }
                        }
                        var h = n.return
                        try {
                            Ju(n)
                        } catch (D) {
                            Ve(n, h, D)
                        }
                        break
                    case 5:
                        var x = n.return
                        try {
                            Ju(n)
                        } catch (D) {
                            Ve(n, x, D)
                        }
                }
            } catch (D) {
                Ve(n, n.return, D)
            }
            if (n === e) {
                he = null
                break
            }
            var P = n.sibling
            if (P !== null) {
                ;((P.return = n.return), (he = P))
                break
            }
            he = n.return
        }
    }
    var S0 = Math.ceil,
        Ms = N.ReactCurrentDispatcher,
        na = N.ReactCurrentOwner,
        Pt = N.ReactCurrentBatchConfig,
        Pe = 0,
        Ge = null,
        We = null,
        Je = 0,
        xt = 0,
        Yr = Nn(0),
        Qe = 0,
        Go = null,
        or = 0,
        Ps = 0,
        ra = 0,
        qo = null,
        at = null,
        oa = 0,
        br = 1 / 0,
        fn = null,
        zs = !1,
        ia = null,
        Tn = null,
        Ls = !1,
        Rn = null,
        Is = 0,
        Zo = 0,
        sa = null,
        Ts = -1,
        Rs = 0
    function it() {
        return (Pe & 6) !== 0 ? Fe() : Ts !== -1 ? Ts : (Ts = Fe())
    }
    function Dn(e) {
        return (e.mode & 1) === 0
            ? 1
            : (Pe & 2) !== 0 && Je !== 0
              ? Je & -Je
              : o0.transition !== null
                ? (Rs === 0 && (Rs = Cr()), Rs)
                : ((e = Le),
                  e !== 0 ||
                      ((e = window.event),
                      (e = e === void 0 ? 16 : kc(e.type))),
                  e)
    }
    function $t(e, n, o, s) {
        if (50 < Zo) throw ((Zo = 0), (sa = null), Error(i(185)))
        ;(Gn(e, o, s),
            ((Pe & 2) === 0 || e !== Ge) &&
                (e === Ge &&
                    ((Pe & 2) === 0 && (Ps |= o), Qe === 4 && An(e, Je)),
                ct(e, s),
                o === 1 &&
                    Pe === 0 &&
                    (n.mode & 1) === 0 &&
                    ((br = Fe() + 500), ls && Pn())))
    }
    function ct(e, n) {
        var o = e.callbackNode
        Vl(e, n)
        var s = kr(e, e === Ge ? Je : 0)
        if (s === 0)
            (o !== null && Oi(o),
                (e.callbackNode = null),
                (e.callbackPriority = 0))
        else if (((n = s & -s), e.callbackPriority !== n)) {
            if ((o != null && Oi(o), n === 1))
                (e.tag === 0 ? r0(Cd.bind(null, e)) : cf(Cd.bind(null, e)),
                    Jm(function () {
                        ;(Pe & 6) === 0 && Pn()
                    }),
                    (o = null))
            else {
                switch (mc(s)) {
                    case 1:
                        o = wo
                        break
                    case 4:
                        o = Hi
                        break
                    case 16:
                        o = Sr
                        break
                    case 536870912:
                        o = ji
                        break
                    default:
                        o = Sr
                }
                o = Rd(o, kd.bind(null, e))
            }
            ;((e.callbackPriority = n), (e.callbackNode = o))
        }
    }
    function kd(e, n) {
        if (((Ts = -1), (Rs = 0), (Pe & 6) !== 0)) throw Error(i(327))
        var o = e.callbackNode
        if (Xr() && e.callbackNode !== o) return null
        var s = kr(e, e === Ge ? Je : 0)
        if (s === 0) return null
        if ((s & 30) !== 0 || (s & e.expiredLanes) !== 0 || n) n = Ds(e, s)
        else {
            n = s
            var f = Pe
            Pe |= 2
            var h = Md()
            ;(Ge !== e || Je !== n) &&
                ((fn = null), (br = Fe() + 500), sr(e, n))
            do
                try {
                    k0()
                    break
                } catch (P) {
                    Nd(e, P)
                }
            while (!0)
            ;(ku(),
                (Ms.current = h),
                (Pe = f),
                We !== null ? (n = 0) : ((Ge = null), (Je = 0), (n = Qe)))
        }
        if (n !== 0) {
            if (
                (n === 2 && ((f = So(e)), f !== 0 && ((s = f), (n = la(e, f)))),
                n === 1)
            )
                throw ((o = Go), sr(e, 0), An(e, s), ct(e, Fe()), o)
            if (n === 6) An(e, s)
            else {
                if (
                    ((f = e.current.alternate),
                    (s & 30) === 0 &&
                        !_0(f) &&
                        ((n = Ds(e, s)),
                        n === 2 &&
                            ((h = So(e)), h !== 0 && ((s = h), (n = la(e, h)))),
                        n === 1))
                )
                    throw ((o = Go), sr(e, 0), An(e, s), ct(e, Fe()), o)
                switch (((e.finishedWork = f), (e.finishedLanes = s), n)) {
                    case 0:
                    case 1:
                        throw Error(i(345))
                    case 2:
                        lr(e, at, fn)
                        break
                    case 3:
                        if (
                            (An(e, s),
                            (s & 130023424) === s &&
                                ((n = oa + 500 - Fe()), 10 < n))
                        ) {
                            if (kr(e, 0) !== 0) break
                            if (((f = e.suspendedLanes), (f & s) !== s)) {
                                ;(it(), (e.pingedLanes |= e.suspendedLanes & f))
                                break
                            }
                            e.timeoutHandle = hu(lr.bind(null, e, at, fn), n)
                            break
                        }
                        lr(e, at, fn)
                        break
                    case 4:
                        if ((An(e, s), (s & 4194240) === s)) break
                        for (n = e.eventTimes, f = -1; 0 < s; ) {
                            var x = 31 - gt(s)
                            ;((h = 1 << x),
                                (x = n[x]),
                                x > f && (f = x),
                                (s &= ~h))
                        }
                        if (
                            ((s = f),
                            (s = Fe() - s),
                            (s =
                                (120 > s
                                    ? 120
                                    : 480 > s
                                      ? 480
                                      : 1080 > s
                                        ? 1080
                                        : 1920 > s
                                          ? 1920
                                          : 3e3 > s
                                            ? 3e3
                                            : 4320 > s
                                              ? 4320
                                              : 1960 * S0(s / 1960)) - s),
                            10 < s)
                        ) {
                            e.timeoutHandle = hu(lr.bind(null, e, at, fn), s)
                            break
                        }
                        lr(e, at, fn)
                        break
                    case 5:
                        lr(e, at, fn)
                        break
                    default:
                        throw Error(i(329))
                }
            }
        }
        return (ct(e, Fe()), e.callbackNode === o ? kd.bind(null, e) : null)
    }
    function la(e, n) {
        var o = qo
        return (
            e.current.memoizedState.isDehydrated && (sr(e, n).flags |= 256),
            (e = Ds(e, n)),
            e !== 2 && ((n = at), (at = o), n !== null && ua(n)),
            e
        )
    }
    function ua(e) {
        at === null ? (at = e) : at.push.apply(at, e)
    }
    function _0(e) {
        for (var n = e; ; ) {
            if (n.flags & 16384) {
                var o = n.updateQueue
                if (o !== null && ((o = o.stores), o !== null))
                    for (var s = 0; s < o.length; s++) {
                        var f = o[s],
                            h = f.getSnapshot
                        f = f.value
                        try {
                            if (!It(h(), f)) return !1
                        } catch {
                            return !1
                        }
                    }
            }
            if (((o = n.child), n.subtreeFlags & 16384 && o !== null))
                ((o.return = n), (n = o))
            else {
                if (n === e) break
                for (; n.sibling === null; ) {
                    if (n.return === null || n.return === e) return !0
                    n = n.return
                }
                ;((n.sibling.return = n.return), (n = n.sibling))
            }
        }
        return !0
    }
    function An(e, n) {
        for (
            n &= ~ra,
                n &= ~Ps,
                e.suspendedLanes |= n,
                e.pingedLanes &= ~n,
                e = e.expirationTimes;
            0 < n;
        ) {
            var o = 31 - gt(n),
                s = 1 << o
            ;((e[o] = -1), (n &= ~s))
        }
    }
    function Cd(e) {
        if ((Pe & 6) !== 0) throw Error(i(327))
        Xr()
        var n = kr(e, 0)
        if ((n & 1) === 0) return (ct(e, Fe()), null)
        var o = Ds(e, n)
        if (e.tag !== 0 && o === 2) {
            var s = So(e)
            s !== 0 && ((n = s), (o = la(e, s)))
        }
        if (o === 1) throw ((o = Go), sr(e, 0), An(e, n), ct(e, Fe()), o)
        if (o === 6) throw Error(i(345))
        return (
            (e.finishedWork = e.current.alternate),
            (e.finishedLanes = n),
            lr(e, at, fn),
            ct(e, Fe()),
            null
        )
    }
    function aa(e, n) {
        var o = Pe
        Pe |= 1
        try {
            return e(n)
        } finally {
            ;((Pe = o), Pe === 0 && ((br = Fe() + 500), ls && Pn()))
        }
    }
    function ir(e) {
        Rn !== null && Rn.tag === 0 && (Pe & 6) === 0 && Xr()
        var n = Pe
        Pe |= 1
        var o = Pt.transition,
            s = Le
        try {
            if (((Pt.transition = null), (Le = 1), e)) return e()
        } finally {
            ;((Le = s), (Pt.transition = o), (Pe = n), (Pe & 6) === 0 && Pn())
        }
    }
    function ca() {
        ;((xt = Yr.current), De(Yr))
    }
    function sr(e, n) {
        ;((e.finishedWork = null), (e.finishedLanes = 0))
        var o = e.timeoutHandle
        if ((o !== -1 && ((e.timeoutHandle = -1), Zm(o)), We !== null))
            for (o = We.return; o !== null; ) {
                var s = o
                switch ((xu(s), s.tag)) {
                    case 1:
                        ;((s = s.type.childContextTypes), s != null && is())
                        break
                    case 3:
                        ;(Br(), De(st), De(et), Tu())
                        break
                    case 5:
                        Lu(s)
                        break
                    case 4:
                        Br()
                        break
                    case 13:
                        De(He)
                        break
                    case 19:
                        De(He)
                        break
                    case 10:
                        Cu(s.type._context)
                        break
                    case 22:
                    case 23:
                        ca()
                }
                o = o.return
            }
        if (
            ((Ge = e),
            (We = e = $n(e.current, null)),
            (Je = xt = n),
            (Qe = 0),
            (Go = null),
            (ra = Ps = or = 0),
            (at = qo = null),
            tr !== null)
        ) {
            for (n = 0; n < tr.length; n++)
                if (((o = tr[n]), (s = o.interleaved), s !== null)) {
                    o.interleaved = null
                    var f = s.next,
                        h = o.pending
                    if (h !== null) {
                        var x = h.next
                        ;((h.next = f), (s.next = x))
                    }
                    o.pending = s
                }
            tr = null
        }
        return e
    }
    function Nd(e, n) {
        do {
            var o = We
            try {
                if ((ku(), (ys.current = Ss), vs)) {
                    for (var s = je.memoizedState; s !== null; ) {
                        var f = s.queue
                        ;(f !== null && (f.pending = null), (s = s.next))
                    }
                    vs = !1
                }
                if (
                    ((rr = 0),
                    (Ke = Xe = je = null),
                    (Wo = !1),
                    (Yo = 0),
                    (na.current = null),
                    o === null || o.return === null)
                ) {
                    ;((Qe = 1), (Go = n), (We = null))
                    break
                }
                e: {
                    var h = e,
                        x = o.return,
                        P = o,
                        D = n
                    if (
                        ((n = Je),
                        (P.flags |= 32768),
                        D !== null &&
                            typeof D == 'object' &&
                            typeof D.then == 'function')
                    ) {
                        var G = D,
                            oe = P,
                            ie = oe.tag
                        if (
                            (oe.mode & 1) === 0 &&
                            (ie === 0 || ie === 11 || ie === 15)
                        ) {
                            var re = oe.alternate
                            re
                                ? ((oe.updateQueue = re.updateQueue),
                                  (oe.memoizedState = re.memoizedState),
                                  (oe.lanes = re.lanes))
                                : ((oe.updateQueue = null),
                                  (oe.memoizedState = null))
                        }
                        var de = qf(x)
                        if (de !== null) {
                            ;((de.flags &= -257),
                                Zf(de, x, P, h, n),
                                de.mode & 1 && Gf(h, G, n),
                                (n = de),
                                (D = G))
                            var pe = n.updateQueue
                            if (pe === null) {
                                var ge = new Set()
                                ;(ge.add(D), (n.updateQueue = ge))
                            } else pe.add(D)
                            break e
                        } else {
                            if ((n & 1) === 0) {
                                ;(Gf(h, G, n), fa())
                                break e
                            }
                            D = Error(i(426))
                        }
                    } else if (Ae && P.mode & 1) {
                        var Be = qf(x)
                        if (Be !== null) {
                            ;((Be.flags & 65536) === 0 && (Be.flags |= 256),
                                Zf(Be, x, P, h, n),
                                _u(Ur(D, P)))
                            break e
                        }
                    }
                    ;((h = D = Ur(D, P)),
                        Qe !== 4 && (Qe = 2),
                        qo === null ? (qo = [h]) : qo.push(h),
                        (h = x))
                    do {
                        switch (h.tag) {
                            case 3:
                                ;((h.flags |= 65536), (n &= -n), (h.lanes |= n))
                                var Y = Qf(h, D, n)
                                Sf(h, Y)
                                break e
                            case 1:
                                P = D
                                var O = h.type,
                                    X = h.stateNode
                                if (
                                    (h.flags & 128) === 0 &&
                                    (typeof O.getDerivedStateFromError ==
                                        'function' ||
                                        (X !== null &&
                                            typeof X.componentDidCatch ==
                                                'function' &&
                                            (Tn === null || !Tn.has(X))))
                                ) {
                                    ;((h.flags |= 65536),
                                        (n &= -n),
                                        (h.lanes |= n))
                                    var se = Kf(h, P, n)
                                    Sf(h, se)
                                    break e
                                }
                        }
                        h = h.return
                    } while (h !== null)
                }
                zd(o)
            } catch (me) {
                ;((n = me), We === o && o !== null && (We = o = o.return))
                continue
            }
            break
        } while (!0)
    }
    function Md() {
        var e = Ms.current
        return ((Ms.current = Ss), e === null ? Ss : e)
    }
    function fa() {
        ;((Qe === 0 || Qe === 3 || Qe === 2) && (Qe = 4),
            Ge === null ||
                ((or & 268435455) === 0 && (Ps & 268435455) === 0) ||
                An(Ge, Je))
    }
    function Ds(e, n) {
        var o = Pe
        Pe |= 2
        var s = Md()
        ;(Ge !== e || Je !== n) && ((fn = null), sr(e, n))
        do
            try {
                E0()
                break
            } catch (f) {
                Nd(e, f)
            }
        while (!0)
        if ((ku(), (Pe = o), (Ms.current = s), We !== null)) throw Error(i(261))
        return ((Ge = null), (Je = 0), Qe)
    }
    function E0() {
        for (; We !== null; ) Pd(We)
    }
    function k0() {
        for (; We !== null && !Dl(); ) Pd(We)
    }
    function Pd(e) {
        var n = Td(e.alternate, e, xt)
        ;((e.memoizedProps = e.pendingProps),
            n === null ? zd(e) : (We = n),
            (na.current = null))
    }
    function zd(e) {
        var n = e
        do {
            var o = n.alternate
            if (((e = n.return), (n.flags & 32768) === 0)) {
                if (((o = m0(o, n, xt)), o !== null)) {
                    We = o
                    return
                }
            } else {
                if (((o = y0(o, n)), o !== null)) {
                    ;((o.flags &= 32767), (We = o))
                    return
                }
                if (e !== null)
                    ((e.flags |= 32768),
                        (e.subtreeFlags = 0),
                        (e.deletions = null))
                else {
                    ;((Qe = 6), (We = null))
                    return
                }
            }
            if (((n = n.sibling), n !== null)) {
                We = n
                return
            }
            We = n = e
        } while (n !== null)
        Qe === 0 && (Qe = 5)
    }
    function lr(e, n, o) {
        var s = Le,
            f = Pt.transition
        try {
            ;((Pt.transition = null), (Le = 1), C0(e, n, o, s))
        } finally {
            ;((Pt.transition = f), (Le = s))
        }
        return null
    }
    function C0(e, n, o, s) {
        do Xr()
        while (Rn !== null)
        if ((Pe & 6) !== 0) throw Error(i(327))
        o = e.finishedWork
        var f = e.finishedLanes
        if (o === null) return null
        if (((e.finishedWork = null), (e.finishedLanes = 0), o === e.current))
            throw Error(i(177))
        ;((e.callbackNode = null), (e.callbackPriority = 0))
        var h = o.lanes | o.childLanes
        if (
            (Bi(e, h),
            e === Ge && ((We = Ge = null), (Je = 0)),
            ((o.subtreeFlags & 2064) === 0 && (o.flags & 2064) === 0) ||
                Ls ||
                ((Ls = !0),
                Rd(Sr, function () {
                    return (Xr(), null)
                })),
            (h = (o.flags & 15990) !== 0),
            (o.subtreeFlags & 15990) !== 0 || h)
        ) {
            ;((h = Pt.transition), (Pt.transition = null))
            var x = Le
            Le = 1
            var P = Pe
            ;((Pe |= 4),
                (na.current = null),
                x0(e, o),
                xd(o, e),
                Ym(fu),
                (Yi = !!cu),
                (fu = cu = null),
                (e.current = o),
                w0(o),
                Fi(),
                (Pe = P),
                (Le = x),
                (Pt.transition = h))
        } else e.current = o
        if (
            (Ls && ((Ls = !1), (Rn = e), (Is = f)),
            (h = e.pendingLanes),
            h === 0 && (Tn = null),
            Ol(o.stateNode),
            ct(e, Fe()),
            n !== null)
        )
            for (s = e.onRecoverableError, o = 0; o < n.length; o++)
                ((f = n[o]),
                    s(f.value, {
                        componentStack: f.stack,
                        digest: f.digest,
                    }))
        if (zs) throw ((zs = !1), (e = ia), (ia = null), e)
        return (
            (Is & 1) !== 0 && e.tag !== 0 && Xr(),
            (h = e.pendingLanes),
            (h & 1) !== 0 ? (e === sa ? Zo++ : ((Zo = 0), (sa = e))) : (Zo = 0),
            Pn(),
            null
        )
    }
    function Xr() {
        if (Rn !== null) {
            var e = mc(Is),
                n = Pt.transition,
                o = Le
            try {
                if (
                    ((Pt.transition = null),
                    (Le = 16 > e ? 16 : e),
                    Rn === null)
                )
                    var s = !1
                else {
                    if (((e = Rn), (Rn = null), (Is = 0), (Pe & 6) !== 0))
                        throw Error(i(331))
                    var f = Pe
                    for (Pe |= 4, he = e.current; he !== null; ) {
                        var h = he,
                            x = h.child
                        if ((he.flags & 16) !== 0) {
                            var P = h.deletions
                            if (P !== null) {
                                for (var D = 0; D < P.length; D++) {
                                    var G = P[D]
                                    for (he = G; he !== null; ) {
                                        var oe = he
                                        switch (oe.tag) {
                                            case 0:
                                            case 11:
                                            case 15:
                                                Ko(8, oe, h)
                                        }
                                        var ie = oe.child
                                        if (ie !== null)
                                            ((ie.return = oe), (he = ie))
                                        else
                                            for (; he !== null; ) {
                                                oe = he
                                                var re = oe.sibling,
                                                    de = oe.return
                                                if ((pd(oe), oe === G)) {
                                                    he = null
                                                    break
                                                }
                                                if (re !== null) {
                                                    ;((re.return = de),
                                                        (he = re))
                                                    break
                                                }
                                                he = de
                                            }
                                    }
                                }
                                var pe = h.alternate
                                if (pe !== null) {
                                    var ge = pe.child
                                    if (ge !== null) {
                                        pe.child = null
                                        do {
                                            var Be = ge.sibling
                                            ;((ge.sibling = null), (ge = Be))
                                        } while (ge !== null)
                                    }
                                }
                                he = h
                            }
                        }
                        if ((h.subtreeFlags & 2064) !== 0 && x !== null)
                            ((x.return = h), (he = x))
                        else
                            e: for (; he !== null; ) {
                                if (((h = he), (h.flags & 2048) !== 0))
                                    switch (h.tag) {
                                        case 0:
                                        case 11:
                                        case 15:
                                            Ko(9, h, h.return)
                                    }
                                var Y = h.sibling
                                if (Y !== null) {
                                    ;((Y.return = h.return), (he = Y))
                                    break e
                                }
                                he = h.return
                            }
                    }
                    var O = e.current
                    for (he = O; he !== null; ) {
                        x = he
                        var X = x.child
                        if ((x.subtreeFlags & 2064) !== 0 && X !== null)
                            ((X.return = x), (he = X))
                        else
                            e: for (x = O; he !== null; ) {
                                if (((P = he), (P.flags & 2048) !== 0))
                                    try {
                                        switch (P.tag) {
                                            case 0:
                                            case 11:
                                            case 15:
                                                Ns(9, P)
                                        }
                                    } catch (me) {
                                        Ve(P, P.return, me)
                                    }
                                if (P === x) {
                                    he = null
                                    break e
                                }
                                var se = P.sibling
                                if (se !== null) {
                                    ;((se.return = P.return), (he = se))
                                    break e
                                }
                                he = P.return
                            }
                    }
                    if (
                        ((Pe = f),
                        Pn(),
                        Et && typeof Et.onPostCommitFiberRoot == 'function')
                    )
                        try {
                            Et.onPostCommitFiberRoot(Kn, e)
                        } catch {}
                    s = !0
                }
                return s
            } finally {
                ;((Le = o), (Pt.transition = n))
            }
        }
        return !1
    }
    function Ld(e, n, o) {
        ;((n = Ur(o, n)),
            (n = Qf(e, n, 1)),
            (e = Ln(e, n, 1)),
            (n = it()),
            e !== null && (Gn(e, 1, n), ct(e, n)))
    }
    function Ve(e, n, o) {
        if (e.tag === 3) Ld(e, e, o)
        else
            for (; n !== null; ) {
                if (n.tag === 3) {
                    Ld(n, e, o)
                    break
                } else if (n.tag === 1) {
                    var s = n.stateNode
                    if (
                        typeof n.type.getDerivedStateFromError == 'function' ||
                        (typeof s.componentDidCatch == 'function' &&
                            (Tn === null || !Tn.has(s)))
                    ) {
                        ;((e = Ur(o, e)),
                            (e = Kf(n, e, 1)),
                            (n = Ln(n, e, 1)),
                            (e = it()),
                            n !== null && (Gn(n, 1, e), ct(n, e)))
                        break
                    }
                }
                n = n.return
            }
    }
    function N0(e, n, o) {
        var s = e.pingCache
        ;(s !== null && s.delete(n),
            (n = it()),
            (e.pingedLanes |= e.suspendedLanes & o),
            Ge === e &&
                (Je & o) === o &&
                (Qe === 4 ||
                (Qe === 3 && (Je & 130023424) === Je && 500 > Fe() - oa)
                    ? sr(e, 0)
                    : (ra |= o)),
            ct(e, n))
    }
    function Id(e, n) {
        n === 0 &&
            ((e.mode & 1) === 0
                ? (n = 1)
                : ((n = Er),
                  (Er <<= 1),
                  (Er & 130023424) === 0 && (Er = 4194304)))
        var o = it()
        ;((e = un(e, n)), e !== null && (Gn(e, n, o), ct(e, o)))
    }
    function M0(e) {
        var n = e.memoizedState,
            o = 0
        ;(n !== null && (o = n.retryLane), Id(e, o))
    }
    function P0(e, n) {
        var o = 0
        switch (e.tag) {
            case 13:
                var s = e.stateNode,
                    f = e.memoizedState
                f !== null && (o = f.retryLane)
                break
            case 19:
                s = e.stateNode
                break
            default:
                throw Error(i(314))
        }
        ;(s !== null && s.delete(n), Id(e, o))
    }
    var Td
    Td = function (e, n, o) {
        if (e !== null)
            if (e.memoizedProps !== n.pendingProps || st.current) ut = !0
            else {
                if ((e.lanes & o) === 0 && (n.flags & 128) === 0)
                    return ((ut = !1), g0(e, n, o))
                ut = (e.flags & 131072) !== 0
            }
        else ((ut = !1), Ae && (n.flags & 1048576) !== 0 && ff(n, as, n.index))
        switch (((n.lanes = 0), n.tag)) {
            case 2:
                var s = n.type
                ;(ks(e, n), (e = n.pendingProps))
                var f = Ar(n, et.current)
                ;(Vr(n, o), (f = Au(null, n, s, e, f, o)))
                var h = $u()
                return (
                    (n.flags |= 1),
                    typeof f == 'object' &&
                    f !== null &&
                    typeof f.render == 'function' &&
                    f.$$typeof === void 0
                        ? ((n.tag = 1),
                          (n.memoizedState = null),
                          (n.updateQueue = null),
                          lt(s) ? ((h = !0), ss(n)) : (h = !1),
                          (n.memoizedState =
                              f.state !== null && f.state !== void 0
                                  ? f.state
                                  : null),
                          Pu(n),
                          (f.updater = _s),
                          (n.stateNode = f),
                          (f._reactInternals = n),
                          Bu(n, s, e, o),
                          (n = bu(null, n, s, !0, h, o)))
                        : ((n.tag = 0),
                          Ae && h && vu(n),
                          ot(null, n, f, o),
                          (n = n.child)),
                    n
                )
            case 16:
                s = n.elementType
                e: {
                    switch (
                        (ks(e, n),
                        (e = n.pendingProps),
                        (f = s._init),
                        (s = f(s._payload)),
                        (n.type = s),
                        (f = n.tag = L0(s)),
                        (e = Rt(s, e)),
                        f)
                    ) {
                        case 0:
                            n = Yu(null, n, s, e, o)
                            break e
                        case 1:
                            n = od(null, n, s, e, o)
                            break e
                        case 11:
                            n = Jf(null, n, s, e, o)
                            break e
                        case 14:
                            n = ed(null, n, s, Rt(s.type, e), o)
                            break e
                    }
                    throw Error(i(306, s, ''))
                }
                return n
            case 0:
                return (
                    (s = n.type),
                    (f = n.pendingProps),
                    (f = n.elementType === s ? f : Rt(s, f)),
                    Yu(e, n, s, f, o)
                )
            case 1:
                return (
                    (s = n.type),
                    (f = n.pendingProps),
                    (f = n.elementType === s ? f : Rt(s, f)),
                    od(e, n, s, f, o)
                )
            case 3:
                e: {
                    if ((id(n), e === null)) throw Error(i(387))
                    ;((s = n.pendingProps),
                        (h = n.memoizedState),
                        (f = h.element),
                        wf(e, n),
                        gs(n, s, null, o))
                    var x = n.memoizedState
                    if (((s = x.element), h.isDehydrated))
                        if (
                            ((h = {
                                element: s,
                                isDehydrated: !1,
                                cache: x.cache,
                                pendingSuspenseBoundaries:
                                    x.pendingSuspenseBoundaries,
                                transitions: x.transitions,
                            }),
                            (n.updateQueue.baseState = h),
                            (n.memoizedState = h),
                            n.flags & 256)
                        ) {
                            ;((f = Ur(Error(i(423)), n)),
                                (n = sd(e, n, s, o, f)))
                            break e
                        } else if (s !== f) {
                            ;((f = Ur(Error(i(424)), n)),
                                (n = sd(e, n, s, o, f)))
                            break e
                        } else
                            for (
                                vt = Cn(n.stateNode.containerInfo.firstChild),
                                    yt = n,
                                    Ae = !0,
                                    Tt = null,
                                    o = vf(n, null, s, o),
                                    n.child = o;
                                o;
                            )
                                ((o.flags = (o.flags & -3) | 4096),
                                    (o = o.sibling))
                    else {
                        if ((Fr(), s === f)) {
                            n = cn(e, n, o)
                            break e
                        }
                        ot(e, n, s, o)
                    }
                    n = n.child
                }
                return n
            case 5:
                return (
                    Ef(n),
                    e === null && Su(n),
                    (s = n.type),
                    (f = n.pendingProps),
                    (h = e !== null ? e.memoizedProps : null),
                    (x = f.children),
                    du(s, f)
                        ? (x = null)
                        : h !== null && du(s, h) && (n.flags |= 32),
                    rd(e, n),
                    ot(e, n, x, o),
                    n.child
                )
            case 6:
                return (e === null && Su(n), null)
            case 13:
                return ld(e, n, o)
            case 4:
                return (
                    zu(n, n.stateNode.containerInfo),
                    (s = n.pendingProps),
                    e === null ? (n.child = Hr(n, null, s, o)) : ot(e, n, s, o),
                    n.child
                )
            case 11:
                return (
                    (s = n.type),
                    (f = n.pendingProps),
                    (f = n.elementType === s ? f : Rt(s, f)),
                    Jf(e, n, s, f, o)
                )
            case 7:
                return (ot(e, n, n.pendingProps, o), n.child)
            case 8:
                return (ot(e, n, n.pendingProps.children, o), n.child)
            case 12:
                return (ot(e, n, n.pendingProps.children, o), n.child)
            case 10:
                e: {
                    if (
                        ((s = n.type._context),
                        (f = n.pendingProps),
                        (h = n.memoizedProps),
                        (x = f.value),
                        Te(ds, s._currentValue),
                        (s._currentValue = x),
                        h !== null)
                    )
                        if (It(h.value, x)) {
                            if (h.children === f.children && !st.current) {
                                n = cn(e, n, o)
                                break e
                            }
                        } else
                            for (
                                h = n.child, h !== null && (h.return = n);
                                h !== null;
                            ) {
                                var P = h.dependencies
                                if (P !== null) {
                                    x = h.child
                                    for (var D = P.firstContext; D !== null; ) {
                                        if (D.context === s) {
                                            if (h.tag === 1) {
                                                ;((D = an(-1, o & -o)),
                                                    (D.tag = 2))
                                                var G = h.updateQueue
                                                if (G !== null) {
                                                    G = G.shared
                                                    var oe = G.pending
                                                    ;(oe === null
                                                        ? (D.next = D)
                                                        : ((D.next = oe.next),
                                                          (oe.next = D)),
                                                        (G.pending = D))
                                                }
                                            }
                                            ;((h.lanes |= o),
                                                (D = h.alternate),
                                                D !== null && (D.lanes |= o),
                                                Nu(h.return, o, n),
                                                (P.lanes |= o))
                                            break
                                        }
                                        D = D.next
                                    }
                                } else if (h.tag === 10)
                                    x = h.type === n.type ? null : h.child
                                else if (h.tag === 18) {
                                    if (((x = h.return), x === null))
                                        throw Error(i(341))
                                    ;((x.lanes |= o),
                                        (P = x.alternate),
                                        P !== null && (P.lanes |= o),
                                        Nu(x, o, n),
                                        (x = h.sibling))
                                } else x = h.child
                                if (x !== null) x.return = h
                                else
                                    for (x = h; x !== null; ) {
                                        if (x === n) {
                                            x = null
                                            break
                                        }
                                        if (((h = x.sibling), h !== null)) {
                                            ;((h.return = x.return), (x = h))
                                            break
                                        }
                                        x = x.return
                                    }
                                h = x
                            }
                    ;(ot(e, n, f.children, o), (n = n.child))
                }
                return n
            case 9:
                return (
                    (f = n.type),
                    (s = n.pendingProps.children),
                    Vr(n, o),
                    (f = Nt(f)),
                    (s = s(f)),
                    (n.flags |= 1),
                    ot(e, n, s, o),
                    n.child
                )
            case 14:
                return (
                    (s = n.type),
                    (f = Rt(s, n.pendingProps)),
                    (f = Rt(s.type, f)),
                    ed(e, n, s, f, o)
                )
            case 15:
                return td(e, n, n.type, n.pendingProps, o)
            case 17:
                return (
                    (s = n.type),
                    (f = n.pendingProps),
                    (f = n.elementType === s ? f : Rt(s, f)),
                    ks(e, n),
                    (n.tag = 1),
                    lt(s) ? ((e = !0), ss(n)) : (e = !1),
                    Vr(n, o),
                    bf(n, s, f),
                    Bu(n, s, f, o),
                    bu(null, n, s, !0, e, o)
                )
            case 19:
                return ad(e, n, o)
            case 22:
                return nd(e, n, o)
        }
        throw Error(i(156, n.tag))
    }
    function Rd(e, n) {
        return $i(e, n)
    }
    function z0(e, n, o, s) {
        ;((this.tag = e),
            (this.key = o),
            (this.sibling =
                this.child =
                this.return =
                this.stateNode =
                this.type =
                this.elementType =
                    null),
            (this.index = 0),
            (this.ref = null),
            (this.pendingProps = n),
            (this.dependencies =
                this.memoizedState =
                this.updateQueue =
                this.memoizedProps =
                    null),
            (this.mode = s),
            (this.subtreeFlags = this.flags = 0),
            (this.deletions = null),
            (this.childLanes = this.lanes = 0),
            (this.alternate = null))
    }
    function zt(e, n, o, s) {
        return new z0(e, n, o, s)
    }
    function da(e) {
        return ((e = e.prototype), !(!e || !e.isReactComponent))
    }
    function L0(e) {
        if (typeof e == 'function') return da(e) ? 1 : 0
        if (e != null) {
            if (((e = e.$$typeof), e === W)) return 11
            if (e === B) return 14
        }
        return 2
    }
    function $n(e, n) {
        var o = e.alternate
        return (
            o === null
                ? ((o = zt(e.tag, n, e.key, e.mode)),
                  (o.elementType = e.elementType),
                  (o.type = e.type),
                  (o.stateNode = e.stateNode),
                  (o.alternate = e),
                  (e.alternate = o))
                : ((o.pendingProps = n),
                  (o.type = e.type),
                  (o.flags = 0),
                  (o.subtreeFlags = 0),
                  (o.deletions = null)),
            (o.flags = e.flags & 14680064),
            (o.childLanes = e.childLanes),
            (o.lanes = e.lanes),
            (o.child = e.child),
            (o.memoizedProps = e.memoizedProps),
            (o.memoizedState = e.memoizedState),
            (o.updateQueue = e.updateQueue),
            (n = e.dependencies),
            (o.dependencies =
                n === null
                    ? null
                    : {
                          lanes: n.lanes,
                          firstContext: n.firstContext,
                      }),
            (o.sibling = e.sibling),
            (o.index = e.index),
            (o.ref = e.ref),
            o
        )
    }
    function As(e, n, o, s, f, h) {
        var x = 2
        if (((s = e), typeof e == 'function')) da(e) && (x = 1)
        else if (typeof e == 'string') x = 5
        else
            e: switch (e) {
                case F:
                    return ur(o.children, f, h, n)
                case V:
                    ;((x = 8), (f |= 8))
                    break
                case K:
                    return (
                        (e = zt(12, o, n, f | 2)),
                        (e.elementType = K),
                        (e.lanes = h),
                        e
                    )
                case Z:
                    return (
                        (e = zt(13, o, n, f)),
                        (e.elementType = Z),
                        (e.lanes = h),
                        e
                    )
                case z:
                    return (
                        (e = zt(19, o, n, f)),
                        (e.elementType = z),
                        (e.lanes = h),
                        e
                    )
                case b:
                    return $s(o, f, h, n)
                default:
                    if (typeof e == 'object' && e !== null)
                        switch (e.$$typeof) {
                            case ne:
                                x = 10
                                break e
                            case U:
                                x = 9
                                break e
                            case W:
                                x = 11
                                break e
                            case B:
                                x = 14
                                break e
                            case H:
                                ;((x = 16), (s = null))
                                break e
                        }
                    throw Error(i(130, e == null ? e : typeof e, ''))
            }
        return (
            (n = zt(x, o, n, f)),
            (n.elementType = e),
            (n.type = s),
            (n.lanes = h),
            n
        )
    }
    function ur(e, n, o, s) {
        return ((e = zt(7, e, s, n)), (e.lanes = o), e)
    }
    function $s(e, n, o, s) {
        return (
            (e = zt(22, e, s, n)),
            (e.elementType = b),
            (e.lanes = o),
            (e.stateNode = {
                isHidden: !1,
            }),
            e
        )
    }
    function ha(e, n, o) {
        return ((e = zt(6, e, null, n)), (e.lanes = o), e)
    }
    function pa(e, n, o) {
        return (
            (n = zt(4, e.children !== null ? e.children : [], e.key, n)),
            (n.lanes = o),
            (n.stateNode = {
                containerInfo: e.containerInfo,
                pendingChildren: null,
                implementation: e.implementation,
            }),
            n
        )
    }
    function I0(e, n, o, s, f) {
        ;((this.tag = n),
            (this.containerInfo = e),
            (this.finishedWork =
                this.pingCache =
                this.current =
                this.pendingChildren =
                    null),
            (this.timeoutHandle = -1),
            (this.callbackNode = this.pendingContext = this.context = null),
            (this.callbackPriority = 0),
            (this.eventTimes = _o(0)),
            (this.expirationTimes = _o(-1)),
            (this.entangledLanes =
                this.finishedLanes =
                this.mutableReadLanes =
                this.expiredLanes =
                this.pingedLanes =
                this.suspendedLanes =
                this.pendingLanes =
                    0),
            (this.entanglements = _o(0)),
            (this.identifierPrefix = s),
            (this.onRecoverableError = f),
            (this.mutableSourceEagerHydrationData = null))
    }
    function ga(e, n, o, s, f, h, x, P, D) {
        return (
            (e = new I0(e, n, o, P, D)),
            n === 1 ? ((n = 1), h === !0 && (n |= 8)) : (n = 0),
            (h = zt(3, null, null, n)),
            (e.current = h),
            (h.stateNode = e),
            (h.memoizedState = {
                element: s,
                isDehydrated: o,
                cache: null,
                transitions: null,
                pendingSuspenseBoundaries: null,
            }),
            Pu(h),
            e
        )
    }
    function T0(e, n, o) {
        var s =
            3 < arguments.length && arguments[3] !== void 0
                ? arguments[3]
                : null
        return {
            $$typeof: T,
            key: s == null ? null : '' + s,
            children: e,
            containerInfo: n,
            implementation: o,
        }
    }
    function Dd(e) {
        if (!e) return Mn
        e = e._reactInternals
        e: {
            if (Bt(e) !== e || e.tag !== 1) throw Error(i(170))
            var n = e
            do {
                switch (n.tag) {
                    case 3:
                        n = n.stateNode.context
                        break e
                    case 1:
                        if (lt(n.type)) {
                            n =
                                n.stateNode
                                    .__reactInternalMemoizedMergedChildContext
                            break e
                        }
                }
                n = n.return
            } while (n !== null)
            throw Error(i(171))
        }
        if (e.tag === 1) {
            var o = e.type
            if (lt(o)) return uf(e, o, n)
        }
        return n
    }
    function Ad(e, n, o, s, f, h, x, P, D) {
        return (
            (e = ga(o, s, !0, e, f, h, x, P, D)),
            (e.context = Dd(null)),
            (o = e.current),
            (s = it()),
            (f = Dn(o)),
            (h = an(s, f)),
            (h.callback = n ?? null),
            Ln(o, h, f),
            (e.current.lanes = f),
            Gn(e, f, s),
            ct(e, s),
            e
        )
    }
    function Os(e, n, o, s) {
        var f = n.current,
            h = it(),
            x = Dn(f)
        return (
            (o = Dd(o)),
            n.context === null ? (n.context = o) : (n.pendingContext = o),
            (n = an(h, x)),
            (n.payload = {
                element: e,
            }),
            (s = s === void 0 ? null : s),
            s !== null && (n.callback = s),
            (e = Ln(f, n, x)),
            e !== null && ($t(e, f, x, h), ps(e, f, x)),
            x
        )
    }
    function Fs(e) {
        if (((e = e.current), !e.child)) return null
        switch (e.child.tag) {
            case 5:
                return e.child.stateNode
            default:
                return e.child.stateNode
        }
    }
    function $d(e, n) {
        if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
            var o = e.retryLane
            e.retryLane = o !== 0 && o < n ? o : n
        }
    }
    function ma(e, n) {
        ;($d(e, n), (e = e.alternate) && $d(e, n))
    }
    function R0() {
        return null
    }
    var Od =
        typeof reportError == 'function'
            ? reportError
            : function (e) {
                  console.error(e)
              }
    function ya(e) {
        this._internalRoot = e
    }
    ;((Hs.prototype.render = ya.prototype.render =
        function (e) {
            var n = this._internalRoot
            if (n === null) throw Error(i(409))
            Os(e, n, null, null)
        }),
        (Hs.prototype.unmount = ya.prototype.unmount =
            function () {
                var e = this._internalRoot
                if (e !== null) {
                    this._internalRoot = null
                    var n = e.containerInfo
                    ;(ir(function () {
                        Os(null, e, null, null)
                    }),
                        (n[rn] = null))
                }
            }))
    function Hs(e) {
        this._internalRoot = e
    }
    Hs.prototype.unstable_scheduleHydration = function (e) {
        if (e) {
            var n = xc()
            e = {
                blockedOn: null,
                target: e,
                priority: n,
            }
            for (
                var o = 0;
                o < _n.length && n !== 0 && n < _n[o].priority;
                o++
            );
            ;(_n.splice(o, 0, e), o === 0 && _c(e))
        }
    }
    function va(e) {
        return !(
            !e ||
            (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11)
        )
    }
    function js(e) {
        return !(
            !e ||
            (e.nodeType !== 1 &&
                e.nodeType !== 9 &&
                e.nodeType !== 11 &&
                (e.nodeType !== 8 ||
                    e.nodeValue !== ' react-mount-point-unstable '))
        )
    }
    function Fd() {}
    function D0(e, n, o, s, f) {
        if (f) {
            if (typeof s == 'function') {
                var h = s
                s = function () {
                    var G = Fs(x)
                    h.call(G)
                }
            }
            var x = Ad(n, s, e, 0, null, !1, !1, '', Fd)
            return (
                (e._reactRootContainer = x),
                (e[rn] = x.current),
                $o(e.nodeType === 8 ? e.parentNode : e),
                ir(),
                x
            )
        }
        for (; (f = e.lastChild); ) e.removeChild(f)
        if (typeof s == 'function') {
            var P = s
            s = function () {
                var G = Fs(D)
                P.call(G)
            }
        }
        var D = ga(e, 0, !1, null, null, !1, !1, '', Fd)
        return (
            (e._reactRootContainer = D),
            (e[rn] = D.current),
            $o(e.nodeType === 8 ? e.parentNode : e),
            ir(function () {
                Os(n, D, o, s)
            }),
            D
        )
    }
    function Vs(e, n, o, s, f) {
        var h = o._reactRootContainer
        if (h) {
            var x = h
            if (typeof f == 'function') {
                var P = f
                f = function () {
                    var D = Fs(x)
                    P.call(D)
                }
            }
            Os(n, x, e, f)
        } else x = D0(o, n, e, f, s)
        return Fs(x)
    }
    ;((yc = function (e) {
        switch (e.tag) {
            case 3:
                var n = e.stateNode
                if (n.current.memoizedState.isDehydrated) {
                    var o = Ut(n.pendingLanes)
                    o !== 0 &&
                        (Bl(n, o | 1),
                        ct(n, Fe()),
                        (Pe & 6) === 0 && ((br = Fe() + 500), Pn()))
                }
                break
            case 13:
                ;(ir(function () {
                    var s = un(e, 1)
                    if (s !== null) {
                        var f = it()
                        $t(s, e, 1, f)
                    }
                }),
                    ma(e, 1))
        }
    }),
        (Ul = function (e) {
            if (e.tag === 13) {
                var n = un(e, 134217728)
                if (n !== null) {
                    var o = it()
                    $t(n, e, 134217728, o)
                }
                ma(e, 134217728)
            }
        }),
        (vc = function (e) {
            if (e.tag === 13) {
                var n = Dn(e),
                    o = un(e, n)
                if (o !== null) {
                    var s = it()
                    $t(o, e, n, s)
                }
                ma(e, n)
            }
        }),
        (xc = function () {
            return Le
        }),
        (wc = function (e, n) {
            var o = Le
            try {
                return ((Le = e), n())
            } finally {
                Le = o
            }
        }),
        (po = function (e, n, o) {
            switch (n) {
                case 'input':
                    if (
                        (Ue(e, o),
                        (n = o.name),
                        o.type === 'radio' && n != null)
                    ) {
                        for (o = e; o.parentNode; ) o = o.parentNode
                        for (
                            o = o.querySelectorAll(
                                'input[name=' +
                                    JSON.stringify('' + n) +
                                    '][type="radio"]'
                            ),
                                n = 0;
                            n < o.length;
                            n++
                        ) {
                            var s = o[n]
                            if (s !== e && s.form === e.form) {
                                var f = os(s)
                                if (!f) throw Error(i(90))
                                ;(Se(s), Ue(s, f))
                            }
                        }
                    }
                    break
                case 'textarea':
                    vr(e, o)
                    break
                case 'select':
                    ;((n = o.value), n != null && _t(e, !!o.multiple, n, !1))
            }
        }),
        (Ii = aa),
        (Ti = ir))
    var A0 = {
            usingClientEntryPoint: !1,
            Events: [Ho, Rr, os, zi, Li, aa],
        },
        Jo = {
            findFiberByHostInstance: qn,
            bundleType: 0,
            version: '18.3.1',
            rendererPackageName: 'react-dom',
        },
        $0 = {
            bundleType: Jo.bundleType,
            version: Jo.version,
            rendererPackageName: Jo.rendererPackageName,
            rendererConfig: Jo.rendererConfig,
            overrideHookState: null,
            overrideHookStateDeletePath: null,
            overrideHookStateRenamePath: null,
            overrideProps: null,
            overridePropsDeletePath: null,
            overridePropsRenamePath: null,
            setErrorHandler: null,
            setSuspenseHandler: null,
            scheduleUpdate: null,
            currentDispatcherRef: N.ReactCurrentDispatcher,
            findHostInstanceByFiber: function (e) {
                return ((e = Di(e)), e === null ? null : e.stateNode)
            },
            findFiberByHostInstance: Jo.findFiberByHostInstance || R0,
            findHostInstancesForRefresh: null,
            scheduleRefresh: null,
            scheduleRoot: null,
            setRefreshHandler: null,
            getCurrentFiber: null,
            reconcilerVersion: '18.3.1-next-f1338f8080-20240426',
        }
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < 'u') {
        var Bs = __REACT_DEVTOOLS_GLOBAL_HOOK__
        if (!Bs.isDisabled && Bs.supportsFiber)
            try {
                ;((Kn = Bs.inject($0)), (Et = Bs))
            } catch {}
    }
    return (
        (ft.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = A0),
        (ft.createPortal = function (e, n) {
            var o =
                2 < arguments.length && arguments[2] !== void 0
                    ? arguments[2]
                    : null
            if (!va(n)) throw Error(i(200))
            return T0(e, n, null, o)
        }),
        (ft.createRoot = function (e, n) {
            if (!va(e)) throw Error(i(299))
            var o = !1,
                s = '',
                f = Od
            return (
                n != null &&
                    (n.unstable_strictMode === !0 && (o = !0),
                    n.identifierPrefix !== void 0 && (s = n.identifierPrefix),
                    n.onRecoverableError !== void 0 &&
                        (f = n.onRecoverableError)),
                (n = ga(e, 1, !1, null, null, o, !1, s, f)),
                (e[rn] = n.current),
                $o(e.nodeType === 8 ? e.parentNode : e),
                new ya(n)
            )
        }),
        (ft.findDOMNode = function (e) {
            if (e == null) return null
            if (e.nodeType === 1) return e
            var n = e._reactInternals
            if (n === void 0)
                throw typeof e.render == 'function'
                    ? Error(i(188))
                    : ((e = Object.keys(e).join(',')), Error(i(268, e)))
            return ((e = Di(n)), (e = e === null ? null : e.stateNode), e)
        }),
        (ft.flushSync = function (e) {
            return ir(e)
        }),
        (ft.hydrate = function (e, n, o) {
            if (!js(n)) throw Error(i(200))
            return Vs(null, e, n, !0, o)
        }),
        (ft.hydrateRoot = function (e, n, o) {
            if (!va(e)) throw Error(i(405))
            var s = (o != null && o.hydratedSources) || null,
                f = !1,
                h = '',
                x = Od
            if (
                (o != null &&
                    (o.unstable_strictMode === !0 && (f = !0),
                    o.identifierPrefix !== void 0 && (h = o.identifierPrefix),
                    o.onRecoverableError !== void 0 &&
                        (x = o.onRecoverableError)),
                (n = Ad(n, null, e, 1, o ?? null, f, !1, h, x)),
                (e[rn] = n.current),
                $o(e),
                s)
            )
                for (e = 0; e < s.length; e++)
                    ((o = s[e]),
                        (f = o._getVersion),
                        (f = f(o._source)),
                        n.mutableSourceEagerHydrationData == null
                            ? (n.mutableSourceEagerHydrationData = [o, f])
                            : n.mutableSourceEagerHydrationData.push(o, f))
            return new Hs(n)
        }),
        (ft.render = function (e, n, o) {
            if (!js(n)) throw Error(i(200))
            return Vs(null, e, n, !1, o)
        }),
        (ft.unmountComponentAtNode = function (e) {
            if (!js(e)) throw Error(i(40))
            return e._reactRootContainer
                ? (ir(function () {
                      Vs(null, null, e, !1, function () {
                          ;((e._reactRootContainer = null), (e[rn] = null))
                      })
                  }),
                  !0)
                : !1
        }),
        (ft.unstable_batchedUpdates = aa),
        (ft.unstable_renderSubtreeIntoContainer = function (e, n, o, s) {
            if (!js(o)) throw Error(i(200))
            if (e == null || e._reactInternals === void 0) throw Error(i(38))
            return Vs(e, n, o, !1, s)
        }),
        (ft.version = '18.3.1-next-f1338f8080-20240426'),
        ft
    )
}
var bd
function up() {
    if (bd) return Sa.exports
    bd = 1
    function t() {
        if (
            !(
                typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > 'u' ||
                typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != 'function'
            )
        )
            try {
                __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(t)
            } catch (r) {
                console.error(r)
            }
    }
    return (t(), (Sa.exports = U0()), Sa.exports)
}
var Xd
function W0() {
    if (Xd) return Us
    Xd = 1
    var t = up()
    return (
        (Us.createRoot = t.createRoot),
        (Us.hydrateRoot = t.hydrateRoot),
        Us
    )
}
var Y0 = W0()
const b0 = qa(Y0)
function be(t) {
    if (typeof t == 'string' || typeof t == 'number') return '' + t
    let r = ''
    if (Array.isArray(t))
        for (let i = 0, l; i < t.length; i++)
            (l = be(t[i])) !== '' && (r += (r && ' ') + l)
    else for (let i in t) t[i] && (r += (r && ' ') + i)
    return r
}
var X0 = {
    value: () => {},
}
function yl() {
    for (var t = 0, r = arguments.length, i = {}, l; t < r; ++t) {
        if (!(l = arguments[t] + '') || l in i || /[\s.]/.test(l))
            throw new Error('illegal type: ' + l)
        i[l] = []
    }
    return new el(i)
}
function el(t) {
    this._ = t
}
function Q0(t, r) {
    return t
        .trim()
        .split(/^|\s+/)
        .map(function (i) {
            var l = '',
                u = i.indexOf('.')
            if (
                (u >= 0 && ((l = i.slice(u + 1)), (i = i.slice(0, u))),
                i && !r.hasOwnProperty(i))
            )
                throw new Error('unknown type: ' + i)
            return {
                type: i,
                name: l,
            }
        })
}
el.prototype = yl.prototype = {
    constructor: el,
    on: function (t, r) {
        var i = this._,
            l = Q0(t + '', i),
            u,
            a = -1,
            c = l.length
        if (arguments.length < 2) {
            for (; ++a < c; )
                if ((u = (t = l[a]).type) && (u = K0(i[u], t.name))) return u
            return
        }
        if (r != null && typeof r != 'function')
            throw new Error('invalid callback: ' + r)
        for (; ++a < c; )
            if ((u = (t = l[a]).type)) i[u] = Qd(i[u], t.name, r)
            else if (r == null) for (u in i) i[u] = Qd(i[u], t.name, null)
        return this
    },
    copy: function () {
        var t = {},
            r = this._
        for (var i in r) t[i] = r[i].slice()
        return new el(t)
    },
    call: function (t, r) {
        if ((u = arguments.length - 2) > 0)
            for (var i = new Array(u), l = 0, u, a; l < u; ++l)
                i[l] = arguments[l + 2]
        if (!this._.hasOwnProperty(t)) throw new Error('unknown type: ' + t)
        for (a = this._[t], l = 0, u = a.length; l < u; ++l)
            a[l].value.apply(r, i)
    },
    apply: function (t, r, i) {
        if (!this._.hasOwnProperty(t)) throw new Error('unknown type: ' + t)
        for (var l = this._[t], u = 0, a = l.length; u < a; ++u)
            l[u].value.apply(r, i)
    },
}
function K0(t, r) {
    for (var i = 0, l = t.length, u; i < l; ++i)
        if ((u = t[i]).name === r) return u.value
}
function Qd(t, r, i) {
    for (var l = 0, u = t.length; l < u; ++l)
        if (t[l].name === r) {
            ;((t[l] = X0), (t = t.slice(0, l).concat(t.slice(l + 1))))
            break
        }
    return (
        i != null &&
            t.push({
                name: r,
                value: i,
            }),
        t
    )
}
var Oa = 'http://www.w3.org/1999/xhtml'
const Kd = {
    svg: 'http://www.w3.org/2000/svg',
    xhtml: Oa,
    xlink: 'http://www.w3.org/1999/xlink',
    xml: 'http://www.w3.org/XML/1998/namespace',
    xmlns: 'http://www.w3.org/2000/xmlns/',
}
function vl(t) {
    var r = (t += ''),
        i = r.indexOf(':')
    return (
        i >= 0 && (r = t.slice(0, i)) !== 'xmlns' && (t = t.slice(i + 1)),
        Kd.hasOwnProperty(r)
            ? {
                  space: Kd[r],
                  local: t,
              }
            : t
    )
}
function G0(t) {
    return function () {
        var r = this.ownerDocument,
            i = this.namespaceURI
        return i === Oa && r.documentElement.namespaceURI === Oa
            ? r.createElement(t)
            : r.createElementNS(i, t)
    }
}
function q0(t) {
    return function () {
        return this.ownerDocument.createElementNS(t.space, t.local)
    }
}
function ap(t) {
    var r = vl(t)
    return (r.local ? q0 : G0)(r)
}
function Z0() {}
function Za(t) {
    return t == null
        ? Z0
        : function () {
              return this.querySelector(t)
          }
}
function J0(t) {
    typeof t != 'function' && (t = Za(t))
    for (
        var r = this._groups, i = r.length, l = new Array(i), u = 0;
        u < i;
        ++u
    )
        for (
            var a = r[u], c = a.length, d = (l[u] = new Array(c)), p, m, v = 0;
            v < c;
            ++v
        )
            (p = a[v]) &&
                (m = t.call(p, p.__data__, v, a)) &&
                ('__data__' in p && (m.__data__ = p.__data__), (d[v] = m))
    return new St(l, this._parents)
}
function ey(t) {
    return t == null ? [] : Array.isArray(t) ? t : Array.from(t)
}
function ty() {
    return []
}
function cp(t) {
    return t == null
        ? ty
        : function () {
              return this.querySelectorAll(t)
          }
}
function ny(t) {
    return function () {
        return ey(t.apply(this, arguments))
    }
}
function ry(t) {
    typeof t == 'function' ? (t = ny(t)) : (t = cp(t))
    for (var r = this._groups, i = r.length, l = [], u = [], a = 0; a < i; ++a)
        for (var c = r[a], d = c.length, p, m = 0; m < d; ++m)
            (p = c[m]) && (l.push(t.call(p, p.__data__, m, c)), u.push(p))
    return new St(l, u)
}
function fp(t) {
    return function () {
        return this.matches(t)
    }
}
function dp(t) {
    return function (r) {
        return r.matches(t)
    }
}
var oy = Array.prototype.find
function iy(t) {
    return function () {
        return oy.call(this.children, t)
    }
}
function sy() {
    return this.firstElementChild
}
function ly(t) {
    return this.select(t == null ? sy : iy(typeof t == 'function' ? t : dp(t)))
}
var uy = Array.prototype.filter
function ay() {
    return Array.from(this.children)
}
function cy(t) {
    return function () {
        return uy.call(this.children, t)
    }
}
function fy(t) {
    return this.selectAll(
        t == null ? ay : cy(typeof t == 'function' ? t : dp(t))
    )
}
function dy(t) {
    typeof t != 'function' && (t = fp(t))
    for (
        var r = this._groups, i = r.length, l = new Array(i), u = 0;
        u < i;
        ++u
    )
        for (var a = r[u], c = a.length, d = (l[u] = []), p, m = 0; m < c; ++m)
            (p = a[m]) && t.call(p, p.__data__, m, a) && d.push(p)
    return new St(l, this._parents)
}
function hp(t) {
    return new Array(t.length)
}
function hy() {
    return new St(this._enter || this._groups.map(hp), this._parents)
}
function il(t, r) {
    ;((this.ownerDocument = t.ownerDocument),
        (this.namespaceURI = t.namespaceURI),
        (this._next = null),
        (this._parent = t),
        (this.__data__ = r))
}
il.prototype = {
    constructor: il,
    appendChild: function (t) {
        return this._parent.insertBefore(t, this._next)
    },
    insertBefore: function (t, r) {
        return this._parent.insertBefore(t, r)
    },
    querySelector: function (t) {
        return this._parent.querySelector(t)
    },
    querySelectorAll: function (t) {
        return this._parent.querySelectorAll(t)
    },
}
function py(t) {
    return function () {
        return t
    }
}
function gy(t, r, i, l, u, a) {
    for (var c = 0, d, p = r.length, m = a.length; c < m; ++c)
        (d = r[c])
            ? ((d.__data__ = a[c]), (l[c] = d))
            : (i[c] = new il(t, a[c]))
    for (; c < p; ++c) (d = r[c]) && (u[c] = d)
}
function my(t, r, i, l, u, a, c) {
    var d,
        p,
        m = new Map(),
        v = r.length,
        g = a.length,
        y = new Array(v),
        S
    for (d = 0; d < v; ++d)
        (p = r[d]) &&
            ((y[d] = S = c.call(p, p.__data__, d, r) + ''),
            m.has(S) ? (u[d] = p) : m.set(S, p))
    for (d = 0; d < g; ++d)
        ((S = c.call(t, a[d], d, a) + ''),
            (p = m.get(S))
                ? ((l[d] = p), (p.__data__ = a[d]), m.delete(S))
                : (i[d] = new il(t, a[d])))
    for (d = 0; d < v; ++d) (p = r[d]) && m.get(y[d]) === p && (u[d] = p)
}
function yy(t) {
    return t.__data__
}
function vy(t, r) {
    if (!arguments.length) return Array.from(this, yy)
    var i = r ? my : gy,
        l = this._parents,
        u = this._groups
    typeof t != 'function' && (t = py(t))
    for (
        var a = u.length,
            c = new Array(a),
            d = new Array(a),
            p = new Array(a),
            m = 0;
        m < a;
        ++m
    ) {
        var v = l[m],
            g = u[m],
            y = g.length,
            S = xy(t.call(v, v && v.__data__, m, l)),
            _ = S.length,
            E = (d[m] = new Array(_)),
            k = (c[m] = new Array(_)),
            C = (p[m] = new Array(y))
        i(v, g, E, k, C, S, r)
        for (var I = 0, w = 0, N, A; I < _; ++I)
            if ((N = E[I])) {
                for (I >= w && (w = I + 1); !(A = k[w]) && ++w < _; );
                N._next = A || null
            }
    }
    return ((c = new St(c, l)), (c._enter = d), (c._exit = p), c)
}
function xy(t) {
    return typeof t == 'object' && 'length' in t ? t : Array.from(t)
}
function wy() {
    return new St(this._exit || this._groups.map(hp), this._parents)
}
function Sy(t, r, i) {
    var l = this.enter(),
        u = this,
        a = this.exit()
    return (
        typeof t == 'function'
            ? ((l = t(l)), l && (l = l.selection()))
            : (l = l.append(t + '')),
        r != null && ((u = r(u)), u && (u = u.selection())),
        i == null ? a.remove() : i(a),
        l && u ? l.merge(u).order() : u
    )
}
function _y(t) {
    for (
        var r = t.selection ? t.selection() : t,
            i = this._groups,
            l = r._groups,
            u = i.length,
            a = l.length,
            c = Math.min(u, a),
            d = new Array(u),
            p = 0;
        p < c;
        ++p
    )
        for (
            var m = i[p],
                v = l[p],
                g = m.length,
                y = (d[p] = new Array(g)),
                S,
                _ = 0;
            _ < g;
            ++_
        )
            (S = m[_] || v[_]) && (y[_] = S)
    for (; p < u; ++p) d[p] = i[p]
    return new St(d, this._parents)
}
function Ey() {
    for (var t = this._groups, r = -1, i = t.length; ++r < i; )
        for (var l = t[r], u = l.length - 1, a = l[u], c; --u >= 0; )
            (c = l[u]) &&
                (a &&
                    c.compareDocumentPosition(a) ^ 4 &&
                    a.parentNode.insertBefore(c, a),
                (a = c))
    return this
}
function ky(t) {
    t || (t = Cy)
    function r(g, y) {
        return g && y ? t(g.__data__, y.__data__) : !g - !y
    }
    for (
        var i = this._groups, l = i.length, u = new Array(l), a = 0;
        a < l;
        ++a
    ) {
        for (
            var c = i[a], d = c.length, p = (u[a] = new Array(d)), m, v = 0;
            v < d;
            ++v
        )
            (m = c[v]) && (p[v] = m)
        p.sort(r)
    }
    return new St(u, this._parents).order()
}
function Cy(t, r) {
    return t < r ? -1 : t > r ? 1 : t >= r ? 0 : NaN
}
function Ny() {
    var t = arguments[0]
    return ((arguments[0] = this), t.apply(null, arguments), this)
}
function My() {
    return Array.from(this)
}
function Py() {
    for (var t = this._groups, r = 0, i = t.length; r < i; ++r)
        for (var l = t[r], u = 0, a = l.length; u < a; ++u) {
            var c = l[u]
            if (c) return c
        }
    return null
}
function zy() {
    let t = 0
    for (const r of this) ++t
    return t
}
function Ly() {
    return !this.node()
}
function Iy(t) {
    for (var r = this._groups, i = 0, l = r.length; i < l; ++i)
        for (var u = r[i], a = 0, c = u.length, d; a < c; ++a)
            (d = u[a]) && t.call(d, d.__data__, a, u)
    return this
}
function Ty(t) {
    return function () {
        this.removeAttribute(t)
    }
}
function Ry(t) {
    return function () {
        this.removeAttributeNS(t.space, t.local)
    }
}
function Dy(t, r) {
    return function () {
        this.setAttribute(t, r)
    }
}
function Ay(t, r) {
    return function () {
        this.setAttributeNS(t.space, t.local, r)
    }
}
function $y(t, r) {
    return function () {
        var i = r.apply(this, arguments)
        i == null ? this.removeAttribute(t) : this.setAttribute(t, i)
    }
}
function Oy(t, r) {
    return function () {
        var i = r.apply(this, arguments)
        i == null
            ? this.removeAttributeNS(t.space, t.local)
            : this.setAttributeNS(t.space, t.local, i)
    }
}
function Fy(t, r) {
    var i = vl(t)
    if (arguments.length < 2) {
        var l = this.node()
        return i.local ? l.getAttributeNS(i.space, i.local) : l.getAttribute(i)
    }
    return this.each(
        (r == null
            ? i.local
                ? Ry
                : Ty
            : typeof r == 'function'
              ? i.local
                  ? Oy
                  : $y
              : i.local
                ? Ay
                : Dy)(i, r)
    )
}
function pp(t) {
    return (
        (t.ownerDocument && t.ownerDocument.defaultView) ||
        (t.document && t) ||
        t.defaultView
    )
}
function Hy(t) {
    return function () {
        this.style.removeProperty(t)
    }
}
function jy(t, r, i) {
    return function () {
        this.style.setProperty(t, r, i)
    }
}
function Vy(t, r, i) {
    return function () {
        var l = r.apply(this, arguments)
        l == null
            ? this.style.removeProperty(t)
            : this.style.setProperty(t, l, i)
    }
}
function By(t, r, i) {
    return arguments.length > 1
        ? this.each(
              (r == null ? Hy : typeof r == 'function' ? Vy : jy)(t, r, i ?? '')
          )
        : to(this.node(), t)
}
function to(t, r) {
    return (
        t.style.getPropertyValue(r) ||
        pp(t).getComputedStyle(t, null).getPropertyValue(r)
    )
}
function Uy(t) {
    return function () {
        delete this[t]
    }
}
function Wy(t, r) {
    return function () {
        this[t] = r
    }
}
function Yy(t, r) {
    return function () {
        var i = r.apply(this, arguments)
        i == null ? delete this[t] : (this[t] = i)
    }
}
function by(t, r) {
    return arguments.length > 1
        ? this.each((r == null ? Uy : typeof r == 'function' ? Yy : Wy)(t, r))
        : this.node()[t]
}
function gp(t) {
    return t.trim().split(/^|\s+/)
}
function Ja(t) {
    return t.classList || new mp(t)
}
function mp(t) {
    ;((this._node = t), (this._names = gp(t.getAttribute('class') || '')))
}
mp.prototype = {
    add: function (t) {
        var r = this._names.indexOf(t)
        r < 0 &&
            (this._names.push(t),
            this._node.setAttribute('class', this._names.join(' ')))
    },
    remove: function (t) {
        var r = this._names.indexOf(t)
        r >= 0 &&
            (this._names.splice(r, 1),
            this._node.setAttribute('class', this._names.join(' ')))
    },
    contains: function (t) {
        return this._names.indexOf(t) >= 0
    },
}
function yp(t, r) {
    for (var i = Ja(t), l = -1, u = r.length; ++l < u; ) i.add(r[l])
}
function vp(t, r) {
    for (var i = Ja(t), l = -1, u = r.length; ++l < u; ) i.remove(r[l])
}
function Xy(t) {
    return function () {
        yp(this, t)
    }
}
function Qy(t) {
    return function () {
        vp(this, t)
    }
}
function Ky(t, r) {
    return function () {
        ;(r.apply(this, arguments) ? yp : vp)(this, t)
    }
}
function Gy(t, r) {
    var i = gp(t + '')
    if (arguments.length < 2) {
        for (var l = Ja(this.node()), u = -1, a = i.length; ++u < a; )
            if (!l.contains(i[u])) return !1
        return !0
    }
    return this.each((typeof r == 'function' ? Ky : r ? Xy : Qy)(i, r))
}
function qy() {
    this.textContent = ''
}
function Zy(t) {
    return function () {
        this.textContent = t
    }
}
function Jy(t) {
    return function () {
        var r = t.apply(this, arguments)
        this.textContent = r ?? ''
    }
}
function ev(t) {
    return arguments.length
        ? this.each(t == null ? qy : (typeof t == 'function' ? Jy : Zy)(t))
        : this.node().textContent
}
function tv() {
    this.innerHTML = ''
}
function nv(t) {
    return function () {
        this.innerHTML = t
    }
}
function rv(t) {
    return function () {
        var r = t.apply(this, arguments)
        this.innerHTML = r ?? ''
    }
}
function ov(t) {
    return arguments.length
        ? this.each(t == null ? tv : (typeof t == 'function' ? rv : nv)(t))
        : this.node().innerHTML
}
function iv() {
    this.nextSibling && this.parentNode.appendChild(this)
}
function sv() {
    return this.each(iv)
}
function lv() {
    this.previousSibling &&
        this.parentNode.insertBefore(this, this.parentNode.firstChild)
}
function uv() {
    return this.each(lv)
}
function av(t) {
    var r = typeof t == 'function' ? t : ap(t)
    return this.select(function () {
        return this.appendChild(r.apply(this, arguments))
    })
}
function cv() {
    return null
}
function fv(t, r) {
    var i = typeof t == 'function' ? t : ap(t),
        l = r == null ? cv : typeof r == 'function' ? r : Za(r)
    return this.select(function () {
        return this.insertBefore(
            i.apply(this, arguments),
            l.apply(this, arguments) || null
        )
    })
}
function dv() {
    var t = this.parentNode
    t && t.removeChild(this)
}
function hv() {
    return this.each(dv)
}
function pv() {
    var t = this.cloneNode(!1),
        r = this.parentNode
    return r ? r.insertBefore(t, this.nextSibling) : t
}
function gv() {
    var t = this.cloneNode(!0),
        r = this.parentNode
    return r ? r.insertBefore(t, this.nextSibling) : t
}
function mv(t) {
    return this.select(t ? gv : pv)
}
function yv(t) {
    return arguments.length
        ? this.property('__data__', t)
        : this.node().__data__
}
function vv(t) {
    return function (r) {
        t.call(this, r, this.__data__)
    }
}
function xv(t) {
    return t
        .trim()
        .split(/^|\s+/)
        .map(function (r) {
            var i = '',
                l = r.indexOf('.')
            return (
                l >= 0 && ((i = r.slice(l + 1)), (r = r.slice(0, l))),
                {
                    type: r,
                    name: i,
                }
            )
        })
}
function wv(t) {
    return function () {
        var r = this.__on
        if (r) {
            for (var i = 0, l = -1, u = r.length, a; i < u; ++i)
                ((a = r[i]),
                    (!t.type || a.type === t.type) && a.name === t.name
                        ? this.removeEventListener(
                              a.type,
                              a.listener,
                              a.options
                          )
                        : (r[++l] = a))
            ++l ? (r.length = l) : delete this.__on
        }
    }
}
function Sv(t, r, i) {
    return function () {
        var l = this.__on,
            u,
            a = vv(r)
        if (l) {
            for (var c = 0, d = l.length; c < d; ++c)
                if ((u = l[c]).type === t.type && u.name === t.name) {
                    ;(this.removeEventListener(u.type, u.listener, u.options),
                        this.addEventListener(
                            u.type,
                            (u.listener = a),
                            (u.options = i)
                        ),
                        (u.value = r))
                    return
                }
        }
        ;(this.addEventListener(t.type, a, i),
            (u = {
                type: t.type,
                name: t.name,
                value: r,
                listener: a,
                options: i,
            }),
            l ? l.push(u) : (this.__on = [u]))
    }
}
function _v(t, r, i) {
    var l = xv(t + ''),
        u,
        a = l.length,
        c
    if (arguments.length < 2) {
        var d = this.node().__on
        if (d) {
            for (var p = 0, m = d.length, v; p < m; ++p)
                for (u = 0, v = d[p]; u < a; ++u)
                    if ((c = l[u]).type === v.type && c.name === v.name)
                        return v.value
        }
        return
    }
    for (d = r ? Sv : wv, u = 0; u < a; ++u) this.each(d(l[u], r, i))
    return this
}
function xp(t, r, i) {
    var l = pp(t),
        u = l.CustomEvent
    ;(typeof u == 'function'
        ? (u = new u(r, i))
        : ((u = l.document.createEvent('Event')),
          i
              ? (u.initEvent(r, i.bubbles, i.cancelable), (u.detail = i.detail))
              : u.initEvent(r, !1, !1)),
        t.dispatchEvent(u))
}
function Ev(t, r) {
    return function () {
        return xp(this, t, r)
    }
}
function kv(t, r) {
    return function () {
        return xp(this, t, r.apply(this, arguments))
    }
}
function Cv(t, r) {
    return this.each((typeof r == 'function' ? kv : Ev)(t, r))
}
function* Nv() {
    for (var t = this._groups, r = 0, i = t.length; r < i; ++r)
        for (var l = t[r], u = 0, a = l.length, c; u < a; ++u)
            (c = l[u]) && (yield c)
}
var wp = [null]
function St(t, r) {
    ;((this._groups = t), (this._parents = r))
}
function yi() {
    return new St([[document.documentElement]], wp)
}
function Mv() {
    return this
}
St.prototype = yi.prototype = {
    constructor: St,
    select: J0,
    selectAll: ry,
    selectChild: ly,
    selectChildren: fy,
    filter: dy,
    data: vy,
    enter: hy,
    exit: wy,
    join: Sy,
    merge: _y,
    selection: Mv,
    order: Ey,
    sort: ky,
    call: Ny,
    nodes: My,
    node: Py,
    size: zy,
    empty: Ly,
    each: Iy,
    attr: Fy,
    style: By,
    property: by,
    classed: Gy,
    text: ev,
    html: ov,
    raise: sv,
    lower: uv,
    append: av,
    insert: fv,
    remove: hv,
    clone: mv,
    datum: yv,
    on: _v,
    dispatch: Cv,
    [Symbol.iterator]: Nv,
}
function wt(t) {
    return typeof t == 'string'
        ? new St([[document.querySelector(t)]], [document.documentElement])
        : new St([[t]], wp)
}
function Pv(t) {
    let r
    for (; (r = t.sourceEvent); ) t = r
    return t
}
function Ot(t, r) {
    if (((t = Pv(t)), r === void 0 && (r = t.currentTarget), r)) {
        var i = r.ownerSVGElement || r
        if (i.createSVGPoint) {
            var l = i.createSVGPoint()
            return (
                (l.x = t.clientX),
                (l.y = t.clientY),
                (l = l.matrixTransform(r.getScreenCTM().inverse())),
                [l.x, l.y]
            )
        }
        if (r.getBoundingClientRect) {
            var u = r.getBoundingClientRect()
            return [
                t.clientX - u.left - r.clientLeft,
                t.clientY - u.top - r.clientTop,
            ]
        }
    }
    return [t.pageX, t.pageY]
}
const zv = {
        passive: !1,
    },
    li = {
        capture: !0,
        passive: !1,
    }
function ka(t) {
    t.stopImmediatePropagation()
}
function Zr(t) {
    ;(t.preventDefault(), t.stopImmediatePropagation())
}
function Sp(t) {
    var r = t.document.documentElement,
        i = wt(t).on('dragstart.drag', Zr, li)
    'onselectstart' in r
        ? i.on('selectstart.drag', Zr, li)
        : ((r.__noselect = r.style.MozUserSelect),
          (r.style.MozUserSelect = 'none'))
}
function _p(t, r) {
    var i = t.document.documentElement,
        l = wt(t).on('dragstart.drag', null)
    ;(r &&
        (l.on('click.drag', Zr, li),
        setTimeout(function () {
            l.on('click.drag', null)
        }, 0)),
        'onselectstart' in i
            ? l.on('selectstart.drag', null)
            : ((i.style.MozUserSelect = i.__noselect), delete i.__noselect))
}
const Ws = (t) => () => t
function Fa(
    t,
    {
        sourceEvent: r,
        subject: i,
        target: l,
        identifier: u,
        active: a,
        x: c,
        y: d,
        dx: p,
        dy: m,
        dispatch: v,
    }
) {
    Object.defineProperties(this, {
        type: {
            value: t,
            enumerable: !0,
            configurable: !0,
        },
        sourceEvent: {
            value: r,
            enumerable: !0,
            configurable: !0,
        },
        subject: {
            value: i,
            enumerable: !0,
            configurable: !0,
        },
        target: {
            value: l,
            enumerable: !0,
            configurable: !0,
        },
        identifier: {
            value: u,
            enumerable: !0,
            configurable: !0,
        },
        active: {
            value: a,
            enumerable: !0,
            configurable: !0,
        },
        x: {
            value: c,
            enumerable: !0,
            configurable: !0,
        },
        y: {
            value: d,
            enumerable: !0,
            configurable: !0,
        },
        dx: {
            value: p,
            enumerable: !0,
            configurable: !0,
        },
        dy: {
            value: m,
            enumerable: !0,
            configurable: !0,
        },
        _: {
            value: v,
        },
    })
}
Fa.prototype.on = function () {
    var t = this._.on.apply(this._, arguments)
    return t === this._ ? this : t
}
function Lv(t) {
    return !t.ctrlKey && !t.button
}
function Iv() {
    return this.parentNode
}
function Tv(t, r) {
    return (
        r ?? {
            x: t.x,
            y: t.y,
        }
    )
}
function Rv() {
    return navigator.maxTouchPoints || 'ontouchstart' in this
}
function Ep() {
    var t = Lv,
        r = Iv,
        i = Tv,
        l = Rv,
        u = {},
        a = yl('start', 'drag', 'end'),
        c = 0,
        d,
        p,
        m,
        v,
        g = 0
    function y(N) {
        N.on('mousedown.drag', S)
            .filter(l)
            .on('touchstart.drag', k)
            .on('touchmove.drag', C, zv)
            .on('touchend.drag touchcancel.drag', I)
            .style('touch-action', 'none')
            .style('-webkit-tap-highlight-color', 'rgba(0,0,0,0)')
    }
    function S(N, A) {
        if (!(v || !t.call(this, N, A))) {
            var T = w(this, r.call(this, N, A), N, A, 'mouse')
            T &&
                (wt(N.view)
                    .on('mousemove.drag', _, li)
                    .on('mouseup.drag', E, li),
                Sp(N.view),
                ka(N),
                (m = !1),
                (d = N.clientX),
                (p = N.clientY),
                T('start', N))
        }
    }
    function _(N) {
        if ((Zr(N), !m)) {
            var A = N.clientX - d,
                T = N.clientY - p
            m = A * A + T * T > g
        }
        u.mouse('drag', N)
    }
    function E(N) {
        ;(wt(N.view).on('mousemove.drag mouseup.drag', null),
            _p(N.view, m),
            Zr(N),
            u.mouse('end', N))
    }
    function k(N, A) {
        if (t.call(this, N, A)) {
            var T = N.changedTouches,
                F = r.call(this, N, A),
                V = T.length,
                K,
                ne
            for (K = 0; K < V; ++K)
                (ne = w(this, F, N, A, T[K].identifier, T[K])) &&
                    (ka(N), ne('start', N, T[K]))
        }
    }
    function C(N) {
        var A = N.changedTouches,
            T = A.length,
            F,
            V
        for (F = 0; F < T; ++F)
            (V = u[A[F].identifier]) && (Zr(N), V('drag', N, A[F]))
    }
    function I(N) {
        var A = N.changedTouches,
            T = A.length,
            F,
            V
        for (
            v && clearTimeout(v),
                v = setTimeout(function () {
                    v = null
                }, 500),
                F = 0;
            F < T;
            ++F
        )
            (V = u[A[F].identifier]) && (ka(N), V('end', N, A[F]))
    }
    function w(N, A, T, F, V, K) {
        var ne = a.copy(),
            U = Ot(K || T, A),
            W,
            Z,
            z
        if (
            (z = i.call(
                N,
                new Fa('beforestart', {
                    sourceEvent: T,
                    target: y,
                    identifier: V,
                    active: c,
                    x: U[0],
                    y: U[1],
                    dx: 0,
                    dy: 0,
                    dispatch: ne,
                }),
                F
            )) != null
        )
            return (
                (W = z.x - U[0] || 0),
                (Z = z.y - U[1] || 0),
                function B(H, b, L) {
                    var R = U,
                        j
                    switch (H) {
                        case 'start':
                            ;((u[V] = B), (j = c++))
                            break
                        case 'end':
                            ;(delete u[V], --c)
                        case 'drag':
                            ;((U = Ot(L || b, A)), (j = c))
                            break
                    }
                    ne.call(
                        H,
                        N,
                        new Fa(H, {
                            sourceEvent: b,
                            subject: z,
                            target: y,
                            identifier: V,
                            active: j,
                            x: U[0] + W,
                            y: U[1] + Z,
                            dx: U[0] - R[0],
                            dy: U[1] - R[1],
                            dispatch: ne,
                        }),
                        F
                    )
                }
            )
    }
    return (
        (y.filter = function (N) {
            return arguments.length
                ? ((t = typeof N == 'function' ? N : Ws(!!N)), y)
                : t
        }),
        (y.container = function (N) {
            return arguments.length
                ? ((r = typeof N == 'function' ? N : Ws(N)), y)
                : r
        }),
        (y.subject = function (N) {
            return arguments.length
                ? ((i = typeof N == 'function' ? N : Ws(N)), y)
                : i
        }),
        (y.touchable = function (N) {
            return arguments.length
                ? ((l = typeof N == 'function' ? N : Ws(!!N)), y)
                : l
        }),
        (y.on = function () {
            var N = a.on.apply(a, arguments)
            return N === a ? y : N
        }),
        (y.clickDistance = function (N) {
            return arguments.length ? ((g = (N = +N) * N), y) : Math.sqrt(g)
        }),
        y
    )
}
function ec(t, r, i) {
    ;((t.prototype = r.prototype = i), (i.constructor = t))
}
function kp(t, r) {
    var i = Object.create(t.prototype)
    for (var l in r) i[l] = r[l]
    return i
}
function vi() {}
var ui = 0.7,
    sl = 1 / ui,
    Jr = '\\s*([+-]?\\d+)\\s*',
    ai = '\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*',
    Gt = '\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*',
    Dv = /^#([0-9a-f]{3,8})$/,
    Av = new RegExp(`^rgb\\(${Jr},${Jr},${Jr}\\)$`),
    $v = new RegExp(`^rgb\\(${Gt},${Gt},${Gt}\\)$`),
    Ov = new RegExp(`^rgba\\(${Jr},${Jr},${Jr},${ai}\\)$`),
    Fv = new RegExp(`^rgba\\(${Gt},${Gt},${Gt},${ai}\\)$`),
    Hv = new RegExp(`^hsl\\(${ai},${Gt},${Gt}\\)$`),
    jv = new RegExp(`^hsla\\(${ai},${Gt},${Gt},${ai}\\)$`),
    Gd = {
        aliceblue: 15792383,
        antiquewhite: 16444375,
        aqua: 65535,
        aquamarine: 8388564,
        azure: 15794175,
        beige: 16119260,
        bisque: 16770244,
        black: 0,
        blanchedalmond: 16772045,
        blue: 255,
        blueviolet: 9055202,
        brown: 10824234,
        burlywood: 14596231,
        cadetblue: 6266528,
        chartreuse: 8388352,
        chocolate: 13789470,
        coral: 16744272,
        cornflowerblue: 6591981,
        cornsilk: 16775388,
        crimson: 14423100,
        cyan: 65535,
        darkblue: 139,
        darkcyan: 35723,
        darkgoldenrod: 12092939,
        darkgray: 11119017,
        darkgreen: 25600,
        darkgrey: 11119017,
        darkkhaki: 12433259,
        darkmagenta: 9109643,
        darkolivegreen: 5597999,
        darkorange: 16747520,
        darkorchid: 10040012,
        darkred: 9109504,
        darksalmon: 15308410,
        darkseagreen: 9419919,
        darkslateblue: 4734347,
        darkslategray: 3100495,
        darkslategrey: 3100495,
        darkturquoise: 52945,
        darkviolet: 9699539,
        deeppink: 16716947,
        deepskyblue: 49151,
        dimgray: 6908265,
        dimgrey: 6908265,
        dodgerblue: 2003199,
        firebrick: 11674146,
        floralwhite: 16775920,
        forestgreen: 2263842,
        fuchsia: 16711935,
        gainsboro: 14474460,
        ghostwhite: 16316671,
        gold: 16766720,
        goldenrod: 14329120,
        gray: 8421504,
        green: 32768,
        greenyellow: 11403055,
        grey: 8421504,
        honeydew: 15794160,
        hotpink: 16738740,
        indianred: 13458524,
        indigo: 4915330,
        ivory: 16777200,
        khaki: 15787660,
        lavender: 15132410,
        lavenderblush: 16773365,
        lawngreen: 8190976,
        lemonchiffon: 16775885,
        lightblue: 11393254,
        lightcoral: 15761536,
        lightcyan: 14745599,
        lightgoldenrodyellow: 16448210,
        lightgray: 13882323,
        lightgreen: 9498256,
        lightgrey: 13882323,
        lightpink: 16758465,
        lightsalmon: 16752762,
        lightseagreen: 2142890,
        lightskyblue: 8900346,
        lightslategray: 7833753,
        lightslategrey: 7833753,
        lightsteelblue: 11584734,
        lightyellow: 16777184,
        lime: 65280,
        limegreen: 3329330,
        linen: 16445670,
        magenta: 16711935,
        maroon: 8388608,
        mediumaquamarine: 6737322,
        mediumblue: 205,
        mediumorchid: 12211667,
        mediumpurple: 9662683,
        mediumseagreen: 3978097,
        mediumslateblue: 8087790,
        mediumspringgreen: 64154,
        mediumturquoise: 4772300,
        mediumvioletred: 13047173,
        midnightblue: 1644912,
        mintcream: 16121850,
        mistyrose: 16770273,
        moccasin: 16770229,
        navajowhite: 16768685,
        navy: 128,
        oldlace: 16643558,
        olive: 8421376,
        olivedrab: 7048739,
        orange: 16753920,
        orangered: 16729344,
        orchid: 14315734,
        palegoldenrod: 15657130,
        palegreen: 10025880,
        paleturquoise: 11529966,
        palevioletred: 14381203,
        papayawhip: 16773077,
        peachpuff: 16767673,
        peru: 13468991,
        pink: 16761035,
        plum: 14524637,
        powderblue: 11591910,
        purple: 8388736,
        rebeccapurple: 6697881,
        red: 16711680,
        rosybrown: 12357519,
        royalblue: 4286945,
        saddlebrown: 9127187,
        salmon: 16416882,
        sandybrown: 16032864,
        seagreen: 3050327,
        seashell: 16774638,
        sienna: 10506797,
        silver: 12632256,
        skyblue: 8900331,
        slateblue: 6970061,
        slategray: 7372944,
        slategrey: 7372944,
        snow: 16775930,
        springgreen: 65407,
        steelblue: 4620980,
        tan: 13808780,
        teal: 32896,
        thistle: 14204888,
        tomato: 16737095,
        turquoise: 4251856,
        violet: 15631086,
        wheat: 16113331,
        white: 16777215,
        whitesmoke: 16119285,
        yellow: 16776960,
        yellowgreen: 10145074,
    }
ec(vi, hr, {
    copy(t) {
        return Object.assign(new this.constructor(), this, t)
    },
    displayable() {
        return this.rgb().displayable()
    },
    hex: qd,
    formatHex: qd,
    formatHex8: Vv,
    formatHsl: Bv,
    formatRgb: Zd,
    toString: Zd,
})
function qd() {
    return this.rgb().formatHex()
}
function Vv() {
    return this.rgb().formatHex8()
}
function Bv() {
    return Cp(this).formatHsl()
}
function Zd() {
    return this.rgb().formatRgb()
}
function hr(t) {
    var r, i
    return (
        (t = (t + '').trim().toLowerCase()),
        (r = Dv.exec(t))
            ? ((i = r[1].length),
              (r = parseInt(r[1], 16)),
              i === 6
                  ? Jd(r)
                  : i === 3
                    ? new dt(
                          ((r >> 8) & 15) | ((r >> 4) & 240),
                          ((r >> 4) & 15) | (r & 240),
                          ((r & 15) << 4) | (r & 15),
                          1
                      )
                    : i === 8
                      ? Ys(
                            (r >> 24) & 255,
                            (r >> 16) & 255,
                            (r >> 8) & 255,
                            (r & 255) / 255
                        )
                      : i === 4
                        ? Ys(
                              ((r >> 12) & 15) | ((r >> 8) & 240),
                              ((r >> 8) & 15) | ((r >> 4) & 240),
                              ((r >> 4) & 15) | (r & 240),
                              (((r & 15) << 4) | (r & 15)) / 255
                          )
                        : null)
            : (r = Av.exec(t))
              ? new dt(r[1], r[2], r[3], 1)
              : (r = $v.exec(t))
                ? new dt(
                      (r[1] * 255) / 100,
                      (r[2] * 255) / 100,
                      (r[3] * 255) / 100,
                      1
                  )
                : (r = Ov.exec(t))
                  ? Ys(r[1], r[2], r[3], r[4])
                  : (r = Fv.exec(t))
                    ? Ys(
                          (r[1] * 255) / 100,
                          (r[2] * 255) / 100,
                          (r[3] * 255) / 100,
                          r[4]
                      )
                    : (r = Hv.exec(t))
                      ? nh(r[1], r[2] / 100, r[3] / 100, 1)
                      : (r = jv.exec(t))
                        ? nh(r[1], r[2] / 100, r[3] / 100, r[4])
                        : Gd.hasOwnProperty(t)
                          ? Jd(Gd[t])
                          : t === 'transparent'
                            ? new dt(NaN, NaN, NaN, 0)
                            : null
    )
}
function Jd(t) {
    return new dt((t >> 16) & 255, (t >> 8) & 255, t & 255, 1)
}
function Ys(t, r, i, l) {
    return (l <= 0 && (t = r = i = NaN), new dt(t, r, i, l))
}
function Uv(t) {
    return (
        t instanceof vi || (t = hr(t)),
        t ? ((t = t.rgb()), new dt(t.r, t.g, t.b, t.opacity)) : new dt()
    )
}
function Ha(t, r, i, l) {
    return arguments.length === 1 ? Uv(t) : new dt(t, r, i, l ?? 1)
}
function dt(t, r, i, l) {
    ;((this.r = +t), (this.g = +r), (this.b = +i), (this.opacity = +l))
}
ec(
    dt,
    Ha,
    kp(vi, {
        brighter(t) {
            return (
                (t = t == null ? sl : Math.pow(sl, t)),
                new dt(this.r * t, this.g * t, this.b * t, this.opacity)
            )
        },
        darker(t) {
            return (
                (t = t == null ? ui : Math.pow(ui, t)),
                new dt(this.r * t, this.g * t, this.b * t, this.opacity)
            )
        },
        rgb() {
            return this
        },
        clamp() {
            return new dt(fr(this.r), fr(this.g), fr(this.b), ll(this.opacity))
        },
        displayable() {
            return (
                -0.5 <= this.r &&
                this.r < 255.5 &&
                -0.5 <= this.g &&
                this.g < 255.5 &&
                -0.5 <= this.b &&
                this.b < 255.5 &&
                0 <= this.opacity &&
                this.opacity <= 1
            )
        },
        hex: eh,
        formatHex: eh,
        formatHex8: Wv,
        formatRgb: th,
        toString: th,
    })
)
function eh() {
    return `#${cr(this.r)}${cr(this.g)}${cr(this.b)}`
}
function Wv() {
    return `#${cr(this.r)}${cr(this.g)}${cr(this.b)}${cr((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`
}
function th() {
    const t = ll(this.opacity)
    return `${t === 1 ? 'rgb(' : 'rgba('}${fr(this.r)}, ${fr(this.g)}, ${fr(this.b)}${t === 1 ? ')' : `, ${t})`}`
}
function ll(t) {
    return isNaN(t) ? 1 : Math.max(0, Math.min(1, t))
}
function fr(t) {
    return Math.max(0, Math.min(255, Math.round(t) || 0))
}
function cr(t) {
    return ((t = fr(t)), (t < 16 ? '0' : '') + t.toString(16))
}
function nh(t, r, i, l) {
    return (
        l <= 0
            ? (t = r = i = NaN)
            : i <= 0 || i >= 1
              ? (t = r = NaN)
              : r <= 0 && (t = NaN),
        new Ft(t, r, i, l)
    )
}
function Cp(t) {
    if (t instanceof Ft) return new Ft(t.h, t.s, t.l, t.opacity)
    if ((t instanceof vi || (t = hr(t)), !t)) return new Ft()
    if (t instanceof Ft) return t
    t = t.rgb()
    var r = t.r / 255,
        i = t.g / 255,
        l = t.b / 255,
        u = Math.min(r, i, l),
        a = Math.max(r, i, l),
        c = NaN,
        d = a - u,
        p = (a + u) / 2
    return (
        d
            ? (r === a
                  ? (c = (i - l) / d + (i < l) * 6)
                  : i === a
                    ? (c = (l - r) / d + 2)
                    : (c = (r - i) / d + 4),
              (d /= p < 0.5 ? a + u : 2 - a - u),
              (c *= 60))
            : (d = p > 0 && p < 1 ? 0 : c),
        new Ft(c, d, p, t.opacity)
    )
}
function Yv(t, r, i, l) {
    return arguments.length === 1 ? Cp(t) : new Ft(t, r, i, l ?? 1)
}
function Ft(t, r, i, l) {
    ;((this.h = +t), (this.s = +r), (this.l = +i), (this.opacity = +l))
}
ec(
    Ft,
    Yv,
    kp(vi, {
        brighter(t) {
            return (
                (t = t == null ? sl : Math.pow(sl, t)),
                new Ft(this.h, this.s, this.l * t, this.opacity)
            )
        },
        darker(t) {
            return (
                (t = t == null ? ui : Math.pow(ui, t)),
                new Ft(this.h, this.s, this.l * t, this.opacity)
            )
        },
        rgb() {
            var t = (this.h % 360) + (this.h < 0) * 360,
                r = isNaN(t) || isNaN(this.s) ? 0 : this.s,
                i = this.l,
                l = i + (i < 0.5 ? i : 1 - i) * r,
                u = 2 * i - l
            return new dt(
                Ca(t >= 240 ? t - 240 : t + 120, u, l),
                Ca(t, u, l),
                Ca(t < 120 ? t + 240 : t - 120, u, l),
                this.opacity
            )
        },
        clamp() {
            return new Ft(rh(this.h), bs(this.s), bs(this.l), ll(this.opacity))
        },
        displayable() {
            return (
                ((0 <= this.s && this.s <= 1) || isNaN(this.s)) &&
                0 <= this.l &&
                this.l <= 1 &&
                0 <= this.opacity &&
                this.opacity <= 1
            )
        },
        formatHsl() {
            const t = ll(this.opacity)
            return `${t === 1 ? 'hsl(' : 'hsla('}${rh(this.h)}, ${bs(this.s) * 100}%, ${bs(this.l) * 100}%${t === 1 ? ')' : `, ${t})`}`
        },
    })
)
function rh(t) {
    return ((t = (t || 0) % 360), t < 0 ? t + 360 : t)
}
function bs(t) {
    return Math.max(0, Math.min(1, t || 0))
}
function Ca(t, r, i) {
    return (
        (t < 60
            ? r + ((i - r) * t) / 60
            : t < 180
              ? i
              : t < 240
                ? r + ((i - r) * (240 - t)) / 60
                : r) * 255
    )
}
const tc = (t) => () => t
function bv(t, r) {
    return function (i) {
        return t + i * r
    }
}
function Xv(t, r, i) {
    return (
        (t = Math.pow(t, i)),
        (r = Math.pow(r, i) - t),
        (i = 1 / i),
        function (l) {
            return Math.pow(t + l * r, i)
        }
    )
}
function Qv(t) {
    return (t = +t) == 1
        ? Np
        : function (r, i) {
              return i - r ? Xv(r, i, t) : tc(isNaN(r) ? i : r)
          }
}
function Np(t, r) {
    var i = r - t
    return i ? bv(t, i) : tc(isNaN(t) ? r : t)
}
const ul = (function t(r) {
    var i = Qv(r)
    function l(u, a) {
        var c = i((u = Ha(u)).r, (a = Ha(a)).r),
            d = i(u.g, a.g),
            p = i(u.b, a.b),
            m = Np(u.opacity, a.opacity)
        return function (v) {
            return (
                (u.r = c(v)),
                (u.g = d(v)),
                (u.b = p(v)),
                (u.opacity = m(v)),
                u + ''
            )
        }
    }
    return ((l.gamma = t), l)
})(1)
function Kv(t, r) {
    r || (r = [])
    var i = t ? Math.min(r.length, t.length) : 0,
        l = r.slice(),
        u
    return function (a) {
        for (u = 0; u < i; ++u) l[u] = t[u] * (1 - a) + r[u] * a
        return l
    }
}
function Gv(t) {
    return ArrayBuffer.isView(t) && !(t instanceof DataView)
}
function qv(t, r) {
    var i = r ? r.length : 0,
        l = t ? Math.min(i, t.length) : 0,
        u = new Array(l),
        a = new Array(i),
        c
    for (c = 0; c < l; ++c) u[c] = ii(t[c], r[c])
    for (; c < i; ++c) a[c] = r[c]
    return function (d) {
        for (c = 0; c < l; ++c) a[c] = u[c](d)
        return a
    }
}
function Zv(t, r) {
    var i = new Date()
    return (
        (t = +t),
        (r = +r),
        function (l) {
            return (i.setTime(t * (1 - l) + r * l), i)
        }
    )
}
function Kt(t, r) {
    return (
        (t = +t),
        (r = +r),
        function (i) {
            return t * (1 - i) + r * i
        }
    )
}
function Jv(t, r) {
    var i = {},
        l = {},
        u
    ;((t === null || typeof t != 'object') && (t = {}),
        (r === null || typeof r != 'object') && (r = {}))
    for (u in r) u in t ? (i[u] = ii(t[u], r[u])) : (l[u] = r[u])
    return function (a) {
        for (u in i) l[u] = i[u](a)
        return l
    }
}
var ja = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
    Na = new RegExp(ja.source, 'g')
function ex(t) {
    return function () {
        return t
    }
}
function tx(t) {
    return function (r) {
        return t(r) + ''
    }
}
function Mp(t, r) {
    var i = (ja.lastIndex = Na.lastIndex = 0),
        l,
        u,
        a,
        c = -1,
        d = [],
        p = []
    for (t = t + '', r = r + ''; (l = ja.exec(t)) && (u = Na.exec(r)); )
        ((a = u.index) > i &&
            ((a = r.slice(i, a)), d[c] ? (d[c] += a) : (d[++c] = a)),
            (l = l[0]) === (u = u[0])
                ? d[c]
                    ? (d[c] += u)
                    : (d[++c] = u)
                : ((d[++c] = null),
                  p.push({
                      i: c,
                      x: Kt(l, u),
                  })),
            (i = Na.lastIndex))
    return (
        i < r.length && ((a = r.slice(i)), d[c] ? (d[c] += a) : (d[++c] = a)),
        d.length < 2
            ? p[0]
                ? tx(p[0].x)
                : ex(r)
            : ((r = p.length),
              function (m) {
                  for (var v = 0, g; v < r; ++v) d[(g = p[v]).i] = g.x(m)
                  return d.join('')
              })
    )
}
function ii(t, r) {
    var i = typeof r,
        l
    return r == null || i === 'boolean'
        ? tc(r)
        : (i === 'number'
              ? Kt
              : i === 'string'
                ? (l = hr(r))
                    ? ((r = l), ul)
                    : Mp
                : r instanceof hr
                  ? ul
                  : r instanceof Date
                    ? Zv
                    : Gv(r)
                      ? Kv
                      : Array.isArray(r)
                        ? qv
                        : (typeof r.valueOf != 'function' &&
                                typeof r.toString != 'function') ||
                            isNaN(r)
                          ? Jv
                          : Kt)(t, r)
}
var oh = 180 / Math.PI,
    Va = {
        translateX: 0,
        translateY: 0,
        rotate: 0,
        skewX: 0,
        scaleX: 1,
        scaleY: 1,
    }
function Pp(t, r, i, l, u, a) {
    var c, d, p
    return (
        (c = Math.sqrt(t * t + r * r)) && ((t /= c), (r /= c)),
        (p = t * i + r * l) && ((i -= t * p), (l -= r * p)),
        (d = Math.sqrt(i * i + l * l)) && ((i /= d), (l /= d), (p /= d)),
        t * l < r * i && ((t = -t), (r = -r), (p = -p), (c = -c)),
        {
            translateX: u,
            translateY: a,
            rotate: Math.atan2(r, t) * oh,
            skewX: Math.atan(p) * oh,
            scaleX: c,
            scaleY: d,
        }
    )
}
var Xs
function nx(t) {
    const r = new (
        typeof DOMMatrix == 'function' ? DOMMatrix : WebKitCSSMatrix
    )(t + '')
    return r.isIdentity ? Va : Pp(r.a, r.b, r.c, r.d, r.e, r.f)
}
function rx(t) {
    return t == null ||
        (Xs ||
            (Xs = document.createElementNS('http://www.w3.org/2000/svg', 'g')),
        Xs.setAttribute('transform', t),
        !(t = Xs.transform.baseVal.consolidate()))
        ? Va
        : ((t = t.matrix), Pp(t.a, t.b, t.c, t.d, t.e, t.f))
}
function zp(t, r, i, l) {
    function u(m) {
        return m.length ? m.pop() + ' ' : ''
    }
    function a(m, v, g, y, S, _) {
        if (m !== g || v !== y) {
            var E = S.push('translate(', null, r, null, i)
            _.push(
                {
                    i: E - 4,
                    x: Kt(m, g),
                },
                {
                    i: E - 2,
                    x: Kt(v, y),
                }
            )
        } else (g || y) && S.push('translate(' + g + r + y + i)
    }
    function c(m, v, g, y) {
        m !== v
            ? (m - v > 180 ? (v += 360) : v - m > 180 && (m += 360),
              y.push({
                  i: g.push(u(g) + 'rotate(', null, l) - 2,
                  x: Kt(m, v),
              }))
            : v && g.push(u(g) + 'rotate(' + v + l)
    }
    function d(m, v, g, y) {
        m !== v
            ? y.push({
                  i: g.push(u(g) + 'skewX(', null, l) - 2,
                  x: Kt(m, v),
              })
            : v && g.push(u(g) + 'skewX(' + v + l)
    }
    function p(m, v, g, y, S, _) {
        if (m !== g || v !== y) {
            var E = S.push(u(S) + 'scale(', null, ',', null, ')')
            _.push(
                {
                    i: E - 4,
                    x: Kt(m, g),
                },
                {
                    i: E - 2,
                    x: Kt(v, y),
                }
            )
        } else
            (g !== 1 || y !== 1) && S.push(u(S) + 'scale(' + g + ',' + y + ')')
    }
    return function (m, v) {
        var g = [],
            y = []
        return (
            (m = t(m)),
            (v = t(v)),
            a(m.translateX, m.translateY, v.translateX, v.translateY, g, y),
            c(m.rotate, v.rotate, g, y),
            d(m.skewX, v.skewX, g, y),
            p(m.scaleX, m.scaleY, v.scaleX, v.scaleY, g, y),
            (m = v = null),
            function (S) {
                for (var _ = -1, E = y.length, k; ++_ < E; )
                    g[(k = y[_]).i] = k.x(S)
                return g.join('')
            }
        )
    }
}
var ox = zp(nx, 'px, ', 'px)', 'deg)'),
    ix = zp(rx, ', ', ')', ')'),
    sx = 1e-12
function ih(t) {
    return ((t = Math.exp(t)) + 1 / t) / 2
}
function lx(t) {
    return ((t = Math.exp(t)) - 1 / t) / 2
}
function ux(t) {
    return ((t = Math.exp(2 * t)) - 1) / (t + 1)
}
const tl = (function t(r, i, l) {
    function u(a, c) {
        var d = a[0],
            p = a[1],
            m = a[2],
            v = c[0],
            g = c[1],
            y = c[2],
            S = v - d,
            _ = g - p,
            E = S * S + _ * _,
            k,
            C
        if (E < sx)
            ((C = Math.log(y / m) / r),
                (k = function (F) {
                    return [d + F * S, p + F * _, m * Math.exp(r * F * C)]
                }))
        else {
            var I = Math.sqrt(E),
                w = (y * y - m * m + l * E) / (2 * m * i * I),
                N = (y * y - m * m - l * E) / (2 * y * i * I),
                A = Math.log(Math.sqrt(w * w + 1) - w),
                T = Math.log(Math.sqrt(N * N + 1) - N)
            ;((C = (T - A) / r),
                (k = function (F) {
                    var V = F * C,
                        K = ih(A),
                        ne = (m / (i * I)) * (K * ux(r * V + A) - lx(A))
                    return [d + ne * S, p + ne * _, (m * K) / ih(r * V + A)]
                }))
        }
        return ((k.duration = (C * 1e3 * r) / Math.SQRT2), k)
    }
    return (
        (u.rho = function (a) {
            var c = Math.max(0.001, +a),
                d = c * c,
                p = d * d
            return t(c, d, p)
        }),
        u
    )
})(Math.SQRT2, 2, 4)
var no = 0,
    ri = 0,
    ti = 0,
    Lp = 1e3,
    al,
    oi,
    cl = 0,
    pr = 0,
    xl = 0,
    ci = typeof performance == 'object' && performance.now ? performance : Date,
    Ip =
        typeof window == 'object' && window.requestAnimationFrame
            ? window.requestAnimationFrame.bind(window)
            : function (t) {
                  setTimeout(t, 17)
              }
function nc() {
    return pr || (Ip(ax), (pr = ci.now() + xl))
}
function ax() {
    pr = 0
}
function fl() {
    this._call = this._time = this._next = null
}
fl.prototype = Tp.prototype = {
    constructor: fl,
    restart: function (t, r, i) {
        if (typeof t != 'function')
            throw new TypeError('callback is not a function')
        ;((i = (i == null ? nc() : +i) + (r == null ? 0 : +r)),
            !this._next &&
                oi !== this &&
                (oi ? (oi._next = this) : (al = this), (oi = this)),
            (this._call = t),
            (this._time = i),
            Ba())
    },
    stop: function () {
        this._call && ((this._call = null), (this._time = 1 / 0), Ba())
    },
}
function Tp(t, r, i) {
    var l = new fl()
    return (l.restart(t, r, i), l)
}
function cx() {
    ;(nc(), ++no)
    for (var t = al, r; t; )
        ((r = pr - t._time) >= 0 && t._call.call(void 0, r), (t = t._next))
    --no
}
function sh() {
    ;((pr = (cl = ci.now()) + xl), (no = ri = 0))
    try {
        cx()
    } finally {
        ;((no = 0), dx(), (pr = 0))
    }
}
function fx() {
    var t = ci.now(),
        r = t - cl
    r > Lp && ((xl -= r), (cl = t))
}
function dx() {
    for (var t, r = al, i, l = 1 / 0; r; )
        r._call
            ? (l > r._time && (l = r._time), (t = r), (r = r._next))
            : ((i = r._next),
              (r._next = null),
              (r = t ? (t._next = i) : (al = i)))
    ;((oi = t), Ba(l))
}
function Ba(t) {
    if (!no) {
        ri && (ri = clearTimeout(ri))
        var r = t - pr
        r > 24
            ? (t < 1 / 0 && (ri = setTimeout(sh, t - ci.now() - xl)),
              ti && (ti = clearInterval(ti)))
            : (ti || ((cl = ci.now()), (ti = setInterval(fx, Lp))),
              (no = 1),
              Ip(sh))
    }
}
function lh(t, r, i) {
    var l = new fl()
    return (
        (r = r == null ? 0 : +r),
        l.restart(
            (u) => {
                ;(l.stop(), t(u + r))
            },
            r,
            i
        ),
        l
    )
}
var hx = yl('start', 'end', 'cancel', 'interrupt'),
    px = [],
    Rp = 0,
    uh = 1,
    Ua = 2,
    nl = 3,
    ah = 4,
    Wa = 5,
    rl = 6
function wl(t, r, i, l, u, a) {
    var c = t.__transition
    if (!c) t.__transition = {}
    else if (i in c) return
    gx(t, i, {
        name: r,
        index: l,
        group: u,
        on: hx,
        tween: px,
        time: a.time,
        delay: a.delay,
        duration: a.duration,
        ease: a.ease,
        timer: null,
        state: Rp,
    })
}
function rc(t, r) {
    var i = Vt(t, r)
    if (i.state > Rp) throw new Error('too late; already scheduled')
    return i
}
function Zt(t, r) {
    var i = Vt(t, r)
    if (i.state > nl) throw new Error('too late; already running')
    return i
}
function Vt(t, r) {
    var i = t.__transition
    if (!i || !(i = i[r])) throw new Error('transition not found')
    return i
}
function gx(t, r, i) {
    var l = t.__transition,
        u
    ;((l[r] = i), (i.timer = Tp(a, 0, i.time)))
    function a(m) {
        ;((i.state = uh),
            i.timer.restart(c, i.delay, i.time),
            i.delay <= m && c(m - i.delay))
    }
    function c(m) {
        var v, g, y, S
        if (i.state !== uh) return p()
        for (v in l)
            if (((S = l[v]), S.name === i.name)) {
                if (S.state === nl) return lh(c)
                S.state === ah
                    ? ((S.state = rl),
                      S.timer.stop(),
                      S.on.call('interrupt', t, t.__data__, S.index, S.group),
                      delete l[v])
                    : +v < r &&
                      ((S.state = rl),
                      S.timer.stop(),
                      S.on.call('cancel', t, t.__data__, S.index, S.group),
                      delete l[v])
            }
        if (
            (lh(function () {
                i.state === nl &&
                    ((i.state = ah), i.timer.restart(d, i.delay, i.time), d(m))
            }),
            (i.state = Ua),
            i.on.call('start', t, t.__data__, i.index, i.group),
            i.state === Ua)
        ) {
            for (
                i.state = nl,
                    u = new Array((y = i.tween.length)),
                    v = 0,
                    g = -1;
                v < y;
                ++v
            )
                (S = i.tween[v].value.call(t, t.__data__, i.index, i.group)) &&
                    (u[++g] = S)
            u.length = g + 1
        }
    }
    function d(m) {
        for (
            var v =
                    m < i.duration
                        ? i.ease.call(null, m / i.duration)
                        : (i.timer.restart(p), (i.state = Wa), 1),
                g = -1,
                y = u.length;
            ++g < y;
        )
            u[g].call(t, v)
        i.state === Wa &&
            (i.on.call('end', t, t.__data__, i.index, i.group), p())
    }
    function p() {
        ;((i.state = rl), i.timer.stop(), delete l[r])
        for (var m in l) return
        delete t.__transition
    }
}
function ol(t, r) {
    var i = t.__transition,
        l,
        u,
        a = !0,
        c
    if (i) {
        r = r == null ? null : r + ''
        for (c in i) {
            if ((l = i[c]).name !== r) {
                a = !1
                continue
            }
            ;((u = l.state > Ua && l.state < Wa),
                (l.state = rl),
                l.timer.stop(),
                l.on.call(
                    u ? 'interrupt' : 'cancel',
                    t,
                    t.__data__,
                    l.index,
                    l.group
                ),
                delete i[c])
        }
        a && delete t.__transition
    }
}
function mx(t) {
    return this.each(function () {
        ol(this, t)
    })
}
function yx(t, r) {
    var i, l
    return function () {
        var u = Zt(this, t),
            a = u.tween
        if (a !== i) {
            l = i = a
            for (var c = 0, d = l.length; c < d; ++c)
                if (l[c].name === r) {
                    ;((l = l.slice()), l.splice(c, 1))
                    break
                }
        }
        u.tween = l
    }
}
function vx(t, r, i) {
    var l, u
    if (typeof i != 'function') throw new Error()
    return function () {
        var a = Zt(this, t),
            c = a.tween
        if (c !== l) {
            u = (l = c).slice()
            for (
                var d = {
                        name: r,
                        value: i,
                    },
                    p = 0,
                    m = u.length;
                p < m;
                ++p
            )
                if (u[p].name === r) {
                    u[p] = d
                    break
                }
            p === m && u.push(d)
        }
        a.tween = u
    }
}
function xx(t, r) {
    var i = this._id
    if (((t += ''), arguments.length < 2)) {
        for (
            var l = Vt(this.node(), i).tween, u = 0, a = l.length, c;
            u < a;
            ++u
        )
            if ((c = l[u]).name === t) return c.value
        return null
    }
    return this.each((r == null ? yx : vx)(i, t, r))
}
function oc(t, r, i) {
    var l = t._id
    return (
        t.each(function () {
            var u = Zt(this, l)
            ;(u.value || (u.value = {}))[r] = i.apply(this, arguments)
        }),
        function (u) {
            return Vt(u, l).value[r]
        }
    )
}
function Dp(t, r) {
    var i
    return (
        typeof r == 'number'
            ? Kt
            : r instanceof hr
              ? ul
              : (i = hr(r))
                ? ((r = i), ul)
                : Mp
    )(t, r)
}
function wx(t) {
    return function () {
        this.removeAttribute(t)
    }
}
function Sx(t) {
    return function () {
        this.removeAttributeNS(t.space, t.local)
    }
}
function _x(t, r, i) {
    var l,
        u = i + '',
        a
    return function () {
        var c = this.getAttribute(t)
        return c === u ? null : c === l ? a : (a = r((l = c), i))
    }
}
function Ex(t, r, i) {
    var l,
        u = i + '',
        a
    return function () {
        var c = this.getAttributeNS(t.space, t.local)
        return c === u ? null : c === l ? a : (a = r((l = c), i))
    }
}
function kx(t, r, i) {
    var l, u, a
    return function () {
        var c,
            d = i(this),
            p
        return d == null
            ? void this.removeAttribute(t)
            : ((c = this.getAttribute(t)),
              (p = d + ''),
              c === p
                  ? null
                  : c === l && p === u
                    ? a
                    : ((u = p), (a = r((l = c), d))))
    }
}
function Cx(t, r, i) {
    var l, u, a
    return function () {
        var c,
            d = i(this),
            p
        return d == null
            ? void this.removeAttributeNS(t.space, t.local)
            : ((c = this.getAttributeNS(t.space, t.local)),
              (p = d + ''),
              c === p
                  ? null
                  : c === l && p === u
                    ? a
                    : ((u = p), (a = r((l = c), d))))
    }
}
function Nx(t, r) {
    var i = vl(t),
        l = i === 'transform' ? ix : Dp
    return this.attrTween(
        t,
        typeof r == 'function'
            ? (i.local ? Cx : kx)(i, l, oc(this, 'attr.' + t, r))
            : r == null
              ? (i.local ? Sx : wx)(i)
              : (i.local ? Ex : _x)(i, l, r)
    )
}
function Mx(t, r) {
    return function (i) {
        this.setAttribute(t, r.call(this, i))
    }
}
function Px(t, r) {
    return function (i) {
        this.setAttributeNS(t.space, t.local, r.call(this, i))
    }
}
function zx(t, r) {
    var i, l
    function u() {
        var a = r.apply(this, arguments)
        return (a !== l && (i = (l = a) && Px(t, a)), i)
    }
    return ((u._value = r), u)
}
function Lx(t, r) {
    var i, l
    function u() {
        var a = r.apply(this, arguments)
        return (a !== l && (i = (l = a) && Mx(t, a)), i)
    }
    return ((u._value = r), u)
}
function Ix(t, r) {
    var i = 'attr.' + t
    if (arguments.length < 2) return (i = this.tween(i)) && i._value
    if (r == null) return this.tween(i, null)
    if (typeof r != 'function') throw new Error()
    var l = vl(t)
    return this.tween(i, (l.local ? zx : Lx)(l, r))
}
function Tx(t, r) {
    return function () {
        rc(this, t).delay = +r.apply(this, arguments)
    }
}
function Rx(t, r) {
    return (
        (r = +r),
        function () {
            rc(this, t).delay = r
        }
    )
}
function Dx(t) {
    var r = this._id
    return arguments.length
        ? this.each((typeof t == 'function' ? Tx : Rx)(r, t))
        : Vt(this.node(), r).delay
}
function Ax(t, r) {
    return function () {
        Zt(this, t).duration = +r.apply(this, arguments)
    }
}
function $x(t, r) {
    return (
        (r = +r),
        function () {
            Zt(this, t).duration = r
        }
    )
}
function Ox(t) {
    var r = this._id
    return arguments.length
        ? this.each((typeof t == 'function' ? Ax : $x)(r, t))
        : Vt(this.node(), r).duration
}
function Fx(t, r) {
    if (typeof r != 'function') throw new Error()
    return function () {
        Zt(this, t).ease = r
    }
}
function Hx(t) {
    var r = this._id
    return arguments.length ? this.each(Fx(r, t)) : Vt(this.node(), r).ease
}
function jx(t, r) {
    return function () {
        var i = r.apply(this, arguments)
        if (typeof i != 'function') throw new Error()
        Zt(this, t).ease = i
    }
}
function Vx(t) {
    if (typeof t != 'function') throw new Error()
    return this.each(jx(this._id, t))
}
function Bx(t) {
    typeof t != 'function' && (t = fp(t))
    for (
        var r = this._groups, i = r.length, l = new Array(i), u = 0;
        u < i;
        ++u
    )
        for (var a = r[u], c = a.length, d = (l[u] = []), p, m = 0; m < c; ++m)
            (p = a[m]) && t.call(p, p.__data__, m, a) && d.push(p)
    return new pn(l, this._parents, this._name, this._id)
}
function Ux(t) {
    if (t._id !== this._id) throw new Error()
    for (
        var r = this._groups,
            i = t._groups,
            l = r.length,
            u = i.length,
            a = Math.min(l, u),
            c = new Array(l),
            d = 0;
        d < a;
        ++d
    )
        for (
            var p = r[d],
                m = i[d],
                v = p.length,
                g = (c[d] = new Array(v)),
                y,
                S = 0;
            S < v;
            ++S
        )
            (y = p[S] || m[S]) && (g[S] = y)
    for (; d < l; ++d) c[d] = r[d]
    return new pn(c, this._parents, this._name, this._id)
}
function Wx(t) {
    return (t + '')
        .trim()
        .split(/^|\s+/)
        .every(function (r) {
            var i = r.indexOf('.')
            return (i >= 0 && (r = r.slice(0, i)), !r || r === 'start')
        })
}
function Yx(t, r, i) {
    var l,
        u,
        a = Wx(r) ? rc : Zt
    return function () {
        var c = a(this, t),
            d = c.on
        ;(d !== l && (u = (l = d).copy()).on(r, i), (c.on = u))
    }
}
function bx(t, r) {
    var i = this._id
    return arguments.length < 2
        ? Vt(this.node(), i).on.on(t)
        : this.each(Yx(i, t, r))
}
function Xx(t) {
    return function () {
        var r = this.parentNode
        for (var i in this.__transition) if (+i !== t) return
        r && r.removeChild(this)
    }
}
function Qx() {
    return this.on('end.remove', Xx(this._id))
}
function Kx(t) {
    var r = this._name,
        i = this._id
    typeof t != 'function' && (t = Za(t))
    for (
        var l = this._groups, u = l.length, a = new Array(u), c = 0;
        c < u;
        ++c
    )
        for (
            var d = l[c], p = d.length, m = (a[c] = new Array(p)), v, g, y = 0;
            y < p;
            ++y
        )
            (v = d[y]) &&
                (g = t.call(v, v.__data__, y, d)) &&
                ('__data__' in v && (g.__data__ = v.__data__),
                (m[y] = g),
                wl(m[y], r, i, y, m, Vt(v, i)))
    return new pn(a, this._parents, r, i)
}
function Gx(t) {
    var r = this._name,
        i = this._id
    typeof t != 'function' && (t = cp(t))
    for (var l = this._groups, u = l.length, a = [], c = [], d = 0; d < u; ++d)
        for (var p = l[d], m = p.length, v, g = 0; g < m; ++g)
            if ((v = p[g])) {
                for (
                    var y = t.call(v, v.__data__, g, p),
                        S,
                        _ = Vt(v, i),
                        E = 0,
                        k = y.length;
                    E < k;
                    ++E
                )
                    (S = y[E]) && wl(S, r, i, E, y, _)
                ;(a.push(y), c.push(v))
            }
    return new pn(a, c, r, i)
}
var qx = yi.prototype.constructor
function Zx() {
    return new qx(this._groups, this._parents)
}
function Jx(t, r) {
    var i, l, u
    return function () {
        var a = to(this, t),
            c = (this.style.removeProperty(t), to(this, t))
        return a === c
            ? null
            : a === i && c === l
              ? u
              : (u = r((i = a), (l = c)))
    }
}
function Ap(t) {
    return function () {
        this.style.removeProperty(t)
    }
}
function ew(t, r, i) {
    var l,
        u = i + '',
        a
    return function () {
        var c = to(this, t)
        return c === u ? null : c === l ? a : (a = r((l = c), i))
    }
}
function tw(t, r, i) {
    var l, u, a
    return function () {
        var c = to(this, t),
            d = i(this),
            p = d + ''
        return (
            d == null && (p = d = (this.style.removeProperty(t), to(this, t))),
            c === p
                ? null
                : c === l && p === u
                  ? a
                  : ((u = p), (a = r((l = c), d)))
        )
    }
}
function nw(t, r) {
    var i,
        l,
        u,
        a = 'style.' + r,
        c = 'end.' + a,
        d
    return function () {
        var p = Zt(this, t),
            m = p.on,
            v = p.value[a] == null ? d || (d = Ap(r)) : void 0
        ;((m !== i || u !== v) && (l = (i = m).copy()).on(c, (u = v)),
            (p.on = l))
    }
}
function rw(t, r, i) {
    var l = (t += '') == 'transform' ? ox : Dp
    return r == null
        ? this.styleTween(t, Jx(t, l)).on('end.style.' + t, Ap(t))
        : typeof r == 'function'
          ? this.styleTween(t, tw(t, l, oc(this, 'style.' + t, r))).each(
                nw(this._id, t)
            )
          : this.styleTween(t, ew(t, l, r), i).on('end.style.' + t, null)
}
function ow(t, r, i) {
    return function (l) {
        this.style.setProperty(t, r.call(this, l), i)
    }
}
function iw(t, r, i) {
    var l, u
    function a() {
        var c = r.apply(this, arguments)
        return (c !== u && (l = (u = c) && ow(t, c, i)), l)
    }
    return ((a._value = r), a)
}
function sw(t, r, i) {
    var l = 'style.' + (t += '')
    if (arguments.length < 2) return (l = this.tween(l)) && l._value
    if (r == null) return this.tween(l, null)
    if (typeof r != 'function') throw new Error()
    return this.tween(l, iw(t, r, i ?? ''))
}
function lw(t) {
    return function () {
        this.textContent = t
    }
}
function uw(t) {
    return function () {
        var r = t(this)
        this.textContent = r ?? ''
    }
}
function aw(t) {
    return this.tween(
        'text',
        typeof t == 'function'
            ? uw(oc(this, 'text', t))
            : lw(t == null ? '' : t + '')
    )
}
function cw(t) {
    return function (r) {
        this.textContent = t.call(this, r)
    }
}
function fw(t) {
    var r, i
    function l() {
        var u = t.apply(this, arguments)
        return (u !== i && (r = (i = u) && cw(u)), r)
    }
    return ((l._value = t), l)
}
function dw(t) {
    var r = 'text'
    if (arguments.length < 1) return (r = this.tween(r)) && r._value
    if (t == null) return this.tween(r, null)
    if (typeof t != 'function') throw new Error()
    return this.tween(r, fw(t))
}
function hw() {
    for (
        var t = this._name,
            r = this._id,
            i = $p(),
            l = this._groups,
            u = l.length,
            a = 0;
        a < u;
        ++a
    )
        for (var c = l[a], d = c.length, p, m = 0; m < d; ++m)
            if ((p = c[m])) {
                var v = Vt(p, r)
                wl(p, t, i, m, c, {
                    time: v.time + v.delay + v.duration,
                    delay: 0,
                    duration: v.duration,
                    ease: v.ease,
                })
            }
    return new pn(l, this._parents, t, i)
}
function pw() {
    var t,
        r,
        i = this,
        l = i._id,
        u = i.size()
    return new Promise(function (a, c) {
        var d = {
                value: c,
            },
            p = {
                value: function () {
                    --u === 0 && a()
                },
            }
        ;(i.each(function () {
            var m = Zt(this, l),
                v = m.on
            ;(v !== t &&
                ((r = (t = v).copy()),
                r._.cancel.push(d),
                r._.interrupt.push(d),
                r._.end.push(p)),
                (m.on = r))
        }),
            u === 0 && a())
    })
}
var gw = 0
function pn(t, r, i, l) {
    ;((this._groups = t), (this._parents = r), (this._name = i), (this._id = l))
}
function $p() {
    return ++gw
}
var dn = yi.prototype
pn.prototype = {
    constructor: pn,
    select: Kx,
    selectAll: Gx,
    selectChild: dn.selectChild,
    selectChildren: dn.selectChildren,
    filter: Bx,
    merge: Ux,
    selection: Zx,
    transition: hw,
    call: dn.call,
    nodes: dn.nodes,
    node: dn.node,
    size: dn.size,
    empty: dn.empty,
    each: dn.each,
    on: bx,
    attr: Nx,
    attrTween: Ix,
    style: rw,
    styleTween: sw,
    text: aw,
    textTween: dw,
    remove: Qx,
    tween: xx,
    delay: Dx,
    duration: Ox,
    ease: Hx,
    easeVarying: Vx,
    end: pw,
    [Symbol.iterator]: dn[Symbol.iterator],
}
function mw(t) {
    return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2
}
var yw = {
    time: null,
    delay: 0,
    duration: 250,
    ease: mw,
}
function vw(t, r) {
    for (var i; !(i = t.__transition) || !(i = i[r]); )
        if (!(t = t.parentNode)) throw new Error(`transition ${r} not found`)
    return i
}
function xw(t) {
    var r, i
    t instanceof pn
        ? ((r = t._id), (t = t._name))
        : ((r = $p()), ((i = yw).time = nc()), (t = t == null ? null : t + ''))
    for (var l = this._groups, u = l.length, a = 0; a < u; ++a)
        for (var c = l[a], d = c.length, p, m = 0; m < d; ++m)
            (p = c[m]) && wl(p, t, r, m, c, i || vw(p, r))
    return new pn(l, this._parents, t, r)
}
yi.prototype.interrupt = mx
yi.prototype.transition = xw
const Qs = (t) => () => t
function ww(t, { sourceEvent: r, target: i, transform: l, dispatch: u }) {
    Object.defineProperties(this, {
        type: {
            value: t,
            enumerable: !0,
            configurable: !0,
        },
        sourceEvent: {
            value: r,
            enumerable: !0,
            configurable: !0,
        },
        target: {
            value: i,
            enumerable: !0,
            configurable: !0,
        },
        transform: {
            value: l,
            enumerable: !0,
            configurable: !0,
        },
        _: {
            value: u,
        },
    })
}
function hn(t, r, i) {
    ;((this.k = t), (this.x = r), (this.y = i))
}
hn.prototype = {
    constructor: hn,
    scale: function (t) {
        return t === 1 ? this : new hn(this.k * t, this.x, this.y)
    },
    translate: function (t, r) {
        return (t === 0) & (r === 0)
            ? this
            : new hn(this.k, this.x + this.k * t, this.y + this.k * r)
    },
    apply: function (t) {
        return [t[0] * this.k + this.x, t[1] * this.k + this.y]
    },
    applyX: function (t) {
        return t * this.k + this.x
    },
    applyY: function (t) {
        return t * this.k + this.y
    },
    invert: function (t) {
        return [(t[0] - this.x) / this.k, (t[1] - this.y) / this.k]
    },
    invertX: function (t) {
        return (t - this.x) / this.k
    },
    invertY: function (t) {
        return (t - this.y) / this.k
    },
    rescaleX: function (t) {
        return t
            .copy()
            .domain(t.range().map(this.invertX, this).map(t.invert, t))
    },
    rescaleY: function (t) {
        return t
            .copy()
            .domain(t.range().map(this.invertY, this).map(t.invert, t))
    },
    toString: function () {
        return 'translate(' + this.x + ',' + this.y + ') scale(' + this.k + ')'
    },
}
var Sl = new hn(1, 0, 0)
Op.prototype = hn.prototype
function Op(t) {
    for (; !t.__zoom; ) if (!(t = t.parentNode)) return Sl
    return t.__zoom
}
function Ma(t) {
    t.stopImmediatePropagation()
}
function ni(t) {
    ;(t.preventDefault(), t.stopImmediatePropagation())
}
function Sw(t) {
    return (!t.ctrlKey || t.type === 'wheel') && !t.button
}
function _w() {
    var t = this
    return t instanceof SVGElement
        ? ((t = t.ownerSVGElement || t),
          t.hasAttribute('viewBox')
              ? ((t = t.viewBox.baseVal),
                [
                    [t.x, t.y],
                    [t.x + t.width, t.y + t.height],
                ])
              : [
                    [0, 0],
                    [t.width.baseVal.value, t.height.baseVal.value],
                ])
        : [
              [0, 0],
              [t.clientWidth, t.clientHeight],
          ]
}
function ch() {
    return this.__zoom || Sl
}
function Ew(t) {
    return (
        -t.deltaY *
        (t.deltaMode === 1 ? 0.05 : t.deltaMode ? 1 : 0.002) *
        (t.ctrlKey ? 10 : 1)
    )
}
function kw() {
    return navigator.maxTouchPoints || 'ontouchstart' in this
}
function Cw(t, r, i) {
    var l = t.invertX(r[0][0]) - i[0][0],
        u = t.invertX(r[1][0]) - i[1][0],
        a = t.invertY(r[0][1]) - i[0][1],
        c = t.invertY(r[1][1]) - i[1][1]
    return t.translate(
        u > l ? (l + u) / 2 : Math.min(0, l) || Math.max(0, u),
        c > a ? (a + c) / 2 : Math.min(0, a) || Math.max(0, c)
    )
}
function Fp() {
    var t = Sw,
        r = _w,
        i = Cw,
        l = Ew,
        u = kw,
        a = [0, 1 / 0],
        c = [
            [-1 / 0, -1 / 0],
            [1 / 0, 1 / 0],
        ],
        d = 250,
        p = tl,
        m = yl('start', 'zoom', 'end'),
        v,
        g,
        y,
        S = 500,
        _ = 150,
        E = 0,
        k = 10
    function C(z) {
        z.property('__zoom', ch)
            .on('wheel.zoom', V, {
                passive: !1,
            })
            .on('mousedown.zoom', K)
            .on('dblclick.zoom', ne)
            .filter(u)
            .on('touchstart.zoom', U)
            .on('touchmove.zoom', W)
            .on('touchend.zoom touchcancel.zoom', Z)
            .style('-webkit-tap-highlight-color', 'rgba(0,0,0,0)')
    }
    ;((C.transform = function (z, B, H, b) {
        var L = z.selection ? z.selection() : z
        ;(L.property('__zoom', ch),
            z !== L
                ? A(z, B, H, b)
                : L.interrupt().each(function () {
                      T(this, arguments)
                          .event(b)
                          .start()
                          .zoom(
                              null,
                              typeof B == 'function'
                                  ? B.apply(this, arguments)
                                  : B
                          )
                          .end()
                  }))
    }),
        (C.scaleBy = function (z, B, H, b) {
            C.scaleTo(
                z,
                function () {
                    var L = this.__zoom.k,
                        R =
                            typeof B == 'function'
                                ? B.apply(this, arguments)
                                : B
                    return L * R
                },
                H,
                b
            )
        }),
        (C.scaleTo = function (z, B, H, b) {
            C.transform(
                z,
                function () {
                    var L = r.apply(this, arguments),
                        R = this.__zoom,
                        j =
                            H == null
                                ? N(L)
                                : typeof H == 'function'
                                  ? H.apply(this, arguments)
                                  : H,
                        M = R.invert(j),
                        $ =
                            typeof B == 'function'
                                ? B.apply(this, arguments)
                                : B
                    return i(w(I(R, $), j, M), L, c)
                },
                H,
                b
            )
        }),
        (C.translateBy = function (z, B, H, b) {
            C.transform(
                z,
                function () {
                    return i(
                        this.__zoom.translate(
                            typeof B == 'function'
                                ? B.apply(this, arguments)
                                : B,
                            typeof H == 'function'
                                ? H.apply(this, arguments)
                                : H
                        ),
                        r.apply(this, arguments),
                        c
                    )
                },
                null,
                b
            )
        }),
        (C.translateTo = function (z, B, H, b, L) {
            C.transform(
                z,
                function () {
                    var R = r.apply(this, arguments),
                        j = this.__zoom,
                        M =
                            b == null
                                ? N(R)
                                : typeof b == 'function'
                                  ? b.apply(this, arguments)
                                  : b
                    return i(
                        Sl.translate(M[0], M[1])
                            .scale(j.k)
                            .translate(
                                typeof B == 'function'
                                    ? -B.apply(this, arguments)
                                    : -B,
                                typeof H == 'function'
                                    ? -H.apply(this, arguments)
                                    : -H
                            ),
                        R,
                        c
                    )
                },
                b,
                L
            )
        }))
    function I(z, B) {
        return (
            (B = Math.max(a[0], Math.min(a[1], B))),
            B === z.k ? z : new hn(B, z.x, z.y)
        )
    }
    function w(z, B, H) {
        var b = B[0] - H[0] * z.k,
            L = B[1] - H[1] * z.k
        return b === z.x && L === z.y ? z : new hn(z.k, b, L)
    }
    function N(z) {
        return [(+z[0][0] + +z[1][0]) / 2, (+z[0][1] + +z[1][1]) / 2]
    }
    function A(z, B, H, b) {
        z.on('start.zoom', function () {
            T(this, arguments).event(b).start()
        })
            .on('interrupt.zoom end.zoom', function () {
                T(this, arguments).event(b).end()
            })
            .tween('zoom', function () {
                var L = this,
                    R = arguments,
                    j = T(L, R).event(b),
                    M = r.apply(L, R),
                    $ =
                        H == null
                            ? N(M)
                            : typeof H == 'function'
                              ? H.apply(L, R)
                              : H,
                    te = Math.max(M[1][0] - M[0][0], M[1][1] - M[0][1]),
                    ee = L.__zoom,
                    le = typeof B == 'function' ? B.apply(L, R) : B,
                    ue = p(
                        ee.invert($).concat(te / ee.k),
                        le.invert($).concat(te / le.k)
                    )
                return function (ce) {
                    if (ce === 1) ce = le
                    else {
                        var J = ue(ce),
                            fe = te / J[2]
                        ce = new hn(fe, $[0] - J[0] * fe, $[1] - J[1] * fe)
                    }
                    j.zoom(null, ce)
                }
            })
    }
    function T(z, B, H) {
        return (!H && z.__zooming) || new F(z, B)
    }
    function F(z, B) {
        ;((this.that = z),
            (this.args = B),
            (this.active = 0),
            (this.sourceEvent = null),
            (this.extent = r.apply(z, B)),
            (this.taps = 0))
    }
    F.prototype = {
        event: function (z) {
            return (z && (this.sourceEvent = z), this)
        },
        start: function () {
            return (
                ++this.active === 1 &&
                    ((this.that.__zooming = this), this.emit('start')),
                this
            )
        },
        zoom: function (z, B) {
            return (
                this.mouse &&
                    z !== 'mouse' &&
                    (this.mouse[1] = B.invert(this.mouse[0])),
                this.touch0 &&
                    z !== 'touch' &&
                    (this.touch0[1] = B.invert(this.touch0[0])),
                this.touch1 &&
                    z !== 'touch' &&
                    (this.touch1[1] = B.invert(this.touch1[0])),
                (this.that.__zoom = B),
                this.emit('zoom'),
                this
            )
        },
        end: function () {
            return (
                --this.active === 0 &&
                    (delete this.that.__zooming, this.emit('end')),
                this
            )
        },
        emit: function (z) {
            var B = wt(this.that).datum()
            m.call(
                z,
                this.that,
                new ww(z, {
                    sourceEvent: this.sourceEvent,
                    target: C,
                    transform: this.that.__zoom,
                    dispatch: m,
                }),
                B
            )
        },
    }
    function V(z, ...B) {
        if (!t.apply(this, arguments)) return
        var H = T(this, B).event(z),
            b = this.__zoom,
            L = Math.max(
                a[0],
                Math.min(a[1], b.k * Math.pow(2, l.apply(this, arguments)))
            ),
            R = Ot(z)
        if (H.wheel)
            ((H.mouse[0][0] !== R[0] || H.mouse[0][1] !== R[1]) &&
                (H.mouse[1] = b.invert((H.mouse[0] = R))),
                clearTimeout(H.wheel))
        else {
            if (b.k === L) return
            ;((H.mouse = [R, b.invert(R)]), ol(this), H.start())
        }
        ;(ni(z),
            (H.wheel = setTimeout(j, _)),
            H.zoom('mouse', i(w(I(b, L), H.mouse[0], H.mouse[1]), H.extent, c)))
        function j() {
            ;((H.wheel = null), H.end())
        }
    }
    function K(z, ...B) {
        if (y || !t.apply(this, arguments)) return
        var H = z.currentTarget,
            b = T(this, B, !0).event(z),
            L = wt(z.view)
                .on('mousemove.zoom', $, !0)
                .on('mouseup.zoom', te, !0),
            R = Ot(z, H),
            j = z.clientX,
            M = z.clientY
        ;(Sp(z.view),
            Ma(z),
            (b.mouse = [R, this.__zoom.invert(R)]),
            ol(this),
            b.start())
        function $(ee) {
            if ((ni(ee), !b.moved)) {
                var le = ee.clientX - j,
                    ue = ee.clientY - M
                b.moved = le * le + ue * ue > E
            }
            b.event(ee).zoom(
                'mouse',
                i(
                    w(b.that.__zoom, (b.mouse[0] = Ot(ee, H)), b.mouse[1]),
                    b.extent,
                    c
                )
            )
        }
        function te(ee) {
            ;(L.on('mousemove.zoom mouseup.zoom', null),
                _p(ee.view, b.moved),
                ni(ee),
                b.event(ee).end())
        }
    }
    function ne(z, ...B) {
        if (t.apply(this, arguments)) {
            var H = this.__zoom,
                b = Ot(z.changedTouches ? z.changedTouches[0] : z, this),
                L = H.invert(b),
                R = H.k * (z.shiftKey ? 0.5 : 2),
                j = i(w(I(H, R), b, L), r.apply(this, B), c)
            ;(ni(z),
                d > 0
                    ? wt(this).transition().duration(d).call(A, j, b, z)
                    : wt(this).call(C.transform, j, b, z))
        }
    }
    function U(z, ...B) {
        if (t.apply(this, arguments)) {
            var H = z.touches,
                b = H.length,
                L = T(this, B, z.changedTouches.length === b).event(z),
                R,
                j,
                M,
                $
            for (Ma(z), j = 0; j < b; ++j)
                ((M = H[j]),
                    ($ = Ot(M, this)),
                    ($ = [$, this.__zoom.invert($), M.identifier]),
                    L.touch0
                        ? !L.touch1 &&
                          L.touch0[2] !== $[2] &&
                          ((L.touch1 = $), (L.taps = 0))
                        : ((L.touch0 = $), (R = !0), (L.taps = 1 + !!v)))
            ;(v && (v = clearTimeout(v)),
                R &&
                    (L.taps < 2 &&
                        ((g = $[0]),
                        (v = setTimeout(function () {
                            v = null
                        }, S))),
                    ol(this),
                    L.start()))
        }
    }
    function W(z, ...B) {
        if (this.__zooming) {
            var H = T(this, B).event(z),
                b = z.changedTouches,
                L = b.length,
                R,
                j,
                M,
                $
            for (ni(z), R = 0; R < L; ++R)
                ((j = b[R]),
                    (M = Ot(j, this)),
                    H.touch0 && H.touch0[2] === j.identifier
                        ? (H.touch0[0] = M)
                        : H.touch1 &&
                          H.touch1[2] === j.identifier &&
                          (H.touch1[0] = M))
            if (((j = H.that.__zoom), H.touch1)) {
                var te = H.touch0[0],
                    ee = H.touch0[1],
                    le = H.touch1[0],
                    ue = H.touch1[1],
                    ce = (ce = le[0] - te[0]) * ce + (ce = le[1] - te[1]) * ce,
                    J = (J = ue[0] - ee[0]) * J + (J = ue[1] - ee[1]) * J
                ;((j = I(j, Math.sqrt(ce / J))),
                    (M = [(te[0] + le[0]) / 2, (te[1] + le[1]) / 2]),
                    ($ = [(ee[0] + ue[0]) / 2, (ee[1] + ue[1]) / 2]))
            } else if (H.touch0) ((M = H.touch0[0]), ($ = H.touch0[1]))
            else return
            H.zoom('touch', i(w(j, M, $), H.extent, c))
        }
    }
    function Z(z, ...B) {
        if (this.__zooming) {
            var H = T(this, B).event(z),
                b = z.changedTouches,
                L = b.length,
                R,
                j
            for (
                Ma(z),
                    y && clearTimeout(y),
                    y = setTimeout(function () {
                        y = null
                    }, S),
                    R = 0;
                R < L;
                ++R
            )
                ((j = b[R]),
                    H.touch0 && H.touch0[2] === j.identifier
                        ? delete H.touch0
                        : H.touch1 &&
                          H.touch1[2] === j.identifier &&
                          delete H.touch1)
            if (
                (H.touch1 &&
                    !H.touch0 &&
                    ((H.touch0 = H.touch1), delete H.touch1),
                H.touch0)
            )
                H.touch0[1] = this.__zoom.invert(H.touch0[0])
            else if (
                (H.end(),
                H.taps === 2 &&
                    ((j = Ot(j, this)),
                    Math.hypot(g[0] - j[0], g[1] - j[1]) < k))
            ) {
                var M = wt(this).on('dblclick.zoom')
                M && M.apply(this, arguments)
            }
        }
    }
    return (
        (C.wheelDelta = function (z) {
            return arguments.length
                ? ((l = typeof z == 'function' ? z : Qs(+z)), C)
                : l
        }),
        (C.filter = function (z) {
            return arguments.length
                ? ((t = typeof z == 'function' ? z : Qs(!!z)), C)
                : t
        }),
        (C.touchable = function (z) {
            return arguments.length
                ? ((u = typeof z == 'function' ? z : Qs(!!z)), C)
                : u
        }),
        (C.extent = function (z) {
            return arguments.length
                ? ((r =
                      typeof z == 'function'
                          ? z
                          : Qs([
                                [+z[0][0], +z[0][1]],
                                [+z[1][0], +z[1][1]],
                            ])),
                  C)
                : r
        }),
        (C.scaleExtent = function (z) {
            return arguments.length
                ? ((a[0] = +z[0]), (a[1] = +z[1]), C)
                : [a[0], a[1]]
        }),
        (C.translateExtent = function (z) {
            return arguments.length
                ? ((c[0][0] = +z[0][0]),
                  (c[1][0] = +z[1][0]),
                  (c[0][1] = +z[0][1]),
                  (c[1][1] = +z[1][1]),
                  C)
                : [
                      [c[0][0], c[0][1]],
                      [c[1][0], c[1][1]],
                  ]
        }),
        (C.constrain = function (z) {
            return arguments.length ? ((i = z), C) : i
        }),
        (C.duration = function (z) {
            return arguments.length ? ((d = +z), C) : d
        }),
        (C.interpolate = function (z) {
            return arguments.length ? ((p = z), C) : p
        }),
        (C.on = function () {
            var z = m.on.apply(m, arguments)
            return z === m ? C : z
        }),
        (C.clickDistance = function (z) {
            return arguments.length ? ((E = (z = +z) * z), C) : Math.sqrt(E)
        }),
        (C.tapDistance = function (z) {
            return arguments.length ? ((k = +z), C) : k
        }),
        C
    )
}
const qt = {
        error001: () =>
            '[React Flow]: Seems like you have not used zustand provider as an ancestor. Help: https://reactflow.dev/error#001',
        error002: () =>
            "It looks like you've created a new nodeTypes or edgeTypes object. If this wasn't on purpose please define the nodeTypes/edgeTypes outside of the component or memoize them.",
        error003: (t) =>
            `Node type "${t}" not found. Using fallback type "default".`,
        error004: () =>
            'The React Flow parent container needs a width and a height to render the graph.',
        error005: () => 'Only child nodes can use a parent extent.',
        error006: () =>
            "Can't create edge. An edge needs a source and a target.",
        error007: (t) => `The old edge with id=${t} does not exist.`,
        error009: (t) => `Marker type "${t}" doesn't exist.`,
        error008: (t, { id: r, sourceHandle: i, targetHandle: l }) =>
            `Couldn't create edge for ${t} handle id: "${t === 'source' ? i : l}", edge id: ${r}.`,
        error010: () =>
            'Handle: No node id found. Make sure to only use a Handle inside a custom Node.',
        error011: (t) =>
            `Edge type "${t}" not found. Using fallback type "default".`,
        error012: (t) =>
            `Node with id "${t}" does not exist, it may have been removed. This can happen when a node is deleted before the "onNodeClick" handler is called.`,
        error013: (t = 'react') =>
            `It seems that you haven't loaded the styles. Please import '@xyflow/${t}/dist/style.css' or base.css to make sure everything is working properly.`,
        error014: () =>
            'useNodeConnections: No node ID found. Call useNodeConnections inside a custom Node or provide a node ID.',
        error015: () =>
            'It seems that you are trying to drag a node that is not initialized. Please use onNodesChange as explained in the docs.',
    },
    fi = [
        [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
        [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
    ],
    Hp = ['Enter', ' ', 'Escape'],
    jp = {
        'node.a11yDescription.default':
            'Press enter or space to select a node. Press delete to remove it and escape to cancel.',
        'node.a11yDescription.keyboardDisabled':
            'Press enter or space to select a node. You can then use the arrow keys to move the node around. Press delete to remove it and escape to cancel.',
        'node.a11yDescription.ariaLiveMessage': ({
            direction: t,
            x: r,
            y: i,
        }) => `Moved selected node ${t}. New position, x: ${r}, y: ${i}`,
        'edge.a11yDescription.default':
            'Press enter or space to select an edge. You can then press delete to remove it or escape to cancel.',
        'controls.ariaLabel': 'Control Panel',
        'controls.zoomIn.ariaLabel': 'Zoom In',
        'controls.zoomOut.ariaLabel': 'Zoom Out',
        'controls.fitView.ariaLabel': 'Fit View',
        'controls.interactive.ariaLabel': 'Toggle Interactivity',
        'minimap.ariaLabel': 'Mini Map',
        'handle.ariaLabel': 'Handle',
    }
var gr
;(function (t) {
    ;((t.Strict = 'strict'), (t.Loose = 'loose'))
})(gr || (gr = {}))
var dr
;(function (t) {
    ;((t.Free = 'free'),
        (t.Vertical = 'vertical'),
        (t.Horizontal = 'horizontal'))
})(dr || (dr = {}))
var di
;(function (t) {
    ;((t.Partial = 'partial'), (t.Full = 'full'))
})(di || (di = {}))
const Vp = {
    inProgress: !1,
    isValid: null,
    from: null,
    fromHandle: null,
    fromPosition: null,
    fromNode: null,
    to: null,
    toHandle: null,
    toPosition: null,
    toNode: null,
    pointer: null,
}
var jn
;(function (t) {
    ;((t.Bezier = 'default'),
        (t.Straight = 'straight'),
        (t.Step = 'step'),
        (t.SmoothStep = 'smoothstep'),
        (t.SimpleBezier = 'simplebezier'))
})(jn || (jn = {}))
var ro
;(function (t) {
    ;((t.Arrow = 'arrow'), (t.ArrowClosed = 'arrowclosed'))
})(ro || (ro = {}))
var ae
;(function (t) {
    ;((t.Left = 'left'),
        (t.Top = 'top'),
        (t.Right = 'right'),
        (t.Bottom = 'bottom'))
})(ae || (ae = {}))
const fh = {
    [ae.Left]: ae.Right,
    [ae.Right]: ae.Left,
    [ae.Top]: ae.Bottom,
    [ae.Bottom]: ae.Top,
}
function Bp(t) {
    return t === null ? null : t ? 'valid' : 'invalid'
}
const Up = (t) => 'id' in t && 'source' in t && 'target' in t,
    Nw = (t) =>
        'id' in t && 'position' in t && !('source' in t) && !('target' in t),
    ic = (t) =>
        'id' in t && 'internals' in t && !('source' in t) && !('target' in t),
    xi = (t, r = [0, 0]) => {
        const { width: i, height: l } = gn(t),
            u = t.origin ?? r,
            a = i * u[0],
            c = l * u[1]
        return {
            x: t.position.x - a,
            y: t.position.y - c,
        }
    },
    Mw = (
        t,
        r = {
            nodeOrigin: [0, 0],
        }
    ) => {
        if (t.length === 0)
            return {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            }
        const i = t.reduce(
            (l, u) => {
                const a = typeof u == 'string'
                let c = !r.nodeLookup && !a ? u : void 0
                r.nodeLookup &&
                    (c = a
                        ? r.nodeLookup.get(u)
                        : ic(u)
                          ? u
                          : r.nodeLookup.get(u.id))
                const d = c
                    ? dl(c, r.nodeOrigin)
                    : {
                          x: 0,
                          y: 0,
                          x2: 0,
                          y2: 0,
                      }
                return _l(l, d)
            },
            {
                x: 1 / 0,
                y: 1 / 0,
                x2: -1 / 0,
                y2: -1 / 0,
            }
        )
        return El(i)
    },
    wi = (t, r = {}) => {
        let i = {
                x: 1 / 0,
                y: 1 / 0,
                x2: -1 / 0,
                y2: -1 / 0,
            },
            l = !1
        return (
            t.forEach((u) => {
                ;(r.filter === void 0 || r.filter(u)) &&
                    ((i = _l(i, dl(u))), (l = !0))
            }),
            l
                ? El(i)
                : {
                      x: 0,
                      y: 0,
                      width: 0,
                      height: 0,
                  }
        )
    },
    sc = (t, r, [i, l, u] = [0, 0, 1], a = !1, c = !1) => {
        const d = {
                ..._i(r, [i, l, u]),
                width: r.width / u,
                height: r.height / u,
            },
            p = []
        for (const m of t.values()) {
            const { measured: v, selectable: g = !0, hidden: y = !1 } = m
            if ((c && !g) || y) continue
            const S = v.width ?? m.width ?? m.initialWidth ?? null,
                _ = v.height ?? m.height ?? m.initialHeight ?? null,
                E = hi(d, io(m)),
                k = (S ?? 0) * (_ ?? 0),
                C = a && E > 0
            ;(!m.internals.handleBounds || C || E >= k || m.dragging) &&
                p.push(m)
        }
        return p
    },
    Pw = (t, r) => {
        const i = new Set()
        return (
            t.forEach((l) => {
                i.add(l.id)
            }),
            r.filter((l) => i.has(l.source) || i.has(l.target))
        )
    }
function zw(t, r) {
    const i = new Map(),
        l = r != null && r.nodes ? new Set(r.nodes.map((u) => u.id)) : null
    return (
        t.forEach((u) => {
            u.measured.width &&
                u.measured.height &&
                ((r == null ? void 0 : r.includeHiddenNodes) || !u.hidden) &&
                (!l || l.has(u.id)) &&
                i.set(u.id, u)
        }),
        i
    )
}
async function Lw(
    { nodes: t, width: r, height: i, panZoom: l, minZoom: u, maxZoom: a },
    c
) {
    if (t.size === 0) return Promise.resolve(!0)
    const d = zw(t, c),
        p = wi(d),
        m = lc(
            p,
            r,
            i,
            (c == null ? void 0 : c.minZoom) ?? u,
            (c == null ? void 0 : c.maxZoom) ?? a,
            (c == null ? void 0 : c.padding) ?? 0.1
        )
    return (
        await l.setViewport(m, {
            duration: c == null ? void 0 : c.duration,
            ease: c == null ? void 0 : c.ease,
            interpolate: c == null ? void 0 : c.interpolate,
        }),
        Promise.resolve(!0)
    )
}
function Wp({
    nodeId: t,
    nextPosition: r,
    nodeLookup: i,
    nodeOrigin: l = [0, 0],
    nodeExtent: u,
    onError: a,
}) {
    const c = i.get(t),
        d = c.parentId ? i.get(c.parentId) : void 0,
        { x: p, y: m } = d
            ? d.internals.positionAbsolute
            : {
                  x: 0,
                  y: 0,
              },
        v = c.origin ?? l
    let g = c.extent || u
    if (c.extent === 'parent' && !c.expandParent)
        if (!d) a == null || a('005', qt.error005())
        else {
            const S = d.measured.width,
                _ = d.measured.height
            S &&
                _ &&
                (g = [
                    [p, m],
                    [p + S, m + _],
                ])
        }
    else
        d &&
            so(c.extent) &&
            (g = [
                [c.extent[0][0] + p, c.extent[0][1] + m],
                [c.extent[1][0] + p, c.extent[1][1] + m],
            ])
    const y = so(g) ? mr(r, g, c.measured) : r
    return (
        (c.measured.width === void 0 || c.measured.height === void 0) &&
            (a == null || a('015', qt.error015())),
        {
            position: {
                x: y.x - p + (c.measured.width ?? 0) * v[0],
                y: y.y - m + (c.measured.height ?? 0) * v[1],
            },
            positionAbsolute: y,
        }
    )
}
async function Iw({
    nodesToRemove: t = [],
    edgesToRemove: r = [],
    nodes: i,
    edges: l,
    onBeforeDelete: u,
}) {
    const a = new Set(t.map((y) => y.id)),
        c = []
    for (const y of i) {
        if (y.deletable === !1) continue
        const S = a.has(y.id),
            _ = !S && y.parentId && c.find((E) => E.id === y.parentId)
        ;(S || _) && c.push(y)
    }
    const d = new Set(r.map((y) => y.id)),
        p = l.filter((y) => y.deletable !== !1),
        v = Pw(c, p)
    for (const y of p) d.has(y.id) && !v.find((_) => _.id === y.id) && v.push(y)
    if (!u)
        return {
            edges: v,
            nodes: c,
        }
    const g = await u({
        nodes: c,
        edges: v,
    })
    return typeof g == 'boolean'
        ? g
            ? {
                  edges: v,
                  nodes: c,
              }
            : {
                  edges: [],
                  nodes: [],
              }
        : g
}
const oo = (t, r = 0, i = 1) => Math.min(Math.max(t, r), i),
    mr = (
        t = {
            x: 0,
            y: 0,
        },
        r,
        i
    ) => ({
        x: oo(t.x, r[0][0], r[1][0] - ((i == null ? void 0 : i.width) ?? 0)),
        y: oo(t.y, r[0][1], r[1][1] - ((i == null ? void 0 : i.height) ?? 0)),
    })
function Yp(t, r, i) {
    const { width: l, height: u } = gn(i),
        { x: a, y: c } = i.internals.positionAbsolute
    return mr(
        t,
        [
            [a, c],
            [a + l, c + u],
        ],
        r
    )
}
const dh = (t, r, i) =>
        t < r
            ? oo(Math.abs(t - r), 1, r) / r
            : t > i
              ? -oo(Math.abs(t - i), 1, r) / r
              : 0,
    bp = (t, r, i = 15, l = 40) => {
        const u = dh(t.x, l, r.width - l) * i,
            a = dh(t.y, l, r.height - l) * i
        return [u, a]
    },
    _l = (t, r) => ({
        x: Math.min(t.x, r.x),
        y: Math.min(t.y, r.y),
        x2: Math.max(t.x2, r.x2),
        y2: Math.max(t.y2, r.y2),
    }),
    Ya = ({ x: t, y: r, width: i, height: l }) => ({
        x: t,
        y: r,
        x2: t + i,
        y2: r + l,
    }),
    El = ({ x: t, y: r, x2: i, y2: l }) => ({
        x: t,
        y: r,
        width: i - t,
        height: l - r,
    }),
    io = (t, r = [0, 0]) => {
        var u, a
        const { x: i, y: l } = ic(t) ? t.internals.positionAbsolute : xi(t, r)
        return {
            x: i,
            y: l,
            width:
                ((u = t.measured) == null ? void 0 : u.width) ??
                t.width ??
                t.initialWidth ??
                0,
            height:
                ((a = t.measured) == null ? void 0 : a.height) ??
                t.height ??
                t.initialHeight ??
                0,
        }
    },
    dl = (t, r = [0, 0]) => {
        var u, a
        const { x: i, y: l } = ic(t) ? t.internals.positionAbsolute : xi(t, r)
        return {
            x: i,
            y: l,
            x2:
                i +
                (((u = t.measured) == null ? void 0 : u.width) ??
                    t.width ??
                    t.initialWidth ??
                    0),
            y2:
                l +
                (((a = t.measured) == null ? void 0 : a.height) ??
                    t.height ??
                    t.initialHeight ??
                    0),
        }
    },
    Xp = (t, r) => El(_l(Ya(t), Ya(r))),
    hi = (t, r) => {
        const i = Math.max(
                0,
                Math.min(t.x + t.width, r.x + r.width) - Math.max(t.x, r.x)
            ),
            l = Math.max(
                0,
                Math.min(t.y + t.height, r.y + r.height) - Math.max(t.y, r.y)
            )
        return Math.ceil(i * l)
    },
    hh = (t) => Ht(t.width) && Ht(t.height) && Ht(t.x) && Ht(t.y),
    Ht = (t) => !isNaN(t) && isFinite(t),
    Tw = (t, r) => {},
    Si = (t, r = [1, 1]) => ({
        x: r[0] * Math.round(t.x / r[0]),
        y: r[1] * Math.round(t.y / r[1]),
    }),
    _i = ({ x: t, y: r }, [i, l, u], a = !1, c = [1, 1]) => {
        const d = {
            x: (t - i) / u,
            y: (r - l) / u,
        }
        return a ? Si(d, c) : d
    },
    hl = ({ x: t, y: r }, [i, l, u]) => ({
        x: t * u + i,
        y: r * u + l,
    })
function Qr(t, r) {
    if (typeof t == 'number') return Math.floor((r - r / (1 + t)) * 0.5)
    if (typeof t == 'string' && t.endsWith('px')) {
        const i = parseFloat(t)
        if (!Number.isNaN(i)) return Math.floor(i)
    }
    if (typeof t == 'string' && t.endsWith('%')) {
        const i = parseFloat(t)
        if (!Number.isNaN(i)) return Math.floor(r * i * 0.01)
    }
    return (
        console.error(
            `[React Flow] The padding value "${t}" is invalid. Please provide a number or a string with a valid unit (px or %).`
        ),
        0
    )
}
function Rw(t, r, i) {
    if (typeof t == 'string' || typeof t == 'number') {
        const l = Qr(t, i),
            u = Qr(t, r)
        return {
            top: l,
            right: u,
            bottom: l,
            left: u,
            x: u * 2,
            y: l * 2,
        }
    }
    if (typeof t == 'object') {
        const l = Qr(t.top ?? t.y ?? 0, i),
            u = Qr(t.bottom ?? t.y ?? 0, i),
            a = Qr(t.left ?? t.x ?? 0, r),
            c = Qr(t.right ?? t.x ?? 0, r)
        return {
            top: l,
            right: c,
            bottom: u,
            left: a,
            x: a + c,
            y: l + u,
        }
    }
    return {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        x: 0,
        y: 0,
    }
}
function Dw(t, r, i, l, u, a) {
    const { x: c, y: d } = hl(t, [r, i, l]),
        { x: p, y: m } = hl(
            {
                x: t.x + t.width,
                y: t.y + t.height,
            },
            [r, i, l]
        ),
        v = u - p,
        g = a - m
    return {
        left: Math.floor(c),
        top: Math.floor(d),
        right: Math.floor(v),
        bottom: Math.floor(g),
    }
}
const lc = (t, r, i, l, u, a) => {
        const c = Rw(a, r, i),
            d = (r - c.x) / t.width,
            p = (i - c.y) / t.height,
            m = Math.min(d, p),
            v = oo(m, l, u),
            g = t.x + t.width / 2,
            y = t.y + t.height / 2,
            S = r / 2 - g * v,
            _ = i / 2 - y * v,
            E = Dw(t, S, _, v, r, i),
            k = {
                left: Math.min(E.left - c.left, 0),
                top: Math.min(E.top - c.top, 0),
                right: Math.min(E.right - c.right, 0),
                bottom: Math.min(E.bottom - c.bottom, 0),
            }
        return {
            x: S - k.left + k.right,
            y: _ - k.top + k.bottom,
            zoom: v,
        }
    },
    pi = () => {
        var t
        return (
            typeof navigator < 'u' &&
            ((t = navigator == null ? void 0 : navigator.userAgent) == null
                ? void 0
                : t.indexOf('Mac')) >= 0
        )
    }
function so(t) {
    return t != null && t !== 'parent'
}
function gn(t) {
    var r, i
    return {
        width:
            ((r = t.measured) == null ? void 0 : r.width) ??
            t.width ??
            t.initialWidth ??
            0,
        height:
            ((i = t.measured) == null ? void 0 : i.height) ??
            t.height ??
            t.initialHeight ??
            0,
    }
}
function Qp(t) {
    var r, i
    return (
        (((r = t.measured) == null ? void 0 : r.width) ??
            t.width ??
            t.initialWidth) !== void 0 &&
        (((i = t.measured) == null ? void 0 : i.height) ??
            t.height ??
            t.initialHeight) !== void 0
    )
}
function Kp(
    t,
    r = {
        width: 0,
        height: 0,
    },
    i,
    l,
    u
) {
    const a = {
            ...t,
        },
        c = l.get(i)
    if (c) {
        const d = c.origin || u
        ;((a.x += c.internals.positionAbsolute.x - (r.width ?? 0) * d[0]),
            (a.y += c.internals.positionAbsolute.y - (r.height ?? 0) * d[1]))
    }
    return a
}
function ph(t, r) {
    if (t.size !== r.size) return !1
    for (const i of t) if (!r.has(i)) return !1
    return !0
}
function Aw() {
    let t, r
    return {
        promise: new Promise((l, u) => {
            ;((t = l), (r = u))
        }),
        resolve: t,
        reject: r,
    }
}
function $w(t) {
    return {
        ...jp,
        ...(t || {}),
    }
}
function si(
    t,
    {
        snapGrid: r = [0, 0],
        snapToGrid: i = !1,
        transform: l,
        containerBounds: u,
    }
) {
    const { x: a, y: c } = jt(t),
        d = _i(
            {
                x: a - ((u == null ? void 0 : u.left) ?? 0),
                y: c - ((u == null ? void 0 : u.top) ?? 0),
            },
            l
        ),
        { x: p, y: m } = i ? Si(d, r) : d
    return {
        xSnapped: p,
        ySnapped: m,
        ...d,
    }
}
const uc = (t) => ({
        width: t.offsetWidth,
        height: t.offsetHeight,
    }),
    Gp = (t) => {
        var r
        return (
            ((r = t == null ? void 0 : t.getRootNode) == null
                ? void 0
                : r.call(t)) || (window == null ? void 0 : window.document)
        )
    },
    Ow = ['INPUT', 'SELECT', 'TEXTAREA']
function qp(t) {
    var l, u
    const r =
        ((u = (l = t.composedPath) == null ? void 0 : l.call(t)) == null
            ? void 0
            : u[0]) || t.target
    return (r == null ? void 0 : r.nodeType) !== 1
        ? !1
        : Ow.includes(r.nodeName) ||
              r.hasAttribute('contenteditable') ||
              !!r.closest('.nokey')
}
const Zp = (t) => 'clientX' in t,
    jt = (t, r) => {
        var a, c
        const i = Zp(t),
            l = i ? t.clientX : (a = t.touches) == null ? void 0 : a[0].clientX,
            u = i ? t.clientY : (c = t.touches) == null ? void 0 : c[0].clientY
        return {
            x: l - ((r == null ? void 0 : r.left) ?? 0),
            y: u - ((r == null ? void 0 : r.top) ?? 0),
        }
    },
    gh = (t, r, i, l, u) => {
        const a = r.querySelectorAll(`.${t}`)
        return !a || !a.length
            ? null
            : Array.from(a).map((c) => {
                  const d = c.getBoundingClientRect()
                  return {
                      id: c.getAttribute('data-handleid'),
                      type: t,
                      nodeId: u,
                      position: c.getAttribute('data-handlepos'),
                      x: (d.left - i.left) / l,
                      y: (d.top - i.top) / l,
                      ...uc(c),
                  }
              })
    }
function Jp({
    sourceX: t,
    sourceY: r,
    targetX: i,
    targetY: l,
    sourceControlX: u,
    sourceControlY: a,
    targetControlX: c,
    targetControlY: d,
}) {
    const p = t * 0.125 + u * 0.375 + c * 0.375 + i * 0.125,
        m = r * 0.125 + a * 0.375 + d * 0.375 + l * 0.125,
        v = Math.abs(p - t),
        g = Math.abs(m - r)
    return [p, m, v, g]
}
function Ks(t, r) {
    return t >= 0 ? 0.5 * t : r * 25 * Math.sqrt(-t)
}
function mh({ pos: t, x1: r, y1: i, x2: l, y2: u, c: a }) {
    switch (t) {
        case ae.Left:
            return [r - Ks(r - l, a), i]
        case ae.Right:
            return [r + Ks(l - r, a), i]
        case ae.Top:
            return [r, i - Ks(i - u, a)]
        case ae.Bottom:
            return [r, i + Ks(u - i, a)]
    }
}
function eg({
    sourceX: t,
    sourceY: r,
    sourcePosition: i = ae.Bottom,
    targetX: l,
    targetY: u,
    targetPosition: a = ae.Top,
    curvature: c = 0.25,
}) {
    const [d, p] = mh({
            pos: i,
            x1: t,
            y1: r,
            x2: l,
            y2: u,
            c,
        }),
        [m, v] = mh({
            pos: a,
            x1: l,
            y1: u,
            x2: t,
            y2: r,
            c,
        }),
        [g, y, S, _] = Jp({
            sourceX: t,
            sourceY: r,
            targetX: l,
            targetY: u,
            sourceControlX: d,
            sourceControlY: p,
            targetControlX: m,
            targetControlY: v,
        })
    return [`M${t},${r} C${d},${p} ${m},${v} ${l},${u}`, g, y, S, _]
}
function tg({ sourceX: t, sourceY: r, targetX: i, targetY: l }) {
    const u = Math.abs(i - t) / 2,
        a = i < t ? i + u : i - u,
        c = Math.abs(l - r) / 2,
        d = l < r ? l + c : l - c
    return [a, d, u, c]
}
function Fw({
    sourceNode: t,
    targetNode: r,
    selected: i = !1,
    zIndex: l = 0,
    elevateOnSelect: u = !1,
    zIndexMode: a = 'basic',
}) {
    if (a === 'manual') return l
    const c = u && i ? l + 1e3 : l,
        d = Math.max(
            t.parentId || (u && t.selected) ? t.internals.z : 0,
            r.parentId || (u && r.selected) ? r.internals.z : 0
        )
    return c + d
}
function Hw({
    sourceNode: t,
    targetNode: r,
    width: i,
    height: l,
    transform: u,
}) {
    const a = _l(dl(t), dl(r))
    ;(a.x === a.x2 && (a.x2 += 1), a.y === a.y2 && (a.y2 += 1))
    const c = {
        x: -u[0] / u[2],
        y: -u[1] / u[2],
        width: i / u[2],
        height: l / u[2],
    }
    return hi(c, El(a)) > 0
}
const jw = ({ source: t, sourceHandle: r, target: i, targetHandle: l }) =>
        `xy-edge__${t}${r || ''}-${i}${l || ''}`,
    Vw = (t, r) =>
        r.some(
            (i) =>
                i.source === t.source &&
                i.target === t.target &&
                (i.sourceHandle === t.sourceHandle ||
                    (!i.sourceHandle && !t.sourceHandle)) &&
                (i.targetHandle === t.targetHandle ||
                    (!i.targetHandle && !t.targetHandle))
        ),
    ng = (t, r, i = {}) => {
        if (!t.source || !t.target) return r
        const l = i.getEdgeId || jw
        let u
        return (
            Up(t)
                ? (u = {
                      ...t,
                  })
                : (u = {
                      ...t,
                      id: l(t),
                  }),
            Vw(u, r)
                ? r
                : (u.sourceHandle === null && delete u.sourceHandle,
                  u.targetHandle === null && delete u.targetHandle,
                  r.concat(u))
        )
    }
function rg({ sourceX: t, sourceY: r, targetX: i, targetY: l }) {
    const [u, a, c, d] = tg({
        sourceX: t,
        sourceY: r,
        targetX: i,
        targetY: l,
    })
    return [`M ${t},${r}L ${i},${l}`, u, a, c, d]
}
const yh = {
        [ae.Left]: {
            x: -1,
            y: 0,
        },
        [ae.Right]: {
            x: 1,
            y: 0,
        },
        [ae.Top]: {
            x: 0,
            y: -1,
        },
        [ae.Bottom]: {
            x: 0,
            y: 1,
        },
    },
    Bw = ({ source: t, sourcePosition: r = ae.Bottom, target: i }) =>
        r === ae.Left || r === ae.Right
            ? t.x < i.x
                ? {
                      x: 1,
                      y: 0,
                  }
                : {
                      x: -1,
                      y: 0,
                  }
            : t.y < i.y
              ? {
                    x: 0,
                    y: 1,
                }
              : {
                    x: 0,
                    y: -1,
                },
    vh = (t, r) => Math.sqrt(Math.pow(r.x - t.x, 2) + Math.pow(r.y - t.y, 2))
function Uw({
    source: t,
    sourcePosition: r = ae.Bottom,
    target: i,
    targetPosition: l = ae.Top,
    center: u,
    offset: a,
    stepPosition: c,
}) {
    const d = yh[r],
        p = yh[l],
        m = {
            x: t.x + d.x * a,
            y: t.y + d.y * a,
        },
        v = {
            x: i.x + p.x * a,
            y: i.y + p.y * a,
        },
        g = Bw({
            source: m,
            sourcePosition: r,
            target: v,
        }),
        y = g.x !== 0 ? 'x' : 'y',
        S = g[y]
    let _ = [],
        E,
        k
    const C = {
            x: 0,
            y: 0,
        },
        I = {
            x: 0,
            y: 0,
        },
        [, , w, N] = tg({
            sourceX: t.x,
            sourceY: t.y,
            targetX: i.x,
            targetY: i.y,
        })
    if (d[y] * p[y] === -1) {
        y === 'x'
            ? ((E = u.x ?? m.x + (v.x - m.x) * c), (k = u.y ?? (m.y + v.y) / 2))
            : ((E = u.x ?? (m.x + v.x) / 2), (k = u.y ?? m.y + (v.y - m.y) * c))
        const T = [
                {
                    x: E,
                    y: m.y,
                },
                {
                    x: E,
                    y: v.y,
                },
            ],
            F = [
                {
                    x: m.x,
                    y: k,
                },
                {
                    x: v.x,
                    y: k,
                },
            ]
        d[y] === S ? (_ = y === 'x' ? T : F) : (_ = y === 'x' ? F : T)
    } else {
        const T = [
                {
                    x: m.x,
                    y: v.y,
                },
            ],
            F = [
                {
                    x: v.x,
                    y: m.y,
                },
            ]
        if (
            (y === 'x' ? (_ = d.x === S ? F : T) : (_ = d.y === S ? T : F),
            r === l)
        ) {
            const W = Math.abs(t[y] - i[y])
            if (W <= a) {
                const Z = Math.min(a - 1, a - W)
                d[y] === S
                    ? (C[y] = (m[y] > t[y] ? -1 : 1) * Z)
                    : (I[y] = (v[y] > i[y] ? -1 : 1) * Z)
            }
        }
        if (r !== l) {
            const W = y === 'x' ? 'y' : 'x',
                Z = d[y] === p[W],
                z = m[W] > v[W],
                B = m[W] < v[W]
            ;((d[y] === 1 && ((!Z && z) || (Z && B))) ||
                (d[y] !== 1 && ((!Z && B) || (Z && z)))) &&
                (_ = y === 'x' ? T : F)
        }
        const V = {
                x: m.x + C.x,
                y: m.y + C.y,
            },
            K = {
                x: v.x + I.x,
                y: v.y + I.y,
            },
            ne = Math.max(Math.abs(V.x - _[0].x), Math.abs(K.x - _[0].x)),
            U = Math.max(Math.abs(V.y - _[0].y), Math.abs(K.y - _[0].y))
        ne >= U
            ? ((E = (V.x + K.x) / 2), (k = _[0].y))
            : ((E = _[0].x), (k = (V.y + K.y) / 2))
    }
    return [
        [
            t,
            {
                x: m.x + C.x,
                y: m.y + C.y,
            },
            ..._,
            {
                x: v.x + I.x,
                y: v.y + I.y,
            },
            i,
        ],
        E,
        k,
        w,
        N,
    ]
}
function Ww(t, r, i, l) {
    const u = Math.min(vh(t, r) / 2, vh(r, i) / 2, l),
        { x: a, y: c } = r
    if ((t.x === a && a === i.x) || (t.y === c && c === i.y))
        return `L${a} ${c}`
    if (t.y === c) {
        const m = t.x < i.x ? -1 : 1,
            v = t.y < i.y ? 1 : -1
        return `L ${a + u * m},${c}Q ${a},${c} ${a},${c + u * v}`
    }
    const d = t.x < i.x ? 1 : -1,
        p = t.y < i.y ? -1 : 1
    return `L ${a},${c + u * p}Q ${a},${c} ${a + u * d},${c}`
}
function ba({
    sourceX: t,
    sourceY: r,
    sourcePosition: i = ae.Bottom,
    targetX: l,
    targetY: u,
    targetPosition: a = ae.Top,
    borderRadius: c = 5,
    centerX: d,
    centerY: p,
    offset: m = 20,
    stepPosition: v = 0.5,
}) {
    const [g, y, S, _, E] = Uw({
        source: {
            x: t,
            y: r,
        },
        sourcePosition: i,
        target: {
            x: l,
            y: u,
        },
        targetPosition: a,
        center: {
            x: d,
            y: p,
        },
        offset: m,
        stepPosition: v,
    })
    return [
        g.reduce((C, I, w) => {
            let N = ''
            return (
                w > 0 && w < g.length - 1
                    ? (N = Ww(g[w - 1], I, g[w + 1], c))
                    : (N = `${w === 0 ? 'M' : 'L'}${I.x} ${I.y}`),
                (C += N),
                C
            )
        }, ''),
        y,
        S,
        _,
        E,
    ]
}
function xh(t) {
    var r
    return (
        t &&
        !!(t.internals.handleBounds || ((r = t.handles) != null && r.length)) &&
        !!(t.measured.width || t.width || t.initialWidth)
    )
}
function Yw(t) {
    var g
    const { sourceNode: r, targetNode: i } = t
    if (!xh(r) || !xh(i)) return null
    const l = r.internals.handleBounds || wh(r.handles),
        u = i.internals.handleBounds || wh(i.handles),
        a = Sh((l == null ? void 0 : l.source) ?? [], t.sourceHandle),
        c = Sh(
            t.connectionMode === gr.Strict
                ? ((u == null ? void 0 : u.target) ?? [])
                : ((u == null ? void 0 : u.target) ?? []).concat(
                      (u == null ? void 0 : u.source) ?? []
                  ),
            t.targetHandle
        )
    if (!a || !c)
        return (
            (g = t.onError) == null ||
                g.call(
                    t,
                    '008',
                    qt.error008(a ? 'target' : 'source', {
                        id: t.id,
                        sourceHandle: t.sourceHandle,
                        targetHandle: t.targetHandle,
                    })
                ),
            null
        )
    const d = (a == null ? void 0 : a.position) || ae.Bottom,
        p = (c == null ? void 0 : c.position) || ae.Top,
        m = yr(r, a, d),
        v = yr(i, c, p)
    return {
        sourceX: m.x,
        sourceY: m.y,
        targetX: v.x,
        targetY: v.y,
        sourcePosition: d,
        targetPosition: p,
    }
}
function wh(t) {
    if (!t) return null
    const r = [],
        i = []
    for (const l of t)
        ((l.width = l.width ?? 1),
            (l.height = l.height ?? 1),
            l.type === 'source' ? r.push(l) : l.type === 'target' && i.push(l))
    return {
        source: r,
        target: i,
    }
}
function yr(t, r, i = ae.Left, l = !1) {
    const u =
            ((r == null ? void 0 : r.x) ?? 0) + t.internals.positionAbsolute.x,
        a = ((r == null ? void 0 : r.y) ?? 0) + t.internals.positionAbsolute.y,
        { width: c, height: d } = r ?? gn(t)
    if (l)
        return {
            x: u + c / 2,
            y: a + d / 2,
        }
    switch ((r == null ? void 0 : r.position) ?? i) {
        case ae.Top:
            return {
                x: u + c / 2,
                y: a,
            }
        case ae.Right:
            return {
                x: u + c,
                y: a + d / 2,
            }
        case ae.Bottom:
            return {
                x: u + c / 2,
                y: a + d,
            }
        case ae.Left:
            return {
                x: u,
                y: a + d / 2,
            }
    }
}
function Sh(t, r) {
    return (t && (r ? t.find((i) => i.id === r) : t[0])) || null
}
function Xa(t, r) {
    return t
        ? typeof t == 'string'
            ? t
            : `${r ? `${r}__` : ''}${Object.keys(t)
                  .sort()
                  .map((l) => `${l}=${t[l]}`)
                  .join('&')}`
        : ''
}
function bw(
    t,
    { id: r, defaultColor: i, defaultMarkerStart: l, defaultMarkerEnd: u }
) {
    const a = new Set()
    return t
        .reduce(
            (c, d) => (
                [d.markerStart || l, d.markerEnd || u].forEach((p) => {
                    if (p && typeof p == 'object') {
                        const m = Xa(p, r)
                        a.has(m) ||
                            (c.push({
                                id: m,
                                color: p.color || i,
                                ...p,
                            }),
                            a.add(m))
                    }
                }),
                c
            ),
            []
        )
        .sort((c, d) => c.id.localeCompare(d.id))
}
const og = 1e3,
    Xw = 10,
    ac = {
        nodeOrigin: [0, 0],
        nodeExtent: fi,
        elevateNodesOnSelect: !0,
        zIndexMode: 'basic',
        defaults: {},
    },
    Qw = {
        ...ac,
        checkEquality: !0,
    }
function cc(t, r) {
    const i = {
        ...t,
    }
    for (const l in r) r[l] !== void 0 && (i[l] = r[l])
    return i
}
function Kw(t, r, i) {
    const l = cc(ac, i)
    for (const u of t.values())
        if (u.parentId) dc(u, t, r, l)
        else {
            const a = xi(u, l.nodeOrigin),
                c = so(u.extent) ? u.extent : l.nodeExtent,
                d = mr(a, c, gn(u))
            u.internals.positionAbsolute = d
        }
}
function Gw(t, r) {
    if (!t.handles)
        return t.measured
            ? r == null
                ? void 0
                : r.internals.handleBounds
            : void 0
    const i = [],
        l = []
    for (const u of t.handles) {
        const a = {
            id: u.id,
            width: u.width ?? 1,
            height: u.height ?? 1,
            nodeId: t.id,
            x: u.x,
            y: u.y,
            position: u.position,
            type: u.type,
        }
        u.type === 'source' ? i.push(a) : u.type === 'target' && l.push(a)
    }
    return {
        source: i,
        target: l,
    }
}
function fc(t) {
    return t === 'manual'
}
function Qa(t, r, i, l = {}) {
    var m, v
    const u = cc(Qw, l),
        a = {
            i: 0,
        },
        c = new Map(r),
        d = u != null && u.elevateNodesOnSelect && !fc(u.zIndexMode) ? og : 0
    let p = t.length > 0
    ;(r.clear(), i.clear())
    for (const g of t) {
        let y = c.get(g.id)
        if (
            u.checkEquality &&
            g === (y == null ? void 0 : y.internals.userNode)
        )
            r.set(g.id, y)
        else {
            const S = xi(g, u.nodeOrigin),
                _ = so(g.extent) ? g.extent : u.nodeExtent,
                E = mr(S, _, gn(g))
            ;((y = {
                ...u.defaults,
                ...g,
                measured: {
                    width: (m = g.measured) == null ? void 0 : m.width,
                    height: (v = g.measured) == null ? void 0 : v.height,
                },
                internals: {
                    positionAbsolute: E,
                    handleBounds: Gw(g, y),
                    z: ig(g, d, u.zIndexMode),
                    userNode: g,
                },
            }),
                r.set(g.id, y))
        }
        ;((y.measured === void 0 ||
            y.measured.width === void 0 ||
            y.measured.height === void 0) &&
            !y.hidden &&
            (p = !1),
            g.parentId && dc(y, r, i, l, a))
    }
    return p
}
function qw(t, r) {
    if (!t.parentId) return
    const i = r.get(t.parentId)
    i ? i.set(t.id, t) : r.set(t.parentId, new Map([[t.id, t]]))
}
function dc(t, r, i, l, u) {
    const {
            elevateNodesOnSelect: a,
            nodeOrigin: c,
            nodeExtent: d,
            zIndexMode: p,
        } = cc(ac, l),
        m = t.parentId,
        v = r.get(m)
    if (!v) {
        console.warn(
            `Parent node ${m} not found. Please make sure that parent nodes are in front of their child nodes in the nodes array.`
        )
        return
    }
    ;(qw(t, i),
        u &&
            !v.parentId &&
            v.internals.rootParentIndex === void 0 &&
            p === 'auto' &&
            ((v.internals.rootParentIndex = ++u.i),
            (v.internals.z = v.internals.z + u.i * Xw)),
        u &&
            v.internals.rootParentIndex !== void 0 &&
            (u.i = v.internals.rootParentIndex))
    const g = a && !fc(p) ? og : 0,
        { x: y, y: S, z: _ } = Zw(t, v, c, d, g, p),
        { positionAbsolute: E } = t.internals,
        k = y !== E.x || S !== E.y
    ;(k || _ !== t.internals.z) &&
        r.set(t.id, {
            ...t,
            internals: {
                ...t.internals,
                positionAbsolute: k
                    ? {
                          x: y,
                          y: S,
                      }
                    : E,
                z: _,
            },
        })
}
function ig(t, r, i) {
    const l = Ht(t.zIndex) ? t.zIndex : 0
    return fc(i) ? l : l + (t.selected ? r : 0)
}
function Zw(t, r, i, l, u, a) {
    const { x: c, y: d } = r.internals.positionAbsolute,
        p = gn(t),
        m = xi(t, i),
        v = so(t.extent) ? mr(m, t.extent, p) : m
    let g = mr(
        {
            x: c + v.x,
            y: d + v.y,
        },
        l,
        p
    )
    t.extent === 'parent' && (g = Yp(g, p, r))
    const y = ig(t, u, a),
        S = r.internals.z ?? 0
    return {
        x: g.x,
        y: g.y,
        z: S >= y ? S + 1 : y,
    }
}
function hc(t, r, i, l = [0, 0]) {
    var c
    const u = [],
        a = new Map()
    for (const d of t) {
        const p = r.get(d.parentId)
        if (!p) continue
        const m =
                ((c = a.get(d.parentId)) == null ? void 0 : c.expandedRect) ??
                io(p),
            v = Xp(m, d.rect)
        a.set(d.parentId, {
            expandedRect: v,
            parent: p,
        })
    }
    return (
        a.size > 0 &&
            a.forEach(({ expandedRect: d, parent: p }, m) => {
                var w
                const v = p.internals.positionAbsolute,
                    g = gn(p),
                    y = p.origin ?? l,
                    S = d.x < v.x ? Math.round(Math.abs(v.x - d.x)) : 0,
                    _ = d.y < v.y ? Math.round(Math.abs(v.y - d.y)) : 0,
                    E = Math.max(g.width, Math.round(d.width)),
                    k = Math.max(g.height, Math.round(d.height)),
                    C = (E - g.width) * y[0],
                    I = (k - g.height) * y[1]
                ;((S > 0 || _ > 0 || C || I) &&
                    (u.push({
                        id: m,
                        type: 'position',
                        position: {
                            x: p.position.x - S + C,
                            y: p.position.y - _ + I,
                        },
                    }),
                    (w = i.get(m)) == null ||
                        w.forEach((N) => {
                            t.some((A) => A.id === N.id) ||
                                u.push({
                                    id: N.id,
                                    type: 'position',
                                    position: {
                                        x: N.position.x + S,
                                        y: N.position.y + _,
                                    },
                                })
                        })),
                    (g.width < d.width || g.height < d.height || S || _) &&
                        u.push({
                            id: m,
                            type: 'dimensions',
                            setAttributes: !0,
                            dimensions: {
                                width: E + (S ? y[0] * S - C : 0),
                                height: k + (_ ? y[1] * _ - I : 0),
                            },
                        }))
            }),
        u
    )
}
function Jw(t, r, i, l, u, a, c) {
    const d = l == null ? void 0 : l.querySelector('.xyflow__viewport')
    let p = !1
    if (!d)
        return {
            changes: [],
            updatedInternals: p,
        }
    const m = [],
        v = window.getComputedStyle(d),
        { m22: g } = new window.DOMMatrixReadOnly(v.transform),
        y = []
    for (const S of t.values()) {
        const _ = r.get(S.id)
        if (!_) continue
        if (_.hidden) {
            ;(r.set(_.id, {
                ..._,
                internals: {
                    ..._.internals,
                    handleBounds: void 0,
                },
            }),
                (p = !0))
            continue
        }
        const E = uc(S.nodeElement),
            k = _.measured.width !== E.width || _.measured.height !== E.height
        if (
            !!(
                E.width &&
                E.height &&
                (k || !_.internals.handleBounds || S.force)
            )
        ) {
            const I = S.nodeElement.getBoundingClientRect(),
                w = so(_.extent) ? _.extent : a
            let { positionAbsolute: N } = _.internals
            _.parentId && _.extent === 'parent'
                ? (N = Yp(N, E, r.get(_.parentId)))
                : w && (N = mr(N, w, E))
            const A = {
                ..._,
                measured: E,
                internals: {
                    ..._.internals,
                    positionAbsolute: N,
                    handleBounds: {
                        source: gh('source', S.nodeElement, I, g, _.id),
                        target: gh('target', S.nodeElement, I, g, _.id),
                    },
                },
            }
            ;(r.set(_.id, A),
                _.parentId &&
                    dc(A, r, i, {
                        nodeOrigin: u,
                        zIndexMode: c,
                    }),
                (p = !0),
                k &&
                    (m.push({
                        id: _.id,
                        type: 'dimensions',
                        dimensions: E,
                    }),
                    _.expandParent &&
                        _.parentId &&
                        y.push({
                            id: _.id,
                            parentId: _.parentId,
                            rect: io(A, u),
                        })))
        }
    }
    if (y.length > 0) {
        const S = hc(y, r, i, u)
        m.push(...S)
    }
    return {
        changes: m,
        updatedInternals: p,
    }
}
async function e1({
    delta: t,
    panZoom: r,
    transform: i,
    translateExtent: l,
    width: u,
    height: a,
}) {
    if (!r || (!t.x && !t.y)) return Promise.resolve(!1)
    const c = await r.setViewportConstrained(
            {
                x: i[0] + t.x,
                y: i[1] + t.y,
                zoom: i[2],
            },
            [
                [0, 0],
                [u, a],
            ],
            l
        ),
        d = !!c && (c.x !== i[0] || c.y !== i[1] || c.k !== i[2])
    return Promise.resolve(d)
}
function _h(t, r, i, l, u, a) {
    let c = u
    const d = l.get(c) || new Map()
    ;(l.set(c, d.set(i, r)), (c = `${u}-${t}`))
    const p = l.get(c) || new Map()
    if ((l.set(c, p.set(i, r)), a)) {
        c = `${u}-${t}-${a}`
        const m = l.get(c) || new Map()
        l.set(c, m.set(i, r))
    }
}
function sg(t, r, i) {
    ;(t.clear(), r.clear())
    for (const l of i) {
        const {
                source: u,
                target: a,
                sourceHandle: c = null,
                targetHandle: d = null,
            } = l,
            p = {
                edgeId: l.id,
                source: u,
                target: a,
                sourceHandle: c,
                targetHandle: d,
            },
            m = `${u}-${c}--${a}-${d}`,
            v = `${a}-${d}--${u}-${c}`
        ;(_h('source', p, v, t, u, c),
            _h('target', p, m, t, a, d),
            r.set(l.id, l))
    }
}
function lg(t, r) {
    if (!t.parentId) return !1
    const i = r.get(t.parentId)
    return i ? (i.selected ? !0 : lg(i, r)) : !1
}
function Eh(t, r, i) {
    var u
    let l = t
    do {
        if ((u = l == null ? void 0 : l.matches) != null && u.call(l, r))
            return !0
        if (l === i) return !1
        l = l == null ? void 0 : l.parentElement
    } while (l)
    return !1
}
function t1(t, r, i, l) {
    const u = new Map()
    for (const [a, c] of t)
        if (
            (c.selected || c.id === l) &&
            (!c.parentId || !lg(c, t)) &&
            (c.draggable || (r && typeof c.draggable > 'u'))
        ) {
            const d = t.get(a)
            d &&
                u.set(a, {
                    id: a,
                    position: d.position || {
                        x: 0,
                        y: 0,
                    },
                    distance: {
                        x: i.x - d.internals.positionAbsolute.x,
                        y: i.y - d.internals.positionAbsolute.y,
                    },
                    extent: d.extent,
                    parentId: d.parentId,
                    origin: d.origin,
                    expandParent: d.expandParent,
                    internals: {
                        positionAbsolute: d.internals.positionAbsolute || {
                            x: 0,
                            y: 0,
                        },
                    },
                    measured: {
                        width: d.measured.width ?? 0,
                        height: d.measured.height ?? 0,
                    },
                })
        }
    return u
}
function Pa({ nodeId: t, dragItems: r, nodeLookup: i, dragging: l = !0 }) {
    var c, d, p
    const u = []
    for (const [m, v] of r) {
        const g = (c = i.get(m)) == null ? void 0 : c.internals.userNode
        g &&
            u.push({
                ...g,
                position: v.position,
                dragging: l,
            })
    }
    if (!t) return [u[0], u]
    const a = (d = i.get(t)) == null ? void 0 : d.internals.userNode
    return [
        a
            ? {
                  ...a,
                  position:
                      ((p = r.get(t)) == null ? void 0 : p.position) ||
                      a.position,
                  dragging: l,
              }
            : u[0],
        u,
    ]
}
function n1({ dragItems: t, snapGrid: r, x: i, y: l }) {
    const u = t.values().next().value
    if (!u) return null
    const a = {
            x: i - u.distance.x,
            y: l - u.distance.y,
        },
        c = Si(a, r)
    return {
        x: c.x - a.x,
        y: c.y - a.y,
    }
}
function r1({
    onNodeMouseDown: t,
    getStoreItems: r,
    onDragStart: i,
    onDrag: l,
    onDragStop: u,
}) {
    let a = {
            x: null,
            y: null,
        },
        c = 0,
        d = new Map(),
        p = !1,
        m = {
            x: 0,
            y: 0,
        },
        v = null,
        g = !1,
        y = null,
        S = !1,
        _ = !1,
        E = null
    function k({
        noDragClassName: I,
        handleSelector: w,
        domNode: N,
        isSelectable: A,
        nodeId: T,
        nodeClickDistance: F = 0,
    }) {
        y = wt(N)
        function V({ x: W, y: Z }) {
            const {
                nodeLookup: z,
                nodeExtent: B,
                snapGrid: H,
                snapToGrid: b,
                nodeOrigin: L,
                onNodeDrag: R,
                onSelectionDrag: j,
                onError: M,
                updateNodePositions: $,
            } = r()
            a = {
                x: W,
                y: Z,
            }
            let te = !1
            const ee = d.size > 1,
                le = ee && B ? Ya(wi(d)) : null,
                ue =
                    ee && b
                        ? n1({
                              dragItems: d,
                              snapGrid: H,
                              x: W,
                              y: Z,
                          })
                        : null
            for (const [ce, J] of d) {
                if (!z.has(ce)) continue
                let fe = {
                    x: W - J.distance.x,
                    y: Z - J.distance.y,
                }
                b &&
                    (fe = ue
                        ? {
                              x: Math.round(fe.x + ue.x),
                              y: Math.round(fe.y + ue.y),
                          }
                        : Si(fe, H))
                let we = null
                if (ee && B && !J.extent && le) {
                    const { positionAbsolute: ye } = J.internals,
                        Ne = ye.x - le.x + B[0][0],
                        Ie = ye.x + J.measured.width - le.x2 + B[1][0],
                        Me = ye.y - le.y + B[0][1],
                        Ue = ye.y + J.measured.height - le.y2 + B[1][1]
                    we = [
                        [Ne, Me],
                        [Ie, Ue],
                    ]
                }
                const { position: _e, positionAbsolute: Se } = Wp({
                    nodeId: ce,
                    nextPosition: fe,
                    nodeLookup: z,
                    nodeExtent: we || B,
                    nodeOrigin: L,
                    onError: M,
                })
                ;((te = te || J.position.x !== _e.x || J.position.y !== _e.y),
                    (J.position = _e),
                    (J.internals.positionAbsolute = Se))
            }
            if (
                ((_ = _ || te), !!te && ($(d, !0), E && (l || R || (!T && j))))
            ) {
                const [ce, J] = Pa({
                    nodeId: T,
                    dragItems: d,
                    nodeLookup: z,
                })
                ;(l == null || l(E, d, ce, J),
                    R == null || R(E, ce, J),
                    T || j == null || j(E, J))
            }
        }
        async function K() {
            if (!v) return
            const {
                transform: W,
                panBy: Z,
                autoPanSpeed: z,
                autoPanOnNodeDrag: B,
            } = r()
            if (!B) {
                ;((p = !1), cancelAnimationFrame(c))
                return
            }
            const [H, b] = bp(m, v, z)
            ;((H !== 0 || b !== 0) &&
                ((a.x = (a.x ?? 0) - H / W[2]),
                (a.y = (a.y ?? 0) - b / W[2]),
                (await Z({
                    x: H,
                    y: b,
                })) && V(a)),
                (c = requestAnimationFrame(K)))
        }
        function ne(W) {
            var ee
            const {
                nodeLookup: Z,
                multiSelectionActive: z,
                nodesDraggable: B,
                transform: H,
                snapGrid: b,
                snapToGrid: L,
                selectNodesOnDrag: R,
                onNodeDragStart: j,
                onSelectionDragStart: M,
                unselectNodesAndEdges: $,
            } = r()
            ;((g = !0),
                (!R || !A) &&
                    !z &&
                    T &&
                    (((ee = Z.get(T)) != null && ee.selected) || $()),
                A && R && T && (t == null || t(T)))
            const te = si(W.sourceEvent, {
                transform: H,
                snapGrid: b,
                snapToGrid: L,
                containerBounds: v,
            })
            if (
                ((a = te),
                (d = t1(Z, B, te, T)),
                d.size > 0 && (i || j || (!T && M)))
            ) {
                const [le, ue] = Pa({
                    nodeId: T,
                    dragItems: d,
                    nodeLookup: Z,
                })
                ;(i == null || i(W.sourceEvent, d, le, ue),
                    j == null || j(W.sourceEvent, le, ue),
                    T || M == null || M(W.sourceEvent, ue))
            }
        }
        const U = Ep()
            .clickDistance(F)
            .on('start', (W) => {
                const {
                    domNode: Z,
                    nodeDragThreshold: z,
                    transform: B,
                    snapGrid: H,
                    snapToGrid: b,
                } = r()
                ;((v =
                    (Z == null ? void 0 : Z.getBoundingClientRect()) || null),
                    (S = !1),
                    (_ = !1),
                    (E = W.sourceEvent),
                    z === 0 && ne(W),
                    (a = si(W.sourceEvent, {
                        transform: B,
                        snapGrid: H,
                        snapToGrid: b,
                        containerBounds: v,
                    })),
                    (m = jt(W.sourceEvent, v)))
            })
            .on('drag', (W) => {
                const {
                        autoPanOnNodeDrag: Z,
                        transform: z,
                        snapGrid: B,
                        snapToGrid: H,
                        nodeDragThreshold: b,
                        nodeLookup: L,
                    } = r(),
                    R = si(W.sourceEvent, {
                        transform: z,
                        snapGrid: B,
                        snapToGrid: H,
                        containerBounds: v,
                    })
                if (
                    ((E = W.sourceEvent),
                    ((W.sourceEvent.type === 'touchmove' &&
                        W.sourceEvent.touches.length > 1) ||
                        (T && !L.has(T))) &&
                        (S = !0),
                    !S)
                ) {
                    if ((!p && Z && g && ((p = !0), K()), !g)) {
                        const j = jt(W.sourceEvent, v),
                            M = j.x - m.x,
                            $ = j.y - m.y
                        Math.sqrt(M * M + $ * $) > b && ne(W)
                    }
                    ;(a.x !== R.xSnapped || a.y !== R.ySnapped) &&
                        d &&
                        g &&
                        ((m = jt(W.sourceEvent, v)), V(R))
                }
            })
            .on('end', (W) => {
                if (
                    !(!g || S) &&
                    ((p = !1), (g = !1), cancelAnimationFrame(c), d.size > 0)
                ) {
                    const {
                        nodeLookup: Z,
                        updateNodePositions: z,
                        onNodeDragStop: B,
                        onSelectionDragStop: H,
                    } = r()
                    if ((_ && (z(d, !1), (_ = !1)), u || B || (!T && H))) {
                        const [b, L] = Pa({
                            nodeId: T,
                            dragItems: d,
                            nodeLookup: Z,
                            dragging: !1,
                        })
                        ;(u == null || u(W.sourceEvent, d, b, L),
                            B == null || B(W.sourceEvent, b, L),
                            T || H == null || H(W.sourceEvent, L))
                    }
                }
            })
            .filter((W) => {
                const Z = W.target
                return (
                    !W.button &&
                    (!I || !Eh(Z, `.${I}`, N)) &&
                    (!w || Eh(Z, w, N))
                )
            })
        y.call(U)
    }
    function C() {
        y == null || y.on('.drag', null)
    }
    return {
        update: k,
        destroy: C,
    }
}
function o1(t, r, i) {
    const l = [],
        u = {
            x: t.x - i,
            y: t.y - i,
            width: i * 2,
            height: i * 2,
        }
    for (const a of r.values()) hi(u, io(a)) > 0 && l.push(a)
    return l
}
const i1 = 250
function s1(t, r, i, l) {
    var d, p
    let u = [],
        a = 1 / 0
    const c = o1(t, i, r + i1)
    for (const m of c) {
        const v = [
            ...(((d = m.internals.handleBounds) == null ? void 0 : d.source) ??
                []),
            ...(((p = m.internals.handleBounds) == null ? void 0 : p.target) ??
                []),
        ]
        for (const g of v) {
            if (l.nodeId === g.nodeId && l.type === g.type && l.id === g.id)
                continue
            const { x: y, y: S } = yr(m, g, g.position, !0),
                _ = Math.sqrt(Math.pow(y - t.x, 2) + Math.pow(S - t.y, 2))
            _ > r ||
                (_ < a
                    ? ((u = [
                          {
                              ...g,
                              x: y,
                              y: S,
                          },
                      ]),
                      (a = _))
                    : _ === a &&
                      u.push({
                          ...g,
                          x: y,
                          y: S,
                      }))
        }
    }
    if (!u.length) return null
    if (u.length > 1) {
        const m = l.type === 'source' ? 'target' : 'source'
        return u.find((v) => v.type === m) ?? u[0]
    }
    return u[0]
}
function ug(t, r, i, l, u, a = !1) {
    var m, v, g
    const c = l.get(t)
    if (!c) return null
    const d =
            u === 'strict'
                ? (m = c.internals.handleBounds) == null
                    ? void 0
                    : m[r]
                : [
                      ...(((v = c.internals.handleBounds) == null
                          ? void 0
                          : v.source) ?? []),
                      ...(((g = c.internals.handleBounds) == null
                          ? void 0
                          : g.target) ?? []),
                  ],
        p =
            (i
                ? d == null
                    ? void 0
                    : d.find((y) => y.id === i)
                : d == null
                  ? void 0
                  : d[0]) ?? null
    return p && a
        ? {
              ...p,
              ...yr(c, p, p.position, !0),
          }
        : p
}
function ag(t, r) {
    return (
        t ||
        (r != null && r.classList.contains('target')
            ? 'target'
            : r != null && r.classList.contains('source')
              ? 'source'
              : null)
    )
}
function l1(t, r) {
    let i = null
    return (r ? (i = !0) : t && !r && (i = !1), i)
}
const cg = () => !0
function u1(
    t,
    {
        connectionMode: r,
        connectionRadius: i,
        handleId: l,
        nodeId: u,
        edgeUpdaterType: a,
        isTarget: c,
        domNode: d,
        nodeLookup: p,
        lib: m,
        autoPanOnConnect: v,
        flowId: g,
        panBy: y,
        cancelConnection: S,
        onConnectStart: _,
        onConnect: E,
        onConnectEnd: k,
        isValidConnection: C = cg,
        onReconnectEnd: I,
        updateConnection: w,
        getTransform: N,
        getFromHandle: A,
        autoPanSpeed: T,
        dragThreshold: F = 1,
        handleDomNode: V,
    }
) {
    const K = Gp(t.target)
    let ne = 0,
        U
    const { x: W, y: Z } = jt(t),
        z = ag(a, V),
        B = d == null ? void 0 : d.getBoundingClientRect()
    let H = !1
    if (!B || !z) return
    const b = ug(u, z, l, p, r)
    if (!b) return
    let L = jt(t, B),
        R = !1,
        j = null,
        M = !1,
        $ = null
    function te() {
        if (!v || !B) return
        const [_e, Se] = bp(L, B, T)
        ;(y({
            x: _e,
            y: Se,
        }),
            (ne = requestAnimationFrame(te)))
    }
    const ee = {
            ...b,
            nodeId: u,
            type: z,
            position: b.position,
        },
        le = p.get(u)
    let ce = {
        inProgress: !0,
        isValid: null,
        from: yr(le, ee, ae.Left, !0),
        fromHandle: ee,
        fromPosition: ee.position,
        fromNode: le,
        to: L,
        toHandle: null,
        toPosition: fh[ee.position],
        toNode: null,
        pointer: L,
    }
    function J() {
        ;((H = !0),
            w(ce),
            _ == null ||
                _(t, {
                    nodeId: u,
                    handleId: l,
                    handleType: z,
                }))
    }
    F === 0 && J()
    function fe(_e) {
        if (!H) {
            const { x: Ue, y: Lt } = jt(_e),
                ht = Ue - W,
                pt = Lt - Z
            if (!(ht * ht + pt * pt > F * F)) return
            J()
        }
        if (!A() || !ee) {
            we(_e)
            return
        }
        const Se = N()
        ;((L = jt(_e, B)),
            (U = s1(_i(L, Se, !1, [1, 1]), i, p, ee)),
            R || (te(), (R = !0)))
        const ye = fg(_e, {
            handle: U,
            connectionMode: r,
            fromNodeId: u,
            fromHandleId: l,
            fromType: c ? 'target' : 'source',
            isValidConnection: C,
            doc: K,
            lib: m,
            flowId: g,
            nodeLookup: p,
        })
        ;(($ = ye.handleDomNode),
            (j = ye.connection),
            (M = l1(!!U, ye.isValid)))
        const Ne = p.get(u),
            Ie = Ne ? yr(Ne, ee, ae.Left, !0) : ce.from,
            Me = {
                ...ce,
                from: Ie,
                isValid: M,
                to:
                    ye.toHandle && M
                        ? hl(
                              {
                                  x: ye.toHandle.x,
                                  y: ye.toHandle.y,
                              },
                              Se
                          )
                        : L,
                toHandle: ye.toHandle,
                toPosition:
                    M && ye.toHandle ? ye.toHandle.position : fh[ee.position],
                toNode: ye.toHandle ? p.get(ye.toHandle.nodeId) : null,
                pointer: L,
            }
        ;(w(Me), (ce = Me))
    }
    function we(_e) {
        if (!('touches' in _e && _e.touches.length > 0)) {
            if (H) {
                ;(U || $) && j && M && (E == null || E(j))
                const { inProgress: Se, ...ye } = ce,
                    Ne = {
                        ...ye,
                        toPosition: ce.toHandle ? ce.toPosition : null,
                    }
                ;(k == null || k(_e, Ne), a && (I == null || I(_e, Ne)))
            }
            ;(S(),
                cancelAnimationFrame(ne),
                (R = !1),
                (M = !1),
                (j = null),
                ($ = null),
                K.removeEventListener('mousemove', fe),
                K.removeEventListener('mouseup', we),
                K.removeEventListener('touchmove', fe),
                K.removeEventListener('touchend', we))
        }
    }
    ;(K.addEventListener('mousemove', fe),
        K.addEventListener('mouseup', we),
        K.addEventListener('touchmove', fe),
        K.addEventListener('touchend', we))
}
function fg(
    t,
    {
        handle: r,
        connectionMode: i,
        fromNodeId: l,
        fromHandleId: u,
        fromType: a,
        doc: c,
        lib: d,
        flowId: p,
        isValidConnection: m = cg,
        nodeLookup: v,
    }
) {
    const g = a === 'target',
        y = r
            ? c.querySelector(
                  `.${d}-flow__handle[data-id="${p}-${r == null ? void 0 : r.nodeId}-${r == null ? void 0 : r.id}-${r == null ? void 0 : r.type}"]`
              )
            : null,
        { x: S, y: _ } = jt(t),
        E = c.elementFromPoint(S, _),
        k = E != null && E.classList.contains(`${d}-flow__handle`) ? E : y,
        C = {
            handleDomNode: k,
            isValid: !1,
            connection: null,
            toHandle: null,
        }
    if (k) {
        const I = ag(void 0, k),
            w = k.getAttribute('data-nodeid'),
            N = k.getAttribute('data-handleid'),
            A = k.classList.contains('connectable'),
            T = k.classList.contains('connectableend')
        if (!w || !I) return C
        const F = {
            source: g ? w : l,
            sourceHandle: g ? N : u,
            target: g ? l : w,
            targetHandle: g ? u : N,
        }
        C.connection = F
        const K =
            A &&
            T &&
            (i === gr.Strict
                ? (g && I === 'source') || (!g && I === 'target')
                : w !== l || N !== u)
        ;((C.isValid = K && m(F)), (C.toHandle = ug(w, I, N, v, i, !0)))
    }
    return C
}
const Ka = {
    onPointerDown: u1,
    isValid: fg,
}
function a1({ domNode: t, panZoom: r, getTransform: i, getViewScale: l }) {
    const u = wt(t)
    function a({
        translateExtent: d,
        width: p,
        height: m,
        zoomStep: v = 1,
        pannable: g = !0,
        zoomable: y = !0,
        inversePan: S = !1,
    }) {
        const _ = (w) => {
            if (w.sourceEvent.type !== 'wheel' || !r) return
            const N = i(),
                A = w.sourceEvent.ctrlKey && pi() ? 10 : 1,
                T =
                    -w.sourceEvent.deltaY *
                    (w.sourceEvent.deltaMode === 1
                        ? 0.05
                        : w.sourceEvent.deltaMode
                          ? 1
                          : 0.002) *
                    v,
                F = N[2] * Math.pow(2, T * A)
            r.scaleTo(F)
        }
        let E = [0, 0]
        const k = (w) => {
                ;(w.sourceEvent.type === 'mousedown' ||
                    w.sourceEvent.type === 'touchstart') &&
                    (E = [
                        w.sourceEvent.clientX ??
                            w.sourceEvent.touches[0].clientX,
                        w.sourceEvent.clientY ??
                            w.sourceEvent.touches[0].clientY,
                    ])
            },
            C = (w) => {
                const N = i()
                if (
                    (w.sourceEvent.type !== 'mousemove' &&
                        w.sourceEvent.type !== 'touchmove') ||
                    !r
                )
                    return
                const A = [
                        w.sourceEvent.clientX ??
                            w.sourceEvent.touches[0].clientX,
                        w.sourceEvent.clientY ??
                            w.sourceEvent.touches[0].clientY,
                    ],
                    T = [A[0] - E[0], A[1] - E[1]]
                E = A
                const F = l() * Math.max(N[2], Math.log(N[2])) * (S ? -1 : 1),
                    V = {
                        x: N[0] - T[0] * F,
                        y: N[1] - T[1] * F,
                    },
                    K = [
                        [0, 0],
                        [p, m],
                    ]
                r.setViewportConstrained(
                    {
                        x: V.x,
                        y: V.y,
                        zoom: N[2],
                    },
                    K,
                    d
                )
            },
            I = Fp()
                .on('start', k)
                .on('zoom', g ? C : null)
                .on('zoom.wheel', y ? _ : null)
        u.call(I, {})
    }
    function c() {
        u.on('zoom', null)
    }
    return {
        update: a,
        destroy: c,
        pointer: Ot,
    }
}
const kl = (t) => ({
        x: t.x,
        y: t.y,
        zoom: t.k,
    }),
    za = ({ x: t, y: r, zoom: i }) => Sl.translate(t, r).scale(i),
    Gr = (t, r) => t.target.closest(`.${r}`),
    dg = (t, r) => r === 2 && Array.isArray(t) && t.includes(2),
    c1 = (t) => ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2,
    La = (t, r = 0, i = c1, l = () => {}) => {
        const u = typeof r == 'number' && r > 0
        return (
            u || l(),
            u ? t.transition().duration(r).ease(i).on('end', l) : t
        )
    },
    hg = (t) => {
        const r = t.ctrlKey && pi() ? 10 : 1
        return (
            -t.deltaY * (t.deltaMode === 1 ? 0.05 : t.deltaMode ? 1 : 0.002) * r
        )
    }
function f1({
    zoomPanValues: t,
    noWheelClassName: r,
    d3Selection: i,
    d3Zoom: l,
    panOnScrollMode: u,
    panOnScrollSpeed: a,
    zoomOnPinch: c,
    onPanZoomStart: d,
    onPanZoom: p,
    onPanZoomEnd: m,
}) {
    return (v) => {
        if (Gr(v, r)) return (v.ctrlKey && v.preventDefault(), !1)
        ;(v.preventDefault(), v.stopImmediatePropagation())
        const g = i.property('__zoom').k || 1
        if (v.ctrlKey && c) {
            const k = Ot(v),
                C = hg(v),
                I = g * Math.pow(2, C)
            l.scaleTo(i, I, k, v)
            return
        }
        const y = v.deltaMode === 1 ? 20 : 1
        let S = u === dr.Vertical ? 0 : v.deltaX * y,
            _ = u === dr.Horizontal ? 0 : v.deltaY * y
        ;(!pi() &&
            v.shiftKey &&
            u !== dr.Vertical &&
            ((S = v.deltaY * y), (_ = 0)),
            l.translateBy(i, -(S / g) * a, -(_ / g) * a, {
                internal: !0,
            }))
        const E = kl(i.property('__zoom'))
        ;(clearTimeout(t.panScrollTimeout),
            t.isPanScrolling
                ? (p == null || p(v, E),
                  (t.panScrollTimeout = setTimeout(() => {
                      ;(m == null || m(v, E), (t.isPanScrolling = !1))
                  }, 150)))
                : ((t.isPanScrolling = !0), d == null || d(v, E)))
    }
}
function d1({ noWheelClassName: t, preventScrolling: r, d3ZoomHandler: i }) {
    return function (l, u) {
        const a = l.type === 'wheel',
            c = !r && a && !l.ctrlKey,
            d = Gr(l, t)
        if ((l.ctrlKey && a && d && l.preventDefault(), c || d)) return null
        ;(l.preventDefault(), i.call(this, l, u))
    }
}
function h1({ zoomPanValues: t, onDraggingChange: r, onPanZoomStart: i }) {
    return (l) => {
        var a, c, d
        if ((a = l.sourceEvent) != null && a.internal) return
        const u = kl(l.transform)
        ;((t.mouseButton =
            ((c = l.sourceEvent) == null ? void 0 : c.button) || 0),
            (t.isZoomingOrPanning = !0),
            (t.prevViewport = u),
            ((d = l.sourceEvent) == null ? void 0 : d.type) === 'mousedown' &&
                r(!0),
            i && (i == null || i(l.sourceEvent, u)))
    }
}
function p1({
    zoomPanValues: t,
    panOnDrag: r,
    onPaneContextMenu: i,
    onTransformChange: l,
    onPanZoom: u,
}) {
    return (a) => {
        var c, d
        ;((t.usedRightMouseButton = !!(i && dg(r, t.mouseButton ?? 0))),
            ((c = a.sourceEvent) != null && c.sync) ||
                l([a.transform.x, a.transform.y, a.transform.k]),
            u &&
                !((d = a.sourceEvent) != null && d.internal) &&
                (u == null || u(a.sourceEvent, kl(a.transform))))
    }
}
function g1({
    zoomPanValues: t,
    panOnDrag: r,
    panOnScroll: i,
    onDraggingChange: l,
    onPanZoomEnd: u,
    onPaneContextMenu: a,
}) {
    return (c) => {
        var d
        if (
            !((d = c.sourceEvent) != null && d.internal) &&
            ((t.isZoomingOrPanning = !1),
            a &&
                dg(r, t.mouseButton ?? 0) &&
                !t.usedRightMouseButton &&
                c.sourceEvent &&
                a(c.sourceEvent),
            (t.usedRightMouseButton = !1),
            l(!1),
            u)
        ) {
            const p = kl(c.transform)
            ;((t.prevViewport = p),
                clearTimeout(t.timerId),
                (t.timerId = setTimeout(
                    () => {
                        u == null || u(c.sourceEvent, p)
                    },
                    i ? 150 : 0
                )))
        }
    }
}
function m1({
    zoomActivationKeyPressed: t,
    zoomOnScroll: r,
    zoomOnPinch: i,
    panOnDrag: l,
    panOnScroll: u,
    zoomOnDoubleClick: a,
    userSelectionActive: c,
    noWheelClassName: d,
    noPanClassName: p,
    lib: m,
    connectionInProgress: v,
}) {
    return (g) => {
        var k
        const y = t || r,
            S = i && g.ctrlKey,
            _ = g.type === 'wheel'
        if (
            g.button === 1 &&
            g.type === 'mousedown' &&
            (Gr(g, `${m}-flow__node`) || Gr(g, `${m}-flow__edge`))
        )
            return !0
        if (
            (!l && !y && !u && !a && !i) ||
            c ||
            (v && !_) ||
            (Gr(g, d) && _) ||
            (Gr(g, p) && (!_ || (u && _ && !t))) ||
            (!i && g.ctrlKey && _)
        )
            return !1
        if (
            !i &&
            g.type === 'touchstart' &&
            ((k = g.touches) == null ? void 0 : k.length) > 1
        )
            return (g.preventDefault(), !1)
        if (
            (!y && !u && !S && _) ||
            (!l && (g.type === 'mousedown' || g.type === 'touchstart')) ||
            (Array.isArray(l) &&
                !l.includes(g.button) &&
                g.type === 'mousedown')
        )
            return !1
        const E =
            (Array.isArray(l) && l.includes(g.button)) ||
            !g.button ||
            g.button <= 1
        return (!g.ctrlKey || _) && E
    }
}
function y1({
    domNode: t,
    minZoom: r,
    maxZoom: i,
    translateExtent: l,
    viewport: u,
    onPanZoom: a,
    onPanZoomStart: c,
    onPanZoomEnd: d,
    onDraggingChange: p,
}) {
    const m = {
            isZoomingOrPanning: !1,
            usedRightMouseButton: !1,
            prevViewport: {},
            mouseButton: 0,
            timerId: void 0,
            panScrollTimeout: void 0,
            isPanScrolling: !1,
        },
        v = t.getBoundingClientRect(),
        g = Fp().scaleExtent([r, i]).translateExtent(l),
        y = wt(t).call(g)
    I(
        {
            x: u.x,
            y: u.y,
            zoom: oo(u.zoom, r, i),
        },
        [
            [0, 0],
            [v.width, v.height],
        ],
        l
    )
    const S = y.on('wheel.zoom'),
        _ = y.on('dblclick.zoom')
    g.wheelDelta(hg)
    function E(U, W) {
        return y
            ? new Promise((Z) => {
                  g == null ||
                      g
                          .interpolate(
                              (W == null ? void 0 : W.interpolate) === 'linear'
                                  ? ii
                                  : tl
                          )
                          .transform(
                              La(
                                  y,
                                  W == null ? void 0 : W.duration,
                                  W == null ? void 0 : W.ease,
                                  () => Z(!0)
                              ),
                              U
                          )
              })
            : Promise.resolve(!1)
    }
    function k({
        noWheelClassName: U,
        noPanClassName: W,
        onPaneContextMenu: Z,
        userSelectionActive: z,
        panOnScroll: B,
        panOnDrag: H,
        panOnScrollMode: b,
        panOnScrollSpeed: L,
        preventScrolling: R,
        zoomOnPinch: j,
        zoomOnScroll: M,
        zoomOnDoubleClick: $,
        zoomActivationKeyPressed: te,
        lib: ee,
        onTransformChange: le,
        connectionInProgress: ue,
        paneClickDistance: ce,
        selectionOnDrag: J,
    }) {
        z && !m.isZoomingOrPanning && C()
        const fe = B && !te && !z
        g.clickDistance(J ? 1 / 0 : !Ht(ce) || ce < 0 ? 0 : ce)
        const we = fe
            ? f1({
                  zoomPanValues: m,
                  noWheelClassName: U,
                  d3Selection: y,
                  d3Zoom: g,
                  panOnScrollMode: b,
                  panOnScrollSpeed: L,
                  zoomOnPinch: j,
                  onPanZoomStart: c,
                  onPanZoom: a,
                  onPanZoomEnd: d,
              })
            : d1({
                  noWheelClassName: U,
                  preventScrolling: R,
                  d3ZoomHandler: S,
              })
        if (
            (y.on('wheel.zoom', we, {
                passive: !1,
            }),
            !z)
        ) {
            const Se = h1({
                zoomPanValues: m,
                onDraggingChange: p,
                onPanZoomStart: c,
            })
            g.on('start', Se)
            const ye = p1({
                zoomPanValues: m,
                panOnDrag: H,
                onPaneContextMenu: !!Z,
                onPanZoom: a,
                onTransformChange: le,
            })
            g.on('zoom', ye)
            const Ne = g1({
                zoomPanValues: m,
                panOnDrag: H,
                panOnScroll: B,
                onPaneContextMenu: Z,
                onPanZoomEnd: d,
                onDraggingChange: p,
            })
            g.on('end', Ne)
        }
        const _e = m1({
            zoomActivationKeyPressed: te,
            panOnDrag: H,
            zoomOnScroll: M,
            panOnScroll: B,
            zoomOnDoubleClick: $,
            zoomOnPinch: j,
            userSelectionActive: z,
            noPanClassName: W,
            noWheelClassName: U,
            lib: ee,
            connectionInProgress: ue,
        })
        ;(g.filter(_e),
            $ ? y.on('dblclick.zoom', _) : y.on('dblclick.zoom', null))
    }
    function C() {
        g.on('zoom', null)
    }
    async function I(U, W, Z) {
        const z = za(U),
            B = g == null ? void 0 : g.constrain()(z, W, Z)
        return (B && (await E(B)), new Promise((H) => H(B)))
    }
    async function w(U, W) {
        const Z = za(U)
        return (await E(Z, W), new Promise((z) => z(Z)))
    }
    function N(U) {
        if (y) {
            const W = za(U),
                Z = y.property('__zoom')
            ;(Z.k !== U.zoom || Z.x !== U.x || Z.y !== U.y) &&
                (g == null ||
                    g.transform(y, W, null, {
                        sync: !0,
                    }))
        }
    }
    function A() {
        const U = y
            ? Op(y.node())
            : {
                  x: 0,
                  y: 0,
                  k: 1,
              }
        return {
            x: U.x,
            y: U.y,
            zoom: U.k,
        }
    }
    function T(U, W) {
        return y
            ? new Promise((Z) => {
                  g == null ||
                      g
                          .interpolate(
                              (W == null ? void 0 : W.interpolate) === 'linear'
                                  ? ii
                                  : tl
                          )
                          .scaleTo(
                              La(
                                  y,
                                  W == null ? void 0 : W.duration,
                                  W == null ? void 0 : W.ease,
                                  () => Z(!0)
                              ),
                              U
                          )
              })
            : Promise.resolve(!1)
    }
    function F(U, W) {
        return y
            ? new Promise((Z) => {
                  g == null ||
                      g
                          .interpolate(
                              (W == null ? void 0 : W.interpolate) === 'linear'
                                  ? ii
                                  : tl
                          )
                          .scaleBy(
                              La(
                                  y,
                                  W == null ? void 0 : W.duration,
                                  W == null ? void 0 : W.ease,
                                  () => Z(!0)
                              ),
                              U
                          )
              })
            : Promise.resolve(!1)
    }
    function V(U) {
        g == null || g.scaleExtent(U)
    }
    function K(U) {
        g == null || g.translateExtent(U)
    }
    function ne(U) {
        const W = !Ht(U) || U < 0 ? 0 : U
        g == null || g.clickDistance(W)
    }
    return {
        update: k,
        destroy: C,
        setViewport: w,
        setViewportConstrained: I,
        getViewport: A,
        scaleTo: T,
        scaleBy: F,
        setScaleExtent: V,
        setTranslateExtent: K,
        syncViewport: N,
        setClickDistance: ne,
    }
}
var lo
;(function (t) {
    ;((t.Line = 'line'), (t.Handle = 'handle'))
})(lo || (lo = {}))
function v1({
    width: t,
    prevWidth: r,
    height: i,
    prevHeight: l,
    affectsX: u,
    affectsY: a,
}) {
    const c = t - r,
        d = i - l,
        p = [c > 0 ? 1 : c < 0 ? -1 : 0, d > 0 ? 1 : d < 0 ? -1 : 0]
    return (c && u && (p[0] = p[0] * -1), d && a && (p[1] = p[1] * -1), p)
}
function kh(t) {
    const r = t.includes('right') || t.includes('left'),
        i = t.includes('bottom') || t.includes('top'),
        l = t.includes('left'),
        u = t.includes('top')
    return {
        isHorizontal: r,
        isVertical: i,
        affectsX: l,
        affectsY: u,
    }
}
function Fn(t, r) {
    return Math.max(0, r - t)
}
function Hn(t, r) {
    return Math.max(0, t - r)
}
function Gs(t, r, i) {
    return Math.max(0, r - t, t - i)
}
function Ch(t, r) {
    return t ? !r : r
}
function x1(t, r, i, l, u, a, c, d) {
    let { affectsX: p, affectsY: m } = r
    const { isHorizontal: v, isVertical: g } = r,
        y = v && g,
        { xSnapped: S, ySnapped: _ } = i,
        { minWidth: E, maxWidth: k, minHeight: C, maxHeight: I } = l,
        { x: w, y: N, width: A, height: T, aspectRatio: F } = t
    let V = Math.floor(v ? S - t.pointerX : 0),
        K = Math.floor(g ? _ - t.pointerY : 0)
    const ne = A + (p ? -V : V),
        U = T + (m ? -K : K),
        W = -a[0] * A,
        Z = -a[1] * T
    let z = Gs(ne, E, k),
        B = Gs(U, C, I)
    if (c) {
        let L = 0,
            R = 0
        ;(p && V < 0
            ? (L = Fn(w + V + W, c[0][0]))
            : !p && V > 0 && (L = Hn(w + ne + W, c[1][0])),
            m && K < 0
                ? (R = Fn(N + K + Z, c[0][1]))
                : !m && K > 0 && (R = Hn(N + U + Z, c[1][1])),
            (z = Math.max(z, L)),
            (B = Math.max(B, R)))
    }
    if (d) {
        let L = 0,
            R = 0
        ;(p && V > 0
            ? (L = Hn(w + V, d[0][0]))
            : !p && V < 0 && (L = Fn(w + ne, d[1][0])),
            m && K > 0
                ? (R = Hn(N + K, d[0][1]))
                : !m && K < 0 && (R = Fn(N + U, d[1][1])),
            (z = Math.max(z, L)),
            (B = Math.max(B, R)))
    }
    if (u) {
        if (v) {
            const L = Gs(ne / F, C, I) * F
            if (((z = Math.max(z, L)), c)) {
                let R = 0
                ;((!p && !m) || (p && !m && y)
                    ? (R = Hn(N + Z + ne / F, c[1][1]) * F)
                    : (R = Fn(N + Z + (p ? V : -V) / F, c[0][1]) * F),
                    (z = Math.max(z, R)))
            }
            if (d) {
                let R = 0
                ;((!p && !m) || (p && !m && y)
                    ? (R = Fn(N + ne / F, d[1][1]) * F)
                    : (R = Hn(N + (p ? V : -V) / F, d[0][1]) * F),
                    (z = Math.max(z, R)))
            }
        }
        if (g) {
            const L = Gs(U * F, E, k) / F
            if (((B = Math.max(B, L)), c)) {
                let R = 0
                ;((!p && !m) || (m && !p && y)
                    ? (R = Hn(w + U * F + W, c[1][0]) / F)
                    : (R = Fn(w + (m ? K : -K) * F + W, c[0][0]) / F),
                    (B = Math.max(B, R)))
            }
            if (d) {
                let R = 0
                ;((!p && !m) || (m && !p && y)
                    ? (R = Fn(w + U * F, d[1][0]) / F)
                    : (R = Hn(w + (m ? K : -K) * F, d[0][0]) / F),
                    (B = Math.max(B, R)))
            }
        }
    }
    ;((K = K + (K < 0 ? B : -B)),
        (V = V + (V < 0 ? z : -z)),
        u &&
            (y
                ? ne > U * F
                    ? (K = (Ch(p, m) ? -V : V) / F)
                    : (V = (Ch(p, m) ? -K : K) * F)
                : v
                  ? ((K = V / F), (m = p))
                  : ((V = K * F), (p = m))))
    const H = p ? w + V : w,
        b = m ? N + K : N
    return {
        width: A + (p ? -V : V),
        height: T + (m ? -K : K),
        x: a[0] * V * (p ? -1 : 1) + H,
        y: a[1] * K * (m ? -1 : 1) + b,
    }
}
const pg = {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
    },
    w1 = {
        ...pg,
        pointerX: 0,
        pointerY: 0,
        aspectRatio: 1,
    }
function S1(t) {
    return [
        [0, 0],
        [t.measured.width, t.measured.height],
    ]
}
function _1(t, r, i) {
    const l = r.position.x + t.position.x,
        u = r.position.y + t.position.y,
        a = t.measured.width ?? 0,
        c = t.measured.height ?? 0,
        d = i[0] * a,
        p = i[1] * c
    return [
        [l - d, u - p],
        [l + a - d, u + c - p],
    ]
}
function E1({
    domNode: t,
    nodeId: r,
    getStoreItems: i,
    onChange: l,
    onEnd: u,
}) {
    const a = wt(t)
    let c = {
        controlDirection: kh('bottom-right'),
        boundaries: {
            minWidth: 0,
            minHeight: 0,
            maxWidth: Number.MAX_VALUE,
            maxHeight: Number.MAX_VALUE,
        },
        resizeDirection: void 0,
        keepAspectRatio: !1,
    }
    function d({
        controlPosition: m,
        boundaries: v,
        keepAspectRatio: g,
        resizeDirection: y,
        onResizeStart: S,
        onResize: _,
        onResizeEnd: E,
        shouldResize: k,
    }) {
        let C = {
                ...pg,
            },
            I = {
                ...w1,
            }
        c = {
            boundaries: v,
            resizeDirection: y,
            keepAspectRatio: g,
            controlDirection: kh(m),
        }
        let w,
            N = null,
            A = [],
            T,
            F,
            V,
            K = !1
        const ne = Ep()
            .on('start', (U) => {
                const {
                    nodeLookup: W,
                    transform: Z,
                    snapGrid: z,
                    snapToGrid: B,
                    nodeOrigin: H,
                    paneDomNode: b,
                } = i()
                if (((w = W.get(r)), !w)) return
                N = (b == null ? void 0 : b.getBoundingClientRect()) ?? null
                const { xSnapped: L, ySnapped: R } = si(U.sourceEvent, {
                    transform: Z,
                    snapGrid: z,
                    snapToGrid: B,
                    containerBounds: N,
                })
                ;((C = {
                    width: w.measured.width ?? 0,
                    height: w.measured.height ?? 0,
                    x: w.position.x ?? 0,
                    y: w.position.y ?? 0,
                }),
                    (I = {
                        ...C,
                        pointerX: L,
                        pointerY: R,
                        aspectRatio: C.width / C.height,
                    }),
                    (T = void 0),
                    w.parentId &&
                        (w.extent === 'parent' || w.expandParent) &&
                        ((T = W.get(w.parentId)),
                        (F = T && w.extent === 'parent' ? S1(T) : void 0)),
                    (A = []),
                    (V = void 0))
                for (const [j, M] of W)
                    if (
                        M.parentId === r &&
                        (A.push({
                            id: j,
                            position: {
                                ...M.position,
                            },
                            extent: M.extent,
                        }),
                        M.extent === 'parent' || M.expandParent)
                    ) {
                        const $ = _1(M, w, M.origin ?? H)
                        V
                            ? (V = [
                                  [
                                      Math.min($[0][0], V[0][0]),
                                      Math.min($[0][1], V[0][1]),
                                  ],
                                  [
                                      Math.max($[1][0], V[1][0]),
                                      Math.max($[1][1], V[1][1]),
                                  ],
                              ])
                            : (V = $)
                    }
                S == null ||
                    S(U, {
                        ...C,
                    })
            })
            .on('drag', (U) => {
                const {
                        transform: W,
                        snapGrid: Z,
                        snapToGrid: z,
                        nodeOrigin: B,
                    } = i(),
                    H = si(U.sourceEvent, {
                        transform: W,
                        snapGrid: Z,
                        snapToGrid: z,
                        containerBounds: N,
                    }),
                    b = []
                if (!w) return
                const { x: L, y: R, width: j, height: M } = C,
                    $ = {},
                    te = w.origin ?? B,
                    {
                        width: ee,
                        height: le,
                        x: ue,
                        y: ce,
                    } = x1(
                        I,
                        c.controlDirection,
                        H,
                        c.boundaries,
                        c.keepAspectRatio,
                        te,
                        F,
                        V
                    ),
                    J = ee !== j,
                    fe = le !== M,
                    we = ue !== L && J,
                    _e = ce !== R && fe
                if (!we && !_e && !J && !fe) return
                if (
                    (we || _e || te[0] === 1 || te[1] === 1) &&
                    (($.x = we ? ue : C.x),
                    ($.y = _e ? ce : C.y),
                    (C.x = $.x),
                    (C.y = $.y),
                    A.length > 0)
                ) {
                    const Ie = ue - L,
                        Me = ce - R
                    for (const Ue of A)
                        ((Ue.position = {
                            x: Ue.position.x - Ie + te[0] * (ee - j),
                            y: Ue.position.y - Me + te[1] * (le - M),
                        }),
                            b.push(Ue))
                }
                if (
                    ((J || fe) &&
                        (($.width =
                            J &&
                            (!c.resizeDirection ||
                                c.resizeDirection === 'horizontal')
                                ? ee
                                : C.width),
                        ($.height =
                            fe &&
                            (!c.resizeDirection ||
                                c.resizeDirection === 'vertical')
                                ? le
                                : C.height),
                        (C.width = $.width),
                        (C.height = $.height)),
                    T && w.expandParent)
                ) {
                    const Ie = te[0] * ($.width ?? 0)
                    $.x && $.x < Ie && ((C.x = Ie), (I.x = I.x - ($.x - Ie)))
                    const Me = te[1] * ($.height ?? 0)
                    $.y && $.y < Me && ((C.y = Me), (I.y = I.y - ($.y - Me)))
                }
                const Se = v1({
                        width: C.width,
                        prevWidth: j,
                        height: C.height,
                        prevHeight: M,
                        affectsX: c.controlDirection.affectsX,
                        affectsY: c.controlDirection.affectsY,
                    }),
                    ye = {
                        ...C,
                        direction: Se,
                    }
                ;(k == null ? void 0 : k(U, ye)) !== !1 &&
                    ((K = !0), _ == null || _(U, ye), l($, b))
            })
            .on('end', (U) => {
                K &&
                    (E == null ||
                        E(U, {
                            ...C,
                        }),
                    u == null ||
                        u({
                            ...C,
                        }),
                    (K = !1))
            })
        a.call(ne)
    }
    function p() {
        a.on('.drag', null)
    }
    return {
        update: d,
        destroy: p,
    }
}
var Ia = {
        exports: {},
    },
    Ta = {},
    Ra = {
        exports: {},
    },
    Da = {} /**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Nh
function k1() {
    if (Nh) return Da
    Nh = 1
    var t = mi()
    function r(g, y) {
        return (g === y && (g !== 0 || 1 / g === 1 / y)) || (g !== g && y !== y)
    }
    var i = typeof Object.is == 'function' ? Object.is : r,
        l = t.useState,
        u = t.useEffect,
        a = t.useLayoutEffect,
        c = t.useDebugValue
    function d(g, y) {
        var S = y(),
            _ = l({
                inst: {
                    value: S,
                    getSnapshot: y,
                },
            }),
            E = _[0].inst,
            k = _[1]
        return (
            a(
                function () {
                    ;((E.value = S),
                        (E.getSnapshot = y),
                        p(E) &&
                            k({
                                inst: E,
                            }))
                },
                [g, S, y]
            ),
            u(
                function () {
                    return (
                        p(E) &&
                            k({
                                inst: E,
                            }),
                        g(function () {
                            p(E) &&
                                k({
                                    inst: E,
                                })
                        })
                    )
                },
                [g]
            ),
            c(S),
            S
        )
    }
    function p(g) {
        var y = g.getSnapshot
        g = g.value
        try {
            var S = y()
            return !i(g, S)
        } catch {
            return !0
        }
    }
    function m(g, y) {
        return y()
    }
    var v =
        typeof window > 'u' ||
        typeof window.document > 'u' ||
        typeof window.document.createElement > 'u'
            ? m
            : d
    return (
        (Da.useSyncExternalStore =
            t.useSyncExternalStore !== void 0 ? t.useSyncExternalStore : v),
        Da
    )
}
var Mh
function C1() {
    return (Mh || ((Mh = 1), (Ra.exports = k1())), Ra.exports)
} /**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Ph
function N1() {
    if (Ph) return Ta
    Ph = 1
    var t = mi(),
        r = C1()
    function i(m, v) {
        return (m === v && (m !== 0 || 1 / m === 1 / v)) || (m !== m && v !== v)
    }
    var l = typeof Object.is == 'function' ? Object.is : i,
        u = r.useSyncExternalStore,
        a = t.useRef,
        c = t.useEffect,
        d = t.useMemo,
        p = t.useDebugValue
    return (
        (Ta.useSyncExternalStoreWithSelector = function (m, v, g, y, S) {
            var _ = a(null)
            if (_.current === null) {
                var E = {
                    hasValue: !1,
                    value: null,
                }
                _.current = E
            } else E = _.current
            _ = d(
                function () {
                    function C(T) {
                        if (!I) {
                            if (
                                ((I = !0),
                                (w = T),
                                (T = y(T)),
                                S !== void 0 && E.hasValue)
                            ) {
                                var F = E.value
                                if (S(F, T)) return (N = F)
                            }
                            return (N = T)
                        }
                        if (((F = N), l(w, T))) return F
                        var V = y(T)
                        return S !== void 0 && S(F, V)
                            ? ((w = T), F)
                            : ((w = T), (N = V))
                    }
                    var I = !1,
                        w,
                        N,
                        A = g === void 0 ? null : g
                    return [
                        function () {
                            return C(v())
                        },
                        A === null
                            ? void 0
                            : function () {
                                  return C(A())
                              },
                    ]
                },
                [v, g, y, S]
            )
            var k = u(m, _[0], _[1])
            return (
                c(
                    function () {
                        ;((E.hasValue = !0), (E.value = k))
                    },
                    [k]
                ),
                p(k),
                k
            )
        }),
        Ta
    )
}
var zh
function M1() {
    return (zh || ((zh = 1), (Ia.exports = N1())), Ia.exports)
}
var P1 = M1()
const z1 = qa(P1),
    L1 = {},
    Lh = (t) => {
        let r
        const i = new Set(),
            l = (v, g) => {
                const y = typeof v == 'function' ? v(r) : v
                if (!Object.is(y, r)) {
                    const S = r
                    ;((r =
                        (g ?? (typeof y != 'object' || y === null))
                            ? y
                            : Object.assign({}, r, y)),
                        i.forEach((_) => _(r, S)))
                }
            },
            u = () => r,
            p = {
                setState: l,
                getState: u,
                getInitialState: () => m,
                subscribe: (v) => (i.add(v), () => i.delete(v)),
                destroy: () => {
                    ;((L1 ? 'production' : void 0) !== 'production' &&
                        console.warn(
                            '[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected.'
                        ),
                        i.clear())
                },
            },
            m = (r = t(l, u, p))
        return p
    },
    I1 = (t) => (t ? Lh(t) : Lh),
    { useDebugValue: T1 } = Kr,
    { useSyncExternalStoreWithSelector: R1 } = z1,
    D1 = (t) => t
function gg(t, r = D1, i) {
    const l = R1(
        t.subscribe,
        t.getState,
        t.getServerState || t.getInitialState,
        r,
        i
    )
    return (T1(l), l)
}
const Ih = (t, r) => {
        const i = I1(t),
            l = (u, a = r) => gg(i, u, a)
        return (Object.assign(l, i), l)
    },
    A1 = (t, r) => (t ? Ih(t, r) : Ih)
function $e(t, r) {
    if (Object.is(t, r)) return !0
    if (
        typeof t != 'object' ||
        t === null ||
        typeof r != 'object' ||
        r === null
    )
        return !1
    if (t instanceof Map && r instanceof Map) {
        if (t.size !== r.size) return !1
        for (const [l, u] of t) if (!Object.is(u, r.get(l))) return !1
        return !0
    }
    if (t instanceof Set && r instanceof Set) {
        if (t.size !== r.size) return !1
        for (const l of t) if (!r.has(l)) return !1
        return !0
    }
    const i = Object.keys(t)
    if (i.length !== Object.keys(r).length) return !1
    for (const l of i)
        if (
            !Object.prototype.hasOwnProperty.call(r, l) ||
            !Object.is(t[l], r[l])
        )
            return !1
    return !0
}
up()
const Cl = q.createContext(null),
    $1 = Cl.Provider,
    mg = qt.error001()
function Ce(t, r) {
    const i = q.useContext(Cl)
    if (i === null) throw new Error(mg)
    return gg(i, t, r)
}
function Oe() {
    const t = q.useContext(Cl)
    if (t === null) throw new Error(mg)
    return q.useMemo(
        () => ({
            getState: t.getState,
            setState: t.setState,
            subscribe: t.subscribe,
        }),
        [t]
    )
}
const Th = {
        display: 'none',
    },
    O1 = {
        position: 'absolute',
        width: 1,
        height: 1,
        margin: -1,
        border: 0,
        padding: 0,
        overflow: 'hidden',
        clip: 'rect(0px, 0px, 0px, 0px)',
        clipPath: 'inset(100%)',
    },
    yg = 'react-flow__node-desc',
    vg = 'react-flow__edge-desc',
    F1 = 'react-flow__aria-live',
    H1 = (t) => t.ariaLiveMessage,
    j1 = (t) => t.ariaLabelConfig
function V1({ rfId: t }) {
    const r = Ce(H1)
    return Q.jsx('div', {
        id: `${F1}-${t}`,
        'aria-live': 'assertive',
        'aria-atomic': 'true',
        style: O1,
        children: r,
    })
}
function B1({ rfId: t, disableKeyboardA11y: r }) {
    const i = Ce(j1)
    return Q.jsxs(Q.Fragment, {
        children: [
            Q.jsx('div', {
                id: `${yg}-${t}`,
                style: Th,
                children: r
                    ? i['node.a11yDescription.default']
                    : i['node.a11yDescription.keyboardDisabled'],
            }),
            Q.jsx('div', {
                id: `${vg}-${t}`,
                style: Th,
                children: i['edge.a11yDescription.default'],
            }),
            !r &&
                Q.jsx(V1, {
                    rfId: t,
                }),
        ],
    })
}
const Ei = q.forwardRef(
    (
        { position: t = 'top-left', children: r, className: i, style: l, ...u },
        a
    ) => {
        const c = `${t}`.split('-')
        return Q.jsx('div', {
            className: be(['react-flow__panel', i, ...c]),
            style: l,
            ref: a,
            ...u,
            children: r,
        })
    }
)
Ei.displayName = 'Panel'
function U1({ proOptions: t, position: r = 'bottom-right' }) {
    return t != null && t.hideAttribution
        ? null
        : Q.jsx(Ei, {
              position: r,
              className: 'react-flow__attribution',
              'data-message':
                  'Please only hide this attribution when you are subscribed to React Flow Pro: https://pro.reactflow.dev',
              children: Q.jsx('a', {
                  href: 'https://reactflow.dev',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  'aria-label': 'React Flow attribution',
                  children: 'React Flow',
              }),
          })
}
const W1 = (t) => {
        const r = [],
            i = []
        for (const [, l] of t.nodeLookup)
            l.selected && r.push(l.internals.userNode)
        for (const [, l] of t.edgeLookup) l.selected && i.push(l)
        return {
            selectedNodes: r,
            selectedEdges: i,
        }
    },
    qs = (t) => t.id
function Y1(t, r) {
    return (
        $e(t.selectedNodes.map(qs), r.selectedNodes.map(qs)) &&
        $e(t.selectedEdges.map(qs), r.selectedEdges.map(qs))
    )
}
function b1({ onSelectionChange: t }) {
    const r = Oe(),
        { selectedNodes: i, selectedEdges: l } = Ce(W1, Y1)
    return (
        q.useEffect(() => {
            const u = {
                nodes: i,
                edges: l,
            }
            ;(t == null || t(u),
                r.getState().onSelectionChangeHandlers.forEach((a) => a(u)))
        }, [i, l, t]),
        null
    )
}
const X1 = (t) => !!t.onSelectionChangeHandlers
function Q1({ onSelectionChange: t }) {
    const r = Ce(X1)
    return t || r
        ? Q.jsx(b1, {
              onSelectionChange: t,
          })
        : null
}
const xg = [0, 0],
    K1 = {
        x: 0,
        y: 0,
        zoom: 1,
    },
    G1 = [
        'nodes',
        'edges',
        'defaultNodes',
        'defaultEdges',
        'onConnect',
        'onConnectStart',
        'onConnectEnd',
        'onClickConnectStart',
        'onClickConnectEnd',
        'nodesDraggable',
        'autoPanOnNodeFocus',
        'nodesConnectable',
        'nodesFocusable',
        'edgesFocusable',
        'edgesReconnectable',
        'elevateNodesOnSelect',
        'elevateEdgesOnSelect',
        'minZoom',
        'maxZoom',
        'nodeExtent',
        'onNodesChange',
        'onEdgesChange',
        'elementsSelectable',
        'connectionMode',
        'snapGrid',
        'snapToGrid',
        'translateExtent',
        'connectOnClick',
        'defaultEdgeOptions',
        'fitView',
        'fitViewOptions',
        'onNodesDelete',
        'onEdgesDelete',
        'onDelete',
        'onNodeDrag',
        'onNodeDragStart',
        'onNodeDragStop',
        'onSelectionDrag',
        'onSelectionDragStart',
        'onSelectionDragStop',
        'onMoveStart',
        'onMove',
        'onMoveEnd',
        'noPanClassName',
        'nodeOrigin',
        'autoPanOnConnect',
        'autoPanOnNodeDrag',
        'onError',
        'connectionRadius',
        'isValidConnection',
        'selectNodesOnDrag',
        'nodeDragThreshold',
        'connectionDragThreshold',
        'onBeforeDelete',
        'debug',
        'autoPanSpeed',
        'ariaLabelConfig',
        'zIndexMode',
    ],
    Rh = [...G1, 'rfId'],
    q1 = (t) => ({
        setNodes: t.setNodes,
        setEdges: t.setEdges,
        setMinZoom: t.setMinZoom,
        setMaxZoom: t.setMaxZoom,
        setTranslateExtent: t.setTranslateExtent,
        setNodeExtent: t.setNodeExtent,
        reset: t.reset,
        setDefaultNodesAndEdges: t.setDefaultNodesAndEdges,
    }),
    Dh = {
        translateExtent: fi,
        nodeOrigin: xg,
        minZoom: 0.5,
        maxZoom: 2,
        elementsSelectable: !0,
        noPanClassName: 'nopan',
        rfId: '1',
    }
function Z1(t) {
    const {
            setNodes: r,
            setEdges: i,
            setMinZoom: l,
            setMaxZoom: u,
            setTranslateExtent: a,
            setNodeExtent: c,
            reset: d,
            setDefaultNodesAndEdges: p,
        } = Ce(q1, $e),
        m = Oe()
    q.useEffect(
        () => (
            p(t.defaultNodes, t.defaultEdges),
            () => {
                ;((v.current = Dh), d())
            }
        ),
        []
    )
    const v = q.useRef(Dh)
    return (
        q.useEffect(
            () => {
                for (const g of Rh) {
                    const y = t[g],
                        S = v.current[g]
                    y !== S &&
                        (typeof t[g] > 'u' ||
                            (g === 'nodes'
                                ? r(y)
                                : g === 'edges'
                                  ? i(y)
                                  : g === 'minZoom'
                                    ? l(y)
                                    : g === 'maxZoom'
                                      ? u(y)
                                      : g === 'translateExtent'
                                        ? a(y)
                                        : g === 'nodeExtent'
                                          ? c(y)
                                          : g === 'ariaLabelConfig'
                                            ? m.setState({
                                                  ariaLabelConfig: $w(y),
                                              })
                                            : g === 'fitView'
                                              ? m.setState({
                                                    fitViewQueued: y,
                                                })
                                              : g === 'fitViewOptions'
                                                ? m.setState({
                                                      fitViewOptions: y,
                                                  })
                                                : m.setState({
                                                      [g]: y,
                                                  })))
                }
                v.current = t
            },
            Rh.map((g) => t[g])
        ),
        null
    )
}
function Ah() {
    return typeof window > 'u' || !window.matchMedia
        ? null
        : window.matchMedia('(prefers-color-scheme: dark)')
}
function J1(t) {
    var l
    const [r, i] = q.useState(t === 'system' ? null : t)
    return (
        q.useEffect(() => {
            if (t !== 'system') {
                i(t)
                return
            }
            const u = Ah(),
                a = () => i(u != null && u.matches ? 'dark' : 'light')
            return (
                a(),
                u == null || u.addEventListener('change', a),
                () => {
                    u == null || u.removeEventListener('change', a)
                }
            )
        }, [t]),
        r !== null ? r : (l = Ah()) != null && l.matches ? 'dark' : 'light'
    )
}
const $h = typeof document < 'u' ? document : null
function gi(
    t = null,
    r = {
        target: $h,
        actInsideInputWithModifier: !0,
    }
) {
    const [i, l] = q.useState(!1),
        u = q.useRef(!1),
        a = q.useRef(new Set([])),
        [c, d] = q.useMemo(() => {
            if (t !== null) {
                const m = (Array.isArray(t) ? t : [t])
                        .filter((g) => typeof g == 'string')
                        .map((g) =>
                            g
                                .replace(
                                    '+',
                                    `
`
                                )
                                .replace(
                                    `

`,

                                    `
+`
                                ).split(`
`)
                        ),
                    v = m.reduce((g, y) => g.concat(...y), [])
                return [m, v]
            }
            return [[], []]
        }, [t])
    return (
        q.useEffect(() => {
            const p = (r == null ? void 0 : r.target) ?? $h,
                m = (r == null ? void 0 : r.actInsideInputWithModifier) ?? !0
            if (t !== null) {
                const v = (S) => {
                        var k, C
                        if (
                            ((u.current =
                                S.ctrlKey ||
                                S.metaKey ||
                                S.shiftKey ||
                                S.altKey),
                            (!u.current || (u.current && !m)) && qp(S))
                        )
                            return !1
                        const E = Fh(S.code, d)
                        if ((a.current.add(S[E]), Oh(c, a.current, !1))) {
                            const I =
                                    ((C =
                                        (k = S.composedPath) == null
                                            ? void 0
                                            : k.call(S)) == null
                                        ? void 0
                                        : C[0]) || S.target,
                                w =
                                    (I == null ? void 0 : I.nodeName) ===
                                        'BUTTON' ||
                                    (I == null ? void 0 : I.nodeName) === 'A'
                            ;(r.preventDefault !== !1 &&
                                (u.current || !w) &&
                                S.preventDefault(),
                                l(!0))
                        }
                    },
                    g = (S) => {
                        const _ = Fh(S.code, d)
                        ;(Oh(c, a.current, !0)
                            ? (l(!1), a.current.clear())
                            : a.current.delete(S[_]),
                            S.key === 'Meta' && a.current.clear(),
                            (u.current = !1))
                    },
                    y = () => {
                        ;(a.current.clear(), l(!1))
                    }
                return (
                    p == null || p.addEventListener('keydown', v),
                    p == null || p.addEventListener('keyup', g),
                    window.addEventListener('blur', y),
                    window.addEventListener('contextmenu', y),
                    () => {
                        ;(p == null || p.removeEventListener('keydown', v),
                            p == null || p.removeEventListener('keyup', g),
                            window.removeEventListener('blur', y),
                            window.removeEventListener('contextmenu', y))
                    }
                )
            }
        }, [t, l]),
        i
    )
}
function Oh(t, r, i) {
    return t
        .filter((l) => i || l.length === r.size)
        .some((l) => l.every((u) => r.has(u)))
}
function Fh(t, r) {
    return r.includes(t) ? 'code' : 'key'
}
const eS = () => {
    const t = Oe()
    return q.useMemo(
        () => ({
            zoomIn: (r) => {
                const { panZoom: i } = t.getState()
                return i
                    ? i.scaleBy(1.2, {
                          duration: r == null ? void 0 : r.duration,
                      })
                    : Promise.resolve(!1)
            },
            zoomOut: (r) => {
                const { panZoom: i } = t.getState()
                return i
                    ? i.scaleBy(1 / 1.2, {
                          duration: r == null ? void 0 : r.duration,
                      })
                    : Promise.resolve(!1)
            },
            zoomTo: (r, i) => {
                const { panZoom: l } = t.getState()
                return l
                    ? l.scaleTo(r, {
                          duration: i == null ? void 0 : i.duration,
                      })
                    : Promise.resolve(!1)
            },
            getZoom: () => t.getState().transform[2],
            setViewport: async (r, i) => {
                const {
                    transform: [l, u, a],
                    panZoom: c,
                } = t.getState()
                return c
                    ? (await c.setViewport(
                          {
                              x: r.x ?? l,
                              y: r.y ?? u,
                              zoom: r.zoom ?? a,
                          },
                          i
                      ),
                      Promise.resolve(!0))
                    : Promise.resolve(!1)
            },
            getViewport: () => {
                const [r, i, l] = t.getState().transform
                return {
                    x: r,
                    y: i,
                    zoom: l,
                }
            },
            setCenter: async (r, i, l) => t.getState().setCenter(r, i, l),
            fitBounds: async (r, i) => {
                const {
                        width: l,
                        height: u,
                        minZoom: a,
                        maxZoom: c,
                        panZoom: d,
                    } = t.getState(),
                    p = lc(
                        r,
                        l,
                        u,
                        a,
                        c,
                        (i == null ? void 0 : i.padding) ?? 0.1
                    )
                return d
                    ? (await d.setViewport(p, {
                          duration: i == null ? void 0 : i.duration,
                          ease: i == null ? void 0 : i.ease,
                          interpolate: i == null ? void 0 : i.interpolate,
                      }),
                      Promise.resolve(!0))
                    : Promise.resolve(!1)
            },
            screenToFlowPosition: (r, i = {}) => {
                const {
                    transform: l,
                    snapGrid: u,
                    snapToGrid: a,
                    domNode: c,
                } = t.getState()
                if (!c) return r
                const { x: d, y: p } = c.getBoundingClientRect(),
                    m = {
                        x: r.x - d,
                        y: r.y - p,
                    },
                    v = i.snapGrid ?? u,
                    g = i.snapToGrid ?? a
                return _i(m, l, g, v)
            },
            flowToScreenPosition: (r) => {
                const { transform: i, domNode: l } = t.getState()
                if (!l) return r
                const { x: u, y: a } = l.getBoundingClientRect(),
                    c = hl(r, i)
                return {
                    x: c.x + u,
                    y: c.y + a,
                }
            },
        }),
        []
    )
}
function wg(t, r) {
    const i = [],
        l = new Map(),
        u = []
    for (const a of t)
        if (a.type === 'add') {
            u.push(a)
            continue
        } else if (a.type === 'remove' || a.type === 'replace') l.set(a.id, [a])
        else {
            const c = l.get(a.id)
            c ? c.push(a) : l.set(a.id, [a])
        }
    for (const a of r) {
        const c = l.get(a.id)
        if (!c) {
            i.push(a)
            continue
        }
        if (c[0].type === 'remove') continue
        if (c[0].type === 'replace') {
            i.push({
                ...c[0].item,
            })
            continue
        }
        const d = {
            ...a,
        }
        for (const p of c) tS(p, d)
        i.push(d)
    }
    return (
        u.length &&
            u.forEach((a) => {
                a.index !== void 0
                    ? i.splice(a.index, 0, {
                          ...a.item,
                      })
                    : i.push({
                          ...a.item,
                      })
            }),
        i
    )
}
function tS(t, r) {
    switch (t.type) {
        case 'select': {
            r.selected = t.selected
            break
        }
        case 'position': {
            ;(typeof t.position < 'u' && (r.position = t.position),
                typeof t.dragging < 'u' && (r.dragging = t.dragging))
            break
        }
        case 'dimensions': {
            ;(typeof t.dimensions < 'u' &&
                ((r.measured = {
                    ...t.dimensions,
                }),
                t.setAttributes &&
                    ((t.setAttributes === !0 || t.setAttributes === 'width') &&
                        (r.width = t.dimensions.width),
                    (t.setAttributes === !0 || t.setAttributes === 'height') &&
                        (r.height = t.dimensions.height))),
                typeof t.resizing == 'boolean' && (r.resizing = t.resizing))
            break
        }
    }
}
function Sg(t, r) {
    return wg(t, r)
}
function _g(t, r) {
    return wg(t, r)
}
function ar(t, r) {
    return {
        id: t,
        type: 'select',
        selected: r,
    }
}
function qr(t, r = new Set(), i = !1) {
    const l = []
    for (const [u, a] of t) {
        const c = r.has(u)
        !(a.selected === void 0 && !c) &&
            a.selected !== c &&
            (i && (a.selected = c), l.push(ar(a.id, c)))
    }
    return l
}
function Hh({ items: t = [], lookup: r }) {
    var u
    const i = [],
        l = new Map(t.map((a) => [a.id, a]))
    for (const [a, c] of t.entries()) {
        const d = r.get(c.id),
            p =
                ((u = d == null ? void 0 : d.internals) == null
                    ? void 0
                    : u.userNode) ?? d
        ;(p !== void 0 &&
            p !== c &&
            i.push({
                id: c.id,
                item: c,
                type: 'replace',
            }),
            p === void 0 &&
                i.push({
                    item: c,
                    type: 'add',
                    index: a,
                }))
    }
    for (const [a] of r)
        l.get(a) === void 0 &&
            i.push({
                id: a,
                type: 'remove',
            })
    return i
}
function jh(t) {
    return {
        id: t.id,
        type: 'remove',
    }
}
const Vh = (t) => Nw(t),
    nS = (t) => Up(t)
function Eg(t) {
    return q.forwardRef(t)
}
const rS = typeof window < 'u' ? q.useLayoutEffect : q.useEffect
function Bh(t) {
    const [r, i] = q.useState(BigInt(0)),
        [l] = q.useState(() => oS(() => i((u) => u + BigInt(1))))
    return (
        rS(() => {
            const u = l.get()
            u.length && (t(u), l.reset())
        }, [r]),
        l
    )
}
function oS(t) {
    let r = []
    return {
        get: () => r,
        reset: () => {
            r = []
        },
        push: (i) => {
            ;(r.push(i), t())
        },
    }
}
const kg = q.createContext(null)
function iS({ children: t }) {
    const r = Oe(),
        i = q.useCallback((d) => {
            const {
                nodes: p = [],
                setNodes: m,
                hasDefaultNodes: v,
                onNodesChange: g,
                nodeLookup: y,
                fitViewQueued: S,
                onNodesChangeMiddlewareMap: _,
            } = r.getState()
            let E = p
            for (const C of d) E = typeof C == 'function' ? C(E) : C
            let k = Hh({
                items: E,
                lookup: y,
            })
            for (const C of _.values()) k = C(k)
            ;(v && m(E),
                k.length > 0
                    ? g == null || g(k)
                    : S &&
                      window.requestAnimationFrame(() => {
                          const {
                              fitViewQueued: C,
                              nodes: I,
                              setNodes: w,
                          } = r.getState()
                          C && w(I)
                      }))
        }, []),
        l = Bh(i),
        u = q.useCallback((d) => {
            const {
                edges: p = [],
                setEdges: m,
                hasDefaultEdges: v,
                onEdgesChange: g,
                edgeLookup: y,
            } = r.getState()
            let S = p
            for (const _ of d) S = typeof _ == 'function' ? _(S) : _
            v
                ? m(S)
                : g &&
                  g(
                      Hh({
                          items: S,
                          lookup: y,
                      })
                  )
        }, []),
        a = Bh(u),
        c = q.useMemo(
            () => ({
                nodeQueue: l,
                edgeQueue: a,
            }),
            []
        )
    return Q.jsx(kg.Provider, {
        value: c,
        children: t,
    })
}
function sS() {
    const t = q.useContext(kg)
    if (!t)
        throw new Error('useBatchContext must be used within a BatchProvider')
    return t
}
const lS = (t) => !!t.panZoom
function uo() {
    const t = eS(),
        r = Oe(),
        i = sS(),
        l = Ce(lS),
        u = q.useMemo(() => {
            const a = (g) => r.getState().nodeLookup.get(g),
                c = (g) => {
                    i.nodeQueue.push(g)
                },
                d = (g) => {
                    i.edgeQueue.push(g)
                },
                p = (g) => {
                    var C, I
                    const { nodeLookup: y, nodeOrigin: S } = r.getState(),
                        _ = Vh(g) ? g : y.get(g.id),
                        E = _.parentId
                            ? Kp(_.position, _.measured, _.parentId, y, S)
                            : _.position,
                        k = {
                            ..._,
                            position: E,
                            width:
                                ((C = _.measured) == null ? void 0 : C.width) ??
                                _.width,
                            height:
                                ((I = _.measured) == null
                                    ? void 0
                                    : I.height) ?? _.height,
                        }
                    return io(k)
                },
                m = (
                    g,
                    y,
                    S = {
                        replace: !1,
                    }
                ) => {
                    c((_) =>
                        _.map((E) => {
                            if (E.id === g) {
                                const k = typeof y == 'function' ? y(E) : y
                                return S.replace && Vh(k)
                                    ? k
                                    : {
                                          ...E,
                                          ...k,
                                      }
                            }
                            return E
                        })
                    )
                },
                v = (
                    g,
                    y,
                    S = {
                        replace: !1,
                    }
                ) => {
                    d((_) =>
                        _.map((E) => {
                            if (E.id === g) {
                                const k = typeof y == 'function' ? y(E) : y
                                return S.replace && nS(k)
                                    ? k
                                    : {
                                          ...E,
                                          ...k,
                                      }
                            }
                            return E
                        })
                    )
                }
            return {
                getNodes: () =>
                    r.getState().nodes.map((g) => ({
                        ...g,
                    })),
                getNode: (g) => {
                    var y
                    return (y = a(g)) == null ? void 0 : y.internals.userNode
                },
                getInternalNode: a,
                getEdges: () => {
                    const { edges: g = [] } = r.getState()
                    return g.map((y) => ({
                        ...y,
                    }))
                },
                getEdge: (g) => r.getState().edgeLookup.get(g),
                setNodes: c,
                setEdges: d,
                addNodes: (g) => {
                    const y = Array.isArray(g) ? g : [g]
                    i.nodeQueue.push((S) => [...S, ...y])
                },
                addEdges: (g) => {
                    const y = Array.isArray(g) ? g : [g]
                    i.edgeQueue.push((S) => [...S, ...y])
                },
                toObject: () => {
                    const {
                            nodes: g = [],
                            edges: y = [],
                            transform: S,
                        } = r.getState(),
                        [_, E, k] = S
                    return {
                        nodes: g.map((C) => ({
                            ...C,
                        })),
                        edges: y.map((C) => ({
                            ...C,
                        })),
                        viewport: {
                            x: _,
                            y: E,
                            zoom: k,
                        },
                    }
                },
                deleteElements: async ({ nodes: g = [], edges: y = [] }) => {
                    const {
                            nodes: S,
                            edges: _,
                            onNodesDelete: E,
                            onEdgesDelete: k,
                            triggerNodeChanges: C,
                            triggerEdgeChanges: I,
                            onDelete: w,
                            onBeforeDelete: N,
                        } = r.getState(),
                        { nodes: A, edges: T } = await Iw({
                            nodesToRemove: g,
                            edgesToRemove: y,
                            nodes: S,
                            edges: _,
                            onBeforeDelete: N,
                        }),
                        F = T.length > 0,
                        V = A.length > 0
                    if (F) {
                        const K = T.map(jh)
                        ;(k == null || k(T), I(K))
                    }
                    if (V) {
                        const K = A.map(jh)
                        ;(E == null || E(A), C(K))
                    }
                    return (
                        (V || F) &&
                            (w == null ||
                                w({
                                    nodes: A,
                                    edges: T,
                                })),
                        {
                            deletedNodes: A,
                            deletedEdges: T,
                        }
                    )
                },
                getIntersectingNodes: (g, y = !0, S) => {
                    const _ = hh(g),
                        E = _ ? g : p(g),
                        k = S !== void 0
                    return E
                        ? (S || r.getState().nodes).filter((C) => {
                              const I = r.getState().nodeLookup.get(C.id)
                              if (
                                  I &&
                                  !_ &&
                                  (C.id === g.id ||
                                      !I.internals.positionAbsolute)
                              )
                                  return !1
                              const w = io(k ? C : I),
                                  N = hi(w, E)
                              return (
                                  (y && N > 0) ||
                                  N >= w.width * w.height ||
                                  N >= E.width * E.height
                              )
                          })
                        : []
                },
                isNodeIntersecting: (g, y, S = !0) => {
                    const E = hh(g) ? g : p(g)
                    if (!E) return !1
                    const k = hi(E, y)
                    return (
                        (S && k > 0) ||
                        k >= y.width * y.height ||
                        k >= E.width * E.height
                    )
                },
                updateNode: m,
                updateNodeData: (
                    g,
                    y,
                    S = {
                        replace: !1,
                    }
                ) => {
                    m(
                        g,
                        (_) => {
                            const E = typeof y == 'function' ? y(_) : y
                            return S.replace
                                ? {
                                      ..._,
                                      data: E,
                                  }
                                : {
                                      ..._,
                                      data: {
                                          ..._.data,
                                          ...E,
                                      },
                                  }
                        },
                        S
                    )
                },
                updateEdge: v,
                updateEdgeData: (
                    g,
                    y,
                    S = {
                        replace: !1,
                    }
                ) => {
                    v(
                        g,
                        (_) => {
                            const E = typeof y == 'function' ? y(_) : y
                            return S.replace
                                ? {
                                      ..._,
                                      data: E,
                                  }
                                : {
                                      ..._,
                                      data: {
                                          ..._.data,
                                          ...E,
                                      },
                                  }
                        },
                        S
                    )
                },
                getNodesBounds: (g) => {
                    const { nodeLookup: y, nodeOrigin: S } = r.getState()
                    return Mw(g, {
                        nodeLookup: y,
                        nodeOrigin: S,
                    })
                },
                getHandleConnections: ({ type: g, id: y, nodeId: S }) => {
                    var _
                    return Array.from(
                        ((_ = r
                            .getState()
                            .connectionLookup.get(
                                `${S}-${g}${y ? `-${y}` : ''}`
                            )) == null
                            ? void 0
                            : _.values()) ?? []
                    )
                },
                getNodeConnections: ({ type: g, handleId: y, nodeId: S }) => {
                    var _
                    return Array.from(
                        ((_ = r
                            .getState()
                            .connectionLookup.get(
                                `${S}${g ? (y ? `-${g}-${y}` : `-${g}`) : ''}`
                            )) == null
                            ? void 0
                            : _.values()) ?? []
                    )
                },
                fitView: async (g) => {
                    const y = r.getState().fitViewResolver ?? Aw()
                    return (
                        r.setState({
                            fitViewQueued: !0,
                            fitViewOptions: g,
                            fitViewResolver: y,
                        }),
                        i.nodeQueue.push((S) => [...S]),
                        y.promise
                    )
                },
            }
        }, [])
    return q.useMemo(
        () => ({
            ...u,
            ...t,
            viewportInitialized: l,
        }),
        [l]
    )
}
const Uh = (t) => t.selected,
    uS = typeof window < 'u' ? window : void 0
function aS({ deleteKeyCode: t, multiSelectionKeyCode: r }) {
    const i = Oe(),
        { deleteElements: l } = uo(),
        u = gi(t, {
            actInsideInputWithModifier: !1,
        }),
        a = gi(r, {
            target: uS,
        })
    ;(q.useEffect(() => {
        if (u) {
            const { edges: c, nodes: d } = i.getState()
            ;(l({
                nodes: d.filter(Uh),
                edges: c.filter(Uh),
            }),
                i.setState({
                    nodesSelectionActive: !1,
                }))
        }
    }, [u]),
        q.useEffect(() => {
            i.setState({
                multiSelectionActive: a,
            })
        }, [a]))
}
function cS(t) {
    const r = Oe()
    q.useEffect(() => {
        const i = () => {
            var u, a, c, d
            if (
                !t.current ||
                !(
                    ((a = (u = t.current).checkVisibility) == null
                        ? void 0
                        : a.call(u)) ?? !0
                )
            )
                return !1
            const l = uc(t.current)
            ;((l.height === 0 || l.width === 0) &&
                ((d = (c = r.getState()).onError) == null ||
                    d.call(c, '004', qt.error004())),
                r.setState({
                    width: l.width || 500,
                    height: l.height || 500,
                }))
        }
        if (t.current) {
            ;(i(), window.addEventListener('resize', i))
            const l = new ResizeObserver(() => i())
            return (
                l.observe(t.current),
                () => {
                    ;(window.removeEventListener('resize', i),
                        l && t.current && l.unobserve(t.current))
                }
            )
        }
    }, [])
}
const Nl = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
    },
    fS = (t) => ({
        userSelectionActive: t.userSelectionActive,
        lib: t.lib,
        connectionInProgress: t.connection.inProgress,
    })
function dS({
    onPaneContextMenu: t,
    zoomOnScroll: r = !0,
    zoomOnPinch: i = !0,
    panOnScroll: l = !1,
    panOnScrollSpeed: u = 0.5,
    panOnScrollMode: a = dr.Free,
    zoomOnDoubleClick: c = !0,
    panOnDrag: d = !0,
    defaultViewport: p,
    translateExtent: m,
    minZoom: v,
    maxZoom: g,
    zoomActivationKeyCode: y,
    preventScrolling: S = !0,
    children: _,
    noWheelClassName: E,
    noPanClassName: k,
    onViewportChange: C,
    isControlledViewport: I,
    paneClickDistance: w,
    selectionOnDrag: N,
}) {
    const A = Oe(),
        T = q.useRef(null),
        {
            userSelectionActive: F,
            lib: V,
            connectionInProgress: K,
        } = Ce(fS, $e),
        ne = gi(y),
        U = q.useRef()
    cS(T)
    const W = q.useCallback(
        (Z) => {
            ;(C == null ||
                C({
                    x: Z[0],
                    y: Z[1],
                    zoom: Z[2],
                }),
                I ||
                    A.setState({
                        transform: Z,
                    }))
        },
        [C, I]
    )
    return (
        q.useEffect(() => {
            if (T.current) {
                U.current = y1({
                    domNode: T.current,
                    minZoom: v,
                    maxZoom: g,
                    translateExtent: m,
                    viewport: p,
                    onDraggingChange: (H) =>
                        A.setState({
                            paneDragging: H,
                        }),
                    onPanZoomStart: (H, b) => {
                        const { onViewportChangeStart: L, onMoveStart: R } =
                            A.getState()
                        ;(R == null || R(H, b), L == null || L(b))
                    },
                    onPanZoom: (H, b) => {
                        const { onViewportChange: L, onMove: R } = A.getState()
                        ;(R == null || R(H, b), L == null || L(b))
                    },
                    onPanZoomEnd: (H, b) => {
                        const { onViewportChangeEnd: L, onMoveEnd: R } =
                            A.getState()
                        ;(R == null || R(H, b), L == null || L(b))
                    },
                })
                const { x: Z, y: z, zoom: B } = U.current.getViewport()
                return (
                    A.setState({
                        panZoom: U.current,
                        transform: [Z, z, B],
                        domNode: T.current.closest('.react-flow'),
                    }),
                    () => {
                        var H
                        ;(H = U.current) == null || H.destroy()
                    }
                )
            }
        }, []),
        q.useEffect(() => {
            var Z
            ;(Z = U.current) == null ||
                Z.update({
                    onPaneContextMenu: t,
                    zoomOnScroll: r,
                    zoomOnPinch: i,
                    panOnScroll: l,
                    panOnScrollSpeed: u,
                    panOnScrollMode: a,
                    zoomOnDoubleClick: c,
                    panOnDrag: d,
                    zoomActivationKeyPressed: ne,
                    preventScrolling: S,
                    noPanClassName: k,
                    userSelectionActive: F,
                    noWheelClassName: E,
                    lib: V,
                    onTransformChange: W,
                    connectionInProgress: K,
                    selectionOnDrag: N,
                    paneClickDistance: w,
                })
        }, [t, r, i, l, u, a, c, d, ne, S, k, F, E, V, W, K, N, w]),
        Q.jsx('div', {
            className: 'react-flow__renderer',
            ref: T,
            style: Nl,
            children: _,
        })
    )
}
const hS = (t) => ({
    userSelectionActive: t.userSelectionActive,
    userSelectionRect: t.userSelectionRect,
})
function pS() {
    const { userSelectionActive: t, userSelectionRect: r } = Ce(hS, $e)
    return t && r
        ? Q.jsx('div', {
              className: 'react-flow__selection react-flow__container',
              style: {
                  width: r.width,
                  height: r.height,
                  transform: `translate(${r.x}px, ${r.y}px)`,
              },
          })
        : null
}
const Aa = (t, r) => (i) => {
        i.target === r.current && (t == null || t(i))
    },
    gS = (t) => ({
        userSelectionActive: t.userSelectionActive,
        elementsSelectable: t.elementsSelectable,
        connectionInProgress: t.connection.inProgress,
        dragging: t.paneDragging,
    })
function mS({
    isSelecting: t,
    selectionKeyPressed: r,
    selectionMode: i = di.Full,
    panOnDrag: l,
    paneClickDistance: u,
    selectionOnDrag: a,
    onSelectionStart: c,
    onSelectionEnd: d,
    onPaneClick: p,
    onPaneContextMenu: m,
    onPaneScroll: v,
    onPaneMouseEnter: g,
    onPaneMouseMove: y,
    onPaneMouseLeave: S,
    children: _,
}) {
    const E = Oe(),
        {
            userSelectionActive: k,
            elementsSelectable: C,
            dragging: I,
            connectionInProgress: w,
        } = Ce(gS, $e),
        N = C && (t || k),
        A = q.useRef(null),
        T = q.useRef(),
        F = q.useRef(new Set()),
        V = q.useRef(new Set()),
        K = q.useRef(!1),
        ne = (L) => {
            if (K.current || w) {
                K.current = !1
                return
            }
            ;(p == null || p(L),
                E.getState().resetSelectedElements(),
                E.setState({
                    nodesSelectionActive: !1,
                }))
        },
        U = (L) => {
            if (Array.isArray(l) && l != null && l.includes(2)) {
                L.preventDefault()
                return
            }
            m == null || m(L)
        },
        W = v ? (L) => v(L) : void 0,
        Z = (L) => {
            K.current && (L.stopPropagation(), (K.current = !1))
        },
        z = (L) => {
            var le, ue
            const { domNode: R } = E.getState()
            if (
                ((T.current = R == null ? void 0 : R.getBoundingClientRect()),
                !T.current)
            )
                return
            const j = L.target === A.current
            if (
                (!j && !!L.target.closest('.nokey')) ||
                !t ||
                !((a && j) || r) ||
                L.button !== 0 ||
                !L.isPrimary
            )
                return
            ;((ue = (le = L.target) == null ? void 0 : le.setPointerCapture) ==
                null || ue.call(le, L.pointerId),
                (K.current = !1))
            const { x: te, y: ee } = jt(L.nativeEvent, T.current)
            ;(E.setState({
                userSelectionRect: {
                    width: 0,
                    height: 0,
                    startX: te,
                    startY: ee,
                    x: te,
                    y: ee,
                },
            }),
                j || (L.stopPropagation(), L.preventDefault()))
        },
        B = (L) => {
            const {
                userSelectionRect: R,
                transform: j,
                nodeLookup: M,
                edgeLookup: $,
                connectionLookup: te,
                triggerNodeChanges: ee,
                triggerEdgeChanges: le,
                defaultEdgeOptions: ue,
                resetSelectedElements: ce,
            } = E.getState()
            if (!T.current || !R) return
            const { x: J, y: fe } = jt(L.nativeEvent, T.current),
                { startX: we, startY: _e } = R
            if (!K.current) {
                const Me = r ? 0 : u
                if (Math.hypot(J - we, fe - _e) <= Me) return
                ;(ce(), c == null || c(L))
            }
            K.current = !0
            const Se = {
                    startX: we,
                    startY: _e,
                    x: J < we ? J : we,
                    y: fe < _e ? fe : _e,
                    width: Math.abs(J - we),
                    height: Math.abs(fe - _e),
                },
                ye = F.current,
                Ne = V.current
            ;((F.current = new Set(
                sc(M, Se, j, i === di.Partial, !0).map((Me) => Me.id)
            )),
                (V.current = new Set()))
            const Ie = (ue == null ? void 0 : ue.selectable) ?? !0
            for (const Me of F.current) {
                const Ue = te.get(Me)
                if (Ue)
                    for (const { edgeId: Lt } of Ue.values()) {
                        const ht = $.get(Lt)
                        ht && (ht.selectable ?? Ie) && V.current.add(Lt)
                    }
            }
            if (!ph(ye, F.current)) {
                const Me = qr(M, F.current, !0)
                ee(Me)
            }
            if (!ph(Ne, V.current)) {
                const Me = qr($, V.current)
                le(Me)
            }
            E.setState({
                userSelectionRect: Se,
                userSelectionActive: !0,
                nodesSelectionActive: !1,
            })
        },
        H = (L) => {
            var R, j
            L.button === 0 &&
                ((j =
                    (R = L.target) == null
                        ? void 0
                        : R.releasePointerCapture) == null ||
                    j.call(R, L.pointerId),
                !k &&
                    L.target === A.current &&
                    E.getState().userSelectionRect &&
                    (ne == null || ne(L)),
                E.setState({
                    userSelectionActive: !1,
                    userSelectionRect: null,
                }),
                K.current &&
                    (d == null || d(L),
                    E.setState({
                        nodesSelectionActive: F.current.size > 0,
                    })))
        },
        b = l === !0 || (Array.isArray(l) && l.includes(0))
    return Q.jsxs('div', {
        className: be([
            'react-flow__pane',
            {
                draggable: b,
                dragging: I,
                selection: t,
            },
        ]),
        onClick: N ? void 0 : Aa(ne, A),
        onContextMenu: Aa(U, A),
        onWheel: Aa(W, A),
        onPointerEnter: N ? void 0 : g,
        onPointerMove: N ? B : y,
        onPointerUp: N ? H : void 0,
        onPointerDownCapture: N ? z : void 0,
        onClickCapture: N ? Z : void 0,
        onPointerLeave: S,
        ref: A,
        style: Nl,
        children: [_, Q.jsx(pS, {})],
    })
}
function Ga({ id: t, store: r, unselect: i = !1, nodeRef: l }) {
    const {
            addSelectedNodes: u,
            unselectNodesAndEdges: a,
            multiSelectionActive: c,
            nodeLookup: d,
            onError: p,
        } = r.getState(),
        m = d.get(t)
    if (!m) {
        p == null || p('012', qt.error012(t))
        return
    }
    ;(r.setState({
        nodesSelectionActive: !1,
    }),
        m.selected
            ? (i || (m.selected && c)) &&
              (a({
                  nodes: [m],
                  edges: [],
              }),
              requestAnimationFrame(() => {
                  var v
                  return (v = l == null ? void 0 : l.current) == null
                      ? void 0
                      : v.blur()
              }))
            : u([t]))
}
function Cg({
    nodeRef: t,
    disabled: r = !1,
    noDragClassName: i,
    handleSelector: l,
    nodeId: u,
    isSelectable: a,
    nodeClickDistance: c,
}) {
    const d = Oe(),
        [p, m] = q.useState(!1),
        v = q.useRef()
    return (
        q.useEffect(() => {
            v.current = r1({
                getStoreItems: () => d.getState(),
                onNodeMouseDown: (g) => {
                    Ga({
                        id: g,
                        store: d,
                        nodeRef: t,
                    })
                },
                onDragStart: () => {
                    m(!0)
                },
                onDragStop: () => {
                    m(!1)
                },
            })
        }, []),
        q.useEffect(() => {
            var g, y
            if (r) (g = v.current) == null || g.destroy()
            else if (t.current)
                return (
                    (y = v.current) == null ||
                        y.update({
                            noDragClassName: i,
                            handleSelector: l,
                            domNode: t.current,
                            isSelectable: a,
                            nodeId: u,
                            nodeClickDistance: c,
                        }),
                    () => {
                        var S
                        ;(S = v.current) == null || S.destroy()
                    }
                )
        }, [i, l, r, a, t, u]),
        p
    )
}
const yS = (t) => (r) =>
    r.selected && (r.draggable || (t && typeof r.draggable > 'u'))
function Ng() {
    const t = Oe()
    return q.useCallback((i) => {
        const {
                nodeExtent: l,
                snapToGrid: u,
                snapGrid: a,
                nodesDraggable: c,
                onError: d,
                updateNodePositions: p,
                nodeLookup: m,
                nodeOrigin: v,
            } = t.getState(),
            g = new Map(),
            y = yS(c),
            S = u ? a[0] : 5,
            _ = u ? a[1] : 5,
            E = i.direction.x * S * i.factor,
            k = i.direction.y * _ * i.factor
        for (const [, C] of m) {
            if (!y(C)) continue
            let I = {
                x: C.internals.positionAbsolute.x + E,
                y: C.internals.positionAbsolute.y + k,
            }
            u && (I = Si(I, a))
            const { position: w, positionAbsolute: N } = Wp({
                nodeId: C.id,
                nextPosition: I,
                nodeLookup: m,
                nodeExtent: l,
                nodeOrigin: v,
                onError: d,
            })
            ;((C.position = w),
                (C.internals.positionAbsolute = N),
                g.set(C.id, C))
        }
        p(g)
    }, [])
}
const pc = q.createContext(null),
    vS = pc.Provider
pc.Consumer
const Mg = () => q.useContext(pc),
    xS = (t) => ({
        connectOnClick: t.connectOnClick,
        noPanClassName: t.noPanClassName,
        rfId: t.rfId,
    }),
    wS = (t, r, i) => (l) => {
        const {
                connectionClickStartHandle: u,
                connectionMode: a,
                connection: c,
            } = l,
            { fromHandle: d, toHandle: p, isValid: m } = c,
            v =
                (p == null ? void 0 : p.nodeId) === t &&
                (p == null ? void 0 : p.id) === r &&
                (p == null ? void 0 : p.type) === i
        return {
            connectingFrom:
                (d == null ? void 0 : d.nodeId) === t &&
                (d == null ? void 0 : d.id) === r &&
                (d == null ? void 0 : d.type) === i,
            connectingTo: v,
            clickConnecting:
                (u == null ? void 0 : u.nodeId) === t &&
                (u == null ? void 0 : u.id) === r &&
                (u == null ? void 0 : u.type) === i,
            isPossibleEndHandle:
                a === gr.Strict
                    ? (d == null ? void 0 : d.type) !== i
                    : t !== (d == null ? void 0 : d.nodeId) ||
                      r !== (d == null ? void 0 : d.id),
            connectionInProcess: !!d,
            clickConnectionInProcess: !!u,
            valid: v && m,
        }
    }
function SS(
    {
        type: t = 'source',
        position: r = ae.Top,
        isValidConnection: i,
        isConnectable: l = !0,
        isConnectableStart: u = !0,
        isConnectableEnd: a = !0,
        id: c,
        onConnect: d,
        children: p,
        className: m,
        onMouseDown: v,
        onTouchStart: g,
        ...y
    },
    S
) {
    var B, H
    const _ = c || null,
        E = t === 'target',
        k = Oe(),
        C = Mg(),
        { connectOnClick: I, noPanClassName: w, rfId: N } = Ce(xS, $e),
        {
            connectingFrom: A,
            connectingTo: T,
            clickConnecting: F,
            isPossibleEndHandle: V,
            connectionInProcess: K,
            clickConnectionInProcess: ne,
            valid: U,
        } = Ce(wS(C, _, t), $e)
    C ||
        (H = (B = k.getState()).onError) == null ||
        H.call(B, '010', qt.error010())
    const W = (b) => {
            const {
                    defaultEdgeOptions: L,
                    onConnect: R,
                    hasDefaultEdges: j,
                } = k.getState(),
                M = {
                    ...L,
                    ...b,
                }
            if (j) {
                const { edges: $, setEdges: te } = k.getState()
                te(ng(M, $))
            }
            ;(R == null || R(M), d == null || d(M))
        },
        Z = (b) => {
            if (!C) return
            const L = Zp(b.nativeEvent)
            if (u && ((L && b.button === 0) || !L)) {
                const R = k.getState()
                Ka.onPointerDown(b.nativeEvent, {
                    handleDomNode: b.currentTarget,
                    autoPanOnConnect: R.autoPanOnConnect,
                    connectionMode: R.connectionMode,
                    connectionRadius: R.connectionRadius,
                    domNode: R.domNode,
                    nodeLookup: R.nodeLookup,
                    lib: R.lib,
                    isTarget: E,
                    handleId: _,
                    nodeId: C,
                    flowId: R.rfId,
                    panBy: R.panBy,
                    cancelConnection: R.cancelConnection,
                    onConnectStart: R.onConnectStart,
                    onConnectEnd: R.onConnectEnd,
                    updateConnection: R.updateConnection,
                    onConnect: W,
                    isValidConnection: i || R.isValidConnection,
                    getTransform: () => k.getState().transform,
                    getFromHandle: () => k.getState().connection.fromHandle,
                    autoPanSpeed: R.autoPanSpeed,
                    dragThreshold: R.connectionDragThreshold,
                })
            }
            L ? v == null || v(b) : g == null || g(b)
        },
        z = (b) => {
            const {
                onClickConnectStart: L,
                onClickConnectEnd: R,
                connectionClickStartHandle: j,
                connectionMode: M,
                isValidConnection: $,
                lib: te,
                rfId: ee,
                nodeLookup: le,
                connection: ue,
            } = k.getState()
            if (!C || (!j && !u)) return
            if (!j) {
                ;(L == null ||
                    L(b.nativeEvent, {
                        nodeId: C,
                        handleId: _,
                        handleType: t,
                    }),
                    k.setState({
                        connectionClickStartHandle: {
                            nodeId: C,
                            type: t,
                            id: _,
                        },
                    }))
                return
            }
            const ce = Gp(b.target),
                J = i || $,
                { connection: fe, isValid: we } = Ka.isValid(b.nativeEvent, {
                    handle: {
                        nodeId: C,
                        id: _,
                        type: t,
                    },
                    connectionMode: M,
                    fromNodeId: j.nodeId,
                    fromHandleId: j.id || null,
                    fromType: j.type,
                    isValidConnection: J,
                    flowId: ee,
                    doc: ce,
                    lib: te,
                    nodeLookup: le,
                })
            we && fe && W(fe)
            const _e = structuredClone(ue)
            ;(delete _e.inProgress,
                (_e.toPosition = _e.toHandle ? _e.toHandle.position : null),
                R == null || R(b, _e),
                k.setState({
                    connectionClickStartHandle: null,
                }))
        }
    return Q.jsx('div', {
        'data-handleid': _,
        'data-nodeid': C,
        'data-handlepos': r,
        'data-id': `${N}-${C}-${_}-${t}`,
        className: be([
            'react-flow__handle',
            `react-flow__handle-${r}`,
            'nodrag',
            w,
            m,
            {
                source: !E,
                target: E,
                connectable: l,
                connectablestart: u,
                connectableend: a,
                clickconnecting: F,
                connectingfrom: A,
                connectingto: T,
                valid: U,
                connectionindicator: l && (!K || V) && (K || ne ? a : u),
            },
        ]),
        onMouseDown: Z,
        onTouchStart: Z,
        onClick: I ? z : void 0,
        ref: S,
        ...y,
        children: p,
    })
}
const Vn = q.memo(Eg(SS))
function _S({ data: t, isConnectable: r, sourcePosition: i = ae.Bottom }) {
    return Q.jsxs(Q.Fragment, {
        children: [
            t == null ? void 0 : t.label,
            Q.jsx(Vn, {
                type: 'source',
                position: i,
                isConnectable: r,
            }),
        ],
    })
}
function ES({
    data: t,
    isConnectable: r,
    targetPosition: i = ae.Top,
    sourcePosition: l = ae.Bottom,
}) {
    return Q.jsxs(Q.Fragment, {
        children: [
            Q.jsx(Vn, {
                type: 'target',
                position: i,
                isConnectable: r,
            }),
            t == null ? void 0 : t.label,
            Q.jsx(Vn, {
                type: 'source',
                position: l,
                isConnectable: r,
            }),
        ],
    })
}
function kS() {
    return null
}
function CS({ data: t, isConnectable: r, targetPosition: i = ae.Top }) {
    return Q.jsxs(Q.Fragment, {
        children: [
            Q.jsx(Vn, {
                type: 'target',
                position: i,
                isConnectable: r,
            }),
            t == null ? void 0 : t.label,
        ],
    })
}
const pl = {
        ArrowUp: {
            x: 0,
            y: -1,
        },
        ArrowDown: {
            x: 0,
            y: 1,
        },
        ArrowLeft: {
            x: -1,
            y: 0,
        },
        ArrowRight: {
            x: 1,
            y: 0,
        },
    },
    Wh = {
        input: _S,
        default: ES,
        output: CS,
        group: kS,
    }
function NS(t) {
    var r, i, l, u
    return t.internals.handleBounds === void 0
        ? {
              width:
                  t.width ??
                  t.initialWidth ??
                  ((r = t.style) == null ? void 0 : r.width),
              height:
                  t.height ??
                  t.initialHeight ??
                  ((i = t.style) == null ? void 0 : i.height),
          }
        : {
              width: t.width ?? ((l = t.style) == null ? void 0 : l.width),
              height: t.height ?? ((u = t.style) == null ? void 0 : u.height),
          }
}
const MS = (t) => {
    const {
        width: r,
        height: i,
        x: l,
        y: u,
    } = wi(t.nodeLookup, {
        filter: (a) => !!a.selected,
    })
    return {
        width: Ht(r) ? r : null,
        height: Ht(i) ? i : null,
        userSelectionActive: t.userSelectionActive,
        transformString: `translate(${t.transform[0]}px,${t.transform[1]}px) scale(${t.transform[2]}) translate(${l}px,${u}px)`,
    }
}
function PS({
    onSelectionContextMenu: t,
    noPanClassName: r,
    disableKeyboardA11y: i,
}) {
    const l = Oe(),
        {
            width: u,
            height: a,
            transformString: c,
            userSelectionActive: d,
        } = Ce(MS, $e),
        p = Ng(),
        m = q.useRef(null)
    if (
        (q.useEffect(() => {
            var y
            i ||
                (y = m.current) == null ||
                y.focus({
                    preventScroll: !0,
                })
        }, [i]),
        Cg({
            nodeRef: m,
        }),
        d || !u || !a)
    )
        return null
    const v = t
            ? (y) => {
                  const S = l.getState().nodes.filter((_) => _.selected)
                  t(y, S)
              }
            : void 0,
        g = (y) => {
            Object.prototype.hasOwnProperty.call(pl, y.key) &&
                (y.preventDefault(),
                p({
                    direction: pl[y.key],
                    factor: y.shiftKey ? 4 : 1,
                }))
        }
    return Q.jsx('div', {
        className: be([
            'react-flow__nodesselection',
            'react-flow__container',
            r,
        ]),
        style: {
            transform: c,
        },
        children: Q.jsx('div', {
            ref: m,
            className: 'react-flow__nodesselection-rect',
            onContextMenu: v,
            tabIndex: i ? void 0 : -1,
            onKeyDown: i ? void 0 : g,
            style: {
                width: u,
                height: a,
            },
        }),
    })
}
const Yh = typeof window < 'u' ? window : void 0,
    zS = (t) => ({
        nodesSelectionActive: t.nodesSelectionActive,
        userSelectionActive: t.userSelectionActive,
    })
function Pg({
    children: t,
    onPaneClick: r,
    onPaneMouseEnter: i,
    onPaneMouseMove: l,
    onPaneMouseLeave: u,
    onPaneContextMenu: a,
    onPaneScroll: c,
    paneClickDistance: d,
    deleteKeyCode: p,
    selectionKeyCode: m,
    selectionOnDrag: v,
    selectionMode: g,
    onSelectionStart: y,
    onSelectionEnd: S,
    multiSelectionKeyCode: _,
    panActivationKeyCode: E,
    zoomActivationKeyCode: k,
    elementsSelectable: C,
    zoomOnScroll: I,
    zoomOnPinch: w,
    panOnScroll: N,
    panOnScrollSpeed: A,
    panOnScrollMode: T,
    zoomOnDoubleClick: F,
    panOnDrag: V,
    defaultViewport: K,
    translateExtent: ne,
    minZoom: U,
    maxZoom: W,
    preventScrolling: Z,
    onSelectionContextMenu: z,
    noWheelClassName: B,
    noPanClassName: H,
    disableKeyboardA11y: b,
    onViewportChange: L,
    isControlledViewport: R,
}) {
    const { nodesSelectionActive: j, userSelectionActive: M } = Ce(zS, $e),
        $ = gi(m, {
            target: Yh,
        }),
        te = gi(E, {
            target: Yh,
        }),
        ee = te || V,
        le = te || N,
        ue = v && ee !== !0,
        ce = $ || M || ue
    return (
        aS({
            deleteKeyCode: p,
            multiSelectionKeyCode: _,
        }),
        Q.jsx(dS, {
            onPaneContextMenu: a,
            elementsSelectable: C,
            zoomOnScroll: I,
            zoomOnPinch: w,
            panOnScroll: le,
            panOnScrollSpeed: A,
            panOnScrollMode: T,
            zoomOnDoubleClick: F,
            panOnDrag: !$ && ee,
            defaultViewport: K,
            translateExtent: ne,
            minZoom: U,
            maxZoom: W,
            zoomActivationKeyCode: k,
            preventScrolling: Z,
            noWheelClassName: B,
            noPanClassName: H,
            onViewportChange: L,
            isControlledViewport: R,
            paneClickDistance: d,
            selectionOnDrag: ue,
            children: Q.jsxs(mS, {
                onSelectionStart: y,
                onSelectionEnd: S,
                onPaneClick: r,
                onPaneMouseEnter: i,
                onPaneMouseMove: l,
                onPaneMouseLeave: u,
                onPaneContextMenu: a,
                onPaneScroll: c,
                panOnDrag: ee,
                isSelecting: !!ce,
                selectionMode: g,
                selectionKeyPressed: $,
                paneClickDistance: d,
                selectionOnDrag: ue,
                children: [
                    t,
                    j &&
                        Q.jsx(PS, {
                            onSelectionContextMenu: z,
                            noPanClassName: H,
                            disableKeyboardA11y: b,
                        }),
                ],
            }),
        })
    )
}
Pg.displayName = 'FlowRenderer'
const LS = q.memo(Pg),
    IS = (t) => (r) =>
        t
            ? sc(
                  r.nodeLookup,
                  {
                      x: 0,
                      y: 0,
                      width: r.width,
                      height: r.height,
                  },
                  r.transform,
                  !0
              ).map((i) => i.id)
            : Array.from(r.nodeLookup.keys())
function TS(t) {
    return Ce(q.useCallback(IS(t), [t]), $e)
}
const RS = (t) => t.updateNodeInternals
function DS() {
    const t = Ce(RS),
        [r] = q.useState(() =>
            typeof ResizeObserver > 'u'
                ? null
                : new ResizeObserver((i) => {
                      const l = new Map()
                      ;(i.forEach((u) => {
                          const a = u.target.getAttribute('data-id')
                          l.set(a, {
                              id: a,
                              nodeElement: u.target,
                              force: !0,
                          })
                      }),
                          t(l))
                  })
        )
    return (
        q.useEffect(
            () => () => {
                r == null || r.disconnect()
            },
            [r]
        ),
        r
    )
}
function AS({ node: t, nodeType: r, hasDimensions: i, resizeObserver: l }) {
    const u = Oe(),
        a = q.useRef(null),
        c = q.useRef(null),
        d = q.useRef(t.sourcePosition),
        p = q.useRef(t.targetPosition),
        m = q.useRef(r),
        v = i && !!t.internals.handleBounds
    return (
        q.useEffect(() => {
            a.current &&
                !t.hidden &&
                (!v || c.current !== a.current) &&
                (c.current && (l == null || l.unobserve(c.current)),
                l == null || l.observe(a.current),
                (c.current = a.current))
        }, [v, t.hidden]),
        q.useEffect(
            () => () => {
                c.current &&
                    (l == null || l.unobserve(c.current), (c.current = null))
            },
            []
        ),
        q.useEffect(() => {
            if (a.current) {
                const g = m.current !== r,
                    y = d.current !== t.sourcePosition,
                    S = p.current !== t.targetPosition
                ;(g || y || S) &&
                    ((m.current = r),
                    (d.current = t.sourcePosition),
                    (p.current = t.targetPosition),
                    u.getState().updateNodeInternals(
                        new Map([
                            [
                                t.id,
                                {
                                    id: t.id,
                                    nodeElement: a.current,
                                    force: !0,
                                },
                            ],
                        ])
                    ))
            }
        }, [t.id, r, t.sourcePosition, t.targetPosition]),
        a
    )
}
function $S({
    id: t,
    onClick: r,
    onMouseEnter: i,
    onMouseMove: l,
    onMouseLeave: u,
    onContextMenu: a,
    onDoubleClick: c,
    nodesDraggable: d,
    elementsSelectable: p,
    nodesConnectable: m,
    nodesFocusable: v,
    resizeObserver: g,
    noDragClassName: y,
    noPanClassName: S,
    disableKeyboardA11y: _,
    rfId: E,
    nodeTypes: k,
    nodeClickDistance: C,
    onError: I,
}) {
    const {
        node: w,
        internals: N,
        isParent: A,
    } = Ce((J) => {
        const fe = J.nodeLookup.get(t),
            we = J.parentLookup.has(t)
        return {
            node: fe,
            internals: fe.internals,
            isParent: we,
        }
    }, $e)
    let T = w.type || 'default',
        F = (k == null ? void 0 : k[T]) || Wh[T]
    F === void 0 &&
        (I == null || I('003', qt.error003(T)),
        (T = 'default'),
        (F = (k == null ? void 0 : k.default) || Wh.default))
    const V = !!(w.draggable || (d && typeof w.draggable > 'u')),
        K = !!(w.selectable || (p && typeof w.selectable > 'u')),
        ne = !!(w.connectable || (m && typeof w.connectable > 'u')),
        U = !!(w.focusable || (v && typeof w.focusable > 'u')),
        W = Oe(),
        Z = Qp(w),
        z = AS({
            node: w,
            nodeType: T,
            hasDimensions: Z,
            resizeObserver: g,
        }),
        B = Cg({
            nodeRef: z,
            disabled: w.hidden || !V,
            noDragClassName: y,
            handleSelector: w.dragHandle,
            nodeId: t,
            isSelectable: K,
            nodeClickDistance: C,
        }),
        H = Ng()
    if (w.hidden) return null
    const b = gn(w),
        L = NS(w),
        R = K || V || r || i || l || u,
        j = i
            ? (J) =>
                  i(J, {
                      ...N.userNode,
                  })
            : void 0,
        M = l
            ? (J) =>
                  l(J, {
                      ...N.userNode,
                  })
            : void 0,
        $ = u
            ? (J) =>
                  u(J, {
                      ...N.userNode,
                  })
            : void 0,
        te = a
            ? (J) =>
                  a(J, {
                      ...N.userNode,
                  })
            : void 0,
        ee = c
            ? (J) =>
                  c(J, {
                      ...N.userNode,
                  })
            : void 0,
        le = (J) => {
            const { selectNodesOnDrag: fe, nodeDragThreshold: we } =
                W.getState()
            ;(K &&
                (!fe || !V || we > 0) &&
                Ga({
                    id: t,
                    store: W,
                    nodeRef: z,
                }),
                r &&
                    r(J, {
                        ...N.userNode,
                    }))
        },
        ue = (J) => {
            if (!(qp(J.nativeEvent) || _)) {
                if (Hp.includes(J.key) && K) {
                    const fe = J.key === 'Escape'
                    Ga({
                        id: t,
                        store: W,
                        unselect: fe,
                        nodeRef: z,
                    })
                } else if (
                    V &&
                    w.selected &&
                    Object.prototype.hasOwnProperty.call(pl, J.key)
                ) {
                    J.preventDefault()
                    const { ariaLabelConfig: fe } = W.getState()
                    ;(W.setState({
                        ariaLiveMessage: fe[
                            'node.a11yDescription.ariaLiveMessage'
                        ]({
                            direction: J.key.replace('Arrow', '').toLowerCase(),
                            x: ~~N.positionAbsolute.x,
                            y: ~~N.positionAbsolute.y,
                        }),
                    }),
                        H({
                            direction: pl[J.key],
                            factor: J.shiftKey ? 4 : 1,
                        }))
                }
            }
        },
        ce = () => {
            var Ne
            if (
                _ ||
                !((Ne = z.current) != null && Ne.matches(':focus-visible'))
            )
                return
            const {
                transform: J,
                width: fe,
                height: we,
                autoPanOnNodeFocus: _e,
                setCenter: Se,
            } = W.getState()
            if (!_e) return
            sc(
                new Map([[t, w]]),
                {
                    x: 0,
                    y: 0,
                    width: fe,
                    height: we,
                },
                J,
                !0
            ).length > 0 ||
                Se(w.position.x + b.width / 2, w.position.y + b.height / 2, {
                    zoom: J[2],
                })
        }
    return Q.jsx('div', {
        className: be([
            'react-flow__node',
            `react-flow__node-${T}`,
            {
                [S]: V,
            },
            w.className,
            {
                selected: w.selected,
                selectable: K,
                parent: A,
                draggable: V,
                dragging: B,
            },
        ]),
        ref: z,
        style: {
            zIndex: N.z,
            transform: `translate(${N.positionAbsolute.x}px,${N.positionAbsolute.y}px)`,
            pointerEvents: R ? 'all' : 'none',
            visibility: Z ? 'visible' : 'hidden',
            ...w.style,
            ...L,
        },
        'data-id': t,
        'data-testid': `rf__node-${t}`,
        onMouseEnter: j,
        onMouseMove: M,
        onMouseLeave: $,
        onContextMenu: te,
        onClick: le,
        onDoubleClick: ee,
        onKeyDown: U ? ue : void 0,
        tabIndex: U ? 0 : void 0,
        onFocus: U ? ce : void 0,
        role: w.ariaRole ?? (U ? 'group' : void 0),
        'aria-roledescription': 'node',
        'aria-describedby': _ ? void 0 : `${yg}-${E}`,
        'aria-label': w.ariaLabel,
        ...w.domAttributes,
        children: Q.jsx(vS, {
            value: t,
            children: Q.jsx(F, {
                id: t,
                data: w.data,
                type: T,
                positionAbsoluteX: N.positionAbsolute.x,
                positionAbsoluteY: N.positionAbsolute.y,
                selected: w.selected ?? !1,
                selectable: K,
                draggable: V,
                deletable: w.deletable ?? !0,
                isConnectable: ne,
                sourcePosition: w.sourcePosition,
                targetPosition: w.targetPosition,
                dragging: B,
                dragHandle: w.dragHandle,
                zIndex: N.z,
                parentId: w.parentId,
                ...b,
            }),
        }),
    })
}
var OS = q.memo($S)
const FS = (t) => ({
    nodesDraggable: t.nodesDraggable,
    nodesConnectable: t.nodesConnectable,
    nodesFocusable: t.nodesFocusable,
    elementsSelectable: t.elementsSelectable,
    onError: t.onError,
})
function zg(t) {
    const {
            nodesDraggable: r,
            nodesConnectable: i,
            nodesFocusable: l,
            elementsSelectable: u,
            onError: a,
        } = Ce(FS, $e),
        c = TS(t.onlyRenderVisibleElements),
        d = DS()
    return Q.jsx('div', {
        className: 'react-flow__nodes',
        style: Nl,
        children: c.map((p) =>
            Q.jsx(
                OS,
                {
                    id: p,
                    nodeTypes: t.nodeTypes,
                    nodeExtent: t.nodeExtent,
                    onClick: t.onNodeClick,
                    onMouseEnter: t.onNodeMouseEnter,
                    onMouseMove: t.onNodeMouseMove,
                    onMouseLeave: t.onNodeMouseLeave,
                    onContextMenu: t.onNodeContextMenu,
                    onDoubleClick: t.onNodeDoubleClick,
                    noDragClassName: t.noDragClassName,
                    noPanClassName: t.noPanClassName,
                    rfId: t.rfId,
                    disableKeyboardA11y: t.disableKeyboardA11y,
                    resizeObserver: d,
                    nodesDraggable: r,
                    nodesConnectable: i,
                    nodesFocusable: l,
                    elementsSelectable: u,
                    nodeClickDistance: t.nodeClickDistance,
                    onError: a,
                },
                p
            )
        ),
    })
}
zg.displayName = 'NodeRenderer'
const HS = q.memo(zg)
function jS(t) {
    return Ce(
        q.useCallback(
            (i) => {
                if (!t) return i.edges.map((u) => u.id)
                const l = []
                if (i.width && i.height)
                    for (const u of i.edges) {
                        const a = i.nodeLookup.get(u.source),
                            c = i.nodeLookup.get(u.target)
                        a &&
                            c &&
                            Hw({
                                sourceNode: a,
                                targetNode: c,
                                width: i.width,
                                height: i.height,
                                transform: i.transform,
                            }) &&
                            l.push(u.id)
                    }
                return l
            },
            [t]
        ),
        $e
    )
}
const VS = ({ color: t = 'none', strokeWidth: r = 1 }) => {
        const i = {
            strokeWidth: r,
            ...(t && {
                stroke: t,
            }),
        }
        return Q.jsx('polyline', {
            className: 'arrow',
            style: i,
            strokeLinecap: 'round',
            fill: 'none',
            strokeLinejoin: 'round',
            points: '-5,-4 0,0 -5,4',
        })
    },
    BS = ({ color: t = 'none', strokeWidth: r = 1 }) => {
        const i = {
            strokeWidth: r,
            ...(t && {
                stroke: t,
                fill: t,
            }),
        }
        return Q.jsx('polyline', {
            className: 'arrowclosed',
            style: i,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            points: '-5,-4 0,0 -5,4 -5,-4',
        })
    },
    bh = {
        [ro.Arrow]: VS,
        [ro.ArrowClosed]: BS,
    }
function US(t) {
    const r = Oe()
    return q.useMemo(() => {
        var u, a
        return Object.prototype.hasOwnProperty.call(bh, t)
            ? bh[t]
            : ((a = (u = r.getState()).onError) == null ||
                  a.call(u, '009', qt.error009(t)),
              null)
    }, [t])
}
const WS = ({
        id: t,
        type: r,
        color: i,
        width: l = 12.5,
        height: u = 12.5,
        markerUnits: a = 'strokeWidth',
        strokeWidth: c,
        orient: d = 'auto-start-reverse',
    }) => {
        const p = US(r)
        return p
            ? Q.jsx('marker', {
                  className: 'react-flow__arrowhead',
                  id: t,
                  markerWidth: `${l}`,
                  markerHeight: `${u}`,
                  viewBox: '-10 -10 20 20',
                  markerUnits: a,
                  orient: d,
                  refX: '0',
                  refY: '0',
                  children: Q.jsx(p, {
                      color: i,
                      strokeWidth: c,
                  }),
              })
            : null
    },
    Lg = ({ defaultColor: t, rfId: r }) => {
        const i = Ce((a) => a.edges),
            l = Ce((a) => a.defaultEdgeOptions),
            u = q.useMemo(
                () =>
                    bw(i, {
                        id: r,
                        defaultColor: t,
                        defaultMarkerStart: l == null ? void 0 : l.markerStart,
                        defaultMarkerEnd: l == null ? void 0 : l.markerEnd,
                    }),
                [i, l, r, t]
            )
        return u.length
            ? Q.jsx('svg', {
                  className: 'react-flow__marker',
                  'aria-hidden': 'true',
                  children: Q.jsx('defs', {
                      children: u.map((a) =>
                          Q.jsx(
                              WS,
                              {
                                  id: a.id,
                                  type: a.type,
                                  color: a.color,
                                  width: a.width,
                                  height: a.height,
                                  markerUnits: a.markerUnits,
                                  strokeWidth: a.strokeWidth,
                                  orient: a.orient,
                              },
                              a.id
                          )
                      ),
                  }),
              })
            : null
    }
Lg.displayName = 'MarkerDefinitions'
var YS = q.memo(Lg)
function Ig({
    x: t,
    y: r,
    label: i,
    labelStyle: l,
    labelShowBg: u = !0,
    labelBgStyle: a,
    labelBgPadding: c = [2, 4],
    labelBgBorderRadius: d = 2,
    children: p,
    className: m,
    ...v
}) {
    const [g, y] = q.useState({
            x: 1,
            y: 0,
            width: 0,
            height: 0,
        }),
        S = be(['react-flow__edge-textwrapper', m]),
        _ = q.useRef(null)
    return (
        q.useEffect(() => {
            if (_.current) {
                const E = _.current.getBBox()
                y({
                    x: E.x,
                    y: E.y,
                    width: E.width,
                    height: E.height,
                })
            }
        }, [i]),
        i
            ? Q.jsxs('g', {
                  transform: `translate(${t - g.width / 2} ${r - g.height / 2})`,
                  className: S,
                  visibility: g.width ? 'visible' : 'hidden',
                  ...v,
                  children: [
                      u &&
                          Q.jsx('rect', {
                              width: g.width + 2 * c[0],
                              x: -c[0],
                              y: -c[1],
                              height: g.height + 2 * c[1],
                              className: 'react-flow__edge-textbg',
                              style: a,
                              rx: d,
                              ry: d,
                          }),
                      Q.jsx('text', {
                          className: 'react-flow__edge-text',
                          y: g.height / 2,
                          dy: '0.3em',
                          ref: _,
                          style: l,
                          children: i,
                      }),
                      p,
                  ],
              })
            : null
    )
}
Ig.displayName = 'EdgeText'
const bS = q.memo(Ig)
function ki({
    path: t,
    labelX: r,
    labelY: i,
    label: l,
    labelStyle: u,
    labelShowBg: a,
    labelBgStyle: c,
    labelBgPadding: d,
    labelBgBorderRadius: p,
    interactionWidth: m = 20,
    ...v
}) {
    return Q.jsxs(Q.Fragment, {
        children: [
            Q.jsx('path', {
                ...v,
                d: t,
                fill: 'none',
                className: be(['react-flow__edge-path', v.className]),
            }),
            m
                ? Q.jsx('path', {
                      d: t,
                      fill: 'none',
                      strokeOpacity: 0,
                      strokeWidth: m,
                      className: 'react-flow__edge-interaction',
                  })
                : null,
            l && Ht(r) && Ht(i)
                ? Q.jsx(bS, {
                      x: r,
                      y: i,
                      label: l,
                      labelStyle: u,
                      labelShowBg: a,
                      labelBgStyle: c,
                      labelBgPadding: d,
                      labelBgBorderRadius: p,
                  })
                : null,
        ],
    })
}
function Xh({ pos: t, x1: r, y1: i, x2: l, y2: u }) {
    return t === ae.Left || t === ae.Right
        ? [0.5 * (r + l), i]
        : [r, 0.5 * (i + u)]
}
function Tg({
    sourceX: t,
    sourceY: r,
    sourcePosition: i = ae.Bottom,
    targetX: l,
    targetY: u,
    targetPosition: a = ae.Top,
}) {
    const [c, d] = Xh({
            pos: i,
            x1: t,
            y1: r,
            x2: l,
            y2: u,
        }),
        [p, m] = Xh({
            pos: a,
            x1: l,
            y1: u,
            x2: t,
            y2: r,
        }),
        [v, g, y, S] = Jp({
            sourceX: t,
            sourceY: r,
            targetX: l,
            targetY: u,
            sourceControlX: c,
            sourceControlY: d,
            targetControlX: p,
            targetControlY: m,
        })
    return [`M${t},${r} C${c},${d} ${p},${m} ${l},${u}`, v, g, y, S]
}
function Rg(t) {
    return q.memo(
        ({
            id: r,
            sourceX: i,
            sourceY: l,
            targetX: u,
            targetY: a,
            sourcePosition: c,
            targetPosition: d,
            label: p,
            labelStyle: m,
            labelShowBg: v,
            labelBgStyle: g,
            labelBgPadding: y,
            labelBgBorderRadius: S,
            style: _,
            markerEnd: E,
            markerStart: k,
            interactionWidth: C,
        }) => {
            const [I, w, N] = Tg({
                    sourceX: i,
                    sourceY: l,
                    sourcePosition: c,
                    targetX: u,
                    targetY: a,
                    targetPosition: d,
                }),
                A = t.isInternal ? void 0 : r
            return Q.jsx(ki, {
                id: A,
                path: I,
                labelX: w,
                labelY: N,
                label: p,
                labelStyle: m,
                labelShowBg: v,
                labelBgStyle: g,
                labelBgPadding: y,
                labelBgBorderRadius: S,
                style: _,
                markerEnd: E,
                markerStart: k,
                interactionWidth: C,
            })
        }
    )
}
const XS = Rg({
        isInternal: !1,
    }),
    Dg = Rg({
        isInternal: !0,
    })
XS.displayName = 'SimpleBezierEdge'
Dg.displayName = 'SimpleBezierEdgeInternal'
function Ag(t) {
    return q.memo(
        ({
            id: r,
            sourceX: i,
            sourceY: l,
            targetX: u,
            targetY: a,
            label: c,
            labelStyle: d,
            labelShowBg: p,
            labelBgStyle: m,
            labelBgPadding: v,
            labelBgBorderRadius: g,
            style: y,
            sourcePosition: S = ae.Bottom,
            targetPosition: _ = ae.Top,
            markerEnd: E,
            markerStart: k,
            pathOptions: C,
            interactionWidth: I,
        }) => {
            const [w, N, A] = ba({
                    sourceX: i,
                    sourceY: l,
                    sourcePosition: S,
                    targetX: u,
                    targetY: a,
                    targetPosition: _,
                    borderRadius: C == null ? void 0 : C.borderRadius,
                    offset: C == null ? void 0 : C.offset,
                    stepPosition: C == null ? void 0 : C.stepPosition,
                }),
                T = t.isInternal ? void 0 : r
            return Q.jsx(ki, {
                id: T,
                path: w,
                labelX: N,
                labelY: A,
                label: c,
                labelStyle: d,
                labelShowBg: p,
                labelBgStyle: m,
                labelBgPadding: v,
                labelBgBorderRadius: g,
                style: y,
                markerEnd: E,
                markerStart: k,
                interactionWidth: I,
            })
        }
    )
}
const $g = Ag({
        isInternal: !1,
    }),
    Og = Ag({
        isInternal: !0,
    })
$g.displayName = 'SmoothStepEdge'
Og.displayName = 'SmoothStepEdgeInternal'
function Fg(t) {
    return q.memo(({ id: r, ...i }) => {
        var u
        const l = t.isInternal ? void 0 : r
        return Q.jsx($g, {
            ...i,
            id: l,
            pathOptions: q.useMemo(() => {
                var a
                return {
                    borderRadius: 0,
                    offset: (a = i.pathOptions) == null ? void 0 : a.offset,
                }
            }, [(u = i.pathOptions) == null ? void 0 : u.offset]),
        })
    })
}
const QS = Fg({
        isInternal: !1,
    }),
    Hg = Fg({
        isInternal: !0,
    })
QS.displayName = 'StepEdge'
Hg.displayName = 'StepEdgeInternal'
function jg(t) {
    return q.memo(
        ({
            id: r,
            sourceX: i,
            sourceY: l,
            targetX: u,
            targetY: a,
            label: c,
            labelStyle: d,
            labelShowBg: p,
            labelBgStyle: m,
            labelBgPadding: v,
            labelBgBorderRadius: g,
            style: y,
            markerEnd: S,
            markerStart: _,
            interactionWidth: E,
        }) => {
            const [k, C, I] = rg({
                    sourceX: i,
                    sourceY: l,
                    targetX: u,
                    targetY: a,
                }),
                w = t.isInternal ? void 0 : r
            return Q.jsx(ki, {
                id: w,
                path: k,
                labelX: C,
                labelY: I,
                label: c,
                labelStyle: d,
                labelShowBg: p,
                labelBgStyle: m,
                labelBgPadding: v,
                labelBgBorderRadius: g,
                style: y,
                markerEnd: S,
                markerStart: _,
                interactionWidth: E,
            })
        }
    )
}
const KS = jg({
        isInternal: !1,
    }),
    Vg = jg({
        isInternal: !0,
    })
KS.displayName = 'StraightEdge'
Vg.displayName = 'StraightEdgeInternal'
function Bg(t) {
    return q.memo(
        ({
            id: r,
            sourceX: i,
            sourceY: l,
            targetX: u,
            targetY: a,
            sourcePosition: c = ae.Bottom,
            targetPosition: d = ae.Top,
            label: p,
            labelStyle: m,
            labelShowBg: v,
            labelBgStyle: g,
            labelBgPadding: y,
            labelBgBorderRadius: S,
            style: _,
            markerEnd: E,
            markerStart: k,
            pathOptions: C,
            interactionWidth: I,
        }) => {
            const [w, N, A] = eg({
                    sourceX: i,
                    sourceY: l,
                    sourcePosition: c,
                    targetX: u,
                    targetY: a,
                    targetPosition: d,
                    curvature: C == null ? void 0 : C.curvature,
                }),
                T = t.isInternal ? void 0 : r
            return Q.jsx(ki, {
                id: T,
                path: w,
                labelX: N,
                labelY: A,
                label: p,
                labelStyle: m,
                labelShowBg: v,
                labelBgStyle: g,
                labelBgPadding: y,
                labelBgBorderRadius: S,
                style: _,
                markerEnd: E,
                markerStart: k,
                interactionWidth: I,
            })
        }
    )
}
const GS = Bg({
        isInternal: !1,
    }),
    Ug = Bg({
        isInternal: !0,
    })
GS.displayName = 'BezierEdge'
Ug.displayName = 'BezierEdgeInternal'
const Qh = {
        default: Ug,
        straight: Vg,
        step: Hg,
        smoothstep: Og,
        simplebezier: Dg,
    },
    Kh = {
        sourceX: null,
        sourceY: null,
        targetX: null,
        targetY: null,
        sourcePosition: null,
        targetPosition: null,
    },
    qS = (t, r, i) => (i === ae.Left ? t - r : i === ae.Right ? t + r : t),
    ZS = (t, r, i) => (i === ae.Top ? t - r : i === ae.Bottom ? t + r : t),
    Gh = 'react-flow__edgeupdater'
function qh({
    position: t,
    centerX: r,
    centerY: i,
    radius: l = 10,
    onMouseDown: u,
    onMouseEnter: a,
    onMouseOut: c,
    type: d,
}) {
    return Q.jsx('circle', {
        onMouseDown: u,
        onMouseEnter: a,
        onMouseOut: c,
        className: be([Gh, `${Gh}-${d}`]),
        cx: qS(r, l, t),
        cy: ZS(i, l, t),
        r: l,
        stroke: 'transparent',
        fill: 'transparent',
    })
}
function JS({
    isReconnectable: t,
    reconnectRadius: r,
    edge: i,
    sourceX: l,
    sourceY: u,
    targetX: a,
    targetY: c,
    sourcePosition: d,
    targetPosition: p,
    onReconnect: m,
    onReconnectStart: v,
    onReconnectEnd: g,
    setReconnecting: y,
    setUpdateHover: S,
}) {
    const _ = Oe(),
        E = (N, A) => {
            if (N.button !== 0) return
            const {
                    autoPanOnConnect: T,
                    domNode: F,
                    isValidConnection: V,
                    connectionMode: K,
                    connectionRadius: ne,
                    lib: U,
                    onConnectStart: W,
                    onConnectEnd: Z,
                    cancelConnection: z,
                    nodeLookup: B,
                    rfId: H,
                    panBy: b,
                    updateConnection: L,
                } = _.getState(),
                R = A.type === 'target',
                j = (te, ee) => {
                    ;(y(!1), g == null || g(te, i, A.type, ee))
                },
                M = (te) => (m == null ? void 0 : m(i, te)),
                $ = (te, ee) => {
                    ;(y(!0),
                        v == null || v(N, i, A.type),
                        W == null || W(te, ee))
                }
            Ka.onPointerDown(N.nativeEvent, {
                autoPanOnConnect: T,
                connectionMode: K,
                connectionRadius: ne,
                domNode: F,
                handleId: A.id,
                nodeId: A.nodeId,
                nodeLookup: B,
                isTarget: R,
                edgeUpdaterType: A.type,
                lib: U,
                flowId: H,
                cancelConnection: z,
                panBy: b,
                isValidConnection: V,
                onConnect: M,
                onConnectStart: $,
                onConnectEnd: Z,
                onReconnectEnd: j,
                updateConnection: L,
                getTransform: () => _.getState().transform,
                getFromHandle: () => _.getState().connection.fromHandle,
                dragThreshold: _.getState().connectionDragThreshold,
                handleDomNode: N.currentTarget,
            })
        },
        k = (N) =>
            E(N, {
                nodeId: i.target,
                id: i.targetHandle ?? null,
                type: 'target',
            }),
        C = (N) =>
            E(N, {
                nodeId: i.source,
                id: i.sourceHandle ?? null,
                type: 'source',
            }),
        I = () => S(!0),
        w = () => S(!1)
    return Q.jsxs(Q.Fragment, {
        children: [
            (t === !0 || t === 'source') &&
                Q.jsx(qh, {
                    position: d,
                    centerX: l,
                    centerY: u,
                    radius: r,
                    onMouseDown: k,
                    onMouseEnter: I,
                    onMouseOut: w,
                    type: 'source',
                }),
            (t === !0 || t === 'target') &&
                Q.jsx(qh, {
                    position: p,
                    centerX: a,
                    centerY: c,
                    radius: r,
                    onMouseDown: C,
                    onMouseEnter: I,
                    onMouseOut: w,
                    type: 'target',
                }),
        ],
    })
}
function e_({
    id: t,
    edgesFocusable: r,
    edgesReconnectable: i,
    elementsSelectable: l,
    onClick: u,
    onDoubleClick: a,
    onContextMenu: c,
    onMouseEnter: d,
    onMouseMove: p,
    onMouseLeave: m,
    reconnectRadius: v,
    onReconnect: g,
    onReconnectStart: y,
    onReconnectEnd: S,
    rfId: _,
    edgeTypes: E,
    noPanClassName: k,
    onError: C,
    disableKeyboardA11y: I,
}) {
    let w = Ce((Se) => Se.edgeLookup.get(t))
    const N = Ce((Se) => Se.defaultEdgeOptions)
    w = N
        ? {
              ...N,
              ...w,
          }
        : w
    let A = w.type || 'default',
        T = (E == null ? void 0 : E[A]) || Qh[A]
    T === void 0 &&
        (C == null || C('011', qt.error011(A)),
        (A = 'default'),
        (T = (E == null ? void 0 : E.default) || Qh.default))
    const F = !!(w.focusable || (r && typeof w.focusable > 'u')),
        V =
            typeof g < 'u' &&
            (w.reconnectable || (i && typeof w.reconnectable > 'u')),
        K = !!(w.selectable || (l && typeof w.selectable > 'u')),
        ne = q.useRef(null),
        [U, W] = q.useState(!1),
        [Z, z] = q.useState(!1),
        B = Oe(),
        {
            zIndex: H,
            sourceX: b,
            sourceY: L,
            targetX: R,
            targetY: j,
            sourcePosition: M,
            targetPosition: $,
        } = Ce(
            q.useCallback(
                (Se) => {
                    const ye = Se.nodeLookup.get(w.source),
                        Ne = Se.nodeLookup.get(w.target)
                    if (!ye || !Ne)
                        return {
                            zIndex: w.zIndex,
                            ...Kh,
                        }
                    const Ie = Yw({
                        id: t,
                        sourceNode: ye,
                        targetNode: Ne,
                        sourceHandle: w.sourceHandle || null,
                        targetHandle: w.targetHandle || null,
                        connectionMode: Se.connectionMode,
                        onError: C,
                    })
                    return {
                        zIndex: Fw({
                            selected: w.selected,
                            zIndex: w.zIndex,
                            sourceNode: ye,
                            targetNode: Ne,
                            elevateOnSelect: Se.elevateEdgesOnSelect,
                            zIndexMode: Se.zIndexMode,
                        }),
                        ...(Ie || Kh),
                    }
                },
                [
                    w.source,
                    w.target,
                    w.sourceHandle,
                    w.targetHandle,
                    w.selected,
                    w.zIndex,
                ]
            ),
            $e
        ),
        te = q.useMemo(
            () => (w.markerStart ? `url('#${Xa(w.markerStart, _)}')` : void 0),
            [w.markerStart, _]
        ),
        ee = q.useMemo(
            () => (w.markerEnd ? `url('#${Xa(w.markerEnd, _)}')` : void 0),
            [w.markerEnd, _]
        )
    if (w.hidden || b === null || L === null || R === null || j === null)
        return null
    const le = (Se) => {
            var Me
            const {
                addSelectedEdges: ye,
                unselectNodesAndEdges: Ne,
                multiSelectionActive: Ie,
            } = B.getState()
            ;(K &&
                (B.setState({
                    nodesSelectionActive: !1,
                }),
                w.selected && Ie
                    ? (Ne({
                          nodes: [],
                          edges: [w],
                      }),
                      (Me = ne.current) == null || Me.blur())
                    : ye([t])),
                u && u(Se, w))
        },
        ue = a
            ? (Se) => {
                  a(Se, {
                      ...w,
                  })
              }
            : void 0,
        ce = c
            ? (Se) => {
                  c(Se, {
                      ...w,
                  })
              }
            : void 0,
        J = d
            ? (Se) => {
                  d(Se, {
                      ...w,
                  })
              }
            : void 0,
        fe = p
            ? (Se) => {
                  p(Se, {
                      ...w,
                  })
              }
            : void 0,
        we = m
            ? (Se) => {
                  m(Se, {
                      ...w,
                  })
              }
            : void 0,
        _e = (Se) => {
            var ye
            if (!I && Hp.includes(Se.key) && K) {
                const { unselectNodesAndEdges: Ne, addSelectedEdges: Ie } =
                    B.getState()
                Se.key === 'Escape'
                    ? ((ye = ne.current) == null || ye.blur(),
                      Ne({
                          edges: [w],
                      }))
                    : Ie([t])
            }
        }
    return Q.jsx('svg', {
        style: {
            zIndex: H,
        },
        children: Q.jsxs('g', {
            className: be([
                'react-flow__edge',
                `react-flow__edge-${A}`,
                w.className,
                k,
                {
                    selected: w.selected,
                    animated: w.animated,
                    inactive: !K && !u,
                    updating: U,
                    selectable: K,
                },
            ]),
            onClick: le,
            onDoubleClick: ue,
            onContextMenu: ce,
            onMouseEnter: J,
            onMouseMove: fe,
            onMouseLeave: we,
            onKeyDown: F ? _e : void 0,
            tabIndex: F ? 0 : void 0,
            role: w.ariaRole ?? (F ? 'group' : 'img'),
            'aria-roledescription': 'edge',
            'data-id': t,
            'data-testid': `rf__edge-${t}`,
            'aria-label':
                w.ariaLabel === null
                    ? void 0
                    : w.ariaLabel || `Edge from ${w.source} to ${w.target}`,
            'aria-describedby': F ? `${vg}-${_}` : void 0,
            ref: ne,
            ...w.domAttributes,
            children: [
                !Z &&
                    Q.jsx(T, {
                        id: t,
                        source: w.source,
                        target: w.target,
                        type: w.type,
                        selected: w.selected,
                        animated: w.animated,
                        selectable: K,
                        deletable: w.deletable ?? !0,
                        label: w.label,
                        labelStyle: w.labelStyle,
                        labelShowBg: w.labelShowBg,
                        labelBgStyle: w.labelBgStyle,
                        labelBgPadding: w.labelBgPadding,
                        labelBgBorderRadius: w.labelBgBorderRadius,
                        sourceX: b,
                        sourceY: L,
                        targetX: R,
                        targetY: j,
                        sourcePosition: M,
                        targetPosition: $,
                        data: w.data,
                        style: w.style,
                        sourceHandleId: w.sourceHandle,
                        targetHandleId: w.targetHandle,
                        markerStart: te,
                        markerEnd: ee,
                        pathOptions:
                            'pathOptions' in w ? w.pathOptions : void 0,
                        interactionWidth: w.interactionWidth,
                    }),
                V &&
                    Q.jsx(JS, {
                        edge: w,
                        isReconnectable: V,
                        reconnectRadius: v,
                        onReconnect: g,
                        onReconnectStart: y,
                        onReconnectEnd: S,
                        sourceX: b,
                        sourceY: L,
                        targetX: R,
                        targetY: j,
                        sourcePosition: M,
                        targetPosition: $,
                        setUpdateHover: W,
                        setReconnecting: z,
                    }),
            ],
        }),
    })
}
var t_ = q.memo(e_)
const n_ = (t) => ({
    edgesFocusable: t.edgesFocusable,
    edgesReconnectable: t.edgesReconnectable,
    elementsSelectable: t.elementsSelectable,
    connectionMode: t.connectionMode,
    onError: t.onError,
})
function Wg({
    defaultMarkerColor: t,
    onlyRenderVisibleElements: r,
    rfId: i,
    edgeTypes: l,
    noPanClassName: u,
    onReconnect: a,
    onEdgeContextMenu: c,
    onEdgeMouseEnter: d,
    onEdgeMouseMove: p,
    onEdgeMouseLeave: m,
    onEdgeClick: v,
    reconnectRadius: g,
    onEdgeDoubleClick: y,
    onReconnectStart: S,
    onReconnectEnd: _,
    disableKeyboardA11y: E,
}) {
    const {
            edgesFocusable: k,
            edgesReconnectable: C,
            elementsSelectable: I,
            onError: w,
        } = Ce(n_, $e),
        N = jS(r)
    return Q.jsxs('div', {
        className: 'react-flow__edges',
        children: [
            Q.jsx(YS, {
                defaultColor: t,
                rfId: i,
            }),
            N.map((A) =>
                Q.jsx(
                    t_,
                    {
                        id: A,
                        edgesFocusable: k,
                        edgesReconnectable: C,
                        elementsSelectable: I,
                        noPanClassName: u,
                        onReconnect: a,
                        onContextMenu: c,
                        onMouseEnter: d,
                        onMouseMove: p,
                        onMouseLeave: m,
                        onClick: v,
                        reconnectRadius: g,
                        onDoubleClick: y,
                        onReconnectStart: S,
                        onReconnectEnd: _,
                        rfId: i,
                        onError: w,
                        edgeTypes: l,
                        disableKeyboardA11y: E,
                    },
                    A
                )
            ),
        ],
    })
}
Wg.displayName = 'EdgeRenderer'
const r_ = q.memo(Wg),
    o_ = (t) =>
        `translate(${t.transform[0]}px,${t.transform[1]}px) scale(${t.transform[2]})`
function i_({ children: t }) {
    const r = Ce(o_)
    return Q.jsx('div', {
        className:
            'react-flow__viewport xyflow__viewport react-flow__container',
        style: {
            transform: r,
        },
        children: t,
    })
}
function s_(t) {
    const r = uo(),
        i = q.useRef(!1)
    q.useEffect(() => {
        !i.current &&
            r.viewportInitialized &&
            t &&
            (setTimeout(() => t(r), 1), (i.current = !0))
    }, [t, r.viewportInitialized])
}
const l_ = (t) => {
    var r
    return (r = t.panZoom) == null ? void 0 : r.syncViewport
}
function u_(t) {
    const r = Ce(l_),
        i = Oe()
    return (
        q.useEffect(() => {
            t &&
                (r == null || r(t),
                i.setState({
                    transform: [t.x, t.y, t.zoom],
                }))
        }, [t, r]),
        null
    )
}
function a_(t) {
    return t.connection.inProgress
        ? {
              ...t.connection,
              to: _i(t.connection.to, t.transform),
          }
        : {
              ...t.connection,
          }
}
function c_(t) {
    return a_
}
function f_(t) {
    const r = c_()
    return Ce(r, $e)
}
const d_ = (t) => ({
    nodesConnectable: t.nodesConnectable,
    isValid: t.connection.isValid,
    inProgress: t.connection.inProgress,
    width: t.width,
    height: t.height,
})
function h_({ containerStyle: t, style: r, type: i, component: l }) {
    const {
        nodesConnectable: u,
        width: a,
        height: c,
        isValid: d,
        inProgress: p,
    } = Ce(d_, $e)
    return !(a && u && p)
        ? null
        : Q.jsx('svg', {
              style: t,
              width: a,
              height: c,
              className: 'react-flow__connectionline react-flow__container',
              children: Q.jsx('g', {
                  className: be(['react-flow__connection', Bp(d)]),
                  children: Q.jsx(Yg, {
                      style: r,
                      type: i,
                      CustomComponent: l,
                      isValid: d,
                  }),
              }),
          })
}
const Yg = ({
    style: t,
    type: r = jn.Bezier,
    CustomComponent: i,
    isValid: l,
}) => {
    const {
        inProgress: u,
        from: a,
        fromNode: c,
        fromHandle: d,
        fromPosition: p,
        to: m,
        toNode: v,
        toHandle: g,
        toPosition: y,
        pointer: S,
    } = f_()
    if (!u) return
    if (i)
        return Q.jsx(i, {
            connectionLineType: r,
            connectionLineStyle: t,
            fromNode: c,
            fromHandle: d,
            fromX: a.x,
            fromY: a.y,
            toX: m.x,
            toY: m.y,
            fromPosition: p,
            toPosition: y,
            connectionStatus: Bp(l),
            toNode: v,
            toHandle: g,
            pointer: S,
        })
    let _ = ''
    const E = {
        sourceX: a.x,
        sourceY: a.y,
        sourcePosition: p,
        targetX: m.x,
        targetY: m.y,
        targetPosition: y,
    }
    switch (r) {
        case jn.Bezier:
            ;[_] = eg(E)
            break
        case jn.SimpleBezier:
            ;[_] = Tg(E)
            break
        case jn.Step:
            ;[_] = ba({
                ...E,
                borderRadius: 0,
            })
            break
        case jn.SmoothStep:
            ;[_] = ba(E)
            break
        default:
            ;[_] = rg(E)
    }
    return Q.jsx('path', {
        d: _,
        fill: 'none',
        className: 'react-flow__connection-path',
        style: t,
    })
}
Yg.displayName = 'ConnectionLine'
const p_ = {}
function Zh(t = p_) {
    ;(q.useRef(t), Oe(), q.useEffect(() => {}, [t]))
}
function g_() {
    ;(Oe(), q.useRef(!1), q.useEffect(() => {}, []))
}
function bg({
    nodeTypes: t,
    edgeTypes: r,
    onInit: i,
    onNodeClick: l,
    onEdgeClick: u,
    onNodeDoubleClick: a,
    onEdgeDoubleClick: c,
    onNodeMouseEnter: d,
    onNodeMouseMove: p,
    onNodeMouseLeave: m,
    onNodeContextMenu: v,
    onSelectionContextMenu: g,
    onSelectionStart: y,
    onSelectionEnd: S,
    connectionLineType: _,
    connectionLineStyle: E,
    connectionLineComponent: k,
    connectionLineContainerStyle: C,
    selectionKeyCode: I,
    selectionOnDrag: w,
    selectionMode: N,
    multiSelectionKeyCode: A,
    panActivationKeyCode: T,
    zoomActivationKeyCode: F,
    deleteKeyCode: V,
    onlyRenderVisibleElements: K,
    elementsSelectable: ne,
    defaultViewport: U,
    translateExtent: W,
    minZoom: Z,
    maxZoom: z,
    preventScrolling: B,
    defaultMarkerColor: H,
    zoomOnScroll: b,
    zoomOnPinch: L,
    panOnScroll: R,
    panOnScrollSpeed: j,
    panOnScrollMode: M,
    zoomOnDoubleClick: $,
    panOnDrag: te,
    onPaneClick: ee,
    onPaneMouseEnter: le,
    onPaneMouseMove: ue,
    onPaneMouseLeave: ce,
    onPaneScroll: J,
    onPaneContextMenu: fe,
    paneClickDistance: we,
    nodeClickDistance: _e,
    onEdgeContextMenu: Se,
    onEdgeMouseEnter: ye,
    onEdgeMouseMove: Ne,
    onEdgeMouseLeave: Ie,
    reconnectRadius: Me,
    onReconnect: Ue,
    onReconnectStart: Lt,
    onReconnectEnd: ht,
    noDragClassName: pt,
    noWheelClassName: _t,
    noPanClassName: Jt,
    disableKeyboardA11y: mn,
    nodeExtent: vr,
    rfId: Un,
    viewport: en,
    onViewportChange: tn,
}) {
    return (
        Zh(t),
        Zh(r),
        g_(),
        s_(i),
        u_(en),
        Q.jsx(LS, {
            onPaneClick: ee,
            onPaneMouseEnter: le,
            onPaneMouseMove: ue,
            onPaneMouseLeave: ce,
            onPaneContextMenu: fe,
            onPaneScroll: J,
            paneClickDistance: we,
            deleteKeyCode: V,
            selectionKeyCode: I,
            selectionOnDrag: w,
            selectionMode: N,
            onSelectionStart: y,
            onSelectionEnd: S,
            multiSelectionKeyCode: A,
            panActivationKeyCode: T,
            zoomActivationKeyCode: F,
            elementsSelectable: ne,
            zoomOnScroll: b,
            zoomOnPinch: L,
            zoomOnDoubleClick: $,
            panOnScroll: R,
            panOnScrollSpeed: j,
            panOnScrollMode: M,
            panOnDrag: te,
            defaultViewport: U,
            translateExtent: W,
            minZoom: Z,
            maxZoom: z,
            onSelectionContextMenu: g,
            preventScrolling: B,
            noDragClassName: pt,
            noWheelClassName: _t,
            noPanClassName: Jt,
            disableKeyboardA11y: mn,
            onViewportChange: tn,
            isControlledViewport: !!en,
            children: Q.jsxs(i_, {
                children: [
                    Q.jsx(r_, {
                        edgeTypes: r,
                        onEdgeClick: u,
                        onEdgeDoubleClick: c,
                        onReconnect: Ue,
                        onReconnectStart: Lt,
                        onReconnectEnd: ht,
                        onlyRenderVisibleElements: K,
                        onEdgeContextMenu: Se,
                        onEdgeMouseEnter: ye,
                        onEdgeMouseMove: Ne,
                        onEdgeMouseLeave: Ie,
                        reconnectRadius: Me,
                        defaultMarkerColor: H,
                        noPanClassName: Jt,
                        disableKeyboardA11y: mn,
                        rfId: Un,
                    }),
                    Q.jsx(h_, {
                        style: E,
                        type: _,
                        component: k,
                        containerStyle: C,
                    }),
                    Q.jsx('div', {
                        className: 'react-flow__edgelabel-renderer',
                    }),
                    Q.jsx(HS, {
                        nodeTypes: t,
                        onNodeClick: l,
                        onNodeDoubleClick: a,
                        onNodeMouseEnter: d,
                        onNodeMouseMove: p,
                        onNodeMouseLeave: m,
                        onNodeContextMenu: v,
                        nodeClickDistance: _e,
                        onlyRenderVisibleElements: K,
                        noPanClassName: Jt,
                        noDragClassName: pt,
                        disableKeyboardA11y: mn,
                        nodeExtent: vr,
                        rfId: Un,
                    }),
                    Q.jsx('div', {
                        className: 'react-flow__viewport-portal',
                    }),
                ],
            }),
        })
    )
}
bg.displayName = 'GraphView'
const m_ = q.memo(bg),
    Jh = ({
        nodes: t,
        edges: r,
        defaultNodes: i,
        defaultEdges: l,
        width: u,
        height: a,
        fitView: c,
        fitViewOptions: d,
        minZoom: p = 0.5,
        maxZoom: m = 2,
        nodeOrigin: v,
        nodeExtent: g,
        zIndexMode: y = 'basic',
    } = {}) => {
        const S = new Map(),
            _ = new Map(),
            E = new Map(),
            k = new Map(),
            C = l ?? r ?? [],
            I = i ?? t ?? [],
            w = v ?? [0, 0],
            N = g ?? fi
        sg(E, k, C)
        const A = Qa(I, S, _, {
            nodeOrigin: w,
            nodeExtent: N,
            zIndexMode: y,
        })
        let T = [0, 0, 1]
        if (c && u && a) {
            const F = wi(S, {
                    filter: (U) =>
                        !!(
                            (U.width || U.initialWidth) &&
                            (U.height || U.initialHeight)
                        ),
                }),
                {
                    x: V,
                    y: K,
                    zoom: ne,
                } = lc(F, u, a, p, m, (d == null ? void 0 : d.padding) ?? 0.1)
            T = [V, K, ne]
        }
        return {
            rfId: '1',
            width: u ?? 0,
            height: a ?? 0,
            transform: T,
            nodes: I,
            nodesInitialized: A,
            nodeLookup: S,
            parentLookup: _,
            edges: C,
            edgeLookup: k,
            connectionLookup: E,
            onNodesChange: null,
            onEdgesChange: null,
            hasDefaultNodes: i !== void 0,
            hasDefaultEdges: l !== void 0,
            panZoom: null,
            minZoom: p,
            maxZoom: m,
            translateExtent: fi,
            nodeExtent: N,
            nodesSelectionActive: !1,
            userSelectionActive: !1,
            userSelectionRect: null,
            connectionMode: gr.Strict,
            domNode: null,
            paneDragging: !1,
            noPanClassName: 'nopan',
            nodeOrigin: w,
            nodeDragThreshold: 1,
            connectionDragThreshold: 1,
            snapGrid: [15, 15],
            snapToGrid: !1,
            nodesDraggable: !0,
            nodesConnectable: !0,
            nodesFocusable: !0,
            edgesFocusable: !0,
            edgesReconnectable: !0,
            elementsSelectable: !0,
            elevateNodesOnSelect: !0,
            elevateEdgesOnSelect: !0,
            selectNodesOnDrag: !0,
            multiSelectionActive: !1,
            fitViewQueued: c ?? !1,
            fitViewOptions: d,
            fitViewResolver: null,
            connection: {
                ...Vp,
            },
            connectionClickStartHandle: null,
            connectOnClick: !0,
            ariaLiveMessage: '',
            autoPanOnConnect: !0,
            autoPanOnNodeDrag: !0,
            autoPanOnNodeFocus: !0,
            autoPanSpeed: 15,
            connectionRadius: 20,
            onError: Tw,
            isValidConnection: void 0,
            onSelectionChangeHandlers: [],
            lib: 'react',
            debug: !1,
            ariaLabelConfig: jp,
            zIndexMode: y,
            onNodesChangeMiddlewareMap: new Map(),
            onEdgesChangeMiddlewareMap: new Map(),
        }
    },
    y_ = ({
        nodes: t,
        edges: r,
        defaultNodes: i,
        defaultEdges: l,
        width: u,
        height: a,
        fitView: c,
        fitViewOptions: d,
        minZoom: p,
        maxZoom: m,
        nodeOrigin: v,
        nodeExtent: g,
        zIndexMode: y,
    }) =>
        A1((S, _) => {
            async function E() {
                const {
                    nodeLookup: k,
                    panZoom: C,
                    fitViewOptions: I,
                    fitViewResolver: w,
                    width: N,
                    height: A,
                    minZoom: T,
                    maxZoom: F,
                } = _()
                C &&
                    (await Lw(
                        {
                            nodes: k,
                            width: N,
                            height: A,
                            panZoom: C,
                            minZoom: T,
                            maxZoom: F,
                        },
                        I
                    ),
                    w == null || w.resolve(!0),
                    S({
                        fitViewResolver: null,
                    }))
            }
            return {
                ...Jh({
                    nodes: t,
                    edges: r,
                    width: u,
                    height: a,
                    fitView: c,
                    fitViewOptions: d,
                    minZoom: p,
                    maxZoom: m,
                    nodeOrigin: v,
                    nodeExtent: g,
                    defaultNodes: i,
                    defaultEdges: l,
                    zIndexMode: y,
                }),
                setNodes: (k) => {
                    const {
                            nodeLookup: C,
                            parentLookup: I,
                            nodeOrigin: w,
                            elevateNodesOnSelect: N,
                            fitViewQueued: A,
                            zIndexMode: T,
                        } = _(),
                        F = Qa(k, C, I, {
                            nodeOrigin: w,
                            nodeExtent: g,
                            elevateNodesOnSelect: N,
                            checkEquality: !0,
                            zIndexMode: T,
                        })
                    A && F
                        ? (E(),
                          S({
                              nodes: k,
                              nodesInitialized: F,
                              fitViewQueued: !1,
                              fitViewOptions: void 0,
                          }))
                        : S({
                              nodes: k,
                              nodesInitialized: F,
                          })
                },
                setEdges: (k) => {
                    const { connectionLookup: C, edgeLookup: I } = _()
                    ;(sg(C, I, k),
                        S({
                            edges: k,
                        }))
                },
                setDefaultNodesAndEdges: (k, C) => {
                    if (k) {
                        const { setNodes: I } = _()
                        ;(I(k),
                            S({
                                hasDefaultNodes: !0,
                            }))
                    }
                    if (C) {
                        const { setEdges: I } = _()
                        ;(I(C),
                            S({
                                hasDefaultEdges: !0,
                            }))
                    }
                },
                updateNodeInternals: (k) => {
                    const {
                            triggerNodeChanges: C,
                            nodeLookup: I,
                            parentLookup: w,
                            domNode: N,
                            nodeOrigin: A,
                            nodeExtent: T,
                            debug: F,
                            fitViewQueued: V,
                            zIndexMode: K,
                        } = _(),
                        { changes: ne, updatedInternals: U } = Jw(
                            k,
                            I,
                            w,
                            N,
                            A,
                            T,
                            K
                        )
                    U &&
                        (Kw(I, w, {
                            nodeOrigin: A,
                            nodeExtent: T,
                            zIndexMode: K,
                        }),
                        V
                            ? (E(),
                              S({
                                  fitViewQueued: !1,
                                  fitViewOptions: void 0,
                              }))
                            : S({}),
                        (ne == null ? void 0 : ne.length) > 0 &&
                            (F &&
                                console.log(
                                    'React Flow: trigger node changes',
                                    ne
                                ),
                            C == null || C(ne)))
                },
                updateNodePositions: (k, C = !1) => {
                    const I = []
                    let w = []
                    const {
                        nodeLookup: N,
                        triggerNodeChanges: A,
                        connection: T,
                        updateConnection: F,
                        onNodesChangeMiddlewareMap: V,
                    } = _()
                    for (const [K, ne] of k) {
                        const U = N.get(K),
                            W = !!(
                                U != null &&
                                U.expandParent &&
                                U != null &&
                                U.parentId &&
                                ne != null &&
                                ne.position
                            ),
                            Z = {
                                id: K,
                                type: 'position',
                                position: W
                                    ? {
                                          x: Math.max(0, ne.position.x),
                                          y: Math.max(0, ne.position.y),
                                      }
                                    : ne.position,
                                dragging: C,
                            }
                        if (U && T.inProgress && T.fromNode.id === U.id) {
                            const z = yr(U, T.fromHandle, ae.Left, !0)
                            F({
                                ...T,
                                from: z,
                            })
                        }
                        ;(W &&
                            U.parentId &&
                            I.push({
                                id: K,
                                parentId: U.parentId,
                                rect: {
                                    ...ne.internals.positionAbsolute,
                                    width: ne.measured.width ?? 0,
                                    height: ne.measured.height ?? 0,
                                },
                            }),
                            w.push(Z))
                    }
                    if (I.length > 0) {
                        const { parentLookup: K, nodeOrigin: ne } = _(),
                            U = hc(I, N, K, ne)
                        w.push(...U)
                    }
                    for (const K of V.values()) w = K(w)
                    A(w)
                },
                triggerNodeChanges: (k) => {
                    const {
                        onNodesChange: C,
                        setNodes: I,
                        nodes: w,
                        hasDefaultNodes: N,
                        debug: A,
                    } = _()
                    if (k != null && k.length) {
                        if (N) {
                            const T = Sg(k, w)
                            I(T)
                        }
                        ;(A &&
                            console.log('React Flow: trigger node changes', k),
                            C == null || C(k))
                    }
                },
                triggerEdgeChanges: (k) => {
                    const {
                        onEdgesChange: C,
                        setEdges: I,
                        edges: w,
                        hasDefaultEdges: N,
                        debug: A,
                    } = _()
                    if (k != null && k.length) {
                        if (N) {
                            const T = _g(k, w)
                            I(T)
                        }
                        ;(A &&
                            console.log('React Flow: trigger edge changes', k),
                            C == null || C(k))
                    }
                },
                addSelectedNodes: (k) => {
                    const {
                        multiSelectionActive: C,
                        edgeLookup: I,
                        nodeLookup: w,
                        triggerNodeChanges: N,
                        triggerEdgeChanges: A,
                    } = _()
                    if (C) {
                        const T = k.map((F) => ar(F, !0))
                        N(T)
                        return
                    }
                    ;(N(qr(w, new Set([...k]), !0)), A(qr(I)))
                },
                addSelectedEdges: (k) => {
                    const {
                        multiSelectionActive: C,
                        edgeLookup: I,
                        nodeLookup: w,
                        triggerNodeChanges: N,
                        triggerEdgeChanges: A,
                    } = _()
                    if (C) {
                        const T = k.map((F) => ar(F, !0))
                        A(T)
                        return
                    }
                    ;(A(qr(I, new Set([...k]))), N(qr(w, new Set(), !0)))
                },
                unselectNodesAndEdges: ({ nodes: k, edges: C } = {}) => {
                    const {
                            edges: I,
                            nodes: w,
                            nodeLookup: N,
                            triggerNodeChanges: A,
                            triggerEdgeChanges: T,
                        } = _(),
                        F = k || w,
                        V = C || I,
                        K = F.map((U) => {
                            const W = N.get(U.id)
                            return (W && (W.selected = !1), ar(U.id, !1))
                        }),
                        ne = V.map((U) => ar(U.id, !1))
                    ;(A(K), T(ne))
                },
                setMinZoom: (k) => {
                    const { panZoom: C, maxZoom: I } = _()
                    ;(C == null || C.setScaleExtent([k, I]),
                        S({
                            minZoom: k,
                        }))
                },
                setMaxZoom: (k) => {
                    const { panZoom: C, minZoom: I } = _()
                    ;(C == null || C.setScaleExtent([I, k]),
                        S({
                            maxZoom: k,
                        }))
                },
                setTranslateExtent: (k) => {
                    var C
                    ;((C = _().panZoom) == null || C.setTranslateExtent(k),
                        S({
                            translateExtent: k,
                        }))
                },
                resetSelectedElements: () => {
                    const {
                        edges: k,
                        nodes: C,
                        triggerNodeChanges: I,
                        triggerEdgeChanges: w,
                        elementsSelectable: N,
                    } = _()
                    if (!N) return
                    const A = C.reduce(
                            (F, V) => (V.selected ? [...F, ar(V.id, !1)] : F),
                            []
                        ),
                        T = k.reduce(
                            (F, V) => (V.selected ? [...F, ar(V.id, !1)] : F),
                            []
                        )
                    ;(I(A), w(T))
                },
                setNodeExtent: (k) => {
                    const {
                        nodes: C,
                        nodeLookup: I,
                        parentLookup: w,
                        nodeOrigin: N,
                        elevateNodesOnSelect: A,
                        nodeExtent: T,
                        zIndexMode: F,
                    } = _()
                    ;(k[0][0] === T[0][0] &&
                        k[0][1] === T[0][1] &&
                        k[1][0] === T[1][0] &&
                        k[1][1] === T[1][1]) ||
                        (Qa(C, I, w, {
                            nodeOrigin: N,
                            nodeExtent: k,
                            elevateNodesOnSelect: A,
                            checkEquality: !1,
                            zIndexMode: F,
                        }),
                        S({
                            nodeExtent: k,
                        }))
                },
                panBy: (k) => {
                    const {
                        transform: C,
                        width: I,
                        height: w,
                        panZoom: N,
                        translateExtent: A,
                    } = _()
                    return e1({
                        delta: k,
                        panZoom: N,
                        transform: C,
                        translateExtent: A,
                        width: I,
                        height: w,
                    })
                },
                setCenter: async (k, C, I) => {
                    const { width: w, height: N, maxZoom: A, panZoom: T } = _()
                    if (!T) return Promise.resolve(!1)
                    const F =
                        typeof (I == null ? void 0 : I.zoom) < 'u' ? I.zoom : A
                    return (
                        await T.setViewport(
                            {
                                x: w / 2 - k * F,
                                y: N / 2 - C * F,
                                zoom: F,
                            },
                            {
                                duration: I == null ? void 0 : I.duration,
                                ease: I == null ? void 0 : I.ease,
                                interpolate: I == null ? void 0 : I.interpolate,
                            }
                        ),
                        Promise.resolve(!0)
                    )
                },
                cancelConnection: () => {
                    S({
                        connection: {
                            ...Vp,
                        },
                    })
                },
                updateConnection: (k) => {
                    S({
                        connection: k,
                    })
                },
                reset: () =>
                    S({
                        ...Jh(),
                    }),
            }
        }, Object.is)
function Xg({
    initialNodes: t,
    initialEdges: r,
    defaultNodes: i,
    defaultEdges: l,
    initialWidth: u,
    initialHeight: a,
    initialMinZoom: c,
    initialMaxZoom: d,
    initialFitViewOptions: p,
    fitView: m,
    nodeOrigin: v,
    nodeExtent: g,
    zIndexMode: y,
    children: S,
}) {
    const [_] = q.useState(() =>
        y_({
            nodes: t,
            edges: r,
            defaultNodes: i,
            defaultEdges: l,
            width: u,
            height: a,
            fitView: m,
            minZoom: c,
            maxZoom: d,
            fitViewOptions: p,
            nodeOrigin: v,
            nodeExtent: g,
            zIndexMode: y,
        })
    )
    return Q.jsx($1, {
        value: _,
        children: Q.jsx(iS, {
            children: S,
        }),
    })
}
function v_({
    children: t,
    nodes: r,
    edges: i,
    defaultNodes: l,
    defaultEdges: u,
    width: a,
    height: c,
    fitView: d,
    fitViewOptions: p,
    minZoom: m,
    maxZoom: v,
    nodeOrigin: g,
    nodeExtent: y,
    zIndexMode: S,
}) {
    return q.useContext(Cl)
        ? Q.jsx(Q.Fragment, {
              children: t,
          })
        : Q.jsx(Xg, {
              initialNodes: r,
              initialEdges: i,
              defaultNodes: l,
              defaultEdges: u,
              initialWidth: a,
              initialHeight: c,
              fitView: d,
              initialFitViewOptions: p,
              initialMinZoom: m,
              initialMaxZoom: v,
              nodeOrigin: g,
              nodeExtent: y,
              zIndexMode: S,
              children: t,
          })
}
const x_ = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 0,
}
function w_(
    {
        nodes: t,
        edges: r,
        defaultNodes: i,
        defaultEdges: l,
        className: u,
        nodeTypes: a,
        edgeTypes: c,
        onNodeClick: d,
        onEdgeClick: p,
        onInit: m,
        onMove: v,
        onMoveStart: g,
        onMoveEnd: y,
        onConnect: S,
        onConnectStart: _,
        onConnectEnd: E,
        onClickConnectStart: k,
        onClickConnectEnd: C,
        onNodeMouseEnter: I,
        onNodeMouseMove: w,
        onNodeMouseLeave: N,
        onNodeContextMenu: A,
        onNodeDoubleClick: T,
        onNodeDragStart: F,
        onNodeDrag: V,
        onNodeDragStop: K,
        onNodesDelete: ne,
        onEdgesDelete: U,
        onDelete: W,
        onSelectionChange: Z,
        onSelectionDragStart: z,
        onSelectionDrag: B,
        onSelectionDragStop: H,
        onSelectionContextMenu: b,
        onSelectionStart: L,
        onSelectionEnd: R,
        onBeforeDelete: j,
        connectionMode: M,
        connectionLineType: $ = jn.Bezier,
        connectionLineStyle: te,
        connectionLineComponent: ee,
        connectionLineContainerStyle: le,
        deleteKeyCode: ue = 'Backspace',
        selectionKeyCode: ce = 'Shift',
        selectionOnDrag: J = !1,
        selectionMode: fe = di.Full,
        panActivationKeyCode: we = 'Space',
        multiSelectionKeyCode: _e = pi() ? 'Meta' : 'Control',
        zoomActivationKeyCode: Se = pi() ? 'Meta' : 'Control',
        snapToGrid: ye,
        snapGrid: Ne,
        onlyRenderVisibleElements: Ie = !1,
        selectNodesOnDrag: Me,
        nodesDraggable: Ue,
        autoPanOnNodeFocus: Lt,
        nodesConnectable: ht,
        nodesFocusable: pt,
        nodeOrigin: _t = xg,
        edgesFocusable: Jt,
        edgesReconnectable: mn,
        elementsSelectable: vr = !0,
        defaultViewport: Un = K1,
        minZoom: en = 0.5,
        maxZoom: tn = 2,
        translateExtent: Wn = fi,
        preventScrolling: Ci = !0,
        nodeExtent: nn,
        defaultMarkerColor: Yn = '#b1b1b7',
        zoomOnScroll: Ml = !0,
        zoomOnPinch: Ni = !0,
        panOnScroll: Mi = !1,
        panOnScrollSpeed: Pl = 0.5,
        panOnScrollMode: ao = dr.Free,
        zoomOnDoubleClick: co = !0,
        panOnDrag: fo = !0,
        onPaneClick: ho,
        onPaneMouseEnter: po,
        onPaneMouseMove: yn,
        onPaneMouseLeave: vn,
        onPaneScroll: Pi,
        onPaneContextMenu: zi,
        paneClickDistance: Li = 1,
        nodeClickDistance: Ii = 0,
        children: Ti,
        onReconnect: go,
        onReconnectStart: Ri,
        onReconnectEnd: bn,
        onEdgeContextMenu: mo,
        onEdgeDoubleClick: Xn,
        onEdgeMouseEnter: zl,
        onEdgeMouseMove: Qn,
        onEdgeMouseLeave: xr,
        reconnectRadius: wr = 10,
        onNodesChange: yo,
        onEdgesChange: Ll,
        noDragClassName: Il = 'nodrag',
        noWheelClassName: Tl = 'nowheel',
        noPanClassName: Bt = 'nopan',
        fitView: vo,
        fitViewOptions: xo,
        connectOnClick: Rl,
        attributionPosition: Di,
        proOptions: Ai,
        defaultEdgeOptions: $i,
        elevateNodesOnSelect: Oi = !0,
        elevateEdgesOnSelect: Dl = !1,
        disableKeyboardA11y: Fi = !1,
        autoPanOnConnect: Fe,
        autoPanOnNodeDrag: Al,
        autoPanSpeed: wo,
        connectionRadius: Hi,
        isValidConnection: Sr,
        onError: $l,
        style: ji,
        id: Kn,
        nodeDragThreshold: Et,
        connectionDragThreshold: Ol,
        viewport: gt,
        onViewportChange: Fl,
        width: Hl,
        height: jl,
        colorMode: _r = 'light',
        debug: Er,
        onScroll: Ut,
        ariaLabelConfig: kr,
        zIndexMode: Vi = 'basic',
        ...Vl
    },
    So
) {
    const Cr = Kn || '1',
        _o = J1(_r),
        Gn = q.useCallback(
            (Bi) => {
                ;(Bi.currentTarget.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'instant',
                }),
                    Ut == null || Ut(Bi))
            },
            [Ut]
        )
    return Q.jsx('div', {
        'data-testid': 'rf__wrapper',
        ...Vl,
        onScroll: Gn,
        style: {
            ...ji,
            ...x_,
        },
        ref: So,
        className: be(['react-flow', u, _o]),
        id: Kn,
        role: 'application',
        children: Q.jsxs(v_, {
            nodes: t,
            edges: r,
            width: Hl,
            height: jl,
            fitView: vo,
            fitViewOptions: xo,
            minZoom: en,
            maxZoom: tn,
            nodeOrigin: _t,
            nodeExtent: nn,
            zIndexMode: Vi,
            children: [
                Q.jsx(m_, {
                    onInit: m,
                    onNodeClick: d,
                    onEdgeClick: p,
                    onNodeMouseEnter: I,
                    onNodeMouseMove: w,
                    onNodeMouseLeave: N,
                    onNodeContextMenu: A,
                    onNodeDoubleClick: T,
                    nodeTypes: a,
                    edgeTypes: c,
                    connectionLineType: $,
                    connectionLineStyle: te,
                    connectionLineComponent: ee,
                    connectionLineContainerStyle: le,
                    selectionKeyCode: ce,
                    selectionOnDrag: J,
                    selectionMode: fe,
                    deleteKeyCode: ue,
                    multiSelectionKeyCode: _e,
                    panActivationKeyCode: we,
                    zoomActivationKeyCode: Se,
                    onlyRenderVisibleElements: Ie,
                    defaultViewport: Un,
                    translateExtent: Wn,
                    minZoom: en,
                    maxZoom: tn,
                    preventScrolling: Ci,
                    zoomOnScroll: Ml,
                    zoomOnPinch: Ni,
                    zoomOnDoubleClick: co,
                    panOnScroll: Mi,
                    panOnScrollSpeed: Pl,
                    panOnScrollMode: ao,
                    panOnDrag: fo,
                    onPaneClick: ho,
                    onPaneMouseEnter: po,
                    onPaneMouseMove: yn,
                    onPaneMouseLeave: vn,
                    onPaneScroll: Pi,
                    onPaneContextMenu: zi,
                    paneClickDistance: Li,
                    nodeClickDistance: Ii,
                    onSelectionContextMenu: b,
                    onSelectionStart: L,
                    onSelectionEnd: R,
                    onReconnect: go,
                    onReconnectStart: Ri,
                    onReconnectEnd: bn,
                    onEdgeContextMenu: mo,
                    onEdgeDoubleClick: Xn,
                    onEdgeMouseEnter: zl,
                    onEdgeMouseMove: Qn,
                    onEdgeMouseLeave: xr,
                    reconnectRadius: wr,
                    defaultMarkerColor: Yn,
                    noDragClassName: Il,
                    noWheelClassName: Tl,
                    noPanClassName: Bt,
                    rfId: Cr,
                    disableKeyboardA11y: Fi,
                    nodeExtent: nn,
                    viewport: gt,
                    onViewportChange: Fl,
                }),
                Q.jsx(Z1, {
                    nodes: t,
                    edges: r,
                    defaultNodes: i,
                    defaultEdges: l,
                    onConnect: S,
                    onConnectStart: _,
                    onConnectEnd: E,
                    onClickConnectStart: k,
                    onClickConnectEnd: C,
                    nodesDraggable: Ue,
                    autoPanOnNodeFocus: Lt,
                    nodesConnectable: ht,
                    nodesFocusable: pt,
                    edgesFocusable: Jt,
                    edgesReconnectable: mn,
                    elementsSelectable: vr,
                    elevateNodesOnSelect: Oi,
                    elevateEdgesOnSelect: Dl,
                    minZoom: en,
                    maxZoom: tn,
                    nodeExtent: nn,
                    onNodesChange: yo,
                    onEdgesChange: Ll,
                    snapToGrid: ye,
                    snapGrid: Ne,
                    connectionMode: M,
                    translateExtent: Wn,
                    connectOnClick: Rl,
                    defaultEdgeOptions: $i,
                    fitView: vo,
                    fitViewOptions: xo,
                    onNodesDelete: ne,
                    onEdgesDelete: U,
                    onDelete: W,
                    onNodeDragStart: F,
                    onNodeDrag: V,
                    onNodeDragStop: K,
                    onSelectionDrag: B,
                    onSelectionDragStart: z,
                    onSelectionDragStop: H,
                    onMove: v,
                    onMoveStart: g,
                    onMoveEnd: y,
                    noPanClassName: Bt,
                    nodeOrigin: _t,
                    rfId: Cr,
                    autoPanOnConnect: Fe,
                    autoPanOnNodeDrag: Al,
                    autoPanSpeed: wo,
                    onError: $l,
                    connectionRadius: Hi,
                    isValidConnection: Sr,
                    selectNodesOnDrag: Me,
                    nodeDragThreshold: Et,
                    connectionDragThreshold: Ol,
                    onBeforeDelete: j,
                    debug: Er,
                    ariaLabelConfig: kr,
                    zIndexMode: Vi,
                }),
                Q.jsx(Q1, {
                    onSelectionChange: Z,
                }),
                Ti,
                Q.jsx(U1, {
                    proOptions: Ai,
                    position: Di,
                }),
                Q.jsx(B1, {
                    rfId: Cr,
                    disableKeyboardA11y: Fi,
                }),
            ],
        }),
    })
}
var S_ = Eg(w_)
function __(t) {
    const [r, i] = q.useState(t),
        l = q.useCallback((u) => i((a) => Sg(u, a)), [])
    return [r, i, l]
}
function E_(t) {
    const [r, i] = q.useState(t),
        l = q.useCallback((u) => i((a) => _g(u, a)), [])
    return [r, i, l]
}
function k_({ dimensions: t, lineWidth: r, variant: i, className: l }) {
    return Q.jsx('path', {
        strokeWidth: r,
        d: `M${t[0] / 2} 0 V${t[1]} M0 ${t[1] / 2} H${t[0]}`,
        className: be(['react-flow__background-pattern', i, l]),
    })
}
function C_({ radius: t, className: r }) {
    return Q.jsx('circle', {
        cx: t,
        cy: t,
        r: t,
        className: be(['react-flow__background-pattern', 'dots', r]),
    })
}
var Bn
;(function (t) {
    ;((t.Lines = 'lines'), (t.Dots = 'dots'), (t.Cross = 'cross'))
})(Bn || (Bn = {}))
const N_ = {
        [Bn.Dots]: 1,
        [Bn.Lines]: 1,
        [Bn.Cross]: 6,
    },
    M_ = (t) => ({
        transform: t.transform,
        patternId: `pattern-${t.rfId}`,
    })
function Qg({
    id: t,
    variant: r = Bn.Dots,
    gap: i = 20,
    size: l,
    lineWidth: u = 1,
    offset: a = 0,
    color: c,
    bgColor: d,
    style: p,
    className: m,
    patternClassName: v,
}) {
    const g = q.useRef(null),
        { transform: y, patternId: S } = Ce(M_, $e),
        _ = l || N_[r],
        E = r === Bn.Dots,
        k = r === Bn.Cross,
        C = Array.isArray(i) ? i : [i, i],
        I = [C[0] * y[2] || 1, C[1] * y[2] || 1],
        w = _ * y[2],
        N = Array.isArray(a) ? a : [a, a],
        A = k ? [w, w] : I,
        T = [N[0] * y[2] || 1 + A[0] / 2, N[1] * y[2] || 1 + A[1] / 2],
        F = `${S}${t || ''}`
    return Q.jsxs('svg', {
        className: be(['react-flow__background', m]),
        style: {
            ...p,
            ...Nl,
            '--xy-background-color-props': d,
            '--xy-background-pattern-color-props': c,
        },
        ref: g,
        'data-testid': 'rf__background',
        children: [
            Q.jsx('pattern', {
                id: F,
                x: y[0] % I[0],
                y: y[1] % I[1],
                width: I[0],
                height: I[1],
                patternUnits: 'userSpaceOnUse',
                patternTransform: `translate(-${T[0]},-${T[1]})`,
                children: E
                    ? Q.jsx(C_, {
                          radius: w / 2,
                          className: v,
                      })
                    : Q.jsx(k_, {
                          dimensions: A,
                          lineWidth: u,
                          variant: r,
                          className: v,
                      }),
            }),
            Q.jsx('rect', {
                x: '0',
                y: '0',
                width: '100%',
                height: '100%',
                fill: `url(#${F})`,
            }),
        ],
    })
}
Qg.displayName = 'Background'
const P_ = q.memo(Qg)
function z_() {
    return Q.jsx('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 32 32',
        children: Q.jsx('path', {
            d: 'M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z',
        }),
    })
}
function L_() {
    return Q.jsx('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 32 5',
        children: Q.jsx('path', {
            d: 'M0 0h32v4.2H0z',
        }),
    })
}
function I_() {
    return Q.jsx('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 32 30',
        children: Q.jsx('path', {
            d: 'M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z',
        }),
    })
}
function T_() {
    return Q.jsx('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 25 32',
        children: Q.jsx('path', {
            d: 'M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z',
        }),
    })
}
function R_() {
    return Q.jsx('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 25 32',
        children: Q.jsx('path', {
            d: 'M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z',
        }),
    })
}
function Zs({ children: t, className: r, ...i }) {
    return Q.jsx('button', {
        type: 'button',
        className: be(['react-flow__controls-button', r]),
        ...i,
        children: t,
    })
}
const D_ = (t) => ({
    isInteractive:
        t.nodesDraggable || t.nodesConnectable || t.elementsSelectable,
    minZoomReached: t.transform[2] <= t.minZoom,
    maxZoomReached: t.transform[2] >= t.maxZoom,
    ariaLabelConfig: t.ariaLabelConfig,
})
function Kg({
    style: t,
    showZoom: r = !0,
    showFitView: i = !0,
    showInteractive: l = !0,
    fitViewOptions: u,
    onZoomIn: a,
    onZoomOut: c,
    onFitView: d,
    onInteractiveChange: p,
    className: m,
    children: v,
    position: g = 'bottom-left',
    orientation: y = 'vertical',
    'aria-label': S,
}) {
    const _ = Oe(),
        {
            isInteractive: E,
            minZoomReached: k,
            maxZoomReached: C,
            ariaLabelConfig: I,
        } = Ce(D_, $e),
        { zoomIn: w, zoomOut: N, fitView: A } = uo(),
        T = () => {
            ;(w(), a == null || a())
        },
        F = () => {
            ;(N(), c == null || c())
        },
        V = () => {
            ;(A(u), d == null || d())
        },
        K = () => {
            ;(_.setState({
                nodesDraggable: !E,
                nodesConnectable: !E,
                elementsSelectable: !E,
            }),
                p == null || p(!E))
        },
        ne = y === 'horizontal' ? 'horizontal' : 'vertical'
    return Q.jsxs(Ei, {
        className: be(['react-flow__controls', ne, m]),
        position: g,
        style: t,
        'data-testid': 'rf__controls',
        'aria-label': S ?? I['controls.ariaLabel'],
        children: [
            r &&
                Q.jsxs(Q.Fragment, {
                    children: [
                        Q.jsx(Zs, {
                            onClick: T,
                            className: 'react-flow__controls-zoomin',
                            title: I['controls.zoomIn.ariaLabel'],
                            'aria-label': I['controls.zoomIn.ariaLabel'],
                            disabled: C,
                            children: Q.jsx(z_, {}),
                        }),
                        Q.jsx(Zs, {
                            onClick: F,
                            className: 'react-flow__controls-zoomout',
                            title: I['controls.zoomOut.ariaLabel'],
                            'aria-label': I['controls.zoomOut.ariaLabel'],
                            disabled: k,
                            children: Q.jsx(L_, {}),
                        }),
                    ],
                }),
            i &&
                Q.jsx(Zs, {
                    className: 'react-flow__controls-fitview',
                    onClick: V,
                    title: I['controls.fitView.ariaLabel'],
                    'aria-label': I['controls.fitView.ariaLabel'],
                    children: Q.jsx(I_, {}),
                }),
            l &&
                Q.jsx(Zs, {
                    className: 'react-flow__controls-interactive',
                    onClick: K,
                    title: I['controls.interactive.ariaLabel'],
                    'aria-label': I['controls.interactive.ariaLabel'],
                    children: E ? Q.jsx(R_, {}) : Q.jsx(T_, {}),
                }),
            v,
        ],
    })
}
Kg.displayName = 'Controls'
q.memo(Kg)
function A_({
    id: t,
    x: r,
    y: i,
    width: l,
    height: u,
    style: a,
    color: c,
    strokeColor: d,
    strokeWidth: p,
    className: m,
    borderRadius: v,
    shapeRendering: g,
    selected: y,
    onClick: S,
}) {
    const { background: _, backgroundColor: E } = a || {},
        k = c || _ || E
    return Q.jsx('rect', {
        className: be([
            'react-flow__minimap-node',
            {
                selected: y,
            },
            m,
        ]),
        x: r,
        y: i,
        rx: v,
        ry: v,
        width: l,
        height: u,
        style: {
            fill: k,
            stroke: d,
            strokeWidth: p,
        },
        shapeRendering: g,
        onClick: S ? (C) => S(C, t) : void 0,
    })
}
const $_ = q.memo(A_),
    O_ = (t) => t.nodes.map((r) => r.id),
    $a = (t) => (t instanceof Function ? t : () => t)
function F_({
    nodeStrokeColor: t,
    nodeColor: r,
    nodeClassName: i = '',
    nodeBorderRadius: l = 5,
    nodeStrokeWidth: u,
    nodeComponent: a = $_,
    onClick: c,
}) {
    const d = Ce(O_, $e),
        p = $a(r),
        m = $a(t),
        v = $a(i),
        g =
            typeof window > 'u' || window.chrome
                ? 'crispEdges'
                : 'geometricPrecision'
    return Q.jsx(Q.Fragment, {
        children: d.map((y) =>
            Q.jsx(
                j_,
                {
                    id: y,
                    nodeColorFunc: p,
                    nodeStrokeColorFunc: m,
                    nodeClassNameFunc: v,
                    nodeBorderRadius: l,
                    nodeStrokeWidth: u,
                    NodeComponent: a,
                    onClick: c,
                    shapeRendering: g,
                },
                y
            )
        ),
    })
}
function H_({
    id: t,
    nodeColorFunc: r,
    nodeStrokeColorFunc: i,
    nodeClassNameFunc: l,
    nodeBorderRadius: u,
    nodeStrokeWidth: a,
    shapeRendering: c,
    NodeComponent: d,
    onClick: p,
}) {
    const {
        node: m,
        x: v,
        y: g,
        width: y,
        height: S,
    } = Ce((_) => {
        const { internals: E } = _.nodeLookup.get(t),
            k = E.userNode,
            { x: C, y: I } = E.positionAbsolute,
            { width: w, height: N } = gn(k)
        return {
            node: k,
            x: C,
            y: I,
            width: w,
            height: N,
        }
    }, $e)
    return !m || m.hidden || !Qp(m)
        ? null
        : Q.jsx(d, {
              x: v,
              y: g,
              width: y,
              height: S,
              style: m.style,
              selected: !!m.selected,
              className: l(m),
              color: r(m),
              borderRadius: u,
              strokeColor: i(m),
              strokeWidth: a,
              shapeRendering: c,
              onClick: p,
              id: m.id,
          })
}
const j_ = q.memo(H_)
var V_ = q.memo(F_)
const B_ = 200,
    U_ = 150,
    W_ = (t) => !t.hidden,
    Y_ = (t) => {
        const r = {
            x: -t.transform[0] / t.transform[2],
            y: -t.transform[1] / t.transform[2],
            width: t.width / t.transform[2],
            height: t.height / t.transform[2],
        }
        return {
            viewBB: r,
            boundingRect:
                t.nodeLookup.size > 0
                    ? Xp(
                          wi(t.nodeLookup, {
                              filter: W_,
                          }),
                          r
                      )
                    : r,
            rfId: t.rfId,
            panZoom: t.panZoom,
            translateExtent: t.translateExtent,
            flowWidth: t.width,
            flowHeight: t.height,
            ariaLabelConfig: t.ariaLabelConfig,
        }
    },
    b_ = 'react-flow__minimap-desc'
function Gg({
    style: t,
    className: r,
    nodeStrokeColor: i,
    nodeColor: l,
    nodeClassName: u = '',
    nodeBorderRadius: a = 5,
    nodeStrokeWidth: c,
    nodeComponent: d,
    bgColor: p,
    maskColor: m,
    maskStrokeColor: v,
    maskStrokeWidth: g,
    position: y = 'bottom-right',
    onClick: S,
    onNodeClick: _,
    pannable: E = !1,
    zoomable: k = !1,
    ariaLabel: C,
    inversePan: I,
    zoomStep: w = 1,
    offsetScale: N = 5,
}) {
    const A = Oe(),
        T = q.useRef(null),
        {
            boundingRect: F,
            viewBB: V,
            rfId: K,
            panZoom: ne,
            translateExtent: U,
            flowWidth: W,
            flowHeight: Z,
            ariaLabelConfig: z,
        } = Ce(Y_, $e),
        B = (t == null ? void 0 : t.width) ?? B_,
        H = (t == null ? void 0 : t.height) ?? U_,
        b = F.width / B,
        L = F.height / H,
        R = Math.max(b, L),
        j = R * B,
        M = R * H,
        $ = N * R,
        te = F.x - (j - F.width) / 2 - $,
        ee = F.y - (M - F.height) / 2 - $,
        le = j + $ * 2,
        ue = M + $ * 2,
        ce = `${b_}-${K}`,
        J = q.useRef(0),
        fe = q.useRef()
    ;((J.current = R),
        q.useEffect(() => {
            if (T.current && ne)
                return (
                    (fe.current = a1({
                        domNode: T.current,
                        panZoom: ne,
                        getTransform: () => A.getState().transform,
                        getViewScale: () => J.current,
                    })),
                    () => {
                        var ye
                        ;(ye = fe.current) == null || ye.destroy()
                    }
                )
        }, [ne]),
        q.useEffect(() => {
            var ye
            ;(ye = fe.current) == null ||
                ye.update({
                    translateExtent: U,
                    width: W,
                    height: Z,
                    inversePan: I,
                    pannable: E,
                    zoomStep: w,
                    zoomable: k,
                })
        }, [E, k, I, w, U, W, Z]))
    const we = S
            ? (ye) => {
                  var Me
                  const [Ne, Ie] = ((Me = fe.current) == null
                      ? void 0
                      : Me.pointer(ye)) || [0, 0]
                  S(ye, {
                      x: Ne,
                      y: Ie,
                  })
              }
            : void 0,
        _e = _
            ? q.useCallback((ye, Ne) => {
                  const Ie = A.getState().nodeLookup.get(Ne).internals.userNode
                  _(ye, Ie)
              }, [])
            : void 0,
        Se = C ?? z['minimap.ariaLabel']
    return Q.jsx(Ei, {
        position: y,
        style: {
            ...t,
            '--xy-minimap-background-color-props':
                typeof p == 'string' ? p : void 0,
            '--xy-minimap-mask-background-color-props':
                typeof m == 'string' ? m : void 0,
            '--xy-minimap-mask-stroke-color-props':
                typeof v == 'string' ? v : void 0,
            '--xy-minimap-mask-stroke-width-props':
                typeof g == 'number' ? g * R : void 0,
            '--xy-minimap-node-background-color-props':
                typeof l == 'string' ? l : void 0,
            '--xy-minimap-node-stroke-color-props':
                typeof i == 'string' ? i : void 0,
            '--xy-minimap-node-stroke-width-props':
                typeof c == 'number' ? c : void 0,
        },
        className: be(['react-flow__minimap', r]),
        'data-testid': 'rf__minimap',
        children: Q.jsxs('svg', {
            width: B,
            height: H,
            viewBox: `${te} ${ee} ${le} ${ue}`,
            className: 'react-flow__minimap-svg',
            role: 'img',
            'aria-labelledby': ce,
            ref: T,
            onClick: we,
            children: [
                Se &&
                    Q.jsx('title', {
                        id: ce,
                        children: Se,
                    }),
                Q.jsx(V_, {
                    onClick: _e,
                    nodeColor: l,
                    nodeStrokeColor: i,
                    nodeBorderRadius: a,
                    nodeClassName: u,
                    nodeStrokeWidth: c,
                    nodeComponent: d,
                }),
                Q.jsx('path', {
                    className: 'react-flow__minimap-mask',
                    d: `M${te - $},${ee - $}h${le + $ * 2}v${ue + $ * 2}h${-le - $ * 2}z
        M${V.x},${V.y}h${V.width}v${V.height}h${-V.width}z`,
                    fillRule: 'evenodd',
                    pointerEvents: 'none',
                }),
            ],
        }),
    })
}
Gg.displayName = 'MiniMap'
q.memo(Gg)
const X_ = (t) => (r) => (t ? `${Math.max(1 / r.transform[2], 1)}` : void 0),
    Q_ = {
        [lo.Line]: 'right',
        [lo.Handle]: 'bottom-right',
    }
function K_({
    nodeId: t,
    position: r,
    variant: i = lo.Handle,
    className: l,
    style: u = void 0,
    children: a,
    color: c,
    minWidth: d = 10,
    minHeight: p = 10,
    maxWidth: m = Number.MAX_VALUE,
    maxHeight: v = Number.MAX_VALUE,
    keepAspectRatio: g = !1,
    resizeDirection: y,
    autoScale: S = !0,
    shouldResize: _,
    onResizeStart: E,
    onResize: k,
    onResizeEnd: C,
}) {
    const I = Mg(),
        w = typeof t == 'string' ? t : I,
        N = Oe(),
        A = q.useRef(null),
        T = i === lo.Handle,
        F = Ce(q.useCallback(X_(T && S), [T, S]), $e),
        V = q.useRef(null),
        K = r ?? Q_[i]
    q.useEffect(() => {
        if (!(!A.current || !w))
            return (
                V.current ||
                    (V.current = E1({
                        domNode: A.current,
                        nodeId: w,
                        getStoreItems: () => {
                            const {
                                nodeLookup: U,
                                transform: W,
                                snapGrid: Z,
                                snapToGrid: z,
                                nodeOrigin: B,
                                domNode: H,
                            } = N.getState()
                            return {
                                nodeLookup: U,
                                transform: W,
                                snapGrid: Z,
                                snapToGrid: z,
                                nodeOrigin: B,
                                paneDomNode: H,
                            }
                        },
                        onChange: (U, W) => {
                            const {
                                    triggerNodeChanges: Z,
                                    nodeLookup: z,
                                    parentLookup: B,
                                    nodeOrigin: H,
                                } = N.getState(),
                                b = [],
                                L = {
                                    x: U.x,
                                    y: U.y,
                                },
                                R = z.get(w)
                            if (R && R.expandParent && R.parentId) {
                                const j = R.origin ?? H,
                                    M = U.width ?? R.measured.width ?? 0,
                                    $ = U.height ?? R.measured.height ?? 0,
                                    te = {
                                        id: R.id,
                                        parentId: R.parentId,
                                        rect: {
                                            width: M,
                                            height: $,
                                            ...Kp(
                                                {
                                                    x: U.x ?? R.position.x,
                                                    y: U.y ?? R.position.y,
                                                },
                                                {
                                                    width: M,
                                                    height: $,
                                                },
                                                R.parentId,
                                                z,
                                                j
                                            ),
                                        },
                                    },
                                    ee = hc([te], z, B, H)
                                ;(b.push(...ee),
                                    (L.x = U.x
                                        ? Math.max(j[0] * M, U.x)
                                        : void 0),
                                    (L.y = U.y
                                        ? Math.max(j[1] * $, U.y)
                                        : void 0))
                            }
                            if (L.x !== void 0 && L.y !== void 0) {
                                const j = {
                                    id: w,
                                    type: 'position',
                                    position: {
                                        ...L,
                                    },
                                }
                                b.push(j)
                            }
                            if (U.width !== void 0 && U.height !== void 0) {
                                const M = {
                                    id: w,
                                    type: 'dimensions',
                                    resizing: !0,
                                    setAttributes: y
                                        ? y === 'horizontal'
                                            ? 'width'
                                            : 'height'
                                        : !0,
                                    dimensions: {
                                        width: U.width,
                                        height: U.height,
                                    },
                                }
                                b.push(M)
                            }
                            for (const j of W) {
                                const M = {
                                    ...j,
                                    type: 'position',
                                }
                                b.push(M)
                            }
                            Z(b)
                        },
                        onEnd: ({ width: U, height: W }) => {
                            const Z = {
                                id: w,
                                type: 'dimensions',
                                resizing: !1,
                                dimensions: {
                                    width: U,
                                    height: W,
                                },
                            }
                            N.getState().triggerNodeChanges([Z])
                        },
                    })),
                V.current.update({
                    controlPosition: K,
                    boundaries: {
                        minWidth: d,
                        minHeight: p,
                        maxWidth: m,
                        maxHeight: v,
                    },
                    keepAspectRatio: g,
                    resizeDirection: y,
                    onResizeStart: E,
                    onResize: k,
                    onResizeEnd: C,
                    shouldResize: _,
                }),
                () => {
                    var U
                    ;(U = V.current) == null || U.destroy()
                }
            )
    }, [K, d, p, m, v, g, E, k, C, _])
    const ne = K.split('-')
    return Q.jsx('div', {
        className: be(['react-flow__resize-control', 'nodrag', ...ne, i, l]),
        ref: A,
        style: {
            ...u,
            scale: F,
            ...(c && {
                [T ? 'backgroundColor' : 'borderColor']: c,
            }),
        },
        children: a,
    })
}
q.memo(K_)
var Qt = ((t) => ((t.Horizontal = 'horiztonal'), (t.Vertical = 'vertical'), t))(
    Qt || {}
)
function G_({
    id: t,
    index: r,
    x: i,
    y: l,
    color: u,
    active: a,
    setControlPoints: c,
}) {
    const d = Ce((E) => E.domNode),
        { screenToFlowPosition: p } = uo(),
        [m, v] = q.useState(!1),
        g = q.useRef(null),
        y = q.useCallback(
            (E) => {
                c((k) =>
                    a
                        ? k.map((I) =>
                              I.id === t
                                  ? {
                                        ...I,
                                        ...E,
                                    }
                                  : I
                          )
                        : r !== 0
                          ? k.flatMap((I, w) =>
                                w === r * 0.5 - 1
                                    ? [
                                          I,
                                          {
                                              ...E,
                                              id: t,
                                              active: !0,
                                          },
                                      ]
                                    : I
                            )
                          : [
                                {
                                    ...E,
                                    id: t,
                                    active: !0,
                                },
                                ...k,
                            ]
                )
            },
            [t, a, r, c]
        ),
        S = q.useCallback(() => {
            var k, C
            c((I) => I.filter((w) => w.id !== t))
            const E =
                (C =
                    (k = g.current) == null
                        ? void 0
                        : k.previousElementSibling) == null
                    ? void 0
                    : C.previousElementSibling
            ;(E == null ? void 0 : E.tagName) === 'circle' &&
                E.classList.contains('active') &&
                window.requestAnimationFrame(() => {
                    E.focus()
                })
        }, [t, c]),
        _ = q.useCallback(
            (E) => {
                switch (E.key) {
                    case 'Enter':
                    case 'Space':
                        ;(a || E.preventDefault(),
                            y({
                                x: i,
                                y: l,
                            }))
                        break
                    case 'Backspace':
                    case 'Delete':
                        ;(E.stopPropagation(), S())
                        break
                    case 'ArrowLeft':
                        y({
                            x: i - 5,
                            y: l,
                        })
                        break
                    case 'ArrowRight':
                        y({
                            x: i + 5,
                            y: l,
                        })
                        break
                    case 'ArrowUp':
                        y({
                            x: i,
                            y: l - 5,
                        })
                        break
                    case 'ArrowDown':
                        y({
                            x: i,
                            y: l + 5,
                        })
                        break
                }
            },
            [a, y, i, l, S]
        )
    return (
        q.useEffect(() => {
            if (!d || !a || !m) return
            const E = (C) => {
                    y(
                        p({
                            x: C.clientX,
                            y: C.clientY,
                        })
                    )
                },
                k = (C) => {
                    ;(d.removeEventListener('pointermove', E),
                        a || C.preventDefault(),
                        v(!1),
                        y(
                            p({
                                x: C.clientX,
                                y: C.clientY,
                            })
                        ))
                }
            return (
                d.addEventListener('pointermove', E),
                d.addEventListener('pointerup', k, {
                    once: !0,
                }),
                d.addEventListener('pointerleave', k, {
                    once: !0,
                }),
                () => {
                    ;(d.removeEventListener('pointermove', E),
                        d.removeEventListener('pointerup', k),
                        d.removeEventListener('pointerleave', k),
                        v(!1))
                }
            )
        }, [t, d, m, a, p, c, y]),
        Q.jsx('circle', {
            ref: g,
            tabIndex: 0,
            id: t,
            className: 'nopan nodrag' + (a ? ' active' : ''),
            cx: i,
            cy: l,
            r: a ? 4 : 3,
            strokeOpacity: a ? 1 : 0.3,
            stroke: u,
            fill: a ? u : 'white',
            style: {
                pointerEvents: 'all',
            },
            onContextMenu: (E) => {
                ;(E.preventDefault(), a && S())
            },
            onPointerDown: (E) => {
                E.button !== 2 &&
                    (y({
                        x: i,
                        y: l,
                    }),
                    v(!0))
            },
            onKeyDown: _,
            onPointerUp: () => v(!1),
        })
    )
}
const qg = (t) => 'id' in t
function q_(t) {
    if (t.length < 1) return ''
    let r = `M ${t[0].x} ${t[0].y}`
    for (let i = 0; i < t.length; i++) r += ` L ${t[i].x} ${t[i].y}`
    return r
}
function Z_(t) {
    const r = []
    for (let i = 0; i < t.length - 1; i++) {
        const l = t[i],
            u = t[i + 1]
        ;(qg(l) && r.push(l),
            r.push({
                prev: 'id' in l ? l.id : void 0,
                id: `spline-${window.crypto.randomUUID()}`,
                active: !1,
                x: (l.x + u.x) / 2,
                y: (l.y + u.y) / 2,
            }))
    }
    return r
}
function Js(t, r) {
    return t >= 0 ? 0.5 * t : r * 25 * Math.sqrt(-t)
}
function Zg(t, r, i, l, u, a) {
    switch (t) {
        case ae.Left:
            return [r - Js(r - l, a), i]
        case ae.Right:
            return [r + Js(l - r, a), i]
        case ae.Top:
            return [r, i - Js(i - u, a)]
        case ae.Bottom:
            return [r, i + Js(u - i, a)]
    }
}
function ep(
    t,
    r = !1,
    i = {
        fromSide: ae.Left,
        toSide: ae.Right,
    }
) {
    if (t.length < 2) return ''
    let l = `M ${t[0].x} ${t[0].y}`
    for (let u = 0; u < t.length - 1; u++) {
        const a = t[u],
            c = t[u + 1],
            d = t[u - 1] ?? (r ? Jg(a, c, i.fromSide) : a),
            p = t[u + 2] ?? (r ? em(a, c, i.toSide) : c),
            m = {
                x: (-d.x + 6 * a.x + c.x) / 6,
                y: (-d.y + 6 * a.y + c.y) / 6,
            },
            v = {
                x: (a.x + 6 * c.x - p.x) / 6,
                y: (a.y + 6 * c.y - p.y) / 6,
            }
        l += ` C ${m.x} ${m.y}, ${v.x} ${v.y}, ${c.x} ${c.y}`
    }
    return l
}
function tp(
    t,
    r = !1,
    i = {
        fromSide: ae.Left,
        toSide: ae.Right,
    }
) {
    const l = []
    for (let u = 0; u < t.length - 1; u++) {
        const a = t[u],
            c = t[u + 1],
            d = t[u - 1] ?? (r ? Jg(a, c, i.fromSide) : a),
            p = t[u + 2] ?? (r ? em(a, c, i.toSide) : c)
        ;(qg(a) && l.push(a),
            l.push({
                id: '',
                active: !1,
                x: np(d.x, a.x, c.x, p.x),
                y: np(d.y, a.y, c.y, p.y),
            }))
    }
    return l
}
function Jg(t, r, i) {
    const l = Zg(i, t.x, t.y, r.x, r.y, 0.25)
    return {
        x: r.x + 6 * (t.x - l[0]),
        y: r.y + 6 * (t.y - l[1]),
    }
}
function em(t, r, i) {
    const l = Zg(i, r.x, r.y, t.x, t.y, 0.25)
    return {
        x: t.x + 6 * (r.x - l[0]),
        y: t.y + 6 * (r.y - l[1]),
    }
}
function np(t, r, i, l, u = 0.5) {
    const c = u ** 2,
        d = u ** 3
    return (
        0.5 *
        (2 * r +
            (-t + i) * u +
            (2 * t - 5 * r + 4 * i - l) * c +
            (-t + 3 * r - 3 * i + l) * d)
    )
}
const eo = 20
function J_({ sourceX: t, sourceY: r, targetX: i, targetY: l }) {
    const u = Math.abs(i - t) / 2,
        a = i < t ? i + u : i - u,
        c = Math.abs(l - r) / 2,
        d = l < r ? l + c : l - c
    return [a, d, u, c]
}
const gl = {
        [ae.Left]: {
            x: -1,
            y: 0,
        },
        [ae.Right]: {
            x: 1,
            y: 0,
        },
        [ae.Top]: {
            x: 0,
            y: -1,
        },
        [ae.Bottom]: {
            x: 0,
            y: 1,
        },
    },
    eE = ({ source: t, sourcePosition: r = ae.Bottom, target: i }) =>
        r === ae.Left || r === ae.Right
            ? t.x < i.x
                ? {
                      x: 1,
                      y: 0,
                  }
                : {
                      x: -1,
                      y: 0,
                  }
            : t.y < i.y
              ? {
                    x: 0,
                    y: 1,
                }
              : {
                    x: 0,
                    y: -1,
                },
    rp = (t, r) => Math.sqrt(Math.pow(r.x - t.x, 2) + Math.pow(r.y - t.y, 2))
function tm({
    source: t,
    sourcePosition: r = ae.Bottom,
    target: i,
    targetPosition: l = ae.Top,
    center: u = {
        x: void 0,
        y: void 0,
    },
    offset: a = eo,
}) {
    const c = gl[r],
        d = gl[l],
        p = {
            x: t.x + c.x * a,
            y: t.y + c.y * a,
        },
        m = {
            x: i.x + d.x * a,
            y: i.y + d.y * a,
        },
        v = eE({
            source: p,
            sourcePosition: r,
            target: m,
        }),
        g = v.x !== 0 ? 'x' : 'y',
        y = v[g]
    let S = [],
        _,
        E
    const k = {
            x: 0,
            y: 0,
        },
        C = {
            x: 0,
            y: 0,
        },
        [I, w] = J_({
            sourceX: t.x,
            sourceY: t.y,
            targetX: i.x,
            targetY: i.y,
        })
    if (c[g] * d[g] === -1) {
        ;((_ = u.x ?? I), (E = u.y ?? w))
        const A = [
                {
                    x: _,
                    y: p.y,
                },
                {
                    x: _,
                    y: m.y,
                },
            ],
            T = [
                {
                    x: p.x,
                    y: E,
                },
                {
                    x: m.x,
                    y: E,
                },
            ]
        c[g] === y ? (S = g === 'x' ? A : T) : (S = g === 'x' ? T : A)
    } else {
        const A = [
                {
                    x: p.x,
                    y: m.y,
                },
            ],
            T = [
                {
                    x: m.x,
                    y: p.y,
                },
            ]
        if (
            (g === 'x' ? (S = c.x === y ? T : A) : (S = c.y === y ? A : T),
            r === l)
        ) {
            const U = Math.abs(t[g] - i[g])
            if (U <= a) {
                const W = Math.min(a - 1, a - U)
                c[g] === y
                    ? (k[g] = (p[g] > t[g] ? -1 : 1) * W)
                    : (C[g] = (m[g] > i[g] ? -1 : 1) * W)
            }
        }
        if (r !== l) {
            const U = g === 'x' ? 'y' : 'x',
                W = c[g] === d[U],
                Z = p[U] > m[U],
                z = p[U] < m[U]
            ;((c[g] === 1 && ((!W && Z) || (W && z))) ||
                (c[g] !== 1 && ((!W && z) || (W && Z)))) &&
                (S = g === 'x' ? A : T)
        }
        const F = {
                x: p.x + k.x,
                y: p.y + k.y,
            },
            V = {
                x: m.x + C.x,
                y: m.y + C.y,
            },
            K = Math.max(Math.abs(F.x - S[0].x), Math.abs(V.x - S[0].x)),
            ne = Math.max(Math.abs(F.y - S[0].y), Math.abs(V.y - S[0].y))
        K >= ne
            ? ((_ = (F.x + V.x) / 2), (E = S[0].y))
            : ((_ = S[0].x), (E = (F.y + V.y) / 2))
    }
    return [
        t,
        {
            x: p.x + k.x,
            y: p.y + k.y,
        },
        ...S,
        {
            x: m.x + C.x,
            y: m.y + C.y,
        },
        i,
    ]
}
function tE(t, r, i, l) {
    const u = Math.min(rp(t, r) / 2, rp(r, i) / 2, l),
        { x: a, y: c } = r
    if ((t.x === a && a === i.x) || (t.y === c && c === i.y))
        return `L${a} ${c}`
    if (t.y === c) {
        const m = t.x < i.x ? -1 : 1,
            v = t.y < i.y ? 1 : -1
        return `L ${a + u * m},${c}Q ${a},${c} ${a},${c + u * v}`
    }
    const d = t.x < i.x ? 1 : -1,
        p = t.y < i.y ? -1 : 1
    return `L ${a},${c + u * p}Q ${a},${c} ${a + u * d},${c}`
}
const op = ({ points: t, side: r, handlePosition: i, isTarget: l = !1 }) => {
        let u = 'x',
            a = 'y'
        ;(r === ae.Left || r === ae.Right) && ((u = 'y'), (a = 'x'))
        let c = 0,
            d = 1
        if (
            (l && ((c = t.length - 1), (d = t.length - 2)),
            t[d] && t[c] && t[d][u] !== t[c][u])
        ) {
            const p = gl[r]
            ;((t[c] = {
                ...t[c],
                [a]: p[a] * eo + i[a],
                [u]: i[u],
            }),
                (t[d] = {
                    ...t[d],
                    [a]: p[a] * eo + i[a],
                }))
        }
        if (t[d] && t[c] && t[d][u] === t[c][u]) {
            const p = gl[r]
            ;((t[c] = {
                ...t[c],
                [u]: i[u],
                [a]: p[a] * eo + i[a],
            }),
                (t[d] = {
                    ...t[d],
                    [u]: i[u],
                }))
        }
    },
    nE = ({
        points: t,
        sides: { fromSide: r, toSide: i },
        source: l,
        target: u,
    }) => {
        const a = [...(t || [])]
        return (
            op({
                points: a,
                side: r,
                handlePosition: l,
            }),
            op({
                points: a,
                side: i,
                isTarget: !0,
                handlePosition: u,
            }),
            a
        )
    },
    nm = ({ points: t, initialStepPoints: r }) => (t.length === 2 ? r : t)
function rE({ points: t, initialStepPoints: r }) {
    const i = nm({
        points: t,
        initialStepPoints: r,
    })
    return (
        i.reduce((u, a, c) => {
            let d = ''
            return (
                c > 0 && c < i.length - 1
                    ? (d = tE(i[c - 1], a, i[c + 1], 5))
                    : (d = `${c === 0 ? 'M' : 'L'}${a.x} ${a.y}`),
                (u += d),
                u
            )
        }, '') || ''
    )
}
const rm = ({ nextPoint: t }) => t.active
function oE({ points: t, initialStepPoints: r }) {
    const i = [],
        l = nm({
            points: t,
            initialStepPoints: r,
        })
    for (let u = 1; u < l.length - 2; u++) {
        const a = l[u],
            c = l[u + 1]
        if (!a && !c) continue
        let d = !1
        a.x - c.x === 0 && (d = !0)
        let p = 0,
            m = 0
        ;(d
            ? ((p = a.x), (m = (c.y - a.y) / 2 + a.y))
            : ((p = (c.x - a.x) / 2 + a.x), (m = a.y)),
            i.push({
                prev: 'id' in a ? a.id : void 0,
                id: `${a.id}-${c.id}`,
                active: rm({
                    nextPoint: c,
                }),
                x: p,
                y: m,
                direction: d ? Qt.Horizontal : Qt.Vertical,
            }))
    }
    return i
}
var Ye = ((t) => (
    (t.CatmullRom = 'Catmull-Rom'),
    (t.BezierCatmullRom = 'Bezier Catmull-Rom'),
    (t.Step = 'Step'),
    (t.Linear = 'Linear'),
    t
))(Ye || {})
const gc = {
        Linear: '#0375ff',
        'Bezier Catmull-Rom': '#68D391',
        'Catmull-Rom': '#FF0072',
        Step: '#FF5733',
    },
    ml = 'Step'
function iE({
    points: t,
    algorithm: r = Ye.BezierCatmullRom,
    sides: i = {
        fromSide: ae.Left,
        toSide: ae.Right,
    },
    initialStepPoints: l,
}) {
    switch (r) {
        case Ye.Linear:
            return Z_(t)
        case Ye.Step:
            return oE({
                points: t,
                initialStepPoints: l,
            })
        case Ye.CatmullRom:
            return tp(t)
        case Ye.BezierCatmullRom:
            return tp(t, !0, i)
    }
}
function om({
    points: t,
    algorithm: r = Ye.BezierCatmullRom,
    sides: i = {
        fromSide: ae.Left,
        toSide: ae.Right,
    },
    initialStepPoints: l,
}) {
    switch (r) {
        case Ye.Linear:
            return q_(t)
        case Ye.Step:
            return rE({
                points: t,
                initialStepPoints: l,
            })
        case Ye.CatmullRom:
            return ep(t)
        case Ye.BezierCatmullRom:
            return ep(t, !0, i)
    }
}
const ip = (t, r) =>
    (t == null ? void 0 : t.x) === (r == null ? void 0 : r.x) &&
    (t == null ? void 0 : t.y) === (r == null ? void 0 : r.y)
function sE(t) {
    if (t.length < 3) return t
    const r = []
    let i = 0
    for (; i < t.length; ) {
        const l = t[i].y
        let u = i + 1
        for (; u < t.length && t[u].y === l; ) u++
        if (u - i >= 3) (r.push(t[i]), r.push(t[u - 1]))
        else for (let c = i; c < u; c++) r.push(t[c])
        i = u
    }
    return r
}
function lE({
    id: t,
    index: r,
    x: i,
    y: l,
    color: u,
    active: a,
    setControlPoints: c,
    direction: d = Qt.Horizontal,
    initialStepPoints: p,
}) {
    const m = Ce((w) => w.domNode),
        { screenToFlowPosition: v } = uo(),
        [g, y] = q.useState(!1),
        S = q.useRef(null),
        _ = q.useCallback(
            ({ prevControl: w, pos: N }) => ({
                x: w == null ? void 0 : w.x,
                y: w == null ? void 0 : w.y,
                ...(d === Qt.Vertical && {
                    y: N.y,
                }),
                ...(d === Qt.Horizontal && {
                    x: N.x,
                }),
            }),
            [d]
        ),
        E = q.useMemo(() => p.slice(1, p.length - 1), [p]),
        k = q.useCallback(
            (w) => {
                c((N) => {
                    const A = (N == null ? void 0 : N.length) === 0 ? E : N,
                        T = A[0],
                        F = A[A.length - 1],
                        V = [...A],
                        K = V[r],
                        ne = V[r + 1],
                        U = {
                            ...K,
                            ..._({
                                prevControl: K,
                                pos: w,
                            }),
                        },
                        W = {
                            ...ne,
                            ..._({
                                prevControl: ne,
                                pos: w,
                            }),
                            active: !0,
                        }
                    ;((V[r] = U), (V[r + 1] = W))
                    const Z = ip(ne, F) && !a && !!F,
                        z = ip(K, T) && !a && !!T
                    return (
                        Z &&
                            V.push({
                                ...F,
                                id: window.crypto.randomUUID(),
                            }),
                        z &&
                            V.unshift({
                                ...T,
                                id: window.crypto.randomUUID(),
                            }),
                        V
                    )
                })
            },
            [c, E, r, _, a]
        ),
        C = q.useCallback(() => {
            c((w) => {
                if (!w.length) return w
                const N = w[r],
                    A = w[r + 1]
                if (
                    (!N && !A) ||
                    !rm({
                        nextPoint: A,
                    })
                )
                    return w
                let T = [...w],
                    F = !1
                if ((N.y === A.y && (F = !0), F)) {
                    const V = T[r + 2]
                    ;((T[r] = {
                        ...T[r],
                        y: V == null ? void 0 : V.y,
                    }),
                        (T[r + 1] = {
                            ...T[r + 1],
                            y: V == null ? void 0 : V.y,
                        }))
                } else {
                    const V = T[r]
                    ;((T[r + 1] = {
                        ...T[r + 1],
                        y: V == null ? void 0 : V.y,
                    }),
                        (T[r + 2] = {
                            ...T[r + 2],
                            y: V == null ? void 0 : V.y,
                        }))
                }
                return (
                    (T = sE(T)),
                    (T[1] = {
                        ...T[1],
                        active: !1,
                    }),
                    (T[T.length - 1] = {
                        ...T[T.length - 1],
                        active: !1,
                    }),
                    T.length < E.length ? [] : T
                )
            })
        }, [r, c, E]),
        I = q.useCallback(
            (w) => {
                switch (w.key) {
                    case 'Enter':
                    case 'Space':
                        ;(a || w.preventDefault(),
                            k({
                                x: i,
                                y: l,
                            }))
                        break
                    case 'Backspace':
                    case 'Delete':
                        ;(w.stopPropagation(), C())
                        break
                    case 'ArrowLeft':
                        d === Qt.Horizontal &&
                            k({
                                x: i - 5,
                                y: l,
                            })
                        break
                    case 'ArrowRight':
                        d === Qt.Horizontal &&
                            k({
                                x: i + 5,
                                y: l,
                            })
                        break
                    case 'ArrowUp':
                        d === Qt.Vertical &&
                            k({
                                x: i,
                                y: l - 5,
                            })
                        break
                    case 'ArrowDown':
                        d === Qt.Vertical &&
                            k({
                                x: i,
                                y: l + 5,
                            })
                        break
                }
            },
            [a, k, i, l, C, d]
        )
    return (
        q.useEffect(() => {
            if (!m || !a || !g) return
            const w = (A) => {
                    k(
                        v({
                            x: A.clientX,
                            y: A.clientY,
                        })
                    )
                },
                N = (A) => {
                    ;(m.removeEventListener('pointermove', w),
                        a || A.preventDefault(),
                        y(!1),
                        k(
                            v({
                                x: A.clientX,
                                y: A.clientY,
                            })
                        ))
                }
            return (
                m.addEventListener('pointermove', w),
                m.addEventListener('pointerup', N, {
                    once: !0,
                }),
                m.addEventListener('pointerleave', N, {
                    once: !0,
                }),
                () => {
                    ;(m.removeEventListener('pointermove', w),
                        m.removeEventListener('pointerup', N),
                        m.removeEventListener('pointerleave', N),
                        y(!1))
                }
            )
        }, [t, m, g, a, v, c, k]),
        Q.jsx('circle', {
            ref: S,
            tabIndex: 0,
            id: t,
            className: 'nopan nodrag' + (a ? ' active' : ''),
            cx: i,
            cy: l,
            r: a ? 4 : 3,
            strokeOpacity: a ? 1 : 0.3,
            stroke: u,
            fill: a ? u : 'white',
            style: {
                pointerEvents: 'all',
            },
            onContextMenu: (w) => {
                ;(w.preventDefault(), a && C())
            },
            onPointerDown: (w) => {
                w.button !== 2 &&
                    (k({
                        x: i,
                        y: l,
                    }),
                    y(!0))
            },
            onKeyDown: I,
            onPointerUp: () => y(!1),
        })
    )
}
const uE = (t) => {
    const r = q.useRef([])
    return r.current.length === t.length
        ? t.map((i, l) =>
              i.id
                  ? i
                  : {
                        ...i,
                        id: r.current[l],
                    }
          )
        : ((r.current = []),
          t.map((i, l) => {
              if (i.id) return ((r.current[l] = i.id), i)
              {
                  const u = window.crypto.randomUUID()
                  return (
                      (r.current[l] = u),
                      {
                          ...i,
                          id: u,
                      }
                  )
              }
          }))
}
function aE({
    id: t,
    selected: r,
    source: i,
    sourceX: l,
    sourceY: u,
    sourcePosition: a,
    target: c,
    targetX: d,
    targetY: p,
    targetPosition: m,
    markerEnd: v,
    markerStart: g,
    style: y,
    data: S = {
        points: [],
    },
    ..._
}) {
    const E = {
            x: l,
            y: u,
        },
        k = {
            x: d,
            y: p,
        },
        C = gc[S.algorithm ?? Ye.BezierCatmullRom],
        { setEdges: I } = uo(),
        w = Ce((Z) => {
            const z = Z.nodeLookup.get(i),
                B = Z.nodeLookup.get(c)
            return r || z.selected || B.selected
        }),
        N = q.useMemo(
            () =>
                tm({
                    source: {
                        x: l,
                        y: u,
                    },
                    target: {
                        x: d,
                        y: p,
                    },
                    offset: eo,
                    sourcePosition: a,
                    targetPosition: m,
                }).map((Z, z) => ({
                    ...Z,
                    id: `${z}`,
                })),
            [a, l, u, m, d, p]
        ),
        A = S.algorithm === Ye.Step,
        T = q.useMemo(
            () =>
                A
                    ? nE({
                          points: S.points,
                          source: {
                              x: l,
                              y: u,
                          },
                          target: {
                              x: d,
                              y: p,
                          },
                          sides: {
                              fromSide: a,
                              toSide: m,
                          },
                      })
                    : S.points,
            [A, S.points, l, u, d, p, a, m]
        ),
        F = q.useRef([])
    F.current = T
    const V = q.useCallback(
            (Z) => {
                I((z) =>
                    z.map((B) => {
                        var L
                        if (B.id !== t || !cE(B)) return B
                        let H = []
                        A
                            ? (H = F.current)
                            : (H =
                                  ((L = B.data) == null ? void 0 : L.points) ??
                                  [])
                        const b = {
                            ...(B == null ? void 0 : B.data),
                            points: Z(H),
                        }
                        return {
                            ...B,
                            data: b,
                        }
                    })
                )
            },
            [I, t, A]
        ),
        K = [E, ...T, k],
        ne = iE({
            points: K,
            algorithm: S.algorithm,
            sides: {
                fromSide: a,
                toSide: m,
            },
            initialStepPoints: N,
        }),
        U = om({
            points: K,
            algorithm: S.algorithm,
            sides: {
                fromSide: a,
                toSide: m,
            },
            initialStepPoints: N,
        }),
        W = uE(ne)
    return Q.jsxs(Q.Fragment, {
        children: [
            Q.jsx(ki, {
                id: t,
                path: U,
                ..._,
                markerStart: g,
                markerEnd: v,
                style: {
                    ...y,
                    strokeWidth: 2,
                    stroke: C,
                },
            }),
            w &&
                !A &&
                W.map((Z, z) =>
                    Q.jsx(
                        G_,
                        {
                            index: z,
                            setControlPoints: V,
                            color: C,
                            ...Z,
                        },
                        Z.id
                    )
                ),
            w &&
                A &&
                W.map((Z, z) =>
                    Q.jsx(
                        lE,
                        {
                            index: z,
                            setControlPoints: V,
                            color: C,
                            direction: Z.direction,
                            initialStepPoints: N,
                            ...Z,
                        },
                        Z.id
                    )
                ),
        ],
    })
}
const cE = (t) => t.type === 'editable-edge'
function fE() {
    return Q.jsxs(Q.Fragment, {
        children: [
            Q.jsx(Vn, {
                type: 'source',
                position: ae.Top,
                id: 'top',
            }),
            Q.jsx(Vn, {
                type: 'source',
                position: ae.Left,
                id: 'left',
            }),
            Q.jsx(Vn, {
                type: 'source',
                position: ae.Bottom,
                id: 'bottom',
            }),
            Q.jsx(Vn, {
                type: 'source',
                position: ae.Right,
                id: 'right',
            }),
        ],
    })
}
const dE = {
        custom: fE,
    },
    hE = [
        {
            id: '1',
            type: 'custom',
            data: {},
            position: {
                x: 0,
                y: 0,
            },
        },
        {
            id: '2',
            type: 'custom',
            data: {},
            position: {
                x: 250,
                y: 0,
            },
        },
        {
            id: '3',
            type: 'custom',
            data: {},
            position: {
                x: 0,
                y: 175,
            },
        },
        {
            id: '4',
            type: 'custom',
            data: {},
            position: {
                x: 250,
                y: 100,
            },
        },
        {
            id: '5',
            type: 'custom',
            data: {},
            position: {
                x: 0,
                y: 350,
            },
        },
        {
            id: '6',
            type: 'custom',
            data: {},
            position: {
                x: 250,
                y: 250,
            },
        },
        {
            id: '7',
            type: 'custom',
            data: {},
            position: {
                x: 0,
                y: 550,
            },
        },
        {
            id: '8',
            type: 'custom',
            data: {},
            position: {
                x: 250,
                y: 450,
            },
        },
    ],
    pE = {
        'editable-edge': aE,
    },
    gE = [
        {
            id: '1->2',
            type: 'editable-edge',
            source: '1',
            target: '2',
            sourceHandle: 'right',
            targetHandle: 'left',
            animated: !0,
            data: {
                algorithm: Ye.CatmullRom,
                points: [
                    {
                        x: 92.5,
                        y: 24.75,
                        id: 'spline-d24e57b4-88ad-47af-8b4e-9ecec78e5066',
                        active: !0,
                    },
                    {
                        x: 129.5,
                        y: 16.25,
                        id: 'spline-bec90e8b-2d76-4727-a4d6-9fabdf18aea5',
                        active: !0,
                    },
                    {
                        x: 168,
                        y: -19.25,
                        id: 'spline-8d5f62cc-e9d7-4460-98fd-bd9b902bc671',
                        active: !0,
                    },
                    {
                        x: 143,
                        y: -45,
                        id: 'spline-252e2875-a052-43fb-9f01-c4670fd3170c',
                        active: !0,
                    },
                    {
                        x: 119.5,
                        y: -20.75,
                        id: 'spline-f37a3789-dfb7-46e7-abed-04374b274ce3',
                        active: !0,
                    },
                    {
                        x: 159.5,
                        y: 17.25,
                        id: 'spline-724c522e-c90b-46c3-9e95-8b99d955cc70',
                        active: !0,
                    },
                    {
                        x: 202.5,
                        y: 23.25,
                        id: 'spline-e97e7074-c028-4cf6-82dc-b6ed1690db2f',
                        active: !0,
                    },
                ],
            },
        },
        {
            id: '3->4',
            type: 'editable-edge',
            source: '3',
            target: '4',
            sourceHandle: 'right',
            targetHandle: 'left',
            data: {
                algorithm: Ye.BezierCatmullRom,
                points: [],
            },
        },
        {
            id: '5->6',
            type: 'editable-edge',
            source: '5',
            target: '6',
            sourceHandle: 'right',
            targetHandle: 'left',
            animated: !0,
            data: {
                algorithm: Ye.Step,
                points: [],
            },
        },
        {
            id: '7->8',
            type: 'editable-edge',
            source: '7',
            target: '8',
            sourceHandle: 'right',
            targetHandle: 'left',
            animated: !1,
            data: {
                algorithm: Ye.Linear,
                points: [
                    {
                        x: 100,
                        y: 575,
                        id: 'spline-964fc95f-2399-4a62-9dd1-3a5d66a5459a',
                        active: !0,
                    },
                    {
                        x: 100,
                        y: 525,
                        id: 'spline-51c08f0b-3092-4e2e-834a-2d71d8d5c396',
                        active: !0,
                    },
                    {
                        x: 150,
                        y: 525,
                        id: 'spline-d53c4828-09c0-4387-92d7-7d72e0ceda7a',
                        active: !0,
                    },
                    {
                        x: 150,
                        y: 625,
                        id: 'spline-0c24fc20-d285-4868-a3d8-730a5f2c683d',
                        active: !0,
                    },
                    {
                        x: 200,
                        y: 625,
                        id: 'spline-4349d5d7-62fc-4b66-99a4-f6760081c1a8',
                        active: !0,
                    },
                    {
                        x: 200,
                        y: 475,
                        id: 'spline-f4cba410-811e-4620-894f-12804138f104',
                        active: !0,
                    },
                ],
            },
        },
    ],
    sp = (t) => {
        let r
        const i = new Set(),
            l = (m, v) => {
                const g = typeof m == 'function' ? m(r) : m
                if (!Object.is(g, r)) {
                    const y = r
                    ;((r =
                        (v ?? (typeof g != 'object' || g === null))
                            ? g
                            : Object.assign({}, r, g)),
                        i.forEach((S) => S(r, y)))
                }
            },
            u = () => r,
            d = {
                setState: l,
                getState: u,
                getInitialState: () => p,
                subscribe: (m) => (i.add(m), () => i.delete(m)),
            },
            p = (r = t(l, u, d))
        return d
    },
    mE = (t) => (t ? sp(t) : sp),
    yE = (t) => t
function vE(t, r = yE) {
    const i = Kr.useSyncExternalStore(
        t.subscribe,
        Kr.useCallback(() => r(t.getState()), [t, r]),
        Kr.useCallback(() => r(t.getInitialState()), [t, r])
    )
    return (Kr.useDebugValue(i), i)
}
const lp = (t) => {
        const r = mE(t),
            i = (l) => vE(r, l)
        return (Object.assign(i, r), i)
    },
    xE = (t) => (t ? lp(t) : lp),
    im = xE((t) => ({
        connectionLinePath: [],
        setConnectionLinePath: (r) => {
            t({
                connectionLinePath: r,
            })
        },
    })),
    wE = ml === Ye.BezierCatmullRom ? 50 : 25
function SE({
    fromX: t,
    fromY: r,
    toX: i,
    toY: l,
    fromPosition: u,
    toPosition: a,
    connectionStatus: c,
}) {
    const { connectionLinePath: d, setConnectionLinePath: p } = im(),
        [m, v] = q.useState(!1),
        g = d[d.length - 1] ?? {
            x: t,
            y: r,
        },
        y = Math.hypot(g.x - i, g.y - l),
        S = m && y > wE
    ;(q.useEffect(() => {
        S &&
            p([
                ...d,
                {
                    x: i,
                    y: l,
                },
            ])
    }, [d, p, S, i, l]),
        q.useEffect(() => {
            function k(I) {
                I.key === ' ' && v(!0)
            }
            function C(I) {
                I.key === ' ' && v(!1)
            }
            return (
                p([]),
                window.addEventListener('keydown', k),
                window.addEventListener('keyup', C),
                () => {
                    ;(window.removeEventListener('keydown', k),
                        window.removeEventListener('keyup', C),
                        v(!1))
                }
            )
        }, [p]))
    const _ = q.useMemo(
            () =>
                tm({
                    source: {
                        x: t,
                        y: r,
                    },
                    target: {
                        x: i,
                        y: l,
                    },
                    offset: eo,
                    sourcePosition: u,
                    targetPosition: a,
                }).map((k, C) => ({
                    ...k,
                    id: `${C}`,
                })),
            [u, t, r, a, i, l]
        ),
        E = om({
            points: [
                {
                    x: t,
                    y: r,
                },
                ...d,
                {
                    x: i,
                    y: l,
                },
            ],
            algorithm: ml,
            sides: {
                fromSide: u,
                toSide: a,
            },
            initialStepPoints: _,
        })
    return Q.jsx('g', {
        children: Q.jsx('path', {
            fill: 'none',
            stroke: gc[ml],
            strokeWidth: 2,
            className: c === 'valid' ? '' : 'animated',
            d: E,
            markerStart: ro.ArrowClosed,
            markerWidth: 25,
            markerEnd: ro.ArrowClosed,
        }),
    })
}
const _E = {
    padding: 0.4,
}
function EE() {
    const [t, , r] = __(hE),
        [i, l, u] = E_(gE),
        a = q.useCallback(
            (c) => {
                const { connectionLinePath: d } = im.getState(),
                    p = {
                        ...c,
                        id: `${Date.now()}-${c.source}-${c.target}`,
                        type: 'editable-edge',
                        selected: !0,
                        data: {
                            algorithm: ml,
                            points: d.map((m, v) => ({
                                ...m,
                                id: window.crypto.randomUUID(),
                                prev: v === 0 ? void 0 : d[v - 1],
                                active: !0,
                            })),
                        },
                    }
                l((m) => ng(p, m))
            },
            [l]
        )
    return Q.jsxs(S_, {
        nodes: t,
        edges: i,
        onNodesChange: r,
        onEdgesChange: u,
        onConnect: a,
        nodeTypes: dE,
        edgeTypes: pE,
        connectionMode: gr.Loose,
        connectionLineComponent: SE,
        fitView: !0,
        fitViewOptions: _E,
        children: [
            Q.jsx(P_, {}),
            Q.jsx(Ei, {
                position: 'top-left',
                children: Object.keys(Ye).map((c) => {
                    const d = Ye[c],
                        p = gc[d]
                    return Q.jsx('div', {
                        style: {
                            color: p,
                            fontWeight: 700,
                        },
                        children: d,
                    })
                }),
            }),
        ],
    })
}
b0.createRoot(document.getElementById('root')).render(
    Q.jsx(Kr.StrictMode, {
        children: Q.jsx(Xg, {
            children: Q.jsx(EE, {}),
        }),
    })
)
