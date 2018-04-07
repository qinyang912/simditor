class ColorButton extends Button
  disableTag: 'pre'

  menu: true

  render: (args...) ->
    super args...
    @el.append '<span class="color-selected"></span>'

  setActive: ->
    startNodes = @editor.selection.startNodes()
    endNodes = @editor.selection.endNodes()
    return unless startNodes and endNodes
    startNode = startNodes.eq 0
    endNode = endNodes.eq 0
    active = startNodes.length > 0 and endNodes.length > 0 and startNode.is(endNode)
    node = if active then startNode else null
    node = if node != null and node[0].nodeType is Node.TEXT_NODE then node.parent() else node
    # return unless node
    @setActiveColor node

  setActiveColor: (node) ->
    if node
      color = @_getSelectedColor node
      @el.find('.color-selected').css
        'background-color': color
    else
      @el.find('.color-selected').css
        'background-color': ''

  renderMenu: ->
    list = '''
    <ul class="color-list">
      <li><a href="javascript:;" class="font-color font-color-1"></a></li>
      <li><a href="javascript:;" class="font-color font-color-2"></a></li>
      <li><a href="javascript:;" class="font-color font-color-3"></a></li>
      <li><a href="javascript:;" class="font-color font-color-4"></a></li>
      <li><a href="javascript:;" class="font-color font-color-5"></a></li>
      <li><a href="javascript:;" class="font-color font-color-6"></a></li>
      <li><a href="javascript:;" class="font-color font-color-7"></a></li>
      <li><a href="javascript:;" class="font-color font-color-default"></a></li>
    </ul>
    '''
    customColor = "
      <label class=\"custom-color\">#{@_t('customColor')}</label>
    "
    $(list + customColor).appendTo(@menuWrapper)

    @menuWrapper.on 'mousedown', '.color-list,.custom-color,input', (e) =>
      false

    @menuWrapper.on 'click', '.font-color', (e) =>
      @menuWrapper.find('.custom-color').colpickHide();
      @wrapper.removeClass('menu-on')
      $link = $(e.currentTarget)

      if $link.hasClass 'font-color-default'
        hex = @_getDefaultColor()
      else
        rgb = window.getComputedStyle($link[0], null)
          .getPropertyValue('background-color')
        hex = @_convertRgbToHex rgb

      return unless hex

      @_format hex

    # colpick 文档： http://www.jq22.com/demo/colpick-jQuery-Color-Picker-master/
    @menuWrapper.find('.custom-color').colpick
      layout: 'hex'
      submit: 0
      onChange:(hsb, hex) =>
        @_format "##{hex}"

  _getDefaultColor: ->
    $p = @editor.body.find 'p, li'
    return unless $p.length > 0
    rgb = window.getComputedStyle($p[0], null).getPropertyValue('color')
    return @_convertRgbToHex rgb

  _format:(hex) ->
    # Use span[style] instead of font[color]
    document.execCommand 'styleWithCSS', false, true
    document.execCommand 'foreColor', false, hex
    document.execCommand 'styleWithCSS', false, false

    unless @editor.util.support.oninput
      @editor.trigger 'valuechanged'

  # 获取光标所在地方的颜色， color是字体色，backgournd是背景色
  _getSelectedColor: (node) ->
    rgb = window.getComputedStyle(node[0], null).getPropertyValue('color')
    return @_convertRgbToHex rgb

  _convertRgbToHex:(rgb) ->
    re1 = /rgb\((\d+),\s?(\d+),\s?(\d+)\)/g
    re2 = /rgba\((\d+),\s?(\d+),\s?(\d+),\s?(\d+)\)/g
    _m1 = re1.exec rgb
    _m2 = re2.exec rgb
    match = if _m1 then _m1 else _m2
    return '' unless match

    rgbToHex = (r, g, b) ->
      componentToHex = (c) ->
        hex = c.toString(16)
        if hex.length == 1 then '0' + hex else hex
      "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)

    rgbToHex match[1] * 1, match[2] * 1, match[3] * 1


class TypeColorButton extends ColorButton

  name: 'color'

  icon: 'type-color'

class BackgroundColorButton extends ColorButton

  name: 'background'

  icon: 'background-color'

  _getDefaultColor: ->
    return '#ffffff'

  _format:(hex) ->
    # Use span[style]
    document.execCommand 'styleWithCSS', false, true
    document.execCommand 'backColor', false, hex
    document.execCommand 'styleWithCSS', false, false

    unless @editor.util.support.oninput
      @editor.trigger 'valuechanged'

  _getSelectedColor: (node) ->
    rgb = window.getComputedStyle(node[0], null).getPropertyValue('background-color')
    if rgb == 'rgba(0, 0, 0, 0)'
      return '#ffffff'
    else
      return @_convertRgbToHex rgb

Simditor.Toolbar.addButton TypeColorButton
Simditor.Toolbar.addButton BackgroundColorButton
