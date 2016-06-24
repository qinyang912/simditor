
class Toolbar extends SimpleModule

  @pluginName: 'Toolbar'

  opts:
    toolbar: true
    toolbarFloat: true
    toolbarHidden: false
    toolbarFloatOffset: 0
    moreOption: true

  _tpl:
    wrapper: '<div class="simditor-toolbar"><ul></ul></div>'
    separator: '<li data-type="separator"><span class="separator"></span></li>'
    moreOption: '<li><a href="javascript:;" class="toolbar-item toolbar-item-more-option"><span>更多</span></a><div class="more-option"><ul></ul></div></li>'

  _init: ->
    @editor = @_module
    return unless @opts.toolbar

    unless $.isArray @opts.toolbar
      @opts.toolbar = ['bold', 'italic', 'underline', 'strikethrough', '|',
        'ol', 'ul', 'blockquote', 'code', '|', 'link', 'image', '|',
        'indent', 'outdent']

    @_render()

    # @list.on 'click', (e) ->
    #   false

    @wrapper.on 'mousedown', (e) =>
      @list.find('.menu-on').removeClass('.menu-on')

    $(document).on 'mousedown.simditor' + @editor.id, (e) =>
      @list.find('.menu-on').removeClass('.menu-on')

    if not @opts.toolbarHidden and @opts.toolbarFloat
      @wrapper.css 'top', @opts.toolbarFloatOffset
      toolbarHeight = 0

      initToolbarFloat = =>
        @wrapper.css 'position', 'static'
        @wrapper.width 'auto'
        @editor.util.reflow @wrapper
        @wrapper.width @wrapper.outerWidth() # set width for fixed element
        @wrapper.css 'left', if @editor.util.os.mobile
          @wrapper.position().left
        else
          @wrapper.offset().left
        @wrapper.css 'position', ''
        toolbarHeight = @wrapper.outerHeight()
        @editor.placeholderEl.css 'top', toolbarHeight
        true

      floatInitialized = null
      $(window).on 'resize.simditor-' + @editor.id, (e) ->
        floatInitialized = initToolbarFloat()

      $(window).on 'scroll.simditor-' + @editor.id, (e) =>
        return unless @wrapper.is(':visible')
        topEdge = @editor.wrapper.offset().top
        bottomEdge = topEdge + @editor.wrapper.outerHeight() - 80
        scrollTop = $(document).scrollTop() + @opts.toolbarFloatOffset

        if scrollTop <= topEdge or scrollTop >= bottomEdge
          @editor.wrapper.removeClass('toolbar-floating')
            .css('padding-top', '')
          if @editor.util.os.mobile
            @wrapper.css 'top', @opts.toolbarFloatOffset
        else
          floatInitialized ||= initToolbarFloat()
          @editor.wrapper.addClass('toolbar-floating')
            .css('padding-top', toolbarHeight)
          if @editor.util.os.mobile
            @wrapper.css 'top', scrollTop - topEdge + @opts.toolbarFloatOffset

    @editor.on 'destroy', =>
      @buttons.length = 0

    $(document).on "mousedown.simditor-#{@editor.id}", (e) =>
      @list.find('li.menu-on').removeClass('menu-on')

  _render: ->
    @buttons = []
    @buttonsJson = {}
    @separators = []
    @otherEls   = [] # 其他额外插入到toolbar里的jquery元素
    @wrapper = $(@_tpl.wrapper).prependTo(@editor.wrapper)
    @list = @wrapper.find('ul')

    for name in @opts.toolbar
      if name == '|'
        separator = $(@_tpl.separator).appendTo(@list)
        @separators.push(separator)
        continue

      if name instanceof $
        name.appendTo @list
        @otherEls.push(name)
        continue

      unless @constructor.buttons[name]
        throw new Error "simditor: invalid toolbar button #{name}"
        continue
      button = new @constructor.buttons[name]
        editor: @editor
      @buttons.push button
      @buttonsJson[name] = button

    @wrapper.hide() if @opts.toolbarHidden
    @_moreOption()  if !@opts.toolbarHidden and @opts.moreOption
    
  _moreOption: ->
    @moreOption     = $(@_tpl.moreOption).appendTo @list
    @moreOptionList = []
    @moreOption.hide()
    setTimeout @_renderMoreOption.bind(@), 0
    @moreOption.on "mousedown", (e) => 
      e.preventDefault()
      @moreOption.find('.more-option').toggleClass('open')
    @_resize()

  _renderMoreOption: ->
    listWidth        = @list.width()
    moreOptionWidth  = @moreOption.outerWidth()
    separatorCount   = @separators.length
    separatorWidth   = @separators[0].outerWidth()
    otherElCount     = @otherEls.length
    buttonCount      = @buttons.length
    totalWidth       = 0
    moveInCount      = 1
    moveOutCount     = 0

    getMoveInCount   = (_count) =>
      _totalWidth    = 0
      if @list.find('>li').length >= _count
        @list.find('>li').each (index) =>
          if index < @list.find('>li').length - (_count + 1)
            _totalWidth += @list.find('>li:eq(' + index + ')').outerWidth()
        if _totalWidth + moreOptionWidth >= listWidth
          getMoveInCount ++moveInCount
    getMoveOutCount  = (_count) =>
      _totalWidth    = 0
      @list.find('>li').each (index) =>
        _totalWidth += @list.find('>li:eq(' + index + ')').outerWidth()
      if @moreOptionList[_count]
        for x in [0.._count]
          _totalWidth += @moreOptionList[x].outerWidth()
        if _totalWidth < listWidth
          getMoveOutCount ++moveOutCount

    @list.find('>li').each (index) =>
      totalWidth += @list.find('>li:eq(' + index + ')').outerWidth()

    if totalWidth >= listWidth
      getMoveInCount(moveInCount)
      for x in [1..moveInCount]
        prev = @moreOption.prev()
        prev.detach()
        @moreOptionList.unshift(prev)
        prev.prependTo @moreOption.find('ul:eq(0)')
    else if totalWidth < listWidth
      getMoveOutCount(moveOutCount)
      if moveOutCount > 0
        for x in [0..moveOutCount - 1]
          first = @moreOptionList.shift()
          first.detach()
          @moreOption.before first
    if @moreOptionList.length
      @moreOption.show()
    else 
      @moreOption.hide()

  _resize: ->
    $(window).on "resize.simditor-more-option", (e) =>
      setTimeout @_renderMoreOption.bind(@), 0

  findButton: (name) ->
    button = @list.find('.toolbar-item-' + name).data('button')
    button ? null

  @addButton: (btn) ->
    @buttons[btn::name] = btn

  @buttons: {}
