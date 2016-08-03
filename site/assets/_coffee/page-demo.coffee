
$ ->
  Simditor.locale = 'en-US'

  toolbar= ['title', 'undo', 'redo', 'formatPaint', 'bold', 'italic', 'underline', 'strikethrough', 'fontScale', 'color', '|', 'ol', 'ul', 'blockquote', 'code', 'table', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent', 'alignment']
  mobileToolbar=["bold","underline","strikethrough","color","ul","ol"]
  toolbar = mobileToolbar if mobilecheck()
  editor = new Simditor
    textarea: $('#txt-content')
    placeholder: '这里输入文字...'
    toolbar: toolbar
    pasteImage: true
    defaultImage: 'assets/images/image.png'
    upload: if location.search == '?upload' then {url: '/upload'} else false

  console.log('editor', editor)

  attachHtml = Simditor.UnSelectionBlock.getAttachHtml 
    previewFile: false
    viewPath: 'http:www.baidu.com'
    bucket: 'rishiqing-file'
    file:
      name: 'dddd.png'
      filePath: '34123413dddd.png'
      realPath: 'http:www.baidu.com'
      id: 12341

  editor.setValue(editor.getValue() + attachHtml + '<p>sfs</p>')

  $preview = $('#preview')
  if $preview.length > 0
    editor.on 'valuechanged', (e) ->
      $preview.html editor.getValue()
