
class UndoButton extends Button

  name: 'undo'

  icon: 'undo'

  _init: ->
    if @editor.util.os.mac
      @title = @title + ' ( Cmd + z )'
    else
      @title = @title + ' ( Ctrl + z )'
    super()

  command: ->
    @editor.undoManager.undo()


Simditor.Toolbar.addButton UndoButton