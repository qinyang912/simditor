class AlignmentButton extends Button

  name: "alignment"

  icon: 'align-left'

  htmlTag: 'p, h1, h2, h3, h4, td, th'

  shortcutList: ['super+alt+y', 'left', 'center', 'right']

  _init: ->
    @menu = [{
      name: 'left',
      text: @_t('alignLeft'),
      icon: 'align-left',
      param: 'left'
    }, {
      name: 'center',
      text: @_t('alignCenter'),
      icon: 'align-center',
      param: 'center'
    }, {
      name: 'right',
      text: @_t('alignRight'),
      icon: 'align-right',
      param: 'right'
    }]
    super()
    @editor.hotkeys.add @editor.util.replaceHotkey(@shortcutList[0]), (e) =>
      if not @disabled
        console.log('do align');
        c = @nodes.first().css('text-align')
        console.log(c);
        i = @shortcutList.indexOf(c)
        if i == -1 then i = 1
        console.log('i', i)
        _i = i + 1
        if _i > 3 then _i = 1
        @command(@shortcutList[_i]);

  render: ->
    if @editor.util.os.mac
      @title = @title + ' ( Cmd + opt + y )'
    else
      @title = @title + ' ( Ctrl + alt + y )'
    super()

  setActive: (active, align = 'left') ->
    align = 'left' unless align in ['left', 'center', 'right']
    if align == 'left'
      super false
    else
      super active

    @el.removeClass 'align-left align-center align-right'
    @el.addClass('align-' + align) if active
    @setIcon 'align-' + align
    @menuEl.find('.menu-item').show().end()
        .find('.menu-item-' + align).hide()

  _status: ->
    @nodes = @editor.selection.nodes().filter(@htmlTag)
    if @nodes.length < 1
      @setDisabled true
      @setActive false
    else
      @setDisabled false
      @setActive true, @nodes.first().css('text-align')

  command: (align) ->
    unless align in ['left', 'center', 'right']
      throw new Error("simditor alignment button: invalid align #{align}")

    @nodes.css
      'text-align': if align == 'left' then '' else align

    @editor.trigger 'valuechanged'
    @editor.inputManager.throttledSelectionChanged()

Simditor.Toolbar.addButton AlignmentButton
