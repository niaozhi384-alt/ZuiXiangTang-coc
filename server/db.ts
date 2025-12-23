import { eq, desc, and, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InsertUser, users, admins, registrations, rewards, settings, InsertAdmin, InsertRegistration, InsertReward, InsertSetting } from "../drizzle/schema";
import * as crypto from 'crypto';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: Pool | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== User Functions ====================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    
    if (existing.length > 0) {
      await db.update(users).set({
        name: user.name ?? existing[0].name,
        email: user.email ?? existing[0].email,
        loginMethod: user.loginMethod ?? existing[0].loginMethod,
        lastSignedIn: new Date(),
        updatedAt: new Date(),
      }).where(eq(users.openId, user.openId));
    } else {
      await db.insert(users).values({
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        lastSignedIn: new Date(),
      });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== Admin Functions ====================
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function getAdminByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function validateAdminCredentials(email: string, password: string) {
  const admin = await getAdminByEmail(email);
  if (!admin) return null;
  
  const passwordHash = hashPassword(password);
  if (admin.passwordHash !== passwordHash) return null;
  
  const db = await getDb();
  if (db) {
    await db.update(admins).set({ lastLoginAt: new Date() }).where(eq(admins.id, admin.id));
  }
  
  return admin;
}

export async function createAdmin(email: string, password: string, name?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const passwordHash = hashPassword(password);
  await db.insert(admins).values({
    email,
    passwordHash,
    name: name || null,
  });
}

export async function ensureDefaultAdmin() {
  const db = await getDb();
  if (!db) return;
  
  const defaultEmail = "niaozhi384@gmail.com";
  const defaultPassword = "Qwe132137489910@";
  
  const existing = await getAdminByEmail(defaultEmail);
  if (!existing) {
    await createAdmin(defaultEmail, defaultPassword, "管理员");
    console.log("[Database] Default admin created");
  }
}

// ==================== Registration Functions ====================
export async function createRegistration(data: Omit<InsertRegistration, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(registrations).values(data);
  return result;
}

export async function findRegistrationByGameName(gameName: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(registrations)
    .where(eq(registrations.gameName, gameName))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getRegistrations(filters?: { status?: string; level?: number; search?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(registrations);
  
  const conditions = [];
  
  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(registrations.status, filters.status as 'pending' | 'approved' | 'rejected'));
  }
  
  if (filters?.level && filters.level > 0) {
    conditions.push(eq(registrations.townHallLevel, filters.level));
  }
  
  if (filters?.search) {
    conditions.push(like(registrations.gameName, `%${filters.search}%`));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return await query.orderBy(desc(registrations.createdAt));
}

export async function getRegistrationsForExport() {
  const db = await getDb();
  if (!db) return [];
  
  const all = await db.select().from(registrations).orderBy(desc(registrations.createdAt));
  
  return all.map(r => ({
    序号: r.id,
    游戏昵称: r.gameName,
    大本营等级: `${r.townHallLevel}本`,
    备注: r.remarks || '',
    状态: r.status === 'pending' ? '待审核' : r.status === 'approved' ? '已通过' : '已拒绝',
    报名时间: r.createdAt.toLocaleString('zh-CN'),
  }));
}

export async function getRegistrationStats() {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, approved: 0, rejected: 0 };
  
  const all = await db.select().from(registrations);
  
  return {
    total: all.length,
    pending: all.filter(r => r.status === 'pending').length,
    approved: all.filter(r => r.status === 'approved').length,
    rejected: all.filter(r => r.status === 'rejected').length,
  };
}

export async function getTownHallDistribution() {
  const db = await getDb();
  if (!db) return [];
  
  const all = await db.select().from(registrations);
  
  const distribution: Record<number, number> = {};
  all.forEach(r => {
    distribution[r.townHallLevel] = (distribution[r.townHallLevel] || 0) + 1;
  });
  
  return Object.entries(distribution).map(([level, count]) => ({
    level: parseInt(level),
    count,
  })).sort((a, b) => a.level - b.level);
}

export async function updateRegistrationStatus(id: number, status: 'approved' | 'rejected', adminId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(registrations).set({
    status,
    reviewedAt: new Date(),
    reviewedBy: adminId,
    updatedAt: new Date(),
  }).where(eq(registrations.id, id));
}

export async function deleteRegistration(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(registrations).where(eq(registrations.id, id));
}

// ==================== Reward Functions ====================
export async function createReward(data: Omit<InsertReward, 'id' | 'createdAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(rewards).values(data);
}

export async function getRewards() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(rewards).orderBy(desc(rewards.rewardTime));
}

export async function getRewardStats() {
  const db = await getDb();
  if (!db) return { totalAmount: 0, totalCount: 0, typeCount: 0, byType: [] as { type: string; count: number; amount: number }[] };
  
  const all = await db.select().from(rewards);
  
  const byType: Record<string, { count: number; amount: number }> = {};
  let totalAmount = 0;
  
  all.forEach(r => {
    const amount = parseFloat(r.amount);
    totalAmount += amount;
    
    if (!byType[r.rewardType]) {
      byType[r.rewardType] = { count: 0, amount: 0 };
    }
    byType[r.rewardType].count += 1;
    byType[r.rewardType].amount += amount;
  });
  
  return {
    totalAmount,
    totalCount: all.length,
    typeCount: Object.keys(byType).length,
    byType: Object.entries(byType).map(([type, data]) => ({
      type,
      count: data.count,
      amount: data.amount,
    })),
  };
}

export async function deleteReward(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(rewards).where(eq(rewards.id, id));
}

// ==================== Settings Functions ====================
export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result.length > 0 ? result[0].value : null;
}

export async function setSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  
  if (existing.length > 0) {
    await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}

export async function getRegistrationOpen(): Promise<boolean> {
  const value = await getSetting('registration_open');
  return value === 'true';
}

export async function setRegistrationOpen(open: boolean) {
  await setSetting('registration_open', open ? 'true' : 'false');
}

export async function getRegistrationDeadline(): Promise<string | null> {
  return await getSetting('registration_deadline');
}

export async function setRegistrationDeadline(deadline: string | null) {
  if (deadline === null) {
    const db = await getDb();
    if (db) {
      await db.delete(settings).where(eq(settings.key, 'registration_deadline'));
    }
  } else {
    await setSetting('registration_deadline', deadline);
  }
}

export async function getContentSettings() {
  const announcement = await getSetting('announcement');
  const rewardMechanism = await getSetting('reward_mechanism');
  const clanFeatures = await getSetting('clan_features');
  
  return {
    announcement: announcement || '联赛报名进行中，请各位成员积极参与！',
    rewardMechanism: rewardMechanism || '竞赛第一五元、联赛第一金月卡',
    clanFeatures: clanFeatures || '五湖四海皆兄弟，醉乡堂里认神州 🇨🇳\nClash of Clans 专业部落联盟，兼顾竞技与休闲，欢迎COC爱好者加入',
  };
}

// ==================== Town Hall Level Range Functions ====================
export async function getTownHallLevelRange(): Promise<{ min: number; max: number }> {
  const minLevel = await getSetting('town_hall_min_level');
  const maxLevel = await getSetting('town_hall_max_level');
  
  return {
    min: minLevel ? parseInt(minLevel) : 1,
    max: maxLevel ? parseInt(maxLevel) : 17,
  };
}

export async function setTownHallLevelRange(min: number, max: number) {
  await setSetting('town_hall_min_level', min.toString());
  await setSetting('town_hall_max_level', max.toString());
}

// Initialize default settings
export async function ensureDefaultSettings() {
  const db = await getDb();
  if (!db) return;
  
  const openValue = await getSetting('registration_open');
  if (openValue === null) {
    await setSetting('registration_open', 'true');
  }
  
  const deadlineValue = await getSetting('registration_deadline');
  if (deadlineValue === null) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    await setSetting('registration_deadline', deadline.toISOString());
  }
  
  const announcement = await getSetting('announcement');
  if (announcement === null) {
    await setSetting('announcement', '联赛报名进行中，请各位成员积极参与！');
  }
  
  const rewardMechanism = await getSetting('reward_mechanism');
  if (rewardMechanism === null) {
    await setSetting('reward_mechanism', '竞赛第一五元、联赛第一金月卡');
  }
  
  const clanFeatures = await getSetting('clan_features');
  if (clanFeatures === null) {
    await setSetting('clan_features', '五湖四海皆兄弟，醉乡堂里认神州 🇨🇳\nClash of Clans 专业部落联盟，兼顾竞技与休闲，欢迎COC爱好者加入');
  }
  
  const minLevel = await getSetting('town_hall_min_level');
  if (minLevel === null) {
    await setSetting('town_hall_min_level', '1');
  }
  
  const maxLevel = await getSetting('town_hall_max_level');
  if (maxLevel === null) {
    await setSetting('town_hall_max_level', '17');
  }
}
