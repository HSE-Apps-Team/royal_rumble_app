"use server";

import { db } from "@/db";
import { adminData } from "@/db/schema";
import { eq } from "drizzle-orm";
import { toTitleCase } from "@/lib/toTitleCase";

// Read
export const getAdmins = async () => {
  const admins = await db.select().from(adminData);
  return admins;
};

export const getAdminById = async (adminId: number) => {
  const admin = await db
    .select()
    .from(adminData)
    .where(eq(adminData.adminId, adminId));
  return admin[0];
};

// Add
export const addAdmin = async (data: {
  f_name: string;
  l_name: string;
  email: string;
  admin_id: number;
}) => {
  const email = data.email.trim().toLowerCase();
  const fName = toTitleCase(data.f_name);
  const lName = toTitleCase(data.l_name);
  await db.insert(adminData).values({
    fName,
    lName,
    email,
    adminId: data.admin_id,
  });
  // return to display confirmation
  return {
    success: true,
    f_name: fName,
    l_name: lName,
    email,
  };
};

// Update
export const updateAdminByID = async (
  adminId: number,
  data: {
    f_name?: string;
    l_name?: string;
    email?: string;
  }
) => {
  await db
    .update(adminData)
    .set({
      fName: toTitleCase(data.f_name),
      lName: toTitleCase(data.l_name),
      email: data.email ? data.email.trim().toLowerCase() : data.email,
    })
    .where(eq(adminData.adminId, adminId));
};
// Delete
export const deleteAdminById = async (adminId: number) => {
  await db.delete(adminData).where(eq(adminData.adminId, adminId));
  return { success: true, id: adminId };
};
