
class Formatter extends SimpleModule

  @pluginName: 'Formatter'

  opts:
    allowedTags: []
    allowedAttributes: {}
    allowedStyles: {}

  _init: ->
    @editor = @_module

    @_allowedTags = $.merge(
      ['br', 'span', 'a', 'img', 'b', 'strong', 'i', 'strike',
      'u', 'font', 'p', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'h1',
      'h2', 'h3', 'h4', 'hr', 'inherit', 'input', 'table'],
      @opts.allowedTags
    )

    $.merge(
      @editor.formatter._allowedTags,
      ['thead', 'th', 'tbody', 'tr', 'td', 'colgroup', 'col']
    )

    @_allowedAttributes = $.extend
      img: [
        'src', 'alt', 'width', 'height',
        'data-non-image', 'data-bucket', 'data-key-name',
        'data-osskey', 'data-name', 'class', 'data-location'
      ]
      a: ['href', 'target', 'class', 'title']
      font: ['color', 'size', 'face', 'style']
      code: ['class']
      p: [
        'class', 'data-unique-id', 'data-file-id', 
        'data-file-name', 'data-file-src', 'data-attach', 
        'data-img', 'data-global-link', 'data-setting',
        'data-task-block', 'data-map', 'data-record'
      ]
      span: [
        'class', 'contenteditable', 'data-name', 
        'data-size', 'href', 'data-bucket', 
        'data-osskey', 'data-key-name', 'title', 
        'data-global-link-type', 'data-title', 'data-sub-title',
        'data-attach-type', 'data-record-control', 'data-duration'
      ]
      input: [
        'class', 'type', 'value', 'disabled', 'data-user-id'
      ]
    , @opts.allowedAttributes

    @_allowedStyles = $.extend
      span: ['color', 'font-size', 'font-family', 'background-color', 'font-weight']
      b: ['color']
      i: ['color']
      strong: ['color']
      strike: ['color']
      u: ['color']
      p: ['margin-left', 'text-align', 'line-height']
      h1: ['margin-left', 'text-align']
      h2: ['margin-left', 'text-align']
      h3: ['margin-left', 'text-align']
      h4: ['margin-left', 'text-align']
      img: ['width', 'height']
      font: ['color', 'font-size', 'font-family', 'background-color']
      ul: ['line-height']
      ol: ['line-height']
    , @opts.allowedStyles

    @editor.body.on 'click', 'a', (e) ->
      if $(e.target).hasClass('unselection-attach-download') # 如果是点击的附件下载按钮，则不阻止
        return true
      href = $(@).prop('href')
      window.open(href) # 只在新窗口打开页面
      return false

  decorate: ($el = @editor.body) ->
    @editor.trigger 'decorate', [$el]
    $el

  undecorate: ($el = @editor.body.clone()) ->
    @editor.trigger 'undecorate', [$el]
    $el

  autolink: ($el = @editor.body) ->
    linkNodes = []

    findLinkNode = ($parentNode) ->
      $parentNode.contents().each (i, node) ->
        $node = $(node)
        if $node.is('a') or $node.closest('a, pre', $el).length
          return

        if !$node.is('iframe') and $node.contents().length
          findLinkNode $node
        else if (text = $node.text()) and /https?:\/\/|www\./ig.test(text)
          linkNodes.push $node

    findLinkNode $el

    re = /(https?:\/\/|www\.)[\w\-\.\?&=\/#%:,@\!\+]+/ig
    for $node in linkNodes
      text = $node.text()
      replaceEls = []
      match = null
      lastIndex = 0

      while (match = re.exec(text)) != null
        subStr = text.substring(lastIndex, match.index)
        replaceEls.push document.createTextNode(subStr)
        lastIndex = re.lastIndex
        uri = if /^(http(s)?:\/\/|\/)/.test(match[0])
          match[0]
        else
          'http://' + match[0]
        $link = $("<a href=\"#{uri}\" rel=\"nofollow\"></a>").text(match[0])
        replaceEls.push $link[0]

      replaceEls.push document.createTextNode(text.substring(lastIndex))
      $node.replaceWith $(replaceEls)

    $el

  # make sure the direct children is block node
  format: ($el = @editor.body) ->
    if $el.is ':empty'
      $el.append '<p>' + @editor.util.phBr + '</p>'
      return $el

    @cleanNode(n, true) for n in $el.contents()

    for node in $el.contents()
      $node = $(node)
      if $node.is('br')
        blockNode = null if blockNode?
        $node.remove()
      else if @editor.util.isBlockNode(node)
        if $node.is('li')
          if blockNode and blockNode.is('ul, ol')
            blockNode.append node
          else
            blockNode = $('<ul/>').insertBefore(node)
            blockNode.append node
        else
          blockNode = null
      else
        if !blockNode or blockNode.is('ul, ol')
          blockNode = $('<p/>').insertBefore(node)
        blockNode.append(node)
        blockNode.append(@editor.util.phBr) if @editor.util.isEmptyNode(blockNode)

    $el

  cleanNode: (node, recursive) ->
    $node = $(node)
    return unless $node.length > 0

    if $node[0].nodeType == 3
      text = $node.text().replace(/(\r\n|\n|\r)/gm, '')
      if text
        textNode = document.createTextNode text
        $node.replaceWith textNode
      else
        $node.remove()
      return

    contents = if $node.is('iframe') then null else $node.contents()
    isDecoration = @editor.util.isDecoratedNode($node)

    if $node.is('[data-attach],[data-img]')
      fileId = $node.attr 'data-file-id'
      return $node.remove() unless fileId

    if $node.is(@_allowedTags.join(',')) or isDecoration
      # img inside a is not allowed
      if $node.is('a') and ($childImg = $node.find('img')).length > 0
        $node.replaceWith $childImg
        $node = $childImg
        contents = null

      # block el inside td is not allowed
      if $node.is('td') and ($blockEls = $node.find(@editor.util.blockNodes.join(','))).length > 0
        $blockEls.each (i, blockEl) =>
          $(blockEl).contents().unwrap()
        contents = $node.contents()

      # exclude uploading img
      if $node.is('img') and $node.hasClass('uploading')
        $node.remove()

      # Clean attributes except `src` `alt` on `img` tag
      # and `href` `target` on `a` tag
      unless isDecoration
        allowedAttributes = @_allowedAttributes[$node[0].tagName.toLowerCase()]

        for attr in $.makeArray($node[0].attributes)
          continue if attr.name == 'style'
          unless allowedAttributes? and (attr.name in allowedAttributes)
            $node.removeAttr(attr.name)

        @_cleanNodeStyles $node

        if $node.is('span') and $node[0].attributes.length == 0
          $node.contents().first().unwrap()
    else if $node[0].nodeType == 1 and !$node.is ':empty'
      if $node.is('div, article, dl, header, footer, tr')
        $node.append('<br/>')
        contents.first().unwrap()
      else if $node.is 'table'
        $p = $('<p/>')
        $node.find('tr').each (i, tr) ->
          $p.append($(tr).text() + '<br/>')
        $node.replaceWith $p
        contents = null
      else if $node.is 'thead, tfoot'
        $node.remove()
        contents = null
      else if $node.is 'th'
        $td = $('<td/>').append $node.contents()
        $node.replaceWith $td
      else if $node.is 'style' # 如果style节点，则直接删除
        $node.remove()
      else
        contents.first().unwrap()
    else
      $node.remove()
      contents = null

    if recursive and contents? and !$node.is('pre')
      @cleanNode(n, true) for n in contents
    null

  _cleanNodeStyles: ($node) ->
    styleStr = $node.attr 'style'
    return unless styleStr

    $node.removeAttr 'style'
    allowedStyles = @_allowedStyles[$node[0].tagName.toLowerCase()]
    return $node unless allowedStyles and allowedStyles.length > 0

    styles = {}
    for style in styleStr.split(';')
      style = $.trim style
      pair = style.split(':')
      continue unless pair.length == 2
      # 下面代码过滤font-size: 1px的情况
      if pair[0] == 'font-size' and pair[1] == ' 1px'
        continue
      styles[$.trim(pair[0])] = $.trim(pair[1]) if pair[0] in allowedStyles

    $node.css styles if Object.keys(styles).length > 0
    $node

  clearHtml: (html, lineBreak = true) ->
    container = $('<div/>').append(html)
    contents = container.contents()
    result = ''

    contents.each (i, node) =>
      if node.nodeType == 3
        result += node.nodeValue
      else if node.nodeType == 1
        $node = $(node)
        children = if $node.is('iframe') then null else $node.contents()
        result += @clearHtml(children) if children and children.length > 0
        if lineBreak and i < contents.length - 1 and $node.is 'br, p, div, li,\
          tr, pre, address, artticle, aside, dl, figcaption, footer, h1, h2,\
          h3, h4, header'
          result += '\n'

    result

  # remove empty nodes and useless paragraph
  beautify: ($contents) ->
    uselessP = ($el) ->
      !!($el.is('p') and !$el.text() and $el.children(':not(br)').length < 1)

    $contents.each (i, el) ->
      $el = $(el)
      invalid = $el.is(':not(img, br, col, td, hr, [class^="simditor-"]):empty')
      # $el.remove() if invalid or uselessP($el)
      $el.remove() if invalid # 换成这个，不清理无用的p标签，保留空行
      $el.find(':not(img, br, col, td, hr, [class^="simditor-"]):empty')
        .remove()
