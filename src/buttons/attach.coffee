
class AttachButton extends Button

  name: 'attach'

  icon: 'attach'

  disableTag: 'pre, table'

  needFocus: false

  render: (args...) ->
    super args...

    @input = null
    @_initUploader()

  createInput: ->
    @input.remove() if @input
    @input = $ '<input/>',
      type: 'file'
      title: @_t('uploadAttach')
      multiple: false
      accept: '*/*'
    .appendTo(@el)
      

  _initUploader: ->
  
    @createInput()

    @el.on 'change', 'input[type=file]', (e) =>
      if @editor.inputManager.focused
        @editor.attach.upload @input,
          inline: true
        @createInput()
      else
        @editor.focus()
        @editor.attach.upload @input,
          inline: true
        @createInput()

  setDisabled: (disabled) ->
    super disabled
    @input.prop 'disabled', disabled if @input


Simditor.Toolbar.addButton AttachButton