"use strict";
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
// tslint:disable:readonly-array max-classes-per-file no-useless-cast no-use-before-declare cognitive-complexity
var Lint = require("tslint");
var ts = require("typescript");
function getPromiseType(t) {
    var matches = t.match(/^Promise<(.*)>$/);
    return matches && matches[1] ? matches[1] : undefined;
}
var Walker = /** @class */ (function (_super) {
    __extends(Walker, _super);
    function Walker(sourceFile, ruleName, options, checker) {
        var _this = _super.call(this, sourceFile, ruleName, options) || this;
        _this.checker = checker;
        return _this;
    }
    Walker.prototype.walk = function (sourceFile) {
        var _this = this;
        var cb = function (node) {
            switch (node.kind) {
                case ts.SyntaxKind.YieldExpression:
                    _this.checkYield(node);
            }
            return ts.forEachChild(node, cb);
        };
        return ts.forEachChild(sourceFile, cb);
    };
    Walker.prototype.typeToString = function (t) {
        return this.checker.typeToString(t, undefined, 
        // tslint:disable-next-line:no-bitwise
        ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseFullyQualifiedType);
    };
    Walker.prototype.checkYield = function (node) {
        var _this = this;
        var yieldRightExpression = node.expression;
        if (!yieldRightExpression ||
            yieldRightExpression.kind !== ts.SyntaxKind.CallExpression) {
            // not a yield of a function call
            return false;
        }
        var yieldRightCall = yieldRightExpression;
        if (yieldRightCall.expression.kind !== ts.SyntaxKind.Identifier) {
            // not a yield of a call of an immediate identifier
            return false;
        }
        var yieldRightCallIdentifier = yieldRightCall.expression;
        if (yieldRightCallIdentifier.text !== "select" &&
            yieldRightCallIdentifier.text !== "call") {
            // neither a yield select() nor yield call()
            return false;
        }
        //
        // node matches: yield select(f) or yield call(f)
        //
        // return types of the function
        var callArguments = yieldRightCall.arguments;
        if (!callArguments || callArguments.length === 0) {
            // select() has no arguments
            return false;
        }
        var firstCallArgument = callArguments[0];
        var firstCallArgumentType = this.checker.getTypeAtLocation(firstCallArgument);
        var firstCallArgSignatures = firstCallArgumentType.getCallSignatures();
        if (firstCallArgSignatures.length === 0) {
            // no call signatures, not a function?
            return false;
        }
        var firstCallArgReturnTypes = firstCallArgSignatures.map(function (s) {
            return s.getReturnType();
        });
        var firstCallArgReturnTypesNames = firstCallArgReturnTypes.map(function (t) {
            return _this.typeToString(t);
        });
        var returnType = yieldRightCallIdentifier.text === "call"
            ? getPromiseType(firstCallArgReturnTypesNames[0])
            : firstCallArgReturnTypesNames[0];
        if (yieldRightCallIdentifier.text === "call" &&
            (returnType === undefined ||
                returnType === "void" ||
                returnType === "never")) {
            // function does not return a Promise or returns a Promise<void>
            // TODO: possibly check instead that it returns an Iterator<Effect>
            return false;
        }
        //
        // check assignment to a variable
        //
        var yieldParent = node.parent;
        if (!yieldParent) {
            // a yield without a parent...
            // should never happen, in case it happens we skip it
            return false;
        }
        if (yieldParent.kind !== ts.SyntaxKind.VariableDeclaration) {
            // not assigning the result to a variable
            this.addFailureAtNode(node, "results of yield calls to redux-saga select() or call() must not be ignored");
            return false;
        }
        var yieldVarDeclaration = yieldParent;
        if (!yieldVarDeclaration.type) {
            // variable declaration does not specify type
            this.addFailureAtNode(yieldVarDeclaration, "results of yield calls to redux-saga select() or call() must have an explicit type");
            return false;
        }
        // type of the variabile
        var yieldVarDeclarationType = this.checker.getTypeAtLocation(yieldVarDeclaration);
        var yieldVarDeclarationTypeName = this.typeToString(yieldVarDeclarationType);
        if (yieldVarDeclarationTypeName !== returnType) {
            // types don't match
            this.addFailureAtNode(yieldVarDeclaration, "results of yield calls to redux-saga select(f) or call(f) must match return type of f: '" + firstCallArgReturnTypesNames[0] + "' cannot be assigned to '" + yieldVarDeclarationTypeName + "'");
            return false;
        }
        return false;
    };
    return Walker;
}(Lint.AbstractWalker));
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.applyWithProgram = function (sourceFile, program) {
        return this.applyWithWalker(new Walker(sourceFile, this.ruleName, this.ruleArguments, program.getTypeChecker()));
    };
    /* tslint:disable:object-literal-sort-keys */
    Rule.metadata = {
        ruleName: "saga-yield-return-type",
        description: "Warns if a type assertion does not change the type of an expression.",
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
    Rule.FAILURE_STRING = "yield select requires return type";
    return Rule;
}(Lint.Rules.TypedRule));
exports.Rule = Rule;
