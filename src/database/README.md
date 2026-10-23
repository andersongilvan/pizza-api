# Migrations

Os arquivos ficam em `src/database/migrations`.

O schema não sincroniza sozinho (`synchronize: false`): toda mudança de entity precisa de uma migration. O CLI usa `src/database/data-source.ts` e as variáveis do `.env`.

## Comandos

Gerar a partir da diferença entre as entities e o banco (Postgres no ar):

```bash
npm run migration:generate --name=NomeDaMigration
```

Criar uma migration vazia, para SQL escrito à mão:

```bash
npm run migration:create --name=NomeDaMigration
```

Aplicar as migrations pendentes:

```bash
npm run migration:run
```

Desfazer a última migration aplicada:

```bash
npm run migration:revert
```
