class CheckboxButton extends Button

  name: 'checkbox'

  icon: 'seleced-mult'

  disableTag: 'pre,table,li li'

  htmlTag: Simditor.CheckBox.selector.checkbox

  enableTag: 'p,li,div' # 只有这里面的标签可以应用 checkbox

  _filterTag: '.unselection-wrapper' # 需要被过滤掉的标签

  _format: (node) ->
    $node = $(node)
    unless $node.is @enableTag
      return
    if $node.is @_filterTag
      return
    if $node.is 'li'
      $node = @_formatLi $node
    if $node.is Simditor.CheckBox.selector.checkbox
      $node.removeClass Simditor.CheckBox.className.unchecked
      $node.removeClass Simditor.CheckBox.className.checked
    else
      $node.addClass(Simditor.CheckBox.className.unchecked) # check-box-item-checked

  _formatLi: ($blockEl) -> # 格式化li标签的格式，使之正常变成p标签
    unless $blockEl.is 'li'
      return
    @editor.selection.save()
    $parent = $blockEl.parent()
    range = document.createRange()
    range.setStartBefore $parent[0]
    range.setEndBefore $blockEl[0]
    ec = range.extractContents()
    if $.trim ec.textContent # 如果抽取出来的内容是空的，则不再添加
      $parent.before ec

    $new = $('<p/>').insertBefore($parent)
      .after($blockEl.children('ul, ol'))
      .append($blockEl.contents())

    $blockEl.remove()

    if $.trim($parent.text()) == '' # 如果抽取之后， $parent的内容变成空的，则删除
      $parent.remove()

    @editor.selection.restore()
    $new

  command: ->
    roots = @editor.selection.rootNodes() # roots可能为undefined
    blocks = @editor.selection.blockNodes()

    if blocks and blocks.length
      blocks.each (i, e) =>
        @_format e
      
    @editor.trigger 'valuechanged'
    $(document).trigger 'selectionchange' # 人为触发一下selectionchange事件

Simditor.Toolbar.addButton CheckboxButton