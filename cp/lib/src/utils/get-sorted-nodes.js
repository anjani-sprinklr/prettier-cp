'use strict';
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s)
                        if (Object.prototype.hasOwnProperty.call(s, p))
                            t[p] = s[p];
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

Object.defineProperty(exports, '__esModule', { value: true });
exports.getSortedNodes = void 0;
var types_1 = require('@babel/types');
var lodash_1 = require('lodash');
var constants_1 = require('prettier-cp/lib/src/constants');
/**
 * This function returns all the nodes which are in the importOrder array.
 * The plugin considered these import nodes as local import declarations.
 * @param nodes all import nodes
 * @param options
 */

var constants_1 = require('prettier-cp/lib/src/constants');
/**
 * Get the regexp group to keep the import nodes.
 * @param node
 * @param importOrder
 */

// types, utils prevail
var order = ['types', 'utils|helpers', 'components'];
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
        if (subNode.type === 'ImportDefaultSpecifier') {
            specifier = subNode.local.name;
        } else if (subNode.type === 'ImportSpecifier') {
            specifier = subNode.imported.name;
        }
        if (specifier.match(regExIsHook) !== null) {
            isHook = true;
        }
        const alphabeticalChars = specifier
            .replace('/[^A-Za-z]/g', '')
            .split('');
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
    if (node.source.value.match(notLib) === null) return 'lib';
    const constOrHook = isConstorHook(node);
    if (constOrHook.isCONST) return 'constants';
    else if (constOrHook.isHook) return 'hooks';

    for (var i = 0; i < order.length; i++) {
        var regExp = new RegExp(order[i]);
        var matched = node.source.value.match(regExp) !== null;
        if (matched) return order[i];
    }
    return 'uidf';
    //return 'lib';
};

var getSortedNodes = function (nodes, options) {
    var importOrder = options.importOrder;
    var importOrderSeparation = options.importOrderSeparation;
    var originalNodes = nodes.map(lodash_1.clone);
    var finalNodes = [];
    var importOrderGroups = {};
    for (var i = 0; i < importOrder.length; i++) {
        importOrderGroups[importOrder[i]] = [];
    }

    for (
        var i = 0, originalNodes_1 = originalNodes;
        i < originalNodes_1.length;
        i++
    ) {
        var node = originalNodes_1[i];
        var matchedGroup = getImportNodesMatchedGroup(node);
        // console.log('Mach', matchedGroup);
        if (matchedGroup === 'uidf') {
            lineimportMap.set(count, [node]);
            console.log('count', count);
        } else {
            importOrderGroups[matchedGroup].push(node);
        }

        count += 1;
    }

    var currentCount = 0;
    for (
        var _a = 0, importOrder_1 = importOrder;
        _a < importOrder_1.length;
        _a++
    ) {
        var group = importOrder_1[_a];
        var groupNodes = importOrderGroups[group];
        if (groupNodes.length === 0) continue;

        let firstKey = lineimportMap.keys().next().value;

        while (
            lineimportMap.size > 0 &&
            currentCount + groupNodes.length > firstKey
        ) {
            finalNodes.push.apply(finalNodes, lineimportMap.get(firstKey));
            finalNodes.push(constants_1.newLineNode);
            currentCount += 1;
            lineimportMap.delete(firstKey);
            if (lineimportMap.size > 0)
                firstKey = lineimportMap.keys().next().value;
            else break;
            console.log(lineimportMap);
            console.log('HI', currentCount, groupNodes.length, firstKey);
        }

        // if we directly push it then it will be like pushing an array itself and not the array elements

        finalNodes.push.apply(finalNodes, groupNodes);
        currentCount += groupNodes.length;
        // console.log(finalNodes.length);
        if (importOrderSeparation) {
            finalNodes.push(constants_1.newLineNode);
        }
    }
    //asdads

    if (finalNodes.length > 0 && !importOrderSeparation) {
        // a newline after all imports
        finalNodes.push(constants_1.newLineNode);
    }
    // maintain a copy of the nodes to extract comments from
    var finalNodesClone = finalNodes.map(lodash_1.clone);
    var firstNodesComments = nodes[0].leadingComments;
    finalNodes.forEach(types_1.removeComments);
    // insert comments other than the first comments
    finalNodes.forEach(function (node, index) {
        if (lodash_1.isEqual(nodes[0].loc, node.loc)) return;
        types_1.addComments(
            node,
            'leading',
            finalNodesClone[index].leadingComments || [],
        );
    });
    if (firstNodesComments) {
        types_1.addComments(finalNodes[0], 'leading', firstNodesComments);
    }

    return finalNodes;
};

exports.getSortedNodes = getSortedNodes;
