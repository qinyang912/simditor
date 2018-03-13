
class StrikethroughButton extends Button

  name: 'strikethrough'

  icon: 'delete-line-text'

  htmlTag: 'strike'

  disableTag: 'pre'

  shortcut: 'super+shift+s'

  render: ->
    if @editor.util.os.mac
      @title = @title + ' ( Cmd + shift + s )'
    else
      @title = @title + ' ( Ctrl + shift + s )'
    super()

  _activeStatus: ->
    active = document.queryCommandState('strikethrough') is true
    @setActive active
    @active

  command: ->
    document.execCommand 'strikethrough'
    unless @editor.util.support.oninput
      @editor.trigger 'valuechanged'

    # strikethrough command won't trigger selectionchange event automatically
    $(document).trigger 'selectionchange'


Simditor.Toolbar.addButton StrikethroughButton
