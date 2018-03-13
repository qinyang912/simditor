
class BlockquoteButton extends Button

  name: 'blockquote'

  icon: 'quote'

  htmlTag: 'blockquote'

  disableTag: 'pre, table'

  shortcut: 'super+alt+.',

  _init: ->
    if @editor.util.os.mac
      @title = "#{@title} ( Cmd + opt + . )"
    else
      @title = "#{@title} ( Ctrl + alt + ' )"
      @shortcut = 'super+alt+\''
    super()

  command: ->
    $rootNodes = @editor.selection.rootNodes()
    $rootNodes = $rootNodes.filter (i, node) ->
      !$(node).parent().is('blockquote')
    @editor.selection.save()

    nodeCache = []

    clearCache = =>
      if nodeCache.length > 0
        $("<#{@htmlTag}/>")
          .insertBefore(nodeCache[0])
          .append(nodeCache)
        nodeCache.length = 0

    $rootNodes.each (i, node) =>
      $node = $ node
      return unless $node.parent().is(@editor.body)

      if $node.is @htmlTag
        clearCache()
        $node.children().unwrap()
      else if $node.is(@disableTag) or @editor.util.isDecoratedNode($node)
        clearCache()
      else
        nodeCache.push node

    clearCache()
    @editor.selection.restore()
    @editor.trigger 'valuechanged'

Simditor.Toolbar.addButton BlockquoteButton
