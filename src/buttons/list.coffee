
class ListButton extends Button

  type: ''

  disableTag: 'pre, table'

  command: (param) ->
    $rootNodes = @editor.selection.blockNodes()
    anotherType = if @type == 'ul' then 'ol' else 'ul'
    @editor.selection.save()

    $list = null
    $rootNodes.each (i, node) =>
      $node = $ node
      return if $node.is('blockquote, li') or $node.is(@disableTag) or
        @editor.util.isDecoratedNode($node) or !$.contains(document, node)

      if $node.is @type
        $node.children('li').each (i, li) =>
          $li = $(li)
          $childList = $li.children('ul, ol').insertAfter($node)
          $('<p/>').append($(li).html() || @editor.util.phBr)
            .insertBefore($node)
        $node.remove()
      else if $node.is anotherType
        $('<' + @type + '/>').append($node.contents())
          .replaceAll($node)
      else if $list and $node.prev().is($list)
        $('<li/>').append($node.html() || @editor.util.phBr)
          .appendTo($list)
        $node.remove()
      else
        $list = $("<#{@type}><li></li></#{@type}>")
        $list.find('li').append($node.html() || @editor.util.phBr)
        $list.replaceAll($node)

    @editor.selection.restore()
    @editor.trigger 'valuechanged'


class OrderListButton extends ListButton
  type: 'ol'
  name: 'ol'
  icon: 'ordered-list'
  htmlTag: 'ol'
  shortcut: 'alt+o'
  _init: ->
    @title = @title + ' ( Alt + O )'
    super()

class UnorderListButton extends ListButton
  type: 'ul'
  name: 'ul'
  icon: 'unordered-list'
  htmlTag: 'ul'
  shortcut: 'alt+u'
  _init: ->
    @title = @title + ' ( Alt + U )'
    super()

Simditor.Toolbar.addButton OrderListButton
Simditor.Toolbar.addButton UnorderListButton
