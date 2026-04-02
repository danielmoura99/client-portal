---
description: Convencoes gerais de codigo do projeto
---

# Estilo de Codigo

## TypeScript
- Strict mode habilitado
- Usar `interface` para objetos, `type` para unions/intersections
- Nao usar `any` — preferir `unknown` quando necessario
- Destructuring em imports e parametros

## Formatacao
- 2 espacos de indentacao
- Aspas duplas para strings em JSX, simples em JS/TS
- Trailing comma em arrays e objetos multi-linha
- Sem ponto-e-virgula (seguir padrao do projeto)

## Imports
- Sempre usar alias `@/` (nunca caminhos relativos com `../..`)
- Agrupar: 1) React/Next 2) Libs externas 3) Componentes internos 4) Types

## Naming
- Componentes: PascalCase
- Funcoes/variaveis: camelCase
- Arquivos de componente: kebab-case.tsx
- Server actions: camelCase com prefixo descritivo (fetchX, createX, updateX)
- Constantes: UPPER_SNAKE_CASE

## Git
- Commits em ingles com prefixo: feat:, fix:, chore:, refactor:, docs:
- Branch: feature/nome, fix/nome, chore/nome
