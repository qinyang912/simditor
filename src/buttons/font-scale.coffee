
class FontScaleButton extends Button

  name: 'fontScale'

  icon: 'font'

  disableTag: 'pre'

  htmlTag: 'span'

  _init: ->
    @menu = [{
      name: '75%'
      text: '12'
      param: '12px'
    }, {
      name: '87.5%'
      text: '14'
      param: '14px'
    }, {
      name: '100%'
      text: '16'
      param: '16px'
    }, {
      name: '112.5%'
      text: '18'
      param: '18px'
    }, {
      name: '125%'
      text: '20'
      param: '20px'
    }, {
      name: '150%'
      text: '24'
      param: '24px'
    }, {
      name: '187.5%'
      text: '30'
      param: '30px'
    }, {
      name: '225%'
      text: '36'
      param: '36px'
    }]
    super()

  _activeStatus: ->
    range = @editor.selection.range()
    startNodes = @editor.selection.startNodes()
    endNodes = @editor.selection.endNodes()
    startNode = startNodes.filter('span[style*="font-size"]')
    endNode = endNodes.filter('span[style*="font-size"]')
    active = startNodes.length > 0 and endNodes.length > 0 and startNode.is(endNode)
    @node = if active then startNode else null
    @setActive active
    @active

  setActive: (active, param) ->
    super active
    @el.removeClass 'active-font active-12 active-14 active-16 active-18 active-20 active-24 active-30 active-36'
    return if not active
    fontSize = window.getComputedStyle(@node[0], null).getPropertyValue('font-size');
    console.log('setActive', fontSize, @el);
    
    @el.addClass('active active-font active-' + fontSize.replace('px', ''))

  command: (param)->
    range = @editor.selection.range()
    return if range.collapsed

    # Use span[style] instead of font[size]
    document.execCommand 'styleWithCSS', false, true
    document.execCommand 'fontSize', false, 3
    document.execCommand 'styleWithCSS', false, false
    @editor.selection.reset()
    @editor.selection.range()

    containerNode = @editor.selection.containerNode()

    if containerNode[0].nodeType is Node.TEXT_NODE
      $scales = containerNode.closest('span[style*="font-size"]')
    else
      $scales = containerNode.find('span[style*="font-size"]')

    $scales.each (i, n) =>
      $span = $(n)
      size = n.style.fontSize
      $span.css('fontSize', param)

    @editor.trigger 'valuechanged'

Simditor.Toolbar.addButton FontScaleButton
