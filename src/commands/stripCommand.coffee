class StripCommand extends InlineCommand

  options:
    title: "StripCommand"

  constructor: (editor, settings, options) ->
    @options = $.extend @options, options || {}
    super(editor, settings, @options)

  getState: ->

  traverseFragments: (range) ->
    if @settings.selectAll

    else
      super(range)

  shouldCollectNode: ->
    true

  getEditorRange: ->
    if @settings.selectAll

    else
      return super()