/** @format */

import * as ts from "typescript";

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  let program = ts.createProgram(fileNames, options);
  let checker = program.getTypeChecker();

  function visit(node: ts.Node) {
    //console.log(ts.JsxEmit);
    if (ts.isImportDeclaration(node)) {
      const importClause = node.importClause;

      if (importClause && importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
        importClause.namedBindings.elements.forEach((imp) => {
          const type = checker.getTypeAtLocation(imp);
          const symbol = type.getSymbol();
          const declarations = symbol?.getDeclarations();

          if (declarations) {
            declarations.forEach((declaration) => {
              console.log("CODDE:", ts.SyntaxKind[declaration.kind]);
            });
            // type
            //   .getSymbol()
            //   .getDeclarations()
            //   .forEach((d) => console.log("1:", d.getText()));
            console.log(`Import: ${imp.getText()} is of type: ${checker.typeToString(type)}`);
          } else {
            console.log(`Import: ${imp.getText()} is of type: ${checker.typeToString(type)}`);
          }
          console.log("2: ", checker.typeToString(checker.getTypeAtLocation(importClause)));
        });
      } else if (importClause) {
        console.log("2: ", checker.typeToString(checker.getTypeAtLocation(importClause)));
      }
    }
    ts.forEachChild(node, visit);
  }

  fileNames.forEach((fileName) => {
    let sourceFile = program.getSourceFile(fileName);
    if (sourceFile) {
      ts.forEachChild(sourceFile, visit);
    }
  });
}

const fileNames = ["sample.js"]; // Add your .tsx file here
const options = {
  jsx: ts.JsxEmit.ReactJSX, // Ensure JSX is supported
  allowJs: true,
  checkJs: true,
  target: ts.ScriptTarget.ES2015,
  module: ts.ModuleKind.CommonJS,
};

compile(fileNames, options);
