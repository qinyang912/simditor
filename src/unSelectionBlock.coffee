
class UnSelectionBlock extends SimpleModule

  @pluginName: 'UnSelectionBlock'

  @className:
    wrapper: 'unselection-wrapper'
    img: 'unselection-img'
    attach: 'unselection-attach'
    select: 'unselection-select'
    content: 'unselection-content'

  @attr:
    select: 'data-unselection-select'

  _selectedWrapper: null

  _tpl:
    wrapper: "<p class='#{UnSelectionBlock.className.wrapper}'></p>"
    attach: "
      <inherit>
        <span class='#{UnSelectionBlock.className.attach} #{UnSelectionBlock.className.content}' contenteditable='false'>
          <span class='simditor-r-icon-attachment unselection-attach-icon'></span>
          <span data-name='我草你name我草你name我草你name我草你name我草你name我草你name我草你name.zip'></span>
          <span class='unselection-attach-operation'>
            <span class='simditor-r-icon-eye unselection-attach-operation-icon' title='预览'></span>
            <a class='simditor-r-icon-download unselection-attach-operation-icon' title='下载'></a>
            <span class='simditor-r-icon-arrow_down unselection-attach-operation-icon' title='更多'></span>
          </span>
        </span>
      </inherit>"

  _init: ->
    console.log('_tpl', @_tpl)
    @editor = @_module
    @editor.on 'selectionchanged', @_onSelectionChange.bind(@)
      
      # @editor.selection.clear()

  getAttachHtml: ->
    wrapper = @_getWrapper()
    wrapper.append @_tpl.attach

    $(document.createElement('div')).append(wrapper).html()

  getImgHtml: ->

  _getWrapper: ->
    $(@_tpl.wrapper)

  _onSelectionChange: ->
    range = @editor.selection.range()
    if range and range.endContainer
      wrapper = $(range.endContainer).closest('.' + UnSelectionBlock.className.wrapper)
      if wrapper.length
        setTimeout =>
          @editor.blur()
          @editor.selection.clear()
          @_selectedWrapper = wrapper
          @_selectedWrapper.attr UnSelectionBlock.attr.select, 'true'
        , 0
      else
        if @_selectedWrapper
          @_selectedWrapper.removeAttr UnSelectionBlock.attr.select
          @_selectedWrapper = null
