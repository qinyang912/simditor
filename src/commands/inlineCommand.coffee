
class InlineCommand extends CommandBase

  markerClass: "__telerik_marker"

  lineBreakCode: 8203

  settings: {}

  options: 
    title: "Inline command"
    canUnexecute: false

  constructor: (editor, settings, options) ->
    @settings = settings || {}
    @options  = $.extend @options, options || {}
    super(@options.title, @options.canUnexecute, editor)

  onExecute: ->
    try
      return @executeInlineCommand()
    catch error
      # a("." + @markerClass, this.get_editor().get_contentArea()).remove()

  executeInlineCommand: ->
    editor = @get_editor()
    @range = @getEditorRange()
    @collapsedRange = @range.collapsed
    if @collapsedRange and @isGreedy()
      boundary = @getWordBoundaries(@range.startContainer, @range.startOffset)
      @range.setStart(@range.startContainer, boundary.left)
      @range.setEnd(@range.startContainer, boundary.right)
      @range.select()
      @collapsedRange = @range.collapsed

    fragments = @traverseFragments(@range)


    # var j = this
    #   , n = j.range = j.getEditorRange()
    #   , l = j.get_editor()
    #   , o = j.getState(l.get_contentWindow(), l)
    #   , k = j.collapsedRange = n ? n.isCollapsed() : true;
    # if (k && this.isGreedy()) {
    #     var i = j.getWordBoundaries(n.startContainer, n.startOffset);
    #     n.setStart(n.startContainer, i.left);
    #     n.setEnd(n.startContainer, i.right);
    #     n.select();
    #     j.collapsedRange = n.isCollapsed();
    # }
    # var m = j.traverseFragments(n);
    # j.emptyRange = n ? n.toString() == "" : true;
    # j.storeRangeByFragments(m);
    # j.rangeChanged = false;
    # j.removeFormatting = j.shouldRemoveFormatting(o);
    # if (j.removeFormatting) {
    #     j.removeFormat(m);
    # } else {
    #     j.formatFragments(m);
    # }
    # j.fireFormattingChanged();
    # j.consolidate(n);
    # if (!j.rangeChanged) {
    #     j.restoreRange();
    # }
    # return true;

  isGreedy: ->
    !@settings.isNotGreedy

  getWordBoundaries: (startContainer, startOffset) ->
    boundary = 
      left: -1
      right: 1
    nodeValue = startContainer.nodeValue
    if !nodeValue or @isCharEmptyOrWhiteSpace(nodeValue.charAt(startOffset)) or @isCharEmptyOrWhiteSpace(nodeValue.charAt(startOffset - 1))
      return {
        right: startOffset
        left: startOffset
      }
    left = @getBoundary(startOffset, nodeValue, boundary.left)
    right = @getBoundary(startOffset, nodeValue, boundary.right)
    return {
      right: right,
      left: left
    };

  getBoundary: (startOffset, nodeValue, boundary) ->
    l = startOffset <= 0 || startOffset >= nodeValue.length;
    if nodeValue.charAt(startOffset) == " "
      j = boundary < 0 ? 1 : 0;
      return startOffset + j;
    if l
      return startOffset;
    startOffset += boundary;
    return this.getBoundary(startOffset, nodeValue, boundary);

  isCharEmptyOrWhiteSpace: (char) ->
    if !char then return true
    /\s/g.test(char) || char.charCodeAt(0) == @lineBreakCode

  traverseFragments: (range) ->
    range = range || @range
    rangeFragmentsTraverse = new Simditor.RangeFragmentsTraverser @get_editor(), range
    rangeFragmentsTraverse.traverseFragments(@traverseCondition.bind(@))

  traverseCondition: (node) ->
    return @shouldCollectNode()
  getEditorRange: ->
    return Simditor.DomRange.toDomRange(@get_editor(), @get_editor().selection.range())    
