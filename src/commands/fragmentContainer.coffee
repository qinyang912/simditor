
class FragmentContainer extends SimpleModule
  constructor: ->
    @nodes = []

  addNode: (node) ->
    @nodes.push(node)

Simditor.FragmentContainer = FragmentContainer