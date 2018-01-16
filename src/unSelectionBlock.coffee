
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
    download: 'unselection-attach-download'
    _delete: 'unselection-attach-delete'
    progress: 'unSelection-attach-progress'
    globalLink: 'unselection-global-link'
    taskBlock: 'unselection-task-block'
    taskBlockSetting: 'unselection-task-block-setting'

  @selector:
    content: '.unselection-content'
    subTitle: '[data-sub-title]'

  @attr:
    select: 'data-unselection-select'
    bucket: 'data-bucket'
    key: 'data-key-name'
    unique: 'data-unique-id'
    fileId: 'data-file-id'
    fileName: 'data-file-name'
    fileSrc: 'data-file-src'
    attach: 'data-attach'
    img: 'data-img'
    map: 'data-map'
    globalLink: 'data-global-link'
    globalLinkType: 'data-global-link-type'
    taskBlock: 'data-task-block'
    taskBlockSetting: 'data-setting'
    taskBlockTitle: 'data-title'
    taskBlockSubTitle: 'data-sub-title'
    location: 'data-location'

  @event:
    unSelect: 'un-selection-block-un-select'
    select: 'un-selection-block-select'
    unSelectDelete: 'un-selection-delete'

  _selectedWrapper: null

  @_tpl:
    wrapper: "<p class='#{UnSelectionBlock.className.wrapper}'></p>"
    attach: "
      <inherit>
        <span class='#{UnSelectionBlock.className.inlineWrapper}'>
          <span class='#{UnSelectionBlock.className.attach} #{UnSelectionBlock.className.content}' contenteditable='false'>
            <span class='simditor-r-icon-attachment unselection-attach-icon'></span>
            <span data-name=''></span>
            <span data-size='24M'></span>
            <span class='unselection-attach-operation' contenteditable='false'>
              <span class='simditor-r-icon-eye unselection-attach-operation-icon unselection-attach-preview' title='预览'></span>
              <a class='simditor-r-icon-download unselection-attach-operation-icon unselection-attach-download' title='下载' target='_blank'></a>
              <span class='simditor-r-icon-arrow_down unselection-attach-operation-icon unselection-attach-more' title='更多'>
                <span class='unselection-attach-menu'>
                  <span class='unselection-attach-menu-item unselection-attach-delete' title='删除'></span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </inherit>"
    img: "<img src='' alt=''>"
    uploader: "<span data-progress=''><span></span></span>"
    globalLink: "
      <inherit>
        <span class='#{UnSelectionBlock.className.inlineWrapper}'>
          <span class='#{UnSelectionBlock.className.globalLink} #{UnSelectionBlock.className.content}' contenteditable='false'>
            <span data-global-link-type=''></span>
            <span data-name=''></span>
            <span class='unselection-attach-operation' contenteditable='false'>
              <span class='simditor-r-icon-arrow_down unselection-attach-operation-icon unselection-attach-more' title='更多'>
                <span class='unselection-attach-menu'>
                  <span class='unselection-attach-menu-item unselection-attach-delete' title='删除'></span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </inherit>"
    taskBlock: "
      <inherit>
        <span class='#{UnSelectionBlock.className.inlineWrapper}'>
          <span class='#{UnSelectionBlock.className.taskBlock} #{UnSelectionBlock.className.content}' contenteditable='false'>
            <span data-title=''></span>
            <span data-sub-title=''></span>
            <span class='simditor-r-icon-setting #{UnSelectionBlock.className.taskBlockSetting}'></span>
            <span class='simditor-r-icon-close #{UnSelectionBlock.className._delete}'></span>
          </span>
        </span>
      </inherit>"

  _init: ->
    @editor = @_module
    @editor.on 'selectionchanged.simditor-unSelection', @_onSelectionChange.bind(@)
    @_preview()
    @_patchFirefox()
    @editor.body.on 'click.simditor-unSelection', ".#{UnSelectionBlock.className.wrapper}", (e) =>
      @_isUnSelectionClick = true
      
    @editor.body.on 'click.simditor-unSelection', ".#{UnSelectionBlock.className.globalLink}", (e) =>
      @_unGlobalLinkClick(e)

    @editor.body.on 'click.simditor-unSelection', ".#{UnSelectionBlock.className.preview}", (e) => 
      @_unAttachPreviewClick(e)
      return false;

    @editor.body.on 'click.simditor-unSelection', ".#{UnSelectionBlock.className.download}", (e) =>
      @_unAttachDownloadClick(e)
      return false;

    @editor.body.on 'click.simditor-unSelection', ".#{UnSelectionBlock.className.attach}", (e) =>
      @_unAttachClick(e)

    @editor.body.on 'click.simditor-unSelection', ".#{UnSelectionBlock.className.taskBlockSetting}", (e) =>
      @_unTaskBlockSettingClick(e)

    # 不知道为什么这里只监听.wrap，点击下面的img无法触发事件
    @editor.body.on 'click.simditor-unSelection', "[data-map] .wrap img,[data-map] .wrap", (e) => 
      @_unMapClick(e)

    $(document).on 'click.simditor-unSelection-' + @editor.id, (e) =>
      if !@_isUnSelectionClick and !@editor.imageBlock.isResize
        @_selectCurrent(false)
      else
        @_isUnSelectionClick = false
      return

    @editor.body.on 'click.simditor-unSelection', ".#{UnSelectionBlock.className._delete}", (e) =>
      wrapper = $(e.target).closest(".#{UnSelectionBlock.className.wrapper}", @editor.body)
      if wrapper.length
        @_delete(wrapper)
      return false;

    $(document).on 'keydown.simditor-unSelection' + @editor.id, (e) =>
      if @_selectedWrapper
        e.preventDefault()
        switch e.which
          when 13
            if e.shiftKey
              @_skipToPrevNewLine()
            else
              @_skipToNextNewLine()
          when 40, 39 then @_skipToNextLine()
          when 38, 37 then @_skipToPrevLine()
          when 8 
            @_delete() 
            e.preventDefault()

  @fillDataToAttach: (data, wrapper) ->
    wrapper.append UnSelectionBlock._tpl.attach
    wrapper.attr UnSelectionBlock.attr.attach, true
    if data && data.file
      $preview = wrapper.find('.unselection-attach-preview')
      $name = wrapper.find('[data-name]')
      $size = wrapper.find('[data-size]')

      $name.attr('data-name', data.file.name)
      $name.attr('title', data.file.name)

      $size.attr('data-size', UnSelectionBlock.getFileSize(data.file.size))

      if !data.previewFile
        $preview.remove()
        
  @getFileSize: (bytes) ->
    sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    return '0 B' if bytes == 0
    radix = Math.floor(Math.log(bytes) / Math.log(1024))
    i = parseInt(radix, 10)
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]


  @getAttachHtml: (data) ->
    wrapper = UnSelectionBlock.getWrapper(data)
    UnSelectionBlock.fillDataToAttach data, wrapper
    $(document.createElement('div')).append(wrapper).html()

  @getAttachUploaderHtml: (data, wrapper) ->
    wrapper = if wrapper then UnSelectionBlock.createWrapperByP wrapper.empty() else UnSelectionBlock.getWrapper(data)
    UnSelectionBlock.fillDataToAttach data, wrapper
    wrapper.find(UnSelectionBlock.selector.content).append UnSelectionBlock._tpl.uploader
    wrapper

  @getImgHtml: (data) ->
    wrapper = UnSelectionBlock.getWrapper(data)
    wrapper.append UnSelectionBlock._tpl.img
    wrapper.attr UnSelectionBlock.attr.img, true
    if data && data.file
      $img = wrapper.find('img');
      $img.attr('src', data.file.viewPath)
      $img.attr('alt', data.file.name)
      $img.attr(UnSelectionBlock.attr.bucket, data.bucket)
      $img.attr(UnSelectionBlock.attr.key, data.file.filePath)
      
    $(document.createElement('div')).append(wrapper).html()

  @getGlobalLink: (data, wrapper) ->
    wrapper = if wrapper then UnSelectionBlock.createWrapperByP wrapper.empty() else UnSelectionBlock.getWrapper(data)
    
    UnSelectionBlock.fillDataToGlobalLink data, wrapper
    wrapper

  @getGlobalLinkHtml: (data, wrapper) ->
    wrapper = UnSelectionBlock.getGlobalLink(data, wrapper)
    $(document.createElement('div')).append(wrapper).html()
  
  @fillDataToGlobalLink: (data, wrapper) ->
    wrapper.append UnSelectionBlock._tpl.globalLink
    wrapper.attr UnSelectionBlock.attr.globalLink, true
    if data and data.file
      wrapper.attr UnSelectionBlock.attr.fileId, data.file.id

      $name = wrapper.find('[data-name]')
      $type = wrapper.find('[data-global-link-type]')

      $name.attr('data-name', data.file.name)
      $name.attr('title', data.file.name)

      $type.attr UnSelectionBlock.attr.globalLinkType, data.file.type

      if data.file.type == 'file'
        $type.addClass 'simditor-r-icon-attachment'

  @getTaskBlock: (data, wrapper) ->
    wrapper = if wrapper then UnSelectionBlock.createWrapperByP wrapper.empty() else UnSelectionBlock.getWrapper(data)
    UnSelectionBlock.fillDataToTaskBlock data, wrapper
    wrapper

  @getTaskBlockHtml: (data, wrapper) ->
    wrapper = UnSelectionBlock.getTaskBlock data, wrapper
    $(document.createElement('div')).append(wrapper).html()

  @fillDataToTaskBlock: (data, wrapper) ->
    wrapper.append UnSelectionBlock._tpl.taskBlock
    wrapper.attr UnSelectionBlock.attr.taskBlock, true
    wrapper.attr UnSelectionBlock.attr.taskBlockSetting, JSON.stringify(data.setting)
    $title = wrapper.find("[#{UnSelectionBlock.attr.taskBlockTitle}]")
    $subTitle = wrapper.find("[#{UnSelectionBlock.attr.taskBlockSubTitle}]")

    $title.attr UnSelectionBlock.attr.taskBlockTitle, data.info.title
    $subTitle.attr UnSelectionBlock.attr.taskBlockSubTitle, data.info.subTitle

  @getWrapper: (data = {file:{}}) ->
    wrapper = $(UnSelectionBlock._tpl.wrapper)
    wrapper.attr(UnSelectionBlock.attr.unique, UnSelectionBlock._guidGenerator())
    if data.file and data.file.id
      wrapper.attr(UnSelectionBlock.attr.fileId, data.file.id)
    wrapper

  @createWrapperByP: (p) -> # 通过一个p标签，来创建一个包裹标签
    p = $(p)
    p.addClass UnSelectionBlock.className.wrapper
    p.attr UnSelectionBlock.attr.unique, UnSelectionBlock._guidGenerator()
    p

  @createImgWrapperByP: (p) ->
    $wrapper = UnSelectionBlock.createWrapperByP p
    $wrapper.attr UnSelectionBlock.attr.img, true
    $wrapper

  @createAttachWrapperByP: (p) ->
    $wrapper = UnSelectionBlock.createWrapperByP p
    $wrapper.attr UnSelectionBlock.attr.attach, true
    $wrapper

  @getImgWrapperWithImg: (img) ->
    $wrapper = UnSelectionBlock.getWrapper()
    $wrapper.attr UnSelectionBlock.attr.img, true
    $wrapper.append $(img)
    $wrapper

  @addFileIdForWrapper: ($wrapper, id) ->
    $wrapper.attr UnSelectionBlock.attr.fileId, id

  @_guidGenerator: ->
    S4 = () =>
      (((1+Math.random())*0x10000)|0).toString(16).substring(1)
    (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4())

  # 重置任务块的数据
  resetTaskBlock: (data) -> # { setting, subTitle, uniqueId }
    uniqueId = data.uniqueId
    $wrapper = @editor.body.find('[data-unique-id="' + uniqueId + '"]')
    if $wrapper.length
      $wrapper.attr UnSelectionBlock.attr.taskBlockSetting, JSON.stringify(data.setting)
      $wrapper.find(UnSelectionBlock.selector.subTitle).attr UnSelectionBlock.attr.taskBlockSubTitle, data.subTitle

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

  _skipToPrevNewLine: ->
    p = document.createElement('p')
    p.innerHTML = '<br>'
    wrapper = @editor.util.getRootNodeFromNode(@_selectedWrapper)
    wrapper = $(wrapper)
    wrapper.before(p)
    range = document.createRange()
    @editor.selection.setRangeAtStartOf p, range

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
    if range and range.endContainer and range.startContainer and (range.startContainer == range.endContainer)
      wrapper1 = $(range.endContainer).closest('.' + UnSelectionBlock.className.wrapper, @editor.body)
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
        @editor.trigger UnSelectionBlock.event.unSelect

  _unGlobalLinkClick: (e) ->
    wrapper = $(e.target).closest("[#{UnSelectionBlock.attr.globalLink}=true]", @editor.body)
    if wrapper.length
      id = wrapper.attr UnSelectionBlock.attr.fileId
      type = wrapper.find("[#{UnSelectionBlock.attr.globalLinkType}]").attr UnSelectionBlock.attr.globalLinkType
      @editor.trigger 'selectGlobalLink', 
        id: id,
        type: type

  _unAttachPreviewClick: (e) ->
    @_unAttachClick e,
      preview: true

  _unAttachDownloadClick: (e) ->
    @_unAttachClick e,
      download: true

  _unAttachClick: (e, opt = {}) ->
    wrapper = $(e.target).closest("[#{UnSelectionBlock.attr.attach}=true]", @editor.body)
    if wrapper.length
      id = wrapper.attr UnSelectionBlock.attr.fileId
      @editor.trigger 'selectAttach',
        id: id
        preview: opt.preview
        download: opt.download

  _unMapClick: (e) ->
    wrapper = $(e.target).closest("[#{UnSelectionBlock.attr.map}=true]", @editor.body)
    if wrapper.length
      loc = wrapper.find('img').attr UnSelectionBlock.attr.location
      @editor.trigger 'selectMap',
        location: loc

  _unTaskBlockSettingClick: (e) ->
    wrapper = $(e.target).closest("[#{UnSelectionBlock.attr.taskBlock}=true]", @editor.body)
    if wrapper.length
      setting = wrapper.attr UnSelectionBlock.attr.taskBlockSetting
      uniqueId = wrapper.attr UnSelectionBlock.attr.unique
      subTitle = wrapper.find(UnSelectionBlock.selector.subTitle).attr UnSelectionBlock.attr.taskBlockSubTitle
      try
        json = JSON.parse setting
        @editor.trigger 'taskBlockSetting',
          setting: json
          uniqueId: uniqueId
          subTitle: subTitle
      catch e

  _selectWrapper: (wrapper) ->
    html = wrapper.html()
    if html == '' or html == '<br>' # 当内容为空的时候，说明这个wrapper正在被删除，则直接用一个全新的p标签来替换wrapper
      p = $('<p/>').append(@editor.util.phBr)
      wrapper.replaceWith p
      @editor.selection.setRangeAtStartOf p
    else
      if !@editor.util.browser.msie
        @editor.blur()
        @editor.selection.clear()
      @_selectCurrent false
      @_selectedWrapper = wrapper
      @_selectCurrent()
      # 当选中的是图片的时候
      if wrapper.is("[#{UnSelectionBlock.attr.img}]") and wrapper.find('img').length
        @_onImageSelect(wrapper.find('img').eq(0))

  # 当 image被选中的时候
  _onImageSelect: ($img) ->
    @editor.trigger UnSelectionBlock.event.select, $img

  _patchFirefox: -> #针对firefox的一些补丁
    if @editor.util.browser.firefox
      @editor.body.on 'click.unSelection', ".#{UnSelectionBlock.className.wrapper}", (e) =>
        wrapper = $(e.target).closest(".#{UnSelectionBlock.className.wrapper}", @editor.body)
        if wrapper.length
          setTimeout =>
            @_selectWrapper(wrapper)
          , 0

  _delete: (wrapper = @_selectedWrapper) ->
    if wrapper
      previousSibling = wrapper[0].previousSibling
      @editor.trigger UnSelectionBlock.event.unSelectDelete, wrapper
      wrapper.remove()
      if previousSibling
        range = document.createRange()
        @editor.selection.setRangeAtEndOf previousSibling, range
      @editor.trigger 'valuechanged'

  _preview: ->
    # 判断是否有magnificPopup插件，这个文件预览必须是magnificPopup插件才能支持
    return unless $.fn.magnificPopup
    @editor.body.magnificPopup
      delegate: "[data-unselection-select='true'][data-img] img"
      type: 'image'
      preloader: true
      removalDelay: 1000
      mainClass: 'mfp-fade' # 'mfp-with-zoom',
      tLoading: 'Loading...'
      autoFocusLast: false
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
        elementParse: (item) ->
          item.src = item.el.attr 'src' unless item.src
          if item.src and typeof item.src == 'string'
            item.src = item.src.replace('officeweb365.com/o', 'ow365.cn') # 由于365的调整，链接需要调整
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
