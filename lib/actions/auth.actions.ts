'use server';

import {auth} from "@/lib/better-auth/auth";
import {inngest} from "@/lib/inngest/client";
import {headers} from "next/headers";

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry }: SignUpFormData) => {
    try {
        const authInstance = await auth;
        const response = await authInstance.api.signUpEmail({
            body: { email, password, name: fullName },
        })

        if (response) {
            await inngest.send({
                name: "app/user.created",
                data: { email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry }
            })
        }
        return { success: true, data: response };
    }
    catch (error) {
        console.error("Sign up failed", error);
        return { success: false, error: "Sign up failed" };
    }
}

export const signOut = async  () => {
    try {
        const authInstance = await auth;
        await authInstance.api.signOut({ headers: await headers() });
    }
    catch (error) {
        console.log("Sign out failed", error);
        return { success: false, error: "Sign out failed" };
    }
}

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        const authInstance = await auth;
        const response = await authInstance.api.signInEmail({
            body: { email, password },
        })
        return { success: true, data: response };
    }
    catch (error) {
        console.error("Sign in failed", error);
        const errorMessage = error instanceof Error ? error.message : "Invalid email or password";
        return { success: false, error: errorMessage };
    }
}