
class UnSelectionBlock extends SimpleModule

  @pluginName: 'UnSelectionBlock'

  @className:
    wrapper: 'unselection-wrapper'
    inlineWrapper: 'unselection-inline-wrapper'
    img: 'unselection-img'
    attach: 'unselection-attach'
    select: 'unselection-select'
    content: 'unselection-content'
    preview: 'unselection-attach-preview'

  @attr:
    select: 'data-unselection-select'

  _selectedWrapper: null

  _tpl:
    wrapper: "<p class='#{UnSelectionBlock.className.wrapper}'></p>"
    attach: "
      <inherit>
        <span class='#{UnSelectionBlock.className.inlineWrapper}'>
          <span class='#{UnSelectionBlock.className.attach} #{UnSelectionBlock.className.content}' contenteditable='false'>
            <span class='simditor-r-icon-attachment unselection-attach-icon'></span>
            <span data-name='我草你name我草你name我草你name我草你name我草你name我草你name我草你name.zip'></span>
            <span class='unselection-attach-operation' contenteditable='false'>
              <span class='simditor-r-icon-eye unselection-attach-operation-icon unselection-attach-preview' title='预览' href='http://rishiqing-file.oss-cn-beijing.aliyuncs.com/20160615104351QQ20160613-0%402x.png?Expires=1469588493&OSSAccessKeyId=JZJNf7zIXqCHwLpT&Signature=QxF6VkVzic2WUg%2BqlxEfgyc97Tk%3D'></span>
              <a class='simditor-r-icon-download unselection-attach-operation-icon unselection-attach-download' title='下载' target='_blank' download='QQ20160613-0@2x.png' href='http://rishiqing-file.oss-cn-beijing.aliyuncs.com/20160615104351QQ20160613-0%402x.png?Expires=1469588493&OSSAccessKeyId=JZJNf7zIXqCHwLpT&Signature=QxF6VkVzic2WUg%2BqlxEfgyc97Tk%3D'></a>
              <span class='simditor-r-icon-arrow_down unselection-attach-operation-icon' title='更多'></span>
            </span>
          </span>
        </span>
      </inherit>"

  _init: ->
    @editor = @_module
    @editor.on 'selectionchanged', @_onSelectionChange.bind(@)
    @_preview()
    @_patchFirefox()
    $(document).on 'click.unSelection', ".#{UnSelectionBlock.className.wrapper}", (e) =>
      @_unSelectionClick = true
    $(document).on 'click.unSelection', (e) =>
      if !@_unSelectionClick      
        @_selectCurrent(false)
      else
        @_unSelectionClick = false
      return

    $(document).on 'keyup.unSelection', (e) =>
      console.log('e', e)
      if @_selectedWrapper
        switch e.which
          when 13 then @_skipToNextNewLine()
          when 40, 39 then @_skipToNextLine()
          when 38, 37 then @_skipToPrevLine()
          when 8 then @_delete()

  getAttachHtml: ->
    wrapper = @_getWrapper()
    wrapper.append @_tpl.attach

    $(document.createElement('div')).append(wrapper).html()

  getImgHtml: ->

  _skipToPrevLine: () ->
    wrapper = @_selectedWrapper[0]
    previousSibling = wrapper.previousSibling
    if previousSibling
      range = document.createRange()
      @editor.selection.setRangeAtEndOf previousSibling, range

  _skipToNextLine: () ->
    wrapper = @_selectedWrapper[0]
    nextSibling = wrapper.nextSibling
    if nextSibling
      range = document.createRange()
      @editor.selection.setRangeAtStartOf nextSibling, range

  _skipToNextNewLine: ->
    p = document.createElement('p')
    p.innerHTML = '<br>'
    wrapper = @_selectedWrapper
    wrapper.after(p)
    range = document.createRange()
    @editor.selection.setRangeAtStartOf p, range

  _getWrapper: ->
    $(@_tpl.wrapper)

  _onSelectionChange: ->
    range = @editor.selection.range()
    if range and range.endContainer
      wrapper = $(range.endContainer).closest('.' + UnSelectionBlock.className.wrapper)
      if wrapper.length
        setTimeout =>
          @_selectWrapper(wrapper)
        , 150
      else
        if @_selectedWrapper
          @_selectCurrent false

  _selectCurrent: (type = true) ->
    if @_selectedWrapper
      if type
        @_selectedWrapper.attr UnSelectionBlock.attr.select, 'true'
      else
        @_selectedWrapper.removeAttr UnSelectionBlock.attr.select
        @_selectedWrapper = null

  _selectWrapper: (wrapper) ->
    @editor.blur()
    @editor.selection.clear()
    @_selectCurrent false
    @_selectedWrapper = wrapper
    @_selectCurrent()

  _patchFirefox: -> #针对firefox的一些补丁
    if @editor.util.browser.firefox
      @editor.body.on 'click.unSelection', ".#{UnSelectionBlock.className.wrapper}", (e) =>
        wrapper = $(e.target).closest(".#{UnSelectionBlock.className.wrapper}")
        if wrapper.length
          setTimeout =>
            @_selectWrapper(wrapper)
          , 0

  _delete: ->

  _preview: ->
    # 判断是否有magnificPopup插件，这个文件预览必须是magnificPopup插件才能支持
    return unless $.fn.magnificPopup
    @editor.body.magnificPopup
      delegate: ".#{UnSelectionBlock.className.preview}"
      type: 'image'
      preloader: true
      removalDelay: 1000
      mainClass: 'mfp-fade' # 'mfp-with-zoom',
      tLoading: 'Loading...'
      zoom:
        enabled: true # By default it's false, so don't forget to enable it
        duration: 300 # duration of the effect, in milliseconds
        easing: 'ease-in-out' # CSS transition easing function
        # The "opener" function should return the element from which popup will be zoomed in
        # and to which popup will be scaled down
        # By defailt it looks for an image tag:
        opener: (openerElement) =>
          # openerElement is the element on which popup was initialized, in this case its <a> tag
          # you don't need to add "opener" option if this code matches your needs, it's defailt one.
          # if openerElement.is('img')
          #   return openerElement
          # else
          #   return openerElement.find('img')
          openerElement

      callbacks: 
        beforeOpen: ->
        open: ->
        close: ->
        elementParse: ->
      gallery:
        enabled: true
        preload: [0, 2]
        navigateByImgClick: false
        tPrev: '上一个' # title for left button
        tNext: '下一个'

      image:
        titleSrc: 'title'
        tError: '<a href="%url%">The image</a> could not be loaded.'
      iframe: {}
      ajax:
        tError: '<a href="%url%">The content</a> could not be loaded.'
