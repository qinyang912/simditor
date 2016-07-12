
class UndoButton extends Button

  name: 'undo'

  icon: 'simditor-r-icon-undo'

  _init: ->
    if @editor.util.os.mac
      @title = @title + ' ( Cmd + z )'
    else
      @title = @title + ' ( Ctrl + z )'
    super()

  command: ->
    @editor.undoManager.undo()


Simditor.Toolbar.addButton UndoButton