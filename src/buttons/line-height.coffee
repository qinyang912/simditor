class LineHeightButton extends Button

  name: 'line-height'

  icon: 'line-height'

  disableTag: 'pre'

  menu: true

  _init: ->
    @menu = [
    	{
        name: '1.0',
        text: '1.0',
        param: 1.0
      }, {
        name: '1.25',
        text: '1.25',
        param: 1.25
      }, {
        name: '1.57',
        text: '1.57',
        param: 1.57
      }, {
        name: '1.75',
        text: '1.75',
        param: 1.75
      }, {
        name: '2.0',
        text: '2.0',
        param: 2.0
      }, {
        name: '2.5',
        text: '2.5',
        param: 2.5
      }, {
        name: '3.0',
        text: '3.0',
        param: 3.0
      }
    ];
    super()

  command: (param) ->
    rootNodes = @editor.selection.rootNodes()
    rootNodes.each (i) =>
      $node = rootNodes.eq i
      $node.css 'line-height', param
    @editor.trigger 'valuechanged'

Simditor.Toolbar.addButton LineHeightButton