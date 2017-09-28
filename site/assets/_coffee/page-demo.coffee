
$ ->
  Simditor.locale = 'en-US'

  toolbar= [
    'title', 
    'undo', 
    'redo', 
    'formatPaint', 
    'clear-format',
    'bold', 
    'italic', 
    'underline', 
    'strikethrough', 
    'fontScale', 
    'color', 
    'background',
    'time-stamp',
    'line-height',
    '|', 
    'ol', 
    'ul', 
    'blockquote', 
    'code', 
    'table', 
    '|', 
    'link', 
    'image',
    'attach',
    'hr', 
    '|', 
    'indent', 
    'outdent', 
    'alignment'
  ]
  mobileToolbar=["bold","underline","strikethrough","color","ul","ol"]
  toolbar = mobileToolbar if mobilecheck()
  editor = new Simditor
    textarea: $('#txt-content')
    placeholder: '这里输入文字...'
    toolbar: toolbar
    pasteImage: true
    defaultImage: 'assets/images/image.png'
    upload: if location.search == '?upload' then {url: '/upload'} else false,
    defaultLinkHref: 'https://www.rishiqing.com'

  attachHtml = Simditor.UnSelectionBlock.getAttachHtml 
    previewFile: false
    viewPath: 'http:www.baidu.com'
    bucket: 'rishiqing-file'
    file:
      name: 'dddd.png'
      filePath: '34123413dddd.png'
      realPath: 'http:www.baidu.com'
      id: 12341

  globalLinkHtml = Simditor.UnSelectionBlock.getGlobalLinkHtml
    file:
      name: 'woqu'
      id: 1
      type: 'doc'

  taskBlockHtml = Simditor.UnSelectionBlock.getTaskBlockHtml
    setting:
      preContent: 'time'
      taskContent: ['note', 'starTrend']
    info:
      title: '自动填充日程任务'
      subTitle: '筛选结果：今天、已完成'

  editor.setValue(editor.getValue() + globalLinkHtml + attachHtml + taskBlockHtml + '<p>sfs</p>')

  $preview = $('#preview')
  if $preview.length > 0
    editor.on 'valuechanged', (e) ->
      $preview.html editor.getValue()
