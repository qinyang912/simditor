class ClearFormatButton extends Button

  name: 'clear-format'

  icon: 'format-clear'

  command: ->
    document.execCommand 'removeFormat', false, false
    @editor.trigger 'valuechanged'

Simditor.Toolbar.addButton ClearFormatButton