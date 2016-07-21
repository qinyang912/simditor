
NodeComparer =

  equalNodes: (h, i) ->
    @equalTag(h, i) && @equalStyle(h, i) && this.equalAttributes(h, i);

  equalTag: (h, i) ->
    Simditor.CommandUtil.isTag(h, i.tagName)

  equalStyle: (h, i) ->
    h.style && i.style && h.style.cssText == i.style.cssText

  equalAttributes: (h, i, m) ->
    i = @_collectAttributes(h, m)
    k = @_collectAttributes(j, m)
    if i.length != k.length
      return false
    delete i.length
    delete i.style
    delete i.timestamp
    delete i.title
    for own key, value of i
      if i[key] != k[key]
        return false
    true

  _collectAttributes: (h, i) ->
    if i && i.length > 0
      Simditor.CommandUtil.getAttributes(h, i)
    else
      Simditor.CommandUtil.getDefinedAttributes(h)

Simditor.NodeComparer = NodeComparer