
class CommandBase extends SimpleModule
    
  constructor: (title, canUnexecute, editor) ->
    @_title = title
    @_isExecuted = false
    @_canUnexecute = (canUnexecute != false)
    @_editor = editor

  get_editor: ->
    @_editor