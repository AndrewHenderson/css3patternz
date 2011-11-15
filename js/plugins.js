/*
 * jPicker 1.1.6
 *
 * jQuery Plugin for Photoshop style color picker
 *
 * Copyright (c) 2010 Christopher T. Tillman
 * Digital Magic Productions, Inc. (http://www.digitalmagicpro.com/)
 * MIT style license, FREE to use, alter, copy, sell, and especially ENHANCE
 *
 * Painstakingly ported from John Dyers' excellent work on his own color picker based on the Prototype framework.
 *
 * John Dyers' website: (http://johndyer.name)
 * Color Picker page:   (http://johndyer.name/post/2007/09/PhotoShop-like-JavaScript-Color-Picker.aspx)
 *
 */
(function($, version)
{
  Math.precision = function(value, precision)
    {
      if (precision === undefined) precision = 0;
      return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
    };
  var Slider = // encapsulate slider functionality for the ColorMap and ColorBar - could be useful to use a jQuery UI draggable for this with certain extensions
      function(bar, options)
      {
        var $this = this, // private properties, methods, and events - keep these variables and classes invisible to outside code
          arrow = bar.find('img:first'), // the arrow image to drag
          minX = 0,
          maxX = 100,
          rangeX = 100,
          minY = 0,
          maxY = 100,
          rangeY = 100,
          x = 0,
          y = 0,
          offset,
          timeout,
          changeEvents = new Array(),
          fireChangeEvents =
            function(context)
            {
              for (var i = 0; i < changeEvents.length; i++) changeEvents[i].call($this, $this, context);
            },
          mouseDown = // bind the mousedown to the bar not the arrow for quick snapping to the clicked location
            function(e)
            {
              var off = bar.offset();
              offset = { l: off.left | 0, t: off.top | 0 };
              clearTimeout(timeout);
              timeout = setTimeout( // using setTimeout for visual updates - once the style is updated the browser will re-render internally allowing the next Javascript to run
                function()
                {
                  setValuesFromMousePosition.call($this, e);
                }, 0);
              // Bind mousemove and mouseup event to the document so it responds when dragged of of the bar - we will unbind these when on mouseup to save processing
              $(document).bind('mousemove', mouseMove).bind('mouseup', mouseUp);
              e.preventDefault(); // don't try to select anything or drag the image to the desktop
            },
          mouseMove = // set the values as the mouse moves
            function(e)
            {
              clearTimeout(timeout);
              timeout = setTimeout(
                function()
                {
                  setValuesFromMousePosition.call($this, e);
                }, 0);
              e.stopPropagation();
              e.preventDefault();
              return false;
            },
          mouseUp = // unbind the document events - they aren't needed when not dragging
            function(e)
            {
              $(document).unbind('mouseup', mouseUp).unbind('mousemove', mouseMove);
              e.stopPropagation();
              e.preventDefault();
              return false;
            },
          setValuesFromMousePosition = // calculate mouse position and set value within the current range
            function(e)
            {
              var locX = e.pageX - offset.l,
                  locY = e.pageY - offset.t,
                  barW = bar.w, // local copies for YUI compressor
                  barH = bar.h;
              // keep the arrow within the bounds of the bar
              if (locX < 0) locX = 0;
              else if (locX > barW) locX = barW;
              if (locY < 0) locY = 0;
              else if (locY > barH) locY = barH;
              val.call($this, 'xy', { x: ((locX / barW) * rangeX) + minX, y: ((locY / barH) * rangeY) + minY });
            },
          draw =
            function()
            {
              var arrowOffsetX = 0,
                arrowOffsetY = 0,
                barW = bar.w,
                barH = bar.h,
                arrowW = arrow.w,
                arrowH = arrow.h;
              setTimeout(
                function()
                {
                  if (rangeX > 0) // range is greater than zero
                  {
                    // constrain to bounds
                    if (x == maxX) arrowOffsetX = barW;
                    else arrowOffsetX = ((x / rangeX) * barW) | 0;
                  }
                  if (rangeY > 0) // range is greater than zero
                  {
                    // constrain to bounds
                    if (y == maxY) arrowOffsetY = barH;
                    else arrowOffsetY = ((y / rangeY) * barH) | 0;
                  }
                  // if arrow width is greater than bar width, center arrow and prevent horizontal dragging
                  if (arrowW >= barW) arrowOffsetX = (barW >> 1) - (arrowW >> 1); // number >> 1 - superfast bitwise divide by two and truncate (move bits over one bit discarding lowest)
                  else arrowOffsetX -= arrowW >> 1;
                  // if arrow height is greater than bar height, center arrow and prevent vertical dragging
                  if (arrowH >= barH) arrowOffsetY = (barH >> 1) - (arrowH >> 1);
                  else arrowOffsetY -= arrowH >> 1;
                  // set the arrow position based on these offsets
                  arrow.css({ left: arrowOffsetX + 'px', top: arrowOffsetY + 'px' });
                }, 0);
            },
          val =
            function(name, value, context)
            {
              var set = value !== undefined;
              if (!set)
              {
                if (name === undefined || name == null) name = 'xy';
                switch (name.toLowerCase())
                {
                  case 'x': return x;
                  case 'y': return y;
                  case 'xy':
                  default: return { x: x, y: y };
                }
              }
              if (context != null && context == $this) return;
              var changed = false,
                  newX,
                  newY;
              if (name == null) name = 'xy';
              switch (name.toLowerCase())
              {
                case 'x':
                  newX = value && (value.x && value.x | 0 || value | 0) || 0;
                  break;
                case 'y':
                  newY = value && (value.y && value.y | 0 || value | 0) || 0;
                  break;
                case 'xy':
                default:
                  newX = value && value.x && value.x | 0 || 0;
                  newY = value && value.y && value.y | 0 || 0;
                  break;
              }
              if (newX != null)
              {
                if (newX < minX) newX = minX;
                else if (newX > maxX) newX = maxX;
                if (x != newX)
                {
                  x = newX;
                  changed = true;
                }
              }
              if (newY != null)
              {
                if (newY < minY) newY = minY;
                else if (newY > maxY) newY = maxY;
                if (y != newY)
                {
                  y = newY;
                  changed = true;
                }
              }
              changed && fireChangeEvents.call($this, context || $this);
            },
          range =
            function (name, value)
            {
              var set = value !== undefined;
              if (!set)
              {
                if (name === undefined || name == null) name = 'all';
                switch (name.toLowerCase())
                {
                  case 'minx': return minX;
                  case 'maxx': return maxX;
                  case 'rangex': return { minX: minX, maxX: maxX, rangeX: rangeX };
                  case 'miny': return minY;
                  case 'maxy': return maxY;
                  case 'rangey': return { minY: minY, maxY: maxY, rangeY: rangeY };
                  case 'all':
                  default: return { minX: minX, maxX: maxX, rangeX: rangeX, minY: minY, maxY: maxY, rangeY: rangeY };
                }
              }
              var changed = false,
                  newMinX,
                  newMaxX,
                  newMinY,
                  newMaxY;
              if (name == null) name = 'all';
              switch (name.toLowerCase())
              {
                case 'minx':
                  newMinX = value && (value.minX && value.minX | 0 || value | 0) || 0;
                  break;
                case 'maxx':
                  newMaxX = value && (value.maxX && value.maxX | 0 || value | 0) || 0;
                  break;
                case 'rangex':
                  newMinX = value && value.minX && value.minX | 0 || 0;
                  newMaxX = value && value.maxX && value.maxX | 0 || 0;
                  break;
                case 'miny':
                  newMinY = value && (value.minY && value.minY | 0 || value | 0) || 0;
                  break;
                case 'maxy':
                  newMaxY = value && (value.maxY && value.maxY | 0 || value | 0) || 0;
                  break;
                case 'rangey':
                  newMinY = value && value.minY && value.minY | 0 || 0;
                  newMaxY = value && value.maxY && value.maxY | 0 || 0;
                  break;
                case 'all':
                default:
                  newMinX = value && value.minX && value.minX | 0 || 0;
                  newMaxX = value && value.maxX && value.maxX | 0 || 0;
                  newMinY = value && value.minY && value.minY | 0 || 0;
                  newMaxY = value && value.maxY && value.maxY | 0 || 0;
                  break;
              }
              if (newMinX != null && minX != newMinX)
              {
                minX = newMinX;
                rangeX = maxX - minX;
              }
              if (newMaxX != null && maxX != newMaxX)
              {
                maxX = newMaxX;
                rangeX = maxX - minX;
              }
              if (newMinY != null && minY != newMinY)
              {
                minY = newMinY;
                rangeY = maxY - minY;
              }
              if (newMaxY != null && maxY != newMaxY)
              {
                maxY = newMaxY;
                rangeY = maxY - minY;
              }
            },
          bind =
            function (callback)
            {
              if ($.isFunction(callback)) changeEvents.push(callback);
            },
          unbind =
            function (callback)
            {
              if (!$.isFunction(callback)) return;
              var i;
              while ((i = $.inArray(callback, changeEvents)) != -1) changeEvents.splice(i, 1);
            },
          destroy =
            function()
            {
              // unbind all possible events and null objects
              $(document).unbind('mouseup', mouseUp).unbind('mousemove', mouseMove);
              bar.unbind('mousedown', mouseDown);
              bar = null;
              arrow = null;
              changeEvents = null;
            };
        $.extend(true, $this, // public properties, methods, and event bindings - these we need to access from other controls
          {
            val: val,
            range: range,
            bind: bind,
            unbind: unbind,
            destroy: destroy
          });
        // initialize this control
        arrow.src = options.arrow && options.arrow.image;
        arrow.w = options.arrow && options.arrow.width || arrow.width();
        arrow.h = options.arrow && options.arrow.height || arrow.height();
        bar.w = options.map && options.map.width || bar.width();
        bar.h = options.map && options.map.height || bar.height();
        // bind mousedown event
        bar.bind('mousedown', mouseDown);
        bind.call($this, draw);
      },
    ColorValuePicker = // controls for all the input elements for the typing in color values
      function(picker, color, bindedHex, alphaPrecision)
      {
        var $this = this, // private properties and methods
          inputs = picker.find('td.Text input'),
          red = inputs.eq(3),
          green = inputs.eq(4),
          blue = inputs.eq(5),
          alpha = inputs.length > 7 ? inputs.eq(6) : null,
          hue = inputs.eq(0),
          saturation = inputs.eq(1),
          value = inputs.eq(2),
          hex = inputs.eq(inputs.length > 7 ? 7 : 6),
          ahex = inputs.length > 7 ? inputs.eq(8) : null,
          keyDown = // input box key down - use arrows to alter color
            function(e)
            {
              if (e.target.value == '' && e.target != hex.get(0) && (bindedHex != null && e.target != bindedHex.get(0) || bindedHex == null)) return;
              if (!validateKey(e)) return e;
              switch (e.target)
              {
                case red.get(0):
                  switch (e.keyCode)
                  {
                    case 38:
                      red.val(setValueInRange.call($this, (red.val() << 0) + 1, 0, 255));
                      color.val('r', red.val(), e.target);
                      return false;
                    case 40:
                      red.val(setValueInRange.call($this, (red.val() << 0) - 1, 0, 255));
                      color.val('r', red.val(), e.target);
                      return false;
                  }
                  break;
                case green.get(0):
                  switch (e.keyCode)
                  {
                    case 38:
                      green.val(setValueInRange.call($this, (green.val() << 0) + 1, 0, 255));
                      color.val('g', green.val(), e.target);
                      return false;
                    case 40:
                      green.val(setValueInRange.call($this, (green.val() << 0) - 1, 0, 255));
                      color.val('g', green.val(), e.target);
                      return false;
                  }
                  break;
                case blue.get(0):
                  switch (e.keyCode)
                  {
                    case 38:
                      blue.val(setValueInRange.call($this, (blue.val() << 0) + 1, 0, 255));
                      color.val('b', blue.val(), e.target);
                      return false;
                    case 40:
                      blue.val(setValueInRange.call($this, (blue.val() << 0) - 1, 0, 255));
                      color.val('b', blue.val(), e.target);
                      return false;
                  }
                  break;
                case alpha && alpha.get(0):
                  switch (e.keyCode)
                  {
                    case 38:
                      alpha.val(setValueInRange.call($this, parseFloat(alpha.val()) + 1, 0, 100));
                      color.val('a', Math.precision((alpha.val() * 255) / 100, alphaPrecision), e.target);
                      return false;
                    case 40:
                      alpha.val(setValueInRange.call($this, parseFloat(alpha.val()) - 1, 0, 100));
                      color.val('a', Math.precision((alpha.val() * 255) / 100, alphaPrecision), e.target);
                      return false;
                  }
                  break;
                case hue.get(0):
                  switch (e.keyCode)
                  {
                    case 38:
                      hue.val(setValueInRange.call($this, (hue.val() << 0) + 1, 0, 360));
                      color.val('h', hue.val(), e.target);
                      return false;
                    case 40:
                      hue.val(setValueInRange.call($this, (hue.val() << 0) - 1, 0, 360));
                      color.val('h', hue.val(), e.target);
                      return false;
                  }
                  break;
                case saturation.get(0):
                  switch (e.keyCode)
                  {
                    case 38:
                      saturation.val(setValueInRange.call($this, (saturation.val() << 0) + 1, 0, 100));
                      color.val('s', saturation.val(), e.target);
                      return false;
                    case 40:
                      saturation.val(setValueInRange.call($this, (saturation.val() << 0) - 1, 0, 100));
                      color.val('s', saturation.val(), e.target);
                      return false;
                  }
                  break;
                case value.get(0):
                  switch (e.keyCode)
                  {
                    case 38:
                      value.val(setValueInRange.call($this, (value.val() << 0) + 1, 0, 100));
                      color.val('v', value.val(), e.target);
                      return false;
                    case 40:
                      value.val(setValueInRange.call($this, (value.val() << 0) - 1, 0, 100));
                      color.val('v', value.val(), e.target);
                      return false;
                  }
                  break;
              }
            },
          keyUp = // input box key up - validate value and set color
            function(e)
            {
              if (e.target.value == '' && e.target != hex.get(0) && (bindedHex != null && e.target != bindedHex.get(0) || bindedHex == null)) return;
              if (!validateKey(e)) return e;
              switch (e.target)
              {
                case red.get(0):
                  red.val(setValueInRange.call($this, red.val(), 0, 255));
                  color.val('r', red.val(), e.target);
                  break;
                case green.get(0):
                  green.val(setValueInRange.call($this, green.val(), 0, 255));
                  color.val('g', green.val(), e.target);
                  break;
                case blue.get(0):
                  blue.val(setValueInRange.call($this, blue.val(), 0, 255));
                  color.val('b', blue.val(), e.target);
                  break;
                case alpha && alpha.get(0):
                  alpha.val(setValueInRange.call($this, alpha.val(), 0, 100));
                  color.val('a', Math.precision((alpha.val() * 255) / 100, alphaPrecision), e.target);
                  break;
                case hue.get(0):
                  hue.val(setValueInRange.call($this, hue.val(), 0, 360));
                  color.val('h', hue.val(), e.target);
                  break;
                case saturation.get(0):
                  saturation.val(setValueInRange.call($this, saturation.val(), 0, 100));
                  color.val('s', saturation.val(), e.target);
                  break;
                case value.get(0):
                  value.val(setValueInRange.call($this, value.val(), 0, 100));
                  color.val('v', value.val(), e.target);
                  break;
                case hex.get(0):
                  hex.val(hex.val().replace(/[^a-fA-F0-9]/g, '').toLowerCase().substring(0, 6));
                  bindedHex && bindedHex.val(hex.val());
                  color.val('hex', hex.val() != '' ? hex.val() : null, e.target);
                  break;
                case bindedHex && bindedHex.get(0):
                  bindedHex.val(bindedHex.val().replace(/[^a-fA-F0-9]/g, '').toLowerCase().substring(0, 6));
                  hex.val(bindedHex.val());
                  color.val('hex', bindedHex.val() != '' ? bindedHex.val() : null, e.target);
                  break;
                case ahex && ahex.get(0):
                  ahex.val(ahex.val().replace(/[^a-fA-F0-9]/g, '').toLowerCase().substring(0, 2));
                  color.val('a', ahex.val() != null ? parseInt(ahex.val(), 16) : null, e.target);
                  break;
              }
            },
          blur = // input box blur - reset to original if value empty
            function(e)
            {
              if (color.val() != null)
              {
                switch (e.target)
                {
                  case red.get(0): red.val(color.val('r')); break;
                  case green.get(0): green.val(color.val('g')); break;
                  case blue.get(0): blue.val(color.val('b')); break;
                  case alpha && alpha.get(0): alpha.val(Math.precision((color.val('a') * 100) / 255, alphaPrecision)); break;
                  case hue.get(0): hue.val(color.val('h')); break;
                  case saturation.get(0): saturation.val(color.val('s')); break;
                  case value.get(0): value.val(color.val('v')); break;
                  case hex.get(0):
                  case bindedHex && bindedHex.get(0):
                    hex.val(color.val('hex'));
                    bindedHex && bindedHex.val(color.val('hex'));
                    break;
                  case ahex && ahex.get(0): ahex.val(color.val('ahex').substring(6)); break;
                }
              }
            },
          validateKey = // validate key
            function(e)
            {
              switch(e.keyCode)
              {
                case 9:
                case 16:
                case 29:
                case 37:
                case 39:
                  return false;
                case 'c'.charCodeAt():
                case 'v'.charCodeAt():
                  if (e.ctrlKey) return false;
              }
              return true;
            },
          setValueInRange = // constrain value within range
            function(value, min, max)
            {
              if (value == '' || isNaN(value)) return min;
              if (value > max) return max;
              if (value < min) return min;
              return value;
            },
          colorChanged =
            function(ui, context)
            {
              var all = ui.val('all');
              if (context != red.get(0)) red.val(all != null ? all.r : '');
              if (context != green.get(0)) green.val(all != null ? all.g : '');
              if (context != blue.get(0)) blue.val(all != null ? all.b : '');
              if (alpha && context != alpha.get(0)) alpha.val(all != null ? Math.precision((all.a * 100) / 255, alphaPrecision) : '');
              if (context != hue.get(0)) hue.val(all != null ? all.h : '');
              if (context != saturation.get(0)) saturation.val(all != null ? all.s : '');
              if (context != value.get(0)) value.val(all != null ? all.v : '');
              if (context != hex.get(0) && (bindedHex && context != bindedHex.get(0) || !bindedHex)) hex.val(all != null ? all.hex : '');
              if (bindedHex && context != bindedHex.get(0) && context != hex.get(0)) bindedHex.val(all != null ? all.hex : '');
              if (ahex && context != ahex.get(0)) ahex.val(all != null ? all.ahex.substring(6) : '');
            },
          destroy =
            function()
            {
              // unbind all events and null objects
              red.add(green).add(blue).add(alpha).add(hue).add(saturation).add(value).add(hex).add(bindedHex).add(ahex).unbind('keyup', keyUp).unbind('blur', blur);
              red.add(green).add(blue).add(alpha).add(hue).add(saturation).add(value).unbind('keydown', keyDown);
              color.unbind(colorChanged);
              red = null;
              green = null;
              blue = null;
              alpha = null;
              hue = null;
              saturation = null;
              value = null;
              hex = null;
              ahex = null;
            };
        $.extend(true, $this, // public properties and methods
          {
            destroy: destroy
          });
        red.add(green).add(blue).add(alpha).add(hue).add(saturation).add(value).add(hex).add(bindedHex).add(ahex).bind('keyup', keyUp).bind('blur', blur);
        red.add(green).add(blue).add(alpha).add(hue).add(saturation).add(value).bind('keydown', keyDown);
        color.bind(colorChanged);
      };
  $.jPicker =
    {
      List: [], // array holding references to each active instance of the control
      Color: // color object - we will be able to assign by any color space type or retrieve any color space info
             // we want this public so we can optionally assign new color objects to initial values using inputs other than a string hex value (also supported)
        function(init)
        {
          var $this = this,
            r,
            g,
            b,
            a,
            h,
            s,
            v,
            changeEvents = new Array(),
            fireChangeEvents = 
              function(context)
              {
                for (var i = 0; i < changeEvents.length; i++) changeEvents[i].call($this, $this, context);
              },
            val =
              function(name, value, context)
              {
                var set = value !== undefined;
                if (!set)
                {
                  if (name === undefined || name == null || name == '') name = 'all';
                  if (r == null) return null;
                  switch (name.toLowerCase())
                  {
                    case 'ahex': return ColorMethods.rgbaToHex({ r: r, g: g, b: b, a: a });
                    case 'hex': return val('ahex').substring(0, 6);
                    case 'all': return { r: r, g: g, b: b, a: a, h: h, s: s, v: v, hex: val.call($this, 'hex'), ahex: val.call($this, 'ahex') };
                    default:
                      var ret={};
                      for (var i = 0; i < name.length; i++)
                      {
                        switch (name.charAt(i))
                        {
                          case 'r':
                            if (name.length == 1) ret = r;
                            else ret.r = r;
                            break;
                          case 'g':
                            if (name.length == 1) ret = g;
                            else ret.g = g;
                            break;
                          case 'b':
                            if (name.length == 1) ret = b;
                            else ret.b = b;
                            break;
                          case 'a':
                            if (name.length == 1) ret = a;
                            else ret.a = a;
                            break;
                          case 'h':
                            if (name.length == 1) ret = h;
                            else ret.h = h;
                            break;
                          case 's':
                            if (name.length == 1) ret = s;
                            else ret.s = s;
                            break;
                          case 'v':
                            if (name.length == 1) ret = v;
                            else ret.v = v;
                            break;
                        }
                      }
                      return ret == {} ? val.call($this, 'all') : ret;
                      break;
                  }
                }
                if (context != null && context == $this) return;
                var changed = false;
                if (name == null) name = '';
                if (value == null)
                {
                  if (r != null)
                  {
                    r = null;
                    changed = true;
                  }
                  if (g != null)
                  {
                    g = null;
                    changed = true;
                  }
                  if (b != null)
                  {
                    b = null;
                    changed = true;
                  }
                  if (a != null)
                  {
                    a = null;
                    changed = true;
                  }
                  if (h != null)
                  {
                    h = null;
                    changed = true;
                  }
                  if (s != null)
                  {
                    s = null;
                    changed = true;
                  }
                  if (v != null)
                  {
                    v = null;
                    changed = true;
                  }
                  changed && fireChangeEvents.call($this, context || $this);
                  return;
                }
                switch (name.toLowerCase())
                {
                  case 'ahex':
                  case 'hex':
                    var ret = ColorMethods.hexToRgba(value && (value.ahex || value.hex) || value || '00000000');
                    val.call($this, 'rgba', { r: ret.r, g: ret.g, b: ret.b, a: name == 'ahex' ? ret.a : a != null ? a : 255 }, context);
                    break;
                  default:
                    if (value && (value.ahex != null || value.hex != null))
                    {
                      val.call($this, 'ahex', value.ahex || value.hex || '00000000', context);
                      return;
                    }
                    var newV = {}, rgb = false, hsv = false;
                    if (value.r !== undefined && !name.indexOf('r') == -1) name += 'r';
                    if (value.g !== undefined && !name.indexOf('g') == -1) name += 'g';
                    if (value.b !== undefined && !name.indexOf('b') == -1) name += 'b';
                    if (value.a !== undefined && !name.indexOf('a') == -1) name += 'a';
                    if (value.h !== undefined && !name.indexOf('h') == -1) name += 'h';
                    if (value.s !== undefined && !name.indexOf('s') == -1) name += 's';
                    if (value.v !== undefined && !name.indexOf('v') == -1) name += 'v';
                    for (var i = 0; i < name.length; i++)
                    {
                      switch (name.charAt(i))
                      {
                        case 'r':
                          if (hsv) continue;
                          rgb = true;
                          newV.r = value && value.r && value.r | 0 || value && value | 0 || 0;
                          if (newV.r < 0) newV.r = 0;
                          else if (newV.r > 255) newV.r = 255;
                          if (r != newV.r)
                          {
                            r = newV.r;
                            changed = true;
                          }
                          break;
                        case 'g':
                          if (hsv) continue;
                          rgb = true;
                          newV.g = value && value.g && value.g | 0 || value && value | 0 || 0;
                          if (newV.g < 0) newV.g = 0;
                          else if (newV.g > 255) newV.g = 255;
                          if (g != newV.g)
                          {
                            g = newV.g;
                            changed = true;
                          }
                          break;
                        case 'b':
                          if (hsv) continue;
                          rgb = true;
                          newV.b = value && value.b && value.b | 0 || value && value | 0 || 0;
                          if (newV.b < 0) newV.b = 0;
                          else if (newV.b > 255) newV.b = 255;
                          if (b != newV.b)
                          {
                            b = newV.b;
                            changed = true;
                          }
                          break;
                        case 'a':
                          newV.a = value && value.a != null ? value.a | 0 : value != null ? value | 0 : 255;
                          if (newV.a < 0) newV.a = 0;
                          else if (newV.a > 255) newV.a = 255;
                          if (a != newV.a)
                          {
                            a = newV.a;
                            changed = true;
                          }
                          break;
                        case 'h':
                          if (rgb) continue;
                          hsv = true;
                          newV.h = value && value.h && value.h | 0 || value && value | 0 || 0;
                          if (newV.h < 0) newV.h = 0;
                          else if (newV.h > 360) newV.h = 360;
                          if (h != newV.h)
                          {
                            h = newV.h;
                            changed = true;
                          }
                          break;
                        case 's':
                          if (rgb) continue;
                          hsv = true;
                          newV.s = value && value.s != null ? value.s | 0 : value != null ? value | 0 : 100;
                          if (newV.s < 0) newV.s = 0;
                          else if (newV.s > 100) newV.s = 100;
                          if (s != newV.s)
                          {
                            s = newV.s;
                            changed = true;
                          }
                          break;
                        case 'v':
                          if (rgb) continue;
                          hsv = true;
                          newV.v = value && value.v != null ? value.v | 0 : value != null ? value | 0 : 100;
                          if (newV.v < 0) newV.v = 0;
                          else if (newV.v > 100) newV.v = 100;
                          if (v != newV.v)
                          {
                            v = newV.v;
                            changed = true;
                          }
                          break;
                      }
                    }
                    if (changed)
                    {
                      if (rgb)
                      {
                        r = r || 0;
                        g = g || 0;
                        b = b || 0;
                        var ret = ColorMethods.rgbToHsv({ r: r, g: g, b: b });
                        h = ret.h;
                        s = ret.s;
                        v = ret.v;
                      }
                      else if (hsv)
                      {
                        h = h || 0;
                        s = s != null ? s : 100;
                        v = v != null ? v : 100;
                        var ret = ColorMethods.hsvToRgb({ h: h, s: s, v: v });
                        r = ret.r;
                        g = ret.g;
                        b = ret.b;
                      }
                      a = a != null ? a : 255;
                      fireChangeEvents.call($this, context || $this);
                    }
                    break;
                }
              },
            bind =
              function(callback)
              {
                if ($.isFunction(callback)) changeEvents.push(callback);
              },
            unbind =
              function(callback)
              {
                if (!$.isFunction(callback)) return;
                var i;
                while ((i = $.inArray(callback, changeEvents)) != -1) changeEvents.splice(i, 1);
              },
            destroy =
              function()
              {
                changeEvents = null;
              }
          $.extend(true, $this, // public properties and methods
            {
              val: val,
              bind: bind,
              unbind: unbind,
              destroy: destroy
            });
          if (init)
          {
            if (init.ahex != null) val('ahex', init);
            else if (init.hex != null) val((init.a != null ? 'a' : '') + 'hex', init.a != null ? { ahex: init.hex + ColorMethods.intToHex(init.a) } : init);
            else if (init.r != null && init.g != null && init.b != null) val('rgb' + (init.a != null ? 'a' : ''), init);
            else if (init.h != null && init.s != null && init.v != null) val('hsv' + (init.a != null ? 'a' : ''), init);
          }
        },
      ColorMethods: // color conversion methods  - make public to give use to external scripts
        {
          hexToRgba:
            function(hex)
            {
              hex = this.validateHex(hex);
              if (hex == '') return { r: null, g: null, b: null, a: null };
              var r = '00', g = '00', b = '00', a = '255';
              if (hex.length == 6) hex += 'ff';
              if (hex.length > 6)
              {
                r = hex.substring(0, 2);
                g = hex.substring(2, 4);
                b = hex.substring(4, 6);
                a = hex.substring(6, hex.length);
              }
              else
              {
                if (hex.length > 4)
                {
                  r = hex.substring(4, hex.length);
                  hex = hex.substring(0, 4);
                }
                if (hex.length > 2)
                {
                  g = hex.substring(2, hex.length);
                  hex = hex.substring(0, 2);
                }
                if (hex.length > 0) b = hex.substring(0, hex.length);
              }
              return { r: this.hexToInt(r), g: this.hexToInt(g), b: this.hexToInt(b), a: this.hexToInt(a) };
            },
          validateHex:
            function(hex)
            {
              hex = hex.toLowerCase().replace(/[^a-f0-9]/g, '');
              if (hex.length > 8) hex = hex.substring(0, 8);
              return hex;
            },
          rgbaToHex:
            function(rgba)
            {
              return this.intToHex(rgba.r) + this.intToHex(rgba.g) + this.intToHex(rgba.b) + this.intToHex(rgba.a);
            },
          intToHex:
            function(dec)
            {
              var result = (dec | 0).toString(16);
              if (result.length == 1) result = ('0' + result);
              return result.toLowerCase();
            },
          hexToInt:
            function(hex)
            {
              return parseInt(hex, 16);
            },
          rgbToHsv:
            function(rgb)
            {
              var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255, hsv = { h: 0, s: 0, v: 0 }, min = 0, max = 0, delta;
              if (r >= g && r >= b)
              {
                max = r;
                min = g > b ? b : g;
              }
              else if (g >= b && g >= r)
              {
                max = g;
                min = r > b ? b : r;
              }
              else
              {
                max = b;
                min = g > r ? r : g;
              }
              hsv.v = max;
              hsv.s = max ? (max - min) / max : 0;
              if (!hsv.s) hsv.h = 0;
              else
              {
                delta = max - min;
                if (r == max) hsv.h = (g - b) / delta;
                else if (g == max) hsv.h = 2 + (b - r) / delta;
                else hsv.h = 4 + (r - g) / delta;
                hsv.h = parseInt(hsv.h * 60);
                if (hsv.h < 0) hsv.h += 360;
              }
              hsv.s = (hsv.s * 100) | 0;
              hsv.v = (hsv.v * 100) | 0;
              return hsv;
            },
          hsvToRgb:
            function(hsv)
            {
              var rgb = { r: 0, g: 0, b: 0, a: 100 }, h = hsv.h, s = hsv.s, v = hsv.v;
              if (s == 0)
              {
                if (v == 0) rgb.r = rgb.g = rgb.b = 0;
                else rgb.r = rgb.g = rgb.b = (v * 255 / 100) | 0;
              }
              else
              {
                if (h == 360) h = 0;
                h /= 60;
                s = s / 100;
                v = v / 100;
                var i = h | 0,
                    f = h - i,
                    p = v * (1 - s),
                    q = v * (1 - (s * f)),
                    t = v * (1 - (s * (1 - f)));
                switch (i)
                {
                  case 0:
                    rgb.r = v;
                    rgb.g = t;
                    rgb.b = p;
                    break;
                  case 1:
                    rgb.r = q;
                    rgb.g = v;
                    rgb.b = p;
                    break;
                  case 2:
                    rgb.r = p;
                    rgb.g = v;
                    rgb.b = t;
                    break;
                  case 3:
                    rgb.r = p;
                    rgb.g = q;
                    rgb.b = v;
                    break;
                  case 4:
                    rgb.r = t;
                    rgb.g = p;
                    rgb.b = v;
                    break;
                  case 5:
                    rgb.r = v;
                    rgb.g = p;
                    rgb.b = q;
                    break;
                }
                rgb.r = (rgb.r * 255) | 0;
                rgb.g = (rgb.g * 255) | 0;
                rgb.b = (rgb.b * 255) | 0;
              }
              return rgb;
            }
        }
    };
  var Color = $.jPicker.Color, List = $.jPicker.List, ColorMethods = $.jPicker.ColorMethods; // local copies for YUI compressor
  $.fn.jPicker =
    function(options)
    {
      var $arguments = arguments;
      return this.each(
        function()
        {
          var $this = this, settings = $.extend(true, {}, $.fn.jPicker.defaults, options); // local copies for YUI compressor
          if ($($this).get(0).nodeName.toLowerCase() == 'input') // Add color picker icon if binding to an input element and bind the events to the input
          {
            $.extend(true, settings,
              {
                window:
                {
                  bindToInput: true,
                  expandable: true,
                  input: $($this)
                }
              });
            if($($this).val()=='')
            {
              settings.color.active = new Color({ hex: null });
              settings.color.current = new Color({ hex: null });
            }
            else if (ColorMethods.validateHex($($this).val()))
            {
              settings.color.active = new Color({ hex: $($this).val(), a: settings.color.active.val('a') });
              settings.color.current = new Color({ hex: $($this).val(), a: settings.color.active.val('a') });
            }
          }
          if (settings.window.expandable)
            $($this).after('<span class="jPicker"><span class="Icon"><span class="Color">&nbsp;</span><span class="Alpha">&nbsp;</span><span class="Image" title="Click To Open Color Picker">&nbsp;</span><span class="Container">&nbsp;</span></span></span>');
          else settings.window.liveUpdate = false; // Basic control binding for inline use - You will need to override the liveCallback or commitCallback function to retrieve results
          var isLessThanIE7 = parseFloat(navigator.appVersion.split('MSIE')[1]) < 7 && document.body.filters, // needed to run the AlphaImageLoader function for IE6
            container = null,
            colorMapDiv = null,
            colorBarDiv = null,
            colorMapL1 = null, // different layers of colorMap and colorBar
            colorMapL2 = null,
            colorMapL3 = null,
            colorBarL1 = null,
            colorBarL2 = null,
            colorBarL3 = null,
            colorBarL4 = null,
            colorBarL5 = null,
            colorBarL6 = null,
            colorMap = null, // color maps
            colorBar = null,
            colorPicker = null,
            elementStartX = null, // Used to record the starting css positions for dragging the control
            elementStartY = null,
            pageStartX = null, // Used to record the mousedown coordinates for dragging the control
            pageStartY = null,
            activePreview = null, // color boxes above the radio buttons
            currentPreview = null,
            okButton = null,
            cancelButton = null,
            grid = null, // preset colors grid
            iconColor = null, // iconColor for popup icon
            iconAlpha = null, // iconAlpha for popup icon
            iconImage = null, // iconImage popup icon
            moveBar = null, // drag bar
            setColorMode = // set color mode and update visuals for the new color mode
              function(colorMode)
              {
                var active = color.active, // local copies for YUI compressor
                  clientPath = images.clientPath,
                  hex = active.val('hex'),
                  rgbMap,
                  rgbBar;
                settings.color.mode = colorMode;
                switch (colorMode)
                {
                  case 'h':
                    setTimeout(
                      function()
                      {
                        setBG.call($this, colorMapDiv, 'transparent');
                        setImgLoc.call($this, colorMapL1, 0);
                        setAlpha.call($this, colorMapL1, 100);
                        setImgLoc.call($this, colorMapL2, 260);
                        setAlpha.call($this, colorMapL2, 100);
                        setBG.call($this, colorBarDiv, 'transparent');
                        setImgLoc.call($this, colorBarL1, 0);
                        setAlpha.call($this, colorBarL1, 100);
                        setImgLoc.call($this, colorBarL2, 260);
                        setAlpha.call($this, colorBarL2, 100);
                        setImgLoc.call($this, colorBarL3, 260);
                        setAlpha.call($this, colorBarL3, 100);
                        setImgLoc.call($this, colorBarL4, 260);
                        setAlpha.call($this, colorBarL4, 100);
                        setImgLoc.call($this, colorBarL6, 260);
                        setAlpha.call($this, colorBarL6, 100);
                      }, 0);
                    colorMap.range('all', { minX: 0, maxX: 100, minY: 0, maxY: 100 });
                    colorBar.range('rangeY', { minY: 0, maxY: 360 });
                    if (active.val('ahex') == null) break;
                    colorMap.val('xy', { x: active.val('s'), y: 100 - active.val('v') }, colorMap);
                    colorBar.val('y', 360 - active.val('h'), colorBar);
                    break;
                  case 's':
                    setTimeout(
                      function()
                      {
                        setBG.call($this, colorMapDiv, 'transparent');
                        setImgLoc.call($this, colorMapL1, -260);
                        setImgLoc.call($this, colorMapL2, -520);
                        setImgLoc.call($this, colorBarL1, -260);
                        setImgLoc.call($this, colorBarL2, -520);
                        setImgLoc.call($this, colorBarL6, 260);
                        setAlpha.call($this, colorBarL6, 100);
                      }, 0);
                    colorMap.range('all', { minX: 0, maxX: 360, minY: 0, maxY: 100 });
                    colorBar.range('rangeY', { minY: 0, maxY: 100 });
                    if (active.val('ahex') == null) break;
                    colorMap.val('xy', { x: active.val('h'), y: 100 - active.val('v') }, colorMap);
                    colorBar.val('y', 100 - active.val('s'), colorBar);
                    break;
                  case 'v':
                    setTimeout(
                      function()
                      {
                        setBG.call($this, colorMapDiv, '000000');
                        setImgLoc.call($this, colorMapL1, -780);
                        setImgLoc.call($this, colorMapL2, 260);
                        setBG.call($this, colorBarDiv, hex);
                        setImgLoc.call($this, colorBarL1, -520);
                        setImgLoc.call($this, colorBarL2, 260);
                        setAlpha.call($this, colorBarL2, 100);
                        setImgLoc.call($this, colorBarL6, 260);
                        setAlpha.call($this, colorBarL6, 100);
                      }, 0);
                    colorMap.range('all', { minX: 0, maxX: 360, minY: 0, maxY: 100 });
                    colorBar.range('rangeY', { minY: 0, maxY: 100 });
                    if (active.val('ahex') == null) break;
                    colorMap.val('xy', { x: active.val('h'), y: 100 - active.val('s') }, colorMap);
                    colorBar.val('y', 100 - active.val('v'), colorBar);
                    break;
                  case 'r':
                    rgbMap = -1040;
                    rgbBar = -780;
                    colorMap.range('all', { minX: 0, maxX: 255, minY: 0, maxY: 255 });
                    colorBar.range('rangeY', { minY: 0, maxY: 255 });
                    if (active.val('ahex') == null) break;
                    colorMap.val('xy', { x: active.val('b'), y: 255 - active.val('g') }, colorMap);
                    colorBar.val('y', 255 - active.val('r'), colorBar);
                    break;
                  case 'g':
                    rgbMap = -1560;
                    rgbBar = -1820;
                    colorMap.range('all', { minX: 0, maxX: 255, minY: 0, maxY: 255 });
                    colorBar.range('rangeY', { minY: 0, maxY: 255 });
                    if (active.val('ahex') == null) break;
                    colorMap.val('xy', { x: active.val('b'), y: 255 - active.val('r') }, colorMap);
                    colorBar.val('y', 255 - active.val('g'), colorBar);
                    break;
                  case 'b':
                    rgbMap = -2080;
                    rgbBar = -2860;
                    colorMap.range('all', { minX: 0, maxX: 255, minY: 0, maxY: 255 });
                    colorBar.range('rangeY', { minY: 0, maxY: 255 });
                    if (active.val('ahex') == null) break;
                    colorMap.val('xy', { x: active.val('r'), y: 255 - active.val('g') }, colorMap);
                    colorBar.val('y', 255 - active.val('b'), colorBar);
                    break;
                  case 'a':
                    setTimeout(
                      function()
                      {
                        setBG.call($this, colorMapDiv, 'transparent');
                        setImgLoc.call($this, colorMapL1, -260);
                        setImgLoc.call($this, colorMapL2, -520);
                        setImgLoc.call($this, colorBarL1, 260);
                        setImgLoc.call($this, colorBarL2, 260);
                        setAlpha.call($this, colorBarL2, 100);
                        setImgLoc.call($this, colorBarL6, 0);
                        setAlpha.call($this, colorBarL6, 100);
                      }, 0);
                    colorMap.range('all', { minX: 0, maxX: 360, minY: 0, maxY: 100 });
                    colorBar.range('rangeY', { minY: 0, maxY: 255 });
                    if (active.val('ahex') == null) break;
                    colorMap.val('xy', { x: active.val('h'), y: 100 - active.val('v') }, colorMap);
                    colorBar.val('y', 255 - active.val('a'), colorBar);
                    break;
                  default:
                    throw ('Invalid Mode');
                    break;
                }
                switch (colorMode)
                {
                  case 'h':
                    break;
                  case 's':
                  case 'v':
                  case 'a':
                    setTimeout(
                      function()
                      {
                        setAlpha.call($this, colorMapL1, 100);
                        setAlpha.call($this, colorBarL1, 100);
                        setImgLoc.call($this, colorBarL3, 260);
                        setAlpha.call($this, colorBarL3, 100);
                        setImgLoc.call($this, colorBarL4, 260);
                        setAlpha.call($this, colorBarL4, 100);
                      }, 0);
                    break;
                  case 'r':
                  case 'g':
                  case 'b':
                    setTimeout(
                      function()
                      {
                        setBG.call($this, colorMapDiv, 'transparent');
                        setBG.call($this, colorBarDiv, 'transparent');
                        setAlpha.call($this, colorBarL1, 100);
                        setAlpha.call($this, colorMapL1, 100);
                        setImgLoc.call($this, colorMapL1, rgbMap);
                        setImgLoc.call($this, colorMapL2, rgbMap - 260);
                        setImgLoc.call($this, colorBarL1, rgbBar - 780);
                        setImgLoc.call($this, colorBarL2, rgbBar - 520);
                        setImgLoc.call($this, colorBarL3, rgbBar);
                        setImgLoc.call($this, colorBarL4, rgbBar - 260);
                        setImgLoc.call($this, colorBarL6, 260);
                        setAlpha.call($this, colorBarL6, 100);
                      }, 0);
                    break;
                }
                if (active.val('ahex') == null) return;
                activeColorChanged.call($this, active);
              },
            activeColorChanged = // Update color when user changes text values
              function(ui, context)
              {
                if (context == null || (context != colorBar && context != colorMap)) positionMapAndBarArrows.call($this, ui, context);
                setTimeout(
                  function()
                  {
                    updatePreview.call($this, ui);
                    updateMapVisuals.call($this, ui);
                    updateBarVisuals.call($this, ui);
                  }, 0);
              },
            mapValueChanged = // user has dragged the ColorMap pointer
              function(ui, context)
              {
                var active = color.active;
                if (context != colorMap && active.val() == null) return;
                var xy = ui.val('all');
                switch (settings.color.mode)
                {
                  case 'h':
                    active.val('sv', { s: xy.x, v: 100 - xy.y }, context);
                    break;
                  case 's':
                  case 'a':
                    active.val('hv', { h: xy.x, v: 100 - xy.y }, context);
                    break;
                  case 'v':
                    active.val('hs', { h: xy.x, s: 100 - xy.y }, context);
                    break;
                  case 'r':
                    active.val('gb', { g: 255 - xy.y, b: xy.x }, context);
                    break;
                  case 'g':
                    active.val('rb', { r: 255 - xy.y, b: xy.x }, context);
                    break;
                  case 'b':
                    active.val('rg', { r: xy.x, g: 255 - xy.y }, context);
                    break;
                }
              },
            colorBarValueChanged = // user has dragged the ColorBar slider
              function(ui, context)
              {
                var active = color.active;
                if (context != colorBar && active.val() == null) return;
                switch (settings.color.mode)
                {
                  case 'h':
                    active.val('h', { h: 360 - ui.val('y') }, context);
                    break;
                  case 's':
                    active.val('s', { s: 100 - ui.val('y') }, context);
                    break;
                  case 'v':
                    active.val('v', { v: 100 - ui.val('y') }, context);
                    break;
                  case 'r':
                    active.val('r', { r: 255 - ui.val('y') }, context);
                    break;
                  case 'g':
                    active.val('g', { g: 255 - ui.val('y') }, context);
                    break;
                  case 'b':
                    active.val('b', { b: 255 - ui.val('y') }, context);
                    break;
                  case 'a':
                    active.val('a', 255 - ui.val('y'), context);
                    break;
                }
              },
            positionMapAndBarArrows = // position map and bar arrows to match current color
              function(ui, context)
              {
                if (context != colorMap)
                {
                  switch (settings.color.mode)
                  {
                    case 'h':
                      var sv = ui.val('sv');
                      colorMap.val('xy', { x: sv != null ? sv.s : 100, y: 100 - (sv != null ? sv.v : 100) }, context);
                      break;
                    case 's':
                    case 'a':
                      var hv = ui.val('hv');
                      colorMap.val('xy', { x: hv && hv.h || 0, y: 100 - (hv != null ? hv.v : 100) }, context);
                      break;
                    case 'v':
                      var hs = ui.val('hs');
                      colorMap.val('xy', { x: hs && hs.h || 0, y: 100 - (hs != null ? hs.s : 100) }, context);
                      break;
                    case 'r':
                      var bg = ui.val('bg');
                      colorMap.val('xy', { x: bg && bg.b || 0, y: 255 - (bg && bg.g || 0) }, context);
                      break;
                    case 'g':
                      var br = ui.val('br');
                      colorMap.val('xy', { x: br && br.b || 0, y: 255 - (br && br.r || 0) }, context);
                      break;
                    case 'b':
                      var rg = ui.val('rg');
                      colorMap.val('xy', { x: rg && rg.r || 0, y: 255 - (rg && rg.g || 0) }, context);
                      break;
                  }
                }
                if (context != colorBar)
                {
                  switch (settings.color.mode)
                  {
                    case 'h':
                      colorBar.val('y', 360 - (ui.val('h') || 0), context);
                      break;
                    case 's':
                      var s = ui.val('s');
                      colorBar.val('y', 100 - (s != null ? s : 100), context);
                      break;
                    case 'v':
                      var v = ui.val('v');
                      colorBar.val('y', 100 - (v != null ? v : 100), context);
                      break;
                    case 'r':
                      colorBar.val('y', 255 - (ui.val('r') || 0), context);
                      break;
                    case 'g':
                      colorBar.val('y', 255 - (ui.val('g') || 0), context);
                      break;
                    case 'b':
                      colorBar.val('y', 255 - (ui.val('b') || 0), context);
                      break;
                    case 'a':
                      var a = ui.val('a');
                      colorBar.val('y', 255 - (a != null ? a : 255), context);
                      break;
                  }
                }
              },
            updatePreview =
              function(ui)
              {
                try
                {
                  var all = ui.val('all');
                  activePreview.css({ backgroundColor: all && '#' + all.hex || 'transparent' });
                  setAlpha.call($this, activePreview, all && Math.precision((all.a * 100) / 255, 4) || 0);
                }
                catch (e) { }
              },
            updateMapVisuals =
              function(ui)
              {
                switch (settings.color.mode)
                {
                  case 'h':
                    setBG.call($this, colorMapDiv, new Color({ h: ui.val('h') || 0, s: 100, v: 100 }).val('hex'));
                    break;
                  case 's':
                  case 'a':
                    var s = ui.val('s');
                    setAlpha.call($this, colorMapL2, 100 - (s != null ? s : 100));
                    break;
                  case 'v':
                    var v = ui.val('v');
                    setAlpha.call($this, colorMapL1, v != null ? v : 100);
                    break;
                  case 'r':
                    setAlpha.call($this, colorMapL2, Math.precision((ui.val('r') || 0) / 255 * 100, 4));
                    break;
                  case 'g':
                    setAlpha.call($this, colorMapL2, Math.precision((ui.val('g') || 0) / 255 * 100, 4));
                    break;
                  case 'b':
                    setAlpha.call($this, colorMapL2, Math.precision((ui.val('b') || 0) / 255 * 100));
                    break;
                }
                var a = ui.val('a');
                setAlpha.call($this, colorMapL3, Math.precision(((255 - (a || 0)) * 100) / 255, 4));
              },
            updateBarVisuals =
              function(ui)
              {
                switch (settings.color.mode)
                {
                  case 'h':
                    var a = ui.val('a');
                    setAlpha.call($this, colorBarL5, Math.precision(((255 - (a || 0)) * 100) / 255, 4));
                    break;
                  case 's':
                    var hva = ui.val('hva'),
                        saturatedColor = new Color({ h: hva && hva.h || 0, s: 100, v: hva != null ? hva.v : 100 });
                    setBG.call($this, colorBarDiv, saturatedColor.val('hex'));
                    setAlpha.call($this, colorBarL2, 100 - (hva != null ? hva.v : 100));
                    setAlpha.call($this, colorBarL5, Math.precision(((255 - (hva && hva.a || 0)) * 100) / 255, 4));
                    break;
                  case 'v':
                    var hsa = ui.val('hsa'),
                        valueColor = new Color({ h: hsa && hsa.h || 0, s: hsa != null ? hsa.s : 100, v: 100 });
                    setBG.call($this, colorBarDiv, valueColor.val('hex'));
                    setAlpha.call($this, colorBarL5, Math.precision(((255 - (hsa && hsa.a || 0)) * 100) / 255, 4));
                    break;
                  case 'r':
                  case 'g':
                  case 'b':
                    var hValue = 0, vValue = 0, rgba = ui.val('rgba');
                    if (settings.color.mode == 'r')
                    {
                      hValue = rgba && rgba.b || 0;
                      vValue = rgba && rgba.g || 0;
                    }
                    else if (settings.color.mode == 'g')
                    {
                      hValue = rgba && rgba.b || 0;
                      vValue = rgba && rgba.r || 0;
                    }
                    else if (settings.color.mode == 'b')
                    {
                      hValue = rgba && rgba.r || 0;
                      vValue = rgba && rgba.g || 0;
                    }
                    var middle = vValue > hValue ? hValue : vValue;
                    setAlpha.call($this, colorBarL2, hValue > vValue ? Math.precision(((hValue - vValue) / (255 - vValue)) * 100, 4) : 0);
                    setAlpha.call($this, colorBarL3, vValue > hValue ? Math.precision(((vValue - hValue) / (255 - hValue)) * 100, 4) : 0);
                    setAlpha.call($this, colorBarL4, Math.precision((middle / 255) * 100, 4));
                    setAlpha.call($this, colorBarL5, Math.precision(((255 - (rgba && rgba.a || 0)) * 100) / 255, 4));
                    break;
                  case 'a':
                    var a = ui.val('a');
                    setBG.call($this, colorBarDiv, ui.val('hex') || '000000');
                    setAlpha.call($this, colorBarL5, a != null ? 0 : 100);
                    setAlpha.call($this, colorBarL6, a != null ? 100 : 0);
                    break;
                }
              },
            setBG =
              function(el, c)
              {
                el.css({ backgroundColor: c && c.length == 6 && '#' + c || 'transparent' });
              },
            setImg =
              function(img, src)
              {
                if (isLessThanIE7 && (src.indexOf('AlphaBar.png') != -1 || src.indexOf('Bars.png') != -1 || src.indexOf('Maps.png') != -1))
                {
                  img.attr('pngSrc', src);
                  img.css({ backgroundImage: 'none', filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\', sizingMethod=\'scale\')' });
                }
                else img.css({ backgroundImage: 'url(\'' + src + '\')' });
              },
            setImgLoc =
              function(img, y)
              {
                img.css({ top: y + 'px' });
              },
            setAlpha =
              function(obj, alpha)
              {
                obj.css({ visibility: alpha > 0 ? 'visible' : 'hidden' });
                if (alpha > 0 && alpha < 100)
                {
                  if (isLessThanIE7)
                  {
                    var src = obj.attr('pngSrc');
                    if (src != null && (src.indexOf('AlphaBar.png') != -1 || src.indexOf('Bars.png') != -1 || src.indexOf('Maps.png') != -1))
                      obj.css({ filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\', sizingMethod=\'scale\') progid:DXImageTransform.Microsoft.Alpha(opacity=' + alpha + ')' });
                    else obj.css({ opacity: Math.precision(alpha / 100, 4) });
                  }
                  else obj.css({ opacity: Math.precision(alpha / 100, 4) });
                }
                else if (alpha == 0 || alpha == 100)
                {
                  if (isLessThanIE7)
                  {
                    var src = obj.attr('pngSrc');
                    if (src != null && (src.indexOf('AlphaBar.png') != -1 || src.indexOf('Bars.png') != -1 || src.indexOf('Maps.png') != -1))
                      obj.css({ filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + src + '\', sizingMethod=\'scale\')' });
                    else obj.css({ opacity: '' });
                  }
                  else obj.css({ opacity: '' });
                }
              },
            revertColor = // revert color to original color when opened
              function()
              {
                color.active.val('ahex', color.current.val('ahex'));
              },
            commitColor = // commit the color changes
              function()
              {
                color.current.val('ahex', color.active.val('ahex'));
              },
            radioClicked =
              function(e)
              {
                $(this).parents('tbody:first').find('input:radio[value!="'+e.target.value+'"]').removeAttr('checked');
                setColorMode.call($this, e.target.value);
              },
            currentClicked =
              function()
              {
                revertColor.call($this);
              },
            cancelClicked =
              function()
              {
                revertColor.call($this);
                settings.window.expandable && hide.call($this);
                $.isFunction(cancelCallback) && cancelCallback.call($this, color.active, cancelButton);
              },
            okClicked =
              function()
              {
                commitColor.call($this);
                settings.window.expandable && hide.call($this);
                $.isFunction(commitCallback) && commitCallback.call($this, color.active, okButton);
              },
            iconImageClicked =
              function()
              {
                show.call($this);
              },
            currentColorChanged =
              function(ui, context)
              {
                var hex = ui.val('hex');
                currentPreview.css({ backgroundColor: hex && '#' + hex || 'transparent' });
                setAlpha.call($this, currentPreview, Math.precision(((ui.val('a') || 0) * 100) / 255, 4));
              },
            expandableColorChanged =
              function(ui, context)
              {
                var hex = ui.val('hex');
                var va = ui.val('va');
                iconColor.css({ backgroundColor: hex && '#' + hex || 'transparent' });
                setAlpha.call($this, iconAlpha, Math.precision(((255 - (va && va.a || 0)) * 100) / 255, 4));
                if (settings.window.bindToInput&&settings.window.updateInputColor)
                  settings.window.input.css(
                    {
                      backgroundColor: hex && '#' + hex || 'transparent',
                      color: va == null || va.v > 75 ? '#000000' : '#ffffff'
                    });
              },
            moveBarMouseDown =
              function(e)
              {
                var element = settings.window.element, // local copies for YUI compressor
                  page = settings.window.page;
                elementStartX = parseInt(container.css('left'));
                elementStartY = parseInt(container.css('top'));
                pageStartX = e.pageX;
                pageStartY = e.pageY;
                // bind events to document to move window - we will unbind these on mouseup
                $(document).bind('mousemove', documentMouseMove).bind('mouseup', documentMouseUp);
                e.preventDefault(); // prevent attempted dragging of the column
              },
            documentMouseMove =
              function(e)
              {
                container.css({ left: elementStartX - (pageStartX - e.pageX) + 'px', top: elementStartY - (pageStartY - e.pageY) + 'px' });
                if (settings.window.expandable && !$.support.boxModel) container.prev().css({ left: container.css("left"), top: container.css("top") });
                e.stopPropagation();
                e.preventDefault();
                return false;
              },
            documentMouseUp =
              function(e)
              {
                $(document).unbind('mousemove', documentMouseMove).unbind('mouseup', documentMouseUp);
                e.stopPropagation();
                e.preventDefault();
                return false;
              },
            quickPickClicked =
              function(e)
              {
                e.preventDefault();
                e.stopPropagation();
                color.active.val('ahex', $(this).attr('title') || null, e.target);
                return false;
              },
            commitCallback = $.isFunction($arguments[1]) && $arguments[1] || null,
            liveCallback = $.isFunction($arguments[2]) && $arguments[2] || null,
            cancelCallback = $.isFunction($arguments[3]) && $arguments[3] || null,
            show =
              function()
              {
                color.current.val('ahex', color.active.val('ahex'));
                var attachIFrame = function()
                  {
                    if (!settings.window.expandable || $.support.boxModel) return;
                    var table = container.find('table:first');
                    container.before('<iframe/>');
                    container.prev().css({ width: table.width(), height: container.height(), opacity: 0, position: 'absolute', left: container.css("left"), top: container.css("top") });
                  };
                if (settings.window.expandable)
                {
                  $(document.body).children('div.jPicker.Container').css({zIndex:10});
                  container.css({zIndex:20});
                }
                switch (settings.window.effects.type)
                {
                  case 'fade':
                    container.fadeIn(settings.window.effects.speed.show, attachIFrame);
                    break;
                  case 'slide':
                    container.slideDown(settings.window.effects.speed.show, attachIFrame);
                    break;
                  case 'show':
                  default:
                    container.show(settings.window.effects.speed.show, attachIFrame);
                    break;
                }
              },
            hide =
              function()
              {
                var removeIFrame = function()
                  {
                    if (settings.window.expandable) container.css({ zIndex: 10 });
                    if (!settings.window.expandable || $.support.boxModel) return;
                    container.prev().remove();
                  };
                switch (settings.window.effects.type)
                {
                  case 'fade':
                    container.fadeOut(settings.window.effects.speed.hide, removeIFrame);
                    break;
                  case 'slide':
                    container.slideUp(settings.window.effects.speed.hide, removeIFrame);
                    break;
                  case 'show':
                  default:
                    container.hide(settings.window.effects.speed.hide, removeIFrame);
                    break;
                }
              },
            initialize =
              function()
              {
                var win = settings.window,
                    popup = win.expandable ? $($this).next().find('.Container:first') : null;
                container = win.expandable ? $('<div/>') : $($this);
                container.addClass('jPicker Container');
                if (win.expandable) container.hide();
                container.get(0).onselectstart = function(event){ if (event.target.nodeName.toLowerCase() !== 'input') return false; };
                // inject html source code - we are using a single table for this control - I know tables are considered bad, but it takes care of equal height columns and
                // this control really is tabular data, so I believe it is the right move
                var all = color.active.val('all');
                if (win.alphaPrecision < 0) win.alphaPrecision = 0;
                else if (win.alphaPrecision > 2) win.alphaPrecision = 2;
                var controlHtml='<table class="jPicker" cellpadding="0" cellspacing="0"><tbody>' + (win.expandable ? '<tr><td class="Move" colspan="5">&nbsp;</td></tr>' : '') + '<tr><td rowspan="9"><h2 class="Title">' + (win.title || localization.text.title) + '</h2><div class="Map"><span class="Map1">&nbsp;</span><span class="Map2">&nbsp;</span><span class="Map3">&nbsp;</span><img src="' + images.clientPath + images.colorMap.arrow.file + '" class="Arrow"/></div></td><td rowspan="9"><div class="Bar"><span class="Map1">&nbsp;</span><span class="Map2">&nbsp;</span><span class="Map3">&nbsp;</span><span class="Map4">&nbsp;</span><span class="Map5">&nbsp;</span><span class="Map6">&nbsp;</span><img src="' + images.clientPath + images.colorBar.arrow.file + '" class="Arrow"/></div></td><td colspan="2" class="Preview">' + localization.text.newColor + '<div><span class="Active" title="' + localization.tooltips.colors.newColor + '">&nbsp;</span><span class="Current" title="' + localization.tooltips.colors.currentColor + '">&nbsp;</span></div>' + localization.text.currentColor + '</td><td rowspan="9" class="Button"><input type="button" class="Ok" value="' + localization.text.ok + '" title="' + localization.tooltips.buttons.ok + '"/><input type="button" class="Cancel" value="' + localization.text.cancel + '" title="' + localization.tooltips.buttons.cancel + '"/><hr/><div class="Grid">&nbsp;</div></td></tr><tr class="Hue"><td class="Radio"><label title="' + localization.tooltips.hue.radio + '"><input type="radio" value="h"' + (settings.color.mode == 'h' ? ' checked="checked"' : '') + '/>H:</label></td><td class="Text"><input type="text" maxlength="3" value="' + (all != null ? all.h : '') + '" title="' + localization.tooltips.hue.textbox + '"/>&nbsp;&deg;</td></tr><tr class="Saturation"><td class="Radio"><label title="' + localization.tooltips.saturation.radio + '"><input type="radio" value="s"' + (settings.color.mode == 's' ? ' checked="checked"' : '') + '/>S:</label></td><td class="Text"><input type="text" maxlength="3" value="' + (all != null ? all.s : '') + '" title="' + localization.tooltips.saturation.textbox + '"/>&nbsp;%</td></tr><tr class="Value"><td class="Radio"><label title="' + localization.tooltips.value.radio + '"><input type="radio" value="v"' + (settings.color.mode == 'v' ? ' checked="checked"' : '') + '/>V:</label><br/><br/></td><td class="Text"><input type="text" maxlength="3" value="' + (all != null ? all.v : '') + '" title="' + localization.tooltips.value.textbox + '"/>&nbsp;%<br/><br/></td></tr><tr class="Red"><td class="Radio"><label title="' + localization.tooltips.red.radio + '"><input type="radio" value="r"' + (settings.color.mode == 'r' ? ' checked="checked"' : '') + '/>R:</label></td><td class="Text"><input type="text" maxlength="3" value="' + (all != null ? all.r : '') + '" title="' + localization.tooltips.red.textbox + '"/></td></tr><tr class="Green"><td class="Radio"><label title="' + localization.tooltips.green.radio + '"><input type="radio" value="g"' + (settings.color.mode == 'g' ? ' checked="checked"' : '') + '/>G:</label></td><td class="Text"><input type="text" maxlength="3" value="' + (all != null ? all.g : '') + '" title="' + localization.tooltips.green.textbox + '"/></td></tr><tr class="Blue"><td class="Radio"><label title="' + localization.tooltips.blue.radio + '"><input type="radio" value="b"' + (settings.color.mode == 'b' ? ' checked="checked"' : '') + '/>B:</label></td><td class="Text"><input type="text" maxlength="3" value="' + (all != null ? all.b : '') + '" title="' + localization.tooltips.blue.textbox + '"/></td></tr><tr class="Alpha"><td class="Radio">' + (win.alphaSupport ? '<label title="' + localization.tooltips.alpha.radio + '"><input type="radio" value="a"' + (settings.color.mode == 'a' ? ' checked="checked"' : '') + '/>A:</label>' : '&nbsp;') + '</td><td class="Text">' + (win.alphaSupport ? '<input type="text" maxlength="' + (3 + win.alphaPrecision) + '" value="' + (all != null ? Math.precision((all.a * 100) / 255, win.alphaPrecision) : '') + '" title="' + localization.tooltips.alpha.textbox + '"/>&nbsp;%' : '&nbsp;') + '</td></tr><tr class="Hex"><td colspan="2" class="Text"><label title="' + localization.tooltips.hex.textbox + '">#:<input type="text" maxlength="6" class="Hex" value="' + (all != null ? all.hex : '') + '"/></label>' + (win.alphaSupport ? '<input type="text" maxlength="2" class="AHex" value="' + (all != null ? all.ahex.substring(6) : '') + '" title="' + localization.tooltips.hex.alpha + '"/></td>' : '&nbsp;') + '</tr></tbody></table>';
                if (win.expandable)
                {
                  container.html(controlHtml);
                  if($(document.body).children('div.jPicker.Container').length==0)$(document.body).prepend(container);
                  else $(document.body).children('div.jPicker.Container:last').after(container);
                  container.mousedown(
                    function()
                    {
                      $(document.body).children('div.jPicker.Container').css({zIndex:10});
                      container.css({zIndex:20});
                    });
                  container.css( // positions must be set and display set to absolute before source code injection or IE will size the container to fit the window
                    {
                      left:
                        win.position.x == 'left' ? (popup.offset().left - 530 - (win.position.y == 'center' ? 25 : 0)) + 'px' :
                        win.position.x == 'center' ? (popup.offset().left - 260) + 'px' :
                        win.position.x == 'right' ? (popup.offset().left - 10 + (win.position.y == 'center' ? 25 : 0)) + 'px' :
                        win.position.x == 'screenCenter' ? (($(document).width() >> 1) - 260) + 'px' : (popup.offset().left + parseInt(win.position.x)) + 'px',
                      position: 'absolute',
                      top: win.position.y == 'top' ? (popup.offset().top - 312) + 'px' :
                           win.position.y == 'center' ? (popup.offset().top - 156) + 'px' :
                           win.position.y == 'bottom' ? (popup.offset().top + 25) + 'px' : (popup.offset().top + parseInt(win.position.y)) + 'px'
                    });
                }
                else
                {
                  container = $($this);
                  container.html(controlHtml);
                }
                // initialize the objects to the source code just injected
                var tbody = container.find('tbody:first');
                colorMapDiv = tbody.find('div.Map:first');
                colorBarDiv = tbody.find('div.Bar:first');
                var MapMaps = colorMapDiv.find('span'),
                    BarMaps = colorBarDiv.find('span');
                colorMapL1 = MapMaps.filter('.Map1:first');
                colorMapL2 = MapMaps.filter('.Map2:first');
                colorMapL3 = MapMaps.filter('.Map3:first');
                colorBarL1 = BarMaps.filter('.Map1:first');
                colorBarL2 = BarMaps.filter('.Map2:first');
                colorBarL3 = BarMaps.filter('.Map3:first');
                colorBarL4 = BarMaps.filter('.Map4:first');
                colorBarL5 = BarMaps.filter('.Map5:first');
                colorBarL6 = BarMaps.filter('.Map6:first');
                // create color pickers and maps
                colorMap = new Slider(colorMapDiv,
                  {
                    map:
                    {
                      width: images.colorMap.width,
                      height: images.colorMap.height
                    },
                    arrow:
                    {
                      image: images.clientPath + images.colorMap.arrow.file,
                      width: images.colorMap.arrow.width,
                      height: images.colorMap.arrow.height
                    }
                  });
                colorMap.bind(mapValueChanged);
                colorBar = new Slider(colorBarDiv,
                  {
                    map:
                    {
                      width: images.colorBar.width,
                      height: images.colorBar.height
                    },
                    arrow:
                    {
                      image: images.clientPath + images.colorBar.arrow.file,
                      width: images.colorBar.arrow.width,
                      height: images.colorBar.arrow.height
                    }
                  });
                colorBar.bind(colorBarValueChanged);
                colorPicker = new ColorValuePicker(tbody, color.active, win.expandable && win.bindToInput ? win.input : null, win.alphaPrecision);
                var hex = all != null ? all.hex : null,
                    preview = tbody.find('.Preview'),
                    button = tbody.find('.Button');
                activePreview = preview.find('.Active:first').css({ backgroundColor: hex && '#' + hex || 'transparent' });
                currentPreview = preview.find('.Current:first').css({ backgroundColor: hex && '#' + hex || 'transparent' }).bind('click', currentClicked);
                setAlpha.call($this, currentPreview, Math.precision(color.current.val('a') * 100) / 255, 4);
                okButton = button.find('.Ok:first').bind('click', okClicked);
                cancelButton = button.find('.Cancel:first').bind('click', cancelClicked);
                grid = button.find('.Grid:first');
                setTimeout(
                  function()
                  {
                    setImg.call($this, colorMapL1, images.clientPath + 'Maps.png');
                    setImg.call($this, colorMapL2, images.clientPath + 'Maps.png');
                    setImg.call($this, colorMapL3, images.clientPath + 'map-opacity.png');
                    setImg.call($this, colorBarL1, images.clientPath + 'Bars.png');
                    setImg.call($this, colorBarL2, images.clientPath + 'Bars.png');
                    setImg.call($this, colorBarL3, images.clientPath + 'Bars.png');
                    setImg.call($this, colorBarL4, images.clientPath + 'Bars.png');
                    setImg.call($this, colorBarL5, images.clientPath + 'bar-opacity.png');
                    setImg.call($this, colorBarL6, images.clientPath + 'AlphaBar.png');
                    setImg.call($this, preview.find('div:first'), images.clientPath + 'preview-opacity.png');
                  }, 0);
                tbody.find('td.Radio input').bind('click', radioClicked);
                // initialize quick list
                if (color.quickList && color.quickList.length > 0)
                {
                  var html = '';
                  for (i = 0; i < color.quickList.length; i++)
                  {
                    /* if default colors are hex strings, change them to color objects */
                    if ((typeof (color.quickList[i])).toString().toLowerCase() == 'string') color.quickList[i] = new Color({ hex: color.quickList[i] });
                    var alpha = color.quickList[i].val('a');
                    var ahex = color.quickList[i].val('ahex');
                    if (!win.alphaSupport && ahex) ahex = ahex.substring(0, 6) + 'ff';
                    var quickHex = color.quickList[i].val('hex');
                    html+='<span class="QuickColor"' + (ahex && ' title="#' + ahex + '"' || '') + ' style="background-color:' + (quickHex && '#' + quickHex || '') + ';' + (quickHex ? '' : 'background-image:url(' + images.clientPath + 'NoColor.png)') + (win.alphaSupport && alpha && alpha < 255 ? ';opacity:' + Math.precision(alpha / 255, 4) + ';filter:Alpha(opacity=' + Math.precision(alpha / 2.55, 4) + ')' : '') + '">&nbsp;</span>';
                  }
                  setImg.call($this, grid, images.clientPath + 'bar-opacity.png');
                  grid.html(html);
                  grid.find('.QuickColor').click(quickPickClicked);
                }
                setColorMode.call($this, settings.color.mode);
                color.active.bind(activeColorChanged);
                $.isFunction(liveCallback) && color.active.bind(liveCallback);
                color.current.bind(currentColorChanged);
                // bind to input
                if (win.expandable)
                {
                  $this.icon = popup.parents('.Icon:first');
                  iconColor = $this.icon.find('.Color:first').css({ backgroundColor: hex && '#' + hex || 'transparent' });
                  iconAlpha = $this.icon.find('.Alpha:first');
                  setImg.call($this, iconAlpha, images.clientPath + 'bar-opacity.png');
                  setAlpha.call($this, iconAlpha, Math.precision(((255 - (all != null ? all.a : 0)) * 100) / 255, 4));
                  iconImage = $this.icon.find('.Image:first').css(
                    {
                      backgroundImage: 'url(\'' + images.clientPath + images.picker.file + '\')'
                    }).bind('click', iconImageClicked);
                  if (win.bindToInput&&win.updateInputColor)
                    win.input.css(
                      {
                        backgroundColor: hex && '#' + hex || 'transparent',
                        color: all == null || all.v > 75 ? '#000000' : '#ffffff'
                      });
                  moveBar = tbody.find('.Move:first').bind('mousedown', moveBarMouseDown);
                  color.active.bind(expandableColorChanged);
                }
                else show.call($this);
              },
            destroy =
              function()
              {
                container.find('td.Radio input').unbind('click', radioClicked);
                currentPreview.unbind('click', currentClicked);
                cancelButton.unbind('click', cancelClicked);
                okButton.unbind('click', okClicked);
                if (settings.window.expandable)
                {
                  iconImage.unbind('click', iconImageClicked);
                  moveBar.unbind('mousedown', moveBarMouseDown);
                  $this.icon = null;
                }
                container.find('.QuickColor').unbind('click', quickPickClicked);
                colorMapDiv = null;
                colorBarDiv = null;
                colorMapL1 = null;
                colorMapL2 = null;
                colorMapL3 = null;
                colorBarL1 = null;
                colorBarL2 = null;
                colorBarL3 = null;
                colorBarL4 = null;
                colorBarL5 = null;
                colorBarL6 = null;
                colorMap.destroy();
                colorMap = null;
                colorBar.destroy();
                colorBar = null;
                colorPicker.destroy();
                colorPicker = null;
                activePreview = null;
                currentPreview = null;
                okButton = null;
                cancelButton = null;
                grid = null;
                commitCallback = null;
                cancelCallback = null;
                liveCallback = null;
                container.html('');
                for (i = 0; i < List.length; i++) if (List[i] == $this) List.splice(i, 1);
              },
            images = settings.images, // local copies for YUI compressor
            localization = settings.localization,
            color =
              {
                active: (typeof(settings.color.active)).toString().toLowerCase() == 'string' ? new Color({ ahex: !settings.window.alphaSupport && settings.color.active ? settings.color.active.substring(0, 6) + 'ff' : settings.color.active }) : new Color({ ahex: !settings.window.alphaSupport && settings.color.active.val('ahex') ? settings.color.active.val('ahex').substring(0, 6) + 'ff' : settings.color.active.val('ahex') }),
                current: (typeof(settings.color.active)).toString().toLowerCase() == 'string' ? new Color({ ahex: !settings.window.alphaSupport && settings.color.active ? settings.color.active.substring(0, 6) + 'ff' : settings.color.active }) : new Color({ ahex: !settings.window.alphaSupport && settings.color.active.val('ahex') ? settings.color.active.val('ahex').substring(0, 6) + 'ff' : settings.color.active.val('ahex') }),
                quickList: settings.color.quickList
              };
          $.extend(true, $this, // public properties, methods, and callbacks
            {
              commitCallback: commitCallback, // commitCallback function can be overridden to return the selected color to a method you specify when the user clicks "OK"
              liveCallback: liveCallback, // liveCallback function can be overridden to return the selected color to a method you specify in live mode (continuous update)
              cancelCallback: cancelCallback, // cancelCallback function can be overridden to a method you specify when the user clicks "Cancel"
              color: color,
              show: show,
              hide: hide,
              destroy: destroy // destroys this control entirely, removing all events and objects, and removing itself from the List
            });
          List.push($this);
          setTimeout(
            function()
            {
              initialize.call($this);
            }, 0);
        });
    };
  $.fn.jPicker.defaults = /* jPicker defaults - you can change anything in this section (such as the clientPath to your images) without fear of breaking the program */
      {
      window:
        {
          title: null, /* any title for the jPicker window itself - displays "Drag Markers To Pick A Color" if left null */
          effects:
          {
            type: 'slide', /* effect used to show/hide an expandable picker. Acceptable values "slide", "show", "fade" */
            speed:
            {
              show: 'slow', /* duration of "show" effect. Acceptable values are "fast", "slow", or time in ms */
              hide: 'fast' /* duration of "hide" effect. Acceptable values are "fast", "slow", or time in ms */
            }
          },
          position:
          {
            x: 'screenCenter', /* acceptable values "left", "center", "right", "screenCenter", or relative px value */
            y: 'top' /* acceptable values "top", "bottom", "center", or relative px value */
          },
          expandable: false, /* default to large static picker - set to true to make an expandable picker (small icon with popup) - set automatically when binded to input element */
          liveUpdate: true, /* set false if you want the user to have to click "OK" before the binded input box updates values (always "true" for expandable picker) */
          alphaSupport: false, /* set to true to enable alpha picking */
          alphaPrecision: 0, /* set decimal precision for alpha percentage display - hex codes do not map directly to percentage integers - range 0-2 */
          updateInputColor: true /* set to false to prevent binded input colors from changing */
        },
      color:
        {
          mode: 'h', /* acceptabled values "h" (hue), "s" (saturation), "v" (value), "r" (red), "g" (green), "b" (blue), "a" (alpha) */
          active: new Color({ ahex: '#ffcc00ff' }), /* acceptable values are any declared $.jPicker.Color object or string HEX value (e.g. #ffc000) WITH OR WITHOUT the "#" prefix */
          quickList: /* the quick pick color list */
            [
              new Color({ h: 360, s: 33, v: 100 }), /* acceptable values are any declared $.jPicker.Color object or string HEX value (e.g. #ffc000) WITH OR WITHOUT the "#" prefix */
              new Color({ h: 360, s: 66, v: 100 }),
              new Color({ h: 360, s: 100, v: 100 }),
              new Color({ h: 360, s: 100, v: 75 }),
              new Color({ h: 360, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 100 }),
              new Color({ h: 30, s: 33, v: 100 }),
              new Color({ h: 30, s: 66, v: 100 }),
              new Color({ h: 30, s: 100, v: 100 }),
              new Color({ h: 30, s: 100, v: 75 }),
              new Color({ h: 30, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 90 }),
              new Color({ h: 60, s: 33, v: 100 }),
              new Color({ h: 60, s: 66, v: 100 }),
              new Color({ h: 60, s: 100, v: 100 }),
              new Color({ h: 60, s: 100, v: 75 }),
              new Color({ h: 60, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 80 }),
              new Color({ h: 90, s: 33, v: 100 }),
              new Color({ h: 90, s: 66, v: 100 }),
              new Color({ h: 90, s: 100, v: 100 }),
              new Color({ h: 90, s: 100, v: 75 }),
              new Color({ h: 90, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 70 }),
              new Color({ h: 120, s: 33, v: 100 }),
              new Color({ h: 120, s: 66, v: 100 }),
              new Color({ h: 120, s: 100, v: 100 }),
              new Color({ h: 120, s: 100, v: 75 }),
              new Color({ h: 120, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 60 }),
              new Color({ h: 150, s: 33, v: 100 }),
              new Color({ h: 150, s: 66, v: 100 }),
              new Color({ h: 150, s: 100, v: 100 }),
              new Color({ h: 150, s: 100, v: 75 }),
              new Color({ h: 150, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 50 }),
              new Color({ h: 180, s: 33, v: 100 }),
              new Color({ h: 180, s: 66, v: 100 }),
              new Color({ h: 180, s: 100, v: 100 }),
              new Color({ h: 180, s: 100, v: 75 }),
              new Color({ h: 180, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 40 }),
              new Color({ h: 210, s: 33, v: 100 }),
              new Color({ h: 210, s: 66, v: 100 }),
              new Color({ h: 210, s: 100, v: 100 }),
              new Color({ h: 210, s: 100, v: 75 }),
              new Color({ h: 210, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 30 }),
              new Color({ h: 240, s: 33, v: 100 }),
              new Color({ h: 240, s: 66, v: 100 }),
              new Color({ h: 240, s: 100, v: 100 }),
              new Color({ h: 240, s: 100, v: 75 }),
              new Color({ h: 240, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 20 }),
              new Color({ h: 270, s: 33, v: 100 }),
              new Color({ h: 270, s: 66, v: 100 }),
              new Color({ h: 270, s: 100, v: 100 }),
              new Color({ h: 270, s: 100, v: 75 }),
              new Color({ h: 270, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 10 }),
              new Color({ h: 300, s: 33, v: 100 }),
              new Color({ h: 300, s: 66, v: 100 }),
              new Color({ h: 300, s: 100, v: 100 }),
              new Color({ h: 300, s: 100, v: 75 }),
              new Color({ h: 300, s: 100, v: 50 }),
              new Color({ h: 180, s: 0, v: 0 }),
              new Color({ h: 330, s: 33, v: 100 }),
              new Color({ h: 330, s: 66, v: 100 }),
              new Color({ h: 330, s: 100, v: 100 }),
              new Color({ h: 330, s: 100, v: 75 }),
              new Color({ h: 330, s: 100, v: 50 }),
              new Color()
            ]
        },
      images:
        {
          clientPath: 'img/jpicker/', /* Path to image files */
          colorMap:
          {
            width: 256,
            height: 256,
            arrow:
            {
              file: 'mappoint.gif', /* ColorMap arrow icon */
              width: 15,
              height: 15
            }
          },
          colorBar:
          {
            width: 20,
            height: 256,
            arrow:
            {
              file: 'rangearrows.gif', /* ColorBar arrow icon */
              width: 20,
              height: 7
            }
          },
          picker:
          {
            file: 'picker.gif', /* Color Picker icon */
            width: 25,
            height: 24
          }
        },
      localization: /* alter these to change the text presented by the picker (e.g. different language) */
        {
          text:
          {
            title: 'Drag Markers To Pick A Color',
            newColor: 'new',
            currentColor: 'current',
            ok: 'OK',
            cancel: 'Cancel'
          },
          tooltips:
          {
            colors:
            {
              newColor: 'New Color - Press &ldquo;OK&rdquo; To Commit',
              currentColor: 'Click To Revert To Original Color'
            },
            buttons:
            {
              ok: 'Commit To This Color Selection',
              cancel: 'Cancel And Revert To Original Color'
            },
            hue:
            {
              radio: 'Set To &ldquo;Hue&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Hue&rdquo; Value (0-360&deg;)'
            },
            saturation:
            {
              radio: 'Set To &ldquo;Saturation&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Saturation&rdquo; Value (0-100%)'
            },
            value:
            {
              radio: 'Set To &ldquo;Value&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Value&rdquo; Value (0-100%)'
            },
            red:
            {
              radio: 'Set To &ldquo;Red&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Red&rdquo; Value (0-255)'
            },
            green:
            {
              radio: 'Set To &ldquo;Green&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Green&rdquo; Value (0-255)'
            },
            blue:
            {
              radio: 'Set To &ldquo;Blue&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Blue&rdquo; Value (0-255)'
            },
            alpha:
            {
              radio: 'Set To &ldquo;Alpha&rdquo; Color Mode',
              textbox: 'Enter A &ldquo;Alpha&rdquo; Value (0-100)'
            },
            hex:
            {
              textbox: 'Enter A &ldquo;Hex&rdquo; Color Value (#000000-#ffffff)',
              alpha: 'Enter A &ldquo;Alpha&rdquo; Value (#00-#ff)'
            }
          }
        }
    };
})(jQuery, '1.1.6');

/*
 * JavaScript Linkify - v0.3 - 6/27/2009
 * http://benalman.com/projects/javascript-linkify/
 * 
 * Copyright (c) 2009 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 * 
 * Some regexps adapted from http://userscripts.org/scripts/review/7122
 */
window.linkify=(function(){var k="[a-z\\d.-]+://",h="(?:(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])",c="(?:(?:[^\\s!@#$%^&*()_=+[\\]{}\\\\|;:'\",.<>/?]+)\\.)+",n="(?:ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)",f="(?:"+c+n+"|"+h+")",o="(?:[;/][^#?<>\\s]*)?",e="(?:\\?[^#<>\\s]*)?(?:#[^<>\\s]*)?",d="\\b"+k+"[^<>\\s]+",a="\\b"+f+o+e+"(?!\\w)",m="mailto:",j="(?:"+m+")?[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@"+f+e+"(?!\\w)",l=new RegExp("(?:"+d+"|"+a+"|"+j+")","ig"),g=new RegExp("^"+k,"i"),b={"'":"`",">":"<",")":"(","]":"[","}":"{","B;":"B+","b:":"b9"},i={callback:function(q,p){return p?'<a href="'+p+'" title="'+p+'">'+q+"</a>":q},punct_regexp:/(?:[!?.,:;'"]|(?:&|&amp;)(?:lt|gt|quot|apos|raquo|laquo|rsaquo|lsaquo);)$/};return function(u,z){z=z||{};var w,v,A,p,x="",t=[],s,E,C,y,q,D,B,r;for(v in i){if(z[v]===undefined){z[v]=i[v]}}while(w=l.exec(u)){A=w[0];E=l.lastIndex;C=E-A.length;if(/[\/:]/.test(u.charAt(C-1))){continue}do{y=A;r=A.substr(-1);B=b[r];if(B){q=A.match(new RegExp("\\"+B+"(?!$)","g"));D=A.match(new RegExp("\\"+r,"g"));if((q?q.length:0)<(D?D.length:0)){A=A.substr(0,A.length-1);E--}}if(z.punct_regexp){A=A.replace(z.punct_regexp,function(F){E-=F.length;return""})}}while(A.length&&A!==y);p=A;if(!g.test(p)){p=(p.indexOf("@")!==-1?(!p.indexOf(m)?"":m):!p.indexOf("irc.")?"irc://":!p.indexOf("ftp.")?"ftp://":"http://")+p}if(s!=C){t.push([u.slice(s,C)]);s=E}t.push([A,p])}t.push([u.substr(s)]);for(v=0;v<t.length;v++){x+=z.callback.apply(window,t[v])}return x||u}})();

if (!window.SyntaxHighlighter) {
    var SyntaxHighlighter = function () {
        var a = {
            defaults: {
                "class-name": "",
                "first-line": 1,
                highlight: null,
                "smart-tabs": true,
                "tab-size": 4,
                ruler: false,
                gutter: true,
                toolbar: true,
                collapse: false,
                "auto-links": true,
                light: false,
                "wrap-lines": true
            },
            config: {
                clipboardSwf: null,
                toolbarItemWidth: 16,
                toolbarItemHeight: 16,
                bloggerMode: false,
                stripBrs: false,
                tagName: "pre",
                strings: {
                    expandSource: "expand source",
                    viewSource: "view source",
                    copyToClipboard: "copy to clipboard",
                    copyToClipboardConfirmation: "The code is in your clipboard now",
                    print: "print",
                    help: "?",
                    alert: "SyntaxHighlighter\n\n",
                    noBrush: "Can't find brush for: ",
                    brushNotHtmlScript: "Brush wasn't configured for html-script option: ",
                    aboutDialog: "@ABOUT@"
                },
                debug: false
            },
            vars: {
                discoveredBrushes: null,
                spaceWidth: null,
                printFrame: null,
                highlighters: {}
            },
            brushes: {},
            regexLib: {
                multiLineCComments: /\/\*[\s\S]*?\*\//gm,
                singleLineCComments: /\/\/.*$/gm,
                singleLinePerlComments: /#.*$/gm,
                doubleQuotedString: /"(?:\.|(\\\")|[^\""\n])*"/g,
                singleQuotedString: /'(?:\.|(\\\')|[^\''\n])*'/g,
                multiLineDoubleQuotedString: /"(?:\.|(\\\")|[^\""])*"/g,
                multiLineSingleQuotedString: /'(?:\.|(\\\')|[^\''])*'/g,
                url: /\w+:\/\/[\w-.\/?%&=:@;]*/g,
                phpScriptTags: {
                    left: /(&lt;|<)\?=?/g,
                    right: /\?(&gt;|>)/g
                },
                aspScriptTags: {
                    left: /(&lt;|<)%=?/g,
                    right: /%(&gt;|>)/g
                },
                scriptScriptTags: {
                    left: /(&lt;|<)\s*script.*?(&gt;|>)/gi,
                    right: /(&lt;|<)\/\s*script\s*(&gt;|>)/gi
                }
            },
            toolbar: {
                create: function (d) {
                    var h = document.createElement("DIV"),
                        b = a.toolbar.items;
                    h.className = "toolbar";
                    for (var c in b) {
                        var f = b[c],
                            g = new f(d),
                            e = g.create();
                        d.toolbarCommands[c] = g;
                        if (e == null) {
                            continue;
                        }
                        if (typeof(e) == "string") {
                            e = a.toolbar.createButton(e, d.id, c);
                        }
                        e.className += "item " + c;
                        h.appendChild(e);
                    }
                    return h;
                },
                createButton: function (f, c, g) {
                    var d = document.createElement("a"),
                        i = d.style,
                        e = a.config,
                        h = e.toolbarItemWidth,
                        b = e.toolbarItemHeight;
                    d.href = "#" + g;
                    d.title = f;
                    d.highlighterId = c;
                    d.commandName = g;
                    d.innerHTML = f;
                    if (isNaN(h) == false) {
                        i.width = h + "px";
                    }
                    if (isNaN(b) == false) {
                        i.height = b + "px";
                    }
                    d.onclick = function (j) {
                        try {
                            a.toolbar.executeCommand(this, j || window.event, this.highlighterId, this.commandName);
                        } catch (j) {
                            a.utils.alert(j.message);
                        }
                        return false;
                    };
                    return d;
                },
                executeCommand: function (f, g, b, e, d) {
                    var c = a.vars.highlighters[b],
                        h;
                    if (c == null || (h = c.toolbarCommands[e]) == null) {
                        return null;
                    }
                    return h.execute(f, g, d);
                },
                items: {
                    expandSource: function (b) {
                        this.create = function () {
                            if (b.getParam("collapse") != true) {
                                return;
                            }
                            return a.config.strings.expandSource;
                        };
                        this.execute = function (d, e, c) {
                            var f = b.div;
                            d.parentNode.removeChild(d);
                            f.className = f.className.replace("collapsed", "");
                        };
                    },
                    viewSource: function (b) {
                        this.create = function () {
                            return a.config.strings.viewSource;
                        };
                        this.execute = function (d, g, c) {
                            var f = a.utils.fixInputString(b.originalCode).replace(/</g, "&lt;"),
                                e = a.utils.popup("", "_blank", 750, 400, "location=0, resizable=1, menubar=0, scrollbars=1");
                            f = a.utils.unindent(f);
                            e.document.write("<pre>" + f + "</pre>");
                            e.document.close();
                        };
                    },
                    copyToClipboard: function (d) {
                        var e, c, b = d.id;
                        this.create = function () {
                            var g = a.config;
                            if (g.clipboardSwf == null) {
                                return null;
                            }
                            function l(o) {
                                var m = "";
                                for (var n in o) {
                                    m += "<param name='" + n + "' value='" + o[n] + "'/>";
                                }
                                return m;
                            }
                            function f(o) {
                                var m = "";
                                for (var n in o) {
                                    m += " " + n + "='" + o[n] + "'";
                                }
                                return m;
                            }
                            var k = {
                                width: g.toolbarItemWidth,
                                height: g.toolbarItemHeight,
                                id: b + "_clipboard",
                                type: "application/x-shockwave-flash",
                                title: a.config.strings.copyToClipboard
                            },
                                j = {
                                    allowScriptAccess: "always",
                                    wmode: "transparent",
                                    flashVars: "highlighterId=" + b,
                                    menu: "false"
                                },
                                i = g.clipboardSwf,
                                h;
                            if (/msie/i.test(navigator.userAgent)) {
                                h = "<object" + f({
                                    classid: "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000",
                                    codebase: "http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0"
                                }) + f(k) + ">" + l(j) + l({
                                    movie: i
                                }) + "</object>";
                            } else {
                                h = "<embed" + f(k) + f(j) + f({
                                    src: i
                                }) + "/>";
                            }
                            e = document.createElement("div");
                            e.innerHTML = h;
                            return e;
                        };
                        this.execute = function (g, i, f) {
                            var j = f.command;
                            switch (j) {
                            case "get":
                                var h = a.utils.unindent(a.utils.fixInputString(d.originalCode).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
                                if (window.clipboardData) {
                                    window.clipboardData.setData("text", h);
                                } else {
                                    return a.utils.unindent(h);
                                }
                            case "ok":
                                a.utils.alert(a.config.strings.copyToClipboardConfirmation);
                                break;
                            case "error":
                                a.utils.alert(f.message);
                                break;
                            }
                        };
                    },
                    printSource: function (b) {
                        this.create = function () {
                            return a.config.strings.print;
                        };
                        this.execute = function (e, g, d) {
                            var f = document.createElement("IFRAME"),
                                h = null;
                            if (a.vars.printFrame != null) {
                                document.body.removeChild(a.vars.printFrame);
                            }
                            a.vars.printFrame = f;
                            f.style.cssText = "position:absolute;width:0px;height:0px;left:-500px;top:-500px;";
                            document.body.appendChild(f);
                            h = f.contentWindow.document;
                            c(h, window.document);
                            h.write('<div class="' + b.div.className.replace("collapsed", "") + ' printing">' + b.div.innerHTML + "</div>");
                            h.close();
                            f.contentWindow.focus();
                            f.contentWindow.print();

                            function c(j, m) {
                                var k = m.getElementsByTagName("link");
                                for (var l = 0; l < k.length; l++) {
                                    if (k[l].rel.toLowerCase() == "stylesheet" && /shCore\.css$/.test(k[l].href)) {
                                        j.write('<link type="text/css" rel="stylesheet" href="' + k[l].href + '"></link>');
                                    }
                                }
                            }
                        };
                    },
                    about: function (b) {
                        this.create = function () {
                            return a.config.strings.help;
                        };
                        this.execute = function (c, e) {
                            var d = a.utils.popup("", "_blank", 500, 250, "scrollbars=0"),
                                f = d.document;
                            f.write(a.config.strings.aboutDialog);
                            f.close();
                            d.focus();
                        };
                    }
                }
            },
            utils: {
                guid: function (b) {
                    return b + Math.round(Math.random() * 1000000).toString();
                },
                merge: function (e, d) {
                    var b = {},
                        c;
                    for (c in e) {
                        b[c] = e[c];
                    }
                    for (c in d) {
                        b[c] = d[c];
                    }
                    return b;
                },
                toBoolean: function (b) {
                    switch (b) {
                    case "true":
                        return true;
                    case "false":
                        return false;
                    }
                    return b;
                },
                popup: function (f, e, g, c, d) {
                    var b = (screen.width - g) / 2,
                        i = (screen.height - c) / 2;
                    d += ", left=" + b + ", top=" + i + ", width=" + g + ", height=" + c;
                    d = d.replace(/^,/, "");
                    var h = window.open(f, e, d);
                    h.focus();
                    return h;
                },
                addEvent: function (d, b, c) {
                    if (d.attachEvent) {
                        d["e" + b + c] = c;
                        d[b + c] = function () {
                            d["e" + b + c](window.event);
                        };
                        d.attachEvent("on" + b, d[b + c]);
                    } else {
                        d.addEventListener(b, c, false);
                    }
                },
                alert: function (b) {
                    alert(a.config.strings.alert + b);
                },
                findBrush: function (f, h) {
                    var g = a.vars.discoveredBrushes,
                        b = null;
                    if (g == null) {
                        g = {};
                        for (var d in a.brushes) {
                            var c = a.brushes[d].aliases;
                            if (c == null) {
                                continue;
                            }
                            for (var e = 0; e < c.length; e++) {
                                g[c[e]] = d;
                            }
                        }
                        a.vars.discoveredBrushes = g;
                    }
                    b = a.brushes[g[f]];
                    if (b == null && h != false) {
                        a.utils.alert(a.config.strings.noBrush + f);
                    }
                    return b;
                },
                eachLine: function (d, e) {
                    var b = d.split("\n");
                    for (var c = 0; c < b.length; c++) {
                        b[c] = e(b[c]);
                    }
                    return b.join("\n");
                },
                createRuler: function () {
                    var e = document.createElement("div"),
                        d = document.createElement("div"),
                        c = 10,
                        b = 1;
                    while (b <= 150) {
                        if (b % c === 0) {
                            e.innerHTML += b;
                            b += (b + "").length;
                        } else {
                            e.innerHTML += "&middot;";
                            b++;
                        }
                    }
                    d.className = "ruler line";
                    d.appendChild(e);
                    return d;
                },
                trimFirstAndLastLines: function (b) {
                    return b.replace(/^[ ]*[\n]+|[\n]*[ ]*$/g, "");
                },
                parseParams: function (h) {
                    var d, c = {},
                        e = new XRegExp("^\\[(?<values>(.*?))\\]$"),
                        f = new XRegExp("(?<name>[\\w-]+)\\s*:\\s*(?<value>[\\w-%#]+|\\[.*?\\]|\".*?\"|'.*?')\\s*;?", "g");
                    while ((d = f.exec(h)) != null) {
                        var g = d.value.replace(/^['"]|['"]$/g, "");
                        if (g != null && e.test(g)) {
                            var b = e.exec(g);
                            g = b.values.length > 0 ? b.values.split(/\s*,\s*/) : [];
                        }
                        c[d.name] = g;
                    }
                    return c;
                },
                decorate: function (c, b) {
                    if (c == null || c.length == 0 || c == "\n") {
                        return c;
                    }
                    c = c.replace(/</g, "&lt;");
                    c = c.replace(/ {2,}/g, function (d) {
                        var e = "";
                        for (var f = 0; f < d.length - 1; f++) {
                            e += "&nbsp;";
                        }
                        return e + " ";
                    });
                    if (b != null) {
                        c = a.utils.eachLine(c, function (d) {
                            if (d.length == 0) {
                                return "";
                            }
                            var e = "";
                            d = d.replace(/^(&nbsp;| )+/, function (f) {
                                e = f;
                                return "";
                            });
                            if (d.length == 0) {
                                return e;
                            }
                            return e + '<code class="' + b + '">' + d + "</code>";
                        });
                    }
                    return c;
                },
                padNumber: function (d, c) {
                    var b = d.toString();
                    while (b.length < c) {
                        b = "0" + b;
                    }
                    return b;
                },
                measureSpace: function () {
                    var c = document.createElement("div"),
                        h, j = 0,
                        f = document.body,
                        d = a.utils.guid("measureSpace"),
                        i = '<div class="',
                        g = "</div>",
                        e = "</span>";
                    c.innerHTML = i + 'syntaxhighlighter">' + i + 'lines">' + i + 'line">' + i + 'content"><span class="block"><span id="' + d + '">&nbsp;' + e + e + g + g + g + g;
                    f.appendChild(c);
                    h = document.getElementById(d);
                    if (/opera/i.test(navigator.userAgent)) {
                        var b = window.getComputedStyle(h, null);
                        j = parseInt(b.getPropertyValue("width"));
                    } else {
                        j = h.offsetWidth;
                    }
                    f.removeChild(c);
                    return j;
                },
                processTabs: function (d, e) {
                    var c = "";
                    for (var b = 0; b < e; b++) {
                        c += " ";
                    }
                    return d.replace(/\t/g, c);
                },
                processSmartTabs: function (f, g) {
                    var b = f.split("\n"),
                        e = "\t",
                        c = "";
                    for (var d = 0; d < 50; d++) {
                        c += "                    ";
                    }
                    function h(i, k, j) {
                        return i.substr(0, k) + c.substr(0, j) + i.substr(k + 1, i.length);
                    }
                    f = a.utils.eachLine(f, function (i) {
                        if (i.indexOf(e) == -1) {
                            return i;
                        }
                        var k = 0;
                        while ((k = i.indexOf(e)) != -1) {
                            var j = g - k % g;
                            i = h(i, k, j);
                        }
                        return i;
                    });
                    return f;
                },
                fixInputString: function (c) {
                    var b = /<br\s*\/?>|&lt;br\s*\/?&gt;/gi;
                    if (a.config.bloggerMode == true) {
                        c = c.replace(b, "\n");
                    }
                    if (a.config.stripBrs == true) {
                        c = c.replace(b, "");
                    }
                    return c;
                },
                trim: function (b) {
                    return b.replace(/\s*$/g, "").replace(/^\s*/, "");
                },
                unindent: function (j) {
                    var c = a.utils.fixInputString(j).split("\n"),
                        h = new Array(),
                        f = /^\s*/,
                        e = 1000;
                    for (var d = 0; d < c.length && e > 0; d++) {
                        var b = c[d];
                        if (a.utils.trim(b).length == 0) {
                            continue;
                        }
                        var g = f.exec(b);
                        if (g == null) {
                            return j;
                        }
                        e = Math.min(g[0].length, e);
                    }
                    if (e > 0) {
                        for (var d = 0; d < c.length; d++) {
                            c[d] = c[d].substr(e);
                        }
                    }
                    return c.join("\n");
                },
                matchesSortCallback: function (c, b) {
                    if (c.index < b.index) {
                        return -1;
                    } else {
                        if (c.index > b.index) {
                            return 1;
                        } else {
                            if (c.length < b.length) {
                                return -1;
                            } else {
                                if (c.length > b.length) {
                                    return 1;
                                }
                            }
                        }
                    }
                    return 0;
                },
                getMatches: function (f, g) {
                    function h(i, j) {
                        return [new a.Match(i[0], i.index, j.css)];
                    }
                    var d = 0,
                        c = null,
                        b = [],
                        e = g.func ? g.func : h;
                    while ((c = g.regex.exec(f)) != null) {
                        b = b.concat(e(c, g));
                    }
                    return b;
                },
                processUrls: function (b) {
                    return b.replace(a.regexLib.url, function (c) {
                        return '<a href="' + c + '">' + c + "</a>";
                    });
                }
            },
            highlight: function (g, e) {
                function d(q) {
                    var o = [];
                    for (var p = 0; p < q.length; p++) {
                        o.push(q[p]);
                    }
                    return o;
                }
                var b = e ? [e] : d(document.getElementsByTagName(a.config.tagName)),
                    h = "innerHTML",
                    l = null;
                if (b.length === 0) {
                    return;
                }
                for (var f = 0; f < b.length; f++) {
                    var j = b[f],
                        c = a.utils.parseParams(j.className),
                        m;
                    c = a.utils.merge(g, c);
                    m = c.brush;
                    if (m == null) {
                        continue;
                    }
                    if (c["html-script"] == "true") {
                        l = new a.HtmlScript(m);
                    } else {
                        var k = a.utils.findBrush(m);
                        if (k) {
                            l = new k();
                        } else {
                            continue;
                        }
                    }
                    l.highlight(j[h], c);
                    var n = l.div;
                    if (a.config.debug) {
                        n = document.createElement("textarea");
                        n.value = l.div.innerHTML;
                        n.style.width = "70em";
                        n.style.height = "30em";
                    }
                    j.parentNode.replaceChild(n, j);
                }
            },

            all: function (b, waittilload) {
                if (waittilload) a.utils.addEvent(window, "load", function () {
                    a.highlight(b);
                });
                else a.highlight(b);
            }
        };






        a.Match = function (d, b, c) {
            this.value = d;
            this.index = b;
            this.length = d.length;
            this.css = c;
        };
        a.Match.prototype.toString = function () {
            return this.value;
        };
        a.HtmlScript = function (b) {
            var c = a.utils.findBrush(b),
                g = new a.brushes.Xml(),
                f = null;
            if (c == null) {
                return;
            }
            c = new c();
            this.xmlBrush = g;
            if (c.htmlScript == null) {
                a.utils.alert(a.config.strings.brushNotHtmlScript + b);
                return;
            }
            g.regexList.push({
                regex: c.htmlScript.code,
                func: e
            });

            function d(i, k) {
                for (var h = 0; h < i.length; h++) {
                    i[h].index += k;
                }
            }
            function e(o, j) {
                var h = o.code,
                    n = [],
                    m = c.regexList,
                    k = o.index + o.left.length,
                    p = c.htmlScript,
                    q;
                for (var l = 0; l < m.length; l++) {
                    q = a.utils.getMatches(h, m[l]);
                    d(q, k);
                    n = n.concat(q);
                }
                if (p.left != null && o.left != null) {
                    q = a.utils.getMatches(o.left, p.left);
                    d(q, o.index);
                    n = n.concat(q);
                }
                if (p.right != null && o.right != null) {
                    q = a.utils.getMatches(o.right, p.right);
                    d(q, o.index + o[0].lastIndexOf(o.right));
                    n = n.concat(q);
                }
                return n;
            }
        };
        a.HtmlScript.prototype.highlight = function (b, c) {
            this.xmlBrush.highlight(b, c);
            this.div = this.xmlBrush.div;
        };
        a.Highlighter = function () {};
        a.Highlighter.prototype = {
            getParam: function (d, c) {
                var b = this.params[d];
                return a.utils.toBoolean(b == null ? c : b);
            },
            create: function (b) {
                return document.createElement(b);
            },
            findMatches: function (e, d) {
                var b = [];
                if (e != null) {
                    for (var c = 0; c < e.length; c++) {
                        b = b.concat(a.utils.getMatches(d, e[c]));
                    }
                }
                b = b.sort(a.utils.matchesSortCallback);
                return b;
            },
            removeNestedMatches: function () {
                var f = this.matches;
                for (var e = 0; e < f.length; e++) {
                    if (f[e] === null) {
                        continue;
                    }
                    var b = f[e],
                        d = b.index + b.length;
                    for (var c = e + 1; c < f.length && f[e] !== null; c++) {
                        var g = f[c];
                        if (g === null) {
                            continue;
                        } else {
                            if (g.index > d) {
                                break;
                            } else {
                                if (g.index == b.index && g.length > b.length) {
                                    this.matches[e] = null;
                                } else {
                                    if (g.index >= b.index && g.index < d) {
                                        this.matches[c] = null;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            createDisplayLines: function (b) {
                var m = b.split(/\n/g),
                    k = parseInt(this.getParam("first-line")),
                    g = (k + m.length).toString().length,
                    l = this.getParam("highlight", []);
                b = "";
                for (var f = 0; f < m.length; f++) {
                    var n = m[f],
                        c = /^(&nbsp;|\s)+/.exec(n),
                        j = "line alt" + (f % 2 == 0 ? 1 : 2),
                        d = a.utils.padNumber(k + f, g),
                        e = l.indexOf((k + f).toString()) != -1,
                        h = null;
                    if (c != null) {
                        h = c[0].toString();
                        n = n.substr(h.length);
                        h = h.replace(/&nbsp;/g, " ");
                        c = a.vars.spaceWidth * h.length;
                    } else {
                        c = 0;
                    }
                    n = a.utils.trim(n);
                    if (n.length == 0) {
                        n = "&nbsp;";
                    }
                    if (e) {
                        j += " highlighted";
                    }
                    b += '<div class="' + j + '"><code class="number">' + d + '.</code><span class="content">' + (h != null ? '<code class="spaces">' + h.replace(/\s/g, "&nbsp;") + "</code>" : "") + '<span class="block" style="margin-left: ' + c + 'px !important;">' + n + "</span></span></div>";
                }
                return b;
            },
            processMatches: function (e, f) {
                var h = 0,
                    b = "",
                    g = a.utils.decorate;
                for (var d = 0; d < f.length; d++) {
                    var c = f[d];
                    if (c === null || c.length === 0) {
                        continue;
                    }
                    b += g(e.substr(h, c.index - h), "plain") + g(c.value, c.css);
                    h = c.index + c.length;
                }
                b += g(e.substr(h), "plain");
                return b;
            },
            highlight: function (c, e) {
                var j = a.config,
                    k = a.vars,
                    b, g, h, d = "important";
                this.params = {};
                this.div = null;
                this.lines = null;
                this.code = null;
                this.bar = null;
                this.toolbarCommands = {};
                this.id = a.utils.guid("highlighter_");
                k.highlighters[this.id] = this;
                if (c === null) {
                    c = "";
                }
                if (k.spaceWidth === null) {
                    k.spaceWidth = a.utils.measureSpace();
                }
                this.params = a.utils.merge(a.defaults, e || {});
                if (this.getParam("light") == true) {
                    this.params.toolbar = this.params.gutter = false;
                }
                this.div = b = this.create("DIV");
                this.lines = this.create("DIV");
                this.lines.className = "lines";
                this.lines.setAttribute('dir', 'ltr');
                className = "syntaxhighlighter ";
                b.id = this.id;
                if (this.getParam("collapse")) {
                    className += " collapsed";
                }
                if (this.getParam("gutter") == false) {
                    className += " nogutter";
                }
                if (this.getParam("wrap-lines") == false) {
                    this.lines.className += " no-wrap";
                }
                className += " " + this.getParam("class-name");
                b.className = className;
                this.originalCode = c;
                this.code = a.utils.trimFirstAndLastLines(c).replace(/\r/g, " ");
                h = this.getParam("tab-size");
                this.code = this.getParam("smart-tabs") == true ? a.utils.processSmartTabs(this.code, h) : a.utils.processTabs(this.code, h);this.code = a.utils.unindent(this.code);
                if (this.getParam("toolbar")) {
                    this.bar = this.create("DIV");
                    this.bar.className = "bar";
                    this.bar.appendChild(a.toolbar.create(this));
                    b.appendChild(this.bar);
                    var i = this.bar;

                    function f() {
                        i.className = i.className.replace("show", "");
                    }
                    b.onmouseover = function () {
                        f();
                        i.className += " show";
                    };
                    b.onmouseout = function () {
                        f();
                    };
                }
                if (this.getParam("ruler")) {
                    b.appendChild(a.utils.createRuler());
                }
                b.appendChild(this.lines);this.matches = this.findMatches(this.regexList, this.code);this.removeNestedMatches();c = this.processMatches(this.code, this.matches);c = this.createDisplayLines(a.utils.trim(c));
                if (this.getParam("auto-links")) {
                    c = a.utils.processUrls(c);
                }
                this.lines.innerHTML = c;
            },
            getKeywords: function (b) {
                b = b.replace(/^\s+|\s+$/g, "").replace(/\s+/g, "\\b|\\b");
                return "\\b" + b + "\\b";
            },
            forHtmlScript: function (b) {
                this.htmlScript = {
                    left: {
                        regex: b.left,
                        css: "script"
                    },
                    right: {
                        regex: b.right,
                        css: "script"
                    },
                    code: new XRegExp("(?<left>" + b.left.source + ")(?<code>.*?)(?<right>" + b.right.source + ")", "sgi")
                };
            }
        };
        return a;
    }();
}
if (!Array.indexOf) {
    Array.prototype.indexOf = function (a, c) {
        c = Math.max(c || 0, 0);
        for (var b = c; b < this.length; b++) {
            if (this[b] == a) {
                return b;
            }
        }
        return -1;
    };
}
if (!window.XRegExp) {
    (function () {
        var e = {
            exec: RegExp.prototype.exec,
            match: String.prototype.match,
            replace: String.prototype.replace,
            split: String.prototype.split
        },
            d = {
                part: /(?:[^\\([#\s.]+|\\(?!k<[\w$]+>|[pP]{[^}]+})[\S\s]?|\((?=\?(?!#|<[\w$]+>)))+|(\()(?:\?(?:(#)[^)]*\)|<([$\w]+)>))?|\\(?:k<([\w$]+)>|[pP]{([^}]+)})|(\[\^?)|([\S\s])/g,
                replaceVar: /(?:[^$]+|\$(?![1-9$&`']|{[$\w]+}))+|\$(?:([1-9]\d*|[$&`'])|{([$\w]+)})/g,
                extended: /^(?:\s+|#.*)+/,
                quantifier: /^(?:[?*+]|{\d+(?:,\d*)?})/,
                classLeft: /&&\[\^?/g,
                classRight: /]/g
            },
            b = function (j, g, h) {
                for (var f = h || 0; f < j.length; f++) {
                    if (j[f] === g) {
                        return f;
                    }
                }
                return -1;
            },
            c = /()??/.exec("")[1] !== undefined,
            a = {};
        XRegExp = function (o, i) {
            if (o instanceof RegExp) {
                if (i !== undefined) {
                    throw TypeError("can't supply flags when constructing one RegExp from another");
                }
                return o.addFlags();
            }
            var i = i || "",
                f = i.indexOf("s") > -1,
                k = i.indexOf("x") > -1,
                p = false,
                r = [],
                h = [],
                g = d.part,
                l, j, n, m, q;
            g.lastIndex = 0;
            while (l = e.exec.call(g, o)) {
                if (l[2]) {
                    if (!d.quantifier.test(o.slice(g.lastIndex))) {
                        h.push("(?:)");
                    }
                } else {
                    if (l[1]) {
                        r.push(l[3] || null);
                        if (l[3]) {
                            p = true;
                        }
                        h.push("(");
                    } else {
                        if (l[4]) {
                            m = b(r, l[4]);
                            h.push(m > -1 ? "\\" + (m + 1) + (isNaN(o.charAt(g.lastIndex)) ? "" : "(?:)") : l[0]);
                        } else {
                            if (l[5]) {
                                h.push(a.unicode ? a.unicode.get(l[5], l[0].charAt(1) === "P") : l[0]);
                            } else {
                                if (l[6]) {
                                    if (o.charAt(g.lastIndex) === "]") {
                                        h.push(l[6] === "[" ? "(?!)" : "[\\S\\s]");
                                        g.lastIndex++;
                                    } else {
                                        j = XRegExp.matchRecursive("&&" + o.slice(l.index), d.classLeft, d.classRight, "", {
                                            escapeChar: "\\"
                                        })[0];
                                        h.push(l[6] + j + "]");
                                        g.lastIndex += j.length + 1;
                                    }
                                } else {
                                    if (l[7]) {
                                        if (f && l[7] === ".") {
                                            h.push("[\\S\\s]");
                                        } else {
                                            if (k && d.extended.test(l[7])) {
                                                n = e.exec.call(d.extended, o.slice(g.lastIndex - 1))[0].length;
                                                if (!d.quantifier.test(o.slice(g.lastIndex - 1 + n))) {
                                                    h.push("(?:)");
                                                }
                                                g.lastIndex += n - 1;
                                            } else {
                                                h.push(l[7]);
                                            }
                                        }
                                    } else {
                                        h.push(l[0]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            q = RegExp(h.join(""), e.replace.call(i, /[sx]+/g, ""));
            q._x = {
                source: o,
                captureNames: p ? r : null
            };
            return q;
        };
        XRegExp.addPlugin = function (f, g) {
            a[f] = g;
        };
        RegExp.prototype.exec = function (k) {
            var h = e.exec.call(this, k),
                g, j, f;
            if (h) {
                if (c && h.length > 1) {
                    f = new RegExp("^" + this.source + "$(?!\\s)", this.getNativeFlags());
                    e.replace.call(h[0], f, function () {
                        for (j = 1; j < arguments.length - 2; j++) {
                            if (arguments[j] === undefined) {
                                h[j] = undefined;
                            }
                        }
                    });
                }
                if (this._x && this._x.captureNames) {
                    for (j = 1; j < h.length; j++) {
                        g = this._x.captureNames[j - 1];
                        if (g) {
                            h[g] = h[j];
                        }
                    }
                }
                if (this.global && this.lastIndex > (h.index + h[0].length)) {
                    this.lastIndex--;
                }
            }
            return h;
        };
    })();
}
RegExp.prototype.getNativeFlags = function () {
    return (this.global ? "g" : "") + (this.ignoreCase ? "i" : "") + (this.multiline ? "m" : "") + (this.extended ? "x" : "") + (this.sticky ? "y" : "");
};
RegExp.prototype.addFlags = function (a) {
    var b = new XRegExp(this.source, (a || "") + this.getNativeFlags());
    if (this._x) {
        b._x = {
            source: this._x.source,
            captureNames: this._x.captureNames ? this._x.captureNames.slice(0) : null
        };
    }
    return b;
};
RegExp.prototype.call = function (a, b) {
    return this.exec(b);
};
RegExp.prototype.apply = function (b, a) {
    return this.exec(a[0]);
};
XRegExp.cache = function (c, a) {
    var b = "/" + c + "/" + (a || "");
    return XRegExp.cache[b] || (XRegExp.cache[b] = new XRegExp(c, a));
};
XRegExp.escape = function (a) {
    return a.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, "\\$&");
};
XRegExp.matchRecursive = function (p, d, s, f, b) {
    var b = b || {},
        v = b.escapeChar,
        k = b.valueNames,
        f = f || "",
        q = f.indexOf("g") > -1,
        c = f.indexOf("i") > -1,
        h = f.indexOf("m") > -1,
        u = f.indexOf("y") > -1,
        f = f.replace(/y/g, ""),
        d = d instanceof RegExp ? (d.global ? d : d.addFlags("g")) : new XRegExp(d, "g" + f),
        s = s instanceof RegExp ? (s.global ? s : s.addFlags("g")) : new XRegExp(s, "g" + f),
        i = [],
        a = 0,
        j = 0,
        n = 0,
        l = 0,
        m, e, o, r, g, t;
    if (v) {
        if (v.length > 1) {
            throw SyntaxError("can't supply more than one escape character");
        }
        if (h) {
            throw TypeError("can't supply escape character when using the multiline flag");
        }
        g = XRegExp.escape(v);
        t = new RegExp("^(?:" + g + "[\\S\\s]|(?:(?!" + d.source + "|" + s.source + ")[^" + g + "])+)+", c ? "i" : "");
    }
    while (true) {
        d.lastIndex = s.lastIndex = n + (v ? (t.exec(p.slice(n)) || [""])[0].length : 0);
        o = d.exec(p);
        r = s.exec(p);
        if (o && r) {
            if (o.index <= r.index) {
                r = null;
            } else {
                o = null;
            }
        }
        if (o || r) {
            j = (o || r).index;
            n = (o ? d : s).lastIndex;
        } else {
            if (!a) {
                break;
            }
        }
        if (u && !a && j > l) {
            break;
        }
        if (o) {
            if (!a++) {
                m = j;
                e = n;
            }
        } else {
            if (r && a) {
                if (!--a) {
                    if (k) {
                        if (k[0] && m > l) {
                            i.push([k[0], p.slice(l, m), l, m]);
                        }
                        if (k[1]) {
                            i.push([k[1], p.slice(m, e), m, e]);
                        }
                        if (k[2]) {
                            i.push([k[2], p.slice(e, j), e, j]);
                        }
                        if (k[3]) {
                            i.push([k[3], p.slice(j, n), j, n]);
                        }
                    } else {
                        i.push(p.slice(e, j));
                    }
                    l = n;
                    if (!q) {
                        break;
                    }
                }
            } else {
                d.lastIndex = s.lastIndex = 0;
                throw Error("subject data contains unbalanced delimiters");
            }
        }
        if (j === n) {
            n++;
        }
    }
    if (q && !u && k && k[0] && p.length > l) {
        i.push([k[0], p.slice(l), l, p.length]);
    }
    d.lastIndex = s.lastIndex = 0;
    return i;
};
SyntaxHighlighter.brushes.CSS = function () {
    function a(f) {
        return "\\b([a-z_]|)" + f.replace(/ /g, "(?=:)\\b|\\b([a-z_\\*]|\\*|)") + "(?=:)\\b";
    }
    function c(f) {
        return "\\b" + f.replace(/ /g, "(?!-)(?!:)\\b|\\b()") + ":\\b";
    }
    var d = "ascent azimuth background-attachment background-color background-image background-position background-repeat background baseline bbox border-collapse border-color border-spacing border-style border-top border-right border-bottom border-left border-top-color border-right-color border-bottom-color border-left-color border-top-style border-right-style border-bottom-style border-left-style border-top-width border-right-width border-bottom-width border-left-width border-width border bottom cap-height caption-side centerline clear clip color content counter-increment counter-reset cue-after cue-before cue cursor definition-src descent direction display elevation empty-cells float font-size-adjust font-family font-size font-stretch font-style font-variant font-weight font height left letter-spacing line-height list-style-image list-style-position list-style-type list-style margin-top margin-right margin-bottom margin-left margin marker-offset marks mathline max-height max-width min-height min-width orphans outline-color outline-style outline-width outline overflow padding-top padding-right padding-bottom padding-left padding page page-break-after page-break-before page-break-inside pause pause-after pause-before pitch pitch-range play-during position quotes right richness size slope src speak-header speak-numeral speak-punctuation speak speech-rate stemh stemv stress table-layout text-align top text-decoration text-indent text-shadow text-transform unicode-bidi unicode-range units-per-em vertical-align visibility voice-family volume white-space widows width widths word-spacing x-height z-index";
    var b = "above absolute all always aqua armenian attr aural auto avoid baseline behind below bidi-override black blink block blue bold bolder both bottom braille capitalize caption center center-left center-right circle close-quote code collapse compact condensed continuous counter counters crop cross crosshair cursive dashed decimal decimal-leading-zero default digits disc dotted double embed embossed e-resize expanded extra-condensed extra-expanded fantasy far-left far-right fast faster fixed format fuchsia gray green groove handheld hebrew help hidden hide high higher icon inline-table inline inset inside invert italic justify landscape large larger left-side left leftwards level lighter lime line-through list-item local loud lower-alpha lowercase lower-greek lower-latin lower-roman lower low ltr marker maroon medium message-box middle mix move narrower navy ne-resize no-close-quote none no-open-quote no-repeat normal nowrap n-resize nw-resize oblique olive once open-quote outset outside overline pointer portrait pre print projection purple red relative repeat repeat-x repeat-y rgb ridge right right-side rightwards rtl run-in screen scroll semi-condensed semi-expanded separate se-resize show silent silver slower slow small small-caps small-caption smaller soft solid speech spell-out square s-resize static status-bar sub super sw-resize table-caption table-cell table-column table-column-group table-footer-group table-header-group table-row table-row-group teal text-bottom text-top thick thin top transparent tty tv ultra-condensed ultra-expanded underline upper-alpha uppercase upper-latin upper-roman url visible wait white wider w-resize x-fast x-high x-large x-loud x-low x-slow x-small x-soft xx-large xx-small yellow";
    var e = "[mM]onospace [tT]ahoma [vV]erdana [aA]rial [hH]elvetica [sS]ans-serif [sS]erif [cC]ourier mono sans serif";
    this.regexList = [{
        regex: SyntaxHighlighter.regexLib.multiLineCComments,
        css: "comments"
    },
    {
        regex: SyntaxHighlighter.regexLib.doubleQuotedString,
        css: "string"
    },
    {
        regex: SyntaxHighlighter.regexLib.singleQuotedString,
        css: "string"
    },
    {
        regex: /\#[a-fA-F0-9]{3,6}/g,
        css: "value"
    },
    {
        regex: /(-?\d+)(\.\d+)?(px|em|pt|\:|\%|)/g,
        css: "value"
    },
    {
        regex: /!important/g,
        css: "color3"
    },
    {
        regex: new RegExp(a(d), "gm"),
        css: "keyword"
    },
    {
        regex: new RegExp(c(b), "g"),
        css: "value"
    },
    {
        regex: new RegExp(this.getKeywords(e), "g"),
        css: "color1"
    }];
    this.forHtmlScript({
        left: /(&lt;|<)\s*style.*?(&gt;|>)/gi,
        right: /(&lt;|<)\/\s*style\s*(&gt;|>)/gi
    });
};
SyntaxHighlighter.brushes.CSS.prototype = new SyntaxHighlighter.Highlighter();
SyntaxHighlighter.brushes.CSS.aliases = ["css"];
SyntaxHighlighter.brushes.CSharp = function () {
    var b = "abstract as base bool break byte case catch char checked class const continue decimal default delegate do double else enum event explicit extern false finally fixed float for foreach get goto if implicit in int interface internal is lock long namespace new null object operator out override params private protected public readonly ref return sbyte sealed set short sizeof stackalloc static string struct switch this throw true try typeof uint ulong unchecked unsafe ushort using virtual void while";

    function a(c, e) {
        var d = (c[0].indexOf("///") == 0) ? "color1" : "comments";
        return [new SyntaxHighlighter.Match(c[0], c.index, d)];
    }
    this.regexList = [{
        regex: SyntaxHighlighter.regexLib.singleLineCComments,
        func: a
    },
    {
        regex: SyntaxHighlighter.regexLib.multiLineCComments,
        css: "comments"
    },
    {
        regex: SyntaxHighlighter.regexLib.doubleQuotedString,
        css: "string"
    },
    {
        regex: SyntaxHighlighter.regexLib.singleQuotedString,
        css: "string"
    },
    {
        regex: /^\s*#.*/gm,
        css: "preprocessor"
    },
    {
        regex: new RegExp(this.getKeywords(b), "gm"),
        css: "keyword"
    }];
    this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags);
};
SyntaxHighlighter.brushes.CSharp.prototype = new SyntaxHighlighter.Highlighter();
SyntaxHighlighter.brushes.CSharp.aliases = ["c#", "c-sharp", "csharp"];
SyntaxHighlighter.brushes.JScript = function () {
    var a = "break case catch continue default delete do else false  for function if in instanceof new null return super switch this throw true try typeof var while with";
    this.regexList = [{
        regex: SyntaxHighlighter.regexLib.singleLineCComments,
        css: "comments"
    },
    {
        regex: SyntaxHighlighter.regexLib.multiLineCComments,
        css: "comments"
    },
    {
        regex: SyntaxHighlighter.regexLib.doubleQuotedString,
        css: "string"
    },
    {
        regex: SyntaxHighlighter.regexLib.singleQuotedString,
        css: "string"
    },
    {
        regex: /\s*#.*/gm,
        css: "preprocessor"
    },
    {
        regex: new RegExp(this.getKeywords(a), "gm"),
        css: "keyword"
    }];
    this.forHtmlScript(SyntaxHighlighter.regexLib.scriptScriptTags);
};
SyntaxHighlighter.brushes.JScript.prototype = new SyntaxHighlighter.Highlighter();
SyntaxHighlighter.brushes.JScript.aliases = ["js", "jscript", "javascript"];
SyntaxHighlighter.brushes.Php = function () {
    var a = "abs acos acosh addcslashes addslashes array_change_key_case array_chunk array_combine array_count_values array_diff array_diff_assoc array_diff_key array_diff_uassoc array_diff_ukey array_fill array_filter array_flip array_intersect array_intersect_assoc array_intersect_key array_intersect_uassoc array_intersect_ukey array_key_exists array_keys array_map array_merge array_merge_recursive array_multisort array_pad array_pop array_product array_push array_rand array_reduce array_reverse array_search array_shift array_slice array_splice array_sum array_udiff array_udiff_assoc array_udiff_uassoc array_uintersect array_uintersect_assoc array_uintersect_uassoc array_unique array_unshift array_values array_walk array_walk_recursive atan atan2 atanh base64_decode base64_encode base_convert basename bcadd bccomp bcdiv bcmod bcmul bindec bindtextdomain bzclose bzcompress bzdecompress bzerrno bzerror bzerrstr bzflush bzopen bzread bzwrite ceil chdir checkdate checkdnsrr chgrp chmod chop chown chr chroot chunk_split class_exists closedir closelog copy cos cosh count count_chars date decbin dechex decoct deg2rad delete ebcdic2ascii echo empty end ereg ereg_replace eregi eregi_replace error_log error_reporting escapeshellarg escapeshellcmd eval exec exit exp explode extension_loaded feof fflush fgetc fgetcsv fgets fgetss file_exists file_get_contents file_put_contents fileatime filectime filegroup fileinode filemtime fileowner fileperms filesize filetype floatval flock floor flush fmod fnmatch fopen fpassthru fprintf fputcsv fputs fread fscanf fseek fsockopen fstat ftell ftok getallheaders getcwd getdate getenv gethostbyaddr gethostbyname gethostbynamel getimagesize getlastmod getmxrr getmygid getmyinode getmypid getmyuid getopt getprotobyname getprotobynumber getrandmax getrusage getservbyname getservbyport gettext gettimeofday gettype glob gmdate gmmktime ini_alter ini_get ini_get_all ini_restore ini_set interface_exists intval ip2long is_a is_array is_bool is_callable is_dir is_double is_executable is_file is_finite is_float is_infinite is_int is_integer is_link is_long is_nan is_null is_numeric is_object is_readable is_real is_resource is_scalar is_soap_fault is_string is_subclass_of is_uploaded_file is_writable is_writeable mkdir mktime nl2br parse_ini_file parse_str parse_url passthru pathinfo readlink realpath rewind rewinddir rmdir round str_ireplace str_pad str_repeat str_replace str_rot13 str_shuffle str_split str_word_count strcasecmp strchr strcmp strcoll strcspn strftime strip_tags stripcslashes stripos stripslashes stristr strlen strnatcasecmp strnatcmp strncasecmp strncmp strpbrk strpos strptime strrchr strrev strripos strrpos strspn strstr strtok strtolower strtotime strtoupper strtr strval substr substr_compare";
    var c = "and or xor array as break case cfunction class const continue declare default die do else elseif enddeclare endfor endforeach endif endswitch endwhile extends for foreach function include include_once global if new old_function return static switch use require require_once var while abstract interface public implements extends private protected throw";
    var b = "__FILE__ __LINE__ __METHOD__ __FUNCTION__ __CLASS__";
    this.regexList = [{
        regex: SyntaxHighlighter.regexLib.singleLineCComments,
        css: "comments"
    },
    {
        regex: SyntaxHighlighter.regexLib.multiLineCComments,
        css: "comments"
    },
    {
        regex: SyntaxHighlighter.regexLib.doubleQuotedString,
        css: "string"
    },
    {
        regex: SyntaxHighlighter.regexLib.singleQuotedString,
        css: "string"
    },
    {
        regex: /\$\w+/g,
        css: "variable"
    },
    {
        regex: new RegExp(this.getKeywords(a), "gmi"),
        css: "functions"
    },
    {
        regex: new RegExp(this.getKeywords(b), "gmi"),
        css: "constants"
    },
    {
        regex: new RegExp(this.getKeywords(c), "gm"),
        css: "keyword"
    }];
    this.forHtmlScript(SyntaxHighlighter.regexLib.phpScriptTags);
};
SyntaxHighlighter.brushes.Php.prototype = new SyntaxHighlighter.Highlighter();
SyntaxHighlighter.brushes.Php.aliases = ["php"];
SyntaxHighlighter.brushes.Xml = function () {
    function a(e, i) {
        var f = SyntaxHighlighter.Match,
            h = e[0],
            c = new XRegExp("(&lt;|<)[\\s\\/\\?]*(?<name>[:\\w-\\.]+)", "xg").exec(h),
            b = [];
        if (e.attributes != null) {
            var d, g = new XRegExp("(?<name> [\\w:\\-\\.]+)\\s*=\\s*(?<value> \".*?\"|'.*?'|\\w+)", "xg");
            while ((d = g.exec(h)) != null) {
                b.push(new f(d.name, e.index + d.index, "color1"));
                b.push(new f(d.value, e.index + d.index + d[0].indexOf(d.value), "string"));
            }
        }
        if (c != null) {
            b.push(new f(c.name, e.index + c[0].indexOf(c.name), "keyword"));
        }
        return b;
    }
    this.regexList = [{
        regex: new XRegExp("(\\&lt;|<)\\!\\[[\\w\\s]*?\\[(.|\\s)*?\\]\\](\\&gt;|>)", "gm"),
        css: "color2"
    },
    {
        regex: new XRegExp("(\\&lt;|<)!--\\s*.*?\\s*--(\\&gt;|>)", "gm"),
        css: "comments"
    },
    {
        regex: new XRegExp("(&lt;|<)[\\s\\/\\?]*(\\w+)(?<attributes>.*?)[\\s\\/\\?]*(&gt;|>)", "sg"),
        func: a
    }];
};
SyntaxHighlighter.brushes.Xml.prototype = new SyntaxHighlighter.Highlighter();
SyntaxHighlighter.brushes.Xml.aliases = ["xml", "xhtml", "xslt", "html", "xhtml"];



// apache config brush from rileyw
;(function()
{
	// CommonJS
	typeof(require) != 'undefined' ? SyntaxHighlighter = require('shCore').SyntaxHighlighter : null;

	function Brush()
	{
		function process(match, regexInfo)
		{
			var constructor = SyntaxHighlighter.Match,
				code = match[0],
				tag = new XRegExp('(&lt;|<)[\\s\\/\\?]*(?<name>[:\\w-\\.]+)', 'xg').exec(code),
				result = []
				;
		
			if (match.attributes != null) 
			{
				var attributes,
					regex = new XRegExp('(?<name> [\\w:\\-\\.]+)' +
										'\\s*=\\s*' +
										'(?<value> ".*?"|\'.*?\'|\\w+)',
										'xg');

				while ((attributes = regex.exec(code)) != null) 
				{
					result.push(new constructor(attributes.name, match.index + attributes.index, 'color1'));
					result.push(new constructor(attributes.value, match.index + attributes.index + attributes[0].indexOf(attributes.value), 'string'));
				}
			}

			if (tag != null)
				result.push(
					new constructor(tag.name, match.index + tag[0].indexOf(tag.name), 'keyword')
				);

			return result;
		}
		var keywords =  'AccessConfig AccessFileName Action AddAlt AddAltByEncoding AddAltByType' +
						'AddDescription AddEncoding AddHandler AddIcon AddIconByEncoding AddIconByType' +
						'AddLanguage AddModule AddModuleInfo AddType AgentLog Alias AliasMatch' +
						'allow AllowCONNECT AllowOverride Anonymous Anonymous_Authoritative Anonymous_LogEmail' +
						'Anonymous_MustGiveEmail Anonymous_NoUserID Anonymous_VerifyEmail AuthAuthoritative' +
						'AuthDBAuthoritative AuthDBGroupFile AuthDBMAuthoritative AuthDBMGroupFile' +
						'AuthDBMGroupFile AuthDBUserFile AuthDBMUserFile AuthDigestFile AuthGroupFile' +
						'AuthName AuthType AuthUserFile BindAddress  BrowserMatch  BrowserMatchNoCase  BS2000Account  CheckSpelling  ClearModuleList  ContentDigest  CookieExpires  CookieLog CookieLog CookieTracking  CoreDumpDirectory  CustomLog  deny  ErrorDocument  ErrorLog  Example  ExtendedStatus  FancyIndexing  ForceType  Group  Header  HeaderName  HostNameLookups  IdentityCheck  <IfDefine>  <IfModule>  ImapBase  ImapDefault  ImapMenu  Include  IndexIgnore  IndexOptions  KeepAlive  KeepAliveTimeout  LanguagePriority  Listen  ListenBacklog  LoadFile  LoadModule  <Location>  <LocationMatch>  LockFile  LogFormat  LogLevel  MaxClients  MaxKeepAliveRequests  MaxRequestsPerChild  MaxSpareServers  MetaDir  MetaFiles  MetaSuffix  MimeMagicFile  MinSpareServers  MMapFile  NameVirtualHost  NoCache  Options  order  PassEnv  PidFile  Port  ProxyBlock  ProxyDomain  ProxyPass  ProxyPassReverse  ProxyReceiveBufferSize  ProxyRemote  ProxyRequests  ProxyVia  ReadmeName  RefererIgnore  RefererLog  RemoveHandler  require  ResourceConfig RLimitCPU  RLimitMEM  RLimitNPROC  Satisfy  ScoreBoardFile  Script  ScriptAlias  ScriptAliasMatch  ScriptInterpreterSource  ScriptLog  ScriptLogBuffer  ScriptLogLength  SendBufferSize  ServerAdmin  ServerAlias  ServerName  ServerPath  ServerRoot  ServerSignature  ServerTokens  ServerType  SetEnv  SetEnvIf  SetEnvIfNoCase  SetHandler  StartServers  ThreadsPerChild  TimeOut  TransferLog  TypesConfig  UnsetEnv  UseCanonicalName  User  UserDir  <VirtualHost>  VirtualDocumentRoot  VirtualDocumentRootIP  VirtualScriptAlias  VirtualScriptAliasIP  XBitHack FileEtag AddOutputFilterByType SetOutputFilter AddDefaultCharset AddCharset';
								;
		var operators =	'set append DEFLATE'
						;
    
    var rewrites = 'RewriteBase  RewriteCond  RewriteEngine  RewriteLock  RewriteLog  RewriteLogLevel  RewriteMap  RewriteOptions  RewriteRule';
    
    var directories = '<Directory>  <DirectoryMatch>  DirectoryIndex  DocumentRoot';
    
    var defaults = 'DefaultIcon  DefaultLanguage  DefaultType';
    
    var expires = 'ExpiresActive  ExpiresByType  ExpiresDefault';
    
    var limits = '<Limit>  <LimitExcept>  LimitRequestBody  LimitRequestFields  LimitRequestFieldsize  LimitRequestLine';
    
    var redirects = 'Redirect  RedirectMatch  RedirectPermanent  RedirectTemp';
    
    var cache = 'CacheDefaultExpire  CacheDirLength  CacheDirLevels  CacheForceCompletion  CacheGcInterval  CacheLastModifiedFactor  CacheMaxExpire  CacheNegotiatedDocs  CacheRoot  CacheSize';
    
    
		var r = SyntaxHighlighter.regexLib;
		
		this.regexList = [
			{ regex: /\s*#.*/gm,									css: 'comments' },		// preprocessor tags like #region and #endregion
			{ regex: new RegExp(this.getKeywords(keywords), 'gmi'),	css: 'keyword' },			// keywords
			{ regex: new RegExp(this.getKeywords(operators), 'gmi'),	css: 'color2' },			// keywords  

			{ regex: new RegExp(this.getKeywords(rewrites), 'gmi'),	css: 'color3' }, 

			{ regex: new RegExp(this.getKeywords(directories), 'gmi'),	css: 'value' },	
			{ regex: new RegExp(this.getKeywords(defaults), 'gmi'),	css: 'constants' },  
      { regex: new RegExp(this.getKeywords(expires), 'gmi'),	css: 'value' },	    
			{ regex: new RegExp(this.getKeywords(limits), 'gmi'),	css: 'functions' },	 

			{ regex: new RegExp(this.getKeywords(redirects), 'gmi'),	css: 'script' },	 
			{ regex: new RegExp(this.getKeywords(cache), 'gmi'),	css: 'string' },	 
			{ regex: new XRegExp('(&lt;|<)[\\s\\/\\?]*(\\w+)(?<attributes>.*?)[\\s\\/\\?]*(&gt;|>)', 'sg'), func: process }
			];
	
		this.forHtmlScript(r.scriptScriptTags);
	};

	Brush.prototype	= new SyntaxHighlighter.Highlighter();
	Brush.aliases	= ['apache', 'htaccess'];

	SyntaxHighlighter.brushes.Apache = Brush;

	// CommonS
	typeof(exports) != 'undefined' ? exports.Brush = Brush : null;
})();



/*

jQuery :data selector 


Copyright (c) 2009, Pim Jager
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
* Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.
* The name Pim Jager may not be used to endorse or promote products
derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY Pim Jager ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL Pim Jager BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*
    Credits for RegEx selector go to Anon:
    See his comment on: http://james.padolsey.com/javascript/extending-jquerys-selector-capabilities/
*/
(function($){
        //We use a small helper function that will return true when 'a' is undefined (so we can do if(checkUndefined(data)) return false;
        //If we would continue with undefined data we would throw error as we would be getting properties of an
        //non-exsitent object (ie typeof data === 'undefined'; data.fooBar; //throws error
        var checkUndefined = function(a) {
                return typeof a === 'undefined';
        }
        $.expr[':'].data = function(elem, counter, params){
                if(checkUndefined(elem) || checkUndefined(params)) return false;
                //:data(__) accepts 'dataKey', 'dataKey=Value', 'dataKey.InnerdataKey', 'dataKey.InnerdataKey=Value'
                //Also instead of = we accept: != (does not equal Value), ^= (starts with Value), 
                //              $= (ends with Value), *=Value (contains Value) ~=Regex returns where data matches regex
                //$(elem).data(dataKey) or $(elem).data(dataKey)[innerDataKey] (optional more innerDataKeys)
                //When no value is speciefied we return all elements that have the dataKey specified, similar to [attribute]
                var query = params[3]; //The part in the parenthesis, thus: selector:data( query )
                if(!query) return false; //query can not be anything that evaluates to false, it has to be string
                var querySplitted = query.split('='); //for dataKey=Value/dataKey.innerDataKey=Value
                //We check if the condition was an =, an !=, an $= or an *=
                var selectType = querySplitted[0].charAt( querySplitted[0].length-1 );
                if(selectType == '^' || selectType == '$' || selectType == '!' || selectType == '*' || selectType == '~'){
            //we need to remove the last char from the dataName (queryplitted[0]) because we plitted on the =
            //so the !,$,*,^ are still part of the dataname
                        querySplitted[0] = querySplitted[0].substring(0, querySplitted[0].length-1);
                }
                else selectType = '=';
                var dataName = querySplitted[0]; //dataKey or dataKey.innerDataKey
                //Now we go check if we need dataKey or dataKey.innerDataKey
                var dataNameSplitted = dataName.split('.');
                var data = $(elem).data(dataNameSplitted[0]);
                if(checkUndefined(data)) return false;
                if(dataNameSplitted[1]){//We have innerDataKeys
                        for(i=1, x=dataNameSplitted.length; i<x; i++){ //we start counting at 1 since we ignore the first value because that is the dataKey
                                data = data[dataNameSplitted[i]];
                                if(checkUndefined(data)) return false;
                        }
                }
                if(querySplitted[1]){ //should the data be of a specified value?
                        var checkAgainst = (data+'');
                                //We cast to string as the query will always be a string, otherwise boolean comparison may fail
                                //beacuse in javaScript true!='true' but (true+'')=='true'
                        //We use this switch to check if we chould check for =, $=, ^=, !=, *=
                        switch(selectType){
                                case '=': //equals
                                        return checkAgainst == querySplitted[1]; 
                                break;
                                case '!': //does not equeal
                                        return checkAgainst != querySplitted[1];
                                break;
                                case '^': //starts with
                    return checkAgainst.indexOf(querySplitted[1]) === 0;
                                break;
                                case '$': //ends with
                    return checkAgainst.substr(checkAgainst.length - querySplitted[1].length) === querySplitted[1];
                                break;
                                case '*': //contains
                    return checkAgainst.indexOf(querySplitted[1]) !== -1;
                                break;
                case '~':
                    exp = querySplitted[1].substr(1,querySplitted[1].lastIndexOf('/')-1);
                    modif = querySplitted[1].substr(querySplitted[1].lastIndexOf('/')+1);
                    re = new RegExp( exp, modif);
                    return re.test(checkAgainst);
                break;
                                default: //default should never happen
                                        return false;
                                break;
                        }                       
                }
                else{ //the data does not have to be a speciefied value
                                //, just return true (we are here so the data is specified, otherwise false would have been returned by now)
                        return true;
                }
        }
})(jQuery);