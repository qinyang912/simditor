
class UndoButton extends Button

  name: 'redo'

  icon: 'redo'

  _init: ->
    if @editor.util.os.mac
      @title = @title + ' ( Cmd + y )'
    else
      @title = @title + ' ( Ctrl + y )'
    super()

  command: ->
    @editor.undoManager.redo()


Simditor.Toolbar.addButton UndoButton