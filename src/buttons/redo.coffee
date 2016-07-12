
class UndoButton extends Button

  name: 'redo'

  icon: 'simditor-r-icon-redo'

  _init: ->
    super()

  _activeStatus: ->
    # active = document.queryCommandState('bold') is true
    # @setActive active
    # @active

  command: ->
    console.log('redo command');
    @editor.undoManager.redo()
    # document.execCommand 'bold'
    # unless @editor.util.support.oninput
    #   @editor.trigger 'valuechanged'

    # # bold command won't trigger selectionchange event automatically
    # $(document).trigger 'selectionchange'


Simditor.Toolbar.addButton UndoButton