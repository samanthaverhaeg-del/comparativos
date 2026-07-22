# Sistema de Comparativos — Qive

## Estrutura de pastas

```
comparativos/                       ← raiz do repositório
├── index.html                      ← GERADO automaticamente (não editar à mão)
├── build.js                        ← script que gera as páginas
├── .github/workflows/build.yml     ← roda o build.js a cada push
├── assets/
│   ├── auth.css                    ← estilo da tela de senha
│   └── auth.js                     ← lógica da tela de senha
│
├── whatsapp-gtm-grt/                ← 1 pasta por campanha
│   ├── campanha.json                ← metadados da campanha (você edita)
│   ├── index.html                   ← GERADO automaticamente (não editar à mão)
│   └── whatsapp-gtm-grt.html        ← o comparativo em si (seu HTML de análise)
│
└── outra-campanha/
    ├── campanha.json
    ├── index.html                   ← gerado
    ├── comparativo-1.html
    └── comparativo-2.html
```

## Como adicionar um novo comparativo numa campanha existente

1. Suba o HTML do comparativo dentro da pasta da campanha (ex: `whatsapp-gtm-grt/novo-teste.html`)
2. Abra o `campanha.json` dessa pasta e adicione um item na lista `comparativos`:

```json
{
  "arquivo": "novo-teste.html",
  "nome": "Nome do novo comparativo",
  "data": "Ago 2026",
  "canal": "E-mail"
}
```

3. **Importante:** no `<head>` do HTML do comparativo, adicione estas duas linhas (senão a senha não vai proteger essa página):

```html
<link rel="stylesheet" href="../assets/auth.css">
<script src="../assets/auth.js" defer></script>
```

4. Dê commit e push. O GitHub Actions roda o `build.js` sozinho e atualiza a página da campanha e a página inicial.

## Como criar uma campanha nova

1. Crie uma pasta na raiz (ex: `email-onboarding-agosto/`)
2. Dentro dela, crie o `campanha.json`:

```json
{
  "nome": "Nome da Campanha",
  "comparativos": []
}
```

3. Suba os HTMLs dos comparativos nessa pasta e adicione cada um na lista `comparativos` do `campanha.json` (mesmo formato do passo anterior)
4. Não esqueça as duas linhas do `auth.css`/`auth.js` no `<head>` de cada comparativo
5. Commit e push — a campanha aparece sozinha na página inicial

## Senha

- Senha atual: **478569**
- Fica salva no navegador (`localStorage`) do domínio `samanthaverhaeg-del.github.io`
- Por isso funciona em qualquer página deste repositório automaticamente — não precisa digitar de novo ao navegar entre campanha e comparativos
- Pra trocar a senha, edite a constante `CORRECT_PIN` em `assets/auth.js`

## O que NÃO editar manualmente

- `index.html` da raiz
- `index.html` dentro de cada pasta de campanha

Esses dois são sobrescritos automaticamente pelo `build.js` a cada push. Se editar à mão, a próxima atualização apaga sua edição.

## Rodando localmente (opcional, pra testar antes de subir)

```bash
node build.js
```

Gera os `index.html` na hora, sem precisar esperar o GitHub Actions.
