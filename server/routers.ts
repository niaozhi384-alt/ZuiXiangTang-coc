import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db.js";
import { SignJWT, jwtVerify } from 'jose';
import type { Request, Response } from "express";
import superjson from "superjson";

// Context type
export type TrpcContext = {
  req: Request;
  res: Response;
};

// Initialize tRPC
const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const ADMIN_COOKIE_NAME = "admin_session";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'zuixiangtang-secret-key');

// Initialize default admin and settings on server start
(async () => {
  try {
    await db.ensureDefaultAdmin();
    await db.ensureDefaultSettings();
    console.log("[Init] Default admin and settings initialized");
  } catch (error) {
    console.error("[Init] Failed to initialize defaults:", error);
  }
})();

// Helper to create admin JWT
async function createAdminToken(adminId: number, email: string) {
  return await new SignJWT({ adminId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

// Helper to verify admin JWT
async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { adminId: number; email: string };
  } catch {
    return null;
  }
}

// Admin procedure that checks admin session
const adminProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const token = ctx.req.cookies?.[ADMIN_COOKIE_NAME];
  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: '请先登录管理员账号' });
  }
  
  const payload = await verifyAdminToken(token);
  if (!payload) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: '登录已过期，请重新登录' });
  }
  
  return next({
    ctx: {
      ...ctx,
      admin: payload,
    },
  });
});

export const appRouter = router({
  // ==================== Admin Auth ====================
  admin: router({
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const admin = await db.validateAdminCredentials(input.email, input.password);
        if (!admin) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: '邮箱或密码错误' });
        }
        
        const token = await createAdminToken(admin.id, admin.email);
        
        ctx.res.cookie(ADMIN_COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          path: '/',
        });
        
        return { success: true, admin: { id: admin.id, email: admin.email, name: admin.name } };
      }),
    
    logout: publicProcedure.mutation(async ({ ctx }) => {
      ctx.res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
      return { success: true };
    }),
    
    me: publicProcedure.query(async ({ ctx }) => {
      const token = ctx.req.cookies?.[ADMIN_COOKIE_NAME];
      if (!token) return null;
      
      const payload = await verifyAdminToken(token);
      if (!payload) return null;
      
      const admin = await db.getAdminByEmail(payload.email);
      if (!admin) return null;
      
      return { id: admin.id, email: admin.email, name: admin.name };
    }),
  }),

  // ==================== Registration ====================
  registration: router({
    create: publicProcedure
      .input(z.object({
        gameName: z.string().min(1, "游戏昵称不能为空").max(100),
        townHallLevel: z.number().min(1).max(20),
        remarks: z.string().max(500).optional(),
      }))
      .mutation(async ({ input }) => {
        // Check if registration is open
        const isOpen = await db.getRegistrationOpen();
        if (!isOpen) {
          throw new TRPCError({ code: 'FORBIDDEN', message: '报名已关闭' });
        }
        
        // Check for duplicate registration
        const existing = await db.findRegistrationByGameName(input.gameName);
        if (existing) {
          throw new TRPCError({ code: 'CONFLICT', message: '该游戏昵称已报名，请勿重复报名' });
        }
        
        await db.createRegistration({
          gameName: input.gameName,
          townHallLevel: input.townHallLevel,
          remarks: input.remarks || null,
        });
        
        return { success: true };
      }),
    
    list: publicProcedure
      .input(z.object({
        status: z.string().optional(),
        level: z.number().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getRegistrations(input);
      }),
    
    stats: publicProcedure.query(async () => {
      return await db.getRegistrationStats();
    }),
    
    distribution: publicProcedure.query(async () => {
      return await db.getTownHallDistribution();
    }),
    
    export: adminProcedure.query(async () => {
      return await db.getRegistrationsForExport();
    }),
    
    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.updateRegistrationStatus(input.id, 'approved', ctx.admin.adminId);
        return { success: true };
      }),
    
    reject: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.updateRegistrationStatus(input.id, 'rejected', ctx.admin.adminId);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteRegistration(input.id);
        return { success: true };
      }),
  }),

  // ==================== Rewards ====================
  reward: router({
    list: publicProcedure.query(async () => {
      return await db.getRewards();
    }),
    
    stats: publicProcedure.query(async () => {
      return await db.getRewardStats();
    }),
    
    create: adminProcedure
      .input(z.object({
        playerName: z.string().min(1).max(100),
        rewardType: z.enum(['competition_first', 'league_first', 'other']),
        rewardName: z.string().min(1).max(100),
        amount: z.number().min(0),
        description: z.string().max(500).optional(),
        rewardTime: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createReward({
          playerName: input.playerName,
          rewardType: input.rewardType,
          rewardName: input.rewardName,
          amount: input.amount.toString(),
          description: input.description || null,
          rewardTime: new Date(input.rewardTime),
          createdBy: ctx.admin.adminId,
        });
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteReward(input.id);
        return { success: true };
      }),
  }),

  // ==================== Settings ====================
  settings: router({
    get: publicProcedure.query(async () => {
      const isOpen = await db.getRegistrationOpen();
      const deadline = await db.getRegistrationDeadline();
      const content = await db.getContentSettings();
      const levelRange = await db.getTownHallLevelRange();
      
      return {
        registrationOpen: isOpen,
        registrationDeadline: deadline,
        ...content,
        townHallMinLevel: levelRange.min,
        townHallMaxLevel: levelRange.max,
      };
    }),
    
    setRegistrationOpen: adminProcedure
      .input(z.object({ open: z.boolean() }))
      .mutation(async ({ input }) => {
        await db.setRegistrationOpen(input.open);
        return { success: true };
      }),
    
    setDeadline: adminProcedure
      .input(z.object({ deadline: z.string().nullable() }))
      .mutation(async ({ input }) => {
        await db.setRegistrationDeadline(input.deadline);
        return { success: true };
      }),
    
    updateContent: adminProcedure
      .input(z.object({
        key: z.enum(['announcement', 'reward_mechanism', 'clan_features']),
        value: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.setSetting(input.key, input.value);
        return { success: true };
      }),
    
    setTownHallLevelRange: adminProcedure
      .input(z.object({
        min: z.number().min(1).max(20),
        max: z.number().min(1).max(20),
      }))
      .mutation(async ({ input }) => {
        if (input.min > input.max) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: '最低等级不能大于最高等级' });
        }
        await db.setTownHallLevelRange(input.min, input.max);
        return { success: true };
      }),
    
    getTownHallLevelRange: publicProcedure.query(async () => {
      return await db.getTownHallLevelRange();
    }),
  }),
});

export type AppRouter = typeof appRouter;
