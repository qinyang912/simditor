
class ImageBlock extends SimpleModule # 不能直接用Image，因为Image是一个内置对象，所以改名为ImageBlock

  @pluginName: 'ImageBlock'

  _currentResizeImg: null # 当前拖动的目标img元素

  isResize: false # 标记是否在 resize 中，其他模块可以通过这个值知道image是否在resize中，比如unSelectionBlock就在用

  _init: ->
    @editor = @_module
    @_initResizeBar()
    @editor.on UnSelectionBlock.event.select, (e, img) =>
      return unless img.complete # 判断是否已经加载完成
      @_currentResizeImg = $(img)

      @_offResize()

      @_setPosition()

      @_resize.show()


    @editor.on UnSelectionBlock.event.unSelect, () =>
      @_currentResizeImg = null
      @_resize.hide()

  _setSize: (offset) ->
    return unless @_currentResizeImg
    naturalWidth = @_currentResizeImg[0].naturalWidth
    naturalHeight  =@_currentResizeImg[0].naturalHeight

    _width = @_currentResizeImg.outerWidth()
    _height = @_currentResizeImg.outerHeight()
    # attr = 'width'
    # removeAttr = 'height'
    
    # 如果x轴的变化没有y轴变化大，就用y轴的数据转换成x轴的数据
    if offset.x * offset.x < offset.y * offset.y
      height = _height + offset.y * 2
      width = height * naturalWidth / naturalHeight
    else
      width = _width + offset.x * 2
      height = width * naturalHeight / naturalWidth

    return unless width > 0 and height > 0
    # @_currentResizeImg.removeAttr removeAttr
    @_currentResizeImg.attr 'height', (height + 'px')
    @_currentResizeImg.attr 'width', (width + 'px')
    @_setPosition()

    if @_resizeChangeTimer
      clearTimeout @_resizeChangeTimer

    @_resizeChangeTimer = setTimeout () =>
      @_resizeChangeTimer = null
      @editor.trigger 'valuechanged'
    , 100

  _setPosition: () ->
    $img = @_currentResizeImg
    editorOffset = @editor.el.offset()
    imgOffset = $img.offset()
    imgH = $img.outerHeight()
    top = imgOffset.top - editorOffset.top
    left = imgOffset.left - editorOffset.left
    height = $img.outerHeight()
    width = $img.outerWidth()

    @_resize.css 
      top: top + height - 8
      left: left + width - 8


  # 初始化 resize-bar 组件
  _initResizeBar: ->
    tpl = """
      <div class="simditor-resize-bar" title="拖动缩放"></div>
    """
    @_resize = $(tpl)
    @editor.el.append @_resize

    @_resize.on 'mousedown', (e) =>
      @isResize = true
      @startX = e.clientX
      @startY = e.clientY
      # 当鼠标在被选中的unSelectionBlock上释放的时候，不会触发mouseup事件，
      # 所以这里用click事件来代替
      @editor.el.on 'click.image-resize', () =>
        @_offResize()
        false
      $(document).on 'mouseup.image-resize', () =>
        @_offResize()
        false
      $(document).on 'mousemove.image-resize', (e) =>
        if e.clientX != @startX or e.clientY != @startY
          @_setSize
            x: e.clientX - @startX
            y: e.clientY - @startY
          @startX = e.clientX
          @startY = e.clientY
        false
      false
    @_resize.on 'click', () =>
      false

  _offResize: ->
    $(document).off 'mouseup.image-resize'
    $(document).off 'mousemove.image-resize'
    @editor.el.off 'click.image-resize'
    # 这个地方之所以用setTimeout
    # 是希望在一些列事件触发完成之后，再把isResize给设置成false
    # 尤其这地方，在unSelectionBlock里会用到，会在click事件之后，再执行
    setTimeout () =>
      @isResize = false
    , 0