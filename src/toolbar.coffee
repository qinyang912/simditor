
class Toolbar extends SimpleModule

  @pluginName: 'Toolbar'

  opts:
    toolbar: true
    toolbarFloat: true
    toolbarHidden: false
    toolbarFloatOffset: 0

  _tpl:
    wrapper: '<div class="simditor-toolbar"><ul></ul></div>'
    separator: '<li><span class="separator"></span></li>'
    moreOption: '<li><span class="toolbar-item toolbar-item-more-option">更多</span><div class="more-option"><ul></ul></div></li>'

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

    console.log('@editor', @editor)
    console.log('@buttons', @buttons)
    @wrapper.hide() if @opts.toolbarHidden
    @_moreOption() unless @opts.toolbarHidden
    
  _moreOption: ->
    @moreOption     = $(@_tpl.moreOption).appendTo @list
    @moreOptionList = []
    @_renderMoreOption()
    @moreOption.on "mousedown", (e) => 
      e.preventDefault()
      @moreOption.find('.more-option').toggleClass('open')
    @_resize()

  _renderMoreOption: ->
    toolbarItemWidth = @buttons[0].el.outerWidth()
    listWidth        = @list.width()
    moreOptionWidth  = @moreOption.outerWidth()
    separatorCount   = @separators.length
    separatorWidth   = @separators[0].outerWidth()
    otherElCount     = @otherEls.length
    buttonCount      = @buttons.length
    totalWidth       = 0
    moveInCount      = 1
    moveOutCount     = 0
    threshold        = 3

    getMoveInCount   = (_count) =>
      _totalWidth    = 0
      @list.find('>li').each (index) =>
        if index < @list.find('>li').length - (_count + 1)
          _totalWidth += @list.find('>li:eq(' + index + ')').outerWidth()
      if _totalWidth + moreOptionWidth >= listWidth - threshold
        getMoveInCount ++moveInCount
    getMoveOutCount  = (_count) =>
      _totalWidth    = 0
      @list.find('>li').each (index) =>
        _totalWidth += @list.find('>li:eq(' + index + ')').outerWidth()
      if @moreOptionList[_count] and _totalWidth + @moreOptionList[_count].outerWidth() <= listWidth + threshold
        getMoveOutCount ++moveOutCount

    @list.find('>li').each (index) =>
      totalWidth += @list.find('>li:eq(' + index + ')').outerWidth()

    if totalWidth >= listWidth - threshold
      getMoveInCount(moveInCount)
      console.log('moveInCount', moveInCount);
      for x in [1..moveInCount]
        @moreOptionList.unshift(@moreOption.prev())
        @moreOption.prev().prependTo @moreOption.find('ul')
    else if totalWidth <= listWidth + threshold
      getMoveOutCount(moveOutCount)
      console.log('moveOutCount', moveOutCount)


    console.log('totalWidth', totalWidth)
    console.log('listWidth', listWidth)
    console.log 'need more option' if totalWidth >= listWidth

  _resize: ->
    $(window).on "resize.simditor-more-option", (e) =>
      setTimeout @_renderMoreOption.bind(@), 0

  findButton: (name) ->
    button = @list.find('.toolbar-item-' + name).data('button')
    button ? null

  @addButton: (btn) ->
    @buttons[btn::name] = btn

  @buttons: {}
