"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocessor = void 0;

var parser = require("@babel/parser");
var get_code_from_ast_1 = require("prettier-cp/lib/src/utils/get-code-from-ast");
var get_sorted_nodes_1 = require("prettier-cp/lib/src/utils/get-sorted-nodes");


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractASTNodes = void 0;
var traverse = __importDefault(require("@babel/traverse"));


function extractASTNodes(ast) {
    var importNodes = [];
    traverse.default(ast, {
        ImportDeclaration: function (path) {
            importNodes.push(path.node);
        },
    });

    //console.log(importNodes[0]);
    return { importNodes: importNodes };
}



function preprocessor(code, options) {
    var importOrder = options.importOrder,
        importOrderCaseInsensitive = options.importOrderCaseInsensitive,
        importOrderSeparation = options.importOrderSeparation,
        importOrderGroupNamespaceSpecifiers = options.importOrderGroupNamespaceSpecifiers,
        importOrderSortSpecifiers = options.importOrderSortSpecifiers;
    
    var parserOptions = {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
    };
    var ast = parser.parse(code, parserOptions);
    var interpreter = ast.program.interpreter;
    //console.log("inter: ",interpreter);
    var _a = extractASTNodes(ast),
        importNodes = _a.importNodes
        //directives = _a.directives;
    // short-circuit if there are no import declaration
    if (importNodes.length === 0)
        return code;
    var allImports = (0, get_sorted_nodes_1.getSortedNodes)(importNodes, {
        importOrder: importOrder,
        importOrderCaseInsensitive: importOrderCaseInsensitive,
        importOrderSeparation: importOrderSeparation,
        importOrderGroupNamespaceSpecifiers: importOrderGroupNamespaceSpecifiers,
        importOrderSortSpecifiers: importOrderSortSpecifiers,
    });
    return (0, get_code_from_ast_1.getCodeFromAst)(allImports, code, interpreter);
   // return (0, get_code_from_ast_1.getCodeFromAst)(allImports, code, interpreter);
}
exports.preprocessor = preprocessor;



