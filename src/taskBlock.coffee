class TaskBlock extends SimpleModule
  @pluginName: 'TaskBlock'
  _init: ->
    @editor = @_module

  insert: (data) ->
    @createTaskBlock data

  createTaskBlock: (data) ->
    @editor.focus() unless @editor.inputManager.focused
    range = @editor.selection.range()
    range.deleteContents()
    @editor.selection.range range

    $newLine = $('<p><br></p>')

    rootNode = @editor.selection.rootNodes().last()

    $wrapper = null

    $wrapper = UnSelectionBlock.getTaskBlock data

    if rootNode.is('p') and @editor.util.isEmptyNode rootNode
      $(rootNode).replaceWith($wrapper);
    else
      rootNode.after($wrapper)

    $wrapper.after($newLine);

    @editor.selection.setRangeAtStartOf $newLine, range