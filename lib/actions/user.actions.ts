'use server';
import {connectToDatabase} from "@/database/mongoose";
import {email} from "zod";

export const getAllUsersForNewEmail = async () => {
    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error("Mongoose connection not connected");

        const users = await db.collection("users").find(
            { email: { $exists: true, $ne: null } },
            { projection: { _id: 1, email: 1, name: 1, country: 1 } }
        ).toArray();

        return users.filter((user) => user.email && user.name).map((user) => ({
            id: user.id || user._id?.toString() || '',
            email: user.email,
            name: user.name
        }))
    }
    catch (error) {
        console.error("Error fetching users for news email:", error);
        return []
    }
}