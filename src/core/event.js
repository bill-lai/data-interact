// 发布订阅,事件模型
var Event = (function () {
  var _default = 'default';
  var _shift = Array.prototype.shift;
  var _unshift = Array.prototype.unshift;


  function createEvent() {
    var namespaceCache = {}

    function _listen(cache, key, fn) {
      if (cache[key]) {
        cache[key].push(fn)
      } else {
        cache[key] = [fn]
      }
    }

    function _trigger() {
      var args = arguments
      var cache = _shift.call(args);
      var key = _shift.call(args);
      var stack = cache[key]

      if (!stack || stack.length === 0) return { stack: [], rets: [] };
      stack.forEach(function (fn) {
        return fn.apply(this, args)
      })
      return stack;
    }

    function _mutual() {
      var args = arguments
      var cache = _shift.call(args);
      var key = _shift.call(args);
      var stack = cache[key]
      var ret = { stack: [], ret: true }

      if (!stack || stack.length === 0) return ret;

      for (var i = 0; i < stack.length; i++) {
        let result = stack[i].apply(this, args)
        if (result === false) {
          ret.ret = false
          return ret
        } else {
          ret.stack.push(stack[i])
        }
      }

      return ret
    }

    function _remove(cache, key, fn) {
      var stack = cache[key]

      if (!stack || stack.length === 0) return
      if (fn) {
        for (var i = stack.length; i >= 0; i--) {
          if (stack[i] === fn) {
            stack.splice(i, 1)
          }
        }
      } else {
        stack.length = 0
      }
    }

    function _create(namespace) {
      namespace = namespace || _default
      if (namespaceCache[namespace]) {
        return namespaceCache[namespace]
      }

      var cache = {}
      var ret = {
        listen: function (key, fn) {
          _listen(cache, key, fn)
        },
        once: function (key, fn) {
          fn.__once = true
          _listen(cache, key, fn)
        },
        remove: function (key, fn) {
          _remove(cache, key, fn)
        },
        trigger: function () {
          _unshift.call(arguments, cache)

          var stack = _trigger.apply(this, arguments)
          for (var i = stack.length; i >= 0; i--) {
            if (stack[i] && stack[i].__once) {
              stack.splice(i, 1)
            }
          }
        },
        mutual: function () {
          _unshift.call(arguments, cache)

          var ret = _mutual.apply(this, arguments)
          var stack = ret.stack
          for (var i = stack.length; i >= 0; i--) {
            if (stack[i] && stack[i].__once) {
              stack.splice(i, 1)
            }
          }
          return ret.ret
        }
      }

      namespaceCache[namespace] = ret;
      return ret
    }

    return {
      create: _create,
      once: function () {
        this.create().once.apply(this, arguments)
      },
      listen: function () {
        this.create().listen.apply(this, arguments)
      },
      remove: function () {
        this.create().remove.apply(this, arguments)
      },
      trigger: function () {
        this.create().trigger.apply(this, arguments)
      },
      mutual: function () {
        return this.create().mutual.apply(this, arguments)
      },
    }
  }

  return createEvent()
})();


export default Event