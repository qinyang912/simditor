(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define('simditor', ["jquery","simple-module","simple-hotkeys","simple-uploader"], function ($, SimpleModule, simpleHotkeys, simpleUploader) {
      return (root['Simditor'] = factory($, SimpleModule, simpleHotkeys, simpleUploader));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("jquery"),require("simple-module"),require("simple-hotkeys"),require("simple-uploader"));
  } else {
    root['Simditor'] = factory(jQuery,SimpleModule,simple.hotkeys,simple.uploader);
  }
}(this, function ($, SimpleModule, simpleHotkeys, simpleUploader) {

var AlignmentButton, AttachButton, BlockquoteButton, BoldButton, Button, Clipboard, CodeButton, CodePopover, ColorButton, CommandBase, CommandUtil, Consolidator, DomRange, DomRangeMemento, DomTreeExtractor, FontScaleButton, FormatPaintButton, FormatPainterCommand, Formatter, FragmentContainer, FragmentsCondition, GlobalLink, HrButton, ImageButton, ImagePopover, IndentButton, Indentation, InlineCommand, InputManager, ItalicButton, Keystroke, LinkButton, LinkPopover, ListButton, NodeComparer, OrderListButton, OutdentButton, Popover, RangeFragmentsTraverser, RangeIterator, Selection, Simditor, StrikethroughButton, StripCommand, StripElementCommand, TableButton, TaskBlock, TitleButton, Toolbar, UnSelectionBlock, UnderlineButton, UndoButton, UndoManager, UnorderListButton, Util, WordNum,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  slice = [].slice;

Selection = (function(superClass) {
  extend(Selection, superClass);

  function Selection() {
    return Selection.__super__.constructor.apply(this, arguments);
  }

  Selection.pluginName = 'Selection';

  Selection.prototype._range = null;

  Selection.prototype._startNodes = null;

  Selection.prototype._endNodes = null;

  Selection.prototype._containerNode = null;

  Selection.prototype._nodes = null;

  Selection.prototype._blockNodes = null;

  Selection.prototype._rootNodes = null;

  Selection.prototype._init = function() {
    this.editor = this._module;
    this._selection = document.getSelection();
    this.editor.on('selectionchanged', (function(_this) {
      return function(e) {
        _this.reset();
        if (_this._selection.rangeCount) {
          return _this._range = _this._selection.getRangeAt(0);
        }
      };
    })(this));
    return this.editor.on('blur', (function(_this) {
      return function(e) {
        return _this.reset();
      };
    })(this));
  };

  Selection.prototype.reset = function() {
    this._range = null;
    this._startNodes = null;
    this._endNodes = null;
    this._containerNode = null;
    this._nodes = null;
    this._blockNodes = null;
    return this._rootNodes = null;
  };

  Selection.prototype.clear = function() {
    var e;
    try {
      this._selection.removeAllRanges();
    } catch (_error) {
      e = _error;
    }
    return this.reset();
  };

  Selection.prototype.range = function(range) {
    var ffOrIE;
    if (range) {
      this.clear();
      this._selection.addRange(range);
      this._range = range;
      ffOrIE = this.editor.util.browser.firefox || this.editor.util.browser.msie;
      if (!this.editor.inputManager.focused && ffOrIE) {
        this.editor.body.focus();
      }
    } else if (!this._range && this.editor.inputManager.focused && this._selection.rangeCount) {
      this._range = this._selection.getRangeAt(0);
    }
    return this._range;
  };

  Selection.prototype.startNodes = function() {
    if (this._range) {
      this._startNodes || (this._startNodes = (function(_this) {
        return function() {
          var startNodes;
          startNodes = $(_this._range.startContainer).parentsUntil(_this.editor.body).get();
          startNodes.unshift(_this._range.startContainer);
          return $(startNodes);
        };
      })(this)());
    }
    return this._startNodes;
  };

  Selection.prototype.endNodes = function() {
    var endNodes;
    if (this._range) {
      this._endNodes || (this._endNodes = this._range.collapsed ? this.startNodes() : (endNodes = $(this._range.endContainer).parentsUntil(this.editor.body).get(), endNodes.unshift(this._range.endContainer), $(endNodes)));
    }
    return this._endNodes;
  };

  Selection.prototype.containerNode = function() {
    if (this._range) {
      this._containerNode || (this._containerNode = $(this._range.commonAncestorContainer));
    }
    return this._containerNode;
  };

  Selection.prototype.nodes = function() {
    if (this._range) {
      this._nodes || (this._nodes = (function(_this) {
        return function() {
          var nodes;
          nodes = [];
          if (_this.startNodes().first().is(_this.endNodes().first())) {
            nodes = _this.startNodes().get();
          } else {
            _this.startNodes().each(function(i, node) {
              var $endNode, $node, $nodes, endIndex, index, sharedIndex, startIndex;
              $node = $(node);
              if (_this.endNodes().index($node) > -1) {
                return nodes.push(node);
              } else if ($node.parent().is(_this.editor.body) || (sharedIndex = _this.endNodes().index($node.parent())) > -1) {
                if (sharedIndex && sharedIndex > -1) {
                  $endNode = _this.endNodes().eq(sharedIndex - 1);
                } else {
                  $endNode = _this.endNodes().last();
                }
                $nodes = $node.parent().contents();
                startIndex = $nodes.index($node);
                endIndex = $nodes.index($endNode);
                return $.merge(nodes, $nodes.slice(startIndex, endIndex).get());
              } else {
                $nodes = $node.parent().contents();
                index = $nodes.index($node);
                return $.merge(nodes, $nodes.slice(index).get());
              }
            });
            _this.endNodes().each(function(i, node) {
              var $node, $nodes, index;
              $node = $(node);
              if ($node.parent().is(_this.editor.body) || _this.startNodes().index($node.parent()) > -1) {
                nodes.push(node);
                return false;
              } else {
                $nodes = $node.parent().contents();
                index = $nodes.index($node);
                return $.merge(nodes, $nodes.slice(0, index + 1));
              }
            });
          }
          return $($.unique(nodes));
        };
      })(this)());
    }
    return this._nodes;
  };

  Selection.prototype.blockNodes = function() {
    if (!this._range) {
      return;
    }
    this._blockNodes || (this._blockNodes = (function(_this) {
      return function() {
        return _this.nodes().filter(function(i, node) {
          return _this.editor.util.isBlockNode(node);
        });
      };
    })(this)());
    return this._blockNodes;
  };

  Selection.prototype.rootNodes = function() {
    if (!this._range) {
      return;
    }
    this._rootNodes || (this._rootNodes = (function(_this) {
      return function() {
        return _this.nodes().filter(function(i, node) {
          var $parent;
          $parent = $(node).parent();
          return $parent.is(_this.editor.body) || $parent.is('blockquote');
        });
      };
    })(this)());
    return this._rootNodes;
  };

  Selection.prototype.rangeAtEndOf = function(node, range) {
    var afterLastNode, beforeLastNode, endNode, endNodeLength, lastNodeIsBr, result;
    if (range == null) {
      range = this.range();
    }
    if (!(range && range.collapsed)) {
      return;
    }
    node = $(node)[0];
    endNode = range.endContainer;
    endNodeLength = this.editor.util.getNodeLength(endNode);
    beforeLastNode = range.endOffset === endNodeLength - 1;
    lastNodeIsBr = $(endNode).contents().last().is('br');
    afterLastNode = range.endOffset === endNodeLength;
    if (!((beforeLastNode && lastNodeIsBr) || afterLastNode)) {
      return false;
    }
    if (node === endNode) {
      return true;
    } else if (!$.contains(node, endNode)) {
      return false;
    }
    result = true;
    $(endNode).parentsUntil(node).addBack().each(function(i, n) {
      var $lastChild, beforeLastbr, isLastNode, nodes;
      nodes = $(n).parent().contents().filter(function() {
        return !(this !== n && this.nodeType === 3 && !this.nodeValue);
      });
      $lastChild = nodes.last();
      isLastNode = $lastChild.get(0) === n;
      beforeLastbr = $lastChild.is('br') && $lastChild.prev().get(0) === n;
      if (!(isLastNode || beforeLastbr)) {
        result = false;
        return false;
      }
    });
    return result;
  };

  Selection.prototype.rangeAtStartOf = function(node, range) {
    var result, startNode;
    if (range == null) {
      range = this.range();
    }
    if (!(range && range.collapsed)) {
      return;
    }
    node = $(node)[0];
    startNode = range.startContainer;
    if (range.startOffset !== 0) {
      return false;
    }
    if (node === startNode) {
      return true;
    } else if (!$.contains(node, startNode)) {
      return false;
    }
    result = true;
    $(startNode).parentsUntil(node).addBack().each(function(i, n) {
      var nodes;
      nodes = $(n).parent().contents().filter(function() {
        return !(this !== n && this.nodeType === 3 && !this.nodeValue);
      });
      if (nodes.first().get(0) !== n) {
        return result = false;
      }
    });
    return result;
  };

  Selection.prototype.insertNode = function(node, range) {
    if (range == null) {
      range = this.range();
    }
    if (!range) {
      return;
    }
    node = $(node)[0];
    range.insertNode(node);
    return this.setRangeAfter(node, range);
  };

  Selection.prototype.setRangeAfter = function(node, range) {
    if (range == null) {
      range = this.range();
    }
    if (range == null) {
      return;
    }
    node = $(node)[0];
    range.setEndAfter(node);
    range.collapse(false);
    return this.range(range);
  };

  Selection.prototype.setRangeBefore = function(node, range) {
    if (range == null) {
      range = this.range();
    }
    if (range == null) {
      return;
    }
    node = $(node)[0];
    range.setEndBefore(node);
    range.collapse(false);
    return this.range(range);
  };

  Selection.prototype.setRangeAtStartOf = function(node, range) {
    if (range == null) {
      range = this.range();
    }
    node = $(node).get(0);
    range.setEnd(node, 0);
    range.collapse(false);
    return this.range(range);
  };

  Selection.prototype.setRangeAtEndOf = function(node, range) {
    var $lastNode, $node, contents, lastChild, lastChildLength, lastText, nodeLength;
    if (range == null) {
      range = this.range();
    }
    $node = $(node);
    node = $node[0];
    if ($node.is('pre')) {
      contents = $node.contents();
      if (contents.length > 0) {
        lastChild = contents.last();
        lastText = lastChild.text();
        lastChildLength = this.editor.util.getNodeLength(lastChild[0]);
        if (lastText.charAt(lastText.length - 1) === '\n') {
          range.setEnd(lastChild[0], lastChildLength - 1);
        } else {
          range.setEnd(lastChild[0], lastChildLength);
        }
      } else {
        range.setEnd(node, 0);
      }
    } else {
      nodeLength = this.editor.util.getNodeLength(node);
      if (node.nodeType !== 3 && nodeLength > 0) {
        $lastNode = $(node).contents().last();
        if ($lastNode.is('br')) {
          nodeLength -= 1;
        } else if ($lastNode[0].nodeType !== 3 && this.editor.util.isEmptyNode($lastNode)) {
          $lastNode.append(this.editor.util.phBr);
          node = $lastNode[0];
          nodeLength = 0;
        }
      }
      range.setEnd(node, nodeLength);
    }
    range.collapse(false);
    return this.range(range);
  };

  Selection.prototype.deleteRangeContents = function(range) {
    var atEndOfBody, atStartOfBody, endRange, startRange;
    if (range == null) {
      range = this.range();
    }
    startRange = range.cloneRange();
    endRange = range.cloneRange();
    startRange.collapse(true);
    endRange.collapse(false);
    atStartOfBody = this.rangeAtStartOf(this.editor.body, startRange);
    atEndOfBody = this.rangeAtEndOf(this.editor.body, endRange);
    if (!range.collapsed && atStartOfBody && atEndOfBody) {
      this.editor.body.empty();
      range.setStart(this.editor.body[0], 0);
      range.collapse(true);
      this.range(range);
    } else {
      range.deleteContents();
    }
    return range;
  };

  Selection.prototype.breakBlockEl = function(el, range) {
    var $el;
    if (range == null) {
      range = this.range();
    }
    $el = $(el);
    if (!range.collapsed) {
      return $el;
    }
    range.setStartBefore($el.get(0));
    if (range.collapsed) {
      return $el;
    }
    return $el.before(range.extractContents());
  };

  Selection.prototype.save = function(range) {
    var endCaret, endRange, startCaret;
    if (range == null) {
      range = this.range();
    }
    if (this._selectionSaved) {
      return;
    }
    endRange = range.cloneRange();
    endRange.collapse(false);
    startCaret = $('<span/>').addClass('simditor-caret-start');
    endCaret = $('<span/>').addClass('simditor-caret-end');
    endRange.insertNode(endCaret[0]);
    range.insertNode(startCaret[0]);
    this.clear();
    return this._selectionSaved = true;
  };

  Selection.prototype.restore = function() {
    var endCaret, endContainer, endOffset, range, startCaret, startContainer, startOffset;
    if (!this._selectionSaved) {
      return false;
    }
    startCaret = this.editor.body.find('.simditor-caret-start');
    endCaret = this.editor.body.find('.simditor-caret-end');
    if (startCaret.length && endCaret.length) {
      startContainer = startCaret.parent();
      startOffset = startContainer.contents().index(startCaret);
      endContainer = endCaret.parent();
      endOffset = endContainer.contents().index(endCaret);
      if (startContainer[0] === endContainer[0]) {
        endOffset -= 1;
      }
      range = document.createRange();
      range.setStart(startContainer.get(0), startOffset);
      range.setEnd(endContainer.get(0), endOffset);
      startCaret.remove();
      endCaret.remove();
      this.range(range);
    } else {
      startCaret.remove();
      endCaret.remove();
    }
    this._selectionSaved = false;
    return range;
  };

  return Selection;

})(SimpleModule);

Formatter = (function(superClass) {
  extend(Formatter, superClass);

  function Formatter() {
    return Formatter.__super__.constructor.apply(this, arguments);
  }

  Formatter.pluginName = 'Formatter';

  Formatter.prototype.opts = {
    allowedTags: [],
    allowedAttributes: {},
    allowedStyles: {}
  };

  Formatter.prototype._init = function() {
    this.editor = this._module;
    this._allowedTags = $.merge(['br', 'span', 'a', 'img', 'b', 'strong', 'i', 'strike', 'u', 'font', 'p', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'h1', 'h2', 'h3', 'h4', 'hr', 'inherit', 'input'], this.opts.allowedTags);
    this._allowedAttributes = $.extend({
      img: ['src', 'alt', 'width', 'height', 'data-non-image', 'data-bucket', 'data-key-name', 'data-osskey', 'data-name'],
      a: ['href', 'target'],
      font: ['color'],
      code: ['class'],
      p: ['class', 'data-unique-id', 'data-file-id', 'data-file-name', 'data-file-src', 'data-attach', 'data-img', 'data-global-link', 'data-setting', 'data-task-block'],
      span: ['class', 'contenteditable', 'data-name', 'data-size', 'href', 'data-bucket', 'data-osskey', 'data-key-name', 'title', 'data-global-link-type', 'data-title', 'data-sub-title'],
      input: ['class', 'type', 'value', 'disabled']
    }, this.opts.allowedAttributes);
    this._allowedStyles = $.extend({
      span: ['color', 'font-size'],
      b: ['color'],
      i: ['color'],
      strong: ['color'],
      strike: ['color'],
      u: ['color'],
      p: ['margin-left', 'text-align'],
      h1: ['margin-left', 'text-align'],
      h2: ['margin-left', 'text-align'],
      h3: ['margin-left', 'text-align'],
      h4: ['margin-left', 'text-align']
    }, this.opts.allowedStyles);
    return this.editor.body.on('click', 'a', function(e) {
      var href;
      if ($(e.target).hasClass('unselection-attach-download')) {
        return true;
      }
      href = $(this).prop('href');
      return window.open(href);
    });
  };

  Formatter.prototype.decorate = function($el) {
    if ($el == null) {
      $el = this.editor.body;
    }
    this.editor.trigger('decorate', [$el]);
    return $el;
  };

  Formatter.prototype.undecorate = function($el) {
    if ($el == null) {
      $el = this.editor.body.clone();
    }
    this.editor.trigger('undecorate', [$el]);
    return $el;
  };

  Formatter.prototype.autolink = function($el) {
    var $link, $node, findLinkNode, lastIndex, len, linkNodes, match, re, replaceEls, subStr, text, uri, w;
    if ($el == null) {
      $el = this.editor.body;
    }
    linkNodes = [];
    findLinkNode = function($parentNode) {
      return $parentNode.contents().each(function(i, node) {
        var $node, text;
        $node = $(node);
        if ($node.is('a') || $node.closest('a, pre', $el).length) {
          return;
        }
        if (!$node.is('iframe') && $node.contents().length) {
          return findLinkNode($node);
        } else if ((text = $node.text()) && /https?:\/\/|www\./ig.test(text)) {
          return linkNodes.push($node);
        }
      });
    };
    findLinkNode($el);
    re = /(https?:\/\/|www\.)[\w\-\.\?&=\/#%:,@\!\+]+/ig;
    for (w = 0, len = linkNodes.length; w < len; w++) {
      $node = linkNodes[w];
      text = $node.text();
      replaceEls = [];
      match = null;
      lastIndex = 0;
      while ((match = re.exec(text)) !== null) {
        subStr = text.substring(lastIndex, match.index);
        replaceEls.push(document.createTextNode(subStr));
        lastIndex = re.lastIndex;
        uri = /^(http(s)?:\/\/|\/)/.test(match[0]) ? match[0] : 'http://' + match[0];
        $link = $("<a href=\"" + uri + "\" rel=\"nofollow\"></a>").text(match[0]);
        replaceEls.push($link[0]);
      }
      replaceEls.push(document.createTextNode(text.substring(lastIndex)));
      $node.replaceWith($(replaceEls));
    }
    return $el;
  };

  Formatter.prototype.format = function($el) {
    var $node, blockNode, len, len1, n, node, ref, ref1, w, y;
    if ($el == null) {
      $el = this.editor.body;
    }
    if ($el.is(':empty')) {
      $el.append('<p>' + this.editor.util.phBr + '</p>');
      return $el;
    }
    ref = $el.contents();
    for (w = 0, len = ref.length; w < len; w++) {
      n = ref[w];
      this.cleanNode(n, true);
    }
    ref1 = $el.contents();
    for (y = 0, len1 = ref1.length; y < len1; y++) {
      node = ref1[y];
      $node = $(node);
      if ($node.is('br')) {
        if (typeof blockNode !== "undefined" && blockNode !== null) {
          blockNode = null;
        }
        $node.remove();
      } else if (this.editor.util.isBlockNode(node)) {
        if ($node.is('li')) {
          if (blockNode && blockNode.is('ul, ol')) {
            blockNode.append(node);
          } else {
            blockNode = $('<ul/>').insertBefore(node);
            blockNode.append(node);
          }
        } else {
          blockNode = null;
        }
      } else {
        if (!blockNode || blockNode.is('ul, ol')) {
          blockNode = $('<p/>').insertBefore(node);
        }
        blockNode.append(node);
        if (this.editor.util.isEmptyNode(blockNode)) {
          blockNode.append(this.editor.util.phBr);
        }
      }
    }
    return $el;
  };

  Formatter.prototype.cleanNode = function(node, recursive) {
    var $blockEls, $childImg, $node, $p, $td, allowedAttributes, attr, contents, isDecoration, len, len1, n, ref, ref1, text, textNode, w, y;
    $node = $(node);
    if (!($node.length > 0)) {
      return;
    }
    if ($node[0].nodeType === 3) {
      text = $node.text().replace(/(\r\n|\n|\r)/gm, '');
      if (text) {
        textNode = document.createTextNode(text);
        $node.replaceWith(textNode);
      } else {
        $node.remove();
      }
      return;
    }
    contents = $node.is('iframe') ? null : $node.contents();
    isDecoration = this.editor.util.isDecoratedNode($node);
    if ($node.is(this._allowedTags.join(',')) || isDecoration) {
      if ($node.is('a') && ($childImg = $node.find('img')).length > 0) {
        $node.replaceWith($childImg);
        $node = $childImg;
        contents = null;
      }
      if ($node.is('td') && ($blockEls = $node.find(this.editor.util.blockNodes.join(','))).length > 0) {
        $blockEls.each((function(_this) {
          return function(i, blockEl) {
            return $(blockEl).contents().unwrap();
          };
        })(this));
        contents = $node.contents();
      }
      if ($node.is('img') && $node.hasClass('uploading')) {
        $node.remove();
      }
      if (!isDecoration) {
        allowedAttributes = this._allowedAttributes[$node[0].tagName.toLowerCase()];
        ref = $.makeArray($node[0].attributes);
        for (w = 0, len = ref.length; w < len; w++) {
          attr = ref[w];
          if (attr.name === 'style') {
            continue;
          }
          if (!((allowedAttributes != null) && (ref1 = attr.name, indexOf.call(allowedAttributes, ref1) >= 0))) {
            $node.removeAttr(attr.name);
          }
        }
        this._cleanNodeStyles($node);
        if ($node.is('span') && $node[0].attributes.length === 0) {
          $node.contents().first().unwrap();
        }
      }
    } else if ($node[0].nodeType === 1 && !$node.is(':empty')) {
      if ($node.is('div, article, dl, header, footer, tr')) {
        $node.append('<br/>');
        contents.first().unwrap();
      } else if ($node.is('table')) {
        $p = $('<p/>');
        $node.find('tr').each(function(i, tr) {
          return $p.append($(tr).text() + '<br/>');
        });
        $node.replaceWith($p);
        contents = null;
      } else if ($node.is('thead, tfoot')) {
        $node.remove();
        contents = null;
      } else if ($node.is('th')) {
        $td = $('<td/>').append($node.contents());
        $node.replaceWith($td);
      } else {
        contents.first().unwrap();
      }
    } else {
      $node.remove();
      contents = null;
    }
    if (recursive && (contents != null) && !$node.is('pre')) {
      for (y = 0, len1 = contents.length; y < len1; y++) {
        n = contents[y];
        this.cleanNode(n, true);
      }
    }
    return null;
  };

  Formatter.prototype._cleanNodeStyles = function($node) {
    var allowedStyles, len, pair, ref, ref1, style, styleStr, styles, w;
    styleStr = $node.attr('style');
    if (!styleStr) {
      return;
    }
    $node.removeAttr('style');
    allowedStyles = this._allowedStyles[$node[0].tagName.toLowerCase()];
    if (!(allowedStyles && allowedStyles.length > 0)) {
      return $node;
    }
    styles = {};
    ref = styleStr.split(';');
    for (w = 0, len = ref.length; w < len; w++) {
      style = ref[w];
      style = $.trim(style);
      pair = style.split(':');
      if (!(pair.length = 2)) {
        continue;
      }
      if (ref1 = pair[0], indexOf.call(allowedStyles, ref1) >= 0) {
        styles[$.trim(pair[0])] = $.trim(pair[1]);
      }
    }
    if (Object.keys(styles).length > 0) {
      $node.css(styles);
    }
    return $node;
  };

  Formatter.prototype.clearHtml = function(html, lineBreak) {
    var container, contents, result;
    if (lineBreak == null) {
      lineBreak = true;
    }
    container = $('<div/>').append(html);
    contents = container.contents();
    result = '';
    contents.each((function(_this) {
      return function(i, node) {
        var $node, children;
        if (node.nodeType === 3) {
          return result += node.nodeValue;
        } else if (node.nodeType === 1) {
          $node = $(node);
          children = $node.is('iframe') ? null : $node.contents();
          if (children && children.length > 0) {
            result += _this.clearHtml(children);
          }
          if (lineBreak && i < contents.length - 1 && $node.is('br, p, div, li,tr, pre, address, artticle, aside, dl, figcaption, footer, h1, h2,h3, h4, header')) {
            return result += '\n';
          }
        }
      };
    })(this));
    return result;
  };

  Formatter.prototype.beautify = function($contents) {
    var uselessP;
    uselessP = function($el) {
      return !!($el.is('p') && !$el.text() && $el.children(':not(br)').length < 1);
    };
    return $contents.each(function(i, el) {
      var $el, invalid;
      $el = $(el);
      invalid = $el.is(':not(img, br, col, td, hr, [class^="simditor-"]):empty');
      if (invalid || uselessP($el)) {
        $el.remove();
      }
      return $el.find(':not(img, br, col, td, hr, [class^="simditor-"]):empty').remove();
    });
  };

  return Formatter;

})(SimpleModule);

InputManager = (function(superClass) {
  extend(InputManager, superClass);

  function InputManager() {
    return InputManager.__super__.constructor.apply(this, arguments);
  }

  InputManager.pluginName = 'InputManager';

  InputManager.prototype._modifierKeys = [16, 17, 18, 91, 93, 224];

  InputManager.prototype._arrowKeys = [37, 38, 39, 40];

  InputManager.prototype._init = function() {
    var selectAllKey, submitKey;
    this.editor = this._module;
    this.throttledValueChanged = this.editor.util.throttle((function(_this) {
      return function(params) {
        return setTimeout(function() {
          return _this.editor.trigger('valuechanged', params);
        }, 10);
      };
    })(this), 300);
    this.throttledSelectionChanged = this.editor.util.throttle((function(_this) {
      return function() {
        return _this.editor.trigger('selectionchanged');
      };
    })(this), 50);
    $(document).on('selectionchange.simditor' + this.editor.id, (function(_this) {
      return function(e) {
        var triggerEvent;
        if (!(_this.focused && !_this.editor.clipboard.pasting)) {
          return;
        }
        triggerEvent = function() {
          if (_this._selectionTimer) {
            clearTimeout(_this._selectionTimer);
            _this._selectionTimer = null;
          }
          if (_this.editor.selection._selection.rangeCount > 0) {
            return _this.throttledSelectionChanged();
          } else {
            return _this._selectionTimer = setTimeout(function() {
              _this._selectionTimer = null;
              if (_this.focused) {
                return triggerEvent();
              }
            }, 10);
          }
        };
        return triggerEvent();
      };
    })(this));
    this.editor.on('valuechanged', (function(_this) {
      return function() {
        var $rootBlocks;
        _this.lastCaretPosition = null;
        $rootBlocks = _this.editor.body.children().filter(function(i, node) {
          return _this.editor.util.isBlockNode(node);
        });
        if (_this.focused && $rootBlocks.length === 0) {
          _this.editor.selection.save();
          _this.editor.formatter.format();
          _this.editor.selection.restore();
        }
        _this.editor.body.find('hr, pre, .simditor-table').each(function(i, el) {
          var $el, formatted;
          $el = $(el);
          if ($el.parent().is('blockquote') || $el.parent()[0] === _this.editor.body[0]) {
            formatted = false;
            if ($el.next().length === 0) {
              $('<p/>').append(_this.editor.util.phBr).insertAfter($el);
              formatted = true;
            }
            if ($el.prev().length === 0) {
              $('<p/>').append(_this.editor.util.phBr).insertBefore($el);
              formatted = true;
            }
            if (formatted) {
              return _this.throttledValueChanged();
            }
          }
        });
        _this.editor.body.find('pre:empty').append(_this.editor.util.phBr);
        if (!_this.editor.util.support.onselectionchange && _this.focused) {
          return _this.throttledSelectionChanged();
        }
      };
    })(this));
    this.editor.body.on('keydown', $.proxy(this._onKeyDown, this)).on('keypress', $.proxy(this._onKeyPress, this)).on('keyup', $.proxy(this._onKeyUp, this)).on('mouseup', $.proxy(this._onMouseUp, this)).on('focus', $.proxy(this._onFocus, this)).on('blur', $.proxy(this._onBlur, this)).on('drop', $.proxy(this._onDrop, this)).on('input', $.proxy(this._onInput, this));
    if (this.editor.util.browser.firefox) {
      this.editor.hotkeys.add('cmd+left', (function(_this) {
        return function(e) {
          e.preventDefault();
          _this.editor.selection._selection.modify('move', 'backward', 'lineboundary');
          return false;
        };
      })(this));
      this.editor.hotkeys.add('cmd+right', (function(_this) {
        return function(e) {
          e.preventDefault();
          _this.editor.selection._selection.modify('move', 'forward', 'lineboundary');
          return false;
        };
      })(this));
      selectAllKey = this.editor.util.os.mac ? 'cmd+a' : 'ctrl+a';
      this.editor.hotkeys.add(selectAllKey, (function(_this) {
        return function(e) {
          var $children, firstBlock, lastBlock, range;
          $children = _this.editor.body.children();
          if (!($children.length > 0)) {
            return;
          }
          firstBlock = $children.first().get(0);
          lastBlock = $children.last().get(0);
          range = document.createRange();
          range.setStart(firstBlock, 0);
          range.setEnd(lastBlock, _this.editor.util.getNodeLength(lastBlock));
          _this.editor.selection.range(range);
          return false;
        };
      })(this));
    }
    submitKey = this.editor.util.os.mac ? 'cmd+enter' : 'ctrl+enter';
    return this.editor.hotkeys.add(submitKey, (function(_this) {
      return function(e) {
        _this.editor.el.closest('form').find('button:submit').click();
        return false;
      };
    })(this));
  };

  InputManager.prototype._onFocus = function(e) {
    if (this.editor.clipboard.pasting) {
      return;
    }
    this.editor.el.addClass('focus').removeClass('error');
    this.focused = true;
    return setTimeout((function(_this) {
      return function() {
        var $blockEl, range;
        if (_this.editor.selection._selection.rangeCount) {
          range = _this.editor.selection._selection.getRangeAt(0);
        }
        if (range) {
          if (range.startContainer === _this.editor.body[0]) {
            if (_this.lastCaretPosition) {
              _this.editor.undoManager.caretPosition(_this.lastCaretPosition);
            } else {
              $blockEl = _this.editor.body.children().first();
              range = document.createRange();
              _this.editor.selection.setRangeAtStartOf($blockEl, range);
            }
          }
          _this.lastCaretPosition = null;
          _this.editor.triggerHandler('focus');
          if (!_this.editor.util.support.onselectionchange) {
            return _this.throttledSelectionChanged();
          }
        }
      };
    })(this), 0);
  };

  InputManager.prototype._onBlur = function(e) {
    var ref;
    if (this.editor.clipboard.pasting) {
      return;
    }
    this.editor.el.removeClass('focus');
    this.editor.sync();
    this.focused = false;
    this.lastCaretPosition = (ref = this.editor.undoManager.currentState()) != null ? ref.caret : void 0;
    return this.editor.triggerHandler('blur');
  };

  InputManager.prototype._onMouseUp = function(e) {
    if (!this.editor.util.support.onselectionchange) {
      return this.throttledSelectionChanged();
    }
  };

  InputManager.prototype._onKeyDown = function(e) {
    var ref, ref1;
    if (this.editor.triggerHandler(e) === false) {
      return false;
    }
    if (this.editor.hotkeys.respondTo(e)) {
      return;
    }
    if (this.editor.keystroke.respondTo(e)) {
      this.throttledValueChanged();
      return false;
    }
    if ((ref = e.which, indexOf.call(this._modifierKeys, ref) >= 0) || (ref1 = e.which, indexOf.call(this._arrowKeys, ref1) >= 0)) {
      return;
    }
    if (this.editor.util.metaKey(e) && e.which === 86) {
      return;
    }
    if (!this.editor.util.support.oninput) {
      this.throttledValueChanged(['typing']);
    }
    return null;
  };

  InputManager.prototype._onKeyPress = function(e) {
    if (this.editor.triggerHandler(e) === false) {
      return false;
    }
  };

  InputManager.prototype._onKeyUp = function(e) {
    var p, ref;
    if (this.editor.triggerHandler(e) === false) {
      return false;
    }
    if (!this.editor.util.support.onselectionchange && (ref = e.which, indexOf.call(this._arrowKeys, ref) >= 0)) {
      this.throttledValueChanged();
      return;
    }
    if ((e.which === 8 || e.which === 46) && this.editor.util.isEmptyNode(this.editor.body)) {
      this.editor.body.empty();
      p = $('<p/>').append(this.editor.util.phBr).appendTo(this.editor.body);
      this.editor.selection.setRangeAtStartOf(p);
    }
  };

  InputManager.prototype._onDrop = function(e) {
    if (this.editor.triggerHandler(e) === false) {
      return false;
    }
    return this.throttledValueChanged();
  };

  InputManager.prototype._onInput = function(e) {
    return this.throttledValueChanged(['oninput']);
  };

  return InputManager;

})(SimpleModule);

Keystroke = (function(superClass) {
  extend(Keystroke, superClass);

  function Keystroke() {
    return Keystroke.__super__.constructor.apply(this, arguments);
  }

  Keystroke.pluginName = 'Keystroke';

  Keystroke.prototype._init = function() {
    this.editor = this._module;
    this._keystrokeHandlers = {};
    return this._initKeystrokeHandlers();
  };

  Keystroke.prototype.add = function(key, node, handler) {
    key = key.toLowerCase();
    key = this.editor.hotkeys.constructor.aliases[key] || key;
    if (!this._keystrokeHandlers[key]) {
      this._keystrokeHandlers[key] = {};
    }
    return this._keystrokeHandlers[key][node] = handler;
  };

  Keystroke.prototype.respondTo = function(e) {
    var base, key, nodes, ref, result;
    key = (ref = this.editor.hotkeys.constructor.keyNameMap[e.which]) != null ? ref.toLowerCase() : void 0;
    if (!key) {
      return;
    }
    if (key in this._keystrokeHandlers) {
      result = typeof (base = this._keystrokeHandlers[key])['*'] === "function" ? base['*'](e) : void 0;
      if (!result) {
        nodes = this.editor.selection.startNodes();
        if (nodes) {
          nodes.each((function(_this) {
            return function(i, node) {
              var handler, ref1;
              if (node.nodeType !== Node.ELEMENT_NODE) {
                return;
              }
              handler = (ref1 = _this._keystrokeHandlers[key]) != null ? ref1[node.tagName.toLowerCase()] : void 0;
              result = typeof handler === "function" ? handler(e, $(node)) : void 0;
              if (result === true || result === false) {
                return false;
              }
            };
          })(this));
        }
      }
      if (result) {
        return true;
      }
    }
  };

  Keystroke.prototype._initKeystrokeHandlers = function() {
    var titleEnterHandler;
    if (this.editor.util.browser.safari) {
      this.add('enter', '*', (function(_this) {
        return function(e) {
          var $blockEl, $br;
          if (!e.shiftKey) {
            return;
          }
          $blockEl = _this.editor.selection.blockNodes().last();
          if ($blockEl.is('pre')) {
            return;
          }
          $br = $('<br/>');
          if (_this.editor.selection.rangeAtEndOf($blockEl)) {
            _this.editor.selection.insertNode($br);
            _this.editor.selection.insertNode($('<br/>'));
            _this.editor.selection.setRangeBefore($br);
          } else {
            _this.editor.selection.insertNode($br);
          }
          return true;
        };
      })(this));
    }
    if (this.editor.util.browser.webkit || this.editor.util.browser.msie) {
      titleEnterHandler = (function(_this) {
        return function(e, $node) {
          var $p;
          if (!_this.editor.selection.rangeAtEndOf($node)) {
            return;
          }
          $p = $('<p/>').append(_this.editor.util.phBr).insertAfter($node);
          _this.editor.selection.setRangeAtStartOf($p);
          return true;
        };
      })(this);
      this.add('enter', 'h1', titleEnterHandler);
      this.add('enter', 'h2', titleEnterHandler);
      this.add('enter', 'h3', titleEnterHandler);
      this.add('enter', 'h4', titleEnterHandler);
      this.add('enter', 'h5', titleEnterHandler);
      this.add('enter', 'h6', titleEnterHandler);
    }
    this.add('backspace', '*', (function(_this) {
      return function(e) {
        var $blockEl, $prevBlockEl, $rootBlock, $unSelectionWrapper, isWebkit;
        $rootBlock = _this.editor.selection.rootNodes().first();
        $prevBlockEl = $rootBlock.prev();
        if ($prevBlockEl.is('hr') && _this.editor.selection.rangeAtStartOf($rootBlock)) {
          _this.editor.selection.save();
          $prevBlockEl.remove();
          _this.editor.selection.restore();
          return true;
        }
        if ($prevBlockEl.closest('.unselection-wrapper').length) {
          $unSelectionWrapper = $prevBlockEl.closest('.unselection-wrapper');
        } else if ($prevBlockEl.find('.unselection-wrapper').length) {
          $unSelectionWrapper = $prevBlockEl.find('.unselection-wrapper').last();
        }
        if ($unSelectionWrapper && _this.editor.selection.rangeAtStartOf($rootBlock)) {
          _this.editor.selection.setRangeAtStartOf($unSelectionWrapper);
          if (_this.editor.util.browser.firefox) {
            _this.editor.trigger('selectionchanged');
          }
          e.preventDefault();
          return false;
        }
        $blockEl = _this.editor.selection.blockNodes().last();
        isWebkit = _this.editor.util.browser.webkit;
        if (isWebkit && _this.editor.selection.rangeAtStartOf($blockEl)) {
          _this.editor.selection.save();
          _this.editor.formatter.cleanNode($blockEl, true);
          _this.editor.selection.restore();
          return null;
        }
      };
    })(this));
    this.add('enter', 'li', (function(_this) {
      return function(e, $node) {
        var $cloneNode, listEl, newBlockEl, newListEl;
        $cloneNode = $node.clone();
        $cloneNode.find('ul, ol').remove();
        if (!(_this.editor.util.isEmptyNode($cloneNode) && $node.is(_this.editor.selection.blockNodes().last()))) {
          return;
        }
        listEl = $node.parent();
        if ($node.next('li').length > 0) {
          if (!_this.editor.util.isEmptyNode($node)) {
            return;
          }
          if (listEl.parent('li').length > 0) {
            newBlockEl = $('<li/>').append(_this.editor.util.phBr).insertAfter(listEl.parent('li'));
            newListEl = $('<' + listEl[0].tagName + '/>').append($node.nextAll('li'));
            newBlockEl.append(newListEl);
          } else {
            newBlockEl = $('<p/>').append(_this.editor.util.phBr).insertAfter(listEl);
            newListEl = $('<' + listEl[0].tagName + '/>').append($node.nextAll('li'));
            newBlockEl.after(newListEl);
          }
        } else {
          if (listEl.parent('li').length > 0) {
            newBlockEl = $('<li/>').insertAfter(listEl.parent('li'));
            if ($node.contents().length > 0) {
              newBlockEl.append($node.contents());
            } else {
              newBlockEl.append(_this.editor.util.phBr);
            }
          } else {
            newBlockEl = $('<p/>').append(_this.editor.util.phBr).insertAfter(listEl);
            if ($node.children('ul, ol').length > 0) {
              newBlockEl.after($node.children('ul, ol'));
            }
          }
        }
        if ($node.prev('li').length) {
          $node.remove();
        } else {
          listEl.remove();
        }
        _this.editor.selection.setRangeAtStartOf(newBlockEl);
        return true;
      };
    })(this));
    this.add('enter', 'pre', (function(_this) {
      return function(e, $node) {
        var $p, breakNode, range;
        e.preventDefault();
        if (e.shiftKey) {
          $p = $('<p/>').append(_this.editor.util.phBr).insertAfter($node);
          _this.editor.selection.setRangeAtStartOf($p);
          return true;
        }
        range = _this.editor.selection.range();
        breakNode = null;
        range.deleteContents();
        if (!_this.editor.util.browser.msie && _this.editor.selection.rangeAtEndOf($node)) {
          breakNode = document.createTextNode('\n\n');
          range.insertNode(breakNode);
          range.setEnd(breakNode, 1);
        } else {
          breakNode = document.createTextNode('\n');
          range.insertNode(breakNode);
          range.setStartAfter(breakNode);
        }
        range.collapse(false);
        _this.editor.selection.range(range);
        return true;
      };
    })(this));
    this.add('enter', 'blockquote', (function(_this) {
      return function(e, $node) {
        var $closestBlock, range;
        $closestBlock = _this.editor.selection.blockNodes().last();
        if (!($closestBlock.is('p') && !$closestBlock.next().length && _this.editor.util.isEmptyNode($closestBlock))) {
          return;
        }
        $node.after($closestBlock);
        range = document.createRange();
        _this.editor.selection.setRangeAtStartOf($closestBlock, range);
        return true;
      };
    })(this));
    this.add('backspace', 'li', (function(_this) {
      return function(e, $node) {
        var $br, $childList, $newLi, $prevChildList, $prevNode, $textNode, isFF, range, text;
        $childList = $node.children('ul, ol');
        $prevNode = $node.prev('li');
        if (!($childList.length > 0 && $prevNode.length > 0)) {
          return false;
        }
        text = '';
        $textNode = null;
        $node.contents().each(function(i, n) {
          if (n.nodeType === 1 && /UL|OL/.test(n.nodeName)) {
            return false;
          }
          if (n.nodeType === 1 && /BR/.test(n.nodeName)) {
            return;
          }
          if (n.nodeType === 3 && n.nodeValue) {
            text += n.nodeValue;
          } else if (n.nodeType === 1) {
            text += $(n).text();
          }
          return $textNode = $(n);
        });
        isFF = _this.editor.util.browser.firefox && !$textNode.next('br').length;
        if ($textNode && text.length === 1 && isFF) {
          $br = $(_this.editor.util.phBr).insertAfter($textNode);
          $textNode.remove();
          _this.editor.selection.setRangeBefore($br);
          return true;
        } else if (text.length > 0) {
          return false;
        }
        range = document.createRange();
        $prevChildList = $prevNode.children('ul, ol');
        if ($prevChildList.length > 0) {
          $newLi = $('<li/>').append(_this.editor.util.phBr).appendTo($prevChildList);
          $prevChildList.append($childList.children('li'));
          $node.remove();
          _this.editor.selection.setRangeAtEndOf($newLi, range);
        } else {
          _this.editor.selection.setRangeAtEndOf($prevNode, range);
          $prevNode.append($childList);
          $node.remove();
          _this.editor.selection.range(range);
        }
        return true;
      };
    })(this));
    this.add('backspace', 'pre', (function(_this) {
      return function(e, $node) {
        var $newNode, codeStr, range;
        if (!_this.editor.selection.rangeAtStartOf($node)) {
          return;
        }
        codeStr = $node.html().replace('\n', '<br/>') || _this.editor.util.phBr;
        $newNode = $('<p/>').append(codeStr).insertAfter($node);
        $node.remove();
        range = document.createRange();
        _this.editor.selection.setRangeAtStartOf($newNode, range);
        return true;
      };
    })(this));
    return this.add('backspace', 'blockquote', (function(_this) {
      return function(e, $node) {
        var $firstChild, range;
        if (!_this.editor.selection.rangeAtStartOf($node)) {
          return;
        }
        $firstChild = $node.children().first().unwrap();
        range = document.createRange();
        _this.editor.selection.setRangeAtStartOf($firstChild, range);
        return true;
      };
    })(this));
  };

  return Keystroke;

})(SimpleModule);

UndoManager = (function(superClass) {
  extend(UndoManager, superClass);

  function UndoManager() {
    return UndoManager.__super__.constructor.apply(this, arguments);
  }

  UndoManager.pluginName = 'UndoManager';

  UndoManager.prototype._index = -1;

  UndoManager.prototype._capacity = 20;

  UndoManager.prototype._startPosition = null;

  UndoManager.prototype._endPosition = null;

  UndoManager.prototype._init = function() {
    var redoShortcut, undoShortcut;
    this.editor = this._module;
    this._stack = [];
    if (this.editor.util.os.mac) {
      undoShortcut = 'cmd+z';
      redoShortcut = 'cmd+y';
    } else if (this.editor.util.os.win) {
      undoShortcut = 'ctrl+z';
      redoShortcut = 'ctrl+y';
    } else {
      undoShortcut = 'ctrl+z';
      redoShortcut = 'shift+ctrl+z';
    }
    this.editor.hotkeys.add(undoShortcut, (function(_this) {
      return function(e) {
        e.preventDefault();
        _this.undo();
        return false;
      };
    })(this));
    this.editor.hotkeys.add(redoShortcut, (function(_this) {
      return function(e) {
        e.preventDefault();
        _this.redo();
        return false;
      };
    })(this));
    this.throttledPushState = this.editor.util.throttle((function(_this) {
      return function() {
        return _this._pushUndoState();
      };
    })(this), 2000);
    this.editor.on('valuechanged', (function(_this) {
      return function(e, src) {
        if (src === 'undo' || src === 'redo') {
          return;
        }
        return _this.throttledPushState();
      };
    })(this));
    this.editor.on('selectionchanged', (function(_this) {
      return function(e) {
        _this.resetCaretPosition();
        return _this.update();
      };
    })(this));
    this.editor.on('focus', (function(_this) {
      return function(e) {
        if (_this._stack.length === 0) {
          return _this._pushUndoState();
        }
      };
    })(this));
    return this.editor.on('blur', (function(_this) {
      return function(e) {
        return _this.resetCaretPosition();
      };
    })(this));
  };

  UndoManager.prototype.resetCaretPosition = function() {
    this._startPosition = null;
    return this._endPosition = null;
  };

  UndoManager.prototype.startPosition = function() {
    if (this.editor.selection._range) {
      this._startPosition || (this._startPosition = this._getPosition('start'));
    }
    return this._startPosition;
  };

  UndoManager.prototype.endPosition = function() {
    if (this.editor.selection._range) {
      this._endPosition || (this._endPosition = (function(_this) {
        return function() {
          var range;
          range = _this.editor.selection.range();
          if (range.collapsed) {
            return _this._startPosition;
          }
          return _this._getPosition('end');
        };
      })(this)());
    }
    return this._endPosition;
  };

  UndoManager.prototype._pushUndoState = function() {
    var caret;
    if (this.editor.triggerHandler('pushundostate') === false) {
      return;
    }
    caret = this.caretPosition();
    if (!caret.start) {
      return;
    }
    this._index += 1;
    this._stack.length = this._index;
    this._stack.push({
      html: this.editor.body.html(),
      caret: this.caretPosition()
    });
    if (this._stack.length > this._capacity) {
      this._stack.shift();
      return this._index -= 1;
    }
  };

  UndoManager.prototype.currentState = function() {
    if (this._stack.length && this._index > -1) {
      return this._stack[this._index];
    } else {
      return null;
    }
  };

  UndoManager.prototype.undo = function() {
    var state;
    if (this._index < 1 || this._stack.length < 2) {
      return;
    }
    this.editor.hidePopover();
    this._index -= 1;
    state = this._stack[this._index];
    this.editor.body.get(0).innerHTML = state.html;
    this.caretPosition(state.caret);
    this.editor.body.find('.selected').removeClass('selected');
    this.editor.sync();
    return this.editor.trigger('valuechanged', ['undo']);
  };

  UndoManager.prototype.redo = function() {
    var state;
    if (this._index < 0 || this._stack.length < this._index + 2) {
      return;
    }
    this.editor.hidePopover();
    this._index += 1;
    state = this._stack[this._index];
    this.editor.body.get(0).innerHTML = state.html;
    this.caretPosition(state.caret);
    this.editor.body.find('.selected').removeClass('selected');
    this.editor.sync();
    return this.editor.trigger('valuechanged', ['redo']);
  };

  UndoManager.prototype.update = function() {
    var currentState, html;
    currentState = this.currentState();
    if (!currentState) {
      return;
    }
    html = this.editor.body.html();
    currentState.caret = this.caretPosition();
    if (currentState.html !== html) {
      return;
    }
    return currentState.html = html;
  };

  UndoManager.prototype._getNodeOffset = function(node, index) {
    var $parent, merging, offset;
    if ($.isNumeric(index)) {
      $parent = $(node);
    } else {
      $parent = $(node).parent();
    }
    offset = 0;
    merging = false;
    $parent.contents().each(function(i, child) {
      if (node === child || (index === i && i === 0)) {
        return false;
      }
      if (child.nodeType === Node.TEXT_NODE) {
        if (!merging && child.nodeValue.length > 0) {
          offset += 1;
          merging = true;
        }
      } else {
        offset += 1;
        merging = false;
      }
      if (index - 1 === i) {
        return false;
      }
      return null;
    });
    return offset;
  };

  UndoManager.prototype._getPosition = function(type) {
    var $nodes, node, nodes, offset, position, prevNode, range;
    if (type == null) {
      type = 'start';
    }
    range = this.editor.selection.range();
    offset = range[type + "Offset"];
    $nodes = this.editor.selection[type + "Nodes"]();
    node = $nodes.first()[0];
    if (node.nodeType === Node.TEXT_NODE) {
      prevNode = node.previousSibling;
      while (prevNode && prevNode.nodeType === Node.TEXT_NODE) {
        node = prevNode;
        offset += this.editor.util.getNodeLength(prevNode);
        prevNode = prevNode.previousSibling;
      }
      nodes = $nodes.get();
      nodes[0] = node;
      $nodes = $(nodes);
    } else {
      offset = this._getNodeOffset(node, offset);
    }
    position = [offset];
    $nodes.each((function(_this) {
      return function(i, node) {
        return position.unshift(_this._getNodeOffset(node));
      };
    })(this));
    return position;
  };

  UndoManager.prototype._getNodeByPosition = function(position) {
    var child, childNodes, i, len, node, offset, ref, w;
    node = this.editor.body[0];
    ref = position.slice(0, position.length - 1);
    for (i = w = 0, len = ref.length; w < len; i = ++w) {
      offset = ref[i];
      childNodes = node.childNodes;
      if (offset > childNodes.length - 1) {
        if (i === position.length - 2 && $(node).is('pre:empty')) {
          child = document.createTextNode('');
          node.appendChild(child);
          childNodes = node.childNodes;
        } else {
          node = null;
          break;
        }
      }
      node = childNodes[offset];
    }
    return node;
  };

  UndoManager.prototype.caretPosition = function(caret) {
    var endContainer, endOffset, range, startContainer, startOffset;
    if (!caret) {
      range = this.editor.selection.range();
      caret = this.editor.inputManager.focused && (range != null) ? {
        start: this.startPosition(),
        end: this.endPosition(),
        collapsed: range.collapsed
      } : {};
      return caret;
    } else {
      if (!caret.start) {
        return;
      }
      startContainer = this._getNodeByPosition(caret.start);
      startOffset = caret.start[caret.start.length - 1];
      if (caret.collapsed) {
        endContainer = startContainer;
        endOffset = startOffset;
      } else {
        endContainer = this._getNodeByPosition(caret.end);
        endOffset = caret.start[caret.start.length - 1];
      }
      if (!startContainer || !endContainer) {
        if (typeof console !== "undefined" && console !== null) {
          if (typeof console.warn === "function") {
            console.warn('simditor: invalid caret state');
          }
        }
        return;
      }
      range = document.createRange();
      if (startOffset > startContainer.length) {
        startOffset = startContainer.length;
      }
      if (endOffset > endContainer.length) {
        endOffset = endContainer.length;
      }
      if (startContainer.nodeType === 1) {
        startOffset = 0;
      }
      if (endContainer.nodeType === 1) {
        endOffset = 0;
      }
      range.setStart(startContainer, startOffset);
      range.setEnd(endContainer, endOffset);
      return this.editor.selection.range(range);
    }
  };

  return UndoManager;

})(SimpleModule);

Util = (function(superClass) {
  extend(Util, superClass);

  function Util() {
    return Util.__super__.constructor.apply(this, arguments);
  }

  Util.pluginName = 'Util';

  Util.prototype.emptyNodeRegExp = /^&nbsp;?$/;

  Util.prototype._init = function() {
    this.editor = this._module;
    if (this.browser.msie && this.browser.version < 11) {
      this.phBr = '';
    }
    return Simditor.util = this;
  };

  Util.prototype.phBr = '<br/>';

  Util.prototype.os = (function() {
    var os;
    os = {};
    if (/Mac/.test(navigator.appVersion)) {
      os.mac = true;
    } else if (/Linux/.test(navigator.appVersion)) {
      os.linux = true;
    } else if (/Win/.test(navigator.appVersion)) {
      os.win = true;
    } else if (/X11/.test(navigator.appVersion)) {
      os.unix = true;
    }
    if (/Mobi/.test(navigator.appVersion)) {
      os.mobile = true;
    }
    return os;
  })();

  Util.prototype.browser = (function() {
    var chrome, edge, firefox, ie, ref, ref1, ref2, ref3, ref4, safari, ua;
    ua = navigator.userAgent;
    ie = /(msie|trident)/i.test(ua);
    chrome = /chrome|crios/i.test(ua);
    safari = /safari/i.test(ua) && !chrome;
    firefox = /firefox/i.test(ua);
    edge = /edge/i.test(ua);
    if (ie) {
      return {
        msie: true,
        version: ((ref = ua.match(/(msie |rv:)(\d+(\.\d+)?)/i)) != null ? ref[2] : void 0) * 1
      };
    } else if (edge) {
      return {
        edge: true,
        webkit: true,
        version: ((ref1 = ua.match(/edge\/(\d+(\.\d+)?)/i)) != null ? ref1[1] : void 0) * 1
      };
    } else if (chrome) {
      return {
        webkit: true,
        chrome: true,
        version: ((ref2 = ua.match(/(?:chrome|crios)\/(\d+(\.\d+)?)/i)) != null ? ref2[1] : void 0) * 1
      };
    } else if (safari) {
      return {
        webkit: true,
        safari: true,
        version: ((ref3 = ua.match(/version\/(\d+(\.\d+)?)/i)) != null ? ref3[1] : void 0) * 1
      };
    } else if (firefox) {
      return {
        mozilla: true,
        firefox: true,
        version: ((ref4 = ua.match(/firefox\/(\d+(\.\d+)?)/i)) != null ? ref4[1] : void 0) * 1
      };
    } else {
      return {};
    }
  })();

  Util.prototype.support = (function() {
    return {
      onselectionchange: (function() {
        var e, onselectionchange;
        onselectionchange = document.onselectionchange;
        if (onselectionchange !== void 0) {
          try {
            document.onselectionchange = 0;
            return document.onselectionchange === null;
          } catch (_error) {
            e = _error;
          } finally {
            document.onselectionchange = onselectionchange;
          }
        }
        return false;
      })(),
      oninput: (function() {
        return !/(msie|trident)/i.test(navigator.userAgent);
      })()
    };
  })();

  Util.prototype.reflow = function(el) {
    if (el == null) {
      el = document;
    }
    return $(el)[0].offsetHeight;
  };

  Util.prototype.metaKey = function(e) {
    var isMac;
    isMac = /Mac/.test(navigator.userAgent);
    if (isMac) {
      return e.metaKey;
    } else {
      return e.ctrlKey;
    }
  };

  Util.prototype.isEmptyNode = function(node) {
    var $node;
    $node = $(node);
    return $node.is(':empty') || (!$node.text() && !$node.find(':not(br, span, div)').length);
  };

  Util.prototype.isDecoratedNode = function(node) {
    return $(node).is('[class^="simditor-"]');
  };

  Util.prototype.blockNodes = ["div", "p", "ul", "ol", "li", "blockquote", "hr", "pre", "h1", "h2", "h3", "h4", "h5", "table"];

  Util.prototype.isBlockNode = function(node) {
    node = $(node)[0];
    if (!node || node.nodeType === 3) {
      return false;
    }
    return new RegExp("^(" + (this.blockNodes.join('|')) + ")$").test(node.nodeName.toLowerCase());
  };

  Util.prototype.getNextNode = function(node) {
    var $next, $node;
    $node = $(node);
    $next = $node.next();
    if (!$next.length) {
      $node = $node.parent();
      while (!$next.length && !$node.is(this.editor.body)) {
        $next = $node.next();
        $node = $node.parent();
      }
    }
    return $next[0];
  };

  Util.prototype.getPrevNode = function(node) {
    var $node, $prev;
    $node = $(node);
    $prev = $node.prev();
    if (!$prev.length) {
      $node = $node.parent();
      while (!$prev.length && !$node.is(this.editor.body)) {
        $prev = $node.prev();
        $node = $node.parent();
      }
    }
    return $prev[0];
  };

  Util.prototype.getRootNodeFromNode = function(node) {
    var $node;
    $node = $(node);
    while ($node.length && !$node.parent().is(this.editor.body)) {
      $node = $node.parent();
    }
    return $node[0];
  };

  Util.prototype.isTextNode = function(node) {
    node = $(node)[0];
    return node && node.nodeType && (node.nodeType === 3 || node.nodeType === 4 || node.nodeType === 8);
  };

  Util.prototype.canHaveChildren = function(node) {
    node = $(node)[0];
    if (!node || this.isTextNode(node)) {
      return false;
    }
    switch ((node.tagName || node.nodeName).toUpperCase()) {
      case "AREA":
      case "BASE":
      case "BASEFONT":
      case "COL":
      case "FRAME":
      case "HR":
      case "IMG":
      case "BR":
      case "INPUT":
      case "ISINDEX":
      case "LINK":
      case "META":
      case "PARAM":
        return false;
      default:
        return true;
    }
  };

  Util.prototype.isTag = function(node, tagName) {
    node = $(node)[0];
    return !!(node && node.tagName && tagName) && node.tagName.toLowerCase() === tagName.toLowerCase();
  };

  Util.prototype.isList = function(node) {
    return this.isTag(node, "ul") || this.isTag(node, "ol");
  };

  Util.prototype.isHeading = function(node) {
    return node && /^H[1-6]$/i.test(node.nodeName);
  };

  Util.prototype.isTableCell = function(node) {
    return this.isTag(node, "td") || this.isTag(node, "th");
  };

  Util.prototype.isBlockComponent = function(node) {
    return this.isTag(node, "li") || this.isTableCell(node);
  };

  Util.prototype.isAncestorOf = function(m, l) {
    var error, tempL;
    try {
      if (this.isTextNode(l)) {
        tempL = l.parentNode;
      } else {
        tempL = l;
      }
      return !this.isTextNode(m) && (l.parentNode === m || $.contains(m, tempL));
    } catch (_error) {
      error = _error;
      return false;
    }
  };

  Util.prototype.isAncestorOrSelf = function(l, k) {
    return this.isAncestorOf(l, k) || (l === k);
  };

  Util.prototype.findAncestorUntil = function(l, k) {
    if (this.isAncestorOf(l, k)) {
      while (k && k.parentNode !== l) {
        k = k.parentNode;
      }
    }
    return k;
  };

  Util.prototype.traversePreviousNode = function(l) {
    var k, m;
    k = l;
    while (k && !(m = k.previousSibling)) {
      k = k.parentNode;
    }
    return m;
  };

  Util.prototype.findNodeIndex = function(node) {
    var index;
    node = $(node)[0];
    index = 0;
    while (node.previousSibling) {
      node = node.previousSibling;
      index++;
    }
    return index;
  };

  Util.prototype.findCommonAncestor = function(k, l) {
    while (k && k !== l && !this.isAncestorOf(k, l)) {
      k = k.parentNode;
    }
    return k;
  };

  Util.prototype.getAllChildNodesBy = function(m, l) {
    var k;
    k = [];
    this._getChildNodes(m, k, l);
    return k;
  };

  Util.prototype._getChildNodes = function(o, l, m, p) {
    var firstChild, n, results;
    firstChild = o.firstChild;
    results = [];
    while (firstChild) {
      n = m(firstChild);
      if (!(p && n) && firstChild.nodeType === 1 && this.canHaveChildren(firstChild)) {
        this._getChildNodes(firstChild, l, m, p);
      }
      if (n) {
        l.push(firstChild);
      }
      results.push(firstChild = firstChild.nextSibling);
    }
    return results;
  };

  Util.prototype.getNodeLength = function(node) {
    node = $(node)[0];
    switch (node.nodeType) {
      case 7:
      case 10:
        return 0;
      case 3:
      case 8:
        return node.length;
      default:
        return node.childNodes.length;
    }
  };

  Util.prototype.dataURLtoBlob = function(dataURL) {
    var BlobBuilder, arrayBuffer, bb, blobArray, byteString, hasArrayBufferViewSupport, hasBlobConstructor, i, intArray, mimeString, ref, supportBlob, w;
    hasBlobConstructor = window.Blob && (function() {
      var e;
      try {
        return Boolean(new Blob());
      } catch (_error) {
        e = _error;
        return false;
      }
    })();
    hasArrayBufferViewSupport = hasBlobConstructor && window.Uint8Array && (function() {
      var e;
      try {
        return new Blob([new Uint8Array(100)]).size === 100;
      } catch (_error) {
        e = _error;
        return false;
      }
    })();
    BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
    supportBlob = hasBlobConstructor || BlobBuilder;
    if (!(supportBlob && window.atob && window.ArrayBuffer && window.Uint8Array)) {
      return false;
    }
    if (dataURL.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURL.split(',')[1]);
    } else {
      byteString = decodeURIComponent(dataURL.split(',')[1]);
    }
    arrayBuffer = new ArrayBuffer(byteString.length);
    intArray = new Uint8Array(arrayBuffer);
    for (i = w = 0, ref = byteString.length; 0 <= ref ? w <= ref : w >= ref; i = 0 <= ref ? ++w : --w) {
      intArray[i] = byteString.charCodeAt(i);
    }
    mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    if (hasBlobConstructor) {
      blobArray = hasArrayBufferViewSupport ? intArray : arrayBuffer;
      return new Blob([blobArray], {
        type: mimeString
      });
    }
    bb = new BlobBuilder();
    bb.append(arrayBuffer);
    return bb.getBlob(mimeString);
  };

  Util.prototype.throttle = function(func, wait) {
    var args, call, ctx, last, rtn, throttled, timeoutID;
    last = 0;
    timeoutID = 0;
    ctx = args = rtn = null;
    call = function() {
      timeoutID = 0;
      last = +new Date();
      rtn = func.apply(ctx, args);
      ctx = null;
      return args = null;
    };
    throttled = function() {
      var delta;
      ctx = this;
      args = arguments;
      delta = new Date() - last;
      if (!timeoutID) {
        if (delta >= wait) {
          call();
        } else {
          timeoutID = setTimeout(call, wait - delta);
        }
      }
      return rtn;
    };
    throttled.clear = function() {
      if (!timeoutID) {
        return;
      }
      clearTimeout(timeoutID);
      return call();
    };
    return throttled;
  };

  Util.prototype.formatHTML = function(html) {
    var cursor, indentString, lastMatch, level, match, re, repeatString, result, str;
    re = /<(\/?)(.+?)(\/?)>/g;
    result = '';
    level = 0;
    lastMatch = null;
    indentString = '  ';
    repeatString = function(str, n) {
      return new Array(n + 1).join(str);
    };
    while ((match = re.exec(html)) !== null) {
      match.isBlockNode = $.inArray(match[2], this.blockNodes) > -1;
      match.isStartTag = match[1] !== '/' && match[3] !== '/';
      match.isEndTag = match[1] === '/' || match[3] === '/';
      cursor = lastMatch ? lastMatch.index + lastMatch[0].length : 0;
      if ((str = html.substring(cursor, match.index)).length > 0 && $.trim(str)) {
        result += str;
      }
      if (match.isBlockNode && match.isEndTag && !match.isStartTag) {
        level -= 1;
      }
      if (match.isBlockNode && match.isStartTag) {
        if (!(lastMatch && lastMatch.isBlockNode && lastMatch.isEndTag)) {
          result += '\n';
        }
        result += repeatString(indentString, level);
      }
      result += match[0];
      if (match.isBlockNode && match.isEndTag) {
        result += '\n';
      }
      if (match.isBlockNode && match.isStartTag) {
        level += 1;
      }
      lastMatch = match;
    }
    return $.trim(result);
  };

  Util.prototype.isEditorContentArea = function(node) {
    if (node && node === this.editor.body[0]) {
      return true;
    } else {
      return false;
    }
  };

  Util.prototype.removeNode = function(node) {
    var parentNode;
    parentNode = node.parentNode;
    if (parentNode !== null) {
      while (node.firstChild) {
        parentNode.insertBefore(node.firstChild, node);
      }
      parentNode.removeChild(node);
      return parentNode;
    }
    return true;
  };

  Util.prototype.removeChildren = function(node) {
    var results;
    results = [];
    while (node.firstChild) {
      results.push(node.removeChild(node.firstChild));
    }
    return results;
  };

  Util.prototype.cloneNodeClean = function(node) {
    var cloneNode;
    cloneNode = node.cloneNode(false);
    this.removeChildren(cloneNode);
    return cloneNode;
  };

  Util.prototype.isTextNodeEmpty = function(node) {
    return !/[^\s\xA0\u200b]+/.test(node.nodeValue);
  };

  Util.prototype.isTextNodeCompletelyEmpty = function(node) {
    return !/[^\n\r\t\u200b]+/.test(node.nodeValue);
  };

  Util.prototype.isNodeEmpty = function(node) {
    return this.isNodeCompletelyEmpty(node) || this.emptyNodeRegExp.test(node.innerHTML);
  };

  Util.prototype.isNodeCompletelyEmpty = function(node) {
    return !node.innerHTML || node.childNodes.length === 0;
  };

  Util.prototype.isEmptyDom = function(node) {
    if (this.isTextNode(node)) {
      return this.isTextNodeEmpty(node);
    } else {
      return this.isNodeEmpty(node);
    }
  };

  Util.prototype.isCompletelyEmptyDom = function(node) {
    if (this.isTextNode(node)) {
      return this.isTextNodeCompletelyEmpty(node);
    } else {
      return this.isNodeCompletelyEmpty(node);
    }
  };

  Util.prototype.isNodeEmptyRecursive = function(m, k) {
    var firstChild;
    if (m.nodeType === 1 && !this.canHaveChildren(m)) {
      return false;
    } else {
      if (m.childNodes.length === 0) {
        if (k) {
          return this.isCompletelyEmptyDom(m);
        } else {
          return this.isEmptyDom(m);
        }
      } else {
        if (this.isList(m) && m.children.length === 0) {
          return true;
        }
      }
    }
    firstChild = m.firstChild;
    while (firstChild && this.isNodeEmptyRecursive(firstChild, k)) {
      firstChild = firstChild.nextSibling;
    }
    return !firstChild;
  };

  Util.prototype.every = function(nodes, fn) {
    var len, node, w;
    for (w = 0, len = nodes.length; w < len; w++) {
      node = nodes[w];
      if (!fn(node)) {
        return false;
      }
    }
    return true;
  };

  Util.prototype.some = function(nodes, fn) {
    var len, node, w;
    for (w = 0, len = nodes.length; w < len; w++) {
      node = nodes[w];
      if (fn(node)) {
        return true;
      }
    }
    return false;
  };

  Util.prototype.getComputedStyle = function(node, style) {
    var computedStyle;
    computedStyle = window.getComputedStyle(node, null);
    return computedStyle.getPropertyValue(style);
  };

  Util.prototype.hasAttributes = function(node) {
    var a, b, c, l;
    l = this.getOuterHtml(node).replace(node.innerHTML, "");
    a = /=["][^"]/.test(l);
    b = /=['][^']/.test(l);
    c = /=[^'"]/.test(l);
    return a || b || c;
  };

  Util.prototype.getOuterHtml = function(node) {
    var b, c;
    if (node.outerHTML) {
      return node.outerHTML;
    } else {
      b = node.cloneNode(true);
      c = document.createElement("div");
      c.appendChild(b);
      return c.innerHTML;
    }
  };

  return Util;

})(SimpleModule);

Toolbar = (function(superClass) {
  extend(Toolbar, superClass);

  function Toolbar() {
    return Toolbar.__super__.constructor.apply(this, arguments);
  }

  Toolbar.pluginName = 'Toolbar';

  Toolbar.prototype.opts = {
    toolbar: true,
    toolbarFloat: true,
    toolbarHidden: false,
    toolbarFloatOffset: 0,
    moreOption: true
  };

  Toolbar.prototype._tpl = {
    wrapper: '<div class="simditor-toolbar"><ul></ul></div>',
    separator: '<li data-type="separator"><span class="separator"></span></li>',
    moreOption: '<li><a href="javascript:;" class="toolbar-item toolbar-item-more-option"><span>更多</span></a><div class="more-option"><ul></ul></div></li>'
  };

  Toolbar.prototype._init = function() {
    var floatInitialized, initToolbarFloat, toolbarHeight;
    this.editor = this._module;
    if (!this.opts.toolbar) {
      return;
    }
    if (!$.isArray(this.opts.toolbar)) {
      this.opts.toolbar = ['bold', 'italic', 'underline', 'strikethrough', '|', 'ol', 'ul', 'blockquote', 'code', '|', 'link', 'image', '|', 'indent', 'outdent'];
    }
    this._render();
    this.wrapper.on('mousedown', (function(_this) {
      return function(e) {
        return _this.list.find('.menu-on').removeClass('.menu-on');
      };
    })(this));
    $(document).on('mousedown.simditor' + this.editor.id, (function(_this) {
      return function(e) {
        return _this.list.find('.menu-on').removeClass('.menu-on');
      };
    })(this));
    if (!this.opts.toolbarHidden && this.opts.toolbarFloat) {
      this.wrapper.css('top', this.opts.toolbarFloatOffset);
      toolbarHeight = 0;
      initToolbarFloat = (function(_this) {
        return function() {
          _this.wrapper.css('position', 'static');
          _this.wrapper.width('auto');
          _this.editor.util.reflow(_this.wrapper);
          _this.wrapper.width(_this.wrapper.outerWidth());
          _this.wrapper.css('left', _this.editor.util.os.mobile ? _this.wrapper.position().left : _this.wrapper.offset().left);
          _this.wrapper.css('position', '');
          toolbarHeight = _this.wrapper.outerHeight();
          _this.editor.placeholderEl.css('top', toolbarHeight);
          return true;
        };
      })(this);
      floatInitialized = null;
      $(window).on('resize.simditor-' + this.editor.id, function(e) {
        return floatInitialized = initToolbarFloat();
      });
      $(window).on('scroll.simditor-' + this.editor.id, (function(_this) {
        return function(e) {
          var bottomEdge, scrollTop, topEdge;
          if (!_this.wrapper.is(':visible')) {
            return;
          }
          topEdge = _this.editor.wrapper.offset().top;
          bottomEdge = topEdge + _this.editor.wrapper.outerHeight() - 80;
          scrollTop = $(document).scrollTop() + _this.opts.toolbarFloatOffset;
          if (scrollTop <= topEdge || scrollTop >= bottomEdge) {
            _this.editor.wrapper.removeClass('toolbar-floating').css('padding-top', '');
            if (_this.editor.util.os.mobile) {
              return _this.wrapper.css('top', _this.opts.toolbarFloatOffset);
            }
          } else {
            floatInitialized || (floatInitialized = initToolbarFloat());
            _this.editor.wrapper.addClass('toolbar-floating').css('padding-top', toolbarHeight);
            if (_this.editor.util.os.mobile) {
              return _this.wrapper.css('top', scrollTop - topEdge + _this.opts.toolbarFloatOffset);
            }
          }
        };
      })(this));
    }
    this.editor.on('destroy', (function(_this) {
      return function() {
        return _this.buttons.length = 0;
      };
    })(this));
    return $(document).on("mousedown.simditor-" + this.editor.id, (function(_this) {
      return function(e) {
        return _this.list.find('li.menu-on').removeClass('menu-on');
      };
    })(this));
  };

  Toolbar.prototype._render = function() {
    var button, len, name, ref, separator, w;
    this.buttons = [];
    this.buttonsJson = {};
    this.separators = [];
    this.otherEls = [];
    this.wrapper = $(this._tpl.wrapper).prependTo(this.editor.wrapper);
    this.list = this.wrapper.find('ul');
    ref = this.opts.toolbar;
    for (w = 0, len = ref.length; w < len; w++) {
      name = ref[w];
      if (name === '|') {
        separator = $(this._tpl.separator).appendTo(this.list);
        this.separators.push(separator);
        continue;
      }
      if (name instanceof $) {
        name.appendTo(this.list);
        this.otherEls.push(name);
        continue;
      }
      if (!this.constructor.buttons[name]) {
        throw new Error("simditor: invalid toolbar button " + name);
        continue;
      }
      button = new this.constructor.buttons[name]({
        editor: this.editor
      });
      this.buttons.push(button);
      this.buttonsJson[name] = button;
    }
    if (this.opts.toolbarHidden) {
      this.wrapper.hide();
    }
    if (!this.opts.toolbarHidden && this.opts.moreOption) {
      return this._moreOption();
    }
  };

  Toolbar.prototype._moreOption = function() {
    this.moreOption = $(this._tpl.moreOption).appendTo(this.list);
    this.moreOptionList = [];
    this.moreOption.hide();
    setTimeout(this._renderMoreOption.bind(this), 0);
    this.moreOption.on("mousedown", (function(_this) {
      return function(e) {
        e.preventDefault();
        return _this.moreOption.find('.more-option').toggleClass('open');
      };
    })(this));
    return this._resize();
  };

  Toolbar.prototype._renderMoreOption = function() {
    var buttonCount, first, getMoveInCount, getMoveOutCount, listWidth, moreOptionWidth, moveInCount, moveOutCount, otherElCount, prev, ref, ref1, separatorCount, separatorWidth, totalWidth, w, x, y;
    listWidth = this.list.width();
    moreOptionWidth = this.moreOption.outerWidth();
    separatorCount = this.separators.length;
    separatorWidth = this.separators[0].outerWidth();
    otherElCount = this.otherEls.length;
    buttonCount = this.buttons.length;
    totalWidth = 0;
    moveInCount = 1;
    moveOutCount = 0;
    getMoveInCount = (function(_this) {
      return function(_count) {
        var _totalWidth;
        _totalWidth = 0;
        if (_this.list.find('>li').length >= _count) {
          _this.list.find('>li').each(function(index) {
            if (index < _this.list.find('>li').length - (_count + 1)) {
              return _totalWidth += _this.list.find('>li:eq(' + index + ')').outerWidth();
            }
          });
          if (_totalWidth + moreOptionWidth >= listWidth) {
            return getMoveInCount(++moveInCount);
          }
        }
      };
    })(this);
    getMoveOutCount = (function(_this) {
      return function(_count) {
        var _totalWidth, ref, w, x;
        _totalWidth = 0;
        _this.list.find('>li').each(function(index) {
          return _totalWidth += _this.list.find('>li:eq(' + index + ')').outerWidth();
        });
        if (_this.moreOptionList[_count]) {
          for (x = w = 0, ref = _count; 0 <= ref ? w <= ref : w >= ref; x = 0 <= ref ? ++w : --w) {
            _totalWidth += _this.moreOptionList[x].outerWidth();
          }
          if (_totalWidth < listWidth) {
            return getMoveOutCount(++moveOutCount);
          }
        }
      };
    })(this);
    this.list.find('>li').each((function(_this) {
      return function(index) {
        return totalWidth += _this.list.find('>li:eq(' + index + ')').outerWidth();
      };
    })(this));
    if (totalWidth >= listWidth) {
      getMoveInCount(moveInCount);
      for (x = w = 1, ref = moveInCount; 1 <= ref ? w <= ref : w >= ref; x = 1 <= ref ? ++w : --w) {
        prev = this.moreOption.prev();
        prev.detach();
        this.moreOptionList.unshift(prev);
        prev.prependTo(this.moreOption.find('ul:eq(0)'));
      }
    } else if (totalWidth < listWidth) {
      getMoveOutCount(moveOutCount);
      if (moveOutCount > 0) {
        for (x = y = 0, ref1 = moveOutCount - 1; 0 <= ref1 ? y <= ref1 : y >= ref1; x = 0 <= ref1 ? ++y : --y) {
          first = this.moreOptionList.shift();
          first.detach();
          this.moreOption.before(first);
        }
      }
    }
    if (this.moreOptionList.length) {
      return this.moreOption.css({
        'display': ''
      });
    } else {
      return this.moreOption.hide();
    }
  };

  Toolbar.prototype._resize = function() {
    $(window).off("resize.simditor-more-option");
    return $(window).on("resize.simditor-more-option", (function(_this) {
      return function(e) {
        if (_this.resizeTimer) {
          clearTimeout(_this.resizeTimer);
        }
        return _this.resizeTimer = setTimeout(function() {
          _this.resizeTimer = null;
          return _this._renderMoreOption();
        }, 0);
      };
    })(this));
  };

  Toolbar.prototype.findButton = function(name) {
    var button;
    button = this.list.find('.toolbar-item-' + name).data('button');
    return button != null ? button : null;
  };

  Toolbar.addButton = function(btn) {
    return this.buttons[btn.prototype.name] = btn;
  };

  Toolbar.buttons = {};

  return Toolbar;

})(SimpleModule);

Indentation = (function(superClass) {
  extend(Indentation, superClass);

  function Indentation() {
    return Indentation.__super__.constructor.apply(this, arguments);
  }

  Indentation.pluginName = 'Indentation';

  Indentation.prototype.opts = {
    tabIndent: true
  };

  Indentation.prototype._init = function() {
    this.editor = this._module;
    return this.editor.keystroke.add('tab', '*', (function(_this) {
      return function(e) {
        var codeButton;
        codeButton = _this.editor.toolbar.findButton('code');
        if (!(_this.opts.tabIndent || (codeButton && codeButton.active))) {
          return;
        }
        return _this.indent(e.shiftKey);
      };
    })(this));
  };

  Indentation.prototype.indent = function(isBackward) {
    var $blockNodes, $endNodes, $startNodes, nodes, result;
    $startNodes = this.editor.selection.startNodes();
    $endNodes = this.editor.selection.endNodes();
    $blockNodes = this.editor.selection.blockNodes();
    nodes = [];
    $blockNodes = $blockNodes.each(function(i, node) {
      var include, j, len, n, w;
      include = true;
      for (j = w = 0, len = nodes.length; w < len; j = ++w) {
        n = nodes[j];
        if ($.contains(node, n)) {
          include = false;
          break;
        } else if ($.contains(n, node)) {
          nodes.splice(j, 1, node);
          include = false;
          break;
        }
      }
      if (include) {
        return nodes.push(node);
      }
    });
    $blockNodes = $(nodes);
    result = false;
    $blockNodes.each((function(_this) {
      return function(i, blockEl) {
        var r;
        r = isBackward ? _this.outdentBlock(blockEl) : _this.indentBlock(blockEl);
        if (r) {
          return result = r;
        }
      };
    })(this));
    return result;
  };

  Indentation.prototype.indentBlock = function(blockEl) {
    var $blockEl, $childList, $nextTd, $nextTr, $parentLi, $pre, $td, $tr, marginLeft, tagName;
    $blockEl = $(blockEl);
    if (!$blockEl.length) {
      return;
    }
    if ($blockEl.is('pre')) {
      $pre = this.editor.selection.containerNode();
      if (!($pre.is($blockEl) || $pre.closest('pre').is($blockEl))) {
        return;
      }
      this.indentText(this.editor.selection.range());
    } else if ($blockEl.is('li')) {
      $parentLi = $blockEl.prev('li');
      if ($parentLi.length < 1) {
        return;
      }
      this.editor.selection.save();
      tagName = $blockEl.parent()[0].tagName;
      $childList = $parentLi.children('ul, ol');
      if ($childList.length > 0) {
        $childList.append($blockEl);
      } else {
        $('<' + tagName + '/>').append($blockEl).appendTo($parentLi);
      }
      this.editor.selection.restore();
    } else if ($blockEl.is('p, h1, h2, h3, h4')) {
      marginLeft = parseInt($blockEl.css('margin-left')) || 0;
      marginLeft = (Math.round(marginLeft / this.opts.indentWidth) + 1) * this.opts.indentWidth;
      $blockEl.css('margin-left', marginLeft);
    } else if ($blockEl.is('table') || $blockEl.is('.simditor-table')) {
      $td = this.editor.selection.containerNode().closest('td, th');
      $nextTd = $td.next('td, th');
      if (!($nextTd.length > 0)) {
        $tr = $td.parent('tr');
        $nextTr = $tr.next('tr');
        if ($nextTr.length < 1 && $tr.parent().is('thead')) {
          $nextTr = $tr.parent('thead').next('tbody').find('tr:first');
        }
        $nextTd = $nextTr.find('td:first, th:first');
      }
      if (!($td.length > 0 && $nextTd.length > 0)) {
        return;
      }
      this.editor.selection.setRangeAtEndOf($nextTd);
    } else {
      return false;
    }
    return true;
  };

  Indentation.prototype.indentText = function(range) {
    var text, textNode;
    text = range.toString().replace(/^(?=.+)/mg, '\u00A0\u00A0');
    textNode = document.createTextNode(text || '\u00A0\u00A0');
    range.deleteContents();
    range.insertNode(textNode);
    if (text) {
      range.selectNode(textNode);
      return this.editor.selection.range(range);
    } else {
      return this.editor.selection.setRangeAfter(textNode);
    }
  };

  Indentation.prototype.outdentBlock = function(blockEl) {
    var $blockEl, $parent, $parentLi, $pre, $prevTd, $prevTr, $td, $tr, marginLeft, range;
    $blockEl = $(blockEl);
    if (!($blockEl && $blockEl.length > 0)) {
      return;
    }
    if ($blockEl.is('pre')) {
      $pre = this.editor.selection.containerNode();
      if (!($pre.is($blockEl) || $pre.closest('pre').is($blockEl))) {
        return;
      }
      this.outdentText(range);
    } else if ($blockEl.is('li')) {
      $parent = $blockEl.parent();
      $parentLi = $parent.parent('li');
      this.editor.selection.save();
      if ($parentLi.length < 1) {
        range = document.createRange();
        range.setStartBefore($parent[0]);
        range.setEndBefore($blockEl[0]);
        $parent.before(range.extractContents());
        $('<p/>').insertBefore($parent).after($blockEl.children('ul, ol')).append($blockEl.contents());
        $blockEl.remove();
      } else {
        if ($blockEl.next('li').length > 0) {
          $('<' + $parent[0].tagName + '/>').append($blockEl.nextAll('li')).appendTo($blockEl);
        }
        $blockEl.insertAfter($parentLi);
        if ($parent.children('li').length < 1) {
          $parent.remove();
        }
      }
      this.editor.selection.restore();
    } else if ($blockEl.is('p, h1, h2, h3, h4')) {
      marginLeft = parseInt($blockEl.css('margin-left')) || 0;
      marginLeft = Math.max(Math.round(marginLeft / this.opts.indentWidth) - 1, 0) * this.opts.indentWidth;
      $blockEl.css('margin-left', marginLeft === 0 ? '' : marginLeft);
    } else if ($blockEl.is('table') || $blockEl.is('.simditor-table')) {
      $td = this.editor.selection.containerNode().closest('td, th');
      $prevTd = $td.prev('td, th');
      if (!($prevTd.length > 0)) {
        $tr = $td.parent('tr');
        $prevTr = $tr.prev('tr');
        if ($prevTr.length < 1 && $tr.parent().is('tbody')) {
          $prevTr = $tr.parent('tbody').prev('thead').find('tr:first');
        }
        $prevTd = $prevTr.find('td:last, th:last');
      }
      if (!($td.length > 0 && $prevTd.length > 0)) {
        return;
      }
      this.editor.selection.setRangeAtEndOf($prevTd);
    } else {
      return false;
    }
    return true;
  };

  Indentation.prototype.outdentText = function(range) {};

  return Indentation;

})(SimpleModule);

Clipboard = (function(superClass) {
  extend(Clipboard, superClass);

  function Clipboard() {
    return Clipboard.__super__.constructor.apply(this, arguments);
  }

  Clipboard.pluginName = 'Clipboard';

  Clipboard.prototype.opts = {
    pasteImage: false,
    cleanPaste: false
  };

  Clipboard.prototype._init = function() {
    this.editor = this._module;
    if (this.opts.pasteImage && typeof this.opts.pasteImage !== 'string') {
      this.opts.pasteImage = 'inline';
    }
    return this.editor.body.on('paste', (function(_this) {
      return function(e) {
        var range;
        if (_this.pasting || _this._pasteBin) {
          return;
        }
        if (_this.editor.triggerHandler(e) === false) {
          return false;
        }
        range = _this.editor.selection.deleteRangeContents();
        if (_this.editor.body.html()) {
          if (!range.collapsed) {
            range.collapse(true);
          }
        } else {
          _this.editor.formatter.format();
          _this.editor.selection.setRangeAtStartOf(_this.editor.body.find('p:first'));
        }
        if (_this._processPasteByClipboardApi(e)) {
          return false;
        }
        _this.editor.inputManager.throttledValueChanged.clear();
        _this.editor.inputManager.throttledSelectionChanged.clear();
        _this.editor.undoManager.throttledPushState.clear();
        _this.editor.selection.reset();
        _this.editor.undoManager.resetCaretPosition();
        _this.pasting = true;
        return _this._getPasteContent(function(pasteContent) {
          _this._processPasteContent(pasteContent);
          _this._pasteInBlockEl = null;
          _this._pastePlainText = null;
          return _this.pasting = false;
        });
      };
    })(this));
  };

  Clipboard.prototype._processPasteByClipboardApi = function(e) {
    var imageFile, pasteItem, ref, uploadOpt;
    if (this.editor.util.browser.edge) {
      return;
    }
    if (e.originalEvent.clipboardData && e.originalEvent.clipboardData.items && e.originalEvent.clipboardData.items.length > 0) {
      pasteItem = e.originalEvent.clipboardData.items[0];
      if (/^image\//.test(pasteItem.type)) {
        imageFile = pasteItem.getAsFile();
        if (!((imageFile != null) && this.opts.pasteImage)) {
          return;
        }
        if (!imageFile.name) {
          imageFile.name = "Clipboard Image.png";
        }
        if (this.editor.triggerHandler('pasting', [imageFile]) === false) {
          return;
        }
        uploadOpt = {};
        uploadOpt[this.opts.pasteImage] = true;
        if ((ref = this.editor.uploader) != null) {
          ref.upload(imageFile, uploadOpt);
        }
        return true;
      }
    }
  };

  Clipboard.prototype._getPasteContent = function(callback) {
    var state;
    this._pasteBin = $('<div contenteditable="true" />').addClass('simditor-paste-bin').attr('tabIndex', '-1').appendTo(this.editor.el);
    state = {
      html: this.editor.body.html(),
      caret: this.editor.undoManager.caretPosition()
    };
    this._pasteBin.focus();
    return setTimeout((function(_this) {
      return function() {
        var pasteContent;
        _this.editor.hidePopover();
        _this.editor.body.get(0).innerHTML = state.html;
        _this.editor.undoManager.caretPosition(state.caret);
        _this.editor.body.focus();
        _this.editor.selection.reset();
        _this.editor.selection.range();
        _this._pasteInBlockEl = _this.editor.selection.blockNodes().last();
        _this._pastePlainText = _this.opts.cleanPaste || _this._pasteInBlockEl.is('pre, table');
        if (_this._pastePlainText) {
          pasteContent = _this.editor.formatter.clearHtml(_this._pasteBin.html(), true);
        } else {
          pasteContent = $('<div/>').append(_this._pasteBin.contents());
          pasteContent.find('table colgroup').remove();
          _this.editor.formatter.format(pasteContent);
          _this.editor.formatter.decorate(pasteContent);
          _this.editor.formatter.beautify(pasteContent.children());
          pasteContent = pasteContent.contents();
        }
        _this._pasteBin.remove();
        _this._pasteBin = null;
        return callback(pasteContent);
      };
    })(this), 0);
  };

  Clipboard.prototype._processPasteContent = function(pasteContent) {
    var $blockEl, $img, aa, ab, blob, children, insertPosition, lastLine, len, len1, len2, len3, len4, line, lines, node, ref, ref1, ref2, uploadOpt, w, y, z;
    if (this.editor.triggerHandler('pasting', [pasteContent]) === false) {
      return;
    }
    $blockEl = this._pasteInBlockEl;
    if (!pasteContent) {
      return;
    } else if (this._pastePlainText) {
      if ($blockEl.is('table')) {
        lines = pasteContent.split('\n');
        lastLine = lines.pop();
        for (w = 0, len = lines.length; w < len; w++) {
          line = lines[w];
          this.editor.selection.insertNode(document.createTextNode(line));
          this.editor.selection.insertNode($('<br/>'));
        }
        this.editor.selection.insertNode(document.createTextNode(lastLine));
      } else {
        pasteContent = $('<div/>').text(pasteContent);
        ref = pasteContent.contents();
        for (y = 0, len1 = ref.length; y < len1; y++) {
          node = ref[y];
          this.editor.selection.insertNode($(node)[0]);
        }
      }
    } else if ($blockEl.is(this.editor.body)) {
      for (z = 0, len2 = pasteContent.length; z < len2; z++) {
        node = pasteContent[z];
        this.editor.selection.insertNode(node);
      }
    } else if (pasteContent.length < 1) {
      return;
    } else if (pasteContent.length === 1) {
      if (pasteContent.is('p')) {
        children = pasteContent.contents();
        if (children.length === 1 && children.is('img')) {
          $img = children;
          if (/^data:image/.test($img.attr('src'))) {
            if (!this.opts.pasteImage) {
              return;
            }
            blob = this.editor.util.dataURLtoBlob($img.attr("src"));
            blob.name = "Clipboard Image.png";
            uploadOpt = {};
            uploadOpt[this.opts.pasteImage] = true;
            if ((ref1 = this.editor.uploader) != null) {
              ref1.upload(blob, uploadOpt);
            }
            return;
          } else if ($img.is('img[src^="webkit-fake-url://"]')) {
            return;
          }
        }
        for (aa = 0, len3 = children.length; aa < len3; aa++) {
          node = children[aa];
          this.editor.selection.insertNode(node);
        }
      } else if ($blockEl.is('p') && this.editor.util.isEmptyNode($blockEl)) {
        $blockEl.replaceWith(pasteContent);
        this.editor.selection.setRangeAtEndOf(pasteContent);
      } else if (pasteContent.is('ul, ol')) {
        if (pasteContent.find('li').length === 1) {
          pasteContent = $('<div/>').text(pasteContent.text());
          ref2 = pasteContent.contents();
          for (ab = 0, len4 = ref2.length; ab < len4; ab++) {
            node = ref2[ab];
            this.editor.selection.insertNode($(node)[0]);
          }
        } else if ($blockEl.is('li')) {
          $blockEl.parent().after(pasteContent);
          this.editor.selection.setRangeAtEndOf(pasteContent);
        } else {
          $blockEl.after(pasteContent);
          this.editor.selection.setRangeAtEndOf(pasteContent);
        }
      } else {
        $blockEl.after(pasteContent);
        this.editor.selection.setRangeAtEndOf(pasteContent);
      }
    } else {
      if ($blockEl.is('li')) {
        $blockEl = $blockEl.parent();
      }
      if (this.editor.selection.rangeAtStartOf($blockEl)) {
        insertPosition = 'before';
      } else if (this.editor.selection.rangeAtEndOf($blockEl)) {
        insertPosition = 'after';
      } else {
        this.editor.selection.breakBlockEl($blockEl);
        insertPosition = 'before';
      }
      $blockEl[insertPosition](pasteContent);
      this.editor.selection.setRangeAtEndOf(pasteContent.last());
    }
    return this.editor.inputManager.throttledValueChanged();
  };

  return Clipboard;

})(SimpleModule);

UnSelectionBlock = (function(superClass) {
  extend(UnSelectionBlock, superClass);

  function UnSelectionBlock() {
    return UnSelectionBlock.__super__.constructor.apply(this, arguments);
  }

  UnSelectionBlock.pluginName = 'UnSelectionBlock';

  UnSelectionBlock.className = {
    wrapper: 'unselection-wrapper',
    inlineWrapper: 'unselection-inline-wrapper',
    img: 'unselection-img',
    attach: 'unselection-attach',
    select: 'unselection-select',
    content: 'unselection-content',
    preview: 'unselection-attach-preview',
    download: 'unselection-attach-download',
    _delete: 'unselection-attach-delete',
    progress: 'unSelection-attach-progress',
    globalLink: 'unselection-global-link',
    taskBlock: 'unselection-task-block',
    taskBlockSetting: 'unselection-task-block-setting'
  };

  UnSelectionBlock.selector = {
    content: '.unselection-content',
    subTitle: '[data-sub-title]'
  };

  UnSelectionBlock.attr = {
    select: 'data-unselection-select',
    bucket: 'data-bucket',
    key: 'data-key-name',
    unique: 'data-unique-id',
    fileId: 'data-file-id',
    fileName: 'data-file-name',
    fileSrc: 'data-file-src',
    attach: 'data-attach',
    img: 'data-img',
    globalLink: 'data-global-link',
    globalLinkType: 'data-global-link-type',
    taskBlock: 'data-task-block',
    taskBlockSetting: 'data-setting',
    taskBlockTitle: 'data-title',
    taskBlockSubTitle: 'data-sub-title'
  };

  UnSelectionBlock.prototype._selectedWrapper = null;

  UnSelectionBlock._tpl = {
    wrapper: "<p class='" + UnSelectionBlock.className.wrapper + "'></p>",
    attach: "<inherit> <span class='" + UnSelectionBlock.className.inlineWrapper + "'> <span class='" + UnSelectionBlock.className.attach + " " + UnSelectionBlock.className.content + "' contenteditable='false'> <span class='simditor-r-icon-attachment unselection-attach-icon'></span> <span data-name=''></span> <span data-size='24M'></span> <span class='unselection-attach-operation' contenteditable='false'> <span class='simditor-r-icon-eye unselection-attach-operation-icon unselection-attach-preview' title='预览'></span> <a class='simditor-r-icon-download unselection-attach-operation-icon unselection-attach-download' title='下载' target='_blank'></a> <span class='simditor-r-icon-arrow_down unselection-attach-operation-icon unselection-attach-more' title='更多'> <span class='unselection-attach-menu'> <span class='unselection-attach-menu-item unselection-attach-delete' title='删除'></span> </span> </span> </span> </span> </span> </inherit>",
    img: "<img src='' alt=''>",
    uploader: "<span data-progress=''><span></span></span>",
    globalLink: "<inherit> <span class='" + UnSelectionBlock.className.inlineWrapper + "'> <span class='" + UnSelectionBlock.className.globalLink + " " + UnSelectionBlock.className.content + "' contenteditable='false'> <span data-global-link-type=''></span> <span data-name=''></span> <span class='unselection-attach-operation' contenteditable='false'> <span class='simditor-r-icon-arrow_down unselection-attach-operation-icon unselection-attach-more' title='更多'> <span class='unselection-attach-menu'> <span class='unselection-attach-menu-item unselection-attach-delete' title='删除'></span> </span> </span> </span> </span> </span> </inherit>",
    taskBlock: "<inherit> <span class='" + UnSelectionBlock.className.inlineWrapper + "'> <span class='" + UnSelectionBlock.className.taskBlock + " " + UnSelectionBlock.className.content + "' contenteditable='false'> <span data-title=''></span> <span data-sub-title=''></span> <span class='simditor-r-icon-setting " + UnSelectionBlock.className.taskBlockSetting + "'></span> <span class='simditor-r-icon-close " + UnSelectionBlock.className._delete + "'></span> </span> </span> </inherit>"
  };

  UnSelectionBlock.prototype._init = function() {
    this.editor = this._module;
    this.editor.on('selectionchanged', this._onSelectionChange.bind(this));
    this._preview();
    this._patchFirefox();
    this.editor.body.on('click.simditor-unSelection', "." + UnSelectionBlock.className.wrapper, (function(_this) {
      return function(e) {
        return _this._isUnSelectionClick = true;
      };
    })(this));
    this.editor.body.on('click.simditor-unSelection', "." + UnSelectionBlock.className.globalLink, (function(_this) {
      return function(e) {
        return _this._unGlobalLinkClick(e);
      };
    })(this));
    this.editor.body.on('click.simditor-unSelection', "." + UnSelectionBlock.className.preview, (function(_this) {
      return function(e) {
        _this._unAttachPreviewClick(e);
        return false;
      };
    })(this));
    this.editor.body.on('click.simditor-unSelection', "." + UnSelectionBlock.className.download, (function(_this) {
      return function(e) {
        _this._unAttachDownloadClick(e);
        return false;
      };
    })(this));
    this.editor.body.on('click.simditor-unSelection', "." + UnSelectionBlock.className.attach, (function(_this) {
      return function(e) {
        return _this._unAttachClick(e);
      };
    })(this));
    this.editor.body.on('click.simditor-unSelection', "." + UnSelectionBlock.className.taskBlockSetting, (function(_this) {
      return function(e) {
        return _this._unTaskBlockSettingClick(e);
      };
    })(this));
    $(document).on('click.simditor-unSelection-' + this.editor.id, (function(_this) {
      return function(e) {
        if (!_this._isUnSelectionClick) {
          _this._selectCurrent(false);
        } else {
          _this._isUnSelectionClick = false;
        }
      };
    })(this));
    this.editor.body.on('click.simditor-unSelection', "." + UnSelectionBlock.className._delete, (function(_this) {
      return function(e) {
        var wrapper;
        wrapper = $(e.target).closest("." + UnSelectionBlock.className.wrapper, _this.editor.body);
        if (wrapper.length) {
          _this._delete(wrapper);
        }
        return false;
      };
    })(this));
    return $(document).on('keydown.simditor-unSelection' + this.editor.id, (function(_this) {
      return function(e) {
        if (_this._selectedWrapper) {
          e.preventDefault();
          switch (e.which) {
            case 13:
              return _this._skipToNextNewLine();
            case 40:
            case 39:
              return _this._skipToNextLine();
            case 38:
            case 37:
              return _this._skipToPrevLine();
            case 8:
              _this._delete();
              return e.preventDefault();
          }
        }
      };
    })(this));
  };

  UnSelectionBlock.fillDataToAttach = function(data, wrapper) {
    var $name, $preview, $size;
    wrapper.append(UnSelectionBlock._tpl.attach);
    wrapper.attr(UnSelectionBlock.attr.attach, true);
    if (data && data.file) {
      $preview = wrapper.find('.unselection-attach-preview');
      $name = wrapper.find('[data-name]');
      $size = wrapper.find('[data-size]');
      $name.attr('data-name', data.file.name);
      $name.attr('title', data.file.name);
      $size.attr('data-size', UnSelectionBlock.getFileSize(data.file.size));
      if (!data.previewFile) {
        return $preview.remove();
      }
    }
  };

  UnSelectionBlock.getFileSize = function(bytes) {
    var i, radix, sizes;
    sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
      return '0 B';
    }
    radix = Math.floor(Math.log(bytes) / Math.log(1024));
    i = parseInt(radix, 10);
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
  };

  UnSelectionBlock.getAttachHtml = function(data) {
    var wrapper;
    wrapper = UnSelectionBlock.getWrapper(data);
    UnSelectionBlock.fillDataToAttach(data, wrapper);
    return $(document.createElement('div')).append(wrapper).html();
  };

  UnSelectionBlock.getAttachUploaderHtml = function(data, wrapper) {
    wrapper = wrapper ? UnSelectionBlock.createWrapperByP(wrapper.empty()) : UnSelectionBlock.getWrapper(data);
    UnSelectionBlock.fillDataToAttach(data, wrapper);
    wrapper.find(UnSelectionBlock.selector.content).append(UnSelectionBlock._tpl.uploader);
    return wrapper;
  };

  UnSelectionBlock.getImgHtml = function(data) {
    var $img, wrapper;
    wrapper = UnSelectionBlock.getWrapper(data);
    wrapper.append(UnSelectionBlock._tpl.img);
    wrapper.attr(UnSelectionBlock.attr.img, true);
    if (data && data.file) {
      $img = wrapper.find('img');
      $img.attr('src', data.file.realPath);
      $img.attr('alt', data.file.name);
      $img.attr(UnSelectionBlock.attr.bucket, data.bucket);
      $img.attr(UnSelectionBlock.attr.key, data.file.filePath);
    }
    return $(document.createElement('div')).append(wrapper).html();
  };

  UnSelectionBlock.getGlobalLink = function(data, wrapper) {
    wrapper = wrapper ? UnSelectionBlock.createWrapperByP(wrapper.empty()) : UnSelectionBlock.getWrapper(data);
    UnSelectionBlock.fillDataToGlobalLink(data, wrapper);
    return wrapper;
  };

  UnSelectionBlock.getGlobalLinkHtml = function(data, wrapper) {
    wrapper = UnSelectionBlock.getGlobalLink(data, wrapper);
    return $(document.createElement('div')).append(wrapper).html();
  };

  UnSelectionBlock.fillDataToGlobalLink = function(data, wrapper) {
    var $name, $type;
    wrapper.append(UnSelectionBlock._tpl.globalLink);
    wrapper.attr(UnSelectionBlock.attr.globalLink, true);
    if (data && data.file) {
      wrapper.attr(UnSelectionBlock.attr.fileId, data.file.id);
      $name = wrapper.find('[data-name]');
      $type = wrapper.find('[data-global-link-type]');
      $name.attr('data-name', data.file.name);
      $name.attr('title', data.file.name);
      $type.attr(UnSelectionBlock.attr.globalLinkType, data.file.type);
      if (data.file.type === 'file') {
        return $type.addClass('simditor-r-icon-attachment');
      }
    }
  };

  UnSelectionBlock.getTaskBlock = function(data, wrapper) {
    wrapper = wrapper ? UnSelectionBlock.createWrapperByP(wrapper.empty()) : UnSelectionBlock.getWrapper(data);
    UnSelectionBlock.fillDataToTaskBlock(data, wrapper);
    return wrapper;
  };

  UnSelectionBlock.getTaskBlockHtml = function(data, wrapper) {
    wrapper = UnSelectionBlock.getTaskBlock(data, wrapper);
    return $(document.createElement('div')).append(wrapper).html();
  };

  UnSelectionBlock.fillDataToTaskBlock = function(data, wrapper) {
    var $subTitle, $title;
    wrapper.append(UnSelectionBlock._tpl.taskBlock);
    wrapper.attr(UnSelectionBlock.attr.taskBlock, true);
    wrapper.attr(UnSelectionBlock.attr.taskBlockSetting, JSON.stringify(data.setting));
    $title = wrapper.find("[" + UnSelectionBlock.attr.taskBlockTitle + "]");
    $subTitle = wrapper.find("[" + UnSelectionBlock.attr.taskBlockSubTitle + "]");
    $title.attr(UnSelectionBlock.attr.taskBlockTitle, data.info.title);
    return $subTitle.attr(UnSelectionBlock.attr.taskBlockSubTitle, data.info.subTitle);
  };

  UnSelectionBlock.getWrapper = function(data) {
    var wrapper;
    if (data == null) {
      data = {
        file: {}
      };
    }
    wrapper = $(UnSelectionBlock._tpl.wrapper);
    wrapper.attr(UnSelectionBlock.attr.unique, UnSelectionBlock._guidGenerator());
    if (data.file && data.file.id) {
      wrapper.attr(UnSelectionBlock.attr.fileId, data.file.id);
    }
    return wrapper;
  };

  UnSelectionBlock.createWrapperByP = function(p) {
    p = $(p);
    p.addClass(UnSelectionBlock.className.wrapper);
    p.attr(UnSelectionBlock.attr.unique, UnSelectionBlock._guidGenerator());
    return p;
  };

  UnSelectionBlock.createImgWrapperByP = function(p) {
    var $wrapper;
    $wrapper = UnSelectionBlock.createWrapperByP(p);
    $wrapper.attr(UnSelectionBlock.attr.img, true);
    return $wrapper;
  };

  UnSelectionBlock.createAttachWrapperByP = function(p) {
    var $wrapper;
    $wrapper = UnSelectionBlock.createWrapperByP(p);
    $wrapper.attr(UnSelectionBlock.attr.attach, true);
    return $wrapper;
  };

  UnSelectionBlock.getImgWrapperWithImg = function(img) {
    var $wrapper;
    $wrapper = UnSelectionBlock.getWrapper();
    $wrapper.attr(UnSelectionBlock.attr.img, true);
    $wrapper.append($(img));
    return $wrapper;
  };

  UnSelectionBlock.addFileIdForWrapper = function($wrapper, id) {
    return $wrapper.attr(UnSelectionBlock.attr.fileId, id);
  };

  UnSelectionBlock._guidGenerator = function() {
    var S4;
    S4 = (function(_this) {
      return function() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      };
    })(this);
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
  };

  UnSelectionBlock.prototype.resetTaskBlock = function(data) {
    var $wrapper, uniqueId;
    uniqueId = data.uniqueId;
    $wrapper = this.editor.body.find('[data-unique-id="' + uniqueId + '"]');
    if ($wrapper.length) {
      $wrapper.attr(UnSelectionBlock.attr.taskBlockSetting, JSON.stringify(data.setting));
      return $wrapper.find(UnSelectionBlock.selector.subTitle).attr(UnSelectionBlock.attr.taskBlockSubTitle, data.subTitle);
    }
  };

  UnSelectionBlock.prototype._skipToPrevLine = function() {
    var previousSibling, range, wrapper;
    wrapper = this._selectedWrapper[0];
    previousSibling = this.editor.util.getPrevNode(wrapper);
    if (previousSibling) {
      range = document.createRange();
      return this.editor.selection.setRangeAtEndOf(previousSibling, range);
    }
  };

  UnSelectionBlock.prototype._skipToNextLine = function() {
    var nextSibling, range, wrapper;
    wrapper = this._selectedWrapper[0];
    nextSibling = this.editor.util.getNextNode(wrapper);
    if (nextSibling) {
      range = document.createRange();
      return this.editor.selection.setRangeAtStartOf(nextSibling, range);
    }
  };

  UnSelectionBlock.prototype._skipToNextNewLine = function() {
    var p, range, wrapper;
    p = document.createElement('p');
    p.innerHTML = '<br>';
    wrapper = this.editor.util.getRootNodeFromNode(this._selectedWrapper);
    wrapper = $(wrapper);
    wrapper.after(p);
    range = document.createRange();
    return this.editor.selection.setRangeAtStartOf(p, range);
  };

  UnSelectionBlock.prototype._onSelectionChange = function() {
    var range, wrapper, wrapper1, wrapper2;
    range = this.editor.selection.range();
    if (range && range.endContainer) {
      wrapper1 = $(range.endContainer).closest('.' + UnSelectionBlock.className.wrapper, this.editor.body);
      wrapper2 = $(range.endContainer).find('.' + UnSelectionBlock.className.wrapper).last();
      if (wrapper1.length) {
        wrapper = wrapper1;
      } else if (wrapper2.length) {
        wrapper = wrapper2;
      }
      if (wrapper) {
        return setTimeout((function(_this) {
          return function() {
            return _this._selectWrapper(wrapper);
          };
        })(this), 150);
      } else {
        if (this._selectedWrapper) {
          return this._selectCurrent(false);
        }
      }
    }
  };

  UnSelectionBlock.prototype._selectCurrent = function(type) {
    if (type == null) {
      type = true;
    }
    if (this._selectedWrapper) {
      if (type) {
        return this._selectedWrapper.attr(UnSelectionBlock.attr.select, 'true');
      } else {
        this._selectedWrapper.removeAttr(UnSelectionBlock.attr.select);
        return this._selectedWrapper = null;
      }
    }
  };

  UnSelectionBlock.prototype._unGlobalLinkClick = function(e) {
    var id, type, wrapper;
    wrapper = $(e.target).closest("[" + UnSelectionBlock.attr.globalLink + "=true]", this.editor.body);
    if (wrapper.length) {
      id = wrapper.attr(UnSelectionBlock.attr.fileId);
      type = wrapper.find("[" + UnSelectionBlock.attr.globalLinkType + "]").attr(UnSelectionBlock.attr.globalLinkType);
      return this.editor.trigger('selectGlobalLink', {
        id: id,
        type: type
      });
    }
  };

  UnSelectionBlock.prototype._unAttachPreviewClick = function(e) {
    return this._unAttachClick(e, {
      preview: true
    });
  };

  UnSelectionBlock.prototype._unAttachDownloadClick = function(e) {
    return this._unAttachClick(e, {
      download: true
    });
  };

  UnSelectionBlock.prototype._unAttachClick = function(e, opt) {
    var id, wrapper;
    if (opt == null) {
      opt = {};
    }
    wrapper = $(e.target).closest("[" + UnSelectionBlock.attr.attach + "=true]", this.editor.body);
    if (wrapper.length) {
      id = wrapper.attr(UnSelectionBlock.attr.fileId);
      return this.editor.trigger('selectAttach', {
        id: id,
        preview: opt.preview,
        download: opt.download
      });
    }
  };

  UnSelectionBlock.prototype._unTaskBlockSettingClick = function(e) {
    var json, setting, subTitle, uniqueId, wrapper;
    wrapper = $(e.target).closest("[" + UnSelectionBlock.attr.taskBlock + "=true]", this.editor.body);
    if (wrapper.length) {
      setting = wrapper.attr(UnSelectionBlock.attr.taskBlockSetting);
      uniqueId = wrapper.attr(UnSelectionBlock.attr.unique);
      subTitle = wrapper.find(UnSelectionBlock.selector.subTitle).attr(UnSelectionBlock.attr.taskBlockSubTitle);
      try {
        json = JSON.parse(setting);
        return this.editor.trigger('taskBlockSetting', {
          setting: json,
          uniqueId: uniqueId,
          subTitle: subTitle
        });
      } catch (_error) {
        e = _error;
      }
    }
  };

  UnSelectionBlock.prototype._selectWrapper = function(wrapper) {
    var html, p;
    html = wrapper.html();
    if (html === '' || html === '<br>') {
      p = $('<p/>').append(this.editor.util.phBr);
      wrapper.replaceWith(p);
      return this.editor.selection.setRangeAtStartOf(p);
    } else {
      if (!this.editor.util.browser.msie) {
        this.editor.blur();
        this.editor.selection.clear();
      }
      this._selectCurrent(false);
      this._selectedWrapper = wrapper;
      return this._selectCurrent();
    }
  };

  UnSelectionBlock.prototype._patchFirefox = function() {
    if (this.editor.util.browser.firefox) {
      return this.editor.body.on('click.unSelection', "." + UnSelectionBlock.className.wrapper, (function(_this) {
        return function(e) {
          var wrapper;
          wrapper = $(e.target).closest("." + UnSelectionBlock.className.wrapper, _this.editor.body);
          if (wrapper.length) {
            return setTimeout(function() {
              return _this._selectWrapper(wrapper);
            }, 0);
          }
        };
      })(this));
    }
  };

  UnSelectionBlock.prototype._delete = function(wrapper) {
    var previousSibling, range;
    if (wrapper == null) {
      wrapper = this._selectedWrapper;
    }
    if (wrapper) {
      previousSibling = wrapper[0].previousSibling;
      wrapper.remove();
      if (previousSibling) {
        range = document.createRange();
        this.editor.selection.setRangeAtEndOf(previousSibling, range);
      }
      return this.editor.trigger('valuechanged');
    }
  };

  UnSelectionBlock.prototype._preview = function() {
    if (!$.fn.magnificPopup) {
      return;
    }
    return this.editor.body.magnificPopup({
      delegate: "img",
      type: 'image',
      preloader: true,
      removalDelay: 1000,
      mainClass: 'mfp-fade',
      tLoading: 'Loading...',
      autoFocusLast: false,
      zoom: {
        enabled: true,
        duration: 300,
        easing: 'ease-in-out',
        opener: (function(_this) {
          return function(openerElement) {
            return openerElement;
          };
        })(this)
      },
      callbacks: {
        beforeOpen: function() {},
        open: function() {},
        close: function() {},
        elementParse: function(item) {
          if (!item.src) {
            item.src = item.el.attr('src');
          }
          if (item.src && typeof item.src === 'string') {
            return item.src = item.src.replace('officeweb365.com/o', 'ow365.cn');
          }
        }
      },
      gallery: {
        enabled: true,
        preload: [0, 2],
        navigateByImgClick: false,
        tPrev: '上一个',
        tNext: '下一个'
      },
      image: {
        titleSrc: 'title',
        tError: '<a href="%url%">The image</a> could not be loaded.'
      },
      iframe: {},
      ajax: {
        tError: '<a href="%url%">The content</a> could not be loaded.'
      }
    });
  };

  return UnSelectionBlock;

})(SimpleModule);

WordNum = (function(superClass) {
  extend(WordNum, superClass);

  function WordNum() {
    return WordNum.__super__.constructor.apply(this, arguments);
  }

  WordNum.pluginName = 'WordNum';

  WordNum.chineseExp = /[\u4e00-\u9fa5]+/g;

  WordNum.englishExp = /([a-z|0-9]+)/ig;

  WordNum.blockNodes = ["div", "p", "ul", "ol", "li", "blockquote", "hr", "pre", "h1", "h2", "h3", "h4", "h5", "table"];

  WordNum.prototype._totalNum = 0;

  WordNum.prototype._selectNum = 0;

  WordNum.calculateWord = function(html) {
    var $div, c, chineseList, chineseNum, englishList, englishNum, len, text, w;
    chineseNum = 0;
    englishNum = 0;
    if (!html) {
      return 0;
    }
    $div = $(document.createElement('div'));
    $div.append(html);
    $div.find(WordNum.blockNodes.join(',')).after('<p>&nbsp;</p>');
    text = $div[0].innerText;
    chineseList = text.match(WordNum.chineseExp);
    if (chineseList && chineseList.length) {
      for (w = 0, len = chineseList.length; w < len; w++) {
        c = chineseList[w];
        chineseNum += c.length;
      }
    }
    englishList = text.match(WordNum.englishExp);
    if (englishList && englishList.length) {
      englishNum = englishList.length;
    }
    return chineseNum + englishNum;
  };

  WordNum.prototype._init = function() {
    this.editor = this._module;
    this.throttledCalculateWord = this.editor.util.throttle((function(_this) {
      return function() {
        return _this._calculateWord();
      };
    })(this), 2000);
    return this.editor.on('valuechanged', (function(_this) {
      return function(e, src) {
        return _this.throttledCalculateWord();
      };
    })(this));
  };

  WordNum.prototype._calculateWord = function() {
    var totalNum;
    totalNum = WordNum.calculateWord(this.editor.getValue());
    if (this._totalNum !== totalNum) {
      this._totalNum = totalNum;
      return this.editor.trigger('wordnumchange', totalNum);
    }
  };

  WordNum.prototype.getWordNum = function() {
    return this._totalNum;
  };

  return WordNum;

})(SimpleModule);

GlobalLink = (function(superClass) {
  extend(GlobalLink, superClass);

  function GlobalLink() {
    return GlobalLink.__super__.constructor.apply(this, arguments);
  }

  GlobalLink.pluginName = 'GlobalLink';

  GlobalLink.prototype._init = function() {
    return this.editor = this._module;
  };

  GlobalLink.prototype.insert = function(list) {
    if (!list.length) {
      return;
    }
    list.forEach((function(_this) {
      return function(item) {
        return _this.createGlobalLink(item);
      };
    })(this));
    return this.editor.trigger('valuechanged');
  };

  GlobalLink.prototype.createGlobalLink = function(data) {
    var $newLine, $wrapper, range, rootNode;
    if (!this.editor.inputManager.focused) {
      this.editor.focus();
    }
    range = this.editor.selection.range();
    range.deleteContents();
    this.editor.selection.range(range);
    $newLine = $('<p><br></p>');
    rootNode = this.editor.selection.rootNodes().last();
    $wrapper = null;
    if (data.type === 'file') {
      $wrapper = this.createAttach(data);
    } else {
      $wrapper = UnSelectionBlock.getGlobalLink({
        file: data
      });
    }
    if (rootNode.is('p') && this.editor.util.isEmptyNode(rootNode)) {
      $(rootNode).replaceWith($wrapper);
    } else {
      rootNode.after($wrapper);
    }
    $wrapper.after($newLine);
    return this.editor.selection.setRangeAtStartOf($newLine, range);
  };

  GlobalLink.prototype.createAttach = function(data) {
    var FileUtil, _data;
    _data = {
      file: data
    };
    _data.bucket = 'rishiqing-file';
    if (this.editor.opts.upload && this.editor.opts.upload.FileUtil) {
      FileUtil = this.editor.opts.upload.FileUtil;
      _data.previewFile = FileUtil.isPreviewFile(data.name);
      _data.framePreviewFile = FileUtil.isFramePreviewFile(data.name);
      _data.viewPath = _data.framePreviewFile ? FileUtil.getFramePreviewFileUrl(data.realPath, data.name) : data.realPath;
    }
    return $(UnSelectionBlock.getAttachHtml(_data));
  };

  return GlobalLink;

})(SimpleModule);

TaskBlock = (function(superClass) {
  extend(TaskBlock, superClass);

  function TaskBlock() {
    return TaskBlock.__super__.constructor.apply(this, arguments);
  }

  TaskBlock.pluginName = 'TaskBlock';

  TaskBlock.prototype._init = function() {
    return this.editor = this._module;
  };

  TaskBlock.prototype.insert = function(data) {
    this.createTaskBlock(data);
    return this.editor.trigger('valuechanged');
  };

  TaskBlock.prototype.createTaskBlock = function(data) {
    var $newLine, $wrapper, range, rootNode;
    if (!this.editor.inputManager.focused) {
      this.editor.focus();
    }
    range = this.editor.selection.range();
    range.deleteContents();
    this.editor.selection.range(range);
    $newLine = $('<p><br></p>');
    rootNode = this.editor.selection.rootNodes().last();
    $wrapper = null;
    $wrapper = UnSelectionBlock.getTaskBlock(data);
    if (rootNode.is('p') && this.editor.util.isEmptyNode(rootNode)) {
      $(rootNode).replaceWith($wrapper);
    } else {
      rootNode.after($wrapper);
    }
    $wrapper.after($newLine);
    return this.editor.selection.setRangeAtStartOf($newLine, range);
  };

  return TaskBlock;

})(SimpleModule);

Simditor = (function(superClass) {
  extend(Simditor, superClass);

  function Simditor() {
    return Simditor.__super__.constructor.apply(this, arguments);
  }

  Simditor.connect(Util);

  Simditor.connect(InputManager);

  Simditor.connect(Selection);

  Simditor.connect(UnSelectionBlock);

  Simditor.connect(GlobalLink);

  Simditor.connect(TaskBlock);

  Simditor.connect(UndoManager);

  Simditor.connect(Keystroke);

  Simditor.connect(Formatter);

  Simditor.connect(Toolbar);

  Simditor.connect(Indentation);

  Simditor.connect(Clipboard);

  Simditor.connect(WordNum);

  Simditor.count = 0;

  Simditor.prototype.opts = {
    textarea: null,
    placeholder: '',
    defaultImage: 'images/image.png',
    params: {},
    upload: false,
    indentWidth: 40
  };

  Simditor.prototype._init = function() {
    var e, editor, form, uploadOpts;
    this.textarea = $(this.opts.textarea);
    this.opts.placeholder = this.opts.placeholder || this.textarea.attr('placeholder');
    if (!this.textarea.length) {
      throw new Error('simditor: param textarea is required.');
      return;
    }
    editor = this.textarea.data('simditor');
    if (editor != null) {
      editor.destroy();
    }
    this.id = ++Simditor.count;
    this._render();
    if (simpleHotkeys) {
      this.hotkeys = simpleHotkeys({
        el: this.body
      });
    } else {
      throw new Error('simditor: simple-hotkeys is required.');
      return;
    }
    if (this.opts.upload && simpleUploader) {
      uploadOpts = typeof this.opts.upload === 'object' ? this.opts.upload : {};
      this.uploader = simpleUploader(uploadOpts);
    }
    form = this.textarea.closest('form');
    if (form.length) {
      form.on('submit.simditor-' + this.id, (function(_this) {
        return function() {
          return _this.sync();
        };
      })(this));
      form.on('reset.simditor-' + this.id, (function(_this) {
        return function() {
          return _this.setValue('');
        };
      })(this));
    }
    this.on('initialized', (function(_this) {
      return function() {
        if (_this.opts.placeholder) {
          _this.on('valuechanged', function() {
            return _this._placeholder();
          });
        }
        _this.setValue(_this.textarea.val().trim() || '');
        if (_this.textarea.attr('autofocus')) {
          return _this.focus();
        }
      };
    })(this));
    if (this.util.browser.mozilla) {
      this.util.reflow();
      try {
        document.execCommand('enableObjectResizing', false, false);
        return document.execCommand('enableInlineTableEditing', false, false);
      } catch (_error) {
        e = _error;
      }
    }
  };

  Simditor.prototype._tpl = "<div class=\"simditor\">\n  <div class=\"simditor-wrapper\">\n    <div class=\"simditor-placeholder\"></div>\n    <div class=\"simditor-body\" contenteditable=\"true\">\n    </div>\n  </div>\n</div>";

  Simditor.prototype._render = function() {
    var key, ref, results, val;
    this.el = $(this._tpl).insertBefore(this.textarea);
    this.wrapper = this.el.find('.simditor-wrapper');
    this.body = this.wrapper.find('.simditor-body');
    this.placeholderEl = this.wrapper.find('.simditor-placeholder').append(this.opts.placeholder);
    this.el.data('simditor', this);
    this.wrapper.append(this.textarea);
    this.textarea.data('simditor', this).blur();
    this.body.attr('tabindex', this.textarea.attr('tabindex'));
    if (this.util.os.mac) {
      this.el.addClass('simditor-mac');
    } else if (this.util.os.linux) {
      this.el.addClass('simditor-linux');
    }
    if (this.util.os.mobile) {
      this.el.addClass('simditor-mobile');
    }
    if (this.opts.params) {
      ref = this.opts.params;
      results = [];
      for (key in ref) {
        val = ref[key];
        results.push($('<input/>', {
          type: 'hidden',
          name: key,
          value: val
        }).insertAfter(this.textarea));
      }
      return results;
    }
  };

  Simditor.prototype._placeholder = function() {
    var children;
    children = this.body.children();
    if (children.length === 0 || (children.length === 1 && this.util.isEmptyNode(children) && parseInt(children.css('margin-left') || 0) < this.opts.indentWidth)) {
      return this.placeholderEl.show();
    } else {
      return this.placeholderEl.hide();
    }
  };

  Simditor.prototype.setValue = function(val) {
    this.hidePopover();
    this.textarea.val(val);
    this.body.get(0).innerHTML = val;
    this.formatter.format();
    this.formatter.decorate();
    this.util.reflow(this.body);
    this.inputManager.lastCaretPosition = null;
    return this.trigger('valuechanged');
  };

  Simditor.prototype.getValue = function() {
    return this.sync();
  };

  Simditor.prototype.sync = function() {
    var children, cloneBody, emptyP, firstP, lastP, val;
    cloneBody = this.body.clone();
    this.formatter.undecorate(cloneBody);
    this.formatter.format(cloneBody);
    this.formatter.autolink(cloneBody);
    children = cloneBody.children();
    lastP = children.last('p');
    firstP = children.first('p');
    while (lastP.is('p') && this.util.isEmptyNode(lastP)) {
      emptyP = lastP;
      lastP = lastP.prev('p');
      emptyP.remove();
    }
    while (firstP.is('p') && this.util.isEmptyNode(firstP)) {
      emptyP = firstP;
      firstP = lastP.next('p');
      emptyP.remove();
    }
    cloneBody.find('img.uploading').remove();
    val = $.trim(cloneBody.html());
    this.textarea.val(val);
    return val;
  };

  Simditor.prototype.getWordNum = function() {
    return this.wordNum.getWordNum();
  };

  Simditor.prototype.focus = function() {
    var $blockEl, range;
    if (!(this.body.is(':visible') && this.body.is('[contenteditable]'))) {
      this.el.find('textarea:visible').focus();
      return;
    }
    if (this.inputManager.lastCaretPosition) {
      this.undoManager.caretPosition(this.inputManager.lastCaretPosition);
      return this.inputManager.lastCaretPosition = null;
    } else {
      $blockEl = this.body.children().last();
      if (!$blockEl.is('p')) {
        $blockEl = $('<p/>').append(this.util.phBr).appendTo(this.body);
      }
      range = document.createRange();
      return this.selection.setRangeAtEndOf($blockEl, range);
    }
  };

  Simditor.prototype.blur = function() {
    if (this.body.is(':visible') && this.body.is('[contenteditable]')) {
      return this.body.blur();
    } else {
      return this.body.find('textarea:visible').blur();
    }
  };

  Simditor.prototype.hidePopover = function() {
    return this.el.find('.simditor-popover').each(function(i, popover) {
      popover = $(popover).data('popover');
      if (popover && popover.active) {
        return popover.hide();
      }
    });
  };

  Simditor.prototype.destroy = function() {
    this.triggerHandler('destroy');
    this.textarea.closest('form').off('.simditor .simditor-' + this.id);
    this.selection.clear();
    this.inputManager.focused = false;
    this.textarea.insertBefore(this.el).hide().val('').removeData('simditor');
    this.el.remove();
    $(document).off('.simditor-' + this.id);
    $(window).off('.simditor-' + this.id);
    $(document).off('.simditor-unSelection');
    return this.off();
  };

  return Simditor;

})(SimpleModule);

Simditor.i18n = {
  'zh-CN': {
    'blockquote': '引用',
    'bold': '加粗文字',
    'code': '插入代码',
    'color': '文字颜色',
    'coloredText': '彩色文字',
    'hr': '分隔线',
    'image': '插入图片',
    'externalImage': '外链图片',
    'uploadImage': '上传图片',
    'uploadFailed': '上传失败了',
    'uploadError': '上传出错了',
    'imageUrl': '图片地址',
    'imageSize': '图片尺寸',
    'imageAlt': '图片描述',
    'restoreImageSize': '还原图片尺寸',
    'uploading': '正在上传',
    'indent': '向右缩进',
    'outdent': '向左缩进',
    'italic': '斜体文字',
    'link': '插入链接',
    'linkText': '链接文字',
    'linkUrl': '链接地址',
    'linkTarget': '打开方式',
    'openLinkInCurrentWindow': '在当前窗口中打开',
    'openLinkInNewWindow': '在新窗口中打开',
    'removeLink': '移除链接',
    'ol': '有序列表',
    'ul': '无序列表',
    'strikethrough': '删除线文字',
    'table': '表格',
    'deleteRow': '删除行',
    'insertRowAbove': '在上面插入行',
    'insertRowBelow': '在下面插入行',
    'deleteColumn': '删除列',
    'insertColumnLeft': '在左边插入列',
    'insertColumnRight': '在右边插入列',
    'deleteTable': '删除表格',
    'title': '标题',
    'normalText': '普通文本',
    'underline': '下划线文字',
    'alignment': '水平对齐',
    'alignCenter': '居中',
    'alignLeft': '居左',
    'alignRight': '居右',
    'selectLanguage': '选择程序语言',
    'fontScale': '字体大小',
    'fontScaleXLarge': '超大字体',
    'fontScaleLarge': '大号字体',
    'fontScaleNormal': '正常大小',
    'fontScaleSmall': '小号字体',
    'fontScaleXSmall': '超小字体',
    'undo': '撤销',
    'redo': '重做',
    'formatPaint': '格式刷'
  },
  'en-US': {
    'blockquote': 'Block Quote',
    'bold': 'Bold',
    'code': 'Code',
    'color': 'Text Color',
    'coloredText': 'Colored Text',
    'hr': 'Horizontal Line',
    'image': 'Insert Image',
    'externalImage': 'External Image',
    'uploadImage': 'Upload Image',
    'uploadFailed': 'Upload failed',
    'uploadError': 'Error occurs during upload',
    'imageUrl': 'Url',
    'imageSize': 'Size',
    'imageAlt': 'Alt',
    'restoreImageSize': 'Restore Origin Size',
    'uploading': 'Uploading',
    'indent': 'Indent',
    'outdent': 'Outdent',
    'italic': 'Italic',
    'link': 'Insert Link',
    'linkText': 'Text',
    'linkUrl': 'Url',
    'linkTarget': 'Target',
    'openLinkInCurrentWindow': 'Open link in current window',
    'openLinkInNewWindow': 'Open link in new window',
    'removeLink': 'Remove Link',
    'ol': 'Ordered List',
    'ul': 'Unordered List',
    'strikethrough': 'Strikethrough',
    'table': 'Table',
    'deleteRow': 'Delete Row',
    'insertRowAbove': 'Insert Row Above',
    'insertRowBelow': 'Insert Row Below',
    'deleteColumn': 'Delete Column',
    'insertColumnLeft': 'Insert Column Left',
    'insertColumnRight': 'Insert Column Right',
    'deleteTable': 'Delete Table',
    'title': 'Title',
    'normalText': 'Text',
    'underline': 'Underline',
    'alignment': 'Alignment',
    'alignCenter': 'Align Center',
    'alignLeft': 'Align Left',
    'alignRight': 'Align Right',
    'selectLanguage': 'Select Language',
    'fontScale': 'Font Size',
    'fontScaleXLarge': 'X Large Size',
    'fontScaleLarge': 'Large Size',
    'fontScaleNormal': 'Normal Size',
    'fontScaleSmall': 'Small Size',
    'fontScaleXSmall': 'X Small Size',
    'undo': 'Undo',
    'redo': 'Redo',
    'formatPaint': 'Format Paint'
  }
};

DomRange = (function(superClass) {
  extend(DomRange, superClass);

  DomRange.START_TO_START = 0;

  DomRange.START_TO_END = 1;

  DomRange.END_TO_END = 2;

  DomRange.END_TO_START = 3;

  DomRange.m = /^<[^>]+>$/;

  DomRange.j = /^<[\s\S]+>$/;

  DomRange.l = /^<[^<]+>$/;

  DomRange.c = function(text) {
    return text.indexOf("<") < text.indexOf(">");
  };

  DomRange.d = function(text) {
    return DomRange.j.test(text) && (DomRange.test(text) || !DomRange.test(text));
  };

  DomRange.toDomRange = function(editor, range) {
    if (!range || range instanceof DomRange) {
      return range;
    } else {
      return new DomRange(editor, range);
    }
  };

  DomRange.prototype.options = {
    preventCalculateEdges: false
  };

  function DomRange(editor, range, options) {
    this.util = Simditor.CommandUtil;
    this.options = $.extend(this.options, options || {});
    this.range = range;
    this.editor = editor;
    this._initialCalculateEdges();
  }

  DomRange.prototype.setEnd = function(node, offset) {
    this.endContainer = node;
    this.endOffset = offset;
    return this._calculateRangeProperties();
  };

  DomRange.prototype.setStart = function(node, offset) {
    this.startContainer = node;
    this.startOffset = offset;
    return this._calculateRangeProperties();
  };

  DomRange.prototype.setStartBefore = function(node) {
    return this.setStart(node.parentNode, this.util.findNodeIndex(node));
  };

  DomRange.prototype.setStartAfter = function(node) {
    return this.setStart(node.parentNode, this.util.findNodeIndex(node) + 1);
  };

  DomRange.prototype.setEndBefore = function(node) {
    return this.setEnd(node.parentNode, this.util.findNodeIndex(node));
  };

  DomRange.prototype.setEndAfter = function(node) {
    return this.setEnd(node.parentNode, this.util.findNodeIndex(node) + 1);
  };

  DomRange.prototype.toString = function() {
    var range;
    range = this._updateBrowserRange();
    if (range.text !== void 0) {
      return range.text;
    } else {
      if (range.toString) {
        return range.toString();
      } else {
        return "";
      }
    }
  };

  DomRange.prototype.compareBoundaryPoints = function(num, domRange) {
    var range;
    range = this._updateBrowserRange();
    if (range.compareBoundaryPoints) {
      return range.compareBoundaryPoints(num, domRange.getBrowserRange());
    } else {
      if (range.compareEndPoints) {
        return range.compareEndPoints(this._pointPairToCompare(num), domRange.getBrowserRange());
      } else {
        return 0;
      }
    }
  };

  DomRange.prototype.getBrowserRange = function() {
    return this._updateBrowserRange();
  };

  DomRange.prototype.select = function() {
    var e, range, selection;
    range = this._updateBrowserRange();
    if (range.select) {
      try {
        return range.select();
      } catch (_error) {
        e = _error;
      }
    } else {
      selection = this.clear();
      if (selection) {
        return selection.range(range);
      }
    }
  };

  DomRange.prototype.clear = function() {
    this.editor.selection.clear();
    return this.editor.selection;
  };

  DomRange.prototype.selectNodeContents = function(node) {
    var tmp;
    if (this.range.length) {
      return this.range.addElement(node);
    } else {
      if (node.nodeType === 1) {
        tmp = "childNodes";
      } else {
        tmp = "nodeValue";
      }
      this.setEnd(node, node[tmp].length);
      return this.setStart(node, 0);
    }
  };

  DomRange.prototype.cloneRange = function() {
    var cloneRange, domRange, range;
    range = this._updateBrowserRange();
    if (this.editor.util.browser.msie && range.length) {
      cloneRange = this.cloneControlRange(range);
      if (cloneRange) {
        return new DomRange(this.editor, cloneRange, this.options);
      }
    }
    cloneRange = this._cloneBrowserRange();
    if (cloneRange) {
      domRange = new DomRange(this.editor, cloneRange, this.options);
      domRange.setStart(this.startContainer, this.startOffset);
      domRange.setEnd(this.endContainer, this.endOffset);
    }
    return domRange;
  };

  DomRange.prototype.cloneControlRange = function(range) {
    var body, item, length, ref, t, w;
    length = range.length;
    if (length) {
      item = range.item(0);
      body = item.ownerDocument.body;
      range = body.createControlRange();
      for (t = w = 0, ref = length - 1; 0 <= ref ? w <= ref : w >= ref; t = 0 <= ref ? ++w : --w) {
        range.addElement(this.range.item(t));
      }
      return range;
    }
  };

  DomRange.prototype.isCollapsed = function() {
    return this.collapsed;
  };

  DomRange.prototype._cloneBrowserRange = function() {
    if (this.range.cloneRange) {
      return this.range.cloneRange();
    } else {
      if (this.range.duplicate) {
        return this.range.duplicate();
      } else {
        if (this.editor.util.browser.msie && this.range.length) {
          return this.cloneControlRange(this.range);
        }
      }
    }
  };

  DomRange.prototype._isControlRange = function() {
    return this.range.length;
  };

  DomRange.prototype._updateBrowserRange = function() {
    if (this._isControlRange() || this.util.isTag(this.startContainer, "textarea")) {
      return this.range;
    }
    this._updateBrowserRangeStart();
    this._updateBrowserRangeEnd();
    this._updateBrowserRangeStart();
    return this.range;
  };

  DomRange.prototype._updateBrowserRangeStart = function() {
    var container, offset;
    container = this.startContainer;
    offset = this.startOffset;
    if (this.range.setStart) {
      return this.range.setStart(container, offset);
    }
  };

  DomRange.prototype._updateBrowserRangeEnd = function() {
    var container, offset;
    container = this.endContainer;
    offset = this.endOffset;
    if (this.range.setEnd) {
      return this.range.setEnd(container, offset);
    }
  };

  DomRange.prototype._initialCalculateEdges = function(r) {
    if (this.options.preventCalculateEdges) {
      return;
    }
    this._calculateEdge(true, r);
    this._calculateEdge(false, r);
    this._fixIE_plainTextStartOffset();
    return this._calculateRangeProperties();
  };

  DomRange.prototype._calculateEdge = function(isStart, J) {
    var container, containerKey, isCollapsed, offset, offsetKey, range;
    range = this.range;
    isCollapsed = this._isBrowserRangeCollapsed();
    if (isStart) {
      containerKey = "startContainer";
      offsetKey = "startOffset";
    } else {
      containerKey = "endContainer";
      offsetKey = "endOffset";
    }
    container = range[containerKey];
    offset = range[offsetKey] || 0;
    this[containerKey] = container;
    return this[offsetKey] = offset;
  };

  DomRange.prototype._fixIE_plainTextStartOffset = function() {
    var text;
    text = this.range.htmlText;
    if (text === void 0 || DomRange.c(text)) {
      return;
    }
    if (this.startContainer === this.endContainer && (this.endOffset - this.startOffset) > text.length) {
      return this.startOffset = this.endOffset - text.length;
    }
  };

  DomRange.prototype._calculateRangeProperties = function() {
    this.commonAncestorContainer = this.util.findCommonAncestor(this.startContainer, this.endContainer);
    return this.collapsed = this.startContainer === this.endContainer && this.startOffset === this.endOffset;
  };

  DomRange.prototype._isBrowserRangeCollapsed = function() {
    var e, range;
    range = this.range;
    try {
      if (range.isCollapsed) {
        return range.isCollapsed();
      } else {
        if (range.collapsed !== void 0) {
          return range.collapsed;
        } else {
          if (range.length !== void 0) {
            return range.length === 0;
          } else {
            if (range.text !== void 0) {
              return range.text === "" && !DomRange.d(range.htmlText);
            } else {
              return this.toString() === "";
            }
          }
        }
      }
    } catch (_error) {
      e = _error;
      return true;
    }
  };

  DomRange.prototype._createTempNode = function() {
    var tmp;
    tmp = document.createElement("span");
    tmp.innerHTML = "&#x200b;";
    return tmp;
  };

  DomRange.prototype._traverseToEdgeNode = function(t, v, s, x, u) {};

  DomRange.prototype._setStartRangeAtNodeOffset = function(node, offset, isEnd) {};

  DomRange.prototype._pointPairToCompare = function(num) {
    switch (num) {
      case DomRange.START_TO_START:
        return "StartToStart";
      case DomRange.START_TO_END:
        return "EndToStart";
      case DomRange.END_TO_END:
        return "EndToEnd";
      case DomRange.END_TO_START:
        return "StartToEnd";
      default:
        return "";
    }
  };

  return DomRange;

})(SimpleModule);

Simditor.DomRange = DomRange;

DomRangeMemento = (function(superClass) {
  extend(DomRangeMemento, superClass);

  function DomRangeMemento(editor, range) {
    var domRange;
    domRange = Simditor.DomRange.toDomRange(editor, range);
    this.collapsed = domRange.isCollapsed();
    if (!editor.util.isTextNode(domRange.startContainer) && domRange.startContainer.childNodes[domRange.startOffset] && !editor.util.isTextNode(domRange.startContainer.childNodes[domRange.startOffset])) {
      this.startContainer = domRange.startContainer.childNodes[domRange.startOffset];
      this.startOffset = false;
    } else {
      this.startContainer = domRange.startContainer;
      this.startOffset = domRange.startOffset;
    }
    if (!editor.util.isTextNode(domRange.endContainer) && domRange.endContainer.childNodes[domRange.endOffset] && !editor.util.isTextNode(domRange.endContainer.childNodes[domRange.endOffset])) {
      this.endContainer = domRange.endContainer.childNodes[domRange.endOffset];
      this.endOffset = false;
    } else {
      if (!editor.util.isTextNode(domRange.endContainer) && !editor.util.isTag(domRange.endContainer, "img") && domRange.endContainer.childNodes > 0 && !domRange.endContainer.childNodes[domRange.endOffset]) {
        this.endContainer = domRange.endContainer;
        this.endOffset = "outside";
      } else {
        this.endContainer = domRange.endContainer;
        this.endOffset = domRange.endOffset;
      }
    }
  }

  DomRangeMemento.prototype.restoreToRange = function(domRange) {
    this.restoreStart(domRange);
    if (this.endOffset === false) {
      domRange.setEndBefore(this.endContainer);
    } else {
      if (this.endOffset === "outside") {
        domRange.setEnd(this.endContainer, Math.max(1, this.endContainer.childNodes.length - 1));
      } else {
        domRange.setEnd(this.endContainer, this.endOffset);
      }
    }
    this.restoreStart(domRange);
    if (this.collapsed) {
      domRange.collapse();
    }
    return domRange.select();
  };

  DomRangeMemento.prototype.restoreStart = function(domRange) {
    if (this.startOffset === false) {
      return domRange.setStartBefore(this.startContainer);
    } else {
      return domRange.setStart(this.startContainer, this.startOffset);
    }
  };

  return DomRangeMemento;

})(SimpleModule);

Simditor.DomRangeMemento = DomRangeMemento;

NodeComparer = {
  equalNodes: function(h, i) {
    return this.equalTag(h, i) && this.equalStyle(h, i) && this.equalAttributes(h, i);
  },
  equalTag: function(h, i) {
    return Simditor.CommandUtil.isTag(h, i.tagName);
  },
  equalStyle: function(h, i) {
    return h.style && i.style && h.style.cssText === i.style.cssText;
  },
  equalAttributes: function(h, j, m) {
    var i, k, key, value;
    i = this._collectAttributes(h, m);
    k = this._collectAttributes(j, m);
    if (i.length !== k.length) {
      return false;
    }
    delete i.length;
    delete i.style;
    delete i.timestamp;
    delete i.title;
    for (key in i) {
      if (!hasProp.call(i, key)) continue;
      value = i[key];
      if (i[key] !== k[key]) {
        return false;
      }
    }
    return true;
  },
  _collectAttributes: function(h, i) {
    if (i && i.length > 0) {
      return Simditor.CommandUtil.getAttributes(h, i);
    } else {
      return Simditor.CommandUtil.getDefinedAttributes(h);
    }
  }
};

Simditor.NodeComparer = NodeComparer;

CommandUtil = {
  emptyNodeRegExp: '/^&nbsp;?$/',
  blockNodes: ["div", "p", "ul", "ol", "li", "blockquote", "hr", "pre", "h1", "h2", "h3", "h4", "h5", "table"],
  isBlockNode: function(node) {
    node = $(node)[0];
    if (!node || node.nodeType === 3) {
      return false;
    }
    return new RegExp("^(" + (this.blockNodes.join('|')) + ")$").test(node.nodeName.toLowerCase());
  },
  isTextNode: function(node) {
    node = $(node)[0];
    return node && node.nodeType && (node.nodeType === 3 || node.nodeType === 4 || node.nodeType === 8);
  },
  canHaveChildren: function(node) {
    node = $(node)[0];
    if (!node || this.isTextNode(node)) {
      return false;
    }
    switch ((node.tagName || node.nodeName).toUpperCase()) {
      case "AREA":
      case "BASE":
      case "BASEFONT":
      case "COL":
      case "FRAME":
      case "HR":
      case "IMG":
      case "BR":
      case "INPUT":
      case "ISINDEX":
      case "LINK":
      case "META":
      case "PARAM":
        return false;
      default:
        return true;
    }
  },
  isTag: function(node, tagName) {
    node = $(node)[0];
    return !!(node && node.tagName && tagName) && node.tagName.toLowerCase() === tagName.toLowerCase();
  },
  isList: function(node) {
    return this.isTag(node, "ul") || this.isTag(node, "ol");
  },
  isPreContent: function(node) {
    var isUnderPre;
    isUnderPre = $(node).closest('pre');
    if (isUnderPre && isUnderPre.length) {
      return true;
    }
    return false;
  },
  isMentionContent: function(node) {
    var isUnderMention;
    isUnderMention = $(node).closest('a.rui-mention');
    if (isUnderMention && isUnderMention.length) {
      return true;
    }
    return false;
  },
  isHeading: function(node) {
    return node && /^H[1-6]$/i.test(node.nodeName);
  },
  isTableCell: function(node) {
    return this.isTag(node, "td") || this.isTag(node, "th");
  },
  isTableContent: function(node) {
    var isUnderTable;
    isUnderTable = $(node).closest('table, .simditor-table');
    if (isUnderTable && isUnderTable.length) {
      return true;
    }
    return false;
  },
  isBlockComponent: function(node) {
    return this.isTag(node, "li") || this.isTableCell(node);
  },
  isAncestorOf: function(m, l) {
    var error, tempL;
    try {
      if (this.isTextNode(l)) {
        tempL = l.parentNode;
      } else {
        tempL = l;
      }
      return !this.isTextNode(m) && (l.parentNode === m || $.contains(m, tempL));
    } catch (_error) {
      error = _error;
      return false;
    }
  },
  isAncestorOrSelf: function(l, k) {
    return this.isAncestorOf(l, k) || (l === k);
  },
  findAncestorUntil: function(l, k) {
    if (this.isAncestorOf(l, k)) {
      while (k && k.parentNode !== l) {
        k = k.parentNode;
      }
    }
    return k;
  },
  traversePreviousNode: function(l) {
    var k, m;
    k = l;
    while (k && !(m = k.previousSibling)) {
      k = k.parentNode;
    }
    return m;
  },
  findNodeIndex: function(node) {
    var index;
    node = $(node)[0];
    index = 0;
    while (node.previousSibling) {
      node = node.previousSibling;
      index++;
    }
    return index;
  },
  findCommonAncestor: function(k, l) {
    while (k && k !== l && !this.isAncestorOf(k, l)) {
      k = k.parentNode;
    }
    return k;
  },
  getAllChildNodesBy: function(m, l) {
    var k;
    k = [];
    this._getChildNodes(m, k, l);
    return k;
  },
  _getChildNodes: function(o, l, m, p) {
    var firstChild, n, results;
    firstChild = o.firstChild;
    results = [];
    while (firstChild) {
      n = m(firstChild);
      if (!(p && n) && firstChild.nodeType === 1 && this.canHaveChildren(firstChild)) {
        this._getChildNodes(firstChild, l, m, p);
      }
      if (n) {
        l.push(firstChild);
      }
      results.push(firstChild = firstChild.nextSibling);
    }
    return results;
  },
  removeNode: function(node) {
    var parentNode;
    parentNode = node.parentNode;
    if (parentNode !== null) {
      while (node.firstChild) {
        parentNode.insertBefore(node.firstChild, node);
      }
      parentNode.removeChild(node);
      return parentNode;
    }
    return true;
  },
  removeChildren: function(node) {
    var results;
    results = [];
    while (node.firstChild) {
      results.push(node.removeChild(node.firstChild));
    }
    return results;
  },
  cloneNodeClean: function(node) {
    var cloneNode;
    cloneNode = node.cloneNode(false);
    this.removeChildren(cloneNode);
    return cloneNode;
  },
  isTextNodeEmpty: function(node) {
    return !/[^\s\xA0\u200b]+/.test(node.nodeValue);
  },
  isTextNodeCompletelyEmpty: function(node) {
    return !/[^\n\r\t\u200b]+/.test(node.nodeValue);
  },
  isNodeEmpty: function(node) {
    return this.isNodeCompletelyEmpty(node) || this.emptyNodeRegExp.test(node.innerHTML);
  },
  isNodeCompletelyEmpty: function(node) {
    return !node.innerHTML || node.childNodes.length === 0;
  },
  isEmptyDom: function(node) {
    if (this.isTextNode(node)) {
      return this.isTextNodeEmpty(node);
    } else {
      return this.isNodeEmpty(node);
    }
  },
  isCompletelyEmptyDom: function(node) {
    if (this.isTextNode(node)) {
      return this.isTextNodeCompletelyEmpty(node);
    } else {
      return this.isNodeCompletelyEmpty(node);
    }
  },
  isNodeEmptyRecursive: function(m, k) {
    var firstChild;
    if (m.nodeType === 1 && !this.canHaveChildren(m)) {
      return false;
    } else {
      if (m.childNodes.length === 0) {
        if (k) {
          return this.isCompletelyEmptyDom(m);
        } else {
          return this.isEmptyDom(m);
        }
      } else {
        if (this.isList(m) && m.children.length === 0) {
          return true;
        }
      }
    }
    firstChild = m.firstChild;
    while (firstChild && this.isNodeEmptyRecursive(firstChild, k)) {
      firstChild = firstChild.nextSibling;
    }
    return !firstChild;
  },
  getDefinedAttributes: function(n) {
    var attr, k, l, len, ref, w;
    l = {
      length: 0
    };
    ref = n.attributes;
    for (w = 0, len = ref.length; w < len; w++) {
      attr = ref[w];
      k = attr;
      if (k.specified && k.nodeName !== "style" && !/^sizzle-/.test(k.nodeName)) {
        l[k.nodeName] = k.nodeValue;
        l.length++;
      }
    }
    return l;
  },
  getAttributes: function(o, n) {
    var k, l, m, ref, w;
    k = {
      length: 1
    };
    for (l = w = 0, ref = n.length - 1; 0 <= ref ? w < ref : w > ref; l = 0 <= ref ? ++w : --w) {
      m = n[l];
      k[m] = o.getAttribute(m);
      k.length++;
    }
    return k;
  },
  every: function(nodes, fn) {
    var len, node, w;
    for (w = 0, len = nodes.length; w < len; w++) {
      node = nodes[w];
      if (!fn(node)) {
        return false;
      }
    }
    return true;
  },
  some: function(nodes, fn) {
    var len, node, w;
    for (w = 0, len = nodes.length; w < len; w++) {
      node = nodes[w];
      if (fn(node)) {
        return true;
      }
    }
    return false;
  },
  getComputedStyle: function(node, style) {
    var computedStyle;
    computedStyle = window.getComputedStyle(node, null);
    return computedStyle.getPropertyValue(style);
  },
  normalize: function(node) {
    if (!node.normalize) {
      return this._normalizeTextNodes(node);
    } else {
      return node.normalize();
    }
  },
  _normalizeTextNodes: function(node) {
    var firstChild, nextSibling, results;
    firstChild = node.firstChild;
    nextSibling = null;
    results = [];
    while (firstChild) {
      if (firstChild.nodeType === 3) {
        nextSibling = firstChild.nextSibling;
        while (nextSibling && nextSibling.nodeType === 3) {
          firstChild.appendData(nextSibling.data);
          node.removeChild(nextSibling);
          nextSibling = firstChild.nextSibling;
        }
      } else {
        this._normalizeTextNodes(firstChild);
      }
      results.push(firstChild = firstChild.nextSibling);
    }
    return results;
  },
  _isContentAreaLastBr: function(node) {
    return this.isTag(node, "br") && !node.nextSibling && Simditor.util.isEditorContentArea(node.parentNode);
  },
  isWhitespaceBetweenTableCells: function(node) {
    return this.isTextNode(node) && this.isTextNodeEmpty(node) && $(node.parentNode).is("tr,tbody,thead,tfoot,table");
  },
  hasAttributes: function(node) {
    var a, b, c, l;
    l = this.getOuterHtml(node).replace(node.innerHTML, "");
    a = /=["][^"]/.test(l);
    b = /=['][^']/.test(l);
    c = /=[^'"]/.test(l);
    return a || b || c;
  },
  getOuterHtml: function(node) {
    var b, c;
    if (node.outerHTML) {
      return node.outerHTML;
    } else {
      b = node.cloneNode(true);
      c = document.createElement("div");
      c.appendChild(b);
      return c.innerHTML;
    }
  }
};

Simditor.CommandUtil = CommandUtil;

Button = (function(superClass) {
  extend(Button, superClass);

  Button.prototype._tpl = {
    item: '<li><a tabindex="-1" unselectable="on" class="toolbar-item" href="javascript:;"><span></span></a></li>',
    menuWrapper: '<div class="toolbar-menu"></div>',
    menuItem: '<li><a tabindex="-1" unselectable="on" class="menu-item" href="javascript:;"><span></span></a></li>',
    separator: '<li><span class="separator"></span></li>'
  };

  Button.prototype.name = '';

  Button.prototype.icon = '';

  Button.prototype.title = '';

  Button.prototype.text = '';

  Button.prototype.htmlTag = '';

  Button.prototype.disableTag = '';

  Button.prototype.menu = false;

  Button.prototype.active = false;

  Button.prototype.disabled = false;

  Button.prototype.needFocus = true;

  Button.prototype.shortcut = null;

  function Button(opts) {
    this.editor = opts.editor;
    this.title = this._t(this.name);
    Button.__super__.constructor.call(this, opts);
  }

  Button.prototype._init = function() {
    var len, ref, tag, w;
    this.render();
    this.el.on('mousedown', (function(_this) {
      return function(e) {
        var exceed, noFocus, param;
        e.preventDefault();
        noFocus = _this.needFocus && !_this.editor.inputManager.focused;
        if (_this.el.hasClass('disabled') || noFocus) {
          return false;
        }
        if (_this.menu) {
          _this.wrapper.toggleClass('menu-on').siblings('li').removeClass('menu-on');
          if (_this.wrapper.is('.menu-on')) {
            exceed = _this.menuWrapper.offset().left + _this.menuWrapper.outerWidth() + 5 - _this.editor.wrapper.offset().left - _this.editor.wrapper.outerWidth();
            if (exceed > 0) {
              _this.menuWrapper.css({
                'left': 'auto',
                'right': 0
              });
              _this.menuWrapper.addClass('toolbar-menu-align-right');
            }
            _this.trigger('menuexpand');
          }
          return false;
        }
        param = _this.el.data('param');
        _this.command(param);
        return false;
      };
    })(this));
    this.wrapper.on('click', 'a.menu-item', (function(_this) {
      return function(e) {
        var btn, noFocus, param;
        e.preventDefault();
        btn = $(e.currentTarget);
        _this.wrapper.removeClass('menu-on');
        noFocus = _this.needFocus && !_this.editor.inputManager.focused;
        if (btn.hasClass('disabled') || noFocus) {
          return false;
        }
        _this.editor.toolbar.wrapper.removeClass('menu-on');
        param = btn.data('param');
        _this.command(param);
        return false;
      };
    })(this));
    this.wrapper.on('mousedown', 'a.menu-item', function(e) {
      return false;
    });
    this.editor.on('blur', (function(_this) {
      return function() {
        var editorActive;
        editorActive = _this.editor.body.is(':visible') && _this.editor.body.is('[contenteditable]');
        if (!(editorActive && !_this.editor.clipboard.pasting)) {
          return;
        }
        _this.setActive(false);
        return _this.setDisabled(false);
      };
    })(this));
    if (this.shortcut != null) {
      this.editor.hotkeys.add(this.shortcut, (function(_this) {
        return function(e) {
          _this.el.mousedown();
          return false;
        };
      })(this));
    }
    ref = this.htmlTag.split(',');
    for (w = 0, len = ref.length; w < len; w++) {
      tag = ref[w];
      tag = $.trim(tag);
      if (tag && $.inArray(tag, this.editor.formatter._allowedTags) < 0) {
        this.editor.formatter._allowedTags.push(tag);
      }
    }
    return this.editor.on('selectionchanged', (function(_this) {
      return function(e) {
        if (_this.editor.inputManager.focused) {
          return _this._status();
        }
      };
    })(this));
  };

  Button.prototype.iconClassOf = function(icon) {
    var iconClass;
    iconClass = '';
    if (icon) {
      if (icon.indexOf("simditor-r-icon") === 0) {
        iconClass = icon;
      } else {
        iconClass = "simditor-icon simditor-icon-" + icon;
      }
    } else {
      iconClass = "";
    }
    return iconClass;
  };

  Button.prototype.setIcon = function(icon) {
    return this.el.find('span').removeClass().addClass(this.iconClassOf(icon)).text(this.text);
  };

  Button.prototype.render = function() {
    this.wrapper = $(this._tpl.item).appendTo(this.editor.toolbar.list);
    this.el = this.wrapper.find('a.toolbar-item');
    this.el.attr('title', this.title).addClass("toolbar-item-" + this.name).data('button', this);
    this.setIcon(this.icon);
    if (!this.menu) {
      return;
    }
    this.menuWrapper = $(this._tpl.menuWrapper).appendTo(this.wrapper);
    this.menuWrapper.addClass("toolbar-menu-" + this.name);
    return this.renderMenu();
  };

  Button.prototype.renderMenu = function() {
    var $menuBtnEl, $menuItemEl, len, menuItem, ref, ref1, results, w;
    if (!$.isArray(this.menu)) {
      return;
    }
    this.menuEl = $('<ul/>').appendTo(this.menuWrapper);
    ref = this.menu;
    results = [];
    for (w = 0, len = ref.length; w < len; w++) {
      menuItem = ref[w];
      if (menuItem === '|') {
        $(this._tpl.separator).appendTo(this.menuEl);
        continue;
      }
      $menuItemEl = $(this._tpl.menuItem).appendTo(this.menuEl);
      $menuBtnEl = $menuItemEl.find('a.menu-item').attr({
        'title': (ref1 = menuItem.title) != null ? ref1 : menuItem.text,
        'data-param': menuItem.param
      }).addClass('menu-item-' + menuItem.name);
      if (menuItem.icon) {
        results.push($menuBtnEl.find('span').addClass(this.iconClassOf(menuItem.icon)));
      } else {
        results.push($menuBtnEl.find('span').text(menuItem.text));
      }
    }
    return results;
  };

  Button.prototype.setActive = function(active) {
    if (active === this.active) {
      return;
    }
    this.active = active;
    return this.el.toggleClass('active', this.active);
  };

  Button.prototype.setDisabled = function(disabled) {
    if (disabled === this.disabled) {
      return;
    }
    this.disabled = disabled;
    return this.el.toggleClass('disabled', this.disabled);
  };

  Button.prototype._disableStatus = function() {
    var disabled, endNodes, startNodes;
    startNodes = this.editor.selection.startNodes();
    endNodes = this.editor.selection.endNodes();
    disabled = startNodes.filter(this.disableTag).length > 0 || endNodes.filter(this.disableTag).length > 0;
    this.setDisabled(disabled);
    if (this.disabled) {
      this.setActive(false);
    }
    return this.disabled;
  };

  Button.prototype._activeStatus = function() {
    var active, endNode, endNodes, startNode, startNodes;
    startNodes = this.editor.selection.startNodes();
    endNodes = this.editor.selection.endNodes();
    startNode = startNodes.filter(this.htmlTag);
    endNode = endNodes.filter(this.htmlTag);
    active = startNode.length > 0 && endNode.length > 0 && startNode.is(endNode);
    this.node = active ? startNode : null;
    this.setActive(active);
    return this.active;
  };

  Button.prototype._status = function() {
    this._disableStatus();
    if (this.disabled) {
      return;
    }
    return this._activeStatus();
  };

  Button.prototype.command = function(param) {};

  Button.prototype._t = function() {
    var args, ref, result;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    result = Button.__super__._t.apply(this, args);
    if (!result) {
      result = (ref = this.editor)._t.apply(ref, args);
    }
    return result;
  };

  return Button;

})(SimpleModule);

Simditor.Button = Button;

Popover = (function(superClass) {
  extend(Popover, superClass);

  Popover.prototype.offset = {
    top: 4,
    left: 0
  };

  Popover.prototype.target = null;

  Popover.prototype.active = false;

  function Popover(opts) {
    this.button = opts.button;
    this.editor = opts.button.editor;
    Popover.__super__.constructor.call(this, opts);
  }

  Popover.prototype._init = function() {
    this.el = $('<div class="simditor-popover"></div>').appendTo(this.editor.el).data('popover', this);
    this.render();
    this.el.on('mouseenter', (function(_this) {
      return function(e) {
        return _this.el.addClass('hover');
      };
    })(this));
    return this.el.on('mouseleave', (function(_this) {
      return function(e) {
        return _this.el.removeClass('hover');
      };
    })(this));
  };

  Popover.prototype.render = function() {};

  Popover.prototype._initLabelWidth = function() {
    var $fields;
    $fields = this.el.find('.settings-field');
    if (!($fields.length > 0)) {
      return;
    }
    this._labelWidth = 0;
    $fields.each((function(_this) {
      return function(i, field) {
        var $field, $label;
        $field = $(field);
        $label = $field.find('label');
        if (!($label.length > 0)) {
          return;
        }
        return _this._labelWidth = Math.max(_this._labelWidth, $label.width());
      };
    })(this));
    return $fields.find('label').width(this._labelWidth);
  };

  Popover.prototype.show = function($target, position) {
    if (position == null) {
      position = 'bottom';
    }
    if ($target == null) {
      return;
    }
    this.el.siblings('.simditor-popover').each(function(i, popover) {
      popover = $(popover).data('popover');
      if (popover.active) {
        return popover.hide();
      }
    });
    if (this.active && this.target) {
      this.target.removeClass('selected');
    }
    this.target = $target.addClass('selected');
    if (this.active) {
      this.refresh(position);
      return this.trigger('popovershow');
    } else {
      this.active = true;
      this.el.css({
        left: -9999
      }).show();
      if (!this._labelWidth) {
        this._initLabelWidth();
      }
      this.editor.util.reflow();
      this.refresh(position);
      return this.trigger('popovershow');
    }
  };

  Popover.prototype.hide = function() {
    if (!this.active) {
      return;
    }
    if (this.target) {
      this.target.removeClass('selected');
    }
    this.target = null;
    this.active = false;
    this.el.hide();
    return this.trigger('popoverhide');
  };

  Popover.prototype.refresh = function(position) {
    var editorOffset, left, maxLeft, targetH, targetOffset, top;
    if (position == null) {
      position = 'bottom';
    }
    if (!this.active) {
      return;
    }
    editorOffset = this.editor.el.offset();
    targetOffset = this.target.offset();
    targetH = this.target.outerHeight();
    if (position === 'bottom') {
      top = targetOffset.top - editorOffset.top + targetH;
    } else if (position === 'top') {
      top = targetOffset.top - editorOffset.top - this.el.height();
    }
    maxLeft = this.editor.wrapper.width() - this.el.outerWidth() - 10;
    left = Math.min(targetOffset.left - editorOffset.left, maxLeft);
    return this.el.css({
      top: top + this.offset.top,
      left: left + this.offset.left
    });
  };

  Popover.prototype.destroy = function() {
    this.target = null;
    this.active = false;
    this.editor.off('.linkpopover');
    return this.el.remove();
  };

  Popover.prototype._t = function() {
    var args, ref, result;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    result = Popover.__super__._t.apply(this, args);
    if (!result) {
      result = (ref = this.button)._t.apply(ref, args);
    }
    return result;
  };

  return Popover;

})(SimpleModule);

Simditor.Popover = Popover;

TitleButton = (function(superClass) {
  extend(TitleButton, superClass);

  function TitleButton() {
    return TitleButton.__super__.constructor.apply(this, arguments);
  }

  TitleButton.prototype.name = 'title';

  TitleButton.prototype.htmlTag = 'h1, h2, h3, h4, h5';

  TitleButton.prototype.disableTag = 'pre, table';

  TitleButton.prototype._init = function() {
    this.menu = [
      {
        name: 'normal',
        text: this._t('normalText'),
        param: 'p'
      }, '|', {
        name: 'h1',
        text: this._t('title') + ' 1',
        param: 'h1'
      }, {
        name: 'h2',
        text: this._t('title') + ' 2',
        param: 'h2'
      }, {
        name: 'h3',
        text: this._t('title') + ' 3',
        param: 'h3'
      }, {
        name: 'h4',
        text: this._t('title') + ' 4',
        param: 'h4'
      }, {
        name: 'h5',
        text: this._t('title') + ' 5',
        param: 'h5'
      }
    ];
    return TitleButton.__super__._init.call(this);
  };

  TitleButton.prototype.setActive = function(active, param) {
    TitleButton.__super__.setActive.call(this, active);
    if (active) {
      param || (param = this.node[0].tagName.toLowerCase());
    }
    this.el.removeClass('active-p active-h1 active-h2 active-h3 active-h4 active-h5');
    if (active) {
      return this.el.addClass('active active-' + param);
    }
  };

  TitleButton.prototype.command = function(param) {
    var $rootNodes;
    $rootNodes = this.editor.selection.rootNodes();
    this.editor.selection.save();
    $rootNodes.each((function(_this) {
      return function(i, node) {
        var $node;
        $node = $(node);
        if ($node.is('blockquote') || $node.is(param) || $node.is(_this.disableTag) || _this.editor.util.isDecoratedNode($node)) {
          return;
        }
        return $('<' + param + '/>').append($node.contents()).replaceAll($node);
      };
    })(this));
    this.editor.selection.restore();
    return this.editor.trigger('valuechanged');
  };

  return TitleButton;

})(Button);

Simditor.Toolbar.addButton(TitleButton);

FontScaleButton = (function(superClass) {
  extend(FontScaleButton, superClass);

  function FontScaleButton() {
    return FontScaleButton.__super__.constructor.apply(this, arguments);
  }

  FontScaleButton.prototype.name = 'fontScale';

  FontScaleButton.prototype.icon = 'font';

  FontScaleButton.prototype.disableTag = 'pre';

  FontScaleButton.prototype.htmlTag = 'span';

  FontScaleButton.prototype._init = function() {
    this.menu = [
      {
        name: '75%',
        text: '12',
        param: '12px'
      }, {
        name: '87.5%',
        text: '14',
        param: '14px'
      }, {
        name: '100%',
        text: '16',
        param: '16px'
      }, {
        name: '112.5%',
        text: '18',
        param: '18px'
      }, {
        name: '125%',
        text: '20',
        param: '20px'
      }, {
        name: '150%',
        text: '24',
        param: '24px'
      }, {
        name: '187.5%',
        text: '30',
        param: '30px'
      }, {
        name: '225%',
        text: '36',
        param: '36px'
      }
    ];
    return FontScaleButton.__super__._init.call(this);
  };

  FontScaleButton.prototype._activeStatus = function() {
    var active, endNode, endNodes, range, startNode, startNodes;
    range = this.editor.selection.range();
    startNodes = this.editor.selection.startNodes();
    endNodes = this.editor.selection.endNodes();
    startNode = startNodes.filter('span[style*="font-size"]');
    endNode = endNodes.filter('span[style*="font-size"]');
    active = startNodes.length > 0 && endNodes.length > 0 && startNode.is(endNode);
    this.node = active ? startNode : null;
    this.setActive(active);
    return this.active;
  };

  FontScaleButton.prototype.setActive = function(active, param) {
    var fontSize;
    FontScaleButton.__super__.setActive.call(this, active);
    this.el.removeClass('active-font active-12 active-14 active-16 active-18 active-20 active-24 active-30 active-36');
    if (!active) {
      return;
    }
    fontSize = window.getComputedStyle(this.node[0], null).getPropertyValue('font-size');
    return this.el.addClass('active active-font active-' + fontSize.replace('px', ''));
  };

  FontScaleButton.prototype.command = function(param) {
    var $scales, containerNode, range;
    range = this.editor.selection.range();
    if (range.collapsed) {
      return;
    }
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('fontSize', false, 3);
    document.execCommand('styleWithCSS', false, false);
    this.editor.selection.reset();
    this.editor.selection.range();
    containerNode = this.editor.selection.containerNode();
    if (containerNode[0].nodeType === Node.TEXT_NODE) {
      $scales = containerNode.closest('[style*="font-size"]');
    } else {
      $scales = containerNode.find('[style*="font-size"]');
    }
    $scales.each((function(_this) {
      return function(i, n) {
        var $span, size;
        $span = $(n);
        size = n.style.fontSize;
        return $span.css('fontSize', param);
      };
    })(this));
    return this.editor.trigger('valuechanged');
  };

  return FontScaleButton;

})(Button);

Simditor.Toolbar.addButton(FontScaleButton);

BoldButton = (function(superClass) {
  extend(BoldButton, superClass);

  function BoldButton() {
    return BoldButton.__super__.constructor.apply(this, arguments);
  }

  BoldButton.prototype.name = 'bold';

  BoldButton.prototype.icon = 'bold';

  BoldButton.prototype.htmlTag = 'b, strong';

  BoldButton.prototype.disableTag = 'pre, th';

  BoldButton.prototype.shortcut = 'cmd+b';

  BoldButton.prototype._init = function() {
    if (this.editor.util.os.mac) {
      this.title = this.title + ' ( Cmd + b )';
    } else {
      this.title = this.title + ' ( Ctrl + b )';
      this.shortcut = 'ctrl+b';
    }
    return BoldButton.__super__._init.call(this);
  };

  BoldButton.prototype._activeStatus = function() {
    var active;
    active = document.queryCommandState('bold') === true;
    this.setActive(active);
    return this.active;
  };

  BoldButton.prototype.command = function() {
    document.execCommand('bold');
    if (!this.editor.util.support.oninput) {
      this.editor.trigger('valuechanged');
    }
    return $(document).trigger('selectionchange');
  };

  return BoldButton;

})(Button);

Simditor.Toolbar.addButton(BoldButton);

ItalicButton = (function(superClass) {
  extend(ItalicButton, superClass);

  function ItalicButton() {
    return ItalicButton.__super__.constructor.apply(this, arguments);
  }

  ItalicButton.prototype.name = 'italic';

  ItalicButton.prototype.icon = 'italic';

  ItalicButton.prototype.htmlTag = 'i';

  ItalicButton.prototype.disableTag = 'pre';

  ItalicButton.prototype.shortcut = 'cmd+i';

  ItalicButton.prototype._init = function() {
    if (this.editor.util.os.mac) {
      this.title = this.title + " ( Cmd + i )";
    } else {
      this.title = this.title + " ( Ctrl + i )";
      this.shortcut = 'ctrl+i';
    }
    return ItalicButton.__super__._init.call(this);
  };

  ItalicButton.prototype._activeStatus = function() {
    var active;
    active = document.queryCommandState('italic') === true;
    this.setActive(active);
    return this.active;
  };

  ItalicButton.prototype.command = function() {
    document.execCommand('italic');
    if (!this.editor.util.support.oninput) {
      this.editor.trigger('valuechanged');
    }
    return $(document).trigger('selectionchange');
  };

  return ItalicButton;

})(Button);

Simditor.Toolbar.addButton(ItalicButton);

UnderlineButton = (function(superClass) {
  extend(UnderlineButton, superClass);

  function UnderlineButton() {
    return UnderlineButton.__super__.constructor.apply(this, arguments);
  }

  UnderlineButton.prototype.name = 'underline';

  UnderlineButton.prototype.icon = 'underline';

  UnderlineButton.prototype.htmlTag = 'u';

  UnderlineButton.prototype.disableTag = 'pre';

  UnderlineButton.prototype.shortcut = 'cmd+u';

  UnderlineButton.prototype.render = function() {
    if (this.editor.util.os.mac) {
      this.title = this.title + ' ( Cmd + u )';
    } else {
      this.title = this.title + ' ( Ctrl + u )';
      this.shortcut = 'ctrl+u';
    }
    return UnderlineButton.__super__.render.call(this);
  };

  UnderlineButton.prototype._activeStatus = function() {
    var active;
    active = document.queryCommandState('underline') === true;
    this.setActive(active);
    return this.active;
  };

  UnderlineButton.prototype.command = function() {
    document.execCommand('underline');
    if (!this.editor.util.support.oninput) {
      this.editor.trigger('valuechanged');
    }
    return $(document).trigger('selectionchange');
  };

  return UnderlineButton;

})(Button);

Simditor.Toolbar.addButton(UnderlineButton);

ColorButton = (function(superClass) {
  extend(ColorButton, superClass);

  function ColorButton() {
    return ColorButton.__super__.constructor.apply(this, arguments);
  }

  ColorButton.prototype.name = 'color';

  ColorButton.prototype.icon = 'tint';

  ColorButton.prototype.disableTag = 'pre';

  ColorButton.prototype.menu = true;

  ColorButton.prototype.render = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return ColorButton.__super__.render.apply(this, args);
  };

  ColorButton.prototype.renderMenu = function() {
    $('<ul class="color-list">\n  <li><a href="javascript:;" class="font-color font-color-1"></a></li>\n  <li><a href="javascript:;" class="font-color font-color-2"></a></li>\n  <li><a href="javascript:;" class="font-color font-color-3"></a></li>\n  <li><a href="javascript:;" class="font-color font-color-4"></a></li>\n  <li><a href="javascript:;" class="font-color font-color-5"></a></li>\n  <li><a href="javascript:;" class="font-color font-color-6"></a></li>\n  <li><a href="javascript:;" class="font-color font-color-7"></a></li>\n  <li><a href="javascript:;" class="font-color font-color-default"></a></li>\n</ul>').appendTo(this.menuWrapper);
    this.menuWrapper.on('mousedown', '.color-list', function(e) {
      return false;
    });
    return this.menuWrapper.on('click', '.font-color', (function(_this) {
      return function(e) {
        var $link, $p, hex, range, rgb, textNode;
        _this.wrapper.removeClass('menu-on');
        $link = $(e.currentTarget);
        if ($link.hasClass('font-color-default')) {
          $p = _this.editor.body.find('p, li');
          if (!($p.length > 0)) {
            return;
          }
          rgb = window.getComputedStyle($p[0], null).getPropertyValue('color');
          hex = _this._convertRgbToHex(rgb);
        } else {
          rgb = window.getComputedStyle($link[0], null).getPropertyValue('background-color');
          hex = _this._convertRgbToHex(rgb);
        }
        if (!hex) {
          return;
        }
        range = _this.editor.selection.range();
        if (!$link.hasClass('font-color-default') && range.collapsed) {
          textNode = document.createTextNode(_this._t('coloredText'));
          range.insertNode(textNode);
          range.selectNodeContents(textNode);
          _this.editor.selection.range(range);
        }
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('foreColor', false, hex);
        document.execCommand('styleWithCSS', false, false);
        if (!_this.editor.util.support.oninput) {
          return _this.editor.trigger('valuechanged');
        }
      };
    })(this));
  };

  ColorButton.prototype._convertRgbToHex = function(rgb) {
    var match, re, rgbToHex;
    re = /rgb\((\d+),\s?(\d+),\s?(\d+)\)/g;
    match = re.exec(rgb);
    if (!match) {
      return '';
    }
    rgbToHex = function(r, g, b) {
      var componentToHex;
      componentToHex = function(c) {
        var hex;
        hex = c.toString(16);
        if (hex.length === 1) {
          return '0' + hex;
        } else {
          return hex;
        }
      };
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };
    return rgbToHex(match[1] * 1, match[2] * 1, match[3] * 1);
  };

  return ColorButton;

})(Button);

Simditor.Toolbar.addButton(ColorButton);

ListButton = (function(superClass) {
  extend(ListButton, superClass);

  function ListButton() {
    return ListButton.__super__.constructor.apply(this, arguments);
  }

  ListButton.prototype.type = '';

  ListButton.prototype.disableTag = 'pre, table';

  ListButton.prototype.command = function(param) {
    var $list, $rootNodes, anotherType;
    $rootNodes = this.editor.selection.blockNodes();
    anotherType = this.type === 'ul' ? 'ol' : 'ul';
    this.editor.selection.save();
    $list = null;
    $rootNodes.each((function(_this) {
      return function(i, node) {
        var $node;
        $node = $(node);
        if ($node.is('blockquote, li') || $node.is(_this.disableTag) || _this.editor.util.isDecoratedNode($node) || !$.contains(document, node)) {
          return;
        }
        if ($node.is(_this.type)) {
          $node.children('li').each(function(i, li) {
            var $childList, $li;
            $li = $(li);
            $childList = $li.children('ul, ol').insertAfter($node);
            return $('<p/>').append($(li).html() || _this.editor.util.phBr).insertBefore($node);
          });
          return $node.remove();
        } else if ($node.is(anotherType)) {
          return $('<' + _this.type + '/>').append($node.contents()).replaceAll($node);
        } else if ($list && $node.prev().is($list)) {
          $('<li/>').append($node.html() || _this.editor.util.phBr).appendTo($list);
          return $node.remove();
        } else {
          $list = $("<" + _this.type + "><li></li></" + _this.type + ">");
          $list.find('li').append($node.html() || _this.editor.util.phBr);
          return $list.replaceAll($node);
        }
      };
    })(this));
    this.editor.selection.restore();
    return this.editor.trigger('valuechanged');
  };

  return ListButton;

})(Button);

OrderListButton = (function(superClass) {
  extend(OrderListButton, superClass);

  function OrderListButton() {
    return OrderListButton.__super__.constructor.apply(this, arguments);
  }

  OrderListButton.prototype.type = 'ol';

  OrderListButton.prototype.name = 'ol';

  OrderListButton.prototype.icon = 'list-ol';

  OrderListButton.prototype.htmlTag = 'ol';

  OrderListButton.prototype.shortcut = 'cmd+/';

  OrderListButton.prototype._init = function() {
    if (this.editor.util.os.mac) {
      this.title = this.title + ' ( Cmd + / )';
    } else {
      this.title = this.title + ' ( ctrl + / )';
      this.shortcut = 'ctrl+/';
    }
    return OrderListButton.__super__._init.call(this);
  };

  return OrderListButton;

})(ListButton);

UnorderListButton = (function(superClass) {
  extend(UnorderListButton, superClass);

  function UnorderListButton() {
    return UnorderListButton.__super__.constructor.apply(this, arguments);
  }

  UnorderListButton.prototype.type = 'ul';

  UnorderListButton.prototype.name = 'ul';

  UnorderListButton.prototype.icon = 'list-ul';

  UnorderListButton.prototype.htmlTag = 'ul';

  UnorderListButton.prototype.shortcut = 'cmd+.';

  UnorderListButton.prototype._init = function() {
    if (this.editor.util.os.mac) {
      this.title = this.title + ' ( Cmd + . )';
    } else {
      this.title = this.title + ' ( Ctrl + . )';
      this.shortcut = 'ctrl+.';
    }
    return UnorderListButton.__super__._init.call(this);
  };

  return UnorderListButton;

})(ListButton);

Simditor.Toolbar.addButton(OrderListButton);

Simditor.Toolbar.addButton(UnorderListButton);

BlockquoteButton = (function(superClass) {
  extend(BlockquoteButton, superClass);

  function BlockquoteButton() {
    return BlockquoteButton.__super__.constructor.apply(this, arguments);
  }

  BlockquoteButton.prototype.name = 'blockquote';

  BlockquoteButton.prototype.icon = 'quote-left';

  BlockquoteButton.prototype.htmlTag = 'blockquote';

  BlockquoteButton.prototype.disableTag = 'pre, table';

  BlockquoteButton.prototype.command = function() {
    var $rootNodes, clearCache, nodeCache;
    $rootNodes = this.editor.selection.rootNodes();
    $rootNodes = $rootNodes.filter(function(i, node) {
      return !$(node).parent().is('blockquote');
    });
    this.editor.selection.save();
    nodeCache = [];
    clearCache = (function(_this) {
      return function() {
        if (nodeCache.length > 0) {
          $("<" + _this.htmlTag + "/>").insertBefore(nodeCache[0]).append(nodeCache);
          return nodeCache.length = 0;
        }
      };
    })(this);
    $rootNodes.each((function(_this) {
      return function(i, node) {
        var $node;
        $node = $(node);
        if (!$node.parent().is(_this.editor.body)) {
          return;
        }
        if ($node.is(_this.htmlTag)) {
          clearCache();
          return $node.children().unwrap();
        } else if ($node.is(_this.disableTag) || _this.editor.util.isDecoratedNode($node)) {
          return clearCache();
        } else {
          return nodeCache.push(node);
        }
      };
    })(this));
    clearCache();
    this.editor.selection.restore();
    return this.editor.trigger('valuechanged');
  };

  return BlockquoteButton;

})(Button);

Simditor.Toolbar.addButton(BlockquoteButton);

CodeButton = (function(superClass) {
  extend(CodeButton, superClass);

  function CodeButton() {
    return CodeButton.__super__.constructor.apply(this, arguments);
  }

  CodeButton.prototype.name = 'code';

  CodeButton.prototype.icon = 'code';

  CodeButton.prototype.htmlTag = 'pre';

  CodeButton.prototype.disableTag = 'ul, ol, table';

  CodeButton.prototype._init = function() {
    CodeButton.__super__._init.call(this);
    this.editor.on('decorate', (function(_this) {
      return function(e, $el) {
        return $el.find('pre').each(function(i, pre) {
          return _this.decorate($(pre));
        });
      };
    })(this));
    return this.editor.on('undecorate', (function(_this) {
      return function(e, $el) {
        return $el.find('pre').each(function(i, pre) {
          return _this.undecorate($(pre));
        });
      };
    })(this));
  };

  CodeButton.prototype.render = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    CodeButton.__super__.render.apply(this, args);
    return this.popover = new CodePopover({
      button: this
    });
  };

  CodeButton.prototype._checkMode = function() {
    var $blockNodes, range;
    range = this.editor.selection.range();
    if (($blockNodes = $(range.cloneContents()).find(this.editor.util.blockNodes.join(','))) > 0 || (range.collapsed && this.editor.selection.startNodes().filter('code').length === 0)) {
      this.inlineMode = false;
      return this.htmlTag = 'pre';
    } else {
      this.inlineMode = true;
      return this.htmlTag = 'code';
    }
  };

  CodeButton.prototype._status = function() {
    this._checkMode();
    CodeButton.__super__._status.call(this);
    if (this.inlineMode) {
      return;
    }
    if (this.active) {
      return this.popover.show(this.node);
    } else {
      return this.popover.hide();
    }
  };

  CodeButton.prototype.decorate = function($pre) {
    var $code, lang, ref, ref1;
    $code = $pre.find('> code');
    if ($code.length > 0) {
      lang = (ref = $code.attr('class')) != null ? (ref1 = ref.match(/lang-(\S+)/)) != null ? ref1[1] : void 0 : void 0;
      $code.contents().unwrap();
      if (lang) {
        return $pre.attr('data-lang', lang);
      }
    }
  };

  CodeButton.prototype.undecorate = function($pre) {
    var $code, lang;
    lang = $pre.attr('data-lang');
    $code = $('<code/>');
    if (lang && lang !== -1) {
      $code.addClass('lang-' + lang);
    }
    return $pre.wrapInner($code).removeAttr('data-lang');
  };

  CodeButton.prototype.command = function() {
    if (this.inlineMode) {
      return this._inlineCommand();
    } else {
      return this._blockCommand();
    }
  };

  CodeButton.prototype._blockCommand = function() {
    var $rootNodes, clearCache, nodeCache, resultNodes;
    $rootNodes = this.editor.selection.rootNodes();
    nodeCache = [];
    resultNodes = [];
    clearCache = (function(_this) {
      return function() {
        var $pre;
        if (!(nodeCache.length > 0)) {
          return;
        }
        $pre = $("<" + _this.htmlTag + "/>").insertBefore(nodeCache[0]).text(_this.editor.formatter.clearHtml(nodeCache));
        resultNodes.push($pre[0]);
        return nodeCache.length = 0;
      };
    })(this);
    $rootNodes.each((function(_this) {
      return function(i, node) {
        var $node, $p;
        $node = $(node);
        if ($node.is(_this.htmlTag)) {
          clearCache();
          $p = $('<p/>').append($node.html().replace('\n', '<br/>')).replaceAll($node);
          return resultNodes.push($p[0]);
        } else if ($node.is(_this.disableTag) || _this.editor.util.isDecoratedNode($node) || $node.is('blockquote')) {
          return clearCache();
        } else {
          return nodeCache.push(node);
        }
      };
    })(this));
    clearCache();
    this.editor.selection.setRangeAtEndOf($(resultNodes).last());
    return this.editor.trigger('valuechanged');
  };

  CodeButton.prototype._inlineCommand = function() {
    var $code, $contents, range;
    range = this.editor.selection.range();
    if (this.active) {
      range.selectNodeContents(this.node[0]);
      this.editor.selection.save(range);
      this.node.contents().unwrap();
      this.editor.selection.restore();
    } else {
      $contents = $(range.extractContents());
      $code = $("<" + this.htmlTag + "/>").append($contents.contents());
      range.insertNode($code[0]);
      range.selectNodeContents($code[0]);
      this.editor.selection.range(range);
    }
    return this.editor.trigger('valuechanged');
  };

  return CodeButton;

})(Button);

CodePopover = (function(superClass) {
  extend(CodePopover, superClass);

  function CodePopover() {
    return CodePopover.__super__.constructor.apply(this, arguments);
  }

  CodePopover.prototype.render = function() {
    var $option, lang, len, ref, w;
    this._tpl = "<div class=\"code-settings\">\n  <div class=\"settings-field\">\n    <select class=\"select-lang\">\n      <option value=\"-1\">" + (this._t('selectLanguage')) + "</option>\n    </select>\n  </div>\n</div>";
    this.langs = this.editor.opts.codeLanguages || [
      {
        name: 'Bash',
        value: 'bash'
      }, {
        name: 'C++',
        value: 'c++'
      }, {
        name: 'C#',
        value: 'cs'
      }, {
        name: 'CSS',
        value: 'css'
      }, {
        name: 'Erlang',
        value: 'erlang'
      }, {
        name: 'Less',
        value: 'less'
      }, {
        name: 'Sass',
        value: 'sass'
      }, {
        name: 'Diff',
        value: 'diff'
      }, {
        name: 'CoffeeScript',
        value: 'coffeescript'
      }, {
        name: 'HTML,XML',
        value: 'html'
      }, {
        name: 'JSON',
        value: 'json'
      }, {
        name: 'Java',
        value: 'java'
      }, {
        name: 'JavaScript',
        value: 'js'
      }, {
        name: 'Markdown',
        value: 'markdown'
      }, {
        name: 'Objective C',
        value: 'oc'
      }, {
        name: 'PHP',
        value: 'php'
      }, {
        name: 'Perl',
        value: 'parl'
      }, {
        name: 'Python',
        value: 'python'
      }, {
        name: 'Ruby',
        value: 'ruby'
      }, {
        name: 'SQL',
        value: 'sql'
      }
    ];
    this.el.addClass('code-popover').append(this._tpl);
    this.selectEl = this.el.find('.select-lang');
    ref = this.langs;
    for (w = 0, len = ref.length; w < len; w++) {
      lang = ref[w];
      $option = $('<option/>', {
        text: lang.name,
        value: lang.value
      }).appendTo(this.selectEl);
    }
    this.selectEl.on('change', (function(_this) {
      return function(e) {
        var selected;
        _this.lang = _this.selectEl.val();
        selected = _this.target.hasClass('selected');
        _this.target.removeClass().removeAttr('data-lang');
        if (_this.lang !== -1) {
          _this.target.attr('data-lang', _this.lang);
        }
        if (selected) {
          _this.target.addClass('selected');
        }
        return _this.editor.trigger('valuechanged');
      };
    })(this));
    return this.editor.on('valuechanged', (function(_this) {
      return function(e) {
        if (_this.active) {
          return _this.refresh();
        }
      };
    })(this));
  };

  CodePopover.prototype.show = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    CodePopover.__super__.show.apply(this, args);
    this.lang = this.target.attr('data-lang');
    if (this.lang != null) {
      return this.selectEl.val(this.lang);
    } else {
      return this.selectEl.val(-1);
    }
  };

  return CodePopover;

})(Popover);

Simditor.Toolbar.addButton(CodeButton);

LinkButton = (function(superClass) {
  extend(LinkButton, superClass);

  function LinkButton() {
    return LinkButton.__super__.constructor.apply(this, arguments);
  }

  LinkButton.prototype.name = 'link';

  LinkButton.prototype.icon = 'link';

  LinkButton.prototype.htmlTag = 'a';

  LinkButton.prototype.disableTag = 'pre,[data-mention="true"]';

  LinkButton.prototype._init = function() {
    LinkButton.__super__._init.call(this);
    this.editor.body.on('mouseenter', 'a:not(.unselection-attach-download)', (function(_this) {
      return function(e) {
        var $node;
        $node = $(e.target);
        $node.data('data-popover-show', true);
        return setTimeout(function() {
          return ($node.data('data-popover-show')) && _this.popover.show($(e.target));
        }, 500);
      };
    })(this));
    return this.editor.body.on('mouseleave', 'a:not(.unselection-attach-download)', (function(_this) {
      return function(e) {
        var $node;
        $node = $(e.target);
        $node.data('data-popover-show', false);
        return setTimeout(function() {
          return (!$node.data('data-popover-show')) && _this.popover.hide();
        }, 500);
      };
    })(this));
  };

  LinkButton.prototype.render = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    LinkButton.__super__.render.apply(this, args);
    return this.popover = new LinkPopover({
      button: this
    });
  };

  LinkButton.prototype._status = function() {
    LinkButton.__super__._status.call(this);
    if (this.active && !this.editor.selection.rangeAtEndOf(this.node)) {

    } else {
      return this.popover.hide();
    }
  };

  LinkButton.prototype.command = function() {
    var $contents, $link, $newBlock, linkText, range, txtNode;
    range = this.editor.selection.range();
    if (this.active) {
      txtNode = document.createTextNode(this.node.text());
      this.node.replaceWith(txtNode);
      range.selectNode(txtNode);
    } else {
      $contents = $(range.extractContents());
      linkText = this.editor.formatter.clearHtml($contents.contents(), false);
      $link = $('<a/>', {
        href: this.editor.opts.defaultLinkHref || 'http://www.example.com',
        target: '_blank',
        text: linkText || this._t('linkText')
      });
      if (this.editor.selection.blockNodes().length > 0) {
        range.insertNode($link[0]);
      } else {
        $newBlock = $('<p/>').append($link);
        range.insertNode($newBlock[0]);
      }
      range.selectNodeContents($link[0]);
      this.popover.one('popovershow', (function(_this) {
        return function() {
          if (linkText) {
            _this.popover.urlEl.focus();
            return _this.popover.urlEl[0].select();
          } else {
            _this.popover.textEl.focus();
            return _this.popover.textEl[0].select();
          }
        };
      })(this));
    }
    this.editor.selection.range(range);
    this.editor.trigger('valuechanged');
    return this.popover.show($link);
  };

  return LinkButton;

})(Button);

LinkPopover = (function(superClass) {
  extend(LinkPopover, superClass);

  function LinkPopover() {
    return LinkPopover.__super__.constructor.apply(this, arguments);
  }

  LinkPopover.prototype.render = function() {
    var tpl;
    tpl = "<div class=\"link-settings\">\n  <div class=\"settings-field\">\n    <label>" + (this._t('linkText')) + "</label>\n    <input class=\"link-text\" type=\"text\"/>\n    <a class=\"btn-unlink\" href=\"javascript:;\" title=\"" + (this._t('removeLink')) + "\"\n      tabindex=\"-1\">\n      <span class=\"simditor-icon simditor-icon-unlink\"></span>\n    </a>\n  </div>\n  <div class=\"settings-field\">\n    <label>" + (this._t('linkUrl')) + "</label>\n    <input class=\"link-url\" type=\"text\"/>\n  </div>\n</div>";
    this.el.addClass('link-popover').append(tpl);
    this.textEl = this.el.find('.link-text');
    this.urlEl = this.el.find('.link-url');
    this.unlinkEl = this.el.find('.btn-unlink');
    this.selectTarget = this.el.find('.link-target');
    this.textEl.on('keyup', (function(_this) {
      return function(e) {
        if (e.which === 13) {
          return;
        }
        _this.target.text(_this.textEl.val());
        return _this.editor.inputManager.throttledValueChanged();
      };
    })(this));
    this.urlEl.on('keyup', (function(_this) {
      return function(e) {
        var val;
        if (e.which === 13) {
          return;
        }
        val = _this.urlEl.val();
        if (!(/https?:\/\/|^\//ig.test(val) || !val)) {
          val = 'http://' + val;
        }
        _this.target.attr('href', val);
        return _this.editor.inputManager.throttledValueChanged();
      };
    })(this));
    $([this.urlEl[0], this.textEl[0]]).on('keydown', (function(_this) {
      return function(e) {
        var range;
        if (e.which === 13 || e.which === 27 || (!e.shiftKey && e.which === 9 && $(e.target).hasClass('link-url'))) {
          e.preventDefault();
          range = document.createRange();
          _this.editor.selection.setRangeAfter(_this.target, range);
          _this.hide();
          return _this.editor.inputManager.throttledValueChanged();
        }
      };
    })(this));
    this.unlinkEl.on('click', (function(_this) {
      return function(e) {
        var range, txtNode;
        txtNode = document.createTextNode(_this.target.text());
        _this.target.replaceWith(txtNode);
        _this.hide();
        range = document.createRange();
        _this.editor.selection.setRangeAfter(txtNode, range);
        return _this.editor.inputManager.throttledValueChanged();
      };
    })(this));
    return this.selectTarget.on('change', (function(_this) {
      return function(e) {
        _this.target.attr('target', _this.selectTarget.val());
        return _this.editor.inputManager.throttledValueChanged();
      };
    })(this));
  };

  LinkPopover.prototype.show = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    LinkPopover.__super__.show.apply(this, args);
    this.textEl.val(this.target.text());
    this.urlEl.val(this.target.attr('href'));
    this.el.off('mouseenter.hover-to-show');
    this.el.off('mouseleave.hover-to-show');
    this.el.on('mouseenter.hover-to-show', (function(_this) {
      return function() {
        return _this.target.data('data-popover-show', true);
      };
    })(this));
    return this.el.on('mouseleave.hover-to-show', (function(_this) {
      return function(e) {
        _this.target.data('data-popover-show', false);
        return setTimeout(function() {
          return _this.target && (!_this.target.data('data-popover-show')) && _this.hide();
        }, 500);
      };
    })(this));
  };

  return LinkPopover;

})(Popover);

Simditor.Toolbar.addButton(LinkButton);

ImageButton = (function(superClass) {
  extend(ImageButton, superClass);

  function ImageButton() {
    return ImageButton.__super__.constructor.apply(this, arguments);
  }

  ImageButton.prototype.name = 'image';

  ImageButton.prototype.icon = 'picture-o';

  ImageButton.prototype.htmlTag = 'img';

  ImageButton.prototype.disableTag = 'pre, table';

  ImageButton.prototype.defaultImage = '';

  ImageButton.prototype.needFocus = false;

  ImageButton.prototype._init = function() {
    var item, len, ref, w;
    if (this.editor.opts.imageButton) {
      if (Array.isArray(this.editor.opts.imageButton)) {
        this.menu = [];
        ref = this.editor.opts.imageButton;
        for (w = 0, len = ref.length; w < len; w++) {
          item = ref[w];
          this.menu.push({
            name: item + '-image',
            text: this._t(item + 'Image')
          });
        }
      } else {
        this.menu = false;
      }
    } else {
      if (this.editor.uploader != null) {
        this.menu = [
          {
            name: 'upload-image',
            text: this._t('uploadImage')
          }, {
            name: 'external-image',
            text: this._t('externalImage')
          }
        ];
      } else {
        this.menu = false;
      }
    }
    this.defaultImage = this.editor.opts.defaultImage;
    this.editor.body.on('click', 'img:not([data-non-image])', (function(_this) {
      return function(e) {
        var $img, range;
        $img = $(e.currentTarget);
        range = document.createRange();
        range.selectNode($img[0]);
        _this.editor.selection.range(range);
        if (!_this.editor.util.support.onselectionchange) {
          _this.editor.trigger('selectionchanged');
        }
        return false;
      };
    })(this));
    this.editor.body.on('mouseup', 'img:not([data-non-image])', function(e) {
      return false;
    });
    this.editor.on('selectionchanged.image', (function(_this) {
      return function() {
        var $contents, $img, range;
        range = _this.editor.selection.range();
        if (range == null) {
          return;
        }
        $contents = $(range.cloneContents()).contents();
        if ($contents.length === 1 && $contents.is('img:not([data-non-image])')) {
          $img = $(range.startContainer).contents().eq(range.startOffset);
          return _this.popover.show($img);
        } else {
          return _this.popover.hide();
        }
      };
    })(this));
    this.editor.on('valuechanged.image', (function(_this) {
      return function() {
        var $masks;
        $masks = _this.editor.wrapper.find('.simditor-image-loading');
        if (!($masks.length > 0)) {
          return;
        }
        return $masks.each(function(i, mask) {
          var $img, $mask, file;
          $mask = $(mask);
          $img = $mask.data('img');
          if (!($img && $img.parent().length > 0)) {
            $mask.remove();
            if ($img) {
              file = $img.data('file');
              if (file) {
                _this.editor.uploader.cancel(file);
                if (_this.editor.body.find('img.uploading').length < 1) {
                  return _this.editor.uploader.trigger('uploadready', [file]);
                }
              }
            }
          }
        });
      };
    })(this));
    return ImageButton.__super__._init.call(this);
  };

  ImageButton.prototype.render = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    ImageButton.__super__.render.apply(this, args);
    this.popover = new ImagePopover({
      button: this
    });
    if (this.editor.opts.imageButton === 'upload') {
      return this._initUploader(this.el);
    }
  };

  ImageButton.prototype.renderMenu = function() {
    ImageButton.__super__.renderMenu.call(this);
    return this._initUploader();
  };

  ImageButton.prototype._initUploader = function($uploadItem) {
    var $input, createInput, uploadProgress;
    if ($uploadItem == null) {
      $uploadItem = this.menuEl.find('.menu-item-upload-image');
    }
    if (this.editor.uploader == null) {
      this.el.find('.btn-upload').remove();
      return;
    }
    $input = null;
    createInput = (function(_this) {
      return function() {
        if ($input) {
          $input.remove();
        }
        return $input = $('<input/>', {
          type: 'file',
          title: _this._t('uploadImage'),
          multiple: false,
          accept: 'image/*'
        }).appendTo($uploadItem);
      };
    })(this);
    createInput();
    $uploadItem.on('click', function(e) {
      return e.stopPropagation();
    });
    $uploadItem.on('mousedown', function(e) {
      return e.preventDefault();
    });
    $uploadItem.on('change', 'input[type=file]', (function(_this) {
      return function(e) {
        if (_this.editor.inputManager.focused) {
          _this.editor.uploader.upload($input, {
            inline: true
          });
          createInput();
        } else {
          _this.editor.focus();
          _this.editor.uploader.upload($input, {
            inline: true
          });
          createInput();
        }
        return _this.wrapper.removeClass('menu-on');
      };
    })(this));
    this.editor.uploader.on('beforeupload', (function(_this) {
      return function(e, file) {
        var $img;
        if (!file.inline) {
          return;
        }
        if (file.img) {
          $img = $(file.img);
        } else {
          $img = _this.createImage(file.name);
          file.img = $img;
        }
        $img.addClass('uploading');
        $img.data('file', file);
        return _this.editor.uploader.readImageFile(file.obj, function(img) {
          var src;
          if (!$img.hasClass('uploading')) {
            return;
          }
          src = img ? img.src : _this.defaultImage;
          return _this.loadImage($img, src, function() {
            if (_this.popover.active) {
              _this.popover.refresh();
              return _this.popover.srcEl.val(_this._t('uploading')).prop('disabled', true);
            }
          });
        });
      };
    })(this));
    uploadProgress = $.proxy(this.editor.util.throttle(function(e, file, loaded, total) {
      var $img, $mask, percent;
      if (!file.inline) {
        return;
      }
      $mask = file.img.data('mask');
      if (!$mask) {
        return;
      }
      $img = $mask.data('img');
      if (!($img.hasClass('uploading') && $img.parent().length > 0)) {
        $mask.remove();
        return;
      }
      percent = loaded / total;
      percent = (percent * 100).toFixed(0);
      if (percent > 85) {
        percent = 85;
      }
      return $mask.find('.progress').height((100 - percent) + "%");
    }, 500), this);
    this.editor.uploader.on('uploadprogress', uploadProgress);
    this.editor.uploader.on('uploadsuccess', (function(_this) {
      return function(e, file, result) {
        var $img, img_path, msg;
        if (!file.inline) {
          return;
        }
        $img = file.img;
        if (!($img.hasClass('uploading') && $img.parent().length > 0)) {
          return;
        }
        if (typeof result !== 'object') {
          try {
            result = $.parseJSON(result);
          } catch (_error) {
            e = _error;
            result = {
              success: false
            };
          }
        }
        if (result.success === false) {
          msg = result.msg || _this._t('uploadFailed');
          alert(msg);
          img_path = _this.defaultImage;
        } else {
          if (result.ALY === true) {
            $.ajax({
              url: _this.editor.opts.upload.GET_FILE_FROM_ALI,
              type: 'post',
              data: {
                fileName: file.name,
                filePath: result.key
              },
              success: function(data) {
                img_path = data.realPath;
                return _this.loadImage($img, img_path, function() {
                  var $mask, $wrapper;
                  $img.removeData('file');
                  $img.removeClass('uploading').removeClass('loading');
                  $mask = $img.data('mask');
                  if ($mask) {
                    $mask.remove();
                  }
                  $img.removeData('mask');
                  $img.addClass('oss-file');
                  $img.attr('data-bucket', 'rishiqing-file');
                  $img.attr('data-key-name', result.key);
                  $img.attr('data-name', data.name);
                  $wrapper = $img.data('wrapper');
                  if ($wrapper) {
                    Simditor.UnSelectionBlock.addFileIdForWrapper($wrapper, data.id);
                  }
                  _this.editor.trigger('valuechanged');
                  if (_this.editor.body.find('img.uploading').length < 1) {
                    return _this.editor.uploader.trigger('uploadready', [file, result]);
                  }
                });
              },
              error: function() {}
            });
          } else {
            img_path = result.file_path;
            _this.loadImage($img, img_path, function() {
              var $mask;
              $img.removeData('file');
              $img.removeClass('uploading').removeClass('loading');
              $mask = $img.data('mask');
              if ($mask) {
                $mask.remove();
              }
              $img.removeData('mask');
              _this.editor.trigger('valuechanged');
              if (_this.editor.body.find('img.uploading').length < 1) {
                return _this.editor.uploader.trigger('uploadready', [file, result]);
              }
            });
          }
        }
        if (_this.popover.active) {
          _this.popover.srcEl.prop('disabled', false);
          return _this.popover.srcEl.val(result.file_path);
        }
      };
    })(this));
    return this.editor.uploader.on('uploaderror', (function(_this) {
      return function(e, file, xhr) {
        var $img, msg, result;
        if (!file.inline) {
          return;
        }
        if (xhr.statusText === 'abort') {
          return;
        }
        if (xhr.statusCode === 403) {
          return;
        }
        if (xhr.responseText) {
          try {
            result = $.parseJSON(xhr.responseText);
            msg = result.msg;
          } catch (_error) {
            e = _error;
            msg = _this._t('uploadError');
          }
          alert(msg);
        }
        $img = file.img;
        if (!($img.hasClass('uploading') && $img.parent().length > 0)) {
          return;
        }
        _this.loadImage($img, _this.defaultImage, function() {
          var $mask;
          $img.removeData('file');
          $img.removeClass('uploading').removeClass('loading');
          $mask = $img.data('mask');
          if ($mask) {
            $mask.remove();
          }
          return $img.removeData('mask');
        });
        if (_this.popover.active) {
          _this.popover.srcEl.prop('disabled', false);
          _this.popover.srcEl.val(_this.defaultImage);
        }
        _this.editor.trigger('valuechanged');
        if (_this.editor.body.find('img.uploading').length < 1) {
          return _this.editor.uploader.trigger('uploadready', [file, result]);
        }
      };
    })(this));
  };

  ImageButton.prototype._status = function() {
    return this._disableStatus();
  };

  ImageButton.prototype.loadImage = function($img, src, callback) {
    var $mask, img, positionMask;
    positionMask = (function(_this) {
      return function() {
        var imgOffset, wrapperOffset;
        imgOffset = $img.offset();
        wrapperOffset = _this.editor.wrapper.offset();
        return $mask.css({
          top: imgOffset.top - wrapperOffset.top,
          left: imgOffset.left - wrapperOffset.left,
          width: $img.width(),
          height: $img.height()
        }).show();
      };
    })(this);
    $img.addClass('loading');
    $mask = $img.data('mask');
    if (!$mask) {
      $mask = $('<div class="simditor-image-loading">\n  <div class="progress"></div>\n</div>').hide().appendTo(this.editor.wrapper);
      positionMask();
      $img.data('mask', $mask);
      $mask.data('img', $img);
    }
    img = new Image();
    img.onload = (function(_this) {
      return function() {
        var height, width;
        if (!$img.hasClass('loading') && !$img.hasClass('uploading')) {
          return;
        }
        width = img.width;
        height = img.height;
        $img.attr({
          src: src,
          width: width,
          height: height,
          'data-image-size': width + ',' + height
        }).removeClass('loading');
        if ($img.hasClass('uploading')) {
          _this.editor.util.reflow(_this.editor.body);
          positionMask();
        } else {
          $mask.remove();
          $img.removeData('mask');
        }
        if ($.isFunction(callback)) {
          return callback(img);
        }
      };
    })(this);
    img.onerror = function() {
      if ($.isFunction(callback)) {
        callback(false);
      }
      $mask.remove();
      return $img.removeData('mask').removeClass('loading');
    };
    return img.src = src;
  };

  ImageButton.prototype.createImage = function(name) {
    var $img, $newLine, $totalWrap, $wrapper, range, rootNode;
    if (name == null) {
      name = 'Image';
    }
    if (!this.editor.inputManager.focused) {
      this.editor.focus();
    }
    range = this.editor.selection.range();
    range.deleteContents();
    this.editor.selection.range(range);
    $img = $('<img/>').attr('alt', name);
    $newLine = $('<p><br></p>');
    rootNode = this.editor.selection.rootNodes().last();
    $totalWrap = null;
    if (rootNode.is('p') && this.editor.util.isEmptyNode(rootNode)) {
      $wrapper = Simditor.UnSelectionBlock.createImgWrapperByP(rootNode);
      $wrapper.empty();
      $wrapper.append($img);
      $totalWrap = rootNode;
    } else {
      $wrapper = Simditor.UnSelectionBlock.getImgWrapperWithImg($img);
      rootNode.after($wrapper);
      $totalWrap = $wrapper;
    }
    $totalWrap.after($newLine);
    $img.data('wrapper', $wrapper);
    this.editor.selection.setRangeAtStartOf($newLine, range);
    this.editor.trigger('valuechanged');
    return $img;
  };

  ImageButton.prototype.command = function(src) {
    var $img;
    $img = this.createImage();
    return this.loadImage($img, src || this.defaultImage, (function(_this) {
      return function() {
        _this.editor.trigger('valuechanged');
        _this.editor.util.reflow($img);
        $img.click();
        return _this.popover.one('popovershow', function() {
          _this.popover.srcEl.focus();
          return _this.popover.srcEl[0].select();
        });
      };
    })(this));
  };

  return ImageButton;

})(Button);

ImagePopover = (function(superClass) {
  extend(ImagePopover, superClass);

  function ImagePopover() {
    return ImagePopover.__super__.constructor.apply(this, arguments);
  }

  ImagePopover.prototype.offset = {
    top: 6,
    left: -4
  };

  ImagePopover.prototype.render = function() {
    var tpl;
    tpl = "<div class=\"link-settings\">\n  <div class=\"settings-field\">\n    <label>" + (this._t('imageUrl')) + "</label>\n    <input class=\"image-src\" type=\"text\" tabindex=\"1\" />\n    <a class=\"btn-upload\" href=\"javascript:;\"\n      title=\"" + (this._t('uploadImage')) + "\" tabindex=\"-1\">\n      <span class=\"simditor-icon simditor-icon-upload\"></span>\n    </a>\n  </div>\n  <div class='settings-field'>\n    <label>" + (this._t('imageAlt')) + "</label>\n    <input class=\"image-alt\" id=\"image-alt\" type=\"text\" tabindex=\"1\" />\n  </div>\n  <div class=\"settings-field\">\n    <label>" + (this._t('imageSize')) + "</label>\n    <input class=\"image-size\" id=\"image-width\" type=\"text\" tabindex=\"2\" />\n    <span class=\"times\">×</span>\n    <input class=\"image-size\" id=\"image-height\" type=\"text\" tabindex=\"3\" />\n    <a class=\"btn-restore\" href=\"javascript:;\"\n      title=\"" + (this._t('restoreImageSize')) + "\" tabindex=\"-1\">\n      <span class=\"simditor-icon simditor-icon-undo\"></span>\n    </a>\n  </div>\n</div>";
    this.el.addClass('image-popover').append(tpl);
    this.srcEl = this.el.find('.image-src');
    this.widthEl = this.el.find('#image-width');
    this.heightEl = this.el.find('#image-height');
    this.altEl = this.el.find('#image-alt');
    this.srcEl.on('keydown', (function(_this) {
      return function(e) {
        var range;
        if (!(e.which === 13 && !_this.target.hasClass('uploading'))) {
          return;
        }
        e.preventDefault();
        range = document.createRange();
        _this.button.editor.selection.setRangeAfter(_this.target, range);
        return _this.hide();
      };
    })(this));
    this.srcEl.on('blur', (function(_this) {
      return function(e) {
        return _this._loadImage(_this.srcEl.val());
      };
    })(this));
    this.el.find('.image-size').on('blur', (function(_this) {
      return function(e) {
        _this._resizeImg($(e.currentTarget));
        return _this.el.data('popover').refresh();
      };
    })(this));
    this.el.find('.image-size').on('keyup', (function(_this) {
      return function(e) {
        var inputEl;
        inputEl = $(e.currentTarget);
        if (!(e.which === 13 || e.which === 27 || e.which === 9)) {
          return _this._resizeImg(inputEl, true);
        }
      };
    })(this));
    this.el.find('.image-size').on('keydown', (function(_this) {
      return function(e) {
        var $img, inputEl, range;
        inputEl = $(e.currentTarget);
        if (e.which === 13 || e.which === 27) {
          e.preventDefault();
          if (e.which === 13) {
            _this._resizeImg(inputEl);
          } else {
            _this._restoreImg();
          }
          $img = _this.target;
          _this.hide();
          range = document.createRange();
          return _this.button.editor.selection.setRangeAfter($img, range);
        } else if (e.which === 9) {
          return _this.el.data('popover').refresh();
        }
      };
    })(this));
    this.altEl.on('keydown', (function(_this) {
      return function(e) {
        var range;
        if (e.which === 13) {
          e.preventDefault();
          range = document.createRange();
          _this.button.editor.selection.setRangeAfter(_this.target, range);
          return _this.hide();
        }
      };
    })(this));
    this.altEl.on('keyup', (function(_this) {
      return function(e) {
        if (e.which === 13 || e.which === 27 || e.which === 9) {
          return;
        }
        _this.alt = _this.altEl.val();
        return _this.target.attr('alt', _this.alt);
      };
    })(this));
    this.el.find('.btn-restore').on('click', (function(_this) {
      return function(e) {
        _this._restoreImg();
        return _this.el.data('popover').refresh();
      };
    })(this));
    this.editor.on('valuechanged', (function(_this) {
      return function(e) {
        if (_this.active) {
          return _this.refresh();
        }
      };
    })(this));
    return this._initUploader();
  };

  ImagePopover.prototype._initUploader = function() {
    var $uploadBtn, createInput;
    $uploadBtn = this.el.find('.btn-upload');
    if (this.editor.uploader == null) {
      $uploadBtn.remove();
      return;
    }
    createInput = (function(_this) {
      return function() {
        if (_this.input) {
          _this.input.remove();
        }
        return _this.input = $('<input/>', {
          type: 'file',
          title: _this._t('uploadImage'),
          multiple: false,
          accept: 'image/*'
        }).appendTo($uploadBtn);
      };
    })(this);
    createInput();
    this.el.on('click mousedown', 'input[type=file]', function(e) {
      return e.stopPropagation();
    });
    return this.el.on('change', 'input[type=file]', (function(_this) {
      return function(e) {
        _this.editor.uploader.upload(_this.input, {
          inline: true,
          img: _this.target
        });
        return createInput();
      };
    })(this));
  };

  ImagePopover.prototype._resizeImg = function(inputEl, onlySetVal) {
    var height, value, width;
    if (onlySetVal == null) {
      onlySetVal = false;
    }
    value = inputEl.val() * 1;
    if (!(this.target && ($.isNumeric(value) || value < 0))) {
      return;
    }
    if (inputEl.is(this.widthEl)) {
      width = value;
      height = this.height * value / this.width;
      this.heightEl.val(height);
    } else {
      height = value;
      width = this.width * value / this.height;
      this.widthEl.val(width);
    }
    if (!onlySetVal) {
      this.target.attr({
        width: width,
        height: height
      });
      return this.editor.trigger('valuechanged');
    }
  };

  ImagePopover.prototype._restoreImg = function() {
    var ref, size;
    size = ((ref = this.target.data('image-size')) != null ? ref.split(",") : void 0) || [this.width, this.height];
    this.target.attr({
      width: size[0] * 1,
      height: size[1] * 1
    });
    this.widthEl.val(size[0]);
    this.heightEl.val(size[1]);
    return this.editor.trigger('valuechanged');
  };

  ImagePopover.prototype._loadImage = function(src, callback) {
    if (/^data:image/.test(src) && !this.editor.uploader) {
      if (callback) {
        callback(false);
      }
      return;
    }
    if (this.target.attr('src') === src) {
      return;
    }
    return this.button.loadImage(this.target, src, (function(_this) {
      return function(img) {
        var blob;
        if (!img) {
          return;
        }
        if (_this.active) {
          _this.width = img.width;
          _this.height = img.height;
          _this.widthEl.val(_this.width);
          _this.heightEl.val(_this.height);
        }
        if (/^data:image/.test(src)) {
          blob = _this.editor.util.dataURLtoBlob(src);
          blob.name = "Base64 Image.png";
          _this.editor.uploader.upload(blob, {
            inline: true,
            img: _this.target
          });
        } else {
          _this.editor.trigger('valuechanged');
        }
        if (callback) {
          return callback(img);
        }
      };
    })(this));
  };

  ImagePopover.prototype.show = function() {
    var $img, args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    ImagePopover.__super__.show.apply(this, args);
    $img = this.target;
    this.width = $img.width();
    this.height = $img.height();
    this.alt = $img.attr('alt');
    if ($img.hasClass('uploading')) {
      return this.srcEl.val(this._t('uploading')).prop('disabled', true);
    } else {
      this.srcEl.val($img.attr('src')).prop('disabled', false);
      this.widthEl.val(this.width);
      this.heightEl.val(this.height);
      return this.altEl.val(this.alt);
    }
  };

  return ImagePopover;

})(Popover);

Simditor.Toolbar.addButton(ImageButton);

IndentButton = (function(superClass) {
  extend(IndentButton, superClass);

  function IndentButton() {
    return IndentButton.__super__.constructor.apply(this, arguments);
  }

  IndentButton.prototype.name = 'indent';

  IndentButton.prototype.icon = 'indent';

  IndentButton.prototype._init = function() {
    this.title = this._t(this.name) + ' (Tab)';
    return IndentButton.__super__._init.call(this);
  };

  IndentButton.prototype._status = function() {};

  IndentButton.prototype.command = function() {
    return this.editor.indentation.indent();
  };

  return IndentButton;

})(Button);

Simditor.Toolbar.addButton(IndentButton);

OutdentButton = (function(superClass) {
  extend(OutdentButton, superClass);

  function OutdentButton() {
    return OutdentButton.__super__.constructor.apply(this, arguments);
  }

  OutdentButton.prototype.name = 'outdent';

  OutdentButton.prototype.icon = 'outdent';

  OutdentButton.prototype._init = function() {
    this.title = this._t(this.name) + ' (Shift + Tab)';
    return OutdentButton.__super__._init.call(this);
  };

  OutdentButton.prototype._status = function() {};

  OutdentButton.prototype.command = function() {
    return this.editor.indentation.indent(true);
  };

  return OutdentButton;

})(Button);

Simditor.Toolbar.addButton(OutdentButton);

HrButton = (function(superClass) {
  extend(HrButton, superClass);

  function HrButton() {
    return HrButton.__super__.constructor.apply(this, arguments);
  }

  HrButton.prototype.name = 'hr';

  HrButton.prototype.icon = 'minus';

  HrButton.prototype.htmlTag = 'hr';

  HrButton.prototype._status = function() {};

  HrButton.prototype.command = function() {
    var $hr, $newBlock, $nextBlock, $rootBlock;
    $rootBlock = this.editor.selection.rootNodes().first();
    $nextBlock = $rootBlock.next();
    if ($nextBlock.length > 0) {
      this.editor.selection.save();
    } else {
      $newBlock = $('<p/>').append(this.editor.util.phBr);
    }
    $hr = $('<hr/>').insertAfter($rootBlock);
    if ($newBlock) {
      $newBlock.insertAfter($hr);
      this.editor.selection.setRangeAtStartOf($newBlock);
    } else {
      this.editor.selection.restore();
    }
    return this.editor.trigger('valuechanged');
  };

  return HrButton;

})(Button);

Simditor.Toolbar.addButton(HrButton);

TableButton = (function(superClass) {
  extend(TableButton, superClass);

  function TableButton() {
    return TableButton.__super__.constructor.apply(this, arguments);
  }

  TableButton.prototype.name = 'table';

  TableButton.prototype.icon = 'table';

  TableButton.prototype.htmlTag = 'table';

  TableButton.prototype.disableTag = 'pre, li, blockquote';

  TableButton.prototype.menu = true;

  TableButton.prototype._init = function() {
    TableButton.__super__._init.call(this);
    $.merge(this.editor.formatter._allowedTags, ['thead', 'th', 'tbody', 'tr', 'td', 'colgroup', 'col']);
    $.extend(this.editor.formatter._allowedAttributes, {
      td: ['rowspan', 'colspan'],
      col: ['width']
    });
    $.extend(this.editor.formatter._allowedStyles, {
      td: ['text-align'],
      th: ['text-align']
    });
    this._initShortcuts();
    this.editor.on('decorate', (function(_this) {
      return function(e, $el) {
        return $el.find('table').each(function(i, table) {
          return _this.decorate($(table));
        });
      };
    })(this));
    this.editor.on('undecorate', (function(_this) {
      return function(e, $el) {
        return $el.find('table').each(function(i, table) {
          return _this.undecorate($(table));
        });
      };
    })(this));
    this.editor.on('selectionchanged.table', (function(_this) {
      return function(e) {
        var $container, range;
        _this.editor.body.find('.simditor-table td, .simditor-table th').removeClass('active');
        range = _this.editor.selection.range();
        if (!range) {
          return;
        }
        $container = _this.editor.selection.containerNode();
        if (range.collapsed && $container.is('.simditor-table')) {
          if (_this.editor.selection.rangeAtStartOf($container)) {
            $container = $container.find('th:first');
          } else {
            $container = $container.find('td:last');
          }
          _this.editor.selection.setRangeAtEndOf($container);
        }
        return $container.closest('td, th', _this.editor.body).addClass('active');
      };
    })(this));
    this.editor.on('blur.table', (function(_this) {
      return function(e) {
        return _this.editor.body.find('.simditor-table td, .simditor-table th').removeClass('active');
      };
    })(this));
    this.editor.keystroke.add('up', 'td', (function(_this) {
      return function(e, $node) {
        _this._tdNav($node, 'up');
        return true;
      };
    })(this));
    this.editor.keystroke.add('up', 'th', (function(_this) {
      return function(e, $node) {
        _this._tdNav($node, 'up');
        return true;
      };
    })(this));
    this.editor.keystroke.add('down', 'td', (function(_this) {
      return function(e, $node) {
        _this._tdNav($node, 'down');
        return true;
      };
    })(this));
    return this.editor.keystroke.add('down', 'th', (function(_this) {
      return function(e, $node) {
        _this._tdNav($node, 'down');
        return true;
      };
    })(this));
  };

  TableButton.prototype._tdNav = function($td, direction) {
    var $anotherTr, $tr, action, anotherTag, index, parentTag, ref;
    if (direction == null) {
      direction = 'up';
    }
    action = direction === 'up' ? 'prev' : 'next';
    ref = direction === 'up' ? ['tbody', 'thead'] : ['thead', 'tbody'], parentTag = ref[0], anotherTag = ref[1];
    $tr = $td.parent('tr');
    $anotherTr = this["_" + action + "Row"]($tr);
    if (!($anotherTr.length > 0)) {
      return true;
    }
    index = $tr.find('td, th').index($td);
    return this.editor.selection.setRangeAtEndOf($anotherTr.find('td, th').eq(index));
  };

  TableButton.prototype._nextRow = function($tr) {
    var $nextTr;
    $nextTr = $tr.next('tr');
    if ($nextTr.length < 1 && $tr.parent('thead').length > 0) {
      $nextTr = $tr.parent('thead').next('tbody').find('tr:first');
    }
    return $nextTr;
  };

  TableButton.prototype._prevRow = function($tr) {
    var $prevTr;
    $prevTr = $tr.prev('tr');
    if ($prevTr.length < 1 && $tr.parent('tbody').length > 0) {
      $prevTr = $tr.parent('tbody').prev('thead').find('tr');
    }
    return $prevTr;
  };

  TableButton.prototype.initResize = function($table) {
    var $colgroup, $resizeHandle, $wrapper, editor;
    $wrapper = $table.parent('.simditor-table');
    $colgroup = $table.find('colgroup');
    if ($colgroup.length < 1) {
      $colgroup = $('<colgroup/>').prependTo($table);
      $table.find('thead tr th').each(function(i, td) {
        var $col;
        return $col = $('<col/>').appendTo($colgroup);
      });
      this.refreshTableWidth($table);
    }
    $resizeHandle = $('<div />', {
      "class": 'simditor-resize-handle',
      contenteditable: 'false'
    }).appendTo($wrapper);
    editor = this.editor;
    $wrapper.on('mousemove', 'td, th', function(e) {
      var $col, $td, index, ref, ref1, x;
      if ($wrapper.hasClass('resizing')) {
        return;
      }
      $td = $(e.currentTarget);
      x = e.pageX - $(e.currentTarget).offset().left;
      if (x < 5 && $td.prev().length > 0) {
        $td = $td.prev();
      }
      if ($td.next('td, th').length < 1) {
        $resizeHandle.hide();
        return;
      }
      if ((ref = $resizeHandle.data('td')) != null ? ref.is($td) : void 0) {
        $resizeHandle.show();
        return;
      }
      index = $td.parent().find('td, th').index($td);
      $col = $colgroup.find('col').eq(index);
      if ((ref1 = $resizeHandle.data('col')) != null ? ref1.is($col) : void 0) {
        $resizeHandle.show();
        return;
      }
      return $resizeHandle.css('left', $td.position().left + $td.outerWidth() - 5).data('td', $td).data('col', $col).show();
    });
    $wrapper.on('mouseleave', function(e) {
      return $resizeHandle.hide();
    });
    return $wrapper.on('mousedown', '.simditor-resize-handle', function(e) {
      var $handle, $leftCol, $leftTd, $rightCol, $rightTd, minWidth, startHandleLeft, startLeftWidth, startRightWidth, startX, tableWidth;
      $handle = $(e.currentTarget);
      $leftTd = $handle.data('td');
      $leftCol = $handle.data('col');
      $rightTd = $leftTd.next('td, th');
      $rightCol = $leftCol.next('col');
      startX = e.pageX;
      startLeftWidth = $leftTd.outerWidth() * 1;
      startRightWidth = $rightTd.outerWidth() * 1;
      startHandleLeft = parseFloat($handle.css('left'));
      tableWidth = $leftTd.closest('table').width();
      minWidth = 50;
      $(document).on('mousemove.simditor-resize-table', function(e) {
        var deltaX, leftWidth, rightWidth;
        deltaX = e.pageX - startX;
        leftWidth = startLeftWidth + deltaX;
        rightWidth = startRightWidth - deltaX;
        if (leftWidth < minWidth) {
          leftWidth = minWidth;
          deltaX = minWidth - startLeftWidth;
          rightWidth = startRightWidth - deltaX;
        } else if (rightWidth < minWidth) {
          rightWidth = minWidth;
          deltaX = startRightWidth - minWidth;
          leftWidth = startLeftWidth + deltaX;
        }
        $leftCol.attr('width', (leftWidth / tableWidth * 100) + '%');
        $rightCol.attr('width', (rightWidth / tableWidth * 100) + '%');
        return $handle.css('left', startHandleLeft + deltaX);
      });
      $(document).one('mouseup.simditor-resize-table', function(e) {
        $(document).off('.simditor-resize-table');
        $wrapper.removeClass('resizing');
        return editor.trigger('valuechanged');
      });
      $wrapper.addClass('resizing');
      return false;
    });
  };

  TableButton.prototype._initShortcuts = function() {
    this.editor.hotkeys.add('ctrl+alt+up', (function(_this) {
      return function(e) {
        _this.editMenu.find('.menu-item[data-param=insertRowAbove]').click();
        return false;
      };
    })(this));
    this.editor.hotkeys.add('ctrl+alt+down', (function(_this) {
      return function(e) {
        _this.editMenu.find('.menu-item[data-param=insertRowBelow]').click();
        return false;
      };
    })(this));
    this.editor.hotkeys.add('ctrl+alt+left', (function(_this) {
      return function(e) {
        _this.editMenu.find('.menu-item[data-param=insertColLeft]').click();
        return false;
      };
    })(this));
    return this.editor.hotkeys.add('ctrl+alt+right', (function(_this) {
      return function(e) {
        _this.editMenu.find('.menu-item[data-param=insertColRight]').click();
        return false;
      };
    })(this));
  };

  TableButton.prototype.decorate = function($table) {
    var $headRow, $tbody, $thead;
    if ($table.parent('.simditor-table').length > 0) {
      this.undecorate($table);
    }
    $table.wrap('<div class="simditor-table"></div>');
    if ($table.find('thead').length < 1) {
      $thead = $('<thead />');
      $headRow = $table.find('tr').first();
      $thead.append($headRow);
      this._changeCellTag($headRow, 'th');
      $tbody = $table.find('tbody');
      if ($tbody.length > 0) {
        $tbody.before($thead);
      } else {
        $table.prepend($thead);
      }
    }
    this.initResize($table);
    return $table.parent();
  };

  TableButton.prototype.undecorate = function($table) {
    if (!($table.parent('.simditor-table').length > 0)) {
      return;
    }
    return $table.parent().replaceWith($table);
  };

  TableButton.prototype.renderMenu = function() {
    var $table;
    $("<div class=\"menu-create-table\">\n</div>\n<div class=\"menu-edit-table\">\n  <ul>\n    <li>\n      <a tabindex=\"-1\" unselectable=\"on\" class=\"menu-item\"\n        href=\"javascript:;\" data-param=\"deleteRow\">\n        <span>" + (this._t('deleteRow')) + "</span>\n      </a>\n    </li>\n    <li>\n      <a tabindex=\"-1\" unselectable=\"on\" class=\"menu-item\"\n        href=\"javascript:;\" data-param=\"insertRowAbove\">\n        <span>" + (this._t('insertRowAbove')) + " ( Ctrl + Alt + ↑ )</span>\n      </a>\n    </li>\n    <li>\n      <a tabindex=\"-1\" unselectable=\"on\" class=\"menu-item\"\n        href=\"javascript:;\" data-param=\"insertRowBelow\">\n        <span>" + (this._t('insertRowBelow')) + " ( Ctrl + Alt + ↓ )</span>\n      </a>\n    </li>\n    <li><span class=\"separator\"></span></li>\n    <li>\n      <a tabindex=\"-1\" unselectable=\"on\" class=\"menu-item\"\n        href=\"javascript:;\" data-param=\"deleteCol\">\n        <span>" + (this._t('deleteColumn')) + "</span>\n      </a>\n    </li>\n    <li>\n      <a tabindex=\"-1\" unselectable=\"on\" class=\"menu-item\"\n        href=\"javascript:;\" data-param=\"insertColLeft\">\n        <span>" + (this._t('insertColumnLeft')) + " ( Ctrl + Alt + ← )</span>\n      </a>\n    </li>\n    <li>\n      <a tabindex=\"-1\" unselectable=\"on\" class=\"menu-item\"\n        href=\"javascript:;\" data-param=\"insertColRight\">\n        <span>" + (this._t('insertColumnRight')) + " ( Ctrl + Alt + → )</span>\n      </a>\n    </li>\n    <li><span class=\"separator\"></span></li>\n    <li>\n      <a tabindex=\"-1\" unselectable=\"on\" class=\"menu-item\"\n        href=\"javascript:;\" data-param=\"deleteTable\">\n        <span>" + (this._t('deleteTable')) + "</span>\n      </a>\n    </li>\n  </ul>\n</div>").appendTo(this.menuWrapper);
    this.createMenu = this.menuWrapper.find('.menu-create-table');
    this.editMenu = this.menuWrapper.find('.menu-edit-table');
    $table = this.createTable(6, 6).appendTo(this.createMenu);
    this.createMenu.on('mouseenter', 'td, th', (function(_this) {
      return function(e) {
        var $td, $tr, $trs, num;
        _this.createMenu.find('td, th').removeClass('selected');
        $td = $(e.currentTarget);
        $tr = $td.parent();
        num = $tr.find('td, th').index($td) + 1;
        $trs = $tr.prevAll('tr').addBack();
        if ($tr.parent().is('tbody')) {
          $trs = $trs.add($table.find('thead tr'));
        }
        return $trs.find("td:lt(" + num + "), th:lt(" + num + ")").addClass('selected');
      };
    })(this));
    this.createMenu.on('mouseleave', function(e) {
      return $(e.currentTarget).find('td, th').removeClass('selected');
    });
    return this.createMenu.on('mousedown', 'td, th', (function(_this) {
      return function(e) {
        var $closestBlock, $td, $tr, colNum, rowNum;
        _this.wrapper.removeClass('menu-on');
        if (!_this.editor.inputManager.focused) {
          return;
        }
        $td = $(e.currentTarget);
        $tr = $td.parent();
        colNum = $tr.find('td').index($td) + 1;
        rowNum = $tr.prevAll('tr').length + 1;
        if ($tr.parent().is('tbody')) {
          rowNum += 1;
        }
        $table = _this.createTable(rowNum, colNum, true);
        $closestBlock = _this.editor.selection.blockNodes().last();
        if (_this.editor.util.isEmptyNode($closestBlock)) {
          $closestBlock.replaceWith($table);
        } else {
          $closestBlock.after($table);
        }
        _this.decorate($table);
        _this.editor.selection.setRangeAtStartOf($table.find('th:first'));
        _this.editor.trigger('valuechanged');
        return false;
      };
    })(this));
  };

  TableButton.prototype.createTable = function(row, col, phBr) {
    var $table, $tbody, $td, $thead, $tr, c, r, ref, ref1, w, y;
    $table = $('<table/>');
    $thead = $('<thead/>').appendTo($table);
    $tbody = $('<tbody/>').appendTo($table);
    for (r = w = 0, ref = row; 0 <= ref ? w < ref : w > ref; r = 0 <= ref ? ++w : --w) {
      $tr = $('<tr/>');
      $tr.appendTo(r === 0 ? $thead : $tbody);
      for (c = y = 0, ref1 = col; 0 <= ref1 ? y < ref1 : y > ref1; c = 0 <= ref1 ? ++y : --y) {
        $td = $(r === 0 ? '<th/>' : '<td/>').appendTo($tr);
        if (phBr) {
          $td.append(this.editor.util.phBr);
        }
      }
    }
    return $table;
  };

  TableButton.prototype.refreshTableWidth = function($table) {
    var cols, tableWidth;
    tableWidth = $table.width();
    cols = $table.find('col');
    return $table.find('thead tr th').each(function(i, td) {
      var $col;
      $col = cols.eq(i);
      return $col.attr('width', ($(td).outerWidth() / tableWidth * 100) + '%');
    });
  };

  TableButton.prototype.setActive = function(active) {
    TableButton.__super__.setActive.call(this, active);
    if (active) {
      this.createMenu.hide();
      return this.editMenu.show();
    } else {
      this.createMenu.show();
      return this.editMenu.hide();
    }
  };

  TableButton.prototype._changeCellTag = function($tr, tagName) {
    return $tr.find('td, th').each(function(i, cell) {
      var $cell;
      $cell = $(cell);
      return $cell.replaceWith("<" + tagName + ">" + ($cell.html()) + "</" + tagName + ">");
    });
  };

  TableButton.prototype.deleteRow = function($td) {
    var $newTr, $tr, index;
    $tr = $td.parent('tr');
    if ($tr.closest('table').find('tr').length < 1) {
      return this.deleteTable($td);
    } else {
      $newTr = this._nextRow($tr);
      if (!($newTr.length > 0)) {
        $newTr = this._prevRow($tr);
      }
      index = $tr.find('td, th').index($td);
      if ($tr.parent().is('thead')) {
        $newTr.appendTo($tr.parent());
        this._changeCellTag($newTr, 'th');
      }
      $tr.remove();
      return this.editor.selection.setRangeAtEndOf($newTr.find('td, th').eq(index));
    }
  };

  TableButton.prototype.insertRow = function($td, direction) {
    var $newTr, $table, $tr, cellTag, colNum, i, index, ref, w;
    if (direction == null) {
      direction = 'after';
    }
    $tr = $td.parent('tr');
    $table = $tr.closest('table');
    colNum = 0;
    $table.find('tr').each(function(i, tr) {
      return colNum = Math.max(colNum, $(tr).find('td').length);
    });
    index = $tr.find('td, th').index($td);
    $newTr = $('<tr/>');
    cellTag = 'td';
    if (direction === 'after' && $tr.parent().is('thead')) {
      $tr.parent().next('tbody').prepend($newTr);
    } else if (direction === 'before' && $tr.parent().is('thead')) {
      $tr.before($newTr);
      $tr.parent().next('tbody').prepend($tr);
      this._changeCellTag($tr, 'td');
      cellTag = 'th';
    } else {
      $tr[direction]($newTr);
    }
    for (i = w = 1, ref = colNum; 1 <= ref ? w <= ref : w >= ref; i = 1 <= ref ? ++w : --w) {
      $("<" + cellTag + "/>").append(this.editor.util.phBr).appendTo($newTr);
    }
    return this.editor.selection.setRangeAtStartOf($newTr.find('td, th').eq(index));
  };

  TableButton.prototype.deleteCol = function($td) {
    var $newTd, $table, $tr, index, noOtherCol, noOtherRow;
    $tr = $td.parent('tr');
    noOtherRow = $tr.closest('table').find('tr').length < 2;
    noOtherCol = $td.siblings('td, th').length < 1;
    if (noOtherRow && noOtherCol) {
      return this.deleteTable($td);
    } else {
      index = $tr.find('td, th').index($td);
      $newTd = $td.next('td, th');
      if (!($newTd.length > 0)) {
        $newTd = $tr.prev('td, th');
      }
      $table = $tr.closest('table');
      $table.find('col').eq(index).remove();
      $table.find('tr').each(function(i, tr) {
        return $(tr).find('td, th').eq(index).remove();
      });
      this.refreshTableWidth($table);
      return this.editor.selection.setRangeAtEndOf($newTd);
    }
  };

  TableButton.prototype.insertCol = function($td, direction) {
    var $col, $newCol, $newTd, $table, $tr, index, tableWidth, width;
    if (direction == null) {
      direction = 'after';
    }
    $tr = $td.parent('tr');
    index = $tr.find('td, th').index($td);
    $table = $td.closest('table');
    $col = $table.find('col').eq(index);
    $table.find('tr').each((function(_this) {
      return function(i, tr) {
        var $newTd, cellTag;
        cellTag = $(tr).parent().is('thead') ? 'th' : 'td';
        $newTd = $("<" + cellTag + "/>").append(_this.editor.util.phBr);
        return $(tr).find('td, th').eq(index)[direction]($newTd);
      };
    })(this));
    $newCol = $('<col/>');
    $col[direction]($newCol);
    tableWidth = $table.width();
    width = Math.max(parseFloat($col.attr('width')) / 2, 50 / tableWidth * 100);
    $col.attr('width', width + '%');
    $newCol.attr('width', width + '%');
    this.refreshTableWidth($table);
    $newTd = direction === 'after' ? $td.next('td, th') : $td.prev('td, th');
    return this.editor.selection.setRangeAtStartOf($newTd);
  };

  TableButton.prototype.deleteTable = function($td) {
    var $block, $table;
    $table = $td.closest('.simditor-table');
    $block = $table.next('p');
    $table.remove();
    if ($block.length > 0) {
      return this.editor.selection.setRangeAtStartOf($block);
    }
  };

  TableButton.prototype.command = function(param) {
    var $td;
    $td = this.editor.selection.containerNode().closest('td, th');
    if (!($td.length > 0)) {
      return;
    }
    if (param === 'deleteRow') {
      this.deleteRow($td);
    } else if (param === 'insertRowAbove') {
      this.insertRow($td, 'before');
    } else if (param === 'insertRowBelow') {
      this.insertRow($td);
    } else if (param === 'deleteCol') {
      this.deleteCol($td);
    } else if (param === 'insertColLeft') {
      this.insertCol($td, 'before');
    } else if (param === 'insertColRight') {
      this.insertCol($td);
    } else if (param === 'deleteTable') {
      this.deleteTable($td);
    } else {
      return;
    }
    return this.editor.trigger('valuechanged');
  };

  return TableButton;

})(Button);

Simditor.Toolbar.addButton(TableButton);

StrikethroughButton = (function(superClass) {
  extend(StrikethroughButton, superClass);

  function StrikethroughButton() {
    return StrikethroughButton.__super__.constructor.apply(this, arguments);
  }

  StrikethroughButton.prototype.name = 'strikethrough';

  StrikethroughButton.prototype.icon = 'strikethrough';

  StrikethroughButton.prototype.htmlTag = 'strike';

  StrikethroughButton.prototype.disableTag = 'pre';

  StrikethroughButton.prototype._activeStatus = function() {
    var active;
    active = document.queryCommandState('strikethrough') === true;
    this.setActive(active);
    return this.active;
  };

  StrikethroughButton.prototype.command = function() {
    document.execCommand('strikethrough');
    if (!this.editor.util.support.oninput) {
      this.editor.trigger('valuechanged');
    }
    return $(document).trigger('selectionchange');
  };

  return StrikethroughButton;

})(Button);

Simditor.Toolbar.addButton(StrikethroughButton);

AlignmentButton = (function(superClass) {
  extend(AlignmentButton, superClass);

  function AlignmentButton() {
    return AlignmentButton.__super__.constructor.apply(this, arguments);
  }

  AlignmentButton.prototype.name = "alignment";

  AlignmentButton.prototype.icon = 'align-left';

  AlignmentButton.prototype.htmlTag = 'p, h1, h2, h3, h4, td, th';

  AlignmentButton.prototype._init = function() {
    this.menu = [
      {
        name: 'left',
        text: this._t('alignLeft'),
        icon: 'align-left',
        param: 'left'
      }, {
        name: 'center',
        text: this._t('alignCenter'),
        icon: 'align-center',
        param: 'center'
      }, {
        name: 'right',
        text: this._t('alignRight'),
        icon: 'align-right',
        param: 'right'
      }
    ];
    return AlignmentButton.__super__._init.call(this);
  };

  AlignmentButton.prototype.setActive = function(active, align) {
    if (align == null) {
      align = 'left';
    }
    if (align !== 'left' && align !== 'center' && align !== 'right') {
      align = 'left';
    }
    if (align === 'left') {
      AlignmentButton.__super__.setActive.call(this, false);
    } else {
      AlignmentButton.__super__.setActive.call(this, active);
    }
    this.el.removeClass('align-left align-center align-right');
    if (active) {
      this.el.addClass('align-' + align);
    }
    this.setIcon('align-' + align);
    return this.menuEl.find('.menu-item').show().end().find('.menu-item-' + align).hide();
  };

  AlignmentButton.prototype._status = function() {
    this.nodes = this.editor.selection.nodes().filter(this.htmlTag);
    if (this.nodes.length < 1) {
      this.setDisabled(true);
      return this.setActive(false);
    } else {
      this.setDisabled(false);
      return this.setActive(true, this.nodes.first().css('text-align'));
    }
  };

  AlignmentButton.prototype.command = function(align) {
    if (align !== 'left' && align !== 'center' && align !== 'right') {
      throw new Error("simditor alignment button: invalid align " + align);
    }
    this.nodes.css({
      'text-align': align === 'left' ? '' : align
    });
    this.editor.trigger('valuechanged');
    return this.editor.inputManager.throttledSelectionChanged();
  };

  return AlignmentButton;

})(Button);

Simditor.Toolbar.addButton(AlignmentButton);

UndoButton = (function(superClass) {
  extend(UndoButton, superClass);

  function UndoButton() {
    return UndoButton.__super__.constructor.apply(this, arguments);
  }

  UndoButton.prototype.name = 'undo';

  UndoButton.prototype.icon = 'simditor-r-icon-undo';

  UndoButton.prototype._init = function() {
    if (this.editor.util.os.mac) {
      this.title = this.title + ' ( Cmd + z )';
    } else {
      this.title = this.title + ' ( Ctrl + z )';
    }
    return UndoButton.__super__._init.call(this);
  };

  UndoButton.prototype.command = function() {
    return this.editor.undoManager.undo();
  };

  return UndoButton;

})(Button);

Simditor.Toolbar.addButton(UndoButton);

UndoButton = (function(superClass) {
  extend(UndoButton, superClass);

  function UndoButton() {
    return UndoButton.__super__.constructor.apply(this, arguments);
  }

  UndoButton.prototype.name = 'redo';

  UndoButton.prototype.icon = 'simditor-r-icon-redo';

  UndoButton.prototype._init = function() {
    if (this.editor.util.os.mac) {
      this.title = this.title + ' ( Cmd + y )';
    } else {
      this.title = this.title + ' ( Ctrl + y )';
    }
    return UndoButton.__super__._init.call(this);
  };

  UndoButton.prototype.command = function() {
    return this.editor.undoManager.redo();
  };

  return UndoButton;

})(Button);

Simditor.Toolbar.addButton(UndoButton);

FormatPaintButton = (function(superClass) {
  extend(FormatPaintButton, superClass);

  function FormatPaintButton() {
    return FormatPaintButton.__super__.constructor.apply(this, arguments);
  }

  FormatPaintButton.prototype.name = 'formatPaint';

  FormatPaintButton.prototype.icon = 'simditor-r-icon-format_paint';

  FormatPaintButton.prototype.disableTag = 'pre,table';

  FormatPaintButton.prototype.commandList = ['color', 'font-family', 'font-size', 'font-style', 'font-variant', 'font-weight', 'text-decoration', 'background-image', 'background-position', 'background-repeat', 'background-attachment'];

  FormatPaintButton.prototype.attrList = ['class', 'style', 'size', 'color', 'face'];

  FormatPaintButton.prototype.tagList = ['p', 'b', 'i', 'u', 'strike', 'h1', 'h2', 'h3', 'h4', 'h5'];

  FormatPaintButton.prototype._format = {};

  FormatPaintButton.prototype._init = function() {
    FormatPaintButton.__super__._init.call(this);
    return this.editor.on('blur', (function(_this) {
      return function(e) {
        return _this._removeEvent();
      };
    })(this));
  };

  FormatPaintButton.prototype._getSelectedElement = function() {
    var $startNodes;
    return $startNodes = this.editor.selection.startNodes();
  };

  FormatPaintButton.prototype._getComputedStyle = function($node) {
    var _computedStyle, computedStyles, node;
    node = $node[0];
    if (node.nodeName === '#text') {
      node = $(node).parent()[0];
    }
    _computedStyle = window.getComputedStyle(node, null);
    computedStyles = {};
    this.commandList.forEach(function(style) {
      return computedStyles[style] = _computedStyle.getPropertyValue(style);
    });
    return computedStyles;
  };

  FormatPaintButton.prototype._getEleAttr = function($node) {
    var list;
    $node = $node.filter(this.tagList.join(','));
    list = [];
    $node.each((function(_this) {
      return function(i, node) {
        var eleAttr;
        eleAttr = {
          nodeName: node.nodeName
        };
        _this.attrList.forEach(function(attr) {
          var value;
          value = node.getAttribute(attr) || '';
          if (value) {
            return eleAttr[attr] = value;
          }
        });
        return list.push(eleAttr);
      };
    })(this));
    return list;
  };

  FormatPaintButton.prototype._formatPainterApply = function() {
    var formatPainterCommand, options, settings, stripCommand, stripCondition;
    stripCondition = (function(_this) {
      return function(node) {
        if (_this.editor.util.isTag(node, 'a')) {
          return false;
        }
        return !_this.editor.util.isTextNode(node) && !_this.editor.util.isBlockNode(node) && _this.editor.util.canHaveChildren(node);
      };
    })(this);
    stripCommand = new Simditor.StripElementCommand(this.editor, {
      stripCondition: stripCondition
    });
    stripCommand.onExecute();
    settings = {
      formatting: this._format
    };
    options = {
      title: "Apply Format"
    };
    formatPainterCommand = new Simditor.FormatPainterCommand(this.editor, settings, options);
    return formatPainterCommand.onExecute();
  };

  FormatPaintButton.prototype._registerEvent = function() {
    this._mousedown = false;
    this._mouseup = false;
    this.editor.body.one('mousedown.format_paint', (function(_this) {
      return function(e) {
        return _this._mousedown = true;
      };
    })(this));
    return this.editor.body.one('mouseup.format_paint', (function(_this) {
      return function(e) {
        _this._mouseup = true;
        if (_this._mousedown) {
          _this._formatPainterApply();
        }
        return _this.editor.body.removeClass('simditor-on-format-paint');
      };
    })(this));
  };

  FormatPaintButton.prototype._removeEvent = function() {
    this.editor.body.off('mousedown.format_paint');
    this.editor.body.off('mouseup.format_paint');
    return this.editor.body.removeClass('simditor-on-format-paint');
  };

  FormatPaintButton.prototype._shouldCleanUpNode = function() {};

  FormatPaintButton.prototype.command = function() {
    var $node;
    this._removeEvent();
    $node = this._getSelectedElement();
    if (!($node && $node.length > 0)) {
      return;
    }
    this._format.computedStyles = this._getComputedStyle($node);
    this._format.elements = this._getEleAttr($node);
    this.editor.body.addClass('simditor-on-format-paint');
    return this._registerEvent();
  };

  return FormatPaintButton;

})(Button);

Simditor.Toolbar.addButton(FormatPaintButton);

AttachButton = (function(superClass) {
  extend(AttachButton, superClass);

  function AttachButton() {
    return AttachButton.__super__.constructor.apply(this, arguments);
  }

  AttachButton.prototype.name = 'attach';

  AttachButton.prototype.icon = 'simditor-r-icon-attachment';

  AttachButton.prototype.disableTag = 'pre, table';

  AttachButton.prototype.needFocus = false;

  AttachButton.prototype.render = function() {
    var args, uploadOpts;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    AttachButton.__super__.render.apply(this, args);
    if (this.editor.opts.upload && simpleUploader) {
      uploadOpts = typeof this.editor.opts.upload === 'object' ? this.editor.opts.upload : {};
      this.uploader = simpleUploader(uploadOpts);
    } else {
      this.uploader = simpleUploader({});
    }
    this.input = null;
    return this._initUploader();
  };

  AttachButton.prototype.createInput = function() {
    if (this.input) {
      this.input.remove();
    }
    return this.input = $('<input/>', {
      type: 'file',
      title: this._t('uploadImage'),
      multiple: false,
      accept: '*/*'
    }).appendTo(this.el);
  };

  AttachButton.prototype._initUploader = function() {
    var uploadProgress;
    if (this.uploader == null) {
      return;
    }
    this.createInput();
    this.el.on('change', 'input[type=file]', (function(_this) {
      return function(e) {
        if (_this.editor.inputManager.focused) {
          _this.uploader.upload(_this.input, {
            inline: true
          });
          return _this.createInput();
        } else {
          _this.editor.focus();
          _this.uploader.upload(_this.input, {
            inline: true
          });
          return _this.createInput();
        }
      };
    })(this));
    uploadProgress = $.proxy(this.editor.util.throttle(function(e, file, loaded, total) {
      var $attach, percent;
      if (!file.inline) {
        return;
      }
      $attach = file.attach;
      percent = loaded / total;
      percent = (percent * 100).toFixed(0);
      return $attach.find('[data-progress] span').width(percent + "%");
    }, 500), this);
    this.uploader.on('uploadprogress', uploadProgress);
    this.uploader.on('beforeupload', (function(_this) {
      return function(e, file) {
        if (!file.inline) {
          return;
        }
        return file.attach = _this.createAttach(file);
      };
    })(this));
    this.uploader.on('uploadsuccess', (function(_this) {
      return function(e, file, result) {
        var $attach;
        if (!file.inline) {
          return;
        }
        $attach = file.attach;
        if (typeof result !== 'object') {
          try {
            result = $.parseJSON(result);
          } catch (_error) {
            e = _error;
            result = {
              success: false
            };
          }
        }
        if (result.success) {
          if (result.ALY === true) {
            return $.ajax({
              url: _this.editor.opts.upload.GET_FILE_FROM_ALI,
              type: 'post',
              data: {
                fileName: file.name,
                filePath: result.key
              },
              success: function(data) {
                var FileUtil, _data, html;
                _data = {
                  file: data
                };
                _data.bucket = 'rishiqing-file';
                if (_this.editor.opts.upload && _this.editor.opts.upload.FileUtil) {
                  FileUtil = _this.editor.opts.upload.FileUtil;
                  _data.previewFile = FileUtil.isPreviewFile(data.name);
                  _data.framePreviewFile = FileUtil.isFramePreviewFile(data.name);
                  _data.viewPath = _data.framePreviewFile ? FileUtil.getFramePreviewFileUrl(data.realPath, data.name) : data.realPath;
                }
                html = UnSelectionBlock.getAttachHtml(_data);
                $attach.replaceWith(html);
                return _this.editor.trigger('valuechanged');
              },
              error: function() {}
            });
          }
        }
      };
    })(this));
    return this.uploader.on('uploaderror', (function(_this) {
      return function(e, file, xhr) {
        if (!file.inline) {
          return;
        }
        if (xhr.statusText === 'abort') {
          return;
        }
        if (xhr.statusCode === 403) {

        }
      };
    })(this));
  };

  AttachButton.prototype.setDisabled = function(disabled) {
    AttachButton.__super__.setDisabled.call(this, disabled);
    if (this.input) {
      return this.input.prop('disabled', disabled);
    }
  };

  AttachButton.prototype.createAttach = function(file) {
    var $newLine, $totalWrap, $wrapper, range, rootNode;
    if (!this.editor.inputManager.focused) {
      this.editor.focus();
    }
    range = this.editor.selection.range();
    range.deleteContents();
    this.editor.selection.range(range);
    $newLine = $('<p><br></p>');
    rootNode = this.editor.selection.rootNodes().last();
    $totalWrap = null;
    if (rootNode.is('p') && this.editor.util.isEmptyNode(rootNode)) {
      $wrapper = Simditor.UnSelectionBlock.getAttachUploaderHtml({
        file: file
      }, rootNode);
      $totalWrap = rootNode;
    } else {
      $wrapper = Simditor.UnSelectionBlock.getAttachUploaderHtml({
        file: file
      });
      rootNode.after($wrapper);
      $totalWrap = $wrapper;
    }
    $totalWrap.after($newLine);
    this.editor.selection.setRangeAtStartOf($newLine, range);
    this.editor.trigger('valuechanged');
    return $totalWrap;
  };

  return AttachButton;

})(Button);

Simditor.Toolbar.addButton(AttachButton);

CommandBase = (function(superClass) {
  extend(CommandBase, superClass);

  function CommandBase(title, canUnexecute, editor) {
    this._title = title;
    this._isExecuted = false;
    this._canUnexecute = canUnexecute !== false;
    this._editor = editor;
  }

  CommandBase.prototype.get_editor = function() {
    return this._editor;
  };

  return CommandBase;

})(SimpleModule);

InlineCommand = (function(superClass) {
  extend(InlineCommand, superClass);

  InlineCommand.prototype.markerClass = "__telerik_marker";

  InlineCommand.prototype.lineBreakCode = 8203;

  InlineCommand.prototype.settings = {};

  InlineCommand.prototype.options = {
    title: "Inline command",
    canUnexecute: false
  };

  InlineCommand.prototype.c = function(node) {
    var util;
    util = this.get_editor().util;
    return this.d(node) || (util.isTextNode(node) && util.isTextNodeEmpty(node) && (/\n|\r/.test(node.nodeValue) || (node.previousSibling && !this.d(node.previousSibling)) || (node.nextSibling && !this.d(node.nextSibling))));
  };

  InlineCommand.prototype.d = function(node) {
    return node && node.className === this.markerClass;
  };

  function InlineCommand(editor, settings, options) {
    this.settings = settings || {};
    this.options = $.extend(this.options, options || {});
    InlineCommand.__super__.constructor.call(this, this.options.title, this.options.canUnexecute, editor);
  }

  InlineCommand.prototype.onExecute = function() {
    var error;
    try {
      return this.executeInlineCommand();
    } catch (_error) {
      error = _error;
    }
  };

  InlineCommand.prototype.executeInlineCommand = function() {
    var boundary, editor, fragments, state;
    editor = this.get_editor();
    this.range = this.getEditorRange();
    this.collapsedRange = this.range.collapsed;
    state = this.getState();
    if (this.collapsedRange && this.isGreedy()) {
      boundary = this.getWordBoundaries(this.range.startContainer, this.range.startOffset);
      this.range.setStart(this.range.startContainer, boundary.left);
      this.range.setEnd(this.range.startContainer, boundary.right);
      this.range.select();
      this.collapsedRange = this.range.collapsed;
    }
    fragments = this.traverseFragments(this.range);
    if (this.range) {
      this.emptyRange = this.range.toString() === "";
    } else {
      this.emptyRange = true;
    }
    this.storeRangeByFragments(fragments);
    this.rangeChanged = false;
    this.removeFormatting = this.shouldRemoveFormatting(state);
    if (this.removeFormatting) {
      this.removeFormat(fragments);
    } else {
      this.formatFragments(fragments);
    }
    this.consolidate();
    if (!this.rangeChanged) {
      this.restoreRange();
    }
    if (!this.removeFormatting) {
      return editor.trigger('valuechanged');
    }
  };

  InlineCommand.prototype.isGreedy = function() {
    return !this.settings.isNotGreedy;
  };

  InlineCommand.prototype.getWordBoundaries = function(startContainer, startOffset) {
    var boundary, left, nodeValue, right;
    boundary = {
      left: -1,
      right: 1
    };
    nodeValue = startContainer.nodeValue;
    if (!nodeValue || this.isCharEmptyOrWhiteSpace(nodeValue.charAt(startOffset)) || this.isCharEmptyOrWhiteSpace(nodeValue.charAt(startOffset - 1))) {
      return {
        right: startOffset,
        left: startOffset
      };
    }
    left = this.getBoundary(startOffset, nodeValue, boundary.left);
    right = this.getBoundary(startOffset, nodeValue, boundary.right);
    return {
      right: right,
      left: left
    };
  };

  InlineCommand.prototype.getBoundary = function(startOffset, nodeValue, boundary) {
    var j, l, ref;
    l = startOffset <= 0 || startOffset >= nodeValue.length;
    if (nodeValue.charAt(startOffset) === " ") {
      j = (ref = boundary < 0) != null ? ref : {
        1: 0
      };
      return startOffset + j;
    }
    if (l) {
      return startOffset;
    }
    startOffset += boundary;
    return this.getBoundary(startOffset, nodeValue, boundary);
  };

  InlineCommand.prototype.isCharEmptyOrWhiteSpace = function(char) {
    if (!char) {
      return true;
    }
    return /\s/g.test(char) || char.charCodeAt(0) === this.lineBreakCode;
  };

  InlineCommand.prototype.traverseFragments = function(range) {
    var rangeFragmentsTraverse;
    range = range || this.range;
    rangeFragmentsTraverse = new Simditor.RangeFragmentsTraverser(this.get_editor(), range);
    rangeFragmentsTraverse.traverseFragments(this.traverseCondition.bind(this));
    return rangeFragmentsTraverse.traversedFragments;
  };

  InlineCommand.prototype.traverseCondition = function(node) {
    return this.shouldCollectNode(node);
  };

  InlineCommand.prototype.shouldCollectNode = function(node) {
    return Simditor.FragmentsCondition.isInlineNode(node) && !Simditor.CommandUtil._isContentAreaLastBr(node) && !Simditor.CommandUtil.isWhitespaceBetweenTableCells(node) && !Simditor.CommandUtil.isPreContent(node) && !Simditor.CommandUtil.isTableContent(node) && !Simditor.CommandUtil.isMentionContent(node);
  };

  InlineCommand.prototype.consolidate = function(domRange) {
    var area, consolidator;
    consolidator = new Simditor.Consolidator(this.get_editor());
    area = this.getContentElement();
    consolidator.consolidateMarkedEdges(area);
    if (domRange) {
      return consolidator.normalize(domRange.commonAncestorContainer);
    } else {
      return consolidator.normalize(area);
    }
  };

  InlineCommand.prototype.getEditorRange = function() {
    return Simditor.DomRange.toDomRange(this.get_editor(), this.get_editor().selection.range());
  };

  InlineCommand.prototype.storeRangeByFragments = function(fragments) {
    var first, last;
    if (fragments.length) {
      first = fragments[0];
      last = fragments[fragments.length - 1];
      this.startMarker = this.createMarker();
      this.endMarker = this.startMarker.cloneNode(true);
      first.insertBeforeFirst(this.startMarker);
      return last.appendNodeAfter(this.endMarker);
    } else {
      return this.storeRange();
    }
  };

  InlineCommand.prototype.storeRange = function(range) {
    range = range || this.getEditorRange();
    return this.rangeMemento = new Simditor.DomRangeMemento(this.get_editor(), range);
  };

  InlineCommand.prototype.createMarker = function() {
    var marker;
    marker = document.createElement("span");
    marker.className = this.markerClass;
    marker.innerHTML = "&nbsp;";
    return marker;
  };

  InlineCommand.prototype.shouldRemoveFormatting = function(state) {
    return state === 1;
  };

  InlineCommand.prototype.removeFormat = function(fragments) {
    var results;
    results = [];
    while (fragments.length) {
      results.push(this.removeFormat_fragment(fragments.shift()));
    }
    return results;
  };

  InlineCommand.prototype.removeFormat_fragment = function(fragment) {
    var ancestor, edges, parent;
    this.cleanUpFormat(fragment);
    parent = fragment.getParent();
    ancestor = this.findFormattedAncestor(parent);
    if (ancestor && this.isSameFormatNode(ancestor) && !this.get_editor().util.isEditorContentArea(ancestor)) {
      edges = this.getFragmentEdges(fragment);
      return this.removeFormat_extract(ancestor, edges.first, edges.last);
    }
  };

  InlineCommand.prototype.getFragmentEdges = function(fragment) {
    var first, last, nodes;
    nodes = fragment.nodes;
    first = nodes[0];
    last = nodes[nodes.length - 1];
    if (this.isMarker(first.previousSibling)) {
      first = first.previousSibling;
    }
    if (this.isMarker(last.nextSibling)) {
      last = last.nextSibling;
    }
    return {
      first: first,
      last: last
    };
  };

  InlineCommand.prototype.removeEmptyNode = function(node) {
    if (this.get_editor().util.isNodeEmptyRecursive(node) && !this.get_editor().util.hasAttributes(node) && node.parentNode) {
      return node.parentNode.removeChild(node);
    }
  };

  InlineCommand.prototype.cleanUpFormat = function(fragment) {
    var l, n, node, results, w;
    this.cleanUpFragment = fragment;
    n = fragment.nodes;
    results = [];
    for (l = w = n.length - 1; w >= 0; l = w += -1) {
      node = n[l];
      if (!this._shouldCleanUpNode(node)) {
        continue;
      }
      this.removeSameFormatChildren(node);
      results.push(this.removeSameFormat(node, l));
    }
    return results;
  };

  InlineCommand.prototype.removeSameFormatChildren = function(node) {
    var k, results;
    k = this.getSameFormatChildren(node);
    results = [];
    while (k.length) {
      results.push(this.removeSameFormat(k.shift()));
    }
    return results;
  };

  InlineCommand.prototype.removeSameFormat = function(node, m) {
    var child, childNodes, w;
    if (this.isSameFormatNode(node)) {
      if (!isNaN(m) && this.shouldRemoveNode(node)) {
        this.cleanUpFragment.removeNodeAt(m);
        childNodes = node.childNodes;
        for (w = childNodes.length - 1; w >= 0; w += -1) {
          child = childNodes[w];
          this.cleanUpFragment.addNodeAt(child, m);
        }
      }
      return this.removeNodeFormatting(node);
    }
  };

  InlineCommand.prototype.extractFormatting = function(k, j, m) {
    var i, l, n, o, p, q;
    l = k.parentNode;
    i = new Simditor.DomTreeExtractor(k);
    n = i.extractBefore(j);
    p = i.extractAfter(m);
    o = this.get_editor().util.cloneNodeClean(k);
    q = this.get_editor().util.cloneNodeClean(k);
    q.appendChild(p);
    o.appendChild(n);
    if (!Simditor.CommandUtil.isNodeEmptyRecursive(o, true)) {
      l.insertBefore(o, k);
    }
    if (!Simditor.CommandUtil.isNodeEmptyRecursive(q, true)) {
      return l.insertBefore(q, k.nextSibling);
    }
  };

  InlineCommand.prototype.shouldRemoveNode = function() {
    return true;
  };

  InlineCommand.prototype.restoreRange = function() {
    var consolidator, e, endMarker, marker, next, range, startMarker;
    range = this.range;
    marker = $("." + this.markerClass, this.get_editor().body[0]);
    consolidator = new Simditor.Consolidator();
    if (marker.length) {
      startMarker = marker[0];
      next = startMarker.nextSibling;
      endMarker = marker[1];
      if ((this.get_editor().util.isTextNode(next) && this.get_editor().util.isTextNodeEmpty(next) && endMarker.previousSibling === next) || (startMarker === endMarker.previousSibling)) {
        $(endMarker).remove();
        this.restoreCollapsedRange(startMarker);
      } else {
        if (!consolidator.normalizeTextEdge(startMarker, range, true)) {
          if (this.isSameFormatNode(startMarker.nextSibling)) {
            range.setStart(startMarker.nextSibling, 0);
          } else {
            range.setStartAfter(marker[0]);
          }
        }
        if (!consolidator.normalizeTextEdge(endMarker, range, false)) {
          if (this.isSameFormatNode(endMarker.previousSibling)) {
            range.setEnd(endMarker.previousSibling, endMarker.previousSibling.childNodes.length);
          } else {
            range.setEndBefore(marker[1]);
          }
        }
        range.select();
      }
      return marker.remove();
    } else {
      try {
        if (this.rangeMemento) {
          return this.rangeMemento.restoreToRange(this.getEditorRange());
        }
      } catch (_error) {
        e = _error;
      }
    }
  };

  InlineCommand.prototype.restoreCollapsedRange = function(marker) {};

  InlineCommand.prototype.getContentElement = function() {
    return this.get_editor().body[0];
  };

  InlineCommand.prototype.isSameFormatNode = function(node) {
    return this.isSameTagFormat(node) || this.isSameCssFormat(node);
  };

  InlineCommand.prototype.isSameTagFormat = function(node) {
    return (Simditor.CommandUtil.isTag(node, this.settings.tag) || this.isAltTagFormat(node)) && (!node.className || this.isTrackChangesNode(node));
  };

  InlineCommand.prototype.isAltTagFormat = function(node) {
    var altTag, altTags, len, w;
    altTags = this.settings.altTags;
    if (!altTags || !altTags.length) {
      return false;
    }
    for (w = 0, len = altTags.length; w < len; w++) {
      altTag = altTags[w];
      if (Simditor.CommandUtil.isTag(node, altTag)) {
        if (Simditor.CommandUtil.isTag(node, "font")) {
          return this.isFormattingFont(node);
        } else {
          return true;
        }
      }
    }
    return false;
  };

  InlineCommand.prototype.isSameCssFormat = function(node) {
    var cssName, cssValue, settings;
    settings = this.settings;
    cssName = settings.cssName;
    cssValue = settings.cssValue;
    return cssName && cssValue && node.style && node.style[cssName].indexOf(cssValue) > -1;
  };

  InlineCommand.prototype.isTrackChangesNode = function(node) {};

  InlineCommand.prototype.isEmptyInlineFragment = function(fragment) {
    return fragment.all((function(_this) {
      return function(node) {
        return _this.c(node);
      };
    })(this));
  };

  InlineCommand.prototype.isMarker = function(node) {
    return node && (node === this.startMarker || node === this.endMarker || node.className === this.markerClass);
  };

  InlineCommand.prototype.isComment = function(node) {
    return node.nodeType === 8;
  };

  InlineCommand.prototype.isFormattingFont = function(node) {
    return Simditor.CommandUtil.isTag(node, "font") && (this.hasStyle(node, this.settings.cssName) || this.hasAttribute(node, this.settings.altTagAttr));
  };

  InlineCommand.prototype._shouldCleanUpNode = function(node) {
    return node && !this.isMarker(node) && (!this.get_editor().util.isTextNode(node) || this.isComment(node));
  };

  return InlineCommand;

})(CommandBase);

StripCommand = (function(superClass) {
  extend(StripCommand, superClass);

  StripCommand.prototype.options = {
    title: "StripCommand"
  };

  function StripCommand(editor, settings, options) {
    this.options = $.extend(this.options, options || {});
    StripCommand.__super__.constructor.call(this, editor, settings, this.options);
  }

  StripCommand.prototype.getState = function() {
    return 1;
  };

  StripCommand.prototype.traverseFragments = function(range) {
    if (this.settings.selectAll) {

    } else {
      return StripCommand.__super__.traverseFragments.call(this, range);
    }
  };

  StripCommand.prototype.shouldCollectNode = function(node) {
    return !Simditor.CommandUtil.isPreContent(node) && !Simditor.CommandUtil.isTableContent(node) && !Simditor.CommandUtil.isMentionContent(node);
  };

  StripCommand.prototype.getEditorRange = function() {
    if (this.settings.selectAll) {

    } else {
      return StripCommand.__super__.getEditorRange.call(this);
    }
  };

  StripCommand.prototype.getSameFormatChildren = function(node) {
    return $.makeArray($(node).find("*").filter((function(_this) {
      return function(h, g) {
        return _this.isSameFormatNode(g) && !_this.isMarker(g);
      };
    })(this)));
  };

  StripCommand.prototype.findFormattedAncestor = function(node) {
    var tmp;
    tmp = node;
    while (!this.get_editor().util.isBlockNode(node)) {
      if (this.isSameFormatNode(node)) {
        tmp = node;
      }
      node = node.parentNode;
    }
    return tmp;
  };

  StripCommand.prototype.removeFormat_extract = function(g, f, h) {
    if (!this.get_editor().util.isBlockNode(g)) {
      this.extractFormatting(g, f, h);
      this.removeSameFormatChildren(g);
      this.removeNodeFormatting(g);
      return this.removeEmptyNode(g);
    }
  };

  StripCommand.prototype.restoreRange = function() {
    if (this.settings.selectAll) {

    } else {
      return StripCommand.__super__.restoreRange.call(this);
    }
  };

  StripCommand.prototype.getContentElement = function() {
    return this.settings.contentElement || StripCommand.__super__.getContentElement.call(this);
  };

  return StripCommand;

})(InlineCommand);

StripElementCommand = (function(superClass) {
  extend(StripElementCommand, superClass);

  function StripElementCommand(editor, settings, options) {
    var reg, tags;
    tags = settings.tags || [];
    if (tags[0] === "ALL") {
      reg = "(?:[a-z]+:)?[a-z]+[1-6]?";
    } else {
      reg = tags.join("|");
    }
    this.nodeNamesRegExp = new RegExp("^(?:" + reg + ")$", "i");
    settings.exclude = settings.exclude || [];
    settings.stripCondition = settings.stripCondition || (function(_this) {
      return function(l) {
        return false;
      };
    })(this);
    StripElementCommand.__super__.constructor.call(this, editor, settings, options);
  }

  StripElementCommand.prototype.getSameFormatChildren = function(node) {
    if (this._isStripAll()) {
      return this.get_editor().util.getAllChildNodesBy(node, StripElementCommand.c);
    } else {
      return StripElementCommand.__super__.getSameFormatChildren.call(this, node);
    }
  };

  StripElementCommand.prototype.isSameFormatNode = function(node) {
    return node && (this.settings.stripCondition(node) || (this.isCommentToStrip(node) || this.isTagToStrip(node)));
  };

  StripElementCommand.prototype.isCommentToStrip = function(node) {
    return this._isStripAll() && this.isComment(node);
  };

  StripElementCommand.prototype.isTagToStrip = function(node) {
    return this.settings.tags && (this.nodeNamesRegExp.test(node.nodeName) && !this.get_editor().util.isEditorContentArea(node) && !this._isNodeExcluded(node));
  };

  StripElementCommand.prototype.removeNodeFormatting = function(node) {
    if (this.isCommentToStrip(node)) {
      return node.parentNode.removeChild(node);
    } else {
      if (!this.get_editor().util.isTextNode(node) && !this.isMarker(node)) {
        return this.get_editor().util.removeNode(node);
      }
    }
  };

  StripElementCommand.prototype._isStripAll = function() {
    return this.settings.tags && this.settings.tags[0] === "ALL";
  };

  StripElementCommand.prototype._isNodeExcluded = function(node) {
    return $.inArray(node.nodeName.toLowerCase(), this.settings.exclude) >= 0;
  };

  return StripElementCommand;

})(StripCommand);

StripElementCommand.c = (function(_this) {
  return function() {
    return true;
  };
})(this);

Simditor.StripElementCommand = StripElementCommand;

RangeFragmentsTraverser = (function(superClass) {
  extend(RangeFragmentsTraverser, superClass);

  function RangeFragmentsTraverser(editor, range) {
    this.iterator = new Simditor.RangeIterator(editor, range);
    this.range = this.iterator.range;
    this.editor = editor;
    this.traversedFragments = [];
    this.nodesToTraverse = [];
  }

  RangeFragmentsTraverser.prototype.traverseFragments = function(fn) {
    this.iterator.iterate((function(_this) {
      return function(node) {
        return _this.nodesToTraverse.push(node);
      };
    })(this));
    if (!this.nodesToTraverse.length) {
      return;
    }
    this.splitRangeEdges();
    this.clearEmptyTextNodes(this.nodesToTraverse);
    while (this.nodesToTraverse.length) {
      this.collectNode(this.nodesToTraverse.shift(), fn);
    }
    return this.removeDuplicatedEnd();
  };

  RangeFragmentsTraverser.prototype.collectNode = function(node, fn) {
    var fragmentContainer, nodeTmp, results;
    results = [];
    while (node && this.isInRange(node)) {
      if (!this.isSuitable(node, fn)) {
        this.removeTraversedNode(node);
        if (node.firstChild) {
          this.collectNode(node.firstChild, fn);
        }
        node = node.nextSibling;
        continue;
      }
      fragmentContainer = new Simditor.FragmentContainer(this.editor);
      nodeTmp = node;
      while (nodeTmp && this.isSuitable(nodeTmp, fn)) {
        if (fn(nodeTmp)) {
          this.removeTraversedNode(nodeTmp);
        }
        node = nodeTmp;
        nodeTmp = node.nextSibling;
        fragmentContainer.addNode(node);
      }
      this.storeFragment(fragmentContainer);
      if (node) {
        results.push(node = node.nextSibling);
      } else {
        results.push(node = null);
      }
    }
    return results;
  };

  RangeFragmentsTraverser.prototype.storeFragment = function(fragment) {
    if (fragment.nodes.length) {
      return this.traversedFragments.push(fragment);
    }
  };

  RangeFragmentsTraverser.prototype.isSuitable = function(node, fn) {
    return fn(node) && this.isInRange(node);
  };

  RangeFragmentsTraverser.prototype.isInRange = function(node) {
    var range;
    range = this.range.cloneRange();
    range.selectNodeContents(node);
    return this.range.compareBoundaryPoints(Simditor.DomRange.END_TO_END, range) > -1 && this.range.compareBoundaryPoints(Simditor.DomRange.START_TO_START, range) < 1;
  };

  RangeFragmentsTraverser.prototype.removeTraversedNode = function(node) {
    var index, list;
    list = this.nodesToTraverse;
    index = $.inArray(node, list);
    if (index !== -1) {
      return list.splice(index, 1);
    }
  };

  RangeFragmentsTraverser.prototype.splitRangeEdges = function() {
    var end, start;
    end = this.splitEnd(this.range.endContainer, this.range.endOffset);
    start = this.splitStart(this.range.startContainer, this.range.startOffset);
    if (start) {
      this.range.setStartBefore(start);
    }
    if (end) {
      this.range.setEndAfter(end);
    }
    return this.range.select();
  };

  RangeFragmentsTraverser.prototype.splitEnd = function(container, offset) {
    var data, e, f, parentNode, textNode;
    if (this.editor.util.isTextNode(container)) {
      data = container.data;
      parentNode = container.parentNode;
      if (offset === 0) {
        return container.previousSibling;
      } else {
        if (offset > 0 && offset < container.length) {
          textNode = document.createTextNode(data.substring(offset));
          container.data = data.substring(0, offset);
          parentNode.insertBefore(textNode, container.nextSibling);
          return container;
        }
      }
      return container;
    }
    if (this.editor.util.canHaveChildren(container)) {
      e = container.childNodes;
      f = e[offset - 1];
      return f || this.editor.util.traversePreviousNode(container.firstChild);
    } else {
      return container;
    }
  };

  RangeFragmentsTraverser.prototype.splitStart = function(container, offset) {
    var data, parentNode, textNode;
    if (this.editor.util.isTextNode(container)) {
      data = container.data;
      parentNode = container.parentNode;
      if (offset === container.length) {
        return container.nextSibling;
      } else {
        if (offset > 0 && offset < container.length) {
          textNode = document.createTextNode(data.substring(0, offset));
          container.data = data.substring(offset);
          parentNode.insertBefore(textNode, container);
          return container;
        }
      }
      return container;
    }
    if (this.editor.util.canHaveChildren(container)) {
      return container.childNodes[offset];
    } else {
      return container;
    }
  };

  RangeFragmentsTraverser.prototype.clearEmptyTextNodes = function(list) {
    var e, f, node, results;
    f = 0;
    results = [];
    while (f < list.length) {
      node = list[f];
      if (this.editor.util.isTextNode(node) && node.nodeValue === "") {
        e = list.splice(f, 1)[0];
        if (e.parentNode) {
          results.push(e.parentNode.removeChild(e));
        } else {
          results.push(void 0);
        }
      } else {
        results.push(f++);
      }
    }
    return results;
  };

  RangeFragmentsTraverser.prototype.removeDuplicatedEnd = function() {
    var firstNode, fragments, last, lastNode, lastSecond, length, results;
    fragments = this.traversedFragments;
    if (fragments.length < 2) {
      return;
    }
    length = fragments.length;
    last = fragments[length - 1];
    firstNode = last.nodes[0];
    lastSecond = fragments[length - 2];
    lastNode = lastSecond.nodes[lastSecond.nodes.length - 1];
    results = [];
    while (this.editor.util.isAncestorOf(lastNode, firstNode)) {
      last.removeNodeAt(0);
      if (last.nodes.length === 0) {
        fragments.pop();
        break;
      }
      results.push(firstNode = last.nodes[0]);
    }
    return results;
  };

  return RangeFragmentsTraverser;

})(SimpleModule);

Simditor.RangeFragmentsTraverser = RangeFragmentsTraverser;

RangeIterator = (function(superClass) {
  extend(RangeIterator, superClass);

  function RangeIterator(editor, range) {
    var commonAncestorContainer;
    this.range = range;
    this.editor = editor;
    if (this.range.collapsed) {
      return;
    }
    commonAncestorContainer = this.range.commonAncestorContainer;
    if (this.range.startContainer === commonAncestorContainer && !this.editor.util.isTextNode(this.range.startContainer)) {
      this._next = this.range.startContainer.childNodes[this.range.startOffset];
    } else {
      this._next = this.editor.util.findAncestorUntil(commonAncestorContainer, this.range.startContainer);
    }
    if (this.range.endContainer === commonAncestorContainer && !this.editor.util.isTextNode(this.range.endContainer)) {
      this._end = this.range.endContainer.childNodes[this.range.endOffset];
    } else {
      this._end = this.editor.util.findAncestorUntil(commonAncestorContainer, this.range.endContainer).nextSibling;
    }
  }

  RangeIterator.prototype.iterate = function(fn) {
    var nextNode, results;
    nextNode = this.nextNode();
    results = [];
    while (nextNode) {
      if (this._hasSubTree(nextNode)) {
        this._buildSubTraverser(nextNode).iterate(fn);
      } else {
        fn(nextNode);
      }
      results.push(nextNode = this.nextNode());
    }
    return results;
  };

  RangeIterator.prototype.nextNode = function() {
    var next;
    next = this._next;
    if (this._next && this._next.nextSibling !== this._end) {
      this._next = this._next.nextSibling;
    } else {
      this._next = null;
    }
    return next;
  };

  RangeIterator.prototype._hasSubTree = function(node) {
    return !this.editor.util.isTextNode(node) && this.editor.util.canHaveChildren(node) && (this.editor.util.isAncestorOrSelf(node, this.range.startContainer) || this.editor.util.isAncestorOrSelf(node, this.range.endContainer));
  };

  RangeIterator.prototype._buildSubTraverser = function(node) {
    var range;
    range = this.range.cloneRange();
    range.selectNodeContents(node);
    if (this.editor.util.isAncestorOrSelf(node, this.range.startContainer)) {
      range.setStart(this.range.startContainer, this.range.startOffset);
    }
    if (this.editor.util.isAncestorOrSelf(node, this.range.endContainer)) {
      range.setEnd(this.range.endContainer, this.range.endOffset);
    }
    return new Simditor.RangeIterator(this.editor, range);
  };

  return RangeIterator;

})(SimpleModule);

Simditor.RangeIterator = RangeIterator;

FragmentContainer = (function(superClass) {
  extend(FragmentContainer, superClass);

  function FragmentContainer(editor) {
    this.nodes = [];
    this.editor = editor;
  }

  FragmentContainer.prototype.addNode = function(node) {
    return this.nodes.push(node);
  };

  FragmentContainer.prototype.getParent = function() {
    if (this.nodes.length) {
      return this.nodes[0].parentNode;
    } else {
      return null;
    }
  };

  FragmentContainer.prototype.appendTo = function(node) {
    var e, len, ref, results, w;
    ref = this.nodes;
    results = [];
    for (w = 0, len = ref.length; w < len; w++) {
      e = ref[w];
      results.push(node.appendChild(e));
    }
    return results;
  };

  FragmentContainer.prototype.insertBeforeFirst = function(node) {
    var parent;
    if (!this.nodes.length) {
      return;
    }
    parent = this.getParent();
    return parent.insertBefore(node, this.nodes[0]);
  };

  FragmentContainer.prototype.appendNodeAfter = function(node) {
    var last, parent;
    if (!this.nodes.length) {
      return;
    }
    parent = this.getParent();
    last = this.nodes[this.nodes.length - 1];
    return parent.insertBefore(node, last.nextSibling);
  };

  FragmentContainer.prototype.removeNodeAt = function(m) {
    return this.nodes.splice(m, 1);
  };

  FragmentContainer.prototype.addNodeAt = function(f, e) {
    return this.nodes.splice(e, 0, f);
  };

  FragmentContainer.prototype.all = function(fn) {
    return Simditor.CommandUtil.every(this.nodes, fn);
  };

  FragmentContainer.prototype.any = function(fn) {
    return Simditor.CommandUtil.some(this.nodes, fn);
  };

  return FragmentContainer;

})(SimpleModule);

Simditor.FragmentContainer = FragmentContainer;

DomTreeExtractor = (function(superClass) {
  extend(DomTreeExtractor, superClass);

  function DomTreeExtractor(topNode) {
    this.top = topNode;
  }

  DomTreeExtractor.prototype.extractBefore = function(node) {
    return this._traverseSide({
      edge: node,
      next: (function(_this) {
        return function(n) {
          return n.previousSibling;
        };
      })(this),
      insert: (function(_this) {
        return function(f, g) {
          return f.insertBefore(g, f.firstChild);
        };
      })(this)
    });
  };

  DomTreeExtractor.prototype.extractAfter = function(node) {
    return this._traverseSide({
      edge: node,
      next: (function(_this) {
        return function(n) {
          return n.nextSibling;
        };
      })(this),
      insert: (function(_this) {
        return function(f, g) {
          return f.appendChild(g);
        };
      })(this)
    });
  };

  DomTreeExtractor.prototype._traverseSide = function(data) {
    var e, edge, fragment, i, parentNode, top;
    top = this.top;
    fragment = document.createDocumentFragment();
    edge = data.edge;
    while (true) {
      parentNode = edge.parentNode;
      edge = data.next(edge);
      while (edge) {
        i = data.next(edge);
        data.insert(fragment, edge);
        edge = i;
      }
      if (parentNode !== top) {
        e = parentNode.cloneNode(false);
        e.innerHTML = "";
        e.appendChild(fragment);
        data.insert(fragment, e);
      }
      edge = parentNode;
      if (!(edge && edge !== top)) {
        break;
      }
    }
    return fragment;
  };

  return DomTreeExtractor;

})(SimpleModule);

Simditor.DomTreeExtractor = DomTreeExtractor;

Consolidator = (function(superClass) {
  extend(Consolidator, superClass);

  Consolidator.prototype.markerClass = "__telerik_marker";

  Consolidator.c = function(h, i) {
    if (!h || !i || !h.parentNode || !i.parentNode || Simditor.CommandUtil.isTextNode(h)) {
      return false;
    }
    return Simditor.NodeComparer.equalNodes(h, i);
  };

  Consolidator.prototype.options = {
    nodeCompare: Consolidator.c
  };

  function Consolidator(editor, options) {
    this.options = $.extend(this.options, options || {});
    this.editor = editor;
    this.util = Simditor.CommandUtil;
  }

  Consolidator.prototype.consolidateMarkedEdges = function(node) {
    var markers;
    markers = this._getMarkers(node);
    if (markers[0]) {
      this.consolidateOverMarker(markers[0]);
    }
    if (markers[1]) {
      return this.consolidateOverMarker(markers[1]);
    }
  };

  Consolidator.prototype.consolidateOverMarker = function(node) {
    var nextSibling, nodeCompare, previousSibling;
    nodeCompare = this.options.nodeCompare;
    previousSibling = node.previousSibling;
    nextSibling = node.nextSibling;
    if (nodeCompare(previousSibling, nextSibling)) {
      previousSibling.appendChild(node);
      while (nextSibling.firstChild) {
        previousSibling.appendChild(nextSibling.firstChild);
      }
      nextSibling.parentNode.removeChild(nextSibling);
      return this.consolidateOverMarker(node);
    }
  };

  Consolidator.prototype.normalizeTextEdge = function(node, range, isStart) {
    var key, nextSibling, previousSibling;
    previousSibling = node.previousSibling;
    nextSibling = node.nextSibling;
    if (this.util.isTextNode(previousSibling) && this.util.isTextNode(nextSibling) && previousSibling.nodeType === nextSibling.nodeType) {
      if (isStart) {
        key = "setStart";
      } else {
        key = "setEnd";
      }
      range[key](previousSibling, previousSibling.nodeValue.length);
      this.mergeTextToStart(previousSibling, nextSibling);
      node.parentNode.removeChild(node);
      return true;
    }
    return false;
  };

  Consolidator.prototype.mergeTextToStart = function(prev, next) {
    prev.nodeValue += next.nodeValue;
    next.parentNode.removeChild(next);
    return prev;
  };

  Consolidator.prototype.mergeTextNodes = function(text, node) {
    node.nodeValue = text.nodeValue + node.nodeValue;
    text.parentNode.removeChild(text);
    return node;
  };

  Consolidator.prototype.normalize = function(node) {
    return this.util.normalize(node);
  };

  Consolidator.prototype._getMarkers = function(node) {
    return $("." + this.markerClass, node);
  };

  return Consolidator;

})(SimpleModule);

Simditor.Consolidator = Consolidator;

FormatPainterCommand = (function(superClass) {
  extend(FormatPainterCommand, superClass);

  FormatPainterCommand.wrapperClass = "TELERIK_formatPainterContentWrapper";

  FormatPainterCommand.prototype._attributes = ["class", "style", "size", "color", "face"];

  function FormatPainterCommand(editor, settings, options) {
    options = $.extend({
      title: "Format Painter"
    }, options || {});
    FormatPainterCommand.__super__.constructor.call(this, editor, settings, options);
  }

  FormatPainterCommand.prototype.formatFragments = function(fragments) {
    var formatTree, fragment, results;
    if (fragments.length && this.settings.formatting) {
      formatTree = this._createFormattingTree();
    } else {
      formatTree = void 0;
    }
    results = [];
    while (fragments.length && formatTree) {
      fragment = fragments.shift();
      if (!this.isEmptyInlineFragment(fragment)) {
        results.push(this.formatFragment(fragment, formatTree));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  FormatPainterCommand.prototype.formatFragment = function(fragment, formatTree) {
    var cloneNode, computedStyles, diffCss, formatting, parentNode, util, wrapperClass, wrapperNode, wrapperNodeTmp;
    cloneNode = formatTree.cloneNode(true);
    wrapperClass = FormatPainterCommand.wrapperClass;
    if ($(cloneNode).is('span.' + wrapperClass)) {
      wrapperNode = $(cloneNode).removeClass(wrapperClass).get(0);
    } else {
      wrapperNode = $(cloneNode).find("span." + wrapperClass).removeClass(wrapperClass).get(0);
    }
    fragment.insertBeforeFirst(cloneNode);
    fragment.appendTo(wrapperNode);
    parentNode = cloneNode.parentNode;
    util = this.get_editor().util;
    if (util.isBlockNode(cloneNode) && util.isBlockNode(parentNode)) {
      if (cloneNode.nodeName === parentNode.nodeName || util.isBlockComponent(cloneNode)) {
        util.removeNode(cloneNode);
      } else {
        if (!util.isBlockComponent(parentNode) && util.isHeading(cloneNode)) {
          if (this.isMarker(cloneNode.previousSibling)) {
            fragment.insertBeforeFirst(cloneNode.previousSibling);
          }
          if (this.isMarker(cloneNode.nextSibling)) {
            fragment.appendNodeAfter(cloneNode.nextSibling);
          }
          this.extractFormatting(parentNode, cloneNode, cloneNode);
          util.removeNode(parentNode);
        } else {
          if (util.isHeading(parentNode) || util.isBlockComponent(parentNode)) {
            util.removeNode(cloneNode);
          }
        }
      }
    }
    formatting = this.settings.formatting;
    if (formatting && formatting.computedStyles) {
      computedStyles = formatting.computedStyles;
    } else {
      computedStyles = {};
    }
    wrapperNodeTmp = wrapperNode;
    diffCss = this._getStyleDifferences(wrapperNodeTmp, computedStyles);
    if (diffCss) {
      return $(wrapperNodeTmp).css(diffCss);
    } else {
      return util.removeNode(wrapperNodeTmp);
    }
  };

  FormatPainterCommand.prototype._getStyleDifferences = function(node, computedStyles) {
    var f, h, key, l, value;
    for (key in computedStyles) {
      if (!hasProp.call(computedStyles, key)) continue;
      value = computedStyles[key];
      l = this.get_editor().util.getComputedStyle(node, key);
      h = computedStyles[key];
      if (l !== h) {
        if (!f) {
          f = {};
        }
        f[key] = h;
      }
    }
    return f;
  };

  FormatPainterCommand.prototype._createFormattingTree = function() {
    var elements, formatting, h, len, m, o, ref, tmp, w, wrapper;
    formatting = this.settings.formatting;
    if (formatting && formatting.elements) {
      elements = formatting.elements;
    } else {
      elements = [];
    }
    wrapper = document.createElement("div");
    tmp = wrapper;
    ref = elements.slice(0).reverse();
    for (w = 0, len = ref.length; w < len; w++) {
      m = ref[w];
      o = document.createElement(m.nodeName);
      this._setAttributes(o, m);
      tmp.appendChild(o);
      tmp = o;
    }
    h = document.createElement("span");
    h.className = FormatPainterCommand.wrapperClass;
    tmp.appendChild(h);
    return wrapper.firstChild;
  };

  FormatPainterCommand.prototype._setAttributes = function(node, attrs) {
    return this._attributes.forEach((function(_this) {
      return function(item) {
        if (attrs[item]) {
          return node.setAttribute(item, attrs[item]);
        }
      };
    })(this));
  };

  FormatPainterCommand.prototype.getState = function() {
    return 0;
  };

  return FormatPainterCommand;

})(InlineCommand);

Simditor.FormatPainterCommand = FormatPainterCommand;

FragmentsCondition = {};

FragmentsCondition.isInlineNode = (function(_this) {
  return function(node) {
    return node.nodeType === 3 || !Simditor.CommandUtil.isBlockNode(node);
  };
})(this);

FragmentsCondition.isInlineTag = (function(_this) {
  return function(tag) {
    return function(f) {
      return _this.isInlineNode(f) && !Simditor.CommandUtil.isTag(f, tag);
    };
  };
})(this);

FragmentsCondition.inlineNotLink = FragmentsCondition.isInlineTag("a");

Simditor.FragmentsCondition = FragmentsCondition;

return Simditor;

}));
