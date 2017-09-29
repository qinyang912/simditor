class FontFamilyButton extends Button

  name: 'font-family'

  disableTag: 'pre'

  menu: true

  text: '微软雅黑'

  @fontFamily:
    '"Microsoft YaHei", STXihei':
      name: 'yahei'
      text: '微软雅黑'
      param: '"Microsoft YaHei", STXihei'
      style: 'font-family:"Microsoft YaHei", STXihei;'
    'SimSun, STSong':
      name: 'SimSun'
      text: '宋体'
      param: 'SimSun, STSong'
      style: 'font-family:SimSun, STSong;'
    'NSimSun':
      name: 'NSimSun'
      text: '新宋体'
      param: 'NSimSun'
      style: 'font-family:NSimSun;'
    'FangSong_GB2312, FangSong, STFangsong':
      name: 'FangSong_GB2312'
      text: '仿宋'
      param: 'FangSong_GB2312, FangSong, STFangsong'
      style: 'font-family:FangSong_GB2312, FangSong, STFangsong;'
    'KaiTi_GB2312, KaiTi, STKaiti':
      name: 'KaiTi_GB2312'
      text: '楷体'
      param: 'KaiTi_GB2312, KaiTi, STKaiti'
      style: 'font-family:KaiTi_GB2312, KaiTi, STKaiti;'
    'SimHei, STHeiti':
      name: 'SimHei'
      text: '黑体'
      param: 'SimHei, STHeiti'
      style: 'font-family:SimHei, STHeiti;'
    'Arial':
      name: 'Arial'
      text: 'Arial'
      param: 'Arial'
      style: 'font-family:Arial;'
    '"Arial Black"':
      name: 'Arial-Black'
      text: 'Arial Black'
      param: '"Arial Black"'
      style: 'font-family:"Arial Black";'
    '"Times New Roman"':
      name: 'Times-New-Roman'
      text: 'Times New Roman'
      param: '"Times New Roman"'
      style: 'font-family:"Times New Roman";'
    '"Courier New"':
      name: 'Courier-New'
      text: 'Courier New'
      param: '"Courier New"'
      style: 'font-family:"Courier New";'
    'Tahoma':
      name: 'Tahoma'
      text: 'Tahoma'
      param: 'Tahoma'
      style: 'font-family:Tahoma;'
    'Verdana':
      name: 'Verdana'
      text: 'Verdana'
      param: 'Verdana'
      style: 'font-family:Verdana;'

  _init: ->
    @menu = []
    @fontFamilyMap = {}
    Object.keys(FontFamilyButton.fontFamily).forEach (name) =>
      @menu.push FontFamilyButton.fontFamily[name]

    Object.keys(FontFamilyButton.fontFamily).forEach (name) =>
      @fontFamilyMap[name.toLowerCase().replace(/"|'/g, '')] = FontFamilyButton.fontFamily[name]

    super()

  _activeStatus: ->
    range = @editor.selection.range()
    startNodes = @editor.selection.startNodes()
    endNodes = @editor.selection.endNodes()
    startNode = startNodes.eq 0
    endNode = endNodes.eq 0
    active = startNodes.length > 0 and endNodes.length > 0 and startNode.is(endNode)
    @node = if active then startNode else null
    @node = if @node != null and @node[0].nodeType is Node.TEXT_NODE then @node.parent() else @node
    @setActive active
    @active

  setActive:(active) ->
    super active
    return if not active
    return if not @node[0]
    fontFamily = window.getComputedStyle(@node[0], null).getPropertyValue('font-family')
    family = @fontFamilyMap[fontFamily.toLowerCase().replace(/"|'/g, '')]
    name = if family then family.text else '其他字体'
    @el.find('span').text name

  command:(param) ->
    document.execCommand 'styleWithCSS', false, true
    document.execCommand 'fontName', false, param
    document.execCommand 'styleWithCSS', false, false
    @editor.trigger 'valuechanged'

Simditor.Toolbar.addButton FontFamilyButton