
class FontScaleButton extends Button

  name: 'fontScale'

  icon: 'type-size'

  disableTag: 'pre'

  htmlTag: 'span'

  _init: ->
    @menu = [{
      name: '75%'
      text: '12'
      param: '1'
    }, {
      name: '87.5%'
      text: '14'
      param: '2'
    }, {
      name: '100%'
      text: '16'
      param: '3'
    }, {
      name: '112.5%'
      text: '18'
      param: '4'
    }, {
      name: '125%'
      text: '20'
      param: '5'
    }, {
      name: '150%'
      text: '24'
      param: '6'
    }, {
      name: '187.5%'
      text: '30'
      param: '7'
    }]
    super()

  _activeStatus: ->
    range = @editor.selection.range()
    startNodes = @editor.selection.startNodes()
    endNodes = @editor.selection.endNodes()
    startNode = startNodes.eq 0
    endNode = endNodes.eq 0
    active = startNodes.length > 0 and endNodes.length > 0 and startNode.is(endNode)
    @node = if active then startNode else null
    @node = if @node != null and @node[0].nodeType is Node.TEXT_NODE then @node.parent() else @node
    @setActive active
    @active

  setActive: (active) ->
    super active
    @el.removeClass 'active-font'
    return if not active
    fontSize = window.getComputedStyle(@node[0], null).getPropertyValue('font-size')
    @el.addClass('active active-font')
    @el.find('span').attr 'data-size', fontSize.replace('px', '')

  command: (param)->
    document.execCommand 'fontSize', false, param
    @editor.trigger 'valuechanged'

Simditor.Toolbar.addButton FontScaleButton
