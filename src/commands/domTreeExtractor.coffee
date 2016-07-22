
class DomTreeExtractor extends SimpleModule
  constructor: (topNode) ->
    @top = topNode

  extractBefore: (node) ->
    return @_traverseSide
      edge: node
      next: (n) =>
        n.previousSibling
      insert: (f, g) =>
        f.insertBefore(g, f.firstChild)

  extractAfter: (node) ->
    return @_traverseSide
      edge: node,
      next: (n) =>
        n.nextSibling
      insert: (f, g) =>
        f.appendChild(g)

  _traverseSide: (data) ->
    top = @top
    fragment = document.createDocumentFragment()
    edge = data.edge
    loop
      parentNode = edge.parentNode
      edge = data.next(edge)
      while edge
        i = data.next(edge)
        data.insert(fragment, edge)
        edge = i
      if parentNode != top
        e = parentNode.cloneNode(false)
        e.innerHTML = ""
        e.appendChild(fragment)
        data.insert(fragment, e)
      edge = parentNode
      break unless edge && edge != top

    return fragment

Simditor.DomTreeExtractor = DomTreeExtractor