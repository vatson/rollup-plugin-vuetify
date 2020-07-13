(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('vue')) :
  typeof define === 'function' && define.amd ? define(['vue'], factory) :
  (global = global || self, factory(global.Vue));
}(this, (function (Vue) { 'use strict';

  Vue = Vue && Object.prototype.hasOwnProperty.call(Vue, 'default') ? Vue['default'] : Vue;

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  function functionalThemeClasses(context) {
    const vm = { ...context.props,
      ...context.injections
    };
    const isDark = Themeable.options.computed.isDark.call(vm);
    return Themeable.options.computed.themeClasses.call({
      isDark
    });
  }
  /* @vue/component */

  const Themeable = Vue.extend().extend({
    name: 'themeable',

    provide() {
      return {
        theme: this.themeableProvide
      };
    },

    inject: {
      theme: {
        default: {
          isDark: false
        }
      }
    },
    props: {
      dark: {
        type: Boolean,
        default: null
      },
      light: {
        type: Boolean,
        default: null
      }
    },

    data() {
      return {
        themeableProvide: {
          isDark: false
        }
      };
    },

    computed: {
      appIsDark() {
        return this.$vuetify.theme.dark || false;
      },

      isDark() {
        if (this.dark === true) {
          // explicitly dark
          return true;
        } else if (this.light === true) {
          // explicitly light
          return false;
        } else {
          // inherit from parent, or default false if there is none
          return this.theme.isDark;
        }
      },

      themeClasses() {
        return {
          'theme--dark': this.isDark,
          'theme--light': !this.isDark
        };
      },

      /** Used by menus and dialogs, inherits from v-app instead of the parent */
      rootIsDark() {
        if (this.dark === true) {
          // explicitly dark
          return true;
        } else if (this.light === true) {
          // explicitly light
          return false;
        } else {
          // inherit from v-app
          return this.appIsDark;
        }
      },

      rootThemeClasses() {
        return {
          'theme--dark': this.rootIsDark,
          'theme--light': !this.rootIsDark
        };
      }

    },
    watch: {
      isDark: {
        handler(newVal, oldVal) {
          if (newVal !== oldVal) {
            this.themeableProvide.isDark = this.isDark;
          }
        },

        immediate: true
      }
    }
  });

  /* eslint-disable max-len, import/export, no-use-before-define */
  function mixins(...args) {
    return Vue.extend({
      mixins: args
    });
  }

  // Styles
  /* @vue/component */

  var VApp = mixins(Themeable).extend({
    name: 'v-app',
    props: {
      dark: {
        type: Boolean,
        default: undefined
      },
      id: {
        type: String,
        default: 'app'
      },
      light: {
        type: Boolean,
        default: undefined
      }
    },
    computed: {
      isDark() {
        return this.$vuetify.theme.dark;
      }

    },

    beforeCreate() {
      if (!this.$vuetify || this.$vuetify === this.$root) {
        throw new Error('Vuetify is not properly initialized, see https://vuetifyjs.com/getting-started/quick-start#bootstrapping-the-vuetify-object');
      }
    },

    render(h) {
      const wrapper = h('div', {
        staticClass: 'v-application--wrap'
      }, this.$slots.default);
      return h('div', {
        staticClass: 'v-application',
        class: {
          'v-application--is-rtl': this.$vuetify.rtl,
          'v-application--is-ltr': !this.$vuetify.rtl,
          ...this.themeClasses
        },
        attrs: {
          'data-app': true
        },
        domProps: {
          id: this.id
        }
      }, [wrapper]);
    }

  });

  /**
   * This mixin provides `attrs$` and `listeners$` to work around
   * vue bug https://github.com/vuejs/vue/issues/10115
   */

  function makeWatcher(property) {
    return function (val, oldVal) {
      for (const attr in oldVal) {
        if (!Object.prototype.hasOwnProperty.call(val, attr)) {
          this.$delete(this.$data[property], attr);
        }
      }

      for (const attr in val) {
        this.$set(this.$data[property], attr, val[attr]);
      }
    };
  }

  var BindsAttrs = Vue.extend({
    data: () => ({
      attrs$: {},
      listeners$: {}
    }),

    created() {
      // Work around unwanted re-renders: https://github.com/vuejs/vue/issues/10115
      // Make sure to use `attrs$` instead of `$attrs` (confusing right?)
      this.$watch('$attrs', makeWatcher('attrs$'), {
        immediate: true
      });
      this.$watch('$listeners', makeWatcher('listeners$'), {
        immediate: true
      });
    }

  });

  function createMessage(message, vm, parent) {
    if (parent) {
      vm = {
        _isVue: true,
        $parent: parent,
        $options: vm
      };
    }

    if (vm) {
      // Only show each message once per instance
      vm.$_alreadyWarned = vm.$_alreadyWarned || [];
      if (vm.$_alreadyWarned.includes(message)) return;
      vm.$_alreadyWarned.push(message);
    }

    return `[Vuetify] ${message}` + (vm ? generateComponentTrace(vm) : '');
  }
  function consoleWarn(message, vm, parent) {
    const newMessage = createMessage(message, vm, parent);
    newMessage != null && console.warn(newMessage);
  }
  function consoleError(message, vm, parent) {
    const newMessage = createMessage(message, vm, parent);
    newMessage != null && console.error(newMessage);
  }
  function breaking(original, replacement, vm, parent) {
    consoleError(`[BREAKING] '${original}' has been removed, use '${replacement}' instead. For more information, see the upgrade guide https://github.com/vuetifyjs/vuetify/releases/tag/v2.0.0#user-content-upgrade-guide`, vm, parent);
  }
  function removed(original, vm, parent) {
    consoleWarn(`[REMOVED] '${original}' has been removed. You can safely omit it.`, vm, parent);
  }
  /**
   * Shamelessly stolen from vuejs/vue/blob/dev/src/core/util/debug.js
   */

  const classifyRE = /(?:^|[-_])(\w)/g;

  const classify = str => str.replace(classifyRE, c => c.toUpperCase()).replace(/[-_]/g, '');

  function formatComponentName(vm, includeFile) {
    if (vm.$root === vm) {
      return '<Root>';
    }

    const options = typeof vm === 'function' && vm.cid != null ? vm.options : vm._isVue ? vm.$options || vm.constructor.options : vm || {};
    let name = options.name || options._componentTag;
    const file = options.__file;

    if (!name && file) {
      const match = file.match(/([^/\\]+)\.vue$/);
      name = match && match[1];
    }

    return (name ? `<${classify(name)}>` : `<Anonymous>`) + (file && includeFile !== false ? ` at ${file}` : '');
  }

  function generateComponentTrace(vm) {
    if (vm._isVue && vm.$parent) {
      const tree = [];
      let currentRecursiveSequence = 0;

      while (vm) {
        if (tree.length > 0) {
          const last = tree[tree.length - 1];

          if (last.constructor === vm.constructor) {
            currentRecursiveSequence++;
            vm = vm.$parent;
            continue;
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence];
            currentRecursiveSequence = 0;
          }
        }

        tree.push(vm);
        vm = vm.$parent;
      }

      return '\n\nfound in\n\n' + tree.map((vm, i) => `${i === 0 ? '---> ' : ' '.repeat(5 + i * 2)}${Array.isArray(vm) ? `${formatComponentName(vm[0])}... (${vm[1]} recursive calls)` : formatComponentName(vm)}`).join('\n');
    } else {
      return `\n\n(found in ${formatComponentName(vm)})`;
    }
  }

  function isCssColor(color) {
    return !!color && !!color.match(/^(#|var\(--|(rgb|hsl)a?\()/);
  }

  var Colorable = Vue.extend({
    name: 'colorable',
    props: {
      color: String
    },
    methods: {
      setBackgroundColor(color, data = {}) {
        if (typeof data.style === 'string') {
          // istanbul ignore next
          consoleError('style must be an object', this); // istanbul ignore next

          return data;
        }

        if (typeof data.class === 'string') {
          // istanbul ignore next
          consoleError('class must be an object', this); // istanbul ignore next

          return data;
        }

        if (isCssColor(color)) {
          data.style = { ...data.style,
            'background-color': `${color}`,
            'border-color': `${color}`
          };
        } else if (color) {
          data.class = { ...data.class,
            [color]: true
          };
        }

        return data;
      },

      setTextColor(color, data = {}) {
        if (typeof data.style === 'string') {
          // istanbul ignore next
          consoleError('style must be an object', this); // istanbul ignore next

          return data;
        }

        if (typeof data.class === 'string') {
          // istanbul ignore next
          consoleError('class must be an object', this); // istanbul ignore next

          return data;
        }

        if (isCssColor(color)) {
          data.style = { ...data.style,
            color: `${color}`,
            'caret-color': `${color}`
          };
        } else if (color) {
          const [colorName, colorModifier] = color.toString().trim().split(' ', 2);
          data.class = { ...data.class,
            [colorName + '--text']: true
          };

          if (colorModifier) {
            data.class['text--' + colorModifier] = true;
          }
        }

        return data;
      }

    }
  });

  var Elevatable = Vue.extend({
    name: 'elevatable',
    props: {
      elevation: [Number, String]
    },
    computed: {
      computedElevation() {
        return this.elevation;
      },

      elevationClasses() {
        const elevation = this.computedElevation;
        if (elevation == null) return {};
        if (isNaN(parseInt(elevation))) return {};
        return {
          [`elevation-${this.elevation}`]: true
        };
      }

    }
  });

  function createSimpleFunctional(c, el = 'div', name) {
    return Vue.extend({
      name: name || c.replace(/__/g, '-'),
      functional: true,

      render(h, {
        data,
        children
      }) {
        data.staticClass = `${c} ${data.staticClass || ''}`.trim();
        return h(el, data, children);
      }

    });
  }
  let passiveSupported = false;

  try {
    if (typeof window !== 'undefined') {
      const testListenerOpts = Object.defineProperty({}, 'passive', {
        get: () => {
          passiveSupported = true;
        }
      });
      window.addEventListener('testListener', testListenerOpts, testListenerOpts);
      window.removeEventListener('testListener', testListenerOpts, testListenerOpts);
    }
  } catch (e) {
    console.warn(e);
  }
  function getNestedValue(obj, path, fallback) {
    const last = path.length - 1;
    if (last < 0) return obj === undefined ? fallback : obj;

    for (let i = 0; i < last; i++) {
      if (obj == null) {
        return fallback;
      }

      obj = obj[path[i]];
    }

    if (obj == null) return fallback;
    return obj[path[last]] === undefined ? fallback : obj[path[last]];
  }
  function deepEqual(a, b) {
    if (a === b) return true;

    if (a instanceof Date && b instanceof Date) {
      // If the values are Date, they were convert to timestamp with getTime and compare it
      if (a.getTime() !== b.getTime()) return false;
    }

    if (a !== Object(a) || b !== Object(b)) {
      // If the values aren't objects, they were already checked for equality
      return false;
    }

    const props = Object.keys(a);

    if (props.length !== Object.keys(b).length) {
      // Different number of props, don't bother to check
      return false;
    }

    return props.every(p => deepEqual(a[p], b[p]));
  }
  function getObjectValueByPath(obj, path, fallback) {
    // credit: http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key#comment55278413_6491621
    if (obj == null || !path || typeof path !== 'string') return fallback;
    if (obj[path] !== undefined) return obj[path];
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties

    path = path.replace(/^\./, ''); // strip a leading dot

    return getNestedValue(obj, path.split('.'), fallback);
  }
  function getPropertyFromItem(item, property, fallback) {
    if (property == null) return item === undefined ? fallback : item;
    if (item !== Object(item)) return fallback === undefined ? item : fallback;
    if (typeof property === 'string') return getObjectValueByPath(item, property, fallback);
    if (Array.isArray(property)) return getNestedValue(item, property, fallback);
    if (typeof property !== 'function') return fallback;
    const value = property(item, fallback);
    return typeof value === 'undefined' ? fallback : value;
  }
  function getZIndex(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return 0;
    const index = +window.getComputedStyle(el).getPropertyValue('z-index');
    if (!index) return getZIndex(el.parentNode);
    return index;
  }
  const tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  };
  function escapeHTML(str) {
    return str.replace(/[&<>]/g, tag => tagsToReplace[tag] || tag);
  }
  function filterObjectOnKeys(obj, keys) {
    const filtered = {};

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (typeof obj[key] !== 'undefined') {
        filtered[key] = obj[key];
      }
    }

    return filtered;
  }
  function convertToUnit(str, unit = 'px') {
    if (str == null || str === '') {
      return undefined;
    } else if (isNaN(+str)) {
      return String(str);
    } else {
      return `${Number(str)}${unit}`;
    }
  }
  function kebabCase(str) {
    return (str || '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  function isObject(obj) {
    return obj !== null && typeof obj === 'object';
  } // KeyboardEvent.keyCode aliases

  const keyCodes = Object.freeze({
    enter: 13,
    tab: 9,
    delete: 46,
    esc: 27,
    space: 32,
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    end: 35,
    home: 36,
    del: 46,
    backspace: 8,
    insert: 45,
    pageup: 33,
    pagedown: 34
  }); // This remaps internal names like '$cancel' or '$vuetify.icons.cancel'
  // to the current name or component for that icon.

  function remapInternalIcon(vm, iconName) {
    if (!iconName.startsWith('$')) {
      return iconName;
    } // Get the target icon name


    const iconPath = `$vuetify.icons.values.${iconName.split('$').pop().split('.').pop()}`; // Now look up icon indirection name,
    // e.g. '$vuetify.icons.values.cancel'

    return getObjectValueByPath(vm, iconPath, iconName);
  }
  function keys(o) {
    return Object.keys(o);
  }
  /**
   * Camelize a hyphen-delimited string.
   */

  const camelizeRE = /-(\w)/g;
  const camelize = str => {
    return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '');
  };
  /**
   * Makes the first character of a string uppercase
   */

  function upperFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  function wrapInArray(v) {
    return v != null ? Array.isArray(v) ? v : [v] : [];
  }
  /**
   * Returns:
   *  - 'normal' for old style slots - `<template slot="default">`
   *  - 'scoped' for old style scoped slots (`<template slot="default" slot-scope="data">`) or bound v-slot (`#default="data"`)
   *  - 'v-slot' for unbound v-slot (`#default`) - only if the third param is true, otherwise counts as scoped
   */

  function getSlotType(vm, name, split) {
    if (vm.$slots[name] && vm.$scopedSlots[name] && vm.$scopedSlots[name].name) {
      return split ? 'v-slot' : 'scoped';
    }

    if (vm.$slots[name]) return 'normal';
    if (vm.$scopedSlots[name]) return 'scoped';
  }
  function getSlot(vm, name = 'default', data, optional = false) {
    if (vm.$scopedSlots[name]) {
      return vm.$scopedSlots[name](data instanceof Function ? data() : data);
    } else if (vm.$slots[name] && (!data || optional)) {
      return vm.$slots[name];
    }

    return undefined;
  }
  function clamp(value, min = 0, max = 1) {
    return Math.max(min, Math.min(max, value));
  }
  function mergeDeep(source = {}, target = {}) {
    for (const key in target) {
      const sourceProperty = source[key];
      const targetProperty = target[key]; // Only continue deep merging if
      // both properties are objects

      if (isObject(sourceProperty) && isObject(targetProperty)) {
        source[key] = mergeDeep(sourceProperty, targetProperty);
        continue;
      }

      source[key] = targetProperty;
    }

    return source;
  }

  // Helpers
  var Measurable = Vue.extend({
    name: 'measurable',
    props: {
      height: [Number, String],
      maxHeight: [Number, String],
      maxWidth: [Number, String],
      minHeight: [Number, String],
      minWidth: [Number, String],
      width: [Number, String]
    },
    computed: {
      measurableStyles() {
        const styles = {};
        const height = convertToUnit(this.height);
        const minHeight = convertToUnit(this.minHeight);
        const minWidth = convertToUnit(this.minWidth);
        const maxHeight = convertToUnit(this.maxHeight);
        const maxWidth = convertToUnit(this.maxWidth);
        const width = convertToUnit(this.width);
        if (height) styles.height = height;
        if (minHeight) styles.minHeight = minHeight;
        if (minWidth) styles.minWidth = minWidth;
        if (maxHeight) styles.maxHeight = maxHeight;
        if (maxWidth) styles.maxWidth = maxWidth;
        if (width) styles.width = width;
        return styles;
      }

    }
  });

  // Styles
  /* @vue/component */

  var VSheet = mixins(BindsAttrs, Colorable, Elevatable, Measurable, Themeable).extend({
    name: 'v-sheet',
    props: {
      tag: {
        type: String,
        default: 'div'
      },
      tile: Boolean
    },
    computed: {
      classes() {
        return {
          'v-sheet': true,
          'v-sheet--tile': this.tile,
          ...this.themeClasses,
          ...this.elevationClasses
        };
      },

      styles() {
        return this.measurableStyles;
      }

    },

    render(h) {
      const data = {
        class: this.classes,
        style: this.styles,
        on: this.listeners$
      };
      return h(this.tag, this.setBackgroundColor(this.color, data), this.$slots.default);
    }

  });

  function inserted(el, binding) {
    const modifiers = binding.modifiers || {};
    const value = binding.value;
    const {
      handler,
      options
    } = typeof value === 'object' ? value : {
      handler: value,
      options: {}
    };
    const observer = new IntersectionObserver((entries = [], observer) => {
      /* istanbul ignore if */
      if (!el._observe) return; // Just in case, should never fire
      // If is not quiet or has already been
      // initted, invoke the user callback

      if (handler && (!modifiers.quiet || el._observe.init)) {
        const isIntersecting = Boolean(entries.find(entry => entry.isIntersecting));
        handler(entries, observer, isIntersecting);
      } // If has already been initted and
      // has the once modifier, unbind


      if (el._observe.init && modifiers.once) unbind(el); // Otherwise, mark the observer as initted
      else el._observe.init = true;
    }, options);
    el._observe = {
      init: false,
      observer
    };
    observer.observe(el);
  }

  function unbind(el) {
    /* istanbul ignore if */
    if (!el._observe) return;

    el._observe.observer.unobserve(el);

    delete el._observe;
  }

  const Intersect = {
    inserted,
    unbind
  };

  function inserted$1(el, binding) {
    const callback = binding.value;
    const options = binding.options || {
      passive: true
    };
    const target = binding.arg ? document.querySelector(binding.arg) : window;
    if (!target) return;
    target.addEventListener('scroll', callback, options);
    el._onScroll = {
      callback,
      options,
      target
    };
  }

  function unbind$1(el) {
    if (!el._onScroll) return;
    const {
      callback,
      options,
      target
    } = el._onScroll;
    target.removeEventListener('scroll', callback, options);
    delete el._onScroll;
  }

  const Scroll = {
    inserted: inserted$1,
    unbind: unbind$1
  };

  const availableProps = {
    absolute: Boolean,
    bottom: Boolean,
    fixed: Boolean,
    left: Boolean,
    right: Boolean,
    top: Boolean
  };
  function factory(selected = []) {
    return Vue.extend({
      name: 'positionable',
      props: selected.length ? filterObjectOnKeys(availableProps, selected) : availableProps
    });
  }
  var Positionable = factory(); // Add a `*` before the second `/`

  /* Tests /
  let single = factory(['top']).extend({
    created () {
      this.top
      this.bottom
      this.absolute
    }
  })

  let some = factory(['top', 'bottom']).extend({
    created () {
      this.top
      this.bottom
      this.absolute
    }
  })

  let all = factory().extend({
    created () {
      this.top
      this.bottom
      this.absolute
      this.foobar
    }
  })
  /**/

  function closeConditional() {
    return false;
  }

  function directive(e, el, binding) {
    // Args may not always be supplied
    binding.args = binding.args || {}; // If no closeConditional was supplied assign a default

    const isActive = binding.args.closeConditional || closeConditional; // The include element callbacks below can be expensive
    // so we should avoid calling them when we're not active.
    // Explicitly check for false to allow fallback compatibility
    // with non-toggleable components

    if (!e || isActive(e) === false) return; // If click was triggered programmaticaly (domEl.click()) then
    // it shouldn't be treated as click-outside
    // Chrome/Firefox support isTrusted property
    // IE/Edge support pointerType property (empty if not triggered
    // by pointing device)

    if ('isTrusted' in e && !e.isTrusted || 'pointerType' in e && !e.pointerType) return; // Check if additional elements were passed to be included in check
    // (click must be outside all included elements, if any)

    const elements = (binding.args.include || (() => []))(); // Add the root element for the component this directive was defined on


    elements.push(el); // Check if it's a click outside our elements, and then if our callback returns true.
    // Non-toggleable components should take action in their callback and return falsy.
    // Toggleable can return true if it wants to deactivate.
    // Note that, because we're in the capture phase, this callback will occur before
    // the bubbling click event on any outside elements.

    !elements.some(el => el.contains(e.target)) && setTimeout(() => {
      isActive(e) && binding.value && binding.value(e);
    }, 0);
  }

  const ClickOutside = {
    // [data-app] may not be found
    // if using bind, inserted makes
    // sure that the root element is
    // available, iOS does not support
    // clicks on body
    inserted(el, binding) {
      const onClick = e => directive(e, el, binding); // iOS does not recognize click events on document
      // or body, this is the entire purpose of the v-app
      // component and [data-app], stop removing this


      const app = document.querySelector('[data-app]') || document.body; // This is only for unit tests

      app.addEventListener('click', onClick, true);
      el._clickOutside = onClick;
    },

    unbind(el) {
      if (!el._clickOutside) return;
      const app = document.querySelector('[data-app]') || document.body; // This is only for unit tests

      app && app.removeEventListener('click', el._clickOutside, true);
      delete el._clickOutside;
    }

  };

  function inserted$2(el, binding) {
    const callback = binding.value;
    const options = binding.options || {
      passive: true
    };
    window.addEventListener('resize', callback, options);
    el._onResize = {
      callback,
      options
    };

    if (!binding.modifiers || !binding.modifiers.quiet) {
      callback();
    }
  }

  function unbind$2(el) {
    if (!el._onResize) return;
    const {
      callback,
      options
    } = el._onResize;
    window.removeEventListener('resize', callback, options);
    delete el._onResize;
  }

  const Resize = {
    inserted: inserted$2,
    unbind: unbind$2
  };

  // Styles

  function transform(el, value) {
    el.style['transform'] = value;
    el.style['webkitTransform'] = value;
  }

  function opacity(el, value) {
    el.style['opacity'] = value.toString();
  }

  function isTouchEvent(e) {
    return e.constructor.name === 'TouchEvent';
  }

  function isKeyboardEvent(e) {
    return e.constructor.name === 'KeyboardEvent';
  }

  const calculate = (e, el, value = {}) => {
    let localX = 0;
    let localY = 0;

    if (!isKeyboardEvent(e)) {
      const offset = el.getBoundingClientRect();
      const target = isTouchEvent(e) ? e.touches[e.touches.length - 1] : e;
      localX = target.clientX - offset.left;
      localY = target.clientY - offset.top;
    }

    let radius = 0;
    let scale = 0.3;

    if (el._ripple && el._ripple.circle) {
      scale = 0.15;
      radius = el.clientWidth / 2;
      radius = value.center ? radius : radius + Math.sqrt((localX - radius) ** 2 + (localY - radius) ** 2) / 4;
    } else {
      radius = Math.sqrt(el.clientWidth ** 2 + el.clientHeight ** 2) / 2;
    }

    const centerX = `${(el.clientWidth - radius * 2) / 2}px`;
    const centerY = `${(el.clientHeight - radius * 2) / 2}px`;
    const x = value.center ? centerX : `${localX - radius}px`;
    const y = value.center ? centerY : `${localY - radius}px`;
    return {
      radius,
      scale,
      x,
      y,
      centerX,
      centerY
    };
  };

  const ripples = {
    /* eslint-disable max-statements */
    show(e, el, value = {}) {
      if (!el._ripple || !el._ripple.enabled) {
        return;
      }

      const container = document.createElement('span');
      const animation = document.createElement('span');
      container.appendChild(animation);
      container.className = 'v-ripple__container';

      if (value.class) {
        container.className += ` ${value.class}`;
      }

      const {
        radius,
        scale,
        x,
        y,
        centerX,
        centerY
      } = calculate(e, el, value);
      const size = `${radius * 2}px`;
      animation.className = 'v-ripple__animation';
      animation.style.width = size;
      animation.style.height = size;
      el.appendChild(container);
      const computed = window.getComputedStyle(el);

      if (computed && computed.position === 'static') {
        el.style.position = 'relative';
        el.dataset.previousPosition = 'static';
      }

      animation.classList.add('v-ripple__animation--enter');
      animation.classList.add('v-ripple__animation--visible');
      transform(animation, `translate(${x}, ${y}) scale3d(${scale},${scale},${scale})`);
      opacity(animation, 0);
      animation.dataset.activated = String(performance.now());
      setTimeout(() => {
        animation.classList.remove('v-ripple__animation--enter');
        animation.classList.add('v-ripple__animation--in');
        transform(animation, `translate(${centerX}, ${centerY}) scale3d(1,1,1)`);
        opacity(animation, 0.25);
      }, 0);
    },

    hide(el) {
      if (!el || !el._ripple || !el._ripple.enabled) return;
      const ripples = el.getElementsByClassName('v-ripple__animation');
      if (ripples.length === 0) return;
      const animation = ripples[ripples.length - 1];
      if (animation.dataset.isHiding) return;else animation.dataset.isHiding = 'true';
      const diff = performance.now() - Number(animation.dataset.activated);
      const delay = Math.max(250 - diff, 0);
      setTimeout(() => {
        animation.classList.remove('v-ripple__animation--in');
        animation.classList.add('v-ripple__animation--out');
        opacity(animation, 0);
        setTimeout(() => {
          const ripples = el.getElementsByClassName('v-ripple__animation');

          if (ripples.length === 1 && el.dataset.previousPosition) {
            el.style.position = el.dataset.previousPosition;
            delete el.dataset.previousPosition;
          }

          animation.parentNode && el.removeChild(animation.parentNode);
        }, 300);
      }, delay);
    }

  };

  function isRippleEnabled(value) {
    return typeof value === 'undefined' || !!value;
  }

  function rippleShow(e) {
    const value = {};
    const element = e.currentTarget;
    if (!element || !element._ripple || element._ripple.touched) return;

    if (isTouchEvent(e)) {
      element._ripple.touched = true;
      element._ripple.isTouch = true;
    } else {
      // It's possible for touch events to fire
      // as mouse events on Android/iOS, this
      // will skip the event call if it has
      // already been registered as touch
      if (element._ripple.isTouch) return;
    }

    value.center = element._ripple.centered || isKeyboardEvent(e);

    if (element._ripple.class) {
      value.class = element._ripple.class;
    }

    ripples.show(e, element, value);
  }

  function rippleHide(e) {
    const element = e.currentTarget;
    if (!element) return;
    window.setTimeout(() => {
      if (element._ripple) {
        element._ripple.touched = false;
      }
    });
    ripples.hide(element);
  }

  let keyboardRipple = false;

  function keyboardRippleShow(e) {
    if (!keyboardRipple && (e.keyCode === keyCodes.enter || e.keyCode === keyCodes.space)) {
      keyboardRipple = true;
      rippleShow(e);
    }
  }

  function keyboardRippleHide(e) {
    keyboardRipple = false;
    rippleHide(e);
  }

  function updateRipple(el, binding, wasEnabled) {
    const enabled = isRippleEnabled(binding.value);

    if (!enabled) {
      ripples.hide(el);
    }

    el._ripple = el._ripple || {};
    el._ripple.enabled = enabled;
    const value = binding.value || {};

    if (value.center) {
      el._ripple.centered = true;
    }

    if (value.class) {
      el._ripple.class = binding.value.class;
    }

    if (value.circle) {
      el._ripple.circle = value.circle;
    }

    if (enabled && !wasEnabled) {
      el.addEventListener('touchstart', rippleShow, {
        passive: true
      });
      el.addEventListener('touchend', rippleHide, {
        passive: true
      });
      el.addEventListener('touchcancel', rippleHide);
      el.addEventListener('mousedown', rippleShow);
      el.addEventListener('mouseup', rippleHide);
      el.addEventListener('mouseleave', rippleHide);
      el.addEventListener('keydown', keyboardRippleShow);
      el.addEventListener('keyup', keyboardRippleHide); // Anchor tags can be dragged, causes other hides to fail - #1537

      el.addEventListener('dragstart', rippleHide, {
        passive: true
      });
    } else if (!enabled && wasEnabled) {
      removeListeners(el);
    }
  }

  function removeListeners(el) {
    el.removeEventListener('mousedown', rippleShow);
    el.removeEventListener('touchstart', rippleShow);
    el.removeEventListener('touchend', rippleHide);
    el.removeEventListener('touchcancel', rippleHide);
    el.removeEventListener('mouseup', rippleHide);
    el.removeEventListener('mouseleave', rippleHide);
    el.removeEventListener('keydown', keyboardRippleShow);
    el.removeEventListener('keyup', keyboardRippleHide);
    el.removeEventListener('dragstart', rippleHide);
  }

  function directive$1(el, binding, node) {
    updateRipple(el, binding, false);
  }

  function unbind$3(el) {
    delete el._ripple;
    removeListeners(el);
  }

  function update(el, binding) {
    if (binding.value === binding.oldValue) {
      return;
    }

    const wasEnabled = isRippleEnabled(binding.oldValue);
    updateRipple(el, binding, wasEnabled);
  }

  const Ripple = {
    bind: directive$1,
    unbind: unbind$3,
    update
  };

  function factory$1(prop = 'value', event = 'input') {
    return Vue.extend({
      name: 'toggleable',
      model: {
        prop,
        event
      },
      props: {
        [prop]: {
          required: false
        }
      },

      data() {
        return {
          isActive: !!this[prop]
        };
      },

      watch: {
        [prop](val) {
          this.isActive = !!val;
        },

        isActive(val) {
          !!val !== this[prop] && this.$emit(event, val);
        }

      }
    });
  }
  /* eslint-disable-next-line no-redeclare */

  const Toggleable = factory$1();

  var Sizeable = Vue.extend({
    name: 'sizeable',
    props: {
      large: Boolean,
      small: Boolean,
      xLarge: Boolean,
      xSmall: Boolean
    },
    computed: {
      medium() {
        return Boolean(!this.xSmall && !this.small && !this.large && !this.xLarge);
      },

      sizeableClasses() {
        return {
          'v-size--x-small': this.xSmall,
          'v-size--small': this.small,
          'v-size--default': this.medium,
          'v-size--large': this.large,
          'v-size--x-large': this.xLarge
        };
      }

    }
  });

  var SIZE_MAP;

  (function (SIZE_MAP) {
    SIZE_MAP["xSmall"] = "12px";
    SIZE_MAP["small"] = "16px";
    SIZE_MAP["default"] = "24px";
    SIZE_MAP["medium"] = "28px";
    SIZE_MAP["large"] = "36px";
    SIZE_MAP["xLarge"] = "40px";
  })(SIZE_MAP || (SIZE_MAP = {}));

  function isFontAwesome5(iconType) {
    return ['fas', 'far', 'fal', 'fab', 'fad'].some(val => iconType.includes(val));
  }

  function isSvgPath(icon) {
    return /^[mzlhvcsqta]\s*[-+.0-9][^mlhvzcsqta]+/i.test(icon) && /[\dz]$/i.test(icon) && icon.length > 4;
  }

  const VIcon = mixins(BindsAttrs, Colorable, Sizeable, Themeable
  /* @vue/component */
  ).extend({
    name: 'v-icon',
    props: {
      dense: Boolean,
      disabled: Boolean,
      left: Boolean,
      right: Boolean,
      size: [Number, String],
      tag: {
        type: String,
        required: false,
        default: 'i'
      }
    },
    computed: {
      medium() {
        return false;
      },

      hasClickListener() {
        return Boolean(this.listeners$.click || this.listeners$['!click']);
      }

    },
    methods: {
      getIcon() {
        let iconName = '';
        if (this.$slots.default) iconName = this.$slots.default[0].text.trim();
        return remapInternalIcon(this, iconName);
      },

      getSize() {
        const sizes = {
          xSmall: this.xSmall,
          small: this.small,
          medium: this.medium,
          large: this.large,
          xLarge: this.xLarge
        };
        const explicitSize = keys(sizes).find(key => sizes[key]);
        return explicitSize && SIZE_MAP[explicitSize] || convertToUnit(this.size);
      },

      // Component data for both font and svg icon.
      getDefaultData() {
        const data = {
          staticClass: 'v-icon notranslate',
          class: {
            'v-icon--disabled': this.disabled,
            'v-icon--left': this.left,
            'v-icon--link': this.hasClickListener,
            'v-icon--right': this.right,
            'v-icon--dense': this.dense
          },
          attrs: {
            'aria-hidden': !this.hasClickListener,
            disabled: this.hasClickListener && this.disabled,
            type: this.hasClickListener ? 'button' : undefined,
            ...this.attrs$
          },
          on: this.listeners$
        };
        return data;
      },

      applyColors(data) {
        data.class = { ...data.class,
          ...this.themeClasses
        };
        this.setTextColor(this.color, data);
      },

      renderFontIcon(icon, h) {
        const newChildren = [];
        const data = this.getDefaultData();
        let iconType = 'material-icons'; // Material Icon delimiter is _
        // https://material.io/icons/

        const delimiterIndex = icon.indexOf('-');
        const isMaterialIcon = delimiterIndex <= -1;

        if (isMaterialIcon) {
          // Material icon uses ligatures.
          newChildren.push(icon);
        } else {
          iconType = icon.slice(0, delimiterIndex);
          if (isFontAwesome5(iconType)) iconType = '';
        }

        data.class[iconType] = true;
        data.class[icon] = !isMaterialIcon;
        const fontSize = this.getSize();
        if (fontSize) data.style = {
          fontSize
        };
        this.applyColors(data);
        return h(this.hasClickListener ? 'button' : this.tag, data, newChildren);
      },

      renderSvgIcon(icon, h) {
        const fontSize = this.getSize();
        const wrapperData = { ...this.getDefaultData(),
          style: fontSize ? {
            fontSize,
            height: fontSize,
            width: fontSize
          } : undefined
        };
        wrapperData.class['v-icon--svg'] = true;
        this.applyColors(wrapperData);
        const svgData = {
          attrs: {
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: '0 0 24 24',
            height: fontSize || '24',
            width: fontSize || '24',
            role: 'img',
            'aria-hidden': true
          }
        };
        return h(this.hasClickListener ? 'button' : 'span', wrapperData, [h('svg', svgData, [h('path', {
          attrs: {
            d: icon
          }
        })])]);
      },

      renderSvgIconComponent(icon, h) {
        const data = this.getDefaultData();
        data.class['v-icon--is-component'] = true;
        const size = this.getSize();

        if (size) {
          data.style = {
            fontSize: size,
            height: size,
            width: size
          };
        }

        this.applyColors(data);
        const component = icon.component;
        data.props = icon.props;
        data.nativeOn = data.on;
        return h(component, data);
      }

    },

    render(h) {
      const icon = this.getIcon();

      if (typeof icon === 'string') {
        if (isSvgPath(icon)) {
          return this.renderSvgIcon(icon, h);
        }

        return this.renderFontIcon(icon, h);
      }

      return this.renderSvgIconComponent(icon, h);
    }

  });
  var VIcon$1 = Vue.extend({
    name: 'v-icon',
    $_wrapperFor: VIcon,
    functional: true,

    render(h, {
      data,
      children
    }) {
      let iconName = ''; // Support usage of v-text and v-html

      if (data.domProps) {
        iconName = data.domProps.textContent || data.domProps.innerHTML || iconName; // Remove nodes so it doesn't
        // overwrite our changes

        delete data.domProps.textContent;
        delete data.domProps.innerHTML;
      }

      return h(VIcon, data, iconName ? [iconName] : children);
    }

  });

  // Styles
  /* @vue/component */

  var VProgressCircular = Colorable.extend({
    name: 'v-progress-circular',
    props: {
      button: Boolean,
      indeterminate: Boolean,
      rotate: {
        type: [Number, String],
        default: 0
      },
      size: {
        type: [Number, String],
        default: 32
      },
      width: {
        type: [Number, String],
        default: 4
      },
      value: {
        type: [Number, String],
        default: 0
      }
    },
    data: () => ({
      radius: 20
    }),
    computed: {
      calculatedSize() {
        return Number(this.size) + (this.button ? 8 : 0);
      },

      circumference() {
        return 2 * Math.PI * this.radius;
      },

      classes() {
        return {
          'v-progress-circular--indeterminate': this.indeterminate,
          'v-progress-circular--button': this.button
        };
      },

      normalizedValue() {
        if (this.value < 0) {
          return 0;
        }

        if (this.value > 100) {
          return 100;
        }

        return parseFloat(this.value);
      },

      strokeDashArray() {
        return Math.round(this.circumference * 1000) / 1000;
      },

      strokeDashOffset() {
        return (100 - this.normalizedValue) / 100 * this.circumference + 'px';
      },

      strokeWidth() {
        return Number(this.width) / +this.size * this.viewBoxSize * 2;
      },

      styles() {
        return {
          height: convertToUnit(this.calculatedSize),
          width: convertToUnit(this.calculatedSize)
        };
      },

      svgStyles() {
        return {
          transform: `rotate(${Number(this.rotate)}deg)`
        };
      },

      viewBoxSize() {
        return this.radius / (1 - Number(this.width) / +this.size);
      }

    },
    methods: {
      genCircle(name, offset) {
        return this.$createElement('circle', {
          class: `v-progress-circular__${name}`,
          attrs: {
            fill: 'transparent',
            cx: 2 * this.viewBoxSize,
            cy: 2 * this.viewBoxSize,
            r: this.radius,
            'stroke-width': this.strokeWidth,
            'stroke-dasharray': this.strokeDashArray,
            'stroke-dashoffset': offset
          }
        });
      },

      genSvg() {
        const children = [this.indeterminate || this.genCircle('underlay', 0), this.genCircle('overlay', this.strokeDashOffset)];
        return this.$createElement('svg', {
          style: this.svgStyles,
          attrs: {
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: `${this.viewBoxSize} ${this.viewBoxSize} ${2 * this.viewBoxSize} ${2 * this.viewBoxSize}`
          }
        }, children);
      },

      genInfo() {
        return this.$createElement('div', {
          staticClass: 'v-progress-circular__info'
        }, this.$slots.default);
      }

    },

    render(h) {
      return h('div', this.setTextColor(this.color, {
        staticClass: 'v-progress-circular',
        attrs: {
          role: 'progressbar',
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuenow': this.indeterminate ? undefined : this.normalizedValue
        },
        class: this.classes,
        style: this.styles,
        on: this.$listeners
      }), [this.genSvg(), this.genInfo()]);
    }

  });

  function generateWarning(child, parent) {
    return () => consoleWarn(`The ${child} component must be used inside a ${parent}`);
  }

  function inject(namespace, child, parent) {
    const defaultImpl = child && parent ? {
      register: generateWarning(child, parent),
      unregister: generateWarning(child, parent)
    } : null;
    return Vue.extend({
      name: 'registrable-inject',
      inject: {
        [namespace]: {
          default: defaultImpl
        }
      }
    });
  }

  // Mixins
  function factory$2(namespace, child, parent) {
    // TODO: ts 3.4 broke directly returning this
    const R = inject(namespace, child, parent).extend({
      name: 'groupable',
      props: {
        activeClass: {
          type: String,

          default() {
            if (!this[namespace]) return undefined;
            return this[namespace].activeClass;
          }

        },
        disabled: Boolean
      },

      data() {
        return {
          isActive: false
        };
      },

      computed: {
        groupClasses() {
          if (!this.activeClass) return {};
          return {
            [this.activeClass]: this.isActive
          };
        }

      },

      created() {
        this[namespace] && this[namespace].register(this);
      },

      beforeDestroy() {
        this[namespace] && this[namespace].unregister(this);
      },

      methods: {
        toggle() {
          this.$emit('change');
        }

      }
    });
    return R;
  }
  /* eslint-disable-next-line no-redeclare */

  const Groupable = factory$2('itemGroup');

  var Routable = Vue.extend({
    name: 'routable',
    directives: {
      Ripple
    },
    props: {
      activeClass: String,
      append: Boolean,
      disabled: Boolean,
      exact: {
        type: Boolean,
        default: undefined
      },
      exactActiveClass: String,
      link: Boolean,
      href: [String, Object],
      to: [String, Object],
      nuxt: Boolean,
      replace: Boolean,
      ripple: {
        type: [Boolean, Object],
        default: null
      },
      tag: String,
      target: String
    },
    data: () => ({
      isActive: false,
      proxyClass: ''
    }),
    computed: {
      classes() {
        const classes = {};
        if (this.to) return classes;
        if (this.activeClass) classes[this.activeClass] = this.isActive;
        if (this.proxyClass) classes[this.proxyClass] = this.isActive;
        return classes;
      },

      computedRipple() {
        return this.ripple != null ? this.ripple : !this.disabled && this.isClickable;
      },

      isClickable() {
        if (this.disabled) return false;
        return Boolean(this.isLink || this.$listeners.click || this.$listeners['!click'] || this.$attrs.tabindex);
      },

      isLink() {
        return this.to || this.href || this.link;
      },

      styles: () => ({})
    },
    watch: {
      $route: 'onRouteChange'
    },
    methods: {
      click(e) {
        this.$emit('click', e);
      },

      generateRouteLink() {
        let exact = this.exact;
        let tag;
        const data = {
          attrs: {
            tabindex: 'tabindex' in this.$attrs ? this.$attrs.tabindex : undefined
          },
          class: this.classes,
          style: this.styles,
          props: {},
          directives: [{
            name: 'ripple',
            value: this.computedRipple
          }],
          [this.to ? 'nativeOn' : 'on']: { ...this.$listeners,
            click: this.click
          },
          ref: 'link'
        };

        if (typeof this.exact === 'undefined') {
          exact = this.to === '/' || this.to === Object(this.to) && this.to.path === '/';
        }

        if (this.to) {
          // Add a special activeClass hook
          // for component level styles
          let activeClass = this.activeClass;
          let exactActiveClass = this.exactActiveClass || activeClass;

          if (this.proxyClass) {
            activeClass = `${activeClass} ${this.proxyClass}`.trim();
            exactActiveClass = `${exactActiveClass} ${this.proxyClass}`.trim();
          }

          tag = this.nuxt ? 'nuxt-link' : 'router-link';
          Object.assign(data.props, {
            to: this.to,
            exact,
            activeClass,
            exactActiveClass,
            append: this.append,
            replace: this.replace
          });
        } else {
          tag = this.href && 'a' || this.tag || 'div';
          if (tag === 'a' && this.href) data.attrs.href = this.href;
        }

        if (this.target) data.attrs.target = this.target;
        return {
          tag,
          data
        };
      },

      onRouteChange() {
        if (!this.to || !this.$refs.link || !this.$route) return;
        const activeClass = `${this.activeClass} ${this.proxyClass || ''}`.trim();
        const path = `_vnode.data.class.${activeClass}`;
        this.$nextTick(() => {
          /* istanbul ignore else */
          if (getObjectValueByPath(this.$refs.link, path)) {
            this.toggle();
          }
        });
      },

      toggle: () => {}
    }
  });

  // Styles
  const baseMixins = mixins(VSheet, Routable, Positionable, Sizeable, factory$2('btnToggle'), factory$1('inputValue')
  /* @vue/component */
  );
  var VBtn = baseMixins.extend().extend({
    name: 'v-btn',
    props: {
      activeClass: {
        type: String,

        default() {
          if (!this.btnToggle) return '';
          return this.btnToggle.activeClass;
        }

      },
      block: Boolean,
      depressed: Boolean,
      fab: Boolean,
      icon: Boolean,
      loading: Boolean,
      outlined: Boolean,
      retainFocusOnClick: Boolean,
      rounded: Boolean,
      tag: {
        type: String,
        default: 'button'
      },
      text: Boolean,
      type: {
        type: String,
        default: 'button'
      },
      value: null
    },
    data: () => ({
      proxyClass: 'v-btn--active'
    }),
    computed: {
      classes() {
        return {
          'v-btn': true,
          ...Routable.options.computed.classes.call(this),
          'v-btn--absolute': this.absolute,
          'v-btn--block': this.block,
          'v-btn--bottom': this.bottom,
          'v-btn--contained': this.contained,
          'v-btn--depressed': this.depressed || this.outlined,
          'v-btn--disabled': this.disabled,
          'v-btn--fab': this.fab,
          'v-btn--fixed': this.fixed,
          'v-btn--flat': this.isFlat,
          'v-btn--icon': this.icon,
          'v-btn--left': this.left,
          'v-btn--loading': this.loading,
          'v-btn--outlined': this.outlined,
          'v-btn--right': this.right,
          'v-btn--round': this.isRound,
          'v-btn--rounded': this.rounded,
          'v-btn--router': this.to,
          'v-btn--text': this.text,
          'v-btn--tile': this.tile,
          'v-btn--top': this.top,
          ...this.themeClasses,
          ...this.groupClasses,
          ...this.elevationClasses,
          ...this.sizeableClasses
        };
      },

      contained() {
        return Boolean(!this.isFlat && !this.depressed && // Contained class only adds elevation
        // is not needed if user provides value
        !this.elevation);
      },

      computedRipple() {
        const defaultRipple = this.icon || this.fab ? {
          circle: true
        } : true;
        if (this.disabled) return false;else return this.ripple != null ? this.ripple : defaultRipple;
      },

      isFlat() {
        return Boolean(this.icon || this.text || this.outlined);
      },

      isRound() {
        return Boolean(this.icon || this.fab);
      },

      styles() {
        return { ...this.measurableStyles
        };
      }

    },

    created() {
      const breakingProps = [['flat', 'text'], ['outline', 'outlined'], ['round', 'rounded']];
      /* istanbul ignore next */

      breakingProps.forEach(([original, replacement]) => {
        if (this.$attrs.hasOwnProperty(original)) breaking(original, replacement, this);
      });
    },

    methods: {
      click(e) {
        // TODO: Remove this in v3
        !this.retainFocusOnClick && !this.fab && e.detail && this.$el.blur();
        this.$emit('click', e);
        this.btnToggle && this.toggle();
      },

      genContent() {
        return this.$createElement('span', {
          staticClass: 'v-btn__content'
        }, this.$slots.default);
      },

      genLoader() {
        return this.$createElement('span', {
          class: 'v-btn__loader'
        }, this.$slots.loader || [this.$createElement(VProgressCircular, {
          props: {
            indeterminate: true,
            size: 23,
            width: 2
          }
        })]);
      }

    },

    render(h) {
      const children = [this.genContent(), this.loading && this.genLoader()];
      const setColor = !this.isFlat ? this.setBackgroundColor : this.setTextColor;
      const {
        tag,
        data
      } = this.generateRouteLink();

      if (tag === 'button') {
        data.attrs.type = this.type;
        data.attrs.disabled = this.disabled;
      }

      data.attrs.value = ['string', 'number'].includes(typeof this.value) ? this.value : JSON.stringify(this.value);
      return h(tag, this.disabled ? data : setColor(this.color, data), children);
    }

  });

  var Transitionable = Vue.extend({
    name: 'transitionable',
    props: {
      mode: String,
      origin: String,
      transition: String
    }
  });

  // Styles
  /* @vue/component */

  var VAlert = mixins(VSheet, Toggleable, Transitionable).extend({
    name: 'v-alert',
    props: {
      border: {
        type: String,

        validator(val) {
          return ['top', 'right', 'bottom', 'left'].includes(val);
        }

      },
      closeLabel: {
        type: String,
        default: '$vuetify.close'
      },
      coloredBorder: Boolean,
      dense: Boolean,
      dismissible: Boolean,
      icon: {
        default: '',
        type: [Boolean, String],

        validator(val) {
          return typeof val === 'string' || val === false;
        }

      },
      outlined: Boolean,
      prominent: Boolean,
      text: Boolean,
      type: {
        type: String,

        validator(val) {
          return ['info', 'error', 'success', 'warning'].includes(val);
        }

      },
      value: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      __cachedBorder() {
        if (!this.border) return null;
        let data = {
          staticClass: 'v-alert__border',
          class: {
            [`v-alert__border--${this.border}`]: true
          }
        };

        if (this.coloredBorder) {
          data = this.setBackgroundColor(this.computedColor, data);
          data.class['v-alert__border--has-color'] = true;
        }

        return this.$createElement('div', data);
      },

      __cachedDismissible() {
        if (!this.dismissible) return null;
        const color = this.iconColor;
        return this.$createElement(VBtn, {
          staticClass: 'v-alert__dismissible',
          props: {
            color,
            icon: true,
            small: true
          },
          attrs: {
            'aria-label': this.$vuetify.lang.t(this.closeLabel)
          },
          on: {
            click: () => this.isActive = false
          }
        }, [this.$createElement(VIcon$1, {
          props: {
            color
          }
        }, '$cancel')]);
      },

      __cachedIcon() {
        if (!this.computedIcon) return null;
        return this.$createElement(VIcon$1, {
          staticClass: 'v-alert__icon',
          props: {
            color: this.iconColor
          }
        }, this.computedIcon);
      },

      classes() {
        const classes = { ...VSheet.options.computed.classes.call(this),
          'v-alert--border': Boolean(this.border),
          'v-alert--dense': this.dense,
          'v-alert--outlined': this.outlined,
          'v-alert--prominent': this.prominent,
          'v-alert--text': this.text
        };

        if (this.border) {
          classes[`v-alert--border-${this.border}`] = true;
        }

        return classes;
      },

      computedColor() {
        return this.color || this.type;
      },

      computedIcon() {
        if (this.icon === false) return false;
        if (typeof this.icon === 'string' && this.icon) return this.icon;
        if (!['error', 'info', 'success', 'warning'].includes(this.type)) return false;
        return `$${this.type}`;
      },

      hasColoredIcon() {
        return this.hasText || Boolean(this.border) && this.coloredBorder;
      },

      hasText() {
        return this.text || this.outlined;
      },

      iconColor() {
        return this.hasColoredIcon ? this.computedColor : undefined;
      },

      isDark() {
        if (this.type && !this.coloredBorder && !this.outlined) return true;
        return Themeable.options.computed.isDark.call(this);
      }

    },

    created() {
      /* istanbul ignore next */
      if (this.$attrs.hasOwnProperty('outline')) {
        breaking('outline', 'outlined', this);
      }
    },

    methods: {
      genWrapper() {
        const children = [this.$slots.prepend || this.__cachedIcon, this.genContent(), this.__cachedBorder, this.$slots.append, this.$scopedSlots.close ? this.$scopedSlots.close({
          toggle: this.toggle
        }) : this.__cachedDismissible];
        const data = {
          staticClass: 'v-alert__wrapper'
        };
        return this.$createElement('div', data, children);
      },

      genContent() {
        return this.$createElement('div', {
          staticClass: 'v-alert__content'
        }, this.$slots.default);
      },

      genAlert() {
        let data = {
          staticClass: 'v-alert',
          attrs: {
            role: 'alert'
          },
          class: this.classes,
          style: this.styles,
          directives: [{
            name: 'show',
            value: this.isActive
          }]
        };

        if (!this.coloredBorder) {
          const setColor = this.hasText ? this.setTextColor : this.setBackgroundColor;
          data = setColor(this.computedColor, data);
        }

        return this.$createElement('div', data, [this.genWrapper()]);
      },

      /** @public */
      toggle() {
        this.isActive = !this.isActive;
      }

    },

    render(h) {
      const render = this.genAlert();
      if (!this.transition) return render;
      return h('transition', {
        props: {
          name: this.transition,
          origin: this.origin,
          mode: this.mode
        }
      }, [render]);
    }

  });

  const pattern = {
    styleList: /;(?![^(]*\))/g,
    styleProp: /:(.*)/
  };

  function parseStyle(style) {
    const styleMap = {};

    for (const s of style.split(pattern.styleList)) {
      let [key, val] = s.split(pattern.styleProp);
      key = key.trim();

      if (!key) {
        continue;
      } // May be undefined if the `key: value` pair is incomplete.


      if (typeof val === 'string') {
        val = val.trim();
      }

      styleMap[camelize(key)] = val;
    }

    return styleMap;
  }

  function mergeData() {
    const mergeTarget = {};
    let i = arguments.length;
    let prop;
    let event; // Allow for variadic argument length.

    while (i--) {
      // Iterate through the data properties and execute merge strategies
      // Object.keys eliminates need for hasOwnProperty call
      for (prop of Object.keys(arguments[i])) {
        switch (prop) {
          // Array merge strategy (array concatenation)
          case 'class':
          case 'style':
          case 'directives':
            if (!arguments[i][prop]) {
              break;
            }

            if (!Array.isArray(mergeTarget[prop])) {
              mergeTarget[prop] = [];
            }

            if (prop === 'style') {
              let style;

              if (Array.isArray(arguments[i].style)) {
                style = arguments[i].style;
              } else {
                style = [arguments[i].style];
              }

              for (let j = 0; j < style.length; j++) {
                const s = style[j];

                if (typeof s === 'string') {
                  style[j] = parseStyle(s);
                }
              }

              arguments[i].style = style;
            } // Repackaging in an array allows Vue runtime
            // to merge class/style bindings regardless of type.


            mergeTarget[prop] = mergeTarget[prop].concat(arguments[i][prop]);
            break;
          // Space delimited string concatenation strategy

          case 'staticClass':
            if (!arguments[i][prop]) {
              break;
            }

            if (mergeTarget[prop] === undefined) {
              mergeTarget[prop] = '';
            }

            if (mergeTarget[prop]) {
              // Not an empty string, so concatenate
              mergeTarget[prop] += ' ';
            }

            mergeTarget[prop] += arguments[i][prop].trim();
            break;
          // Object, the properties of which to merge via array merge strategy (array concatenation).
          // Callback merge strategy merges callbacks to the beginning of the array,
          // so that the last defined callback will be invoked first.
          // This is done since to mimic how Object.assign merging
          // uses the last given value to assign.

          case 'on':
          case 'nativeOn':
            if (!arguments[i][prop]) {
              break;
            }

            if (!mergeTarget[prop]) {
              mergeTarget[prop] = {};
            }

            const listeners = mergeTarget[prop];

            for (event of Object.keys(arguments[i][prop] || {})) {
              // Concat function to array of functions if callback present.
              if (listeners[event]) {
                // Insert current iteration data in beginning of merged array.
                listeners[event] = Array().concat( // eslint-disable-line
                listeners[event], arguments[i][prop][event]);
              } else {
                // Straight assign.
                listeners[event] = arguments[i][prop][event];
              }
            }

            break;
          // Object merge strategy

          case 'attrs':
          case 'props':
          case 'domProps':
          case 'scopedSlots':
          case 'staticStyle':
          case 'hook':
          case 'transition':
            if (!arguments[i][prop]) {
              break;
            }

            if (!mergeTarget[prop]) {
              mergeTarget[prop] = {};
            }

            mergeTarget[prop] = { ...arguments[i][prop],
              ...mergeTarget[prop]
            };
            break;
          // Reassignment strategy (no merge)

          case 'slot':
          case 'key':
          case 'ref':
          case 'tag':
          case 'show':
          case 'keepAlive':
          default:
            if (!mergeTarget[prop]) {
              mergeTarget[prop] = arguments[i][prop];
            }

        }
      }
    }

    return mergeTarget;
  }

  function mergeTransitions(dest = [], ...transitions) {
    /* eslint-disable-next-line no-array-constructor */
    return Array().concat(dest, ...transitions);
  }

  function createSimpleTransition(name, origin = 'top center 0', mode) {
    return {
      name,
      functional: true,
      props: {
        group: {
          type: Boolean,
          default: false
        },
        hideOnLeave: {
          type: Boolean,
          default: false
        },
        leaveAbsolute: {
          type: Boolean,
          default: false
        },
        mode: {
          type: String,
          default: mode
        },
        origin: {
          type: String,
          default: origin
        }
      },

      render(h, context) {
        const tag = `transition${context.props.group ? '-group' : ''}`;
        const data = {
          props: {
            name,
            mode: context.props.mode
          },
          on: {
            beforeEnter(el) {
              el.style.transformOrigin = context.props.origin;
              el.style.webkitTransformOrigin = context.props.origin;
            }

          }
        };

        if (context.props.leaveAbsolute) {
          data.on.leave = mergeTransitions(data.on.leave, el => el.style.position = 'absolute');
        }

        if (context.props.hideOnLeave) {
          data.on.leave = mergeTransitions(data.on.leave, el => el.style.display = 'none');
        }

        return h(tag, mergeData(context.data, data), context.children);
      }

    };
  }
  function createJavascriptTransition(name, functions, mode = 'in-out') {
    return {
      name,
      functional: true,
      props: {
        mode: {
          type: String,
          default: mode
        }
      },

      render(h, context) {
        return h('transition', mergeData(context.data, {
          props: {
            name
          },
          on: functions
        }), context.children);
      }

    };
  }

  function ExpandTransitionGenerator (expandedParentClass = '', x = false) {
    const sizeProperty = x ? 'width' : 'height';
    const offsetProperty = `offset${upperFirst(sizeProperty)}`;
    return {
      beforeEnter(el) {
        el._parent = el.parentNode;
        el._initialStyle = {
          transition: el.style.transition,
          visibility: el.style.visibility,
          overflow: el.style.overflow,
          [sizeProperty]: el.style[sizeProperty]
        };
      },

      enter(el) {
        const initialStyle = el._initialStyle;
        const offset = `${el[offsetProperty]}px`;
        el.style.setProperty('transition', 'none', 'important');
        el.style.visibility = 'hidden';
        el.style.visibility = initialStyle.visibility;
        el.style.overflow = 'hidden';
        el.style[sizeProperty] = '0';
        void el.offsetHeight; // force reflow

        el.style.transition = initialStyle.transition;

        if (expandedParentClass && el._parent) {
          el._parent.classList.add(expandedParentClass);
        }

        requestAnimationFrame(() => {
          el.style[sizeProperty] = offset;
        });
      },

      afterEnter: resetStyles,
      enterCancelled: resetStyles,

      leave(el) {
        el._initialStyle = {
          transition: '',
          visibility: '',
          overflow: el.style.overflow,
          [sizeProperty]: el.style[sizeProperty]
        };
        el.style.overflow = 'hidden';
        el.style[sizeProperty] = `${el[offsetProperty]}px`;
        void el.offsetHeight; // force reflow

        requestAnimationFrame(() => el.style[sizeProperty] = '0');
      },

      afterLeave,
      leaveCancelled: afterLeave
    };

    function afterLeave(el) {
      if (expandedParentClass && el._parent) {
        el._parent.classList.remove(expandedParentClass);
      }

      resetStyles(el);
    }

    function resetStyles(el) {
      const size = el._initialStyle[sizeProperty];
      el.style.overflow = el._initialStyle.overflow;
      if (size != null) el.style[sizeProperty] = size;
      delete el._initialStyle;
    }
  }

  const VFadeTransition = createSimpleTransition('fade-transition');
  const VSlideXTransition = createSimpleTransition('slide-x-transition');

  const VExpandTransition = createJavascriptTransition('expand-transition', ExpandTransitionGenerator());
  const VExpandXTransition = createJavascriptTransition('expand-x-transition', ExpandTransitionGenerator('', true));

  // Styles
  /* @vue/component */

  var VChip = mixins(Colorable, Sizeable, Routable, Themeable, factory$2('chipGroup'), factory$1('inputValue')).extend({
    name: 'v-chip',
    props: {
      active: {
        type: Boolean,
        default: true
      },
      activeClass: {
        type: String,

        default() {
          if (!this.chipGroup) return '';
          return this.chipGroup.activeClass;
        }

      },
      close: Boolean,
      closeIcon: {
        type: String,
        default: '$delete'
      },
      disabled: Boolean,
      draggable: Boolean,
      filter: Boolean,
      filterIcon: {
        type: String,
        default: '$complete'
      },
      label: Boolean,
      link: Boolean,
      outlined: Boolean,
      pill: Boolean,
      tag: {
        type: String,
        default: 'span'
      },
      textColor: String,
      value: null
    },
    data: () => ({
      proxyClass: 'v-chip--active'
    }),
    computed: {
      classes() {
        return {
          'v-chip': true,
          ...Routable.options.computed.classes.call(this),
          'v-chip--clickable': this.isClickable,
          'v-chip--disabled': this.disabled,
          'v-chip--draggable': this.draggable,
          'v-chip--label': this.label,
          'v-chip--link': this.isLink,
          'v-chip--no-color': !this.color,
          'v-chip--outlined': this.outlined,
          'v-chip--pill': this.pill,
          'v-chip--removable': this.hasClose,
          ...this.themeClasses,
          ...this.sizeableClasses,
          ...this.groupClasses
        };
      },

      hasClose() {
        return Boolean(this.close);
      },

      isClickable() {
        return Boolean(Routable.options.computed.isClickable.call(this) || this.chipGroup);
      }

    },

    created() {
      const breakingProps = [['outline', 'outlined'], ['selected', 'input-value'], ['value', 'active'], ['@input', '@active.sync']];
      /* istanbul ignore next */

      breakingProps.forEach(([original, replacement]) => {
        if (this.$attrs.hasOwnProperty(original)) breaking(original, replacement, this);
      });
    },

    methods: {
      click(e) {
        this.$emit('click', e);
        this.chipGroup && this.toggle();
      },

      genFilter() {
        const children = [];

        if (this.isActive) {
          children.push(this.$createElement(VIcon$1, {
            staticClass: 'v-chip__filter',
            props: {
              left: true
            }
          }, this.filterIcon));
        }

        return this.$createElement(VExpandXTransition, children);
      },

      genClose() {
        return this.$createElement(VIcon$1, {
          staticClass: 'v-chip__close',
          props: {
            right: true,
            size: 18
          },
          on: {
            click: e => {
              e.stopPropagation();
              e.preventDefault();
              this.$emit('click:close');
              this.$emit('update:active', false);
            }
          }
        }, this.closeIcon);
      },

      genContent() {
        return this.$createElement('span', {
          staticClass: 'v-chip__content'
        }, [this.filter && this.genFilter(), this.$slots.default, this.hasClose && this.genClose()]);
      }

    },

    render(h) {
      const children = [this.genContent()];
      let {
        tag,
        data
      } = this.generateRouteLink();
      data.attrs = { ...data.attrs,
        draggable: this.draggable ? 'true' : undefined,
        tabindex: this.chipGroup && !this.disabled ? 0 : data.attrs.tabindex
      };
      data.directives.push({
        name: 'show',
        value: this.active
      });
      data = this.setBackgroundColor(this.color, data);
      const color = this.textColor || this.outlined && this.color;
      return h(tag, this.setTextColor(color, data), children);
    }

  });

  // Mixins
  /* @vue/component */

  var VThemeProvider = Themeable.extend({
    name: 'v-theme-provider',
    props: {
      root: Boolean
    },
    computed: {
      isDark() {
        return this.root ? this.rootIsDark : Themeable.options.computed.isDark.call(this);
      }

    },

    render() {
      /* istanbul ignore next */
      return this.$slots.default && this.$slots.default.find(node => !node.isComment && node.text !== ' ');
    }

  });

  /**
   * Delayable
   *
   * @mixin
   *
   * Changes the open or close delay time for elements
   */

  var Delayable = Vue.extend().extend({
    name: 'delayable',
    props: {
      openDelay: {
        type: [Number, String],
        default: 0
      },
      closeDelay: {
        type: [Number, String],
        default: 0
      }
    },
    data: () => ({
      openTimeout: undefined,
      closeTimeout: undefined
    }),
    methods: {
      /**
       * Clear any pending delay timers from executing
       */
      clearDelay() {
        clearTimeout(this.openTimeout);
        clearTimeout(this.closeTimeout);
      },

      /**
       * Runs callback after a specified delay
       */
      runDelay(type, cb) {
        this.clearDelay();
        const delay = parseInt(this[`${type}Delay`], 10);
        this[`${type}Timeout`] = setTimeout(cb || (() => {
          this.isActive = {
            open: true,
            close: false
          }[type];
        }), delay);
      }

    }
  });

  // Mixins
  const baseMixins$1 = mixins(Delayable, Toggleable);
  /* @vue/component */

  var Activatable = baseMixins$1.extend({
    name: 'activatable',
    props: {
      activator: {
        default: null,
        validator: val => {
          return ['string', 'object'].includes(typeof val);
        }
      },
      disabled: Boolean,
      internalActivator: Boolean,
      openOnHover: Boolean
    },
    data: () => ({
      // Do not use this directly, call getActivator() instead
      activatorElement: null,
      activatorNode: [],
      events: ['click', 'mouseenter', 'mouseleave'],
      listeners: {}
    }),
    watch: {
      activator: 'resetActivator',
      openOnHover: 'resetActivator'
    },

    mounted() {
      const slotType = getSlotType(this, 'activator', true);

      if (slotType && ['v-slot', 'normal'].includes(slotType)) {
        consoleError(`The activator slot must be bound, try '<template v-slot:activator="{ on }"><v-btn v-on="on">'`, this);
      }

      this.addActivatorEvents();
    },

    beforeDestroy() {
      this.removeActivatorEvents();
    },

    methods: {
      addActivatorEvents() {
        if (!this.activator || this.disabled || !this.getActivator()) return;
        this.listeners = this.genActivatorListeners();
        const keys = Object.keys(this.listeners);

        for (const key of keys) {
          this.getActivator().addEventListener(key, this.listeners[key]);
        }
      },

      genActivator() {
        const node = getSlot(this, 'activator', Object.assign(this.getValueProxy(), {
          on: this.genActivatorListeners(),
          attrs: this.genActivatorAttributes()
        })) || [];
        this.activatorNode = node;
        return node;
      },

      genActivatorAttributes() {
        return {
          role: 'button',
          'aria-haspopup': true,
          'aria-expanded': String(this.isActive)
        };
      },

      genActivatorListeners() {
        if (this.disabled) return {};
        const listeners = {};

        if (this.openOnHover) {
          listeners.mouseenter = e => {
            this.getActivator(e);
            this.runDelay('open');
          };

          listeners.mouseleave = e => {
            this.getActivator(e);
            this.runDelay('close');
          };
        } else {
          listeners.click = e => {
            const activator = this.getActivator(e);
            if (activator) activator.focus();
            e.stopPropagation();
            this.isActive = !this.isActive;
          };
        }

        return listeners;
      },

      getActivator(e) {
        // If we've already fetched the activator, re-use
        if (this.activatorElement) return this.activatorElement;
        let activator = null;

        if (this.activator) {
          const target = this.internalActivator ? this.$el : document;

          if (typeof this.activator === 'string') {
            // Selector
            activator = target.querySelector(this.activator);
          } else if (this.activator.$el) {
            // Component (ref)
            activator = this.activator.$el;
          } else {
            // HTMLElement | Element
            activator = this.activator;
          }
        } else if (this.activatorNode.length === 1 || this.activatorNode.length && !e) {
          // Use the contents of the activator slot
          // There's either only one element in it or we
          // don't have a click event to use as a last resort
          const vm = this.activatorNode[0].componentInstance;

          if (vm && vm.$options.mixins && //                         Activatable is indirectly used via Menuable
          vm.$options.mixins.some(m => m.options && ['activatable', 'menuable'].includes(m.options.name))) {
            // Activator is actually another activatible component, use its activator (#8846)
            activator = vm.getActivator();
          } else {
            activator = this.activatorNode[0].elm;
          }
        } else if (e) {
          // Activated by a click event
          activator = e.currentTarget || e.target;
        }

        this.activatorElement = activator;
        return this.activatorElement;
      },

      getContentSlot() {
        return getSlot(this, 'default', this.getValueProxy(), true);
      },

      getValueProxy() {
        const self = this;
        return {
          get value() {
            return self.isActive;
          },

          set value(isActive) {
            self.isActive = isActive;
          }

        };
      },

      removeActivatorEvents() {
        if (!this.activator || !this.activatorElement) return;
        const keys = Object.keys(this.listeners);

        for (const key of keys) {
          this.activatorElement.removeEventListener(key, this.listeners[key]);
        }

        this.listeners = {};
      },

      resetActivator() {
        this.removeActivatorEvents();
        this.activatorElement = null;
        this.getActivator();
        this.addActivatorEvents();
      }

    }
  });

  function searchChildren(children) {
    const results = [];

    for (let index = 0; index < children.length; index++) {
      const child = children[index];

      if (child.isActive && child.isDependent) {
        results.push(child);
      } else {
        results.push(...searchChildren(child.$children));
      }
    }

    return results;
  }
  /* @vue/component */


  var Dependent = mixins().extend({
    name: 'dependent',

    data() {
      return {
        closeDependents: true,
        isActive: false,
        isDependent: true
      };
    },

    watch: {
      isActive(val) {
        if (val) return;
        const openDependents = this.getOpenDependents();

        for (let index = 0; index < openDependents.length; index++) {
          openDependents[index].isActive = false;
        }
      }

    },
    methods: {
      getOpenDependents() {
        if (this.closeDependents) return searchChildren(this.$children);
        return [];
      },

      getOpenDependentElements() {
        const result = [];
        const openDependents = this.getOpenDependents();

        for (let index = 0; index < openDependents.length; index++) {
          result.push(...openDependents[index].getClickableDependentElements());
        }

        return result;
      },

      getClickableDependentElements() {
        const result = [this.$el];
        if (this.$refs.content) result.push(this.$refs.content);
        if (this.overlay) result.push(this.overlay.$el);
        result.push(...this.getOpenDependentElements());
        return result;
      }

    }
  });

  // Utilities
  /**
   * Bootable
   * @mixin
   *
   * Used to add lazy content functionality to components
   * Looks for change in "isActive" to automatically boot
   * Otherwise can be set manually
   */

  /* @vue/component */

  var Bootable = Vue.extend().extend({
    name: 'bootable',
    props: {
      eager: Boolean
    },
    data: () => ({
      isBooted: false
    }),
    computed: {
      hasContent() {
        return this.isBooted || this.eager || this.isActive;
      }

    },
    watch: {
      isActive() {
        this.isBooted = true;
      }

    },

    created() {
      /* istanbul ignore next */
      if ('lazy' in this.$attrs) {
        removed('lazy', this);
      }
    },

    methods: {
      showLazyContent(content) {
        return this.hasContent && content ? content() : [this.$createElement()];
      }

    }
  });

  // Mixins

  function validateAttachTarget(val) {
    const type = typeof val;
    if (type === 'boolean' || type === 'string') return true;
    return val.nodeType === Node.ELEMENT_NODE;
  }
  /* @vue/component */


  var Detachable = mixins(Bootable).extend({
    name: 'detachable',
    props: {
      attach: {
        default: false,
        validator: validateAttachTarget
      },
      contentClass: {
        type: String,
        default: ''
      }
    },
    data: () => ({
      activatorNode: null,
      hasDetached: false
    }),
    watch: {
      attach() {
        this.hasDetached = false;
        this.initDetach();
      },

      hasContent() {
        this.$nextTick(this.initDetach);
      }

    },

    beforeMount() {
      this.$nextTick(() => {
        if (this.activatorNode) {
          const activator = Array.isArray(this.activatorNode) ? this.activatorNode : [this.activatorNode];
          activator.forEach(node => {
            if (!node.elm) return;
            if (!this.$el.parentNode) return;
            const target = this.$el === this.$el.parentNode.firstChild ? this.$el : this.$el.nextSibling;
            this.$el.parentNode.insertBefore(node.elm, target);
          });
        }
      });
    },

    mounted() {
      this.hasContent && this.initDetach();
    },

    deactivated() {
      this.isActive = false;
    },

    beforeDestroy() {
      // IE11 Fix
      try {
        if (this.$refs.content && this.$refs.content.parentNode) {
          this.$refs.content.parentNode.removeChild(this.$refs.content);
        }

        if (this.activatorNode) {
          const activator = Array.isArray(this.activatorNode) ? this.activatorNode : [this.activatorNode];
          activator.forEach(node => {
            node.elm && node.elm.parentNode && node.elm.parentNode.removeChild(node.elm);
          });
        }
      } catch (e) {
        console.log(e);
      }
    },

    methods: {
      getScopeIdAttrs() {
        const scopeId = getObjectValueByPath(this.$vnode, 'context.$options._scopeId');
        return scopeId && {
          [scopeId]: ''
        };
      },

      initDetach() {
        if (this._isDestroyed || !this.$refs.content || this.hasDetached || // Leave menu in place if attached
        // and dev has not changed target
        this.attach === '' || // If used as a boolean prop (<v-menu attach>)
        this.attach === true || // If bound to a boolean (<v-menu :attach="true">)
        this.attach === 'attach' // If bound as boolean prop in pug (v-menu(attach))
        ) return;
        let target;

        if (this.attach === false) {
          // Default, detach to app
          target = document.querySelector('[data-app]');
        } else if (typeof this.attach === 'string') {
          // CSS selector
          target = document.querySelector(this.attach);
        } else {
          // DOM Element
          target = this.attach;
        }

        if (!target) {
          consoleWarn(`Unable to locate target ${this.attach || '[data-app]'}`, this);
          return;
        }

        target.appendChild(this.$refs.content);
        this.hasDetached = true;
      }

    }
  });

  /* @vue/component */

  var Stackable = Vue.extend().extend({
    name: 'stackable',

    data() {
      return {
        stackElement: null,
        stackExclude: null,
        stackMinZIndex: 0,
        isActive: false
      };
    },

    computed: {
      activeZIndex() {
        if (typeof window === 'undefined') return 0;
        const content = this.stackElement || this.$refs.content; // Return current zindex if not active

        const index = !this.isActive ? getZIndex(content) : this.getMaxZIndex(this.stackExclude || [content]) + 2;
        if (index == null) return index; // Return max current z-index (excluding self) + 2
        // (2 to leave room for an overlay below, if needed)

        return parseInt(index);
      }

    },
    methods: {
      getMaxZIndex(exclude = []) {
        const base = this.$el; // Start with lowest allowed z-index or z-index of
        // base component's element, whichever is greater

        const zis = [this.stackMinZIndex, getZIndex(base)]; // Convert the NodeList to an array to
        // prevent an Edge bug with Symbol.iterator
        // https://github.com/vuetifyjs/vuetify/issues/2146

        const activeElements = [...document.getElementsByClassName('v-menu__content--active'), ...document.getElementsByClassName('v-dialog__content--active')]; // Get z-index for all active dialogs

        for (let index = 0; index < activeElements.length; index++) {
          if (!exclude.includes(activeElements[index])) {
            zis.push(getZIndex(activeElements[index]));
          }
        }

        return Math.max(...zis);
      }

    }
  });

  // Mixins

  const baseMixins$2 = mixins(Stackable, Positionable, Activatable);
  /* @vue/component */

  var Menuable = baseMixins$2.extend().extend({
    name: 'menuable',
    props: {
      allowOverflow: Boolean,
      light: Boolean,
      dark: Boolean,
      maxWidth: {
        type: [Number, String],
        default: 'auto'
      },
      minWidth: [Number, String],
      nudgeBottom: {
        type: [Number, String],
        default: 0
      },
      nudgeLeft: {
        type: [Number, String],
        default: 0
      },
      nudgeRight: {
        type: [Number, String],
        default: 0
      },
      nudgeTop: {
        type: [Number, String],
        default: 0
      },
      nudgeWidth: {
        type: [Number, String],
        default: 0
      },
      offsetOverflow: Boolean,
      openOnClick: Boolean,
      positionX: {
        type: Number,
        default: null
      },
      positionY: {
        type: Number,
        default: null
      },
      zIndex: {
        type: [Number, String],
        default: null
      }
    },
    data: () => ({
      absoluteX: 0,
      absoluteY: 0,
      activatedBy: null,
      activatorFixed: false,
      dimensions: {
        activator: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          width: 0,
          height: 0,
          offsetTop: 0,
          scrollHeight: 0,
          offsetLeft: 0
        },
        content: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          width: 0,
          height: 0,
          offsetTop: 0,
          scrollHeight: 0
        }
      },
      hasJustFocused: false,
      hasWindow: false,
      inputActivator: false,
      isContentActive: false,
      pageWidth: 0,
      pageYOffset: 0,
      stackClass: 'v-menu__content--active',
      stackMinZIndex: 6
    }),
    computed: {
      computedLeft() {
        const a = this.dimensions.activator;
        const c = this.dimensions.content;
        const activatorLeft = (this.attach !== false ? a.offsetLeft : a.left) || 0;
        const minWidth = Math.max(a.width, c.width);
        let left = 0;
        left += this.left ? activatorLeft - (minWidth - a.width) : activatorLeft;

        if (this.offsetX) {
          const maxWidth = isNaN(Number(this.maxWidth)) ? a.width : Math.min(a.width, Number(this.maxWidth));
          left += this.left ? -maxWidth : a.width;
        }

        if (this.nudgeLeft) left -= parseInt(this.nudgeLeft);
        if (this.nudgeRight) left += parseInt(this.nudgeRight);
        return left;
      },

      computedTop() {
        const a = this.dimensions.activator;
        const c = this.dimensions.content;
        let top = 0;
        if (this.top) top += a.height - c.height;
        if (this.attach !== false) top += a.offsetTop;else top += a.top + this.pageYOffset;
        if (this.offsetY) top += this.top ? -a.height : a.height;
        if (this.nudgeTop) top -= parseInt(this.nudgeTop);
        if (this.nudgeBottom) top += parseInt(this.nudgeBottom);
        return top;
      },

      hasActivator() {
        return !!this.$slots.activator || !!this.$scopedSlots.activator || !!this.activator || !!this.inputActivator;
      }

    },
    watch: {
      disabled(val) {
        val && this.callDeactivate();
      },

      isActive(val) {
        if (this.disabled) return;
        val ? this.callActivate() : this.callDeactivate();
      },

      positionX: 'updateDimensions',
      positionY: 'updateDimensions'
    },

    beforeMount() {
      this.hasWindow = typeof window !== 'undefined';
    },

    methods: {
      absolutePosition() {
        return {
          offsetTop: 0,
          offsetLeft: 0,
          scrollHeight: 0,
          top: this.positionY || this.absoluteY,
          bottom: this.positionY || this.absoluteY,
          left: this.positionX || this.absoluteX,
          right: this.positionX || this.absoluteX,
          height: 0,
          width: 0
        };
      },

      activate() {},

      calcLeft(menuWidth) {
        return convertToUnit(this.attach !== false ? this.computedLeft : this.calcXOverflow(this.computedLeft, menuWidth));
      },

      calcTop() {
        return convertToUnit(this.attach !== false ? this.computedTop : this.calcYOverflow(this.computedTop));
      },

      calcXOverflow(left, menuWidth) {
        const xOverflow = left + menuWidth - this.pageWidth + 12;

        if ((!this.left || this.right) && xOverflow > 0) {
          left = Math.max(left - xOverflow, 0);
        } else {
          left = Math.max(left, 12);
        }

        return left + this.getOffsetLeft();
      },

      calcYOverflow(top) {
        const documentHeight = this.getInnerHeight();
        const toTop = this.pageYOffset + documentHeight;
        const activator = this.dimensions.activator;
        const contentHeight = this.dimensions.content.height;
        const totalHeight = top + contentHeight;
        const isOverflowing = toTop < totalHeight; // If overflowing bottom and offset
        // TODO: set 'bottom' position instead of 'top'

        if (isOverflowing && this.offsetOverflow && // If we don't have enough room to offset
        // the overflow, don't offset
        activator.top > contentHeight) {
          top = this.pageYOffset + (activator.top - contentHeight); // If overflowing bottom
        } else if (isOverflowing && !this.allowOverflow) {
          top = toTop - contentHeight - 12; // If overflowing top
        } else if (top < this.pageYOffset && !this.allowOverflow) {
          top = this.pageYOffset + 12;
        }

        return top < 12 ? 12 : top;
      },

      callActivate() {
        if (!this.hasWindow) return;
        this.activate();
      },

      callDeactivate() {
        this.isContentActive = false;
        this.deactivate();
      },

      checkForPageYOffset() {
        if (this.hasWindow) {
          this.pageYOffset = this.activatorFixed ? 0 : this.getOffsetTop();
        }
      },

      checkActivatorFixed() {
        if (this.attach !== false) return;
        let el = this.getActivator();

        while (el) {
          if (window.getComputedStyle(el).position === 'fixed') {
            this.activatorFixed = true;
            return;
          }

          el = el.offsetParent;
        }

        this.activatorFixed = false;
      },

      deactivate() {},

      genActivatorListeners() {
        const listeners = Activatable.options.methods.genActivatorListeners.call(this);
        const onClick = listeners.click;

        listeners.click = e => {
          if (this.openOnClick) {
            onClick && onClick(e);
          }

          this.absoluteX = e.clientX;
          this.absoluteY = e.clientY;
        };

        return listeners;
      },

      getInnerHeight() {
        if (!this.hasWindow) return 0;
        return window.innerHeight || document.documentElement.clientHeight;
      },

      getOffsetLeft() {
        if (!this.hasWindow) return 0;
        return window.pageXOffset || document.documentElement.scrollLeft;
      },

      getOffsetTop() {
        if (!this.hasWindow) return 0;
        return window.pageYOffset || document.documentElement.scrollTop;
      },

      getRoundedBoundedClientRect(el) {
        const rect = el.getBoundingClientRect();
        return {
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          bottom: Math.round(rect.bottom),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      },

      measure(el) {
        if (!el || !this.hasWindow) return null;
        const rect = this.getRoundedBoundedClientRect(el); // Account for activator margin

        if (this.attach !== false) {
          const style = window.getComputedStyle(el);
          rect.left = parseInt(style.marginLeft);
          rect.top = parseInt(style.marginTop);
        }

        return rect;
      },

      sneakPeek(cb) {
        requestAnimationFrame(() => {
          const el = this.$refs.content;

          if (!el || el.style.display !== 'none') {
            cb();
            return;
          }

          el.style.display = 'inline-block';
          cb();
          el.style.display = 'none';
        });
      },

      startTransition() {
        return new Promise(resolve => requestAnimationFrame(() => {
          this.isContentActive = this.hasJustFocused = this.isActive;
          resolve();
        }));
      },

      updateDimensions() {
        this.hasWindow = typeof window !== 'undefined';
        this.checkActivatorFixed();
        this.checkForPageYOffset();
        this.pageWidth = document.documentElement.clientWidth;
        const dimensions = {
          activator: { ...this.dimensions.activator
          },
          content: { ...this.dimensions.content
          }
        }; // Activator should already be shown

        if (!this.hasActivator || this.absolute) {
          dimensions.activator = this.absolutePosition();
        } else {
          const activator = this.getActivator();
          if (!activator) return;
          dimensions.activator = this.measure(activator);
          dimensions.activator.offsetLeft = activator.offsetLeft;

          if (this.attach !== false) {
            // account for css padding causing things to not line up
            // this is mostly for v-autocomplete, hopefully it won't break anything
            dimensions.activator.offsetTop = activator.offsetTop;
          } else {
            dimensions.activator.offsetTop = 0;
          }
        } // Display and hide to get dimensions


        this.sneakPeek(() => {
          this.$refs.content && (dimensions.content = this.measure(this.$refs.content));
          this.dimensions = dimensions;
        });
      }

    }
  });

  /* @vue/component */

  var Returnable = Vue.extend({
    name: 'returnable',
    props: {
      returnValue: null
    },
    data: () => ({
      isActive: false,
      originalValue: null
    }),
    watch: {
      isActive(val) {
        if (val) {
          this.originalValue = this.returnValue;
        } else {
          this.$emit('update:return-value', this.originalValue);
        }
      }

    },
    methods: {
      save(value) {
        this.originalValue = value;
        setTimeout(() => {
          this.isActive = false;
        });
      }

    }
  });

  // Styles
  const baseMixins$3 = mixins(Dependent, Delayable, Detachable, Menuable, Returnable, Toggleable, Themeable);
  /* @vue/component */

  var VMenu = baseMixins$3.extend({
    name: 'v-menu',

    provide() {
      return {
        isInMenu: true,
        // Pass theme through to default slot
        theme: this.theme
      };
    },

    directives: {
      ClickOutside,
      Resize
    },
    props: {
      auto: Boolean,
      closeOnClick: {
        type: Boolean,
        default: true
      },
      closeOnContentClick: {
        type: Boolean,
        default: true
      },
      disabled: Boolean,
      disableKeys: Boolean,
      maxHeight: {
        type: [Number, String],
        default: 'auto'
      },
      offsetX: Boolean,
      offsetY: Boolean,
      openOnClick: {
        type: Boolean,
        default: true
      },
      openOnHover: Boolean,
      origin: {
        type: String,
        default: 'top left'
      },
      transition: {
        type: [Boolean, String],
        default: 'v-menu-transition'
      }
    },

    data() {
      return {
        calculatedTopAuto: 0,
        defaultOffset: 8,
        hasJustFocused: false,
        listIndex: -1,
        resizeTimeout: 0,
        selectedIndex: null,
        tiles: []
      };
    },

    computed: {
      activeTile() {
        return this.tiles[this.listIndex];
      },

      calculatedLeft() {
        const menuWidth = Math.max(this.dimensions.content.width, parseFloat(this.calculatedMinWidth));
        if (!this.auto) return this.calcLeft(menuWidth) || '0';
        return convertToUnit(this.calcXOverflow(this.calcLeftAuto(), menuWidth)) || '0';
      },

      calculatedMaxHeight() {
        const height = this.auto ? '200px' : convertToUnit(this.maxHeight);
        return height || '0';
      },

      calculatedMaxWidth() {
        return convertToUnit(this.maxWidth) || '0';
      },

      calculatedMinWidth() {
        if (this.minWidth) {
          return convertToUnit(this.minWidth) || '0';
        }

        const minWidth = Math.min(this.dimensions.activator.width + Number(this.nudgeWidth) + (this.auto ? 16 : 0), Math.max(this.pageWidth - 24, 0));
        const calculatedMaxWidth = isNaN(parseInt(this.calculatedMaxWidth)) ? minWidth : parseInt(this.calculatedMaxWidth);
        return convertToUnit(Math.min(calculatedMaxWidth, minWidth)) || '0';
      },

      calculatedTop() {
        const top = !this.auto ? this.calcTop() : convertToUnit(this.calcYOverflow(this.calculatedTopAuto));
        return top || '0';
      },

      hasClickableTiles() {
        return Boolean(this.tiles.find(tile => tile.tabIndex > -1));
      },

      styles() {
        return {
          maxHeight: this.calculatedMaxHeight,
          minWidth: this.calculatedMinWidth,
          maxWidth: this.calculatedMaxWidth,
          top: this.calculatedTop,
          left: this.calculatedLeft,
          transformOrigin: this.origin,
          zIndex: this.zIndex || this.activeZIndex
        };
      }

    },
    watch: {
      isActive(val) {
        if (!val) this.listIndex = -1;
      },

      isContentActive(val) {
        this.hasJustFocused = val;
      },

      listIndex(next, prev) {
        if (next in this.tiles) {
          const tile = this.tiles[next];
          tile.classList.add('v-list-item--highlighted');
          this.$refs.content.scrollTop = tile.offsetTop - tile.clientHeight;
        }

        prev in this.tiles && this.tiles[prev].classList.remove('v-list-item--highlighted');
      }

    },

    created() {
      /* istanbul ignore next */
      if (this.$attrs.hasOwnProperty('full-width')) {
        removed('full-width', this);
      }
    },

    mounted() {
      this.isActive && this.callActivate();
    },

    methods: {
      activate() {
        // Update coordinates and dimensions of menu
        // and its activator
        this.updateDimensions(); // Start the transition

        requestAnimationFrame(() => {
          // Once transitioning, calculate scroll and top position
          this.startTransition().then(() => {
            if (this.$refs.content) {
              this.calculatedTopAuto = this.calcTopAuto();
              this.auto && (this.$refs.content.scrollTop = this.calcScrollPosition());
            }
          });
        });
      },

      calcScrollPosition() {
        const $el = this.$refs.content;
        const activeTile = $el.querySelector('.v-list-item--active');
        const maxScrollTop = $el.scrollHeight - $el.offsetHeight;
        return activeTile ? Math.min(maxScrollTop, Math.max(0, activeTile.offsetTop - $el.offsetHeight / 2 + activeTile.offsetHeight / 2)) : $el.scrollTop;
      },

      calcLeftAuto() {
        return parseInt(this.dimensions.activator.left - this.defaultOffset * 2);
      },

      calcTopAuto() {
        const $el = this.$refs.content;
        const activeTile = $el.querySelector('.v-list-item--active');

        if (!activeTile) {
          this.selectedIndex = null;
        }

        if (this.offsetY || !activeTile) {
          return this.computedTop;
        }

        this.selectedIndex = Array.from(this.tiles).indexOf(activeTile);
        const tileDistanceFromMenuTop = activeTile.offsetTop - this.calcScrollPosition();
        const firstTileOffsetTop = $el.querySelector('.v-list-item').offsetTop;
        return this.computedTop - tileDistanceFromMenuTop - firstTileOffsetTop - 1;
      },

      changeListIndex(e) {
        // For infinite scroll and autocomplete, re-evaluate children
        this.getTiles();

        if (!this.isActive || !this.hasClickableTiles) {
          return;
        } else if (e.keyCode === keyCodes.tab) {
          this.isActive = false;
          return;
        } else if (e.keyCode === keyCodes.down) {
          this.nextTile();
        } else if (e.keyCode === keyCodes.up) {
          this.prevTile();
        } else if (e.keyCode === keyCodes.enter && this.listIndex !== -1) {
          this.tiles[this.listIndex].click();
        } else {
          return;
        } // One of the conditions was met, prevent default action (#2988)


        e.preventDefault();
      },

      closeConditional(e) {
        const target = e.target;
        return this.isActive && !this._isDestroyed && this.closeOnClick && !this.$refs.content.contains(target);
      },

      genActivatorAttributes() {
        const attributes = Activatable.options.methods.genActivatorAttributes.call(this);

        if (this.activeTile && this.activeTile.id) {
          return { ...attributes,
            'aria-activedescendant': this.activeTile.id
          };
        }

        return attributes;
      },

      genActivatorListeners() {
        const listeners = Menuable.options.methods.genActivatorListeners.call(this);

        if (!this.disableKeys) {
          listeners.keydown = this.onKeyDown;
        }

        return listeners;
      },

      genTransition() {
        const content = this.genContent();
        if (!this.transition) return content;
        return this.$createElement('transition', {
          props: {
            name: this.transition
          }
        }, [content]);
      },

      genDirectives() {
        const directives = [{
          name: 'show',
          value: this.isContentActive
        }]; // Do not add click outside for hover menu

        if (!this.openOnHover && this.closeOnClick) {
          directives.push({
            name: 'click-outside',
            value: () => {
              this.isActive = false;
            },
            args: {
              closeConditional: this.closeConditional,
              include: () => [this.$el, ...this.getOpenDependentElements()]
            }
          });
        }

        return directives;
      },

      genContent() {
        const options = {
          attrs: { ...this.getScopeIdAttrs(),
            role: 'role' in this.$attrs ? this.$attrs.role : 'menu'
          },
          staticClass: 'v-menu__content',
          class: { ...this.rootThemeClasses,
            'v-menu__content--auto': this.auto,
            'v-menu__content--fixed': this.activatorFixed,
            menuable__content__active: this.isActive,
            [this.contentClass.trim()]: true
          },
          style: this.styles,
          directives: this.genDirectives(),
          ref: 'content',
          on: {
            click: e => {
              const target = e.target;
              if (target.getAttribute('disabled')) return;
              if (this.closeOnContentClick) this.isActive = false;
            },
            keydown: this.onKeyDown
          }
        };

        if (!this.disabled && this.openOnHover) {
          options.on = options.on || {};
          options.on.mouseenter = this.mouseEnterHandler;
        }

        if (this.openOnHover) {
          options.on = options.on || {};
          options.on.mouseleave = this.mouseLeaveHandler;
        }

        return this.$createElement('div', options, this.getContentSlot());
      },

      getTiles() {
        if (!this.$refs.content) return;
        this.tiles = Array.from(this.$refs.content.querySelectorAll('.v-list-item'));
      },

      mouseEnterHandler() {
        this.runDelay('open', () => {
          if (this.hasJustFocused) return;
          this.hasJustFocused = true;
          this.isActive = true;
        });
      },

      mouseLeaveHandler(e) {
        // Prevent accidental re-activation
        this.runDelay('close', () => {
          if (this.$refs.content.contains(e.relatedTarget)) return;
          requestAnimationFrame(() => {
            this.isActive = false;
            this.callDeactivate();
          });
        });
      },

      nextTile() {
        const tile = this.tiles[this.listIndex + 1];

        if (!tile) {
          if (!this.tiles.length) return;
          this.listIndex = -1;
          this.nextTile();
          return;
        }

        this.listIndex++;
        if (tile.tabIndex === -1) this.nextTile();
      },

      prevTile() {
        const tile = this.tiles[this.listIndex - 1];

        if (!tile) {
          if (!this.tiles.length) return;
          this.listIndex = this.tiles.length;
          this.prevTile();
          return;
        }

        this.listIndex--;
        if (tile.tabIndex === -1) this.prevTile();
      },

      onKeyDown(e) {
        if (e.keyCode === keyCodes.esc) {
          // Wait for dependent elements to close first
          setTimeout(() => {
            this.isActive = false;
          });
          const activator = this.getActivator();
          this.$nextTick(() => activator && activator.focus());
        } else if (!this.isActive && [keyCodes.up, keyCodes.down].includes(e.keyCode)) {
          this.isActive = true;
        } // Allow for isActive watcher to generate tile list


        this.$nextTick(() => this.changeListIndex(e));
      },

      onResize() {
        if (!this.isActive) return; // Account for screen resize
        // and orientation change
        // eslint-disable-next-line no-unused-expressions

        this.$refs.content.offsetWidth;
        this.updateDimensions(); // When resizing to a smaller width
        // content width is evaluated before
        // the new activator width has been
        // set, causing it to not size properly
        // hacky but will revisit in the future

        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = window.setTimeout(this.updateDimensions, 100);
      }

    },

    render(h) {
      const data = {
        staticClass: 'v-menu',
        class: {
          'v-menu--attached': this.attach === '' || this.attach === true || this.attach === 'attach'
        },
        directives: [{
          arg: '500',
          name: 'resize',
          value: this.onResize
        }]
      };
      return h('div', data, [!this.activator && this.genActivator(), this.showLazyContent(() => [this.$createElement(VThemeProvider, {
        props: {
          root: true,
          light: this.light,
          dark: this.dark
        }
      }, [this.genTransition()])])]);
    }

  });

  var VSimpleCheckbox = Vue.extend({
    name: 'v-simple-checkbox',
    functional: true,
    directives: {
      ripple: Ripple
    },
    props: { ...Colorable.options.props,
      ...Themeable.options.props,
      disabled: Boolean,
      ripple: {
        type: Boolean,
        default: true
      },
      value: Boolean,
      indeterminate: Boolean,
      indeterminateIcon: {
        type: String,
        default: '$checkboxIndeterminate'
      },
      onIcon: {
        type: String,
        default: '$checkboxOn'
      },
      offIcon: {
        type: String,
        default: '$checkboxOff'
      }
    },

    render(h, {
      props,
      data
    }) {
      const children = [];

      if (props.ripple && !props.disabled) {
        const ripple = h('div', Colorable.options.methods.setTextColor(props.color, {
          staticClass: 'v-input--selection-controls__ripple',
          directives: [{
            name: 'ripple',
            value: {
              center: true
            }
          }]
        }));
        children.push(ripple);
      }

      let icon = props.offIcon;
      if (props.indeterminate) icon = props.indeterminateIcon;else if (props.value) icon = props.onIcon;
      children.push(h(VIcon$1, Colorable.options.methods.setTextColor(props.value && props.color, {
        props: {
          disabled: props.disabled,
          dark: props.dark,
          light: props.light
        }
      }), icon));
      const classes = {
        'v-simple-checkbox': true,
        'v-simple-checkbox--disabled': props.disabled
      };
      return h('div', { ...data,
        class: classes,
        on: {
          click: e => {
            e.stopPropagation();

            if (data.on && data.on.input && !props.disabled) {
              wrapInArray(data.on.input).forEach(f => f(!props.value));
            }
          }
        }
      }, children);
    }

  });

  // Styles
  var VDivider = Themeable.extend({
    name: 'v-divider',
    props: {
      inset: Boolean,
      vertical: Boolean
    },

    render(h) {
      // WAI-ARIA attributes
      let orientation;

      if (!this.$attrs.role || this.$attrs.role === 'separator') {
        orientation = this.vertical ? 'vertical' : 'horizontal';
      }

      return h('hr', {
        class: {
          'v-divider': true,
          'v-divider--inset': this.inset,
          'v-divider--vertical': this.vertical,
          ...this.themeClasses
        },
        attrs: {
          role: 'separator',
          'aria-orientation': orientation,
          ...this.$attrs
        },
        on: this.$listeners
      });
    }

  });

  // Styles
  var VSubheader = mixins(Themeable
  /* @vue/component */
  ).extend({
    name: 'v-subheader',
    props: {
      inset: Boolean
    },

    render(h) {
      return h('div', {
        staticClass: 'v-subheader',
        class: {
          'v-subheader--inset': this.inset,
          ...this.themeClasses
        },
        attrs: this.$attrs,
        on: this.$listeners
      }, this.$slots.default);
    }

  });

  // Styles
  /* @vue/component */

  var VList = VSheet.extend().extend({
    name: 'v-list',

    provide() {
      return {
        isInList: true,
        list: this
      };
    },

    inject: {
      isInMenu: {
        default: false
      },
      isInNav: {
        default: false
      }
    },
    props: {
      dense: Boolean,
      disabled: Boolean,
      expand: Boolean,
      flat: Boolean,
      nav: Boolean,
      rounded: Boolean,
      shaped: Boolean,
      subheader: Boolean,
      threeLine: Boolean,
      tile: {
        type: Boolean,
        default: true
      },
      twoLine: Boolean
    },
    data: () => ({
      groups: []
    }),
    computed: {
      classes() {
        return { ...VSheet.options.computed.classes.call(this),
          'v-list--dense': this.dense,
          'v-list--disabled': this.disabled,
          'v-list--flat': this.flat,
          'v-list--nav': this.nav,
          'v-list--rounded': this.rounded,
          'v-list--shaped': this.shaped,
          'v-list--subheader': this.subheader,
          'v-list--two-line': this.twoLine,
          'v-list--three-line': this.threeLine
        };
      }

    },
    methods: {
      register(content) {
        this.groups.push(content);
      },

      unregister(content) {
        const index = this.groups.findIndex(g => g._uid === content._uid);
        if (index > -1) this.groups.splice(index, 1);
      },

      listClick(uid) {
        if (this.expand) return;

        for (const group of this.groups) {
          group.toggle(uid);
        }
      }

    },

    render(h) {
      const data = {
        staticClass: 'v-list',
        class: this.classes,
        style: this.styles,
        attrs: {
          role: this.isInNav || this.isInMenu ? undefined : 'list',
          ...this.attrs$
        }
      };
      return h(this.tag, this.setBackgroundColor(this.color, data), [this.$slots.default]);
    }

  });

  // Styles
  const baseMixins$4 = mixins(Colorable, Routable, Themeable, factory$2('listItemGroup'), factory$1('inputValue'));
  /* @vue/component */

  var VListItem = baseMixins$4.extend().extend({
    name: 'v-list-item',
    directives: {
      Ripple
    },
    inheritAttrs: false,
    inject: {
      isInGroup: {
        default: false
      },
      isInList: {
        default: false
      },
      isInMenu: {
        default: false
      },
      isInNav: {
        default: false
      }
    },
    props: {
      activeClass: {
        type: String,

        default() {
          if (!this.listItemGroup) return '';
          return this.listItemGroup.activeClass;
        }

      },
      dense: Boolean,
      inactive: Boolean,
      link: Boolean,
      selectable: {
        type: Boolean
      },
      tag: {
        type: String,
        default: 'div'
      },
      threeLine: Boolean,
      twoLine: Boolean,
      value: null
    },
    data: () => ({
      proxyClass: 'v-list-item--active'
    }),
    computed: {
      classes() {
        return {
          'v-list-item': true,
          ...Routable.options.computed.classes.call(this),
          'v-list-item--dense': this.dense,
          'v-list-item--disabled': this.disabled,
          'v-list-item--link': this.isClickable && !this.inactive,
          'v-list-item--selectable': this.selectable,
          'v-list-item--three-line': this.threeLine,
          'v-list-item--two-line': this.twoLine,
          ...this.themeClasses
        };
      },

      isClickable() {
        return Boolean(Routable.options.computed.isClickable.call(this) || this.listItemGroup);
      }

    },

    created() {
      /* istanbul ignore next */
      if (this.$attrs.hasOwnProperty('avatar')) {
        removed('avatar', this);
      }
    },

    methods: {
      click(e) {
        if (e.detail) this.$el.blur();
        this.$emit('click', e);
        this.to || this.toggle();
      },

      genAttrs() {
        const attrs = {
          'aria-disabled': this.disabled ? true : undefined,
          tabindex: this.isClickable && !this.disabled ? 0 : -1,
          ...this.$attrs
        };

        if (this.$attrs.hasOwnProperty('role')) ; else if (this.isInNav) ; else if (this.isInGroup) {
          attrs.role = 'listitem';
          attrs['aria-selected'] = String(this.isActive);
        } else if (this.isInMenu) {
          attrs.role = this.isClickable ? 'menuitem' : undefined;
          attrs.id = attrs.id || `list-item-${this._uid}`;
        } else if (this.isInList) {
          attrs.role = 'listitem';
        }

        return attrs;
      }

    },

    render(h) {
      let {
        tag,
        data
      } = this.generateRouteLink();
      data.attrs = { ...data.attrs,
        ...this.genAttrs()
      };
      data[this.to ? 'nativeOn' : 'on'] = { ...data[this.to ? 'nativeOn' : 'on'],
        keydown: e => {
          /* istanbul ignore else */
          if (e.keyCode === keyCodes.enter) this.click(e);
          this.$emit('keydown', e);
        }
      };
      if (this.inactive) tag = 'div';

      if (this.inactive && this.to) {
        data.on = data.nativeOn;
        delete data.nativeOn;
      }

      const children = this.$scopedSlots.default ? this.$scopedSlots.default({
        active: this.isActive,
        toggle: this.toggle
      }) : this.$slots.default;
      return h(tag, this.setTextColor(this.color, data), children);
    }

  });

  function factory$3(prop = 'value', event = 'change') {
    return Vue.extend({
      name: 'proxyable',
      model: {
        prop,
        event
      },
      props: {
        [prop]: {
          required: false
        }
      },

      data() {
        return {
          internalLazyValue: this[prop]
        };
      },

      computed: {
        internalValue: {
          get() {
            return this.internalLazyValue;
          },

          set(val) {
            if (val === this.internalLazyValue) return;
            this.internalLazyValue = val;
            this.$emit(event, val);
          }

        }
      },
      watch: {
        [prop](val) {
          this.internalLazyValue = val;
        }

      }
    });
  }
  /* eslint-disable-next-line no-redeclare */

  const Proxyable = factory$3();

  // Types
  /* @vue/component */

  var VListItemAction = Vue.extend({
    name: 'v-list-item-action',
    functional: true,

    render(h, {
      data,
      children = []
    }) {
      data.staticClass = data.staticClass ? `v-list-item__action ${data.staticClass}` : 'v-list-item__action';
      const filteredChild = children.filter(VNode => {
        return VNode.isComment === false && VNode.text !== ' ';
      });
      if (filteredChild.length > 1) data.staticClass += ' v-list-item__action--stack';
      return h('div', data, children);
    }

  });

  var VAvatar = mixins(Colorable, Measurable
  /* @vue/component */
  ).extend({
    name: 'v-avatar',
    props: {
      left: Boolean,
      right: Boolean,
      size: {
        type: [Number, String],
        default: 48
      },
      tile: Boolean
    },
    computed: {
      classes() {
        return {
          'v-avatar--left': this.left,
          'v-avatar--right': this.right,
          'v-avatar--tile': this.tile
        };
      },

      styles() {
        return {
          height: convertToUnit(this.size),
          minWidth: convertToUnit(this.size),
          width: convertToUnit(this.size),
          ...this.measurableStyles
        };
      }

    },

    render(h) {
      const data = {
        staticClass: 'v-avatar',
        class: this.classes,
        style: this.styles,
        on: this.$listeners
      };
      return h('div', this.setBackgroundColor(this.color, data), this.$slots.default);
    }

  });

  const VListItemActionText = createSimpleFunctional('v-list-item__action-text', 'span');
  const VListItemContent = createSimpleFunctional('v-list-item__content', 'div');
  const VListItemTitle = createSimpleFunctional('v-list-item__title', 'div');
  const VListItemSubtitle = createSimpleFunctional('v-list-item__subtitle', 'div');

  // Components
  /* @vue/component */

  var VSelectList = mixins(Colorable, Themeable).extend({
    name: 'v-select-list',
    // https://github.com/vuejs/vue/issues/6872
    directives: {
      ripple: Ripple
    },
    props: {
      action: Boolean,
      dense: Boolean,
      hideSelected: Boolean,
      items: {
        type: Array,
        default: () => []
      },
      itemDisabled: {
        type: [String, Array, Function],
        default: 'disabled'
      },
      itemText: {
        type: [String, Array, Function],
        default: 'text'
      },
      itemValue: {
        type: [String, Array, Function],
        default: 'value'
      },
      noDataText: String,
      noFilter: Boolean,
      searchInput: null,
      selectedItems: {
        type: Array,
        default: () => []
      }
    },
    computed: {
      parsedItems() {
        return this.selectedItems.map(item => this.getValue(item));
      },

      tileActiveClass() {
        return Object.keys(this.setTextColor(this.color).class || {}).join(' ');
      },

      staticNoDataTile() {
        const tile = {
          attrs: {
            role: undefined
          },
          on: {
            mousedown: e => e.preventDefault()
          }
        };
        return this.$createElement(VListItem, tile, [this.genTileContent(this.noDataText)]);
      }

    },
    methods: {
      genAction(item, inputValue) {
        return this.$createElement(VListItemAction, [this.$createElement(VSimpleCheckbox, {
          props: {
            color: this.color,
            value: inputValue
          },
          on: {
            input: () => this.$emit('select', item)
          }
        })]);
      },

      genDivider(props) {
        return this.$createElement(VDivider, {
          props
        });
      },

      genFilteredText(text) {
        text = text || '';
        if (!this.searchInput || this.noFilter) return escapeHTML(text);
        const {
          start,
          middle,
          end
        } = this.getMaskedCharacters(text);
        return `${escapeHTML(start)}${this.genHighlight(middle)}${escapeHTML(end)}`;
      },

      genHeader(props) {
        return this.$createElement(VSubheader, {
          props
        }, props.header);
      },

      genHighlight(text) {
        return `<span class="v-list-item__mask">${escapeHTML(text)}</span>`;
      },

      getMaskedCharacters(text) {
        const searchInput = (this.searchInput || '').toString().toLocaleLowerCase();
        const index = text.toLocaleLowerCase().indexOf(searchInput);
        if (index < 0) return {
          start: '',
          middle: text,
          end: ''
        };
        const start = text.slice(0, index);
        const middle = text.slice(index, index + searchInput.length);
        const end = text.slice(index + searchInput.length);
        return {
          start,
          middle,
          end
        };
      },

      genTile({
        item,
        index,
        disabled = null,
        value = false
      }) {
        if (!value) value = this.hasItem(item);

        if (item === Object(item)) {
          disabled = disabled !== null ? disabled : this.getDisabled(item);
        }

        const tile = {
          attrs: {
            // Default behavior in list does not
            // contain aria-selected by default
            'aria-selected': String(value),
            id: `list-item-${this._uid}-${index}`,
            role: 'option'
          },
          on: {
            mousedown: e => {
              // Prevent onBlur from being called
              e.preventDefault();
            },
            click: () => disabled || this.$emit('select', item)
          },
          props: {
            activeClass: this.tileActiveClass,
            disabled,
            ripple: true,
            inputValue: value
          }
        };

        if (!this.$scopedSlots.item) {
          return this.$createElement(VListItem, tile, [this.action && !this.hideSelected && this.items.length > 0 ? this.genAction(item, value) : null, this.genTileContent(item, index)]);
        }

        const parent = this;
        const scopedSlot = this.$scopedSlots.item({
          parent,
          item,
          attrs: { ...tile.attrs,
            ...tile.props
          },
          on: tile.on
        });
        return this.needsTile(scopedSlot) ? this.$createElement(VListItem, tile, scopedSlot) : scopedSlot;
      },

      genTileContent(item, index = 0) {
        const innerHTML = this.genFilteredText(this.getText(item));
        return this.$createElement(VListItemContent, [this.$createElement(VListItemTitle, {
          domProps: {
            innerHTML
          }
        })]);
      },

      hasItem(item) {
        return this.parsedItems.indexOf(this.getValue(item)) > -1;
      },

      needsTile(slot) {
        return slot.length !== 1 || slot[0].componentOptions == null || slot[0].componentOptions.Ctor.options.name !== 'v-list-item';
      },

      getDisabled(item) {
        return Boolean(getPropertyFromItem(item, this.itemDisabled, false));
      },

      getText(item) {
        return String(getPropertyFromItem(item, this.itemText, item));
      },

      getValue(item) {
        return getPropertyFromItem(item, this.itemValue, this.getText(item));
      }

    },

    render() {
      const children = [];
      const itemsLength = this.items.length;

      for (let index = 0; index < itemsLength; index++) {
        const item = this.items[index];
        if (this.hideSelected && this.hasItem(item)) continue;
        if (item == null) children.push(this.genTile({
          item,
          index
        }));else if (item.header) children.push(this.genHeader(item));else if (item.divider) children.push(this.genDivider(item));else children.push(this.genTile({
          item,
          index
        }));
      }

      children.length || children.push(this.$slots['no-data'] || this.staticNoDataTile);
      this.$slots['prepend-item'] && children.unshift(this.$slots['prepend-item']);
      this.$slots['append-item'] && children.push(this.$slots['append-item']);
      return this.$createElement(VList, {
        staticClass: 'v-select-list',
        class: this.themeClasses,
        attrs: {
          role: 'listbox',
          tabindex: -1
        },
        props: {
          dense: this.dense
        }
      }, children);
    }

  });

  // Styles
  /* @vue/component */

  var VLabel = mixins(Themeable).extend({
    name: 'v-label',
    functional: true,
    props: {
      absolute: Boolean,
      color: {
        type: String,
        default: 'primary'
      },
      disabled: Boolean,
      focused: Boolean,
      for: String,
      left: {
        type: [Number, String],
        default: 0
      },
      right: {
        type: [Number, String],
        default: 'auto'
      },
      value: Boolean
    },

    render(h, ctx) {
      const {
        children,
        listeners,
        props
      } = ctx;
      const data = {
        staticClass: 'v-label',
        class: {
          'v-label--active': props.value,
          'v-label--is-disabled': props.disabled,
          ...functionalThemeClasses(ctx)
        },
        attrs: {
          for: props.for,
          'aria-hidden': !props.for
        },
        on: listeners,
        style: {
          left: convertToUnit(props.left),
          right: convertToUnit(props.right),
          position: props.absolute ? 'absolute' : 'relative'
        },
        ref: 'label'
      };
      return h('label', Colorable.options.methods.setTextColor(props.focused && props.color, data), children);
    }

  });

  // Styles
  /* @vue/component */

  var VMessages = mixins(Colorable, Themeable).extend({
    name: 'v-messages',
    props: {
      value: {
        type: Array,
        default: () => []
      }
    },
    methods: {
      genChildren() {
        return this.$createElement('transition-group', {
          staticClass: 'v-messages__wrapper',
          attrs: {
            name: 'message-transition',
            tag: 'div'
          }
        }, this.value.map(this.genMessage));
      },

      genMessage(message, key) {
        return this.$createElement('div', {
          staticClass: 'v-messages__message',
          key
        }, getSlot(this, 'default', {
          message,
          key
        }) || [message]);
      }

    },

    render(h) {
      return h('div', this.setTextColor(this.color, {
        staticClass: 'v-messages',
        class: this.themeClasses
      }), [this.genChildren()]);
    }

  });

  // Mixins
  /* @vue/component */

  var Validatable = mixins(Colorable, inject('form'), Themeable).extend({
    name: 'validatable',
    props: {
      disabled: Boolean,
      error: Boolean,
      errorCount: {
        type: [Number, String],
        default: 1
      },
      errorMessages: {
        type: [String, Array],
        default: () => []
      },
      messages: {
        type: [String, Array],
        default: () => []
      },
      readonly: Boolean,
      rules: {
        type: Array,
        default: () => []
      },
      success: Boolean,
      successMessages: {
        type: [String, Array],
        default: () => []
      },
      validateOnBlur: Boolean,
      value: {
        required: false
      }
    },

    data() {
      return {
        errorBucket: [],
        hasColor: false,
        hasFocused: false,
        hasInput: false,
        isFocused: false,
        isResetting: false,
        lazyValue: this.value,
        valid: false
      };
    },

    computed: {
      computedColor() {
        if (this.disabled) return undefined;
        if (this.color) return this.color; // It's assumed that if the input is on a
        // dark background, the user will want to
        // have a white color. If the entire app
        // is setup to be dark, then they will
        // like want to use their primary color

        if (this.isDark && !this.appIsDark) return 'white';else return 'primary';
      },

      hasError() {
        return this.internalErrorMessages.length > 0 || this.errorBucket.length > 0 || this.error;
      },

      // TODO: Add logic that allows the user to enable based
      // upon a good validation
      hasSuccess() {
        return this.internalSuccessMessages.length > 0 || this.success;
      },

      externalError() {
        return this.internalErrorMessages.length > 0 || this.error;
      },

      hasMessages() {
        return this.validationTarget.length > 0;
      },

      hasState() {
        if (this.disabled) return false;
        return this.hasSuccess || this.shouldValidate && this.hasError;
      },

      internalErrorMessages() {
        return this.genInternalMessages(this.errorMessages);
      },

      internalMessages() {
        return this.genInternalMessages(this.messages);
      },

      internalSuccessMessages() {
        return this.genInternalMessages(this.successMessages);
      },

      internalValue: {
        get() {
          return this.lazyValue;
        },

        set(val) {
          this.lazyValue = val;
          this.$emit('input', val);
        }

      },

      shouldValidate() {
        if (this.externalError) return true;
        if (this.isResetting) return false;
        return this.validateOnBlur ? this.hasFocused && !this.isFocused : this.hasInput || this.hasFocused;
      },

      validations() {
        return this.validationTarget.slice(0, Number(this.errorCount));
      },

      validationState() {
        if (this.disabled) return undefined;
        if (this.hasError && this.shouldValidate) return 'error';
        if (this.hasSuccess) return 'success';
        if (this.hasColor) return this.computedColor;
        return undefined;
      },

      validationTarget() {
        if (this.internalErrorMessages.length > 0) {
          return this.internalErrorMessages;
        } else if (this.successMessages.length > 0) {
          return this.internalSuccessMessages;
        } else if (this.messages.length > 0) {
          return this.internalMessages;
        } else if (this.shouldValidate) {
          return this.errorBucket;
        } else return [];
      }

    },
    watch: {
      rules: {
        handler(newVal, oldVal) {
          if (deepEqual(newVal, oldVal)) return;
          this.validate();
        },

        deep: true
      },

      internalValue() {
        // If it's the first time we're setting input,
        // mark it with hasInput
        this.hasInput = true;
        this.validateOnBlur || this.$nextTick(this.validate);
      },

      isFocused(val) {
        // Should not check validation
        // if disabled
        if (!val && !this.disabled) {
          this.hasFocused = true;
          this.validateOnBlur && this.$nextTick(this.validate);
        }
      },

      isResetting() {
        setTimeout(() => {
          this.hasInput = false;
          this.hasFocused = false;
          this.isResetting = false;
          this.validate();
        }, 0);
      },

      hasError(val) {
        if (this.shouldValidate) {
          this.$emit('update:error', val);
        }
      },

      value(val) {
        this.lazyValue = val;
      }

    },

    beforeMount() {
      this.validate();
    },

    created() {
      this.form && this.form.register(this);
    },

    beforeDestroy() {
      this.form && this.form.unregister(this);
    },

    methods: {
      genInternalMessages(messages) {
        if (!messages) return [];else if (Array.isArray(messages)) return messages;else return [messages];
      },

      /** @public */
      reset() {
        this.isResetting = true;
        this.internalValue = Array.isArray(this.internalValue) ? [] : undefined;
      },

      /** @public */
      resetValidation() {
        this.isResetting = true;
      },

      /** @public */
      validate(force = false, value) {
        const errorBucket = [];
        value = value || this.internalValue;
        if (force) this.hasInput = this.hasFocused = true;

        for (let index = 0; index < this.rules.length; index++) {
          const rule = this.rules[index];
          const valid = typeof rule === 'function' ? rule(value) : rule;

          if (valid === false || typeof valid === 'string') {
            errorBucket.push(valid || '');
          } else if (typeof valid !== 'boolean') {
            consoleError(`Rules should return a string or boolean, received '${typeof valid}' instead`, this);
          }
        }

        this.errorBucket = errorBucket;
        this.valid = errorBucket.length === 0;
        return this.valid;
      }

    }
  });

  // Styles
  const baseMixins$5 = mixins(BindsAttrs, Validatable);
  /* @vue/component */

  var VInput = baseMixins$5.extend().extend({
    name: 'v-input',
    inheritAttrs: false,
    props: {
      appendIcon: String,
      backgroundColor: {
        type: String,
        default: ''
      },
      dense: Boolean,
      height: [Number, String],
      hideDetails: [Boolean, String],
      hint: String,
      id: String,
      label: String,
      loading: Boolean,
      persistentHint: Boolean,
      prependIcon: String,
      value: null
    },

    data() {
      return {
        lazyValue: this.value,
        hasMouseDown: false
      };
    },

    computed: {
      classes() {
        return {
          'v-input--has-state': this.hasState,
          'v-input--hide-details': !this.showDetails,
          'v-input--is-label-active': this.isLabelActive,
          'v-input--is-dirty': this.isDirty,
          'v-input--is-disabled': this.disabled,
          'v-input--is-focused': this.isFocused,
          // <v-switch loading>.loading === '' so we can't just cast to boolean
          'v-input--is-loading': this.loading !== false && this.loading != null,
          'v-input--is-readonly': this.readonly,
          'v-input--dense': this.dense,
          ...this.themeClasses
        };
      },

      computedId() {
        return this.id || `input-${this._uid}`;
      },

      hasDetails() {
        return this.messagesToDisplay.length > 0;
      },

      hasHint() {
        return !this.hasMessages && !!this.hint && (this.persistentHint || this.isFocused);
      },

      hasLabel() {
        return !!(this.$slots.label || this.label);
      },

      // Proxy for `lazyValue`
      // This allows an input
      // to function without
      // a provided model
      internalValue: {
        get() {
          return this.lazyValue;
        },

        set(val) {
          this.lazyValue = val;
          this.$emit(this.$_modelEvent, val);
        }

      },

      isDirty() {
        return !!this.lazyValue;
      },

      isDisabled() {
        return this.disabled || this.readonly;
      },

      isLabelActive() {
        return this.isDirty;
      },

      messagesToDisplay() {
        if (this.hasHint) return [this.hint];
        if (!this.hasMessages) return [];
        return this.validations.map(validation => {
          if (typeof validation === 'string') return validation;
          const validationResult = validation(this.internalValue);
          return typeof validationResult === 'string' ? validationResult : '';
        }).filter(message => message !== '');
      },

      showDetails() {
        return this.hideDetails === false || this.hideDetails === 'auto' && this.hasDetails;
      }

    },
    watch: {
      value(val) {
        this.lazyValue = val;
      }

    },

    beforeCreate() {
      // v-radio-group needs to emit a different event
      // https://github.com/vuetifyjs/vuetify/issues/4752
      this.$_modelEvent = this.$options.model && this.$options.model.event || 'input';
    },

    methods: {
      genContent() {
        return [this.genPrependSlot(), this.genControl(), this.genAppendSlot()];
      },

      genControl() {
        return this.$createElement('div', {
          staticClass: 'v-input__control'
        }, [this.genInputSlot(), this.genMessages()]);
      },

      genDefaultSlot() {
        return [this.genLabel(), this.$slots.default];
      },

      genIcon(type, cb, extraData = {}) {
        const icon = this[`${type}Icon`];
        const eventName = `click:${kebabCase(type)}`;
        const hasListener = !!(this.listeners$[eventName] || cb);
        const data = mergeData({
          attrs: {
            'aria-label': hasListener ? kebabCase(type).split('-')[0] + ' icon' : undefined,
            color: this.validationState,
            dark: this.dark,
            disabled: this.disabled,
            light: this.light
          },
          on: !hasListener ? undefined : {
            click: e => {
              e.preventDefault();
              e.stopPropagation();
              this.$emit(eventName, e);
              cb && cb(e);
            },
            // Container has g event that will
            // trigger menu open if enclosed
            mouseup: e => {
              e.preventDefault();
              e.stopPropagation();
            }
          }
        }, extraData);
        return this.$createElement('div', {
          staticClass: `v-input__icon`,
          class: type ? `v-input__icon--${kebabCase(type)}` : undefined
        }, [this.$createElement(VIcon$1, data, icon)]);
      },

      genInputSlot() {
        return this.$createElement('div', this.setBackgroundColor(this.backgroundColor, {
          staticClass: 'v-input__slot',
          style: {
            height: convertToUnit(this.height)
          },
          on: {
            click: this.onClick,
            mousedown: this.onMouseDown,
            mouseup: this.onMouseUp
          },
          ref: 'input-slot'
        }), [this.genDefaultSlot()]);
      },

      genLabel() {
        if (!this.hasLabel) return null;
        return this.$createElement(VLabel, {
          props: {
            color: this.validationState,
            dark: this.dark,
            disabled: this.disabled,
            focused: this.hasState,
            for: this.computedId,
            light: this.light
          }
        }, this.$slots.label || this.label);
      },

      genMessages() {
        if (!this.showDetails) return null;
        return this.$createElement(VMessages, {
          props: {
            color: this.hasHint ? '' : this.validationState,
            dark: this.dark,
            light: this.light,
            value: this.messagesToDisplay
          },
          attrs: {
            role: this.hasMessages ? 'alert' : null
          },
          scopedSlots: {
            default: props => getSlot(this, 'message', props)
          }
        });
      },

      genSlot(type, location, slot) {
        if (!slot.length) return null;
        const ref = `${type}-${location}`;
        return this.$createElement('div', {
          staticClass: `v-input__${ref}`,
          ref
        }, slot);
      },

      genPrependSlot() {
        const slot = [];

        if (this.$slots.prepend) {
          slot.push(this.$slots.prepend);
        } else if (this.prependIcon) {
          slot.push(this.genIcon('prepend'));
        }

        return this.genSlot('prepend', 'outer', slot);
      },

      genAppendSlot() {
        const slot = []; // Append icon for text field was really
        // an appended inner icon, v-text-field
        // will overwrite this method in order to obtain
        // backwards compat

        if (this.$slots.append) {
          slot.push(this.$slots.append);
        } else if (this.appendIcon) {
          slot.push(this.genIcon('append'));
        }

        return this.genSlot('append', 'outer', slot);
      },

      onClick(e) {
        this.$emit('click', e);
      },

      onMouseDown(e) {
        this.hasMouseDown = true;
        this.$emit('mousedown', e);
      },

      onMouseUp(e) {
        this.hasMouseDown = false;
        this.$emit('mouseup', e);
      }

    },

    render(h) {
      return h('div', this.setTextColor(this.validationState, {
        staticClass: 'v-input',
        class: this.classes
      }), this.genContent());
    }

  });

  // Styles
  /* @vue/component */

  var VCounter = mixins(Themeable).extend({
    name: 'v-counter',
    functional: true,
    props: {
      value: {
        type: [Number, String],
        default: ''
      },
      max: [Number, String]
    },

    render(h, ctx) {
      const {
        props
      } = ctx;
      const max = parseInt(props.max, 10);
      const value = parseInt(props.value, 10);
      const content = max ? `${value} / ${max}` : String(props.value);
      const isGreater = max && value > max;
      return h('div', {
        staticClass: 'v-counter',
        class: {
          'error--text': isGreater,
          ...functionalThemeClasses(ctx)
        }
      }, content);
    }

  });

  // Directives
  function intersectable(options) {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // do nothing because intersection observer is not available
      return Vue.extend({
        name: 'intersectable'
      });
    }

    return Vue.extend({
      name: 'intersectable',

      mounted() {
        Intersect.inserted(this.$el, {
          name: 'intersect',
          value: {
            handler: this.onObserve
          }
        });
      },

      destroyed() {
        Intersect.unbind(this.$el);
      },

      methods: {
        onObserve(entries, observer, isIntersecting) {
          if (!isIntersecting) return;

          for (let i = 0, length = options.onVisible.length; i < length; i++) {
            const callback = this[options.onVisible[i]];

            if (typeof callback === 'function') {
              callback();
              continue;
            }

            consoleWarn(options.onVisible[i] + ' method is not available on the instance but referenced in intersectable mixin options');
          }
        }

      }
    });
  }

  const baseMixins$6 = mixins(Colorable, factory(['absolute', 'fixed', 'top', 'bottom']), Proxyable, Themeable);
  /* @vue/component */

  var VProgressLinear = baseMixins$6.extend({
    name: 'v-progress-linear',
    props: {
      active: {
        type: Boolean,
        default: true
      },
      backgroundColor: {
        type: String,
        default: null
      },
      backgroundOpacity: {
        type: [Number, String],
        default: null
      },
      bufferValue: {
        type: [Number, String],
        default: 100
      },
      color: {
        type: String,
        default: 'primary'
      },
      height: {
        type: [Number, String],
        default: 4
      },
      indeterminate: Boolean,
      query: Boolean,
      rounded: Boolean,
      stream: Boolean,
      striped: Boolean,
      value: {
        type: [Number, String],
        default: 0
      }
    },

    data() {
      return {
        internalLazyValue: this.value || 0
      };
    },

    computed: {
      __cachedBackground() {
        return this.$createElement('div', this.setBackgroundColor(this.backgroundColor || this.color, {
          staticClass: 'v-progress-linear__background',
          style: this.backgroundStyle
        }));
      },

      __cachedBar() {
        return this.$createElement(this.computedTransition, [this.__cachedBarType]);
      },

      __cachedBarType() {
        return this.indeterminate ? this.__cachedIndeterminate : this.__cachedDeterminate;
      },

      __cachedBuffer() {
        return this.$createElement('div', {
          staticClass: 'v-progress-linear__buffer',
          style: this.styles
        });
      },

      __cachedDeterminate() {
        return this.$createElement('div', this.setBackgroundColor(this.color, {
          staticClass: `v-progress-linear__determinate`,
          style: {
            width: convertToUnit(this.normalizedValue, '%')
          }
        }));
      },

      __cachedIndeterminate() {
        return this.$createElement('div', {
          staticClass: 'v-progress-linear__indeterminate',
          class: {
            'v-progress-linear__indeterminate--active': this.active
          }
        }, [this.genProgressBar('long'), this.genProgressBar('short')]);
      },

      __cachedStream() {
        if (!this.stream) return null;
        return this.$createElement('div', this.setTextColor(this.color, {
          staticClass: 'v-progress-linear__stream',
          style: {
            width: convertToUnit(100 - this.normalizedBuffer, '%')
          }
        }));
      },

      backgroundStyle() {
        const backgroundOpacity = this.backgroundOpacity == null ? this.backgroundColor ? 1 : 0.3 : parseFloat(this.backgroundOpacity);
        return {
          opacity: backgroundOpacity,
          [this.$vuetify.rtl ? 'right' : 'left']: convertToUnit(this.normalizedValue, '%'),
          width: convertToUnit(this.normalizedBuffer - this.normalizedValue, '%')
        };
      },

      classes() {
        return {
          'v-progress-linear--absolute': this.absolute,
          'v-progress-linear--fixed': this.fixed,
          'v-progress-linear--query': this.query,
          'v-progress-linear--reactive': this.reactive,
          'v-progress-linear--rounded': this.rounded,
          'v-progress-linear--striped': this.striped,
          ...this.themeClasses
        };
      },

      computedTransition() {
        return this.indeterminate ? VFadeTransition : VSlideXTransition;
      },

      normalizedBuffer() {
        return this.normalize(this.bufferValue);
      },

      normalizedValue() {
        return this.normalize(this.internalLazyValue);
      },

      reactive() {
        return Boolean(this.$listeners.change);
      },

      styles() {
        const styles = {};

        if (!this.active) {
          styles.height = 0;
        }

        if (!this.indeterminate && parseFloat(this.normalizedBuffer) !== 100) {
          styles.width = convertToUnit(this.normalizedBuffer, '%');
        }

        return styles;
      }

    },
    methods: {
      genContent() {
        const slot = getSlot(this, 'default', {
          value: this.internalLazyValue
        });
        if (!slot) return null;
        return this.$createElement('div', {
          staticClass: 'v-progress-linear__content'
        }, slot);
      },

      genListeners() {
        const listeners = this.$listeners;

        if (this.reactive) {
          listeners.click = this.onClick;
        }

        return listeners;
      },

      genProgressBar(name) {
        return this.$createElement('div', this.setBackgroundColor(this.color, {
          staticClass: 'v-progress-linear__indeterminate',
          class: {
            [name]: true
          }
        }));
      },

      onClick(e) {
        if (!this.reactive) return;
        const {
          width
        } = this.$el.getBoundingClientRect();
        this.internalValue = e.offsetX / width * 100;
      },

      normalize(value) {
        if (value < 0) return 0;
        if (value > 100) return 100;
        return parseFloat(value);
      }

    },

    render(h) {
      const data = {
        staticClass: 'v-progress-linear',
        attrs: {
          role: 'progressbar',
          'aria-valuemin': 0,
          'aria-valuemax': this.normalizedBuffer,
          'aria-valuenow': this.indeterminate ? undefined : this.normalizedValue
        },
        class: this.classes,
        style: {
          bottom: this.bottom ? 0 : undefined,
          height: this.active ? convertToUnit(this.height) : 0,
          top: this.top ? 0 : undefined
        },
        on: this.genListeners()
      };
      return h('div', data, [this.__cachedStream, this.__cachedBackground, this.__cachedBuffer, this.__cachedBar, this.genContent()]);
    }

  });

  /**
   * Loadable
   *
   * @mixin
   *
   * Used to add linear progress bar to components
   * Can use a default bar with a specific color
   * or designate a custom progress linear bar
   */

  /* @vue/component */

  var Loadable = Vue.extend().extend({
    name: 'loadable',
    props: {
      loading: {
        type: [Boolean, String],
        default: false
      },
      loaderHeight: {
        type: [Number, String],
        default: 2
      }
    },
    methods: {
      genProgress() {
        if (this.loading === false) return null;
        return this.$slots.progress || this.$createElement(VProgressLinear, {
          props: {
            absolute: true,
            color: this.loading === true || this.loading === '' ? this.color || 'primary' : this.loading,
            height: this.loaderHeight,
            indeterminate: true
          }
        });
      }

    }
  });

  // Styles
  const baseMixins$7 = mixins(VInput, intersectable({
    onVisible: ['setLabelWidth', 'setPrefixWidth', 'setPrependWidth', 'tryAutofocus']
  }), Loadable);
  const dirtyTypes = ['color', 'file', 'time', 'date', 'datetime-local', 'week', 'month'];
  /* @vue/component */

  var VTextField = baseMixins$7.extend().extend({
    name: 'v-text-field',
    directives: {
      ripple: Ripple
    },
    inheritAttrs: false,
    props: {
      appendOuterIcon: String,
      autofocus: Boolean,
      clearable: Boolean,
      clearIcon: {
        type: String,
        default: '$clear'
      },
      counter: [Boolean, Number, String],
      counterValue: Function,
      filled: Boolean,
      flat: Boolean,
      fullWidth: Boolean,
      label: String,
      outlined: Boolean,
      placeholder: String,
      prefix: String,
      prependInnerIcon: String,
      reverse: Boolean,
      rounded: Boolean,
      shaped: Boolean,
      singleLine: Boolean,
      solo: Boolean,
      soloInverted: Boolean,
      suffix: String,
      type: {
        type: String,
        default: 'text'
      }
    },
    data: () => ({
      badInput: false,
      labelWidth: 0,
      prefixWidth: 0,
      prependWidth: 0,
      initialValue: null,
      isBooted: false,
      isClearing: false
    }),
    computed: {
      classes() {
        return { ...VInput.options.computed.classes.call(this),
          'v-text-field': true,
          'v-text-field--full-width': this.fullWidth,
          'v-text-field--prefix': this.prefix,
          'v-text-field--single-line': this.isSingle,
          'v-text-field--solo': this.isSolo,
          'v-text-field--solo-inverted': this.soloInverted,
          'v-text-field--solo-flat': this.flat,
          'v-text-field--filled': this.filled,
          'v-text-field--is-booted': this.isBooted,
          'v-text-field--enclosed': this.isEnclosed,
          'v-text-field--reverse': this.reverse,
          'v-text-field--outlined': this.outlined,
          'v-text-field--placeholder': this.placeholder,
          'v-text-field--rounded': this.rounded,
          'v-text-field--shaped': this.shaped
        };
      },

      computedColor() {
        const computedColor = Validatable.options.computed.computedColor.call(this);
        if (!this.soloInverted || !this.isFocused) return computedColor;
        return this.color || 'primary';
      },

      computedCounterValue() {
        if (typeof this.counterValue === 'function') {
          return this.counterValue(this.internalValue);
        }

        return (this.internalValue || '').toString().length;
      },

      hasCounter() {
        return this.counter !== false && this.counter != null;
      },

      hasDetails() {
        return VInput.options.computed.hasDetails.call(this) || this.hasCounter;
      },

      internalValue: {
        get() {
          return this.lazyValue;
        },

        set(val) {
          this.lazyValue = val;
          this.$emit('input', this.lazyValue);
        }

      },

      isDirty() {
        return this.lazyValue != null && this.lazyValue.toString().length > 0 || this.badInput;
      },

      isEnclosed() {
        return this.filled || this.isSolo || this.outlined;
      },

      isLabelActive() {
        return this.isDirty || dirtyTypes.includes(this.type);
      },

      isSingle() {
        return this.isSolo || this.singleLine || this.fullWidth || // https://material.io/components/text-fields/#filled-text-field
        this.filled && !this.hasLabel;
      },

      isSolo() {
        return this.solo || this.soloInverted;
      },

      labelPosition() {
        let offset = this.prefix && !this.labelValue ? this.prefixWidth : 0;
        if (this.labelValue && this.prependWidth) offset -= this.prependWidth;
        return this.$vuetify.rtl === this.reverse ? {
          left: offset,
          right: 'auto'
        } : {
          left: 'auto',
          right: offset
        };
      },

      showLabel() {
        return this.hasLabel && (!this.isSingle || !this.isLabelActive && !this.placeholder);
      },

      labelValue() {
        return !this.isSingle && Boolean(this.isFocused || this.isLabelActive || this.placeholder);
      }

    },
    watch: {
      labelValue: 'setLabelWidth',
      outlined: 'setLabelWidth',

      label() {
        this.$nextTick(this.setLabelWidth);
      },

      prefix() {
        this.$nextTick(this.setPrefixWidth);
      },

      isFocused: 'updateValue',

      value(val) {
        this.lazyValue = val;
      }

    },

    created() {
      /* istanbul ignore next */
      if (this.$attrs.hasOwnProperty('box')) {
        breaking('box', 'filled', this);
      }
      /* istanbul ignore next */


      if (this.$attrs.hasOwnProperty('browser-autocomplete')) {
        breaking('browser-autocomplete', 'autocomplete', this);
      }
      /* istanbul ignore if */


      if (this.shaped && !(this.filled || this.outlined || this.isSolo)) {
        consoleWarn('shaped should be used with either filled or outlined', this);
      }
    },

    mounted() {
      this.autofocus && this.tryAutofocus();
      this.setLabelWidth();
      this.setPrefixWidth();
      this.setPrependWidth();
      requestAnimationFrame(() => this.isBooted = true);
    },

    methods: {
      /** @public */
      focus() {
        this.onFocus();
      },

      /** @public */
      blur(e) {
        // https://github.com/vuetifyjs/vuetify/issues/5913
        // Safari tab order gets broken if called synchronous
        window.requestAnimationFrame(() => {
          this.$refs.input && this.$refs.input.blur();
        });
      },

      clearableCallback() {
        this.$refs.input && this.$refs.input.focus();
        this.$nextTick(() => this.internalValue = null);
      },

      genAppendSlot() {
        const slot = [];

        if (this.$slots['append-outer']) {
          slot.push(this.$slots['append-outer']);
        } else if (this.appendOuterIcon) {
          slot.push(this.genIcon('appendOuter'));
        }

        return this.genSlot('append', 'outer', slot);
      },

      genPrependInnerSlot() {
        const slot = [];

        if (this.$slots['prepend-inner']) {
          slot.push(this.$slots['prepend-inner']);
        } else if (this.prependInnerIcon) {
          slot.push(this.genIcon('prependInner'));
        }

        return this.genSlot('prepend', 'inner', slot);
      },

      genIconSlot() {
        const slot = [];

        if (this.$slots['append']) {
          slot.push(this.$slots['append']);
        } else if (this.appendIcon) {
          slot.push(this.genIcon('append'));
        }

        return this.genSlot('append', 'inner', slot);
      },

      genInputSlot() {
        const input = VInput.options.methods.genInputSlot.call(this);
        const prepend = this.genPrependInnerSlot();

        if (prepend) {
          input.children = input.children || [];
          input.children.unshift(prepend);
        }

        return input;
      },

      genClearIcon() {
        if (!this.clearable) return null;
        const data = this.isDirty ? undefined : {
          attrs: {
            disabled: true
          }
        };
        return this.genSlot('append', 'inner', [this.genIcon('clear', this.clearableCallback, data)]);
      },

      genCounter() {
        if (!this.hasCounter) return null;
        const max = this.counter === true ? this.attrs$.maxlength : this.counter;
        return this.$createElement(VCounter, {
          props: {
            dark: this.dark,
            light: this.light,
            max,
            value: this.computedCounterValue
          }
        });
      },

      genDefaultSlot() {
        return [this.genFieldset(), this.genTextFieldSlot(), this.genClearIcon(), this.genIconSlot(), this.genProgress()];
      },

      genFieldset() {
        if (!this.outlined) return null;
        return this.$createElement('fieldset', {
          attrs: {
            'aria-hidden': true
          }
        }, [this.genLegend()]);
      },

      genLabel() {
        if (!this.showLabel) return null;
        const data = {
          props: {
            absolute: true,
            color: this.validationState,
            dark: this.dark,
            disabled: this.disabled,
            focused: !this.isSingle && (this.isFocused || !!this.validationState),
            for: this.computedId,
            left: this.labelPosition.left,
            light: this.light,
            right: this.labelPosition.right,
            value: this.labelValue
          }
        };
        return this.$createElement(VLabel, data, this.$slots.label || this.label);
      },

      genLegend() {
        const width = !this.singleLine && (this.labelValue || this.isDirty) ? this.labelWidth : 0;
        const span = this.$createElement('span', {
          domProps: {
            innerHTML: '&#8203;'
          }
        });
        return this.$createElement('legend', {
          style: {
            width: !this.isSingle ? convertToUnit(width) : undefined
          }
        }, [span]);
      },

      genInput() {
        const listeners = Object.assign({}, this.listeners$);
        delete listeners['change']; // Change should not be bound externally

        return this.$createElement('input', {
          style: {},
          domProps: {
            value: this.type === 'number' && Object.is(this.lazyValue, -0) ? '-0' : this.lazyValue
          },
          attrs: { ...this.attrs$,
            autofocus: this.autofocus,
            disabled: this.disabled,
            id: this.computedId,
            placeholder: this.placeholder,
            readonly: this.readonly,
            type: this.type
          },
          on: Object.assign(listeners, {
            blur: this.onBlur,
            input: this.onInput,
            focus: this.onFocus,
            keydown: this.onKeyDown
          }),
          ref: 'input'
        });
      },

      genMessages() {
        if (!this.showDetails) return null;
        const messagesNode = VInput.options.methods.genMessages.call(this);
        const counterNode = this.genCounter();
        return this.$createElement('div', {
          staticClass: 'v-text-field__details'
        }, [messagesNode, counterNode]);
      },

      genTextFieldSlot() {
        return this.$createElement('div', {
          staticClass: 'v-text-field__slot'
        }, [this.genLabel(), this.prefix ? this.genAffix('prefix') : null, this.genInput(), this.suffix ? this.genAffix('suffix') : null]);
      },

      genAffix(type) {
        return this.$createElement('div', {
          class: `v-text-field__${type}`,
          ref: type
        }, this[type]);
      },

      onBlur(e) {
        this.isFocused = false;
        e && this.$nextTick(() => this.$emit('blur', e));
      },

      onClick() {
        if (this.isFocused || this.disabled || !this.$refs.input) return;
        this.$refs.input.focus();
      },

      onFocus(e) {
        if (!this.$refs.input) return;

        if (document.activeElement !== this.$refs.input) {
          return this.$refs.input.focus();
        }

        if (!this.isFocused) {
          this.isFocused = true;
          e && this.$emit('focus', e);
        }
      },

      onInput(e) {
        const target = e.target;
        this.internalValue = target.value;
        this.badInput = target.validity && target.validity.badInput;
      },

      onKeyDown(e) {
        if (e.keyCode === keyCodes.enter) this.$emit('change', this.internalValue);
        this.$emit('keydown', e);
      },

      onMouseDown(e) {
        // Prevent input from being blurred
        if (e.target !== this.$refs.input) {
          e.preventDefault();
          e.stopPropagation();
        }

        VInput.options.methods.onMouseDown.call(this, e);
      },

      onMouseUp(e) {
        if (this.hasMouseDown) this.focus();
        VInput.options.methods.onMouseUp.call(this, e);
      },

      setLabelWidth() {
        if (!this.outlined) return;
        this.labelWidth = this.$refs.label ? Math.min(this.$refs.label.scrollWidth * 0.75 + 6, this.$el.offsetWidth - 24) : 0;
      },

      setPrefixWidth() {
        if (!this.$refs.prefix) return;
        this.prefixWidth = this.$refs.prefix.offsetWidth;
      },

      setPrependWidth() {
        if (!this.outlined || !this.$refs['prepend-inner']) return;
        this.prependWidth = this.$refs['prepend-inner'].offsetWidth;
      },

      tryAutofocus() {
        if (!this.autofocus || typeof document === 'undefined' || !this.$refs.input || document.activeElement === this.$refs.input) return false;
        this.$refs.input.focus();
        return true;
      },

      updateValue(val) {
        // Sets validationState from validatable
        this.hasColor = val;

        if (val) {
          this.initialValue = this.lazyValue;
        } else if (this.initialValue !== this.lazyValue) {
          this.$emit('change', this.lazyValue);
        }
      }

    }
  });

  var Comparable = Vue.extend({
    name: 'comparable',
    props: {
      valueComparator: {
        type: Function,
        default: deepEqual
      }
    }
  });

  /* @vue/component */

  var Filterable = Vue.extend({
    name: 'filterable',
    props: {
      noDataText: {
        type: String,
        default: '$vuetify.noDataText'
      }
    }
  });

  // Styles
  const defaultMenuProps = {
    closeOnClick: false,
    closeOnContentClick: false,
    disableKeys: true,
    openOnClick: false,
    maxHeight: 304
  }; // Types

  const baseMixins$8 = mixins(VTextField, Comparable, Filterable);
  /* @vue/component */

  var VSelect = baseMixins$8.extend().extend({
    name: 'v-select',
    directives: {
      ClickOutside
    },
    props: {
      appendIcon: {
        type: String,
        default: '$dropdown'
      },
      attach: {
        type: null,
        default: false
      },
      cacheItems: Boolean,
      chips: Boolean,
      clearable: Boolean,
      deletableChips: Boolean,
      disableLookup: Boolean,
      eager: Boolean,
      hideSelected: Boolean,
      items: {
        type: Array,
        default: () => []
      },
      itemColor: {
        type: String,
        default: 'primary'
      },
      itemDisabled: {
        type: [String, Array, Function],
        default: 'disabled'
      },
      itemText: {
        type: [String, Array, Function],
        default: 'text'
      },
      itemValue: {
        type: [String, Array, Function],
        default: 'value'
      },
      menuProps: {
        type: [String, Array, Object],
        default: () => defaultMenuProps
      },
      multiple: Boolean,
      openOnClear: Boolean,
      returnObject: Boolean,
      smallChips: Boolean
    },

    data() {
      return {
        cachedItems: this.cacheItems ? this.items : [],
        menuIsBooted: false,
        isMenuActive: false,
        lastItem: 20,
        // As long as a value is defined, show it
        // Otherwise, check if multiple
        // to determine which default to provide
        lazyValue: this.value !== undefined ? this.value : this.multiple ? [] : undefined,
        selectedIndex: -1,
        selectedItems: [],
        keyboardLookupPrefix: '',
        keyboardLookupLastTime: 0
      };
    },

    computed: {
      /* All items that the select has */
      allItems() {
        return this.filterDuplicates(this.cachedItems.concat(this.items));
      },

      classes() {
        return { ...VTextField.options.computed.classes.call(this),
          'v-select': true,
          'v-select--chips': this.hasChips,
          'v-select--chips--small': this.smallChips,
          'v-select--is-menu-active': this.isMenuActive,
          'v-select--is-multi': this.multiple
        };
      },

      /* Used by other components to overwrite */
      computedItems() {
        return this.allItems;
      },

      computedOwns() {
        return `list-${this._uid}`;
      },

      computedCounterValue() {
        return this.multiple ? this.selectedItems.length : (this.getText(this.selectedItems[0]) || '').toString().length;
      },

      directives() {
        return this.isFocused ? [{
          name: 'click-outside',
          value: this.blur,
          args: {
            closeConditional: this.closeConditional
          }
        }] : undefined;
      },

      dynamicHeight() {
        return 'auto';
      },

      hasChips() {
        return this.chips || this.smallChips;
      },

      hasSlot() {
        return Boolean(this.hasChips || this.$scopedSlots.selection);
      },

      isDirty() {
        return this.selectedItems.length > 0;
      },

      listData() {
        const scopeId = this.$vnode && this.$vnode.context.$options._scopeId;
        const attrs = scopeId ? {
          [scopeId]: true
        } : {};
        return {
          attrs: { ...attrs,
            id: this.computedOwns
          },
          props: {
            action: this.multiple,
            color: this.itemColor,
            dense: this.dense,
            hideSelected: this.hideSelected,
            items: this.virtualizedItems,
            itemDisabled: this.itemDisabled,
            itemText: this.itemText,
            itemValue: this.itemValue,
            noDataText: this.$vuetify.lang.t(this.noDataText),
            selectedItems: this.selectedItems
          },
          on: {
            select: this.selectItem
          },
          scopedSlots: {
            item: this.$scopedSlots.item
          }
        };
      },

      staticList() {
        if (this.$slots['no-data'] || this.$slots['prepend-item'] || this.$slots['append-item']) {
          consoleError('assert: staticList should not be called if slots are used');
        }

        return this.$createElement(VSelectList, this.listData);
      },

      virtualizedItems() {
        return this.$_menuProps.auto ? this.computedItems : this.computedItems.slice(0, this.lastItem);
      },

      menuCanShow: () => true,

      $_menuProps() {
        let normalisedProps = typeof this.menuProps === 'string' ? this.menuProps.split(',') : this.menuProps;

        if (Array.isArray(normalisedProps)) {
          normalisedProps = normalisedProps.reduce((acc, p) => {
            acc[p.trim()] = true;
            return acc;
          }, {});
        }

        return { ...defaultMenuProps,
          eager: this.eager,
          value: this.menuCanShow && this.isMenuActive,
          nudgeBottom: normalisedProps.offsetY ? 1 : 0,
          ...normalisedProps
        };
      }

    },
    watch: {
      internalValue(val) {
        this.initialValue = val;
        this.setSelectedItems();
      },

      menuIsBooted() {
        window.setTimeout(() => {
          if (this.getContent() && this.getContent().addEventListener) {
            this.getContent().addEventListener('scroll', this.onScroll, false);
          }
        });
      },

      isMenuActive(val) {
        window.setTimeout(() => this.onMenuActiveChange(val));
        if (!val) return;
        this.menuIsBooted = true;
      },

      items: {
        immediate: true,

        handler(val) {
          if (this.cacheItems) {
            // Breaks vue-test-utils if
            // this isn't calculated
            // on the next tick
            this.$nextTick(() => {
              this.cachedItems = this.filterDuplicates(this.cachedItems.concat(val));
            });
          }

          this.setSelectedItems();
        }

      }
    },
    methods: {
      /** @public */
      blur(e) {
        VTextField.options.methods.blur.call(this, e);
        this.isMenuActive = false;
        this.isFocused = false;
        this.selectedIndex = -1;
      },

      /** @public */
      activateMenu() {
        if (this.disabled || this.readonly || this.isMenuActive) return;
        this.isMenuActive = true;
      },

      clearableCallback() {
        this.setValue(this.multiple ? [] : undefined);
        this.setMenuIndex(-1);
        this.$nextTick(() => this.$refs.input && this.$refs.input.focus());
        if (this.openOnClear) this.isMenuActive = true;
      },

      closeConditional(e) {
        if (!this.isMenuActive) return true;
        return !this._isDestroyed && ( // Click originates from outside the menu content
        // Multiple selects don't close when an item is clicked
        !this.getContent() || !this.getContent().contains(e.target)) && // Click originates from outside the element
        this.$el && !this.$el.contains(e.target) && e.target !== this.$el;
      },

      filterDuplicates(arr) {
        const uniqueValues = new Map();

        for (let index = 0; index < arr.length; ++index) {
          const item = arr[index];
          const val = this.getValue(item); // TODO: comparator

          !uniqueValues.has(val) && uniqueValues.set(val, item);
        }

        return Array.from(uniqueValues.values());
      },

      findExistingIndex(item) {
        const itemValue = this.getValue(item);
        return (this.internalValue || []).findIndex(i => this.valueComparator(this.getValue(i), itemValue));
      },

      getContent() {
        return this.$refs.menu && this.$refs.menu.$refs.content;
      },

      genChipSelection(item, index) {
        const isDisabled = this.disabled || this.readonly || this.getDisabled(item);
        return this.$createElement(VChip, {
          staticClass: 'v-chip--select',
          attrs: {
            tabindex: -1
          },
          props: {
            close: this.deletableChips && !isDisabled,
            disabled: isDisabled,
            inputValue: index === this.selectedIndex,
            small: this.smallChips
          },
          on: {
            click: e => {
              if (isDisabled) return;
              e.stopPropagation();
              this.selectedIndex = index;
            },
            'click:close': () => this.onChipInput(item)
          },
          key: JSON.stringify(this.getValue(item))
        }, this.getText(item));
      },

      genCommaSelection(item, index, last) {
        const color = index === this.selectedIndex && this.computedColor;
        const isDisabled = this.disabled || this.getDisabled(item);
        return this.$createElement('div', this.setTextColor(color, {
          staticClass: 'v-select__selection v-select__selection--comma',
          class: {
            'v-select__selection--disabled': isDisabled
          },
          key: JSON.stringify(this.getValue(item))
        }), `${this.getText(item)}${last ? '' : ', '}`);
      },

      genDefaultSlot() {
        const selections = this.genSelections();
        const input = this.genInput(); // If the return is an empty array
        // push the input

        if (Array.isArray(selections)) {
          selections.push(input); // Otherwise push it into children
        } else {
          selections.children = selections.children || [];
          selections.children.push(input);
        }

        return [this.genFieldset(), this.$createElement('div', {
          staticClass: 'v-select__slot',
          directives: this.directives
        }, [this.genLabel(), this.prefix ? this.genAffix('prefix') : null, selections, this.suffix ? this.genAffix('suffix') : null, this.genClearIcon(), this.genIconSlot(), this.genHiddenInput()]), this.genMenu(), this.genProgress()];
      },

      genIcon(type, cb, extraData) {
        const icon = VInput.options.methods.genIcon.call(this, type, cb, extraData);

        if (type === 'append') {
          // Don't allow the dropdown icon to be focused
          icon.children[0].data = mergeData(icon.children[0].data, {
            attrs: {
              tabindex: icon.children[0].componentOptions.listeners && '-1',
              'aria-hidden': 'true',
              'aria-label': undefined
            }
          });
        }

        return icon;
      },

      genInput() {
        const input = VTextField.options.methods.genInput.call(this);
        delete input.data.attrs.name;
        input.data = mergeData(input.data, {
          domProps: {
            value: null
          },
          attrs: {
            readonly: true,
            type: 'text',
            'aria-readonly': String(this.readonly),
            'aria-activedescendant': getObjectValueByPath(this.$refs.menu, 'activeTile.id'),
            autocomplete: getObjectValueByPath(input.data, 'attrs.autocomplete', 'off')
          },
          on: {
            keypress: this.onKeyPress
          }
        });
        return input;
      },

      genHiddenInput() {
        return this.$createElement('input', {
          domProps: {
            value: this.lazyValue
          },
          attrs: {
            type: 'hidden',
            name: this.attrs$.name
          }
        });
      },

      genInputSlot() {
        const render = VTextField.options.methods.genInputSlot.call(this);
        render.data.attrs = { ...render.data.attrs,
          role: 'button',
          'aria-haspopup': 'listbox',
          'aria-expanded': String(this.isMenuActive),
          'aria-owns': this.computedOwns
        };
        return render;
      },

      genList() {
        // If there's no slots, we can use a cached VNode to improve performance
        if (this.$slots['no-data'] || this.$slots['prepend-item'] || this.$slots['append-item']) {
          return this.genListWithSlot();
        } else {
          return this.staticList;
        }
      },

      genListWithSlot() {
        const slots = ['prepend-item', 'no-data', 'append-item'].filter(slotName => this.$slots[slotName]).map(slotName => this.$createElement('template', {
          slot: slotName
        }, this.$slots[slotName])); // Requires destructuring due to Vue
        // modifying the `on` property when passed
        // as a referenced object

        return this.$createElement(VSelectList, { ...this.listData
        }, slots);
      },

      genMenu() {
        const props = this.$_menuProps;
        props.activator = this.$refs['input-slot']; // Attach to root el so that
        // menu covers prepend/append icons

        if ( // TODO: make this a computed property or helper or something
        this.attach === '' || // If used as a boolean prop (<v-menu attach>)
        this.attach === true || // If bound to a boolean (<v-menu :attach="true">)
        this.attach === 'attach' // If bound as boolean prop in pug (v-menu(attach))
        ) {
            props.attach = this.$el;
          } else {
          props.attach = this.attach;
        }

        return this.$createElement(VMenu, {
          attrs: {
            role: undefined
          },
          props,
          on: {
            input: val => {
              this.isMenuActive = val;
              this.isFocused = val;
            }
          },
          ref: 'menu'
        }, [this.genList()]);
      },

      genSelections() {
        let length = this.selectedItems.length;
        const children = new Array(length);
        let genSelection;

        if (this.$scopedSlots.selection) {
          genSelection = this.genSlotSelection;
        } else if (this.hasChips) {
          genSelection = this.genChipSelection;
        } else {
          genSelection = this.genCommaSelection;
        }

        while (length--) {
          children[length] = genSelection(this.selectedItems[length], length, length === children.length - 1);
        }

        return this.$createElement('div', {
          staticClass: 'v-select__selections'
        }, children);
      },

      genSlotSelection(item, index) {
        return this.$scopedSlots.selection({
          attrs: {
            class: 'v-chip--select'
          },
          parent: this,
          item,
          index,
          select: e => {
            e.stopPropagation();
            this.selectedIndex = index;
          },
          selected: index === this.selectedIndex,
          disabled: this.disabled || this.readonly
        });
      },

      getMenuIndex() {
        return this.$refs.menu ? this.$refs.menu.listIndex : -1;
      },

      getDisabled(item) {
        return getPropertyFromItem(item, this.itemDisabled, false);
      },

      getText(item) {
        return getPropertyFromItem(item, this.itemText, item);
      },

      getValue(item) {
        return getPropertyFromItem(item, this.itemValue, this.getText(item));
      },

      onBlur(e) {
        e && this.$emit('blur', e);
      },

      onChipInput(item) {
        if (this.multiple) this.selectItem(item);else this.setValue(null); // If all items have been deleted,
        // open `v-menu`

        if (this.selectedItems.length === 0) {
          this.isMenuActive = true;
        } else {
          this.isMenuActive = false;
        }

        this.selectedIndex = -1;
      },

      onClick(e) {
        if (this.isDisabled) return;

        if (!this.isAppendInner(e.target)) {
          this.isMenuActive = true;
        }

        if (!this.isFocused) {
          this.isFocused = true;
          this.$emit('focus');
        }

        this.$emit('click', e);
      },

      onEscDown(e) {
        e.preventDefault();

        if (this.isMenuActive) {
          e.stopPropagation();
          this.isMenuActive = false;
        }
      },

      onKeyPress(e) {
        if (this.multiple || this.readonly || this.disableLookup) return;
        const KEYBOARD_LOOKUP_THRESHOLD = 1000; // milliseconds

        const now = performance.now();

        if (now - this.keyboardLookupLastTime > KEYBOARD_LOOKUP_THRESHOLD) {
          this.keyboardLookupPrefix = '';
        }

        this.keyboardLookupPrefix += e.key.toLowerCase();
        this.keyboardLookupLastTime = now;
        const index = this.allItems.findIndex(item => {
          const text = (this.getText(item) || '').toString();
          return text.toLowerCase().startsWith(this.keyboardLookupPrefix);
        });
        const item = this.allItems[index];

        if (index !== -1) {
          this.lastItem = Math.max(this.lastItem, index + 5);
          this.setValue(this.returnObject ? item : this.getValue(item));
          this.$nextTick(() => this.$refs.menu.getTiles());
          setTimeout(() => this.setMenuIndex(index));
        }
      },

      onKeyDown(e) {
        if (this.readonly && e.keyCode !== keyCodes.tab) return;
        const keyCode = e.keyCode;
        const menu = this.$refs.menu; // If enter, space, open menu

        if ([keyCodes.enter, keyCodes.space].includes(keyCode)) this.activateMenu();
        this.$emit('keydown', e);
        if (!menu) return; // If menu is active, allow default
        // listIndex change from menu

        if (this.isMenuActive && keyCode !== keyCodes.tab) {
          this.$nextTick(() => {
            menu.changeListIndex(e);
            this.$emit('update:list-index', menu.listIndex);
          });
        } // If menu is not active, up and down can do
        // one of 2 things. If multiple, opens the
        // menu, if not, will cycle through all
        // available options


        if (!this.isMenuActive && [keyCodes.up, keyCodes.down].includes(keyCode)) return this.onUpDown(e); // If escape deactivate the menu

        if (keyCode === keyCodes.esc) return this.onEscDown(e); // If tab - select item or close menu

        if (keyCode === keyCodes.tab) return this.onTabDown(e); // If space preventDefault

        if (keyCode === keyCodes.space) return this.onSpaceDown(e);
      },

      onMenuActiveChange(val) {
        // If menu is closing and mulitple
        // or menuIndex is already set
        // skip menu index recalculation
        if (this.multiple && !val || this.getMenuIndex() > -1) return;
        const menu = this.$refs.menu;
        if (!menu || !this.isDirty) return; // When menu opens, set index of first active item

        for (let i = 0; i < menu.tiles.length; i++) {
          if (menu.tiles[i].getAttribute('aria-selected') === 'true') {
            this.setMenuIndex(i);
            break;
          }
        }
      },

      onMouseUp(e) {
        if (this.hasMouseDown && e.which !== 3 && !this.isDisabled) {
          // If append inner is present
          // and the target is itself
          // or inside, toggle menu
          if (this.isAppendInner(e.target)) {
            this.$nextTick(() => this.isMenuActive = !this.isMenuActive); // If user is clicking in the container
            // and field is enclosed, activate it
          } else if (this.isEnclosed) {
            this.isMenuActive = true;
          }
        }

        VTextField.options.methods.onMouseUp.call(this, e);
      },

      onScroll() {
        if (!this.isMenuActive) {
          requestAnimationFrame(() => this.getContent().scrollTop = 0);
        } else {
          if (this.lastItem >= this.computedItems.length) return;
          const showMoreItems = this.getContent().scrollHeight - (this.getContent().scrollTop + this.getContent().clientHeight) < 200;

          if (showMoreItems) {
            this.lastItem += 20;
          }
        }
      },

      onSpaceDown(e) {
        e.preventDefault();
      },

      onTabDown(e) {
        const menu = this.$refs.menu;
        if (!menu) return;
        const activeTile = menu.activeTile; // An item that is selected by
        // menu-index should toggled

        if (!this.multiple && activeTile && this.isMenuActive) {
          e.preventDefault();
          e.stopPropagation();
          activeTile.click();
        } else {
          // If we make it here,
          // the user has no selected indexes
          // and is probably tabbing out
          this.blur(e);
        }
      },

      onUpDown(e) {
        const menu = this.$refs.menu;
        if (!menu) return;
        e.preventDefault(); // Multiple selects do not cycle their value
        // when pressing up or down, instead activate
        // the menu

        if (this.multiple) return this.activateMenu();
        const keyCode = e.keyCode; // Cycle through available values to achieve
        // select native behavior

        menu.isBooted = true;
        window.requestAnimationFrame(() => {
          menu.getTiles();
          keyCodes.up === keyCode ? menu.prevTile() : menu.nextTile();
          menu.activeTile && menu.activeTile.click();
        });
      },

      selectItem(item) {
        if (!this.multiple) {
          this.setValue(this.returnObject ? item : this.getValue(item));
          this.isMenuActive = false;
        } else {
          const internalValue = (this.internalValue || []).slice();
          const i = this.findExistingIndex(item);
          i !== -1 ? internalValue.splice(i, 1) : internalValue.push(item);
          this.setValue(internalValue.map(i => {
            return this.returnObject ? i : this.getValue(i);
          })); // When selecting multiple
          // adjust menu after each
          // selection

          this.$nextTick(() => {
            this.$refs.menu && this.$refs.menu.updateDimensions();
          }); // We only need to reset list index for multiple
          // to keep highlight when an item is toggled
          // on and off

          if (!this.multiple) return;
          const listIndex = this.getMenuIndex();
          this.setMenuIndex(-1); // There is no item to re-highlight
          // when selections are hidden

          if (this.hideSelected) return;
          this.$nextTick(() => this.setMenuIndex(listIndex));
        }
      },

      setMenuIndex(index) {
        this.$refs.menu && (this.$refs.menu.listIndex = index);
      },

      setSelectedItems() {
        const selectedItems = [];
        const values = !this.multiple || !Array.isArray(this.internalValue) ? [this.internalValue] : this.internalValue;

        for (const value of values) {
          const index = this.allItems.findIndex(v => this.valueComparator(this.getValue(v), this.getValue(value)));

          if (index > -1) {
            selectedItems.push(this.allItems[index]);
          }
        }

        this.selectedItems = selectedItems;
      },

      setValue(value) {
        const oldValue = this.internalValue;
        this.internalValue = value;
        value !== oldValue && this.$emit('change', value);
      },

      isAppendInner(target) {
        // return true if append inner is present
        // and the target is itself or inside
        const appendInner = this.$refs['append-inner'];
        return appendInner && (appendInner === target || appendInner.contains(target));
      }

    }
  });

  const srgbForwardMatrix = [[3.2406, -1.5372, -0.4986], [-0.9689, 1.8758, 0.0415], [0.0557, -0.2040, 1.0570]]; // Forward gamma adjust

  const srgbForwardTransform = C => C <= 0.0031308 ? C * 12.92 : 1.055 * C ** (1 / 2.4) - 0.055; // For converting sRGB to XYZ


  const srgbReverseMatrix = [[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]; // Reverse gamma adjust

  const srgbReverseTransform = C => C <= 0.04045 ? C / 12.92 : ((C + 0.055) / 1.055) ** 2.4;

  function fromXYZ(xyz) {
    const rgb = Array(3);
    const transform = srgbForwardTransform;
    const matrix = srgbForwardMatrix; // Matrix transform, then gamma adjustment

    for (let i = 0; i < 3; ++i) {
      rgb[i] = Math.round(clamp(transform(matrix[i][0] * xyz[0] + matrix[i][1] * xyz[1] + matrix[i][2] * xyz[2])) * 255);
    } // Rescale back to [0, 255]


    return (rgb[0] << 16) + (rgb[1] << 8) + (rgb[2] << 0);
  }
  function toXYZ(rgb) {
    const xyz = [0, 0, 0];
    const transform = srgbReverseTransform;
    const matrix = srgbReverseMatrix; // Rescale from [0, 255] to [0, 1] then adjust sRGB gamma to linear RGB

    const r = transform((rgb >> 16 & 0xff) / 255);
    const g = transform((rgb >> 8 & 0xff) / 255);
    const b = transform((rgb >> 0 & 0xff) / 255); // Matrix color space transform

    for (let i = 0; i < 3; ++i) {
      xyz[i] = matrix[i][0] * r + matrix[i][1] * g + matrix[i][2] * b;
    }

    return xyz;
  }

  function colorToInt(color) {
    let rgb;

    if (typeof color === 'number') {
      rgb = color;
    } else if (typeof color === 'string') {
      let c = color[0] === '#' ? color.substring(1) : color;

      if (c.length === 3) {
        c = c.split('').map(char => char + char).join('');
      }

      if (c.length !== 6) {
        consoleWarn(`'${color}' is not a valid rgb color`);
      }

      rgb = parseInt(c, 16);
    } else {
      throw new TypeError(`Colors can only be numbers or strings, recieved ${color == null ? color : color.constructor.name} instead`);
    }

    if (rgb < 0) {
      consoleWarn(`Colors cannot be negative: '${color}'`);
      rgb = 0;
    } else if (rgb > 0xffffff || isNaN(rgb)) {
      consoleWarn(`'${color}' is not a valid rgb color`);
      rgb = 0xffffff;
    }

    return rgb;
  }
  function intToHex(color) {
    let hexColor = color.toString(16);
    if (hexColor.length < 6) hexColor = '0'.repeat(6 - hexColor.length) + hexColor;
    return '#' + hexColor;
  }
  function colorToHex(color) {
    return intToHex(colorToInt(color));
  }

  // Types
  function VGrid(name) {
    /* @vue/component */
    return Vue.extend({
      name: `v-${name}`,
      functional: true,
      props: {
        id: String,
        tag: {
          type: String,
          default: 'div'
        }
      },

      render(h, {
        props,
        data,
        children
      }) {
        data.staticClass = `${name} ${data.staticClass || ''}`.trim();
        const {
          attrs
        } = data;

        if (attrs) {
          // reset attrs to extract utility clases like pa-3
          data.attrs = {};
          const classes = Object.keys(attrs).filter(key => {
            // TODO: Remove once resolved
            // https://github.com/vuejs/vue/issues/7841
            if (key === 'slot') return false;
            const value = attrs[key]; // add back data attributes like data-test="foo" but do not
            // add them as classes

            if (key.startsWith('data-')) {
              data.attrs[key] = value;
              return false;
            }

            return value || typeof value === 'string';
          });
          if (classes.length) data.staticClass += ` ${classes.join(' ')}`;
        }

        if (props.id) {
          data.domProps = data.domProps || {};
          data.domProps.id = props.id;
        }

        return h(props.tag, data, children);
      }

    });
  }

  /* @vue/component */

  var VContainer = VGrid('container').extend({
    name: 'v-container',
    functional: true,
    props: {
      id: String,
      tag: {
        type: String,
        default: 'div'
      },
      fluid: {
        type: Boolean,
        default: false
      }
    },

    render(h, {
      props,
      data,
      children
    }) {
      let classes;
      const {
        attrs
      } = data;

      if (attrs) {
        // reset attrs to extract utility clases like pa-3
        data.attrs = {};
        classes = Object.keys(attrs).filter(key => {
          // TODO: Remove once resolved
          // https://github.com/vuejs/vue/issues/7841
          if (key === 'slot') return false;
          const value = attrs[key]; // add back data attributes like data-test="foo" but do not
          // add them as classes

          if (key.startsWith('data-')) {
            data.attrs[key] = value;
            return false;
          }

          return value || typeof value === 'string';
        });
      }

      if (props.id) {
        data.domProps = data.domProps || {};
        data.domProps.id = props.id;
      }

      return h(props.tag, mergeData(data, {
        staticClass: 'container',
        class: Array({
          'container--fluid': props.fluid
        }).concat(classes || [])
      }), children);
    }

  });

  var VFlex = VGrid('flex');

  function install(Vue$1, args = {}) {
    if (install.installed) return;
    install.installed = true;

    if (Vue !== Vue$1) {
      consoleError('Multiple instances of Vue detected\nSee https://github.com/vuetifyjs/vuetify/issues/4068\n\nIf you\'re seeing "$attrs is readonly", it\'s caused by this');
    }

    const components = args.components || {};
    const directives = args.directives || {};

    for (const name in directives) {
      const directive = directives[name];
      Vue$1.directive(name, directive);
    }

    (function registerComponents(components) {
      if (components) {
        for (const key in components) {
          const component = components[key];

          if (component && !registerComponents(component.$_vuetify_subcomponents)) {
            Vue$1.component(key, component);
          }
        }

        return true;
      }

      return false;
    })(components); // Used to avoid multiple mixins being setup
    // when in dev mode and hot module reload
    // https://github.com/vuejs/vue/issues/5089#issuecomment-284260111


    if (Vue$1.$_vuetify_installed) return;
    Vue$1.$_vuetify_installed = true;
    Vue$1.mixin({
      beforeCreate() {
        const options = this.$options;

        if (options.vuetify) {
          options.vuetify.init(this, options.ssrContext);
          this.$vuetify = Vue$1.observable(options.vuetify.framework);
        } else {
          this.$vuetify = options.parent && options.parent.$vuetify || this;
        }
      }

    });
  }

  class Service {
    constructor() {
      this.framework = {};
    }

    init(root, ssrContext) {}

  }

  // Extensions
  class Application extends Service {
    constructor() {
      super(...arguments);
      this.bar = 0;
      this.top = 0;
      this.left = 0;
      this.insetFooter = 0;
      this.right = 0;
      this.bottom = 0;
      this.footer = 0;
      this.application = {
        bar: {},
        top: {},
        left: {},
        insetFooter: {},
        right: {},
        bottom: {},
        footer: {}
      };
    }

    register(uid, location, size) {
      this.application[location] = {
        [uid]: size
      };
      this.update(location);
    }

    unregister(uid, location) {
      if (this.application[location][uid] == null) return;
      delete this.application[location][uid];
      this.update(location);
    }

    update(location) {
      this[location] = Object.values(this.application[location]).reduce((acc, cur) => acc + cur, 0);
    }

  }
  Application.property = 'application';

  // Extensions
  class Breakpoint extends Service {
    constructor(preset) {
      super(); // Public

      this.xs = false;
      this.sm = false;
      this.md = false;
      this.lg = false;
      this.xl = false;
      this.xsOnly = false;
      this.smOnly = false;
      this.smAndDown = false;
      this.smAndUp = false;
      this.mdOnly = false;
      this.mdAndDown = false;
      this.mdAndUp = false;
      this.lgOnly = false;
      this.lgAndDown = false;
      this.lgAndUp = false;
      this.xlOnly = false;
      this.name = '';
      this.height = 0;
      this.width = 0;
      this.resizeTimeout = 0;
      const {
        scrollBarWidth,
        thresholds
      } = preset[Breakpoint.property];
      this.scrollBarWidth = scrollBarWidth;
      this.thresholds = thresholds;
      this.init();
    }

    init() {
      /* istanbul ignore if */
      if (typeof window === 'undefined') return;
      window.addEventListener('resize', this.onResize.bind(this), {
        passive: true
      });
      this.update();
    }

    onResize() {
      clearTimeout(this.resizeTimeout); // Added debounce to match what
      // v-resize used to do but was
      // removed due to a memory leak
      // https://github.com/vuetifyjs/vuetify/pull/2997

      this.resizeTimeout = window.setTimeout(this.update.bind(this), 200);
    }
    /* eslint-disable-next-line max-statements */


    update() {
      const height = this.getClientHeight();
      const width = this.getClientWidth();
      const xs = width < this.thresholds.xs;
      const sm = width < this.thresholds.sm && !xs;
      const md = width < this.thresholds.md - this.scrollBarWidth && !(sm || xs);
      const lg = width < this.thresholds.lg - this.scrollBarWidth && !(md || sm || xs);
      const xl = width >= this.thresholds.lg - this.scrollBarWidth;
      this.height = height;
      this.width = width;
      this.xs = xs;
      this.sm = sm;
      this.md = md;
      this.lg = lg;
      this.xl = xl;
      this.xsOnly = xs;
      this.smOnly = sm;
      this.smAndDown = (xs || sm) && !(md || lg || xl);
      this.smAndUp = !xs && (sm || md || lg || xl);
      this.mdOnly = md;
      this.mdAndDown = (xs || sm || md) && !(lg || xl);
      this.mdAndUp = !(xs || sm) && (md || lg || xl);
      this.lgOnly = lg;
      this.lgAndDown = (xs || sm || md || lg) && !xl;
      this.lgAndUp = !(xs || sm || md) && (lg || xl);
      this.xlOnly = xl;

      switch (true) {
        case xs:
          this.name = 'xs';
          break;

        case sm:
          this.name = 'sm';
          break;

        case md:
          this.name = 'md';
          break;

        case lg:
          this.name = 'lg';
          break;

        default:
          this.name = 'xl';
          break;
      }
    } // Cross-browser support as described in:
    // https://stackoverflow.com/questions/1248081


    getClientWidth() {
      /* istanbul ignore if */
      if (typeof document === 'undefined') return 0; // SSR

      return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }

    getClientHeight() {
      /* istanbul ignore if */
      if (typeof document === 'undefined') return 0; // SSR

      return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    }

  }
  Breakpoint.property = 'breakpoint';

  // linear
  const linear = t => t; // accelerating from zero velocity

  const easeInQuad = t => t ** 2; // decelerating to zero velocity

  const easeOutQuad = t => t * (2 - t); // acceleration until halfway, then deceleration

  const easeInOutQuad = t => t < 0.5 ? 2 * t ** 2 : -1 + (4 - 2 * t) * t; // accelerating from zero velocity

  const easeInCubic = t => t ** 3; // decelerating to zero velocity

  const easeOutCubic = t => --t ** 3 + 1; // acceleration until halfway, then deceleration

  const easeInOutCubic = t => t < 0.5 ? 4 * t ** 3 : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; // accelerating from zero velocity

  const easeInQuart = t => t ** 4; // decelerating to zero velocity

  const easeOutQuart = t => 1 - --t ** 4; // acceleration until halfway, then deceleration

  const easeInOutQuart = t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t; // accelerating from zero velocity

  const easeInQuint = t => t ** 5; // decelerating to zero velocity

  const easeOutQuint = t => 1 + --t ** 5; // acceleration until halfway, then deceleration

  const easeInOutQuint = t => t < 0.5 ? 16 * t ** 5 : 1 + 16 * --t ** 5;

  var easingPatterns = /*#__PURE__*/Object.freeze({
    __proto__: null,
    linear: linear,
    easeInQuad: easeInQuad,
    easeOutQuad: easeOutQuad,
    easeInOutQuad: easeInOutQuad,
    easeInCubic: easeInCubic,
    easeOutCubic: easeOutCubic,
    easeInOutCubic: easeInOutCubic,
    easeInQuart: easeInQuart,
    easeOutQuart: easeOutQuart,
    easeInOutQuart: easeInOutQuart,
    easeInQuint: easeInQuint,
    easeOutQuint: easeOutQuint,
    easeInOutQuint: easeInOutQuint
  });

  // Return target's cumulative offset from the top
  function getOffset(target) {
    if (typeof target === 'number') {
      return target;
    }

    let el = $(target);

    if (!el) {
      throw typeof target === 'string' ? new Error(`Target element "${target}" not found.`) : new TypeError(`Target must be a Number/Selector/HTMLElement/VueComponent, received ${type(target)} instead.`);
    }

    let totalOffset = 0;

    while (el) {
      totalOffset += el.offsetTop;
      el = el.offsetParent;
    }

    return totalOffset;
  }
  function getContainer(container) {
    const el = $(container);
    if (el) return el;
    throw typeof container === 'string' ? new Error(`Container element "${container}" not found.`) : new TypeError(`Container must be a Selector/HTMLElement/VueComponent, received ${type(container)} instead.`);
  }

  function type(el) {
    return el == null ? el : el.constructor.name;
  }

  function $(el) {
    if (typeof el === 'string') {
      return document.querySelector(el);
    } else if (el && el._isVue) {
      return el.$el;
    } else if (el instanceof HTMLElement) {
      return el;
    } else {
      return null;
    }
  }

  // Extensions
  function goTo(_target, _settings = {}) {
    const settings = {
      container: document.scrollingElement || document.body || document.documentElement,
      duration: 500,
      offset: 0,
      easing: 'easeInOutCubic',
      appOffset: true,
      ..._settings
    };
    const container = getContainer(settings.container);
    /* istanbul ignore else */

    if (settings.appOffset && goTo.framework.application) {
      const isDrawer = container.classList.contains('v-navigation-drawer');
      const isClipped = container.classList.contains('v-navigation-drawer--clipped');
      const {
        bar,
        top
      } = goTo.framework.application;
      settings.offset += bar;
      /* istanbul ignore else */

      if (!isDrawer || isClipped) settings.offset += top;
    }

    const startTime = performance.now();
    let targetLocation;

    if (typeof _target === 'number') {
      targetLocation = getOffset(_target) - settings.offset;
    } else {
      targetLocation = getOffset(_target) - getOffset(container) - settings.offset;
    }

    const startLocation = container.scrollTop;
    if (targetLocation === startLocation) return Promise.resolve(targetLocation);
    const ease = typeof settings.easing === 'function' ? settings.easing : easingPatterns[settings.easing];
    /* istanbul ignore else */

    if (!ease) throw new TypeError(`Easing function "${settings.easing}" not found.`); // Cannot be tested properly in jsdom
    // tslint:disable-next-line:promise-must-complete

    /* istanbul ignore next */

    return new Promise(resolve => requestAnimationFrame(function step(currentTime) {
      const timeElapsed = currentTime - startTime;
      const progress = Math.abs(settings.duration ? Math.min(timeElapsed / settings.duration, 1) : 1);
      container.scrollTop = Math.floor(startLocation + (targetLocation - startLocation) * ease(progress));
      const clientHeight = container === document.body ? document.documentElement.clientHeight : container.clientHeight;

      if (progress === 1 || clientHeight + container.scrollTop === container.scrollHeight) {
        return resolve(targetLocation);
      }

      requestAnimationFrame(step);
    }));
  }
  goTo.framework = {};

  goTo.init = () => {};

  class Goto extends Service {
    constructor() {
      super();
      return goTo;
    }

  }
  Goto.property = 'goTo';

  const icons = {
    complete: 'M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z',
    cancel: 'M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z',
    close: 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
    delete: 'M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z',
    clear: 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
    success: 'M12,2C17.52,2 22,6.48 22,12C22,17.52 17.52,22 12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z',
    info: 'M13,9H11V7H13M13,17H11V11H13M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2Z',
    warning: 'M11,4.5H13V15.5H11V4.5M13,17.5V19.5H11V17.5H13Z',
    error: 'M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z',
    prev: 'M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z',
    next: 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z',
    checkboxOn: 'M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8M19,3H5C3.89,3 3,3.89 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.89 20.1,3 19,3Z',
    checkboxOff: 'M19,3H5C3.89,3 3,3.89 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z',
    checkboxIndeterminate: 'M17,13H7V11H17M19,3H5C3.89,3 3,3.89 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.89 20.1,3 19,3Z',
    delimiter: 'M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2Z',
    sort: 'M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z',
    expand: 'M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z',
    menu: 'M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z',
    subgroup: 'M7,10L12,15L17,10H7Z',
    dropdown: 'M7,10L12,15L17,10H7Z',
    radioOn: 'M12,20C7.58,20 4,16.42 4,12C4,7.58 7.58,4 12,4C16.42,4 20,7.58 20,12C20,16.42 16.42,20 12,20M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,7C9.24,7 7,9.24 7,12C7,14.76 9.24,17 12,17C14.76,17 17,14.76 17,12C17,9.24 14.76,7 12,7Z',
    radioOff: 'M12,20C7.58,20 4,16.42 4,12C4,7.58 7.58,4 12,4C16.42,4 20,7.58 20,12C20,16.42 16.42,20 12,20M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2Z',
    edit: 'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z',
    ratingEmpty: 'M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z',
    ratingFull: 'M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z',
    ratingHalf: 'M12,15.4V6.1L13.71,10.13L18.09,10.5L14.77,13.39L15.76,17.67M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z',
    loading: 'M19,8L15,12H18C18,15.31 15.31,18 12,18C11,18 10.03,17.75 9.2,17.3L7.74,18.76C8.97,19.54 10.43,20 12,20C16.42,20 20,16.42 20,12H23M6,12C6,8.69 8.69,6 12,6C13,6 13.97,6.25 14.8,6.7L16.26,5.24C15.03,4.46 13.57,4 12,4C7.58,4 4,7.58 4,12H1L5,16L9,12',
    first: 'M18.41,16.59L13.82,12L18.41,7.41L17,6L11,12L17,18L18.41,16.59M6,6H8V18H6V6Z',
    last: 'M5.59,7.41L10.18,12L5.59,16.59L7,18L13,12L7,6L5.59,7.41M16,6H18V18H16V6Z',
    unfold: 'M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z',
    file: 'M16.5,6V17.5C16.5,19.71 14.71,21.5 12.5,21.5C10.29,21.5 8.5,19.71 8.5,17.5V5C8.5,3.62 9.62,2.5 11,2.5C12.38,2.5 13.5,3.62 13.5,5V15.5C13.5,16.05 13.05,16.5 12.5,16.5C11.95,16.5 11.5,16.05 11.5,15.5V6H10V15.5C10,16.88 11.12,18 12.5,18C13.88,18 15,16.88 15,15.5V5C15,2.79 13.21,1 11,1C8.79,1 7,2.79 7,5V17.5C7,20.54 9.46,23 12.5,23C15.54,23 18,20.54 18,17.5V6H16.5Z',
    plus: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z',
    minus: 'M19,13H5V11H19V13Z'
  };

  const icons$1 = {
    complete: 'check',
    cancel: 'cancel',
    close: 'close',
    delete: 'cancel',
    clear: 'clear',
    success: 'check_circle',
    info: 'info',
    warning: 'priority_high',
    error: 'warning',
    prev: 'chevron_left',
    next: 'chevron_right',
    checkboxOn: 'check_box',
    checkboxOff: 'check_box_outline_blank',
    checkboxIndeterminate: 'indeterminate_check_box',
    delimiter: 'fiber_manual_record',
    sort: 'arrow_upward',
    expand: 'keyboard_arrow_down',
    menu: 'menu',
    subgroup: 'arrow_drop_down',
    dropdown: 'arrow_drop_down',
    radioOn: 'radio_button_checked',
    radioOff: 'radio_button_unchecked',
    edit: 'edit',
    ratingEmpty: 'star_border',
    ratingFull: 'star',
    ratingHalf: 'star_half',
    loading: 'cached',
    first: 'first_page',
    last: 'last_page',
    unfold: 'unfold_more',
    file: 'attach_file',
    plus: 'add',
    minus: 'remove'
  };

  const icons$2 = {
    complete: 'mdi-check',
    cancel: 'mdi-close-circle',
    close: 'mdi-close',
    delete: 'mdi-close-circle',
    clear: 'mdi-close',
    success: 'mdi-check-circle',
    info: 'mdi-information',
    warning: 'mdi-exclamation',
    error: 'mdi-alert',
    prev: 'mdi-chevron-left',
    next: 'mdi-chevron-right',
    checkboxOn: 'mdi-checkbox-marked',
    checkboxOff: 'mdi-checkbox-blank-outline',
    checkboxIndeterminate: 'mdi-minus-box',
    delimiter: 'mdi-circle',
    sort: 'mdi-arrow-up',
    expand: 'mdi-chevron-down',
    menu: 'mdi-menu',
    subgroup: 'mdi-menu-down',
    dropdown: 'mdi-menu-down',
    radioOn: 'mdi-radiobox-marked',
    radioOff: 'mdi-radiobox-blank',
    edit: 'mdi-pencil',
    ratingEmpty: 'mdi-star-outline',
    ratingFull: 'mdi-star',
    ratingHalf: 'mdi-star-half',
    loading: 'mdi-cached',
    first: 'mdi-page-first',
    last: 'mdi-page-last',
    unfold: 'mdi-unfold-more-horizontal',
    file: 'mdi-paperclip',
    plus: 'mdi-plus',
    minus: 'mdi-minus'
  };

  const icons$3 = {
    complete: 'fas fa-check',
    cancel: 'fas fa-times-circle',
    close: 'fas fa-times',
    delete: 'fas fa-times-circle',
    clear: 'fas fa-times-circle',
    success: 'fas fa-check-circle',
    info: 'fas fa-info-circle',
    warning: 'fas fa-exclamation',
    error: 'fas fa-exclamation-triangle',
    prev: 'fas fa-chevron-left',
    next: 'fas fa-chevron-right',
    checkboxOn: 'fas fa-check-square',
    checkboxOff: 'far fa-square',
    checkboxIndeterminate: 'fas fa-minus-square',
    delimiter: 'fas fa-circle',
    sort: 'fas fa-sort-up',
    expand: 'fas fa-chevron-down',
    menu: 'fas fa-bars',
    subgroup: 'fas fa-caret-down',
    dropdown: 'fas fa-caret-down',
    radioOn: 'far fa-dot-circle',
    radioOff: 'far fa-circle',
    edit: 'fas fa-edit',
    ratingEmpty: 'far fa-star',
    ratingFull: 'fas fa-star',
    ratingHalf: 'fas fa-star-half',
    loading: 'fas fa-sync',
    first: 'fas fa-step-backward',
    last: 'fas fa-step-forward',
    unfold: 'fas fa-arrows-alt-v',
    file: 'fas fa-paperclip',
    plus: 'fas fa-plus',
    minus: 'fas fa-minus'
  };

  const icons$4 = {
    complete: 'fa fa-check',
    cancel: 'fa fa-times-circle',
    close: 'fa fa-times',
    delete: 'fa fa-times-circle',
    clear: 'fa fa-times-circle',
    success: 'fa fa-check-circle',
    info: 'fa fa-info-circle',
    warning: 'fa fa-exclamation',
    error: 'fa fa-exclamation-triangle',
    prev: 'fa fa-chevron-left',
    next: 'fa fa-chevron-right',
    checkboxOn: 'fa fa-check-square',
    checkboxOff: 'fa fa-square-o',
    checkboxIndeterminate: 'fa fa-minus-square',
    delimiter: 'fa fa-circle',
    sort: 'fa fa-sort-up',
    expand: 'fa fa-chevron-down',
    menu: 'fa fa-bars',
    subgroup: 'fa fa-caret-down',
    dropdown: 'fa fa-caret-down',
    radioOn: 'fa fa-dot-circle-o',
    radioOff: 'fa fa-circle-o',
    edit: 'fa fa-pencil',
    ratingEmpty: 'fa fa-star-o',
    ratingFull: 'fa fa-star',
    ratingHalf: 'fa fa-star-half-o',
    loading: 'fa fa-refresh',
    first: 'fa fa-step-backward',
    last: 'fa fa-step-forward',
    unfold: 'fa fa-angle-double-down',
    file: 'fa fa-paperclip',
    plus: 'fa fa-plus',
    minus: 'fa fa-minus'
  };

  function convertToComponentDeclarations(component, iconSet) {
    const result = {};

    for (const key in iconSet) {
      result[key] = {
        component,
        props: {
          icon: iconSet[key].split(' fa-')
        }
      };
    }

    return result;
  }
  var faSvg = convertToComponentDeclarations('font-awesome-icon', icons$3);

  var presets = Object.freeze({
    mdiSvg: icons,
    md: icons$1,
    mdi: icons$2,
    fa: icons$3,
    fa4: icons$4,
    faSvg
  });

  // Extensions
  class Icons extends Service {
    constructor(preset) {
      super();
      const {
        iconfont,
        values
      } = preset[Icons.property];
      this.iconfont = iconfont;
      this.values = mergeDeep(presets[iconfont], values);
    }

  }
  Icons.property = 'icons';

  // Extensions
  const LANG_PREFIX = '$vuetify.';
  const fallback = Symbol('Lang fallback');

  function getTranslation(locale, key, usingDefault = false, defaultLocale) {
    const shortKey = key.replace(LANG_PREFIX, '');
    let translation = getObjectValueByPath(locale, shortKey, fallback);

    if (translation === fallback) {
      if (usingDefault) {
        consoleError(`Translation key "${shortKey}" not found in fallback`);
        translation = key;
      } else {
        consoleWarn(`Translation key "${shortKey}" not found, falling back to default`);
        translation = getTranslation(defaultLocale, key, true, defaultLocale);
      }
    }

    return translation;
  }

  class Lang extends Service {
    constructor(preset) {
      super();
      this.defaultLocale = 'en';
      const {
        current,
        locales,
        t
      } = preset[Lang.property];
      this.current = current;
      this.locales = locales;
      this.translator = t || this.defaultTranslator;
    }

    currentLocale(key) {
      const translation = this.locales[this.current];
      const defaultLocale = this.locales[this.defaultLocale];
      return getTranslation(translation, key, false, defaultLocale);
    }

    t(key, ...params) {
      if (!key.startsWith(LANG_PREFIX)) return this.replace(key, params);
      return this.translator(key, ...params);
    }

    defaultTranslator(key, ...params) {
      return this.replace(this.currentLocale(key), params);
    }

    replace(str, params) {
      return str.replace(/\{(\d+)\}/g, (match, index) => {
        /* istanbul ignore next */
        return String(params[+index]);
      });
    }

  }
  Lang.property = 'lang';

  var en = {
    badge: 'Badge',
    close: 'Close',
    dataIterator: {
      noResultsText: 'No matching records found',
      loadingText: 'Loading items...'
    },
    dataTable: {
      itemsPerPageText: 'Rows per page:',
      ariaLabel: {
        sortDescending: 'Sorted descending.',
        sortAscending: 'Sorted ascending.',
        sortNone: 'Not sorted.',
        activateNone: 'Activate to remove sorting.',
        activateDescending: 'Activate to sort descending.',
        activateAscending: 'Activate to sort ascending.'
      },
      sortBy: 'Sort by'
    },
    dataFooter: {
      itemsPerPageText: 'Items per page:',
      itemsPerPageAll: 'All',
      nextPage: 'Next page',
      prevPage: 'Previous page',
      firstPage: 'First page',
      lastPage: 'Last page',
      pageText: '{0}-{1} of {2}'
    },
    datePicker: {
      itemsSelected: '{0} selected'
    },
    noDataText: 'No data available',
    carousel: {
      prev: 'Previous visual',
      next: 'Next visual',
      ariaLabel: {
        delimiter: 'Carousel slide {0} of {1}'
      }
    },
    calendar: {
      moreEvents: '{0} more'
    },
    fileInput: {
      counter: '{0} files',
      counterSize: '{0} files ({1} in total)'
    },
    timePicker: {
      am: 'AM',
      pm: 'PM'
    }
  };

  // Styles
  const preset = {
    breakpoint: {
      scrollBarWidth: 16,
      thresholds: {
        xs: 600,
        sm: 960,
        md: 1280,
        lg: 1920
      }
    },
    icons: {
      // TODO: remove v3
      iconfont: 'mdi',
      values: {}
    },
    lang: {
      current: 'en',
      locales: {
        en
      },
      // Default translator exists in lang service
      t: undefined
    },
    rtl: false,
    theme: {
      dark: false,
      default: 'light',
      disable: false,
      options: {
        cspNonce: undefined,
        customProperties: undefined,
        minifyTheme: undefined,
        themeCache: undefined
      },
      themes: {
        light: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00'
        },
        dark: {
          primary: '#2196F3',
          secondary: '#424242',
          accent: '#FF4081',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00'
        }
      }
    }
  };

  // Preset
  class Presets extends Service {
    constructor(parentPreset, parent) {
      super(); // The default preset

      const defaultPreset = mergeDeep({}, preset); // The user provided preset

      const {
        userPreset
      } = parent; // The user provided global preset

      const {
        preset: globalPreset = {},
        ...preset$1
      } = userPreset;

      if (globalPreset.preset != null) {
        consoleWarn('Global presets do not support the **preset** option, it can be safely omitted');
      }

      parent.preset = mergeDeep(mergeDeep(defaultPreset, globalPreset), preset$1);
    }

  }
  Presets.property = 'presets';

  const delta = 0.20689655172413793; // 6÷29

  const cielabForwardTransform = t => t > delta ** 3 ? Math.cbrt(t) : t / (3 * delta ** 2) + 4 / 29;

  const cielabReverseTransform = t => t > delta ? t ** 3 : 3 * delta ** 2 * (t - 4 / 29);

  function fromXYZ$1(xyz) {
    const transform = cielabForwardTransform;
    const transformedY = transform(xyz[1]);
    return [116 * transformedY - 16, 500 * (transform(xyz[0] / 0.95047) - transformedY), 200 * (transformedY - transform(xyz[2] / 1.08883))];
  }
  function toXYZ$1(lab) {
    const transform = cielabReverseTransform;
    const Ln = (lab[0] + 16) / 116;
    return [transform(Ln + lab[1] / 500) * 0.95047, transform(Ln), transform(Ln - lab[2] / 200) * 1.08883];
  }

  function parse(theme, isItem = false) {
    const {
      anchor,
      ...variant
    } = theme;
    const colors = Object.keys(variant);
    const parsedTheme = {};

    for (let i = 0; i < colors.length; ++i) {
      const name = colors[i];
      const value = theme[name];
      if (value == null) continue;

      if (isItem) {
        /* istanbul ignore else */
        if (name === 'base' || name.startsWith('lighten') || name.startsWith('darken')) {
          parsedTheme[name] = colorToHex(value);
        }
      } else if (typeof value === 'object') {
        parsedTheme[name] = parse(value, true);
      } else {
        parsedTheme[name] = genVariations(name, colorToInt(value));
      }
    }

    if (!isItem) {
      parsedTheme.anchor = anchor || parsedTheme.base || parsedTheme.primary.base;
    }

    return parsedTheme;
  }
  /**
   * Generate the CSS for a base color (.primary)
   */

  const genBaseColor = (name, value) => {
    return `
.v-application .${name} {
  background-color: ${value} !important;
  border-color: ${value} !important;
}
.v-application .${name}--text {
  color: ${value} !important;
  caret-color: ${value} !important;
}`;
  };
  /**
   * Generate the CSS for a variant color (.primary.darken-2)
   */


  const genVariantColor = (name, variant, value) => {
    const [type, n] = variant.split(/(\d)/, 2);
    return `
.v-application .${name}.${type}-${n} {
  background-color: ${value} !important;
  border-color: ${value} !important;
}
.v-application .${name}--text.text--${type}-${n} {
  color: ${value} !important;
  caret-color: ${value} !important;
}`;
  };

  const genColorVariableName = (name, variant = 'base') => `--v-${name}-${variant}`;

  const genColorVariable = (name, variant = 'base') => `var(${genColorVariableName(name, variant)})`;

  function genStyles(theme, cssVar = false) {
    const {
      anchor,
      ...variant
    } = theme;
    const colors = Object.keys(variant);
    if (!colors.length) return '';
    let variablesCss = '';
    let css = '';
    const aColor = cssVar ? genColorVariable('anchor') : anchor;
    css += `.v-application a { color: ${aColor}; }`;
    cssVar && (variablesCss += `  ${genColorVariableName('anchor')}: ${anchor};\n`);

    for (let i = 0; i < colors.length; ++i) {
      const name = colors[i];
      const value = theme[name];
      css += genBaseColor(name, cssVar ? genColorVariable(name) : value.base);
      cssVar && (variablesCss += `  ${genColorVariableName(name)}: ${value.base};\n`);
      const variants = Object.keys(value);

      for (let i = 0; i < variants.length; ++i) {
        const variant = variants[i];
        const variantValue = value[variant];
        if (variant === 'base') continue;
        css += genVariantColor(name, variant, cssVar ? genColorVariable(name, variant) : variantValue);
        cssVar && (variablesCss += `  ${genColorVariableName(name, variant)}: ${variantValue};\n`);
      }
    }

    if (cssVar) {
      variablesCss = `:root {\n${variablesCss}}\n\n`;
    }

    return variablesCss + css;
  }
  function genVariations(name, value) {
    const values = {
      base: intToHex(value)
    };

    for (let i = 5; i > 0; --i) {
      values[`lighten${i}`] = intToHex(lighten(value, i));
    }

    for (let i = 1; i <= 4; ++i) {
      values[`darken${i}`] = intToHex(darken(value, i));
    }

    return values;
  }
  function lighten(value, amount) {
    const lab = fromXYZ$1(toXYZ(value));
    lab[0] = lab[0] + amount * 10;
    return fromXYZ(toXYZ$1(lab));
  }
  function darken(value, amount) {
    const lab = fromXYZ$1(toXYZ(value));
    lab[0] = lab[0] - amount * 10;
    return fromXYZ(toXYZ$1(lab));
  }

  /* eslint-disable no-multi-spaces */
  class Theme extends Service {
    constructor(preset) {
      super();
      this.disabled = false;
      this.isDark = null;
      this.vueInstance = null;
      this.vueMeta = null;
      const {
        dark,
        disable,
        options,
        themes
      } = preset[Theme.property];
      this.dark = Boolean(dark);
      this.defaults = this.themes = themes;
      this.options = options;

      if (disable) {
        this.disabled = true;
        return;
      }

      this.themes = {
        dark: this.fillVariant(themes.dark, true),
        light: this.fillVariant(themes.light, false)
      };
    } // When setting css, check for element
    // and apply new values


    set css(val) {
      if (this.vueMeta) {
        if (this.isVueMeta23) {
          this.applyVueMeta23();
        }

        return;
      }

      this.checkOrCreateStyleElement() && (this.styleEl.innerHTML = val);
    }

    set dark(val) {
      const oldDark = this.isDark;
      this.isDark = val; // Only apply theme after dark
      // has already been set before

      oldDark != null && this.applyTheme();
    }

    get dark() {
      return Boolean(this.isDark);
    } // Apply current theme default
    // only called on client side


    applyTheme() {
      if (this.disabled) return this.clearCss();
      this.css = this.generatedStyles;
    }

    clearCss() {
      this.css = '';
    } // Initialize theme for SSR and SPA
    // Attach to ssrContext head or
    // apply new theme to document


    init(root, ssrContext) {
      if (this.disabled) return;
      /* istanbul ignore else */

      if (root.$meta) {
        this.initVueMeta(root);
      } else if (ssrContext) {
        this.initSSR(ssrContext);
      }

      this.initTheme();
    } // Allows for you to set target theme


    setTheme(theme, value) {
      this.themes[theme] = Object.assign(this.themes[theme], value);
      this.applyTheme();
    } // Reset theme defaults


    resetThemes() {
      this.themes.light = Object.assign({}, this.defaults.light);
      this.themes.dark = Object.assign({}, this.defaults.dark);
      this.applyTheme();
    } // Check for existence of style element


    checkOrCreateStyleElement() {
      this.styleEl = document.getElementById('vuetify-theme-stylesheet');
      /* istanbul ignore next */

      if (this.styleEl) return true;
      this.genStyleElement(); // If doesn't have it, create it

      return Boolean(this.styleEl);
    }

    fillVariant(theme = {}, dark) {
      const defaultTheme = this.themes[dark ? 'dark' : 'light'];
      return Object.assign({}, defaultTheme, theme);
    } // Generate the style element
    // if applicable


    genStyleElement() {
      /* istanbul ignore if */
      if (typeof document === 'undefined') return;
      /* istanbul ignore next */

      const options = this.options || {};
      this.styleEl = document.createElement('style');
      this.styleEl.type = 'text/css';
      this.styleEl.id = 'vuetify-theme-stylesheet';

      if (options.cspNonce) {
        this.styleEl.setAttribute('nonce', options.cspNonce);
      }

      document.head.appendChild(this.styleEl);
    }

    initVueMeta(root) {
      this.vueMeta = root.$meta();

      if (this.isVueMeta23) {
        // vue-meta needs to apply after mounted()
        root.$nextTick(() => {
          this.applyVueMeta23();
        });
        return;
      }

      const metaKeyName = typeof this.vueMeta.getOptions === 'function' ? this.vueMeta.getOptions().keyName : 'metaInfo';
      const metaInfo = root.$options[metaKeyName] || {};

      root.$options[metaKeyName] = () => {
        metaInfo.style = metaInfo.style || [];
        const vuetifyStylesheet = metaInfo.style.find(s => s.id === 'vuetify-theme-stylesheet');

        if (!vuetifyStylesheet) {
          metaInfo.style.push({
            cssText: this.generatedStyles,
            type: 'text/css',
            id: 'vuetify-theme-stylesheet',
            nonce: (this.options || {}).cspNonce
          });
        } else {
          vuetifyStylesheet.cssText = this.generatedStyles;
        }

        return metaInfo;
      };
    }

    applyVueMeta23() {
      const {
        set
      } = this.vueMeta.addApp('vuetify');
      set({
        style: [{
          cssText: this.generatedStyles,
          type: 'text/css',
          id: 'vuetify-theme-stylesheet',
          nonce: (this.options || {}).cspNonce
        }]
      });
    }

    initSSR(ssrContext) {
      const options = this.options || {}; // SSR

      const nonce = options.cspNonce ? ` nonce="${options.cspNonce}"` : '';
      ssrContext.head = ssrContext.head || '';
      ssrContext.head += `<style type="text/css" id="vuetify-theme-stylesheet"${nonce}>${this.generatedStyles}</style>`;
    }

    initTheme() {
      // Only watch for reactivity on client side
      if (typeof document === 'undefined') return; // If we get here somehow, ensure
      // existing instance is removed

      if (this.vueInstance) this.vueInstance.$destroy(); // Use Vue instance to track reactivity
      // TODO: Update to use RFC if merged
      // https://github.com/vuejs/rfcs/blob/advanced-reactivity-api/active-rfcs/0000-advanced-reactivity-api.md

      this.vueInstance = new Vue({
        data: {
          themes: this.themes
        },
        watch: {
          themes: {
            immediate: true,
            deep: true,
            handler: () => this.applyTheme()
          }
        }
      });
    }

    get currentTheme() {
      const target = this.dark ? 'dark' : 'light';
      return this.themes[target];
    }

    get generatedStyles() {
      const theme = this.parsedTheme;
      /* istanbul ignore next */

      const options = this.options || {};
      let css;

      if (options.themeCache != null) {
        css = options.themeCache.get(theme);
        /* istanbul ignore if */

        if (css != null) return css;
      }

      css = genStyles(theme, options.customProperties);

      if (options.minifyTheme != null) {
        css = options.minifyTheme(css);
      }

      if (options.themeCache != null) {
        options.themeCache.set(theme, css);
      }

      return css;
    }

    get parsedTheme() {
      /* istanbul ignore next */
      const theme = this.currentTheme || {};
      return parse(theme);
    } // Is using v2.3 of vue-meta
    // https://github.com/nuxt/vue-meta/releases/tag/v2.3.0


    get isVueMeta23() {
      return typeof this.vueMeta.addApp === 'function';
    }

  }
  Theme.property = 'theme';

  class Vuetify {
    constructor(userPreset = {}) {
      this.framework = {};
      this.installed = [];
      this.preset = {};
      this.userPreset = {};
      this.userPreset = userPreset;
      this.use(Presets);
      this.use(Application);
      this.use(Breakpoint);
      this.use(Goto);
      this.use(Icons);
      this.use(Lang);
      this.use(Theme);
    } // Called on the new vuetify instance
    // bootstrap in install beforeCreate
    // Exposes ssrContext if available


    init(root, ssrContext) {
      this.installed.forEach(property => {
        const service = this.framework[property];
        service.framework = this.framework;
        service.init(root, ssrContext);
      }); // rtl is not installed and
      // will never be called by
      // the init process

      this.framework.rtl = Boolean(this.preset.rtl);
    } // Instantiate a VuetifyService


    use(Service) {
      const property = Service.property;
      if (this.installed.includes(property)) return; // TODO maybe a specific type for arg 2?

      this.framework[property] = new Service(this.preset, this);
      this.installed.push(property);
    }

  }
  Vuetify.install = install;
  Vuetify.installed = false;
  Vuetify.version = "2.2.34";

  //

  var script = {
    directives: {
      Scroll: Scroll
    },

    name: 'SimpleComponent',

    components: {
      Alert: VAlert,
      VAlert: VAlert,
      VFlex: VFlex
    },

    props: {
      icon: { type: String, default: 'close' },
    }
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
          createInjectorSSR = createInjector;
          createInjector = shadowMode;
          shadowMode = false;
      }
      // Vue.extend constructor export interop.
      const options = typeof script === 'function' ? script.options : script;
      // render functions
      if (template && template.render) {
          options.render = template.render;
          options.staticRenderFns = template.staticRenderFns;
          options._compiled = true;
          // functional template
          if (isFunctionalTemplate) {
              options.functional = true;
          }
      }
      // scopedId
      if (scopeId) {
          options._scopeId = scopeId;
      }
      let hook;
      if (moduleIdentifier) {
          // server build
          hook = function (context) {
              // 2.3 injection
              context =
                  context || // cached call
                      (this.$vnode && this.$vnode.ssrContext) || // stateful
                      (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
              // 2.2 with runInNewContext: true
              if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                  context = __VUE_SSR_CONTEXT__;
              }
              // inject component styles
              if (style) {
                  style.call(this, createInjectorSSR(context));
              }
              // register component module identifier for async chunk inference
              if (context && context._registeredComponents) {
                  context._registeredComponents.add(moduleIdentifier);
              }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
      }
      else if (style) {
          hook = shadowMode
              ? function (context) {
                  style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
              }
              : function (context) {
                  style.call(this, createInjector(context));
              };
      }
      if (hook) {
          if (options.functional) {
              // register for functional component in vue file
              const originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              const existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }

  /* script */
  const __vue_script__ = script;

  /* template */
  var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "v-flex",
      {
        directives: [{ name: "scroll", rawName: "v-scroll" }],
        attrs: { xs12: "" }
      },
      [
        _c("v-alert", { attrs: { value: true, type: "success" } }, [
          _vm._v("\n    Autoloaded component\n  ")
        ]),
        _vm._v(" "),
        _c("alert", { attrs: { value: true, type: "error" } }, [
          _vm._v("\n    Local aliased component\n  ")
        ])
      ],
      1
    )
  };
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

    /* style */
    const __vue_inject_styles__ = undefined;
    /* scoped */
    const __vue_scope_id__ = undefined;
    /* module identifier */
    const __vue_module_identifier__ = undefined;
    /* functional template */
    const __vue_is_functional_template__ = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__ = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      false,
      undefined,
      undefined,
      undefined
    );

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */
  /* global Reflect, Promise */

  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };

  function __extends(d, b) {
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }

  function __decorate(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  }

  /**
    * vue-class-component v7.2.3
    * (c) 2015-present Evan You
    * @license MIT
    */

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  // The rational behind the verbose Reflect-feature check below is the fact that there are polyfills
  // which add an implementation for Reflect.defineMetadata but not for Reflect.getOwnMetadataKeys.
  // Without this check consumers will encounter hard to track down runtime errors.
  function reflectionIsSupported() {
    return typeof Reflect !== 'undefined' && Reflect.defineMetadata && Reflect.getOwnMetadataKeys;
  }
  function copyReflectionMetadata(to, from) {
    forwardMetadata(to, from);
    Object.getOwnPropertyNames(from.prototype).forEach(function (key) {
      forwardMetadata(to.prototype, from.prototype, key);
    });
    Object.getOwnPropertyNames(from).forEach(function (key) {
      forwardMetadata(to, from, key);
    });
  }

  function forwardMetadata(to, from, propertyKey) {
    var metaKeys = propertyKey ? Reflect.getOwnMetadataKeys(from, propertyKey) : Reflect.getOwnMetadataKeys(from);
    metaKeys.forEach(function (metaKey) {
      var metadata = propertyKey ? Reflect.getOwnMetadata(metaKey, from, propertyKey) : Reflect.getOwnMetadata(metaKey, from);

      if (propertyKey) {
        Reflect.defineMetadata(metaKey, metadata, to, propertyKey);
      } else {
        Reflect.defineMetadata(metaKey, metadata, to);
      }
    });
  }

  var fakeArray = {
    __proto__: []
  };
  var hasProto = fakeArray instanceof Array;
  function createDecorator(factory) {
    return function (target, key, index) {
      var Ctor = typeof target === 'function' ? target : target.constructor;

      if (!Ctor.__decorators__) {
        Ctor.__decorators__ = [];
      }

      if (typeof index !== 'number') {
        index = undefined;
      }

      Ctor.__decorators__.push(function (options) {
        return factory(options, key, index);
      });
    };
  }
  function isPrimitive(value) {
    var type = _typeof(value);

    return value == null || type !== 'object' && type !== 'function';
  }

  function collectDataFromConstructor(vm, Component) {
    // override _init to prevent to init as Vue instance
    var originalInit = Component.prototype._init;

    Component.prototype._init = function () {
      var _this = this;

      // proxy to actual vm
      var keys = Object.getOwnPropertyNames(vm); // 2.2.0 compat (props are no longer exposed as self properties)

      if (vm.$options.props) {
        for (var key in vm.$options.props) {
          if (!vm.hasOwnProperty(key)) {
            keys.push(key);
          }
        }
      }

      keys.forEach(function (key) {
        if (key.charAt(0) !== '_') {
          Object.defineProperty(_this, key, {
            get: function get() {
              return vm[key];
            },
            set: function set(value) {
              vm[key] = value;
            },
            configurable: true
          });
        }
      });
    }; // should be acquired class property values


    var data = new Component(); // restore original _init to avoid memory leak (#209)

    Component.prototype._init = originalInit; // create plain data object

    var plainData = {};
    Object.keys(data).forEach(function (key) {
      if (data[key] !== undefined) {
        plainData[key] = data[key];
      }
    });

    return plainData;
  }

  var $internalHooks = ['data', 'beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeDestroy', 'destroyed', 'beforeUpdate', 'updated', 'activated', 'deactivated', 'render', 'errorCaptured', 'serverPrefetch' // 2.6
  ];
  function componentFactory(Component) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    options.name = options.name || Component._componentTag || Component.name; // prototype props.

    var proto = Component.prototype;
    Object.getOwnPropertyNames(proto).forEach(function (key) {
      if (key === 'constructor') {
        return;
      } // hooks


      if ($internalHooks.indexOf(key) > -1) {
        options[key] = proto[key];
        return;
      }

      var descriptor = Object.getOwnPropertyDescriptor(proto, key);

      if (descriptor.value !== void 0) {
        // methods
        if (typeof descriptor.value === 'function') {
          (options.methods || (options.methods = {}))[key] = descriptor.value;
        } else {
          // typescript decorated data
          (options.mixins || (options.mixins = [])).push({
            data: function data() {
              return _defineProperty({}, key, descriptor.value);
            }
          });
        }
      } else if (descriptor.get || descriptor.set) {
        // computed properties
        (options.computed || (options.computed = {}))[key] = {
          get: descriptor.get,
          set: descriptor.set
        };
      }
    });
    (options.mixins || (options.mixins = [])).push({
      data: function data() {
        return collectDataFromConstructor(this, Component);
      }
    }); // decorate options

    var decorators = Component.__decorators__;

    if (decorators) {
      decorators.forEach(function (fn) {
        return fn(options);
      });
      delete Component.__decorators__;
    } // find super


    var superProto = Object.getPrototypeOf(Component.prototype);
    var Super = superProto instanceof Vue ? superProto.constructor : Vue;
    var Extended = Super.extend(options);
    forwardStaticMembers(Extended, Component, Super);

    if (reflectionIsSupported()) {
      copyReflectionMetadata(Extended, Component);
    }

    return Extended;
  }
  var shouldIgnore = {
    prototype: true,
    arguments: true,
    callee: true,
    caller: true
  };

  function forwardStaticMembers(Extended, Original, Super) {
    // We have to use getOwnPropertyNames since Babel registers methods as non-enumerable
    Object.getOwnPropertyNames(Original).forEach(function (key) {
      // Skip the properties that should not be overwritten
      if (shouldIgnore[key]) {
        return;
      } // Some browsers does not allow reconfigure built-in properties


      var extendedDescriptor = Object.getOwnPropertyDescriptor(Extended, key);

      if (extendedDescriptor && !extendedDescriptor.configurable) {
        return;
      }

      var descriptor = Object.getOwnPropertyDescriptor(Original, key); // If the user agent does not support `__proto__` or its family (IE <= 10),
      // the sub class properties may be inherited properties from the super class in TypeScript.
      // We need to exclude such properties to prevent to overwrite
      // the component options object which stored on the extended constructor (See #192).
      // If the value is a referenced value (object or function),
      // we can check equality of them and exclude it if they have the same reference.
      // If it is a primitive value, it will be forwarded for safety.

      if (!hasProto) {
        // Only `cid` is explicitly exluded from property forwarding
        // because we cannot detect whether it is a inherited property or not
        // on the no `__proto__` environment even though the property is reserved.
        if (key === 'cid') {
          return;
        }

        var superDescriptor = Object.getOwnPropertyDescriptor(Super, key);

        if (!isPrimitive(descriptor.value) && superDescriptor && superDescriptor.value === descriptor.value) {
          return;
        }
      } // Warn if the users manually declare reserved properties

      Object.defineProperty(Extended, key, descriptor);
    });
  }

  function Component(options) {
    if (typeof options === 'function') {
      return componentFactory(options);
    }

    return function (Component) {
      return componentFactory(Component, options);
    };
  }

  Component.registerHooks = function registerHooks(keys) {
    $internalHooks.push.apply($internalHooks, _toConsumableArray(keys));
  };

  /** vue-property-decorator verson 8.4.2 MIT LICENSE copyright 2019 kaorun343 */
  /** @see {@link https://github.com/vuejs/vue-class-component/blob/master/src/reflect.ts} */
  var reflectMetadataIsSupported = typeof Reflect !== 'undefined' && typeof Reflect.getMetadata !== 'undefined';
  function applyMetadata(options, target, key) {
      if (reflectMetadataIsSupported) {
          if (!Array.isArray(options) &&
              typeof options !== 'function' &&
              typeof options.type === 'undefined') {
              var type = Reflect.getMetadata('design:type', target, key);
              if (type !== Object) {
                  options.type = type;
              }
          }
      }
  }
  /**
   * decorator of a prop
   * @param  options the options for the prop
   * @return PropertyDecorator | void
   */
  function Prop(options) {
      if (options === void 0) { options = {}; }
      return function (target, key) {
          applyMetadata(options, target, key);
          createDecorator(function (componentOptions, k) {
              (componentOptions.props || (componentOptions.props = {}))[k] = options;
          })(target, key);
      };
  }

  var default_1 = /** @class */ (function (_super) {
      __extends(default_1, _super);
      function default_1() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      __decorate([
          Prop({ type: Boolean, default: false })
      ], default_1.prototype, "tile", void 0);
      default_1 = __decorate([
          Component({
              components: {
                  VBtn: VBtn,
                  VAvatar: VAvatar,
                  VFlex: VFlex
              },
              directives: {
                  MyCustomDirective: function () { },
                  Ripple: Ripple
              },
          })
      ], default_1);
      return default_1;
  }(Vue));

  /* script */
  const __vue_script__$1 = default_1;

  /* template */
  var __vue_render__$1 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "div",
      [
        _c(
          "v-flex",
          {
            directives: [
              { name: "ripple", rawName: "v-ripple" },
              { name: "my-custom-directive", rawName: "v-my-custom-directive" }
            ]
          },
          [
            _c(
              "v-avatar",
              { attrs: { tile: _vm.tile, color: "grey lighten-4" } },
              [
                _c("img", {
                  attrs: {
                    src: "https://vuetifyjs.com/apple-touch-icon-180x180.png",
                    alt: "avatar"
                  }
                })
              ]
            )
          ],
          1
        )
      ],
      1
    )
  };
  var __vue_staticRenderFns__$1 = [];
  __vue_render__$1._withStripped = true;

    /* style */
    const __vue_inject_styles__$1 = undefined;
    /* scoped */
    const __vue_scope_id__$1 = undefined;
    /* module identifier */
    const __vue_module_identifier__$1 = undefined;
    /* functional template */
    const __vue_is_functional_template__$1 = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$1 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
      __vue_inject_styles__$1,
      __vue_script__$1,
      __vue_scope_id__$1,
      __vue_is_functional_template__$1,
      __vue_module_identifier__$1,
      false,
      undefined,
      undefined,
      undefined
    );

  //
  //
  //
  //
  //
  //
  //
  //

  var script$1 = {
    directives: {
      Scroll: Scroll
    },

    components: {
      VFlex: VFlex
    }
  };

  /* script */
  const __vue_script__$2 = script$1;

  /* template */
  var __vue_render__$2 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "v-flex",
      {
        directives: [{ name: "scroll", rawName: "v-scroll" }],
        attrs: { xs12: "" }
      },
      [_vm._t("default", [_vm._v("\n    Can be used as a wrapper\n  ")])],
      2
    )
  };
  var __vue_staticRenderFns__$2 = [];
  __vue_render__$2._withStripped = true;

    /* style */
    const __vue_inject_styles__$2 = undefined;
    /* scoped */
    const __vue_scope_id__$2 = undefined;
    /* module identifier */
    const __vue_module_identifier__$2 = undefined;
    /* functional template */
    const __vue_is_functional_template__$2 = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$2 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
      __vue_inject_styles__$2,
      __vue_script__$2,
      __vue_scope_id__$2,
      __vue_is_functional_template__$2,
      __vue_module_identifier__$2,
      false,
      undefined,
      undefined,
      undefined
    );

  var default_1$1 = /** @class */ (function (_super) {
      __extends(default_1, _super);
      function default_1() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      __decorate([
          Prop({
              components: {
                  VBtn: VBtn,
                  VAlert: VAlert
              },

              type: String,
              default: "This is a decorated component without any vuetify import"
          })
      ], default_1.prototype, "message", void 0);
      default_1 = __decorate([
          Component
      ], default_1);
      return default_1;
  }(Vue));

  /* script */
  const __vue_script__$3 = default_1$1;

  /* template */
  var __vue_render__$3 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "v-alert",
      { attrs: { value: true, type: "success" } },
      [
        _vm._v("\n   " + _vm._s(_vm.message) + "\n   "),
        _c("v-btn", [_vm._v("OK!")])
      ],
      1
    )
  };
  var __vue_staticRenderFns__$3 = [];
  __vue_render__$3._withStripped = true;

    /* style */
    const __vue_inject_styles__$3 = undefined;
    /* scoped */
    const __vue_scope_id__$3 = undefined;
    /* module identifier */
    const __vue_module_identifier__$3 = undefined;
    /* functional template */
    const __vue_is_functional_template__$3 = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$3 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
      __vue_inject_styles__$3,
      __vue_script__$3,
      __vue_scope_id__$3,
      __vue_is_functional_template__$3,
      __vue_module_identifier__$3,
      false,
      undefined,
      undefined,
      undefined
    );

  const ExportByReference = Vue.extend({
    components: {
      VChip: VChip
    },

    name: 'ExportByReference'
  });

  /* script */
  const __vue_script__$4 = ExportByReference;

  /* template */
  var __vue_render__$4 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("v-chip", [_vm._v("Chip used by the component exported by ref")])
  };
  var __vue_staticRenderFns__$4 = [];
  __vue_render__$4._withStripped = true;

    /* style */
    const __vue_inject_styles__$4 = undefined;
    /* scoped */
    const __vue_scope_id__$4 = undefined;
    /* module identifier */
    const __vue_module_identifier__$4 = undefined;
    /* functional template */
    const __vue_is_functional_template__$4 = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$4 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
      __vue_inject_styles__$4,
      __vue_script__$4,
      __vue_scope_id__$4,
      __vue_is_functional_template__$4,
      __vue_module_identifier__$4,
      false,
      undefined,
      undefined,
      undefined
    );

  var script$2 = Vue.extend({
      components: {
          VFlex: VFlex,
          VChip: VChip
      },
      data: function () {
          return {
              message: "Hello! It's extended component",
          };
      },
  });

  /* script */
  const __vue_script__$5 = script$2;

  /* template */
  var __vue_render__$5 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("v-flex", [_c("v-chip", [_vm._v(_vm._s(_vm.message))])], 1)
  };
  var __vue_staticRenderFns__$5 = [];
  __vue_render__$5._withStripped = true;

    /* style */
    const __vue_inject_styles__$5 = undefined;
    /* scoped */
    const __vue_scope_id__$5 = undefined;
    /* module identifier */
    const __vue_module_identifier__$5 = undefined;
    /* functional template */
    const __vue_is_functional_template__$5 = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$5 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 },
      __vue_inject_styles__$5,
      __vue_script__$5,
      __vue_scope_id__$5,
      __vue_is_functional_template__$5,
      __vue_module_identifier__$5,
      false,
      undefined,
      undefined,
      undefined
    );

  var script$3 = {
    components: {
      VBtn: VBtn
    },

    name: "ExternalComponent",

    props: {
      text: { type: String, default: "it's external component!" },
    }
  };

  var css_248z = "body {\n  font-size: 1rem;\n}";
  styleInject(css_248z);

  /* script */
  const __vue_script__$6 = script$3;
  /* template */
  var __vue_render__$6 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", [_c("v-btn", [_vm._v(_vm._s(_vm.text))])], 1)
  };
  var __vue_staticRenderFns__$6 = [];
  __vue_render__$6._withStripped = true;

    /* style */
    const __vue_inject_styles__$6 = undefined;
    /* scoped */
    const __vue_scope_id__$6 = undefined;
    /* module identifier */
    const __vue_module_identifier__$6 = undefined;
    /* functional template */
    const __vue_is_functional_template__$6 = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$6 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$6, staticRenderFns: __vue_staticRenderFns__$6 },
      __vue_inject_styles__$6,
      __vue_script__$6,
      __vue_scope_id__$6,
      __vue_is_functional_template__$6,
      __vue_module_identifier__$6,
      false,
      undefined,
      undefined,
      undefined
    );

  //
  //
  //
  //
  //
  //

  var script$4 = {
    directives: {
      Scroll: Scroll
    },

    components: {
      VFlex: VFlex
    },

    name: 'SimpleComponent',

    props: {
      message: { type: String, default: 'Very Simple Components' },
    }
  };

  var css_248z$1 = "\nbody {\n  font-size: 1.000001rem;\n}\n";
  styleInject(css_248z$1);

  /* script */
  const __vue_script__$7 = script$4;
  /* template */
  var __vue_render__$7 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "v-flex",
      {
        directives: [{ name: "scroll", rawName: "v-scroll" }],
        attrs: { xs12: "" }
      },
      [_vm._v("\n  " + _vm._s(_vm.message) + "\n")]
    )
  };
  var __vue_staticRenderFns__$7 = [];
  __vue_render__$7._withStripped = true;

    /* style */
    const __vue_inject_styles__$7 = undefined;
    /* scoped */
    const __vue_scope_id__$7 = undefined;
    /* module identifier */
    const __vue_module_identifier__$7 = undefined;
    /* functional template */
    const __vue_is_functional_template__$7 = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$7 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$7, staticRenderFns: __vue_staticRenderFns__$7 },
      __vue_inject_styles__$7,
      __vue_script__$7,
      __vue_scope_id__$7,
      __vue_is_functional_template__$7,
      __vue_module_identifier__$7,
      false,
      undefined,
      undefined,
      undefined
    );

  var script$5 = {
    components: {
      VAlert: VAlert
    }
  };

  /* script */
  const __vue_script__$8 = script$5;

  /* template */
  var __vue_render__$8 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("v-alert", { attrs: { value: true, type: "warning" } }, [
      _vm._v("\n  This component has empty script section. Oops\n")
    ])
  };
  var __vue_staticRenderFns__$8 = [];
  __vue_render__$8._withStripped = true;

    /* style */
    const __vue_inject_styles__$8 = undefined;
    /* scoped */
    const __vue_scope_id__$8 = undefined;
    /* module identifier */
    const __vue_module_identifier__$8 = undefined;
    /* functional template */
    const __vue_is_functional_template__$8 = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$8 = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$8, staticRenderFns: __vue_staticRenderFns__$8 },
      __vue_inject_styles__$8,
      __vue_script__$8,
      __vue_scope_id__$8,
      __vue_is_functional_template__$8,
      __vue_module_identifier__$8,
      false,
      undefined,
      undefined,
      undefined
    );

  /* script */

  /* template */
  var __vue_render__$9 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("v-alert", { attrs: { value: true, type: "error" } }, [
      _vm._v("\n  This component does not even have a script section! 🤔\n")
    ])
  };
  var __vue_staticRenderFns__$9 = [];
  __vue_render__$9._withStripped = true;

  /* style */
  const __vue_inject_styles__$9 = undefined;
  /* scoped */
  const __vue_scope_id__$9 = undefined;
  /* module identifier */
  const __vue_module_identifier__$9 = undefined;
  /* functional template */
  const __vue_is_functional_template__$9 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */



  const __vue_component__$9 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$9, staticRenderFns: __vue_staticRenderFns__$9 },
    __vue_inject_styles__$9,
    {
      components: {
        VAlert: VAlert
      }
    },
    __vue_scope_id__$9,
    __vue_is_functional_template__$9,
    __vue_module_identifier__$9,
    false,
    undefined,
    undefined,
    undefined
  );

  var components = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Complex: __vue_component__,
    Decorated: __vue_component__$1,
    Empty: __vue_component__$2,
    EmptyDecorator: __vue_component__$3,
    ExportByReference: __vue_component__$4,
    Extended: __vue_component__$5,
    External: __vue_component__$6,
    Simple: __vue_component__$7,
    WithEmptyScript: __vue_component__$8,
    WithoutScript: __vue_component__$9
  });

  var script$6 = {
    components: {
      ...components,
      VSelect: VSelect,
      VContainer: VContainer,
      VApp: VApp
    },
    data: () => ({
      components: Object.keys(components),
      current: Object.keys(components)[0]
    })
  };

  /* script */
  const __vue_script__$9 = script$6;

  /* template */
  var __vue_render__$a = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "v-app",
      [
        _c(
          "v-container",
          [
            _c("v-select", {
              attrs: { items: _vm.components },
              model: {
                value: _vm.current,
                callback: function($$v) {
                  _vm.current = $$v;
                },
                expression: "current"
              }
            }),
            _vm._v(" "),
            _c(_vm.current, { tag: "component" })
          ],
          1
        )
      ],
      1
    )
  };
  var __vue_staticRenderFns__$a = [];
  __vue_render__$a._withStripped = true;

    /* style */
    const __vue_inject_styles__$a = undefined;
    /* scoped */
    const __vue_scope_id__$a = undefined;
    /* module identifier */
    const __vue_module_identifier__$a = undefined;
    /* functional template */
    const __vue_is_functional_template__$a = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$a = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__$a, staticRenderFns: __vue_staticRenderFns__$a },
      __vue_inject_styles__$a,
      __vue_script__$9,
      __vue_scope_id__$a,
      __vue_is_functional_template__$a,
      __vue_module_identifier__$a,
      false,
      undefined,
      undefined,
      undefined
    );

  Vue.use(Vuetify);

  new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    render: h => h(__vue_component__$a),
  });

})));
