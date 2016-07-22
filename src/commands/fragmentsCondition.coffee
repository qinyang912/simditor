
FragmentsCondition = {}

FragmentsCondition.isInlineNode = (node) =>
  node.nodeType == 3 || !Simditor.CommandUtil.isBlockNode(node)

FragmentsCondition.isInlineTag = (tag) =>
  (f) =>
     @isInlineNode(f) && !Simditor.CommandUtil.isTag(f, tag)

FragmentsCondition.inlineNotLink = FragmentsCondition.isInlineTag("a")

Simditor.FragmentsCondition = FragmentsCondition