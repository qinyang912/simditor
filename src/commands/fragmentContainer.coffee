
class FragmentContainer extends SimpleModule
  constructor: ->
    @nodes = []

  addNode: (node) ->
    @nodes.push(node)

  getParent: ->
    if @nodes.length
      return @nodes[0].parentNode
    else
      return null

  insertBeforeFirst: (node) ->
    if !@nodes.length
      return
    parent = @getParent()
    parent.insertBefore(node, @nodes[0])

  appendNodeAfter: (node) ->
    if !@nodes.length
      return
    parent = @getParent()
    last = @nodes[@nodes.length - 1]
    parent.insertBefore(node, last.nextSibling)

  removeNodeAt: (m) ->
    @nodes.splice(m, 1)

  addNodeAt: (f, e) ->
    @nodes.splice(e, 0, f);

Simditor.FragmentContainer = FragmentContainer