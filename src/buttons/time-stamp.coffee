
class TimeStampButton extends Button

  name: 'time-stamp'

  icon: 'time-stamp'

  shortcut: 'super+alt+t'

  render: ->
    if @editor.util.os.mac
      @title = @title + ' ( Cmd + opt + t )'
    else
      @title = @title + ' ( Ctrl + alt + t )'
    super()

  _prefix:(t) ->
    return if t < 10 then '0' + t else t

  command: ->
    t = new Date()
    year = t.getFullYear()
    month = @_prefix(t.getMonth() + 1)
    date = @_prefix t.getDate()
    hour = @_prefix t.getHours()
    minute = @_prefix t.getMinutes()
    s = "#{year}-#{month}-#{date} #{hour}:#{minute}"
    document.execCommand 'insertText', false, s
    @editor.trigger 'valuechanged'

Simditor.Toolbar.addButton TimeStampButton