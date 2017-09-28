class ColorButton extends Button
  disableTag: 'pre'

  menu: true

  render: (args...) ->
    super args...

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
        $p = @editor.body.find 'p, li'
        return unless $p.length > 0
        rgb = window.getComputedStyle($p[0], null).getPropertyValue('color')
        hex = @_convertRgbToHex rgb
      else
        rgb = window.getComputedStyle($link[0], null)
          .getPropertyValue('background-color')
        hex = @_convertRgbToHex rgb

      return unless hex

      @_format hex

    @menuWrapper.find('.custom-color').colpick
      layout: 'hex'
      submit: 0
      onChange:(hsb, hex) =>
        @_format "##{hex}"

  _format:(hex) ->
    range = @editor.selection.range()

    # Use span[style] instead of font[color]
    document.execCommand 'styleWithCSS', false, true
    document.execCommand 'foreColor', false, hex
    document.execCommand 'styleWithCSS', false, false

    unless @editor.util.support.oninput
      @editor.trigger 'valuechanged'


  _convertRgbToHex:(rgb) ->
    re = /rgb\((\d+),\s?(\d+),\s?(\d+)\)/g
    match = re.exec rgb
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

  _format:(hex) ->
    range = @editor.selection.range()

    # Use span[style]
    document.execCommand 'styleWithCSS', false, true
    document.execCommand 'backColor', false, hex
    document.execCommand 'styleWithCSS', false, false

    unless @editor.util.support.oninput
      @editor.trigger 'valuechanged'

Simditor.Toolbar.addButton TypeColorButton
Simditor.Toolbar.addButton BackgroundColorButton
