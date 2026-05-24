const { prisma } = require('../config/database');
const logger = require('../utils/logger');

class ProfileService {
  
  async getOrCreateProfile(userId, username) {
    let profile = await prisma.profile.findUnique({ where: { userId } });
    
    if (!profile) {
      profile = await prisma.profile.create({
        data: { userId, username }
      });
      logger.info(`Perfil creado para usuario ${userId}`);
    }
    
    return profile;
  }

  async getProfile(userId) {
    return prisma.profile.findUnique({
      where: { userId },
      include: { achievements: { include: { achievement: true } } }
    });
  }

  async addXP(userId, amount) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Perfil no encontrado');

    let { xp, level } = profile;
    xp += amount;
    let leveledUp = false;

    // Fórmula: XP necesaria = 100 * nivel^1.5
    const xpForNextLevel = () => Math.floor(100 * Math.pow(level, 1.5));

    while (xp >= xpForNextLevel()) {
      xp -= xpForNextLevel();
      level++;
      leveledUp = true;
    }

    const updated = await prisma.profile.update({
      where: { userId },
      data: { xp, level }
    });

    if (leveledUp) {
      logger.info(`Usuario ${userId} subió al nivel ${level}`);
    }

    return { profile: updated, leveledUp };
  }

  async addCredits(userId, amount, reason = '') {
    return prisma.profile.update({
      where: { userId },
      data: { creditsArcade: { increment: amount } }
    });
  }

  async deductCredits(userId, amount) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    
    if (profile.creditsArcade < amount) {
      throw new Error('Saldo insuficiente');
    }

    return prisma.profile.update({
      where: { userId },
      data: { creditsArcade: { decrement: amount } }
    });
  }

  async getBalance(userId) {
    const profile = await prisma.profile.findUnique({ 
      where: { userId },
      select: { creditsArcade: true }
    });
    return profile?.creditsArcade || 0;
  }

  async recordTournamentResult(userId, won) {
    return prisma.profile.update({
      where: { userId },
      data: {
        tournamentsPlayed: { increment: 1 },
        tournamentsWon: won ? { increment: 1 } : undefined
      }
    });
  }

  async checkAchievements(userId, eventType, eventData) {
    const achievements = await prisma.achievement.findMany({ 
      where: { isActive: true } 
    });
    
    const unlocked = [];
    
    for (const achievement of achievements) {
      const alreadyUnlocked = await prisma.userAchievement.findFirst({
        where: { userId, achievementId: achievement.id }
      });

      if (alreadyUnlocked) continue;

      // Lógica simple de verificación (se puede expandir)
      const criteria = achievement.criteria;
      if (criteria.type === eventType) {
        // Desbloquear logro
        await prisma.userAchievement.create({
          data: { userId, achievementId: achievement.id }
        });

        // Dar recompensas
        if (achievement.xpReward > 0) await this.addXP(userId, achievement.xpReward);
        if (achievement.creditReward > 0) await this.addCredits(userId, achievement.creditReward);

        unlocked.push(achievement);
        logger.info(`Logro desbloqueado: ${achievement.name} para ${userId}`);
      }
    }

    return unlocked;
  }
}

module.exports = new ProfileService();
