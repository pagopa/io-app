/**
 * @license
 * Copyright 2016 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// tslint:disable:readonly-array max-classes-per-file no-useless-cast no-use-before-declare cognitive-complexity

import * as Lint from "tslint";
import * as ts from "typescript";

function getPromiseType(t: string): string | undefined {
  const matches = t.match(/^Promise<(.*)>$/);
  return matches && matches[1] ? matches[1] : undefined;
}

class Walker extends Lint.AbstractWalker<string[]> {
  constructor(
    sourceFile: ts.SourceFile,
    ruleName: string,
    options: string[],
    private readonly checker: ts.TypeChecker
  ) {
    super(sourceFile, ruleName, options);
  }

  public walk(sourceFile: ts.SourceFile) {
    const cb = (node: ts.Node): void => {
      switch (node.kind) {
        case ts.SyntaxKind.YieldExpression:
          this.checkYield(node as ts.YieldExpression);
      }

      return ts.forEachChild(node, cb);
    };

    return ts.forEachChild(sourceFile, cb);
  }

  private typeToString(t: ts.Type): string {
    return this.checker.typeToString(
      t,
      undefined,
      // tslint:disable-next-line:no-bitwise
      ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseFullyQualifiedType
    );
  }

  private checkYield(node: ts.YieldExpression): boolean {
    const yieldRightExpression = node.expression;
    if (
      !yieldRightExpression ||
      yieldRightExpression.kind !== ts.SyntaxKind.CallExpression
    ) {
      // not a yield of a function call
      return false;
    }

    const yieldRightCall = yieldRightExpression as ts.CallExpression;
    if (yieldRightCall.expression.kind !== ts.SyntaxKind.Identifier) {
      // not a yield of a call of an immediate identifier
      return false;
    }
    const yieldRightCallIdentifier = yieldRightCall.expression as ts.Identifier;
    if (
      yieldRightCallIdentifier.text !== "select" &&
      yieldRightCallIdentifier.text !== "call"
    ) {
      // neither a yield select() nor yield call()
      return false;
    }

    //
    // node matches: yield select(f) or yield call(f)
    //

    // return types of the function
    const callArguments = yieldRightCall.arguments;
    if (!callArguments || callArguments.length === 0) {
      // select() has no arguments
      return false;
    }

    const firstCallArgument = callArguments[0];

    const firstCallArgumentType = this.checker.getTypeAtLocation(
      firstCallArgument
    );

    const firstCallArgSignatures = firstCallArgumentType.getCallSignatures();
    if (firstCallArgSignatures.length === 0) {
      // no call signatures, not a function?
      return false;
    }

    const firstCallArgReturnTypes = firstCallArgSignatures.map(s =>
      s.getReturnType()
    );

    const firstCallArgReturnTypesNames = firstCallArgReturnTypes.map(t =>
      this.typeToString(t)
    );

    const returnType =
      yieldRightCallIdentifier.text === "call"
        ? getPromiseType(firstCallArgReturnTypesNames[0])
        : firstCallArgReturnTypesNames[0];

    if (
      yieldRightCallIdentifier.text === "call" &&
      (returnType === undefined ||
        returnType === "void" ||
        returnType === "never")
    ) {
      // function does not return a Promise or returns a Promise<void>
      // TODO: possibly check instead that it returns an Iterator<Effect>
      return false;
    }

    //
    // check assignment to a variable
    //

    const yieldParent = node.parent;
    if (!yieldParent) {
      // a yield without a parent...
      // should never happen, in case it happens we skip it
      return false;
    }

    if (yieldParent.kind !== ts.SyntaxKind.VariableDeclaration) {
      // not assigning the result to a variable
      this.addFailureAtNode(
        node,
        "results of yield calls to redux-saga select() or call() must not be ignored"
      );
      return false;
    }

    const yieldVarDeclaration = yieldParent as ts.VariableDeclaration;
    if (!yieldVarDeclaration.type) {
      // variable declaration does not specify type
      this.addFailureAtNode(
        yieldVarDeclaration,
        "results of yield calls to redux-saga select() or call() must have an explicit type"
      );
      return false;
    }

    // type of the variabile
    const yieldVarDeclarationType = this.checker.getTypeAtLocation(
      yieldVarDeclaration
    );

    const yieldVarDeclarationTypeName = this.typeToString(
      yieldVarDeclarationType
    );

    if (yieldVarDeclarationTypeName !== returnType) {
      // types don't match
      this.addFailureAtNode(
        yieldVarDeclaration,
        `results of yield calls to redux-saga select(f) or call(f) must match return type of f: '${
          firstCallArgReturnTypesNames[0]
        }' cannot be assigned to '${yieldVarDeclarationTypeName}'`
      );
      return false;
    }

    return false;
  }
}

export class Rule extends Lint.Rules.TypedRule {
  /* tslint:disable:object-literal-sort-keys */
  public static metadata: Lint.IRuleMetadata = {
    ruleName: "saga-yield-return-type",
    description:
      "Warns if a type assertion does not change the type of an expression.",
    options: {
      type: "list",
      listType: {
        type: "array",
        items: { type: "string" }
      }
    },
    optionsDescription: "A list of whitelisted assertion types to ignore",
    type: "typescript",
    hasFix: false,
    typescriptOnly: true,
    requiresTypeInfo: true
  };
  /* tslint:enable:object-literal-sort-keys */

  public static FAILURE_STRING = "yield select requires return type";

  public applyWithProgram(
    sourceFile: ts.SourceFile,
    program: ts.Program
  ): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new Walker(
        sourceFile,
        this.ruleName,
        this.ruleArguments,
        program.getTypeChecker()
      )
    );
  }
}
