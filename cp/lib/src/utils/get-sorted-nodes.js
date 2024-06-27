"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };

Object.defineProperty(exports, "__esModule", { value: true });
exports.getSortedNodes = void 0;
var types_1 = require("@babel/types");
var lodash_1 = require("lodash");
var constants_1 = require("prettier-cp/lib/src/constants");
/**
 * This function returns all the nodes which are in the importOrder array.
 * The plugin considered these import nodes as local import declarations.
 * @param nodes all import nodes
 * @param options
 */

var constants_1 = require("prettier-cp/lib/src/constants");
/**
 * Get the regexp group to keep the import nodes.
 * @param node
 * @param importOrder
 */

// types, utils prevail
var order = ["types", "utils|helpers", "components"];
const notLib = new RegExp(/^((@\/)|(@sprinklrjs)|(\.\/)|(\.\.\/))/g);
const regExIsHook = new RegExp(/^use/g);

const lineimportMap = new Map();
var count = 1;

// importOrder: [
//     'lib',
//     'components',
//     'hooks',
//     'types',
//     'utils|helpers',
//     'constants',
// ],

const isConstorHook = (node) => {
  var isCONST = true;
  var isHook = false;
  node.specifiers.forEach((subNode) => {
    var specifier;
    if (subNode.type === "ImportDefaultSpecifier") {
      specifier = subNode.local.name;
    } else if (subNode.type === "ImportSpecifier") {
      specifier = subNode.imported.name;
    }
    if (specifier.match(regExIsHook) !== null) {
      isHook = true;
    }
    const alphabeticalChars = specifier.replace("/[^A-Za-z]/g", "").split("");
    // console.log(alphabeticalChars);
    alphabeticalChars.forEach((char) => {
      if (char !== char.toUpperCase()) {
        isCONST = false;
      }
    });
  });

  return { isHook, isCONST };
};
var getImportNodesMatchedGroup = function (node, importOrder) {
  if (node.source.value.match(notLib) === null) return "lib";
  const constOrHook = isConstorHook(node);
  if (constOrHook.isCONST) return "constants";
  else if (constOrHook.isHook) return "hooks";

  for (var i = 0; i < order.length; i++) {
    var regExp = new RegExp(order[i]);
    var matched = node.source.value.match(regExp) !== null;
    if (matched) return order[i];
  }
  return "uidf";
};

const getCommentAST = (value) => {
  return {
    type: "CommentLine",
    value: value,
  };
};

var getSortedNodes = function (nodes, options) {
  //xas
  lineimportMap.clear();
  count = 1;
  var importOrder = options.importOrder;
  var importOrderSeparation = options.importOrderSeparation;
  var originalNodes = nodes.map(lodash_1.clone);
  var finalNodes = [];
  var importOrderGroups = {};

  // to group things based on utils,types..
  for (var i = 0; i < importOrder.length; i++) {
    importOrderGroups[importOrder[i]] = [];
  }

  for (var i = 0, originalNodes_1 = originalNodes; i < originalNodes_1.length; i++) {
    var node = originalNodes_1[i];
    var matchedGroup = getImportNodesMatchedGroup(node);
    if (matchedGroup === "uidf") lineimportMap.set(count, [node]);
    else importOrderGroups[matchedGroup].push(node);

    count += 1;
  }

  // Sort the imports within each group based on node.source or import paths
  for (var group in importOrderGroups) {
    importOrderGroups[group].sort((a, b) => {
      if (a.source.value < b.source.value) return -1;
      if (a.source.value > b.source.value) return 1;
      return 0;
    });
  }

  // adding sorted import statements and the unidentified ones as well
  var currentCount = 0;
  for (var i = 0, importOrder_1 = importOrder; i < importOrder_1.length; i++) {
    var group = importOrder_1[i];
    var groupNodes = importOrderGroups[group];
    if (groupNodes.length === 0) continue;

    let firstKey = lineimportMap.keys().next().value;

    while (lineimportMap.size > 0 && currentCount + groupNodes.length > firstKey) {
      finalNodes.push.apply(finalNodes, lineimportMap.get(firstKey));
      finalNodes.push(constants_1.newLineNode);
      currentCount += 1;
      lineimportMap.delete(firstKey);
      if (lineimportMap.size > 0) firstKey = lineimportMap.keys().next().value;
      else break;
    }

    const comments = groupNodes[0].leadingComments;
    if (comments?.length) {
      const commentValue = comments[0].value;
      if (commentValue.match(importOrder_1[i]) === null) {
        groupNodes[0].leadingComments = [getCommentAST(importOrder_1[i]), ...groupNodes[0].leadingComments];
      }
    } else {
      groupNodes[0].leadingComments = [getCommentAST(importOrder_1[i])];
    }

    // add the group
    finalNodes.push.apply(finalNodes, groupNodes);
    currentCount += groupNodes.length;
    if (importOrderSeparation) {
      finalNodes.push(constants_1.newLineNode);
    }
  }

  // the left unidentifed ones needs to be put on last
  let firstKey = undefined;
  while (lineimportMap.size > 0) {
    finalNodes.push.apply(finalNodes, lineimportMap.get(firstKey));
    finalNodes.push(constants_1.newLineNode);
    lineimportMap.delete(firstKey);
    if (lineimportMap.size > 0) firstKey = lineimportMap.keys().next().value;
  }

  if (finalNodes.length > 0 && !importOrderSeparation) {
    finalNodes.push(constants_1.newLineNode);
  }

  // maintain a copy of the nodes to extract comments from
  var finalNodesClone = finalNodes.map(lodash_1.clone);
  finalNodes.forEach(types_1.removeComments);

  // insert comments other than the first comments
  finalNodes.forEach(function (node, index) {
    types_1.addComments(node, "leading", finalNodesClone[index].leadingComments || []);
  });

  return finalNodes;
};

exports.getSortedNodes = getSortedNodes;
