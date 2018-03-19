
class Attach extends SimpleModule

  @pluginName: 'Attach'

  _init: ->
    @editor = @_module
    if @editor.opts.upload and simpleUploader
      uploadOpts = if typeof @editor.opts.upload == 'object' then @editor.opts.upload else {}
      @uploader = simpleUploader(uploadOpts)
    else
      @uploader = simpleUploader({})
    @_initUploader()

  _initUploader: ->
    unless @uploader?
      return

    uploadProgress = $.proxy @editor.util.throttle((e, file, loaded, total) ->
      return unless file.inline
      $attach = file.attach

      percent = loaded / total
      percent = (percent * 100).toFixed(0)
      # percent = 85 if percent > 85
      $attach.find('[data-progress] span').width "#{percent}%"
    , 500), @

    @uploader.on 'uploadprogress', uploadProgress

    @uploader.on 'beforeupload', (e, file) =>
      return unless file.inline
      file.attach = @createAttach file

    @uploader.on 'uploadsuccess', (e, file, result) =>
      return unless file.inline
      $attach = file.attach

      # in case mime type of response isnt correct
      if typeof result != 'object'
        try
          result = $.parseJSON result
        catch e
          result =
            success: false
      if result.success
        if result.ALY == true
          $.ajax
            url: @editor.opts.upload.GET_FILE_FROM_ALI
            type: 'post'
            data: 
              fileName: file.name
              filePath: result.key
            success: (data) =>
              _data = {file: data}
              _data.bucket = 'rishiqing-file'
              # if @editor.opts.upload and @editor.opts.upload.FileUtil # 这个FileUtil是opts.upload传过来的
              #   FileUtil = @editor.opts.upload.FileUtil
              #   _data.previewFile = FileUtil.isPreviewFile data.name
              #   _data.framePreviewFile = FileUtil.isFramePreviewFile data.name
              #   _data.viewPath = if _data.framePreviewFile then FileUtil.getFramePreviewFileUrl data.realPath, data.name else data.viewPath

              html = UnSelectionBlock.getAttachHtml(_data)
              $attach.replaceWith html
              @editor.trigger 'valuechanged'
            error: () => 

    @uploader.on 'uploaderror', (e, file, xhr) =>
      return unless file.inline
      return if xhr.statusText == 'abort'
      return if xhr.statusCode == 403

  createAttach: (file) ->
    @editor.focus() unless @editor.inputManager.focused
    range = @editor.selection.range()
    range.deleteContents()
    @editor.selection.range range


    $newLine = $('<p><br></p>')

    rootNode = @editor.selection.rootNodes().last()
    $totalWrap = null
    if rootNode.is('p') and @editor.util.isEmptyNode rootNode
      $wrapper = Simditor.UnSelectionBlock.getAttachUploaderHtml { file: file }, rootNode
      $totalWrap = rootNode;
    else
      $wrapper = Simditor.UnSelectionBlock.getAttachUploaderHtml { file: file }
      rootNode.after($wrapper)
      $totalWrap = $wrapper;

    $totalWrap.after($newLine);

    @editor.selection.setRangeAtStartOf $newLine, range
    @editor.trigger 'valuechanged'

    $totalWrap

  upload: (file, opt) ->
    return unless @uploader
    @uploader.upload file, opt
