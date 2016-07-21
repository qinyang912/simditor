
NodeComparer =

  util: Simditor.CommandUtil

  equalNodes: (h, i) ->
    @equalTag(h, i) && @equalStyle(h, i) && this.equalAttributes(h, i);

  equalTag: (h, i) ->
    @util.isTag(h, i.tagName)

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
      @util.getAttributes(h, i)
    else
      @util.getDefinedAttributes(h)

Simditor.NodeComparer = NodeComparer