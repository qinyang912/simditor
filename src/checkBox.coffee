
class CheckBox extends SimpleModule

  @pluginName: 'CheckBox'

  @className:
    unchecked: 'check-box-item-unchecked'
    checked: 'check-box-item-checked'

  _offset: 2

  _init: ->
    @editor = @_module
    @editor.body.on 'click.simditor-check-box-item', '.check-box-item-unchecked,.check-box-item-checked', (e) =>
      unless $(e.currentTarget).is($(e.target))
        return
      cs = window.getComputedStyle(e.target, null)
      fontSize = cs.getPropertyValue 'font-size'
      fontSize = parseInt(fontSize.replace('px', ''), 10)
      lineHeight = cs.getPropertyValue 'line-height'
      lineHeight = parseInt(lineHeight.replace('px', ''), 10)
      x = e.offsetX
      y = e.offsetY
      minX = fontSize / 2 - @_offset
      maxX = fontSize / 2 + fontSize + @_offset
      minY = -@_offset
      maxY = lineHeight + @_offset
      if minX < x and x < maxX and minY < y and y < maxY
        @_onCheckBoxClick(e);

  _onCheckBoxClick: (e) ->
    $target = $(e.target)

    if $target.hasClass(CheckBox.className.unchecked)
      ac = 'checked'
    else
      ac = 'unchecked'
    $target.removeClass CheckBox.className.unchecked
    $target.removeClass CheckBox.className.checked
    $target.addClass CheckBox.className[ac]



