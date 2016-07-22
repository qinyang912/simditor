class StripCommand extends InlineCommand

  options:
    title: "StripCommand"

  constructor: (editor, settings, options) ->
    @options = $.extend @options, options || {}
    super(editor, settings, @options)

  getState: ->
    1
  traverseFragments: (range) ->
    if @settings.selectAll

    else
      super(range)

  shouldCollectNode: (node) ->
    !Simditor.CommandUtil.isPreContent(node) && 
    !Simditor.CommandUtil.isTableContent(node) &&
    !Simditor.CommandUtil.isMentionContent(node)

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
      @extractFormatting(g, f, h)
      @removeSameFormatChildren(g)
      @removeNodeFormatting(g)
      @removeEmptyNode(g)

  restoreRange: ->
    if @settings.selectAll
      # var f = @getContentElement();
      # a(f).find("." + @getMarkersCssClass()).remove();
      # d.normalize(f);
    else
      super()

  getContentElement: ->
    return @settings.contentElement || super()

