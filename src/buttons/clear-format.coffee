class ClearFormatButton extends Button

  name: 'clear-format'

  icon: 'format-clear'

  command: ->
    document.execCommand 'removeFormat', false, false

Simditor.Toolbar.addButton ClearFormatButton