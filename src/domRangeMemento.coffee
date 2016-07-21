
class DomRangeMemento extends SimpleModule
  constructor: (editor, range) ->
    domRange = Simditor.DomRange.toDomRange(editor, range)
    @collapsed = domRange.isCollapsed();
    if !editor.util.isTextNode(domRange.startContainer) && domRange.startContainer.childNodes[domRange.startOffset] && !editor.util.isTextNode(domRange.startContainer.childNodes[domRange.startOffset])
      @startContainer = domRange.startContainer.childNodes[domRange.startOffset];
      @startOffset = false;
    else
      @startContainer = domRange.startContainer;
      @startOffset = domRange.startOffset;
    if !editor.util.isTextNode(domRange.endContainer) && domRange.endContainer.childNodes[domRange.endOffset] && !editor.util.isTextNode(domRange.endContainer.childNodes[domRange.endOffset])
      @endContainer = domRange.endContainer.childNodes[domRange.endOffset];
      @endOffset = false;
    else
      if !editor.util.isTextNode(domRange.endContainer) && !editor.util.isTag(domRange.endContainer, "img") && domRange.endContainer.childNodes > 0 && !domRange.endContainer.childNodes[domRange.endOffset]
        @endContainer = domRange.endContainer;
        @endOffset = "outside";
      else
        @endContainer = domRange.endContainer;
        @endOffset = domRange.endOffset;

  restoreToRange: (domRange) ->
    @restoreStart(domRange)
    if @endOffset == false
      domRange.setEndBefore(@endContainer)
    else
      if @endOffset == "outside"
        domRange.setEnd(@endContainer, Math.max(1, @endContainer.childNodes.length - 1))
      else
        domRange.setEnd(@endContainer, @endOffset)
    @restoreStart(domRange)
    if @collapsed
      domRange.collapse()
    domRange.select()

  restoreStart: (domRange) ->
    if @startOffset == false
      domRange.setStartBefore(@startContainer)
    else
      domRange.setStart(@startContainer, @startOffset)


Simditor.DomRangeMemento = DomRangeMemento