class GlobalLink extends SimpleModule
  @pluginName: 'GlobalLink'
  _init: ->
    @editor = @_module

  insert: (list) ->
    return unless list.length
    list.forEach (item) =>
      console.log item
      @createGlobalLink item
    @editor.trigger 'valuechanged'

  createGlobalLink: (data) ->
    @editor.focus() unless @editor.inputManager.focused
    range = @editor.selection.range()
    range.deleteContents()
    @editor.selection.range range

    $newLine = $('<p><br></p>')

    rootNode = @editor.selection.rootNodes().last()

    $wrapper = null

    if data.type == 'file'
      $wrapper = @createAttach(data)
    else
      $wrapper = UnSelectionBlock.getGlobalLink {file: data}

    if rootNode.is('p') and @editor.util.isEmptyNode rootNode
      $(rootNode).replaceWith($wrapper);
    else
      rootNode.after($wrapper)

    # if rootNode.is('p') and @editor.util.isEmptyNode rootNode
    #   $totalWrap = UnSelectionBlock.getGlobalLink {file: data}, rootNode
    # else
    #   $wrapper = UnSelectionBlock.getGlobalLink {file: data}
    #   rootNode.after($wrapper)
    #   $totalWrap = $wrapper;

    $wrapper.after($newLine);

    @editor.selection.setRangeAtStartOf $newLine, range

  createAttach: (data) ->
    _data = {file: data}
    _data.bucket = 'rishiqing-file'
    if @editor.opts.upload and @editor.opts.upload.FileUtil # 这个FileUtil是opts.upload传过来的
      FileUtil = @editor.opts.upload.FileUtil
      _data.previewFile = FileUtil.isPreviewFile data.name
      _data.framePreviewFile = FileUtil.isFramePreviewFile data.name
      _data.viewPath = if _data.framePreviewFile then FileUtil.getFramePreviewFileUrl data.realPath, data.name else data.realPath

    $(UnSelectionBlock.getAttachHtml(_data))
