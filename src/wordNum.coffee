class WordNum extends SimpleModule

  @pluginName: 'WordNum' # 目前只支持中文和英文的计算

  @chineseExp: /[\u4e00-\u9fa5]+/g

  @englishExp: /([a-z|0-9]+)/ig

  @blockNodes: ["div","p","ul","ol","li","blockquote","hr","pre","h1","h2","h3",
    "h4", "h5", "table"]

  _totalNum: 0 # 总字数

  _selectNum: 0 # 选中的文字的字数

  @calculateWord: (html) -> # 根据html来判断里面的字数，还要处理块元素之间的换行问题
    chineseNum = 0

    englishNum = 0

    if !html
      return 0

    $div =  $(document.createElement 'div')
    $div.append html
    $div.find(WordNum.blockNodes.join(',')).after('<p>&nbsp;</p>')


    text = $div[0].innerText

    chineseList = text.match(WordNum.chineseExp)

    if chineseList and chineseList.length
      for c in chineseList
        chineseNum += c.length

    englishList = text.match(WordNum.englishExp)

    if englishList and englishList.length
      englishNum = englishList.length

    return chineseNum + englishNum

  _init: ->
    @editor = @_module

    @throttledCalculateWord = @editor.util.throttle =>
      @calculateWord()
    , 2000

    @editor.on 'valuechanged', (e, src) =>
      @throttledCalculateWord()

  calculateWord: ->
    totalNum = WordNum.calculateWord(@editor.getValue())

    if @_totalNum != totalNum
      @_totalNum = totalNum
      @editor.trigger('wordnumchange', totalNum);

  getWordNum: ->
    @_totalNum