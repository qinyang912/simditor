# 在编辑器顶部插入一个放简要信息的地方
class InfoArea extends SimpleModule

  @pluginName: 'InfoArea'

  opts:
    infoArea: ''

  _init: ->
    @editor = @_module
    return unless @opts.infoArea

    tpl = """
      <div class="simditor-info-area">#{@opts.infoArea}</div>
    """

    @el = $(tpl)

    @editor.wrapper.prepend(@el)

  changeContent: (txt) ->
    @el.text txt