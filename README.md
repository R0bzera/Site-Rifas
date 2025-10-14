SkinRifas (React + Vite)

Scripts

- dev: `npm run dev`
- build: `npm run build`
- preview: `npm run preview`

Páginas
- Login (`/login`): CPF, celular e senha com validação e máscara.
- Rifas (`/rifas`): lista de rifas ativas (skins CS2).
- Detalhe da rifa (`/rifas/:id`): informações e compra simulada.
- Minhas compras (`/minhas-compras`): histórico local.

Segurança (básico)
- Validação de CPF (dígitos verificadores) e celular (10/11 dígitos).
- Rotas protegidas via `ProtectedRoute` e sessão em `localStorage`.
- Em produção, substitua mocks por API segura (https), tokens httpOnly, rate limit e proteção CSRF.

Rodar localmente
1. Instale dependências: `npm install`
2. Suba dev server: `npm run dev`
3. Abra a URL exibida no terminal.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
