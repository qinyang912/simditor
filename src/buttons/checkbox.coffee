class CheckboxButton extends Button

  name: 'checkbox'

  icon: 'seleced-mult'

  disableTag: 'pre,table'

  command: ->
    # document.execCommand 'formatBlock', false, '<p>'
    roots = @editor.selection.rootNodes() # roots可能为undefined
    blocks = @editor.selection.blockNodes()

    if roots
      roots.addClass('check-box-item-unchecked') # check-box-item-checked
    console.log roots, blocks, @node

Simditor.Toolbar.addButton CheckboxButton