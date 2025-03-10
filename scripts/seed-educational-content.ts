/* eslint-disable @typescript-eslint/no-require-imports */
// scripts/seed-educational-content.ts
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Como não podemos usar o enum ProductType diretamente com require, vamos defini-lo:
const ProductType = {
  COURSE: "COURSE",
  TOOL: "TOOL",
  EVALUATION: "EVALUATION",
};

async function main() {
  try {
    // Criar produtos (cursos e ferramentas)
    const dayTradingCourse = await prisma.product.create({
      data: {
        name: "Day Trading: Do Zero ao Avançado",
        description: "Aprenda a operar day trade de forma segura e lucrativa",
        type: ProductType.COURSE,
        slug: "day-trading-zero-ao-avancado",
      },
    });

    const swingTradingCourse = await prisma.product.create({
      data: {
        name: "Swing Trading para Traders Iniciantes",
        description: "Estratégias e técnicas para posições de médio prazo",
        type: ProductType.COURSE,
        slug: "swing-trading-iniciantes",
      },
    });

    const planilhaB3 = await prisma.product.create({
      data: {
        name: "Planilha de Aprovação B3",
        description: "Ferramenta especializada para traders B3",
        type: ProductType.TOOL,
        slug: "planilha-aprovacao-b3",
      },
    });

    const planilhaFX = await prisma.product.create({
      data: {
        name: "Planilha de Aprovação FX",
        description: "Ferramenta especializada para traders Forex",
        type: ProductType.TOOL,
        slug: "planilha-aprovacao-fx",
      },
    });

    // Criar módulos para os cursos
    const dtModule1 = await prisma.module.create({
      data: {
        title: "Fundamentos do Day Trading",
        description: "Conceitos básicos e preparação",
        sortOrder: 1,
        productId: dayTradingCourse.id,
      },
    });

    const dtModule2 = await prisma.module.create({
      data: {
        title: "Análise Técnica para Day Trading",
        description: "Identificando padrões e oportunidades",
        sortOrder: 2,
        productId: dayTradingCourse.id,
      },
    });

    const swModule1 = await prisma.module.create({
      data: {
        title: "Introdução ao Swing Trading",
        description: "Diferenças entre operações de curto e médio prazo",
        sortOrder: 1,
        productId: swingTradingCourse.id,
      },
    });

    // Adicionar conteúdos
    // Para o curso de Day Trading
    await prisma.content.createMany({
      data: [
        {
          title: "Boas-vindas ao curso",
          description: "Introdução e organização do curso",
          type: "video",
          path: "https://player-vz-7b362a62-4f9.tv.pandavideo.com.br/embed/?v=abc123",
          sortOrder: 1,
          productId: dayTradingCourse.id,
          moduleId: dtModule1.id,
        },
        {
          title: "Configuração da plataforma",
          description: "Como configurar seus gráficos e indicadores",
          type: "video",
          path: "https://player-vz-7b362a62-4f9.tv.pandavideo.com.br/embed/?v=def456",
          sortOrder: 2,
          productId: dayTradingCourse.id,
          moduleId: dtModule1.id,
        },
        {
          title: "Material de apoio - Módulo 1",
          description: "PDF com resumo dos conceitos fundamentais",
          type: "file",
          path: "day-trading/material-modulo1.pdf",
          sortOrder: 3,
          productId: dayTradingCourse.id,
          moduleId: dtModule1.id,
        },
        {
          title: "Padrões gráficos essenciais",
          description: "Reconhecendo e operando padrões",
          type: "video",
          path: "https://player-vz-7b362a62-4f9.tv.pandavideo.com.br/embed/?v=ghi789",
          sortOrder: 1,
          productId: dayTradingCourse.id,
          moduleId: dtModule2.id,
        },
      ],
    });

    // Para o curso de Swing Trading
    await prisma.content.createMany({
      data: [
        {
          title: "O que é Swing Trading",
          description: "Definição e vantagens",
          type: "video",
          path: "https://player-vz-7b362a62-4f9.tv.pandavideo.com.br/embed/?v=jkl012",
          sortOrder: 1,
          productId: swingTradingCourse.id,
          moduleId: swModule1.id,
        },
        {
          title: "Guia Rápido Swing Trading",
          description: "PDF com as principais estratégias",
          type: "file",
          path: "swing-trading/guia-rapido.pdf",
          sortOrder: 2,
          productId: swingTradingCourse.id,
          moduleId: swModule1.id,
        },
      ],
    });

    // Para as planilhas
    await prisma.content.createMany({
      data: [
        {
          title: "Planilha de Gerenciamento B3",
          description: "Excel para controle de operações na B3",
          type: "file",
          path: "planilhas/planilha_b3_v1.xlsx",
          sortOrder: 1,
          productId: planilhaB3.id,
        },
        {
          title: "Manual de Utilização - B3",
          description: "Como usar a planilha de aprovação B3",
          type: "file",
          path: "planilhas/manual_planilha_b3.pdf",
          sortOrder: 2,
          productId: planilhaB3.id,
        },
        {
          title: "Planilha de Gerenciamento FX",
          description: "Excel para controle de operações Forex",
          type: "file",
          path: "planilhas/planilha_fx_v1.xlsx",
          sortOrder: 1,
          productId: planilhaFX.id,
        },
      ],
    });

    // Atribuir produtos a alguns usuários para teste
    // Você pode obter um ID de usuário real do seu banco de dados
    // Descomente o código abaixo substituindo USER_ID pelo ID real

    const testUserId = "cm6jhilpv0002vyr4vy238va4";
    await prisma.userProduct.createMany({
      data: [
        {
          userId: testUserId,
          productId: dayTradingCourse.id,
        },
        {
          userId: testUserId,
          productId: planilhaB3.id,
        },
      ],
    });

    console.log("Dados educacionais semeados com sucesso!");
  } catch (error) {
    console.error("Erro ao semear dados:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
