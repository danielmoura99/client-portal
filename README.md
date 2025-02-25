# Portal do Cliente

<div align="center">
  <p align="center">
    <strong>Portal de clientes</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-15.1.0-black?style=flat-square&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react" alt="React">
    <img src="https://img.shields.io/badge/Prisma-6.1.0-2D3748?style=flat-square&logo=prisma" alt="Prisma">
    <img src="https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/Tailwind-3.4.1-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS">
  </p>
</div>

## 📋 Sobre o Projeto

O **Portal do Cliente** é uma aplicação web completa para interface com clientes. Desenvolvido com tecnologias modernas, o sistema permite que traders acompanhem suas avaliações, visualizem métricas de desempenho, acessem conteúdo educacional e interajam diretamente com a equipe de suporte.

### ✨ Recursos Principais

- **Autenticação Segura**: Sistema completo com login, registro, recuperação de senha e gestão de sessões
- **Dashboard Personalizado**: Visão geral das avaliações em andamento e seu progresso
- **Gestão de Avaliações**: Acompanhamento detalhado de cada avaliação de trading
- **Sistema de Solicitações**: Canal direto de comunicação com a equipe de suporte
- **Conteúdo Educacional**: Acesso a vídeos e materiais de treinamento
- **Área de Perfil**: Gerenciamento de informações pessoais
- **Design Responsivo**: Interface adaptada para todos os dispositivos

## 🖥️ Tecnologias

O projeto foi construído com as seguintes tecnologias:

- **Frontend**:

  - Next.js 15.1 (App Router)
  - React 18
  - TypeScript
  - Tailwind CSS
  - shadcn/ui (componentes)
  - Lucide React (ícones)

- **Backend**:

  - Prisma ORM
  - NextAuth.js
  - Node.js
  - PostgreSQL
  - API Rest

- **Outros**:
  - React Hook Form
  - Zod (validação)
  - React Email
  - Nodemailer

## 🏗️ Arquitetura

O projeto segue uma arquitetura moderna baseada em:

- **App Router do Next.js**: Para roteamento e rendering
- **Server Components**: Para otimização de performance
- **Server Actions**: Para funções do lado do servidor
- **Autenticação JWT**: Para gerenciamento de sessões
- **API Routes**: Para endpoints backend
- **ORM com Prisma**: Para interação com banco de dados
- **Middleware**: Para proteção de rotas e regras de negócio

## 📱 Recursos da Interface

<div align="center">
  <table>
    <tr>
      <td align="center">
        <strong>Login Seguro</strong><br/>
        Sistema completo de autenticação
      </td>
      <td align="center">
        <strong>Dashboard</strong><br/>
        Visão geral das avaliações e progresso
      </td>
      <td align="center">
        <strong>Gerenciamento de Avaliações</strong><br/>
        Acompanhamento detalhado das métricas
      </td>
    </tr>
    <tr>
      <td align="center">
        <strong>Central de Suporte</strong><br/>
        Sistema de solicitações e comunicação
      </td>
      <td align="center">
        <strong>Área Educacional</strong><br/>
        Acesso a vídeos e conteúdos
      </td>
      <td align="center">
        <strong>Perfil do Usuário</strong><br/>
        Gerenciamento de dados pessoais
      </td>
    </tr>
  </table>
</div>

## 🚀 Instalação e Uso

### Pré-requisitos

- Node.js 18+
- PostgreSQL
- Yarn ou NPM

### Configuração do Ambiente

Clone o repositório:

```bash
git clone https://github.com/seu-usuario/
cd traders-house-portal
```

Instale as dependências:

```bash
npm install
# ou
yarn
```

Configure as variáveis de ambiente:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações.

### Inicialização do Banco de Dados

```bash
npx prisma migrate dev
```

### Execução do Projeto

```bash
npm run dev
# ou
yarn dev
```

Acesse o projeto em [http://localhost:3000](http://localhost:3000)

## 🔒 Recursos de Segurança

- Autenticação via JWT
- Proteção contra CSRF
- Hashing de senhas com bcrypt
- Validação de entrada com Zod
- Recuperação segura de senha
- Autorização baseada em roles
- Middleware de proteção de rotas

## 🧪 Testes

```bash
npm run test
# ou
yarn test
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido por Daniel Moura(https://github.com/danielmoura99).

---

<div align="center">
  <p>© 2025 Daniel Moura. Todos os direitos reservados.</p>
</div>
