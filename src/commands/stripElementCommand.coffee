
class StripElementCommand extends StripCommand

	constructor: (editor, settings, options) ->
    tags = settings.tags || []
    if tags[0] == "ALL" 
      reg = "(?:[a-z]+:)?[a-z]+[1-6]?"
    else
      reg = tags.join "|"
    @nodeNamesRegExp = new RegExp("^(?:" + reg + ")$","i")
    settings.exclude = settings.exclude || []
    settings.stripCondition = settings.stripCondition || (l) => false
    super(editor, settings, options)

Simditor.StripElementCommand = StripElementCommand