
class UndoButton extends Button

  name: 'undo'

  icon: 'simditor-r-icon-undo'

  _init: ->
    super()

  _activeStatus: ->
    # active = document.queryCommandState('bold') is true
    # @setActive active
    # @active

  command: ->
    console.log('undo command');
    @editor.undoManager.undo()
    # document.execCommand 'bold'
    # unless @editor.util.support.oninput
    #   @editor.trigger 'valuechanged'

    # # bold command won't trigger selectionchange event automatically
    # $(document).trigger 'selectionchange'


Simditor.Toolbar.addButton UndoButton