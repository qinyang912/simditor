
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
    _delete: 'unselection-attach-delete'

  @attr:
    select: 'data-unselection-select'
    bucket: 'data-bucket'
    key: 'data-key-name'
    unique: 'data-unique-id'
    fileId: 'data-file-id'
    fileName: 'data-file-name'
    fileSrc: 'data-file-src'
    attach: 'data-attach'

  _selectedWrapper: null

  @_tpl:
    wrapper: "<p class='#{UnSelectionBlock.className.wrapper}'></p>"
    attach: "
      <inherit>
        <span class='#{UnSelectionBlock.className.inlineWrapper}'>
          <span class='#{UnSelectionBlock.className.attach} #{UnSelectionBlock.className.content}' contenteditable='false'>
            <span class='simditor-r-icon-attachment unselection-attach-icon'></span>
            <span data-name=''></span>
            <span class='unselection-attach-operation' contenteditable='false'>
              <span class='simditor-r-icon-eye unselection-attach-operation-icon unselection-attach-preview' title='预览'></span>
              <a class='simditor-r-icon-download unselection-attach-operation-icon unselection-attach-download' title='下载' target='_blank' download='QQ20160613-0@2x.png'></a>
              <span class='simditor-r-icon-arrow_down unselection-attach-operation-icon unselection-attach-more' title='更多'>
                <span class='unselection-attach-menu'>
                  <span class='unselection-attach-menu-item unselection-attach-delete' title='删除'>删除</span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </inherit>"
    img: "<img src='' alt=''>"

  _init: ->
    @editor = @_module
    @editor.on 'selectionchanged', @_onSelectionChange.bind(@)
    @_preview()
    @_patchFirefox()
    $(document).on 'click.simditor-unSelection', ".#{UnSelectionBlock.className.wrapper}", (e) =>
      @_unSelectionClick = true
    $(document).on 'click.simditor-unSelection', (e) =>
      if !@_unSelectionClick      
        @_selectCurrent(false)
      else
        @_unSelectionClick = false
      return

    @editor.body.on 'click.simditor-unSelection', ".#{UnSelectionBlock.className._delete}", (e) =>
      wrapper = $(e.target).closest(".#{UnSelectionBlock.className.wrapper}")
      if wrapper.length
        @_delete(wrapper)
        
    $(document).on 'keydown.simditor-unSelection', (e) =>
      if @_selectedWrapper
        if e.which == 8
          e.preventDefault()

    $(document).on 'keyup.simditor-unSelection', (e) =>
      console.log('e', e)
      if @_selectedWrapper
        switch e.which
          when 13 then @_skipToNextNewLine()
          when 40, 39 then @_skipToNextLine()
          when 38, 37 then @_skipToPrevLine()
          when 8 
            @_delete() 
            e.preventDefault()

  @getAttachHtml: (data) ->
    wrapper = UnSelectionBlock._getWrapper(data)
    wrapper.append UnSelectionBlock._tpl.attach
    wrapper.attr(UnSelectionBlock.attr.attach, true)
    if data && data.file
      $operate = wrapper.find('.unselection-attach-operation')
      $preview = wrapper.find('.unselection-attach-preview')
      $download = wrapper.find('.unselection-attach-download')
      $name = wrapper.find('[data-name]')

      $operate.attr(UnSelectionBlock.attr.bucket, data.bucket)
      $operate.attr(UnSelectionBlock.attr.key, data.file.filePath)

      $name.attr('data-name', data.file.name)

      $download.attr('href', data.file.realPath)
      $download.attr('download', data.file.name)

      if data.previewFile
        $preview.attr('href', data.viewPath)
        if data.framePreviewFile
          $preview.addClass 'mfp-iframe'
      else 
        $preview.remove()


    $(document.createElement('div')).append(wrapper).html()

  @getImgHtml: (data) ->
    wrapper = UnSelectionBlock._getWrapper(data)
    wrapper.append UnSelectionBlock._tpl.img
    if data && data.file
      $img = wrapper.find('img');
      $img.attr('src', data.file.realPath)
      $img.attr('alt', data.file.name)
      $img.attr(UnSelectionBlock.attr.bucket, data.bucket)
      $img.attr(UnSelectionBlock.attr.key, data.file.filePath)
      
    $(document.createElement('div')).append(wrapper).html()

  @_getWrapper: (data) ->
    wrapper = $(UnSelectionBlock._tpl.wrapper)
    wrapper.attr(UnSelectionBlock.attr.unique, UnSelectionBlock._guidGenerator())
    wrapper.attr(UnSelectionBlock.attr.fileId, data.file.id)

  @_guidGenerator: ->
    S4 = () =>
      (((1+Math.random())*0x10000)|0).toString(16).substring(1)
    (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4())

  _skipToPrevLine: () ->
    wrapper = @_selectedWrapper[0]
    previousSibling = @editor.util.getPrevNode wrapper
    if previousSibling
      range = document.createRange()
      @editor.selection.setRangeAtEndOf previousSibling, range

  _skipToNextLine: () ->
    wrapper = @_selectedWrapper[0]
    nextSibling = @editor.util.getNextNode wrapper
    if nextSibling
      range = document.createRange()
      @editor.selection.setRangeAtStartOf nextSibling, range

  _skipToNextNewLine: ->
    p = document.createElement('p')
    p.innerHTML = '<br>'
    wrapper = @editor.util.getRootNodeFromNode(@_selectedWrapper)
    wrapper = $(wrapper)
    wrapper.after(p)
    range = document.createRange()
    @editor.selection.setRangeAtStartOf p, range

  _onSelectionChange: ->
    range = @editor.selection.range()
    if range and range.endContainer
      wrapper1 = $(range.endContainer).closest('.' + UnSelectionBlock.className.wrapper)
      wrapper2 = $(range.endContainer).find('.' + UnSelectionBlock.className.wrapper).last()
      if wrapper1.length
        wrapper = wrapper1
      else if wrapper2.length
        wrapper = wrapper2
      if wrapper
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

  _delete: (wrapper = @_selectedWrapper) ->
    if wrapper
      previousSibling = wrapper[0].previousSibling
      wrapper.remove()
      if previousSibling
        range = document.createRange()
        @editor.selection.setRangeAtEndOf previousSibling, range
      @editor.trigger 'valuechanged'

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
