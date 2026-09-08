import {registerHooks} from 'node:module';
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

// Exercise production source directly, including Vite-style extensionless imports.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try { return nextResolve(specifier, context); }
    catch (error) {
      if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
        for (const extension of ['.ts', '.tsx']) {
          const url = new URL(specifier + extension, context.parentURL);
          if (existsSync(fileURLToPath(url))) return {url: url.href, shortCircuit: true};
        }
      }
      throw error;
    }
  },
  load(url, context, nextLoad) {
    if (url.startsWith('file:') && /\.tsx?$/.test(url)) return {
      format: 'module', shortCircuit: true,
      source: ts.transpileModule(readFileSync(fileURLToPath(url), 'utf8'), {compilerOptions: {target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX}}).outputText,
    };
    return nextLoad(url, context);
  },
});
