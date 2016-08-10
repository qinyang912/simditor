
class WordNum extends SimpleModule

  @pluginName: 'WordNum' # 目前只支持中文和英文的计算

  @chineseExp: /[\u4e00-\u9fa5]+/g

  @englishExp: /([a-z|0-9]+)/ig

  _totalNum: 0 # 总字数

  _selectNum: 0 # 选中的文字的字数

  @calculateWord: (text) ->
    chineseNum = 0

    englishNum = 0

    if !text
      return 0

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
      @_calculateWord()
    , 2000

    @editor.on 'valuechanged', (e, src) =>
      @throttledCalculateWord()

  _calculateWord: ->

    $div =  $(document.createElement 'div')

    $div.append(@editor.getValue())

    text = $div.text()

    totalNum = WordNum.calculateWord(text)

    if @_totalNum != totalNum
      @_totalNum = totalNum
      @editor.trigger('wordnumchange', totalNum);

  getWordNum: ->
    @_totalNum


