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

  getSameFormatChildren: (node) ->
    $.makeArray $(node).find("*").filter (h, g) =>
      @isSameFormatNode(g) && !@isMarker(g);

  findFormattedAncestor: (node) ->
    tmp = node;
    while !@get_editor().util.isBlockNode(node)
      if @isSameFormatNode(node)
        tmp = node
      node = node.parentNode
    tmp

  removeFormat_extract: (g, f, h) ->
    if !@get_editor().util.isBlockNode(g)
      @extractFormatting(g, f, h);
      @removeSameFormatChildren(g);
      @removeNodeFormatting(g);
      @removeEmptyNode(g);

