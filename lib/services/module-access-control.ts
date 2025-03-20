// lib/services/module-access-control.ts
import { prisma } from "@/lib/prisma";

/**
 * Verifica se um módulo específico deve estar acessível para um usuário
 * com base nas regras de liberação programada.
 */
export async function checkModuleAccess(
  userId: string,
  moduleId: string
): Promise<boolean> {
  // Buscar o módulo com suas configurações de acesso
  const moduleItem = await prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      id: true,
      immediateAccess: true,
      releaseAfterDays: true,
      productId: true,
    },
  });

  if (!moduleItem) {
    return false;
  }

  // Se o módulo tem acesso imediato, permitir
  if (moduleItem.immediateAccess) {
    return true;
  }

  // Se o módulo não tem acesso imediato, verificar o tempo de espera
  if (moduleItem.releaseAfterDays !== null) {
    // Buscar quando o usuário recebeu acesso ao produto
    const accessLog = await prisma.userProductAccessLog.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: moduleItem.productId,
        },
      },
    });

    if (!accessLog) {
      return false;
    }

    // Calcular se já passou o tempo necessário
    const accessDate = new Date(accessLog.accessGrantedAt);
    const waitPeriod = moduleItem.releaseAfterDays * 24 * 60 * 60 * 1000; // Converter dias para milissegundos
    const unlockDate = new Date(accessDate.getTime() + waitPeriod);
    const now = new Date();

    return now >= unlockDate;
  }

  // Se não tem acesso imediato e não há regra de liberação, negar acesso
  return false;
}

/**
 * Registra o acesso de um usuário a um produto (chamado quando o acesso é concedido)
 */
export async function logUserProductAccess(
  userId: string,
  productId: string
): Promise<void> {
  try {
    // Usar upsert para criar ou atualizar o registro se já existir
    await prisma.userProductAccessLog.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {
        // Atualizar a data se o registro já existir
        accessGrantedAt: new Date(),
      },
      create: {
        userId,
        productId,
        accessGrantedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Erro ao registrar acesso do usuário ao produto:", error);
    throw error;
  }
}

/**
 * Obtém a data de quando um usuário ganhou acesso a um produto
 */
export async function getProductAccessDate(
  userId: string,
  productId: string
): Promise<Date | null> {
  const accessLog = await prisma.userProductAccessLog.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  return accessLog ? accessLog.accessGrantedAt : null;
}

/**
 * Calcula a data de liberação de um módulo
 */
export function calculateModuleReleaseDate(
  accessDate: Date,
  releaseAfterDays: number | null
): Date | null {
  if (releaseAfterDays === null) {
    return null;
  }

  const releaseDate = new Date(accessDate);
  releaseDate.setDate(releaseDate.getDate() + releaseAfterDays);
  return releaseDate;
}

/**
 * Verifica todos os módulos de um produto e retorna quais estão acessíveis
 */
export async function getAccessibleModules(
  userId: string,
  productId: string
): Promise<string[]> {
  // Buscar todos os módulos do produto
  const modules = await prisma.module.findMany({
    where: { productId },
    select: {
      id: true,
      immediateAccess: true,
      releaseAfterDays: true,
    },
  });

  // Buscar o log de acesso do usuário
  const accessLog = await prisma.userProductAccessLog.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (!accessLog) {
    // Se não há registro de acesso, retornar apenas os módulos com acesso imediato
    return modules
      .filter((module) => module.immediateAccess)
      .map((module) => module.id);
  }

  // Calcular quais módulos estão acessíveis baseado no tempo desde o acesso
  const accessDate = accessLog.accessGrantedAt;
  const now = new Date();

  return modules
    .filter((module) => {
      if (module.immediateAccess) {
        return true;
      }

      if (module.releaseAfterDays !== null) {
        const releaseDate = new Date(accessDate);
        releaseDate.setDate(releaseDate.getDate() + module.releaseAfterDays);
        return now >= releaseDate;
      }

      return false;
    })
    .map((module) => module.id);
}
