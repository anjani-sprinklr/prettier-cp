"use strict";
/** @format */
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
function compile(fileNames, options) {
    var program = ts.createProgram(fileNames, options);
    var checker = program.getTypeChecker();
    function visit(node) {
        //console.log(ts.JsxEmit);
        if (ts.isImportDeclaration(node)) {
            var importClause_1 = node.importClause;
            if (importClause_1 && importClause_1.namedBindings && ts.isNamedImports(importClause_1.namedBindings)) {
                importClause_1.namedBindings.elements.forEach(function (imp) {
                    var type = checker.getTypeAtLocation(imp);
                    var symbol = type.getSymbol();
                    var declarations = symbol === null || symbol === void 0 ? void 0 : symbol.getDeclarations();
                    if (declarations) {
                        declarations.forEach(function (declaration) {
                            console.log("CODDE:", ts.SyntaxKind[declaration.kind]);
                        });
                        // type
                        //   .getSymbol()
                        //   .getDeclarations()
                        //   .forEach((d) => console.log("1:", d.getText()));
                        console.log("Import: ".concat(imp.getText(), " is of type: ").concat(checker.typeToString(type)));
                    }
                    else {
                        console.log("Import: ".concat(imp.getText(), " is of type: ").concat(checker.typeToString(type)));
                    }
                    console.log("2: ", checker.typeToString(checker.getTypeAtLocation(importClause_1)));
                });
            }
            else if (importClause_1) {
                console.log("2: ", checker.typeToString(checker.getTypeAtLocation(importClause_1)));
            }
        }
        ts.forEachChild(node, visit);
    }
    fileNames.forEach(function (fileName) {
        var sourceFile = program.getSourceFile(fileName);
        if (sourceFile) {
            ts.forEachChild(sourceFile, visit);
        }
    });
}
var fileNames = ["sample.ts"]; // Add your .tsx file here
var options = {
    jsx: ts.JsxEmit.ReactJSX, // Ensure JSX is supported
    allowJs: true,
    checkJs: true,
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
};
compile(fileNames, options);
