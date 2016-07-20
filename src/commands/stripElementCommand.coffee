
class StripElementCommand extends StripCommand

	constructor: (editor, settings, options) ->
    tags = settings.tags || []
    if tags[0] == "ALL" 
      reg = "(?:[a-z]+:)?[a-z]+[1-6]?"
    else
      reg = tags.join "|"
    @nodeNamesRegExp = new RegExp("^(?:" + reg + ")$","i")
    settings.exclude = settings.exclude || []
    settings.stripCondition = settings.stripCondition || (l) => false
    super(editor, settings, options)

  getSameFormatChildren: (node) ->
    if @_isStripAll()
      return @get_editor().util.getAllChildNodesBy(node, StripElementCommand.c)
    else
      return super(node)

  isSameFormatNode: (node) ->
    node && (@settings.stripCondition(node) || (@isCommentToStrip(node) || @isTagToStrip(node)))

  isCommentToStrip: (node) ->
    @_isStripAll() && @isComment(node)

  isTagToStrip: (node) ->
    @settings.tags && (@nodeNamesRegExp.test(node.nodeName) && !@get_editor().util.isEditorContentArea(node) && !@_isNodeExcluded(node));

  removeNodeFormatting: (node) ->
    if @isCommentToStrip(node)
      node.parentNode.removeChild(node);
    else
      if !@get_editor().util.isTextNode(node) && !@isMarker(node)
        # if @isLegacyIE
        #   var h = e.getOuterHtml(node);
        #   var j = h.indexOf("<");
        #   if (/^\s+/.test(h) && j > 0) {
        #     var i = h.substring(0, j);
        #     node.parentNode.insertBefore(node.ownerDocument.createTextNode(i), node);
        #   }
        @get_editor().util.removeNode(node);

  _isStripAll: ->
    @settings.tags && @settings.tags[0] == "ALL"

  _isNodeExcluded: (node) ->
    $.inArray(node.nodeName.toLowerCase(), @settings.exclude) >= 0

StripElementCommand.c = () => true

Simditor.StripElementCommand = StripElementCommand