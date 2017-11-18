
class ImageButton extends Button

  name: 'image'

  icon: 'picture'

  htmlTag: 'img'

  disableTag: 'pre, table'

  defaultImage: ''

  needFocus: false

  _init: () ->
    if @editor.opts.imageButton
      if Array.isArray(@editor.opts.imageButton)
        @menu = []
        for item in @editor.opts.imageButton
          @menu.push
            name: item + '-image'
            text: @_t(item + 'Image')
      else
        @menu = false
    else
      if @editor.uploader?
        @menu = [{
          name: 'upload-image',
          text: @_t 'uploadImage'
        }, {
          name: 'external-image',
          text: @_t 'externalImage'
        }]
      else
        @menu = false

    @defaultImage = @editor.opts.defaultImage

    @editor.body.on 'click', 'img:not([data-non-image])', (e) =>
      $img = $(e.currentTarget)

      range = document.createRange()
      range.selectNode $img[0]
      @editor.selection.range range
      unless @editor.util.support.onselectionchange
        @editor.trigger 'selectionchanged'

      false

    @editor.body.on 'mouseup', 'img:not([data-non-image])', (e) ->
      return false

    @editor.on 'valuechanged.image', =>
      $masks = @editor.wrapper.find('.simditor-image-loading')
      return unless $masks.length > 0
      $masks.each (i, mask) =>
        $mask = $(mask)
        $img = $mask.data 'img'
        unless $img and $img.parent().length > 0
          $mask.remove()
          if $img
            file = $img.data 'file'
            if file
              @editor.uploader.cancel file
              if @editor.body.find('img.uploading').length < 1
                @editor.uploader.trigger 'uploadready', [file]

    @editor.on UnSelectionBlock.event.unSelectDelete, (e, wrapper) =>
      $wrapper = $(wrapper)
      return unless $wrapper.attr('data-img') == 'true'
      $img = $wrapper.find('img')
      return unless $img.length > 0
      $mask = $img.data('mask')
      $mask.remove() if $mask

    super()

  render: (args...) ->
    super args...

    if @editor.opts.imageButton == 'upload'
      @_initUploader @el

  renderMenu: ->
    super()
    @_initUploader()

  _initUploader: ($uploadItem = @menuEl.find('.menu-item-upload-image')) ->
    unless @editor.uploader?
      @el.find('.btn-upload').remove()
      return

    $input = null
    createInput = =>
      $input.remove() if $input
      $input = $ '<input/>',
        type: 'file'
        title: @_t('uploadImage')
        multiple: false
        accept: 'image/*'
      .appendTo($uploadItem)

    createInput()

    $uploadItem.on 'click', (e) ->
      e.stopPropagation();
    $uploadItem.on 'mousedown', (e) ->
      e.preventDefault()

    $uploadItem.on 'change', 'input[type=file]', (e) =>
      if @editor.inputManager.focused
        @editor.uploader.upload($input, {
          inline: true
        })
        createInput()
      else
        @editor.focus()
        @editor.uploader.upload($input, {
          inline: true
        })
        createInput()
      @wrapper.removeClass('menu-on')


    @editor.uploader.on 'beforeupload', (e, file) =>
      return unless file.inline

      if file.img
        $img = $(file.img)
      else
        $img = @createImage(file.name)
        #$img.click()
        file.img = $img

      $img.addClass 'uploading'
      $img.data 'file', file

      @editor.uploader.readImageFile file.obj, (img) =>
        return unless $img.hasClass('uploading')
        src = if img then img.src else @defaultImage

        @loadImage $img, src

    uploadProgress = $.proxy @editor.util.throttle((e, file, loaded, total) ->
      return unless file.inline
      $mask = file.img.data('mask')
      return unless $mask

      $img = $mask.data('img')
      unless $img.hasClass('uploading') and $img.parent().length > 0
        $mask.remove()
        return

      percent = loaded / total
      percent = (percent * 100).toFixed(0)
      percent = 99 if percent > 99
      $mask.find('.progress').height "#{100 - percent}%"
      $mask.find('.progress-tip').text(percent + '%')
    , 500), @
    @editor.uploader.on 'uploadprogress', uploadProgress

    @editor.uploader.on 'uploadsuccess', (e, file, result) =>
      return unless file.inline
      
      $img = file.img
      return unless $img.hasClass('uploading') and $img.parent().length > 0
      # in case mime type of response isnt correct
      if typeof result != 'object'
        try
          result = $.parseJSON result
        catch e
          result =
            success: false

      if result.success == false
        msg = result.msg || @_t('uploadFailed')
        alert msg
        img_path = @defaultImage
      else
        if result.ALY == true
          $.ajax
            url: @editor.opts.upload.GET_FILE_FROM_ALI
            type: 'post'
            data: 
              fileName: file.name
              filePath: result.key
            success: (data) =>
              img_path = data.realPath;
              @loadImage $img, img_path, =>
                $img.removeData 'file'
                $img.removeClass 'uploading'
                .removeClass 'loading'

                $mask = $img.data('mask')
                $mask.remove() if $mask
                $img.removeData 'mask'
                $img.addClass 'oss-file'
                $img.attr 'data-bucket', 'rishiqing-file'
                $img.attr 'data-key-name', result.key
                $img.attr 'data-name', data.name

                $wrapper = $img.data 'wrapper'
                if $wrapper
                  Simditor.UnSelectionBlock.addFileIdForWrapper $wrapper, data.id

                @editor.trigger 'valuechanged'
                if @editor.body.find('img.uploading').length < 1
                  @editor.uploader.trigger 'uploadready', [file, result]
            error: () => 

        else 
          img_path = result.file_path
          @loadImage $img, img_path, =>
            $img.removeData 'file'
            $img.removeClass 'uploading'
            .removeClass 'loading'

            $mask = $img.data('mask')
            $mask.remove() if $mask
            $img.removeData 'mask'

            @editor.trigger 'valuechanged'
            if @editor.body.find('img.uploading').length < 1
              @editor.uploader.trigger 'uploadready', [file, result]

    @editor.uploader.on 'uploaderror', (e, file, xhr) =>
      return unless file.inline
      return if xhr.statusText == 'abort'

      return if xhr.statusCode == 403

      if xhr.responseText
        try
          result = $.parseJSON xhr.responseText
          msg = result.msg
        catch e
          msg = @_t('uploadError')

        alert msg

      $img = file.img
      return unless $img.hasClass('uploading') and $img.parent().length > 0

      @loadImage $img, @defaultImage, =>
        $img.removeData 'file'
        $img.removeClass 'uploading'
        .removeClass 'loading'

        $mask = $img.data('mask')
        $mask.remove() if $mask
        $img.removeData 'mask'

      @editor.trigger 'valuechanged'
      if @editor.body.find('img.uploading').length < 1
        @editor.uploader.trigger 'uploadready', [file, result]


  _status: ->
    @_disableStatus()

  loadImage: ($img, src, callback) ->
    positionMask = =>
      imgOffset = $img.offset()
      wrapperOffset = @editor.wrapper.offset()
      $mask.css({
        top: imgOffset.top - wrapperOffset.top
        left: imgOffset.left - wrapperOffset.left
        width: $img.width()
        height: $img.height()
      }).show()

    $img.addClass('loading')
    $mask = $img.data('mask')
    if !$mask
      $mask = $('''
        <div class="simditor-image-loading">
          <div class="progress"></div>
          <div class="progress-tip">0%</div>
        </div>
      ''')
        .hide()
        .appendTo(@editor.wrapper)
      positionMask()
      $img.data('mask', $mask)
      $mask.data('img', $img)

    img = new Image()

    img.onload = =>
      return if !$img.hasClass('loading') and !$img.hasClass('uploading')

      width = img.width
      height = img.height

      $img.attr
        src: src,
        # width: width,
        # height: height,
        'data-image-size': width + ',' + height
      .removeClass('loading')

      if $img.hasClass('uploading') # img being uploaded
        @editor.util.reflow @editor.body
        positionMask()
      else
        $mask.remove()
        $img.removeData('mask')

      callback(img) if $.isFunction(callback)

    img.onerror = ->
      callback(false) if $.isFunction(callback)
      $mask.remove()
      $img.removeData('mask')
        .removeClass('loading')

    img.src = src

  createImage: (name = 'Image') ->
    @editor.focus() unless @editor.inputManager.focused
    range = @editor.selection.range()
    range.deleteContents()
    @editor.selection.range range

    # $block = @editor.selection.blockNodes().last()
    # if $block.is('p') and !@editor.util.isEmptyNode $block
    #   $block = $('<p/>').append(@editor.util.phBr).insertAfter($block)
    #   @editor.selection.setRangeAtStartOf $block, range
    #else if $block.is('li')
      #$block = @editor.util.furthestNode $block, 'ul, ol'
      #$block = $('<p/>').append(@editor.util.phBr).insertAfter($block)
      #@editor.selection.setRangeAtStartOf $block, range

    $img = $('<img/>').attr('alt', name)
    $newLine = $('<p><br></p>')
    rootNode = @editor.selection.rootNodes().last()
    $totalWrap = null
    if rootNode.is('p') and @editor.util.isEmptyNode rootNode
      $wrapper = Simditor.UnSelectionBlock.createImgWrapperByP rootNode
      $wrapper.empty()
      $wrapper.append $img
      $totalWrap = rootNode;
    else
      $wrapper = Simditor.UnSelectionBlock.getImgWrapperWithImg $img
      rootNode.after($wrapper)
      $totalWrap = $wrapper;

    $totalWrap.after($newLine);

    $img.data 'wrapper', $wrapper

    # range.insertNode $img[0]
    @editor.selection.setRangeAtStartOf $newLine, range
    # @editor.trigger 'valuechanged'

    # $nextBlock = $block.next 'p'
    # unless $nextBlock.length > 0
    #   $nextBlock = $('<p/>').append(@editor.util.phBr).insertAfter($block)
    # @editor.selection.setRangeAtStartOf $nextBlock

    $img

  command: (src) ->
    return unless @editor.opts.imageButton != 'upload'
    $img = @createImage()

    @loadImage $img, src || @defaultImage, =>
      @editor.trigger 'valuechanged'
      @editor.util.reflow $img
      $img.click()


Simditor.Toolbar.addButton ImageButton
