import { clerkClient } from "@clerk/express";
import { clerkMiddleware } from "@clerk/express";

export const authMiddleware = clerkMiddleware();

export const protectRoute = async (req, res, next) => {
    if (!req.auth().userId){
        res.status(401).json({ success: false, message: "Unauthorized - you must login first." });
        return;
    }
    next();
};

export const requireAdmin = async (req, res, next) => {
    try{
        const currentUser = await clerkClient.users.getUser(req.auth().userId);

        const isAdmin = process.env.ADMIN_EMAIL === currentUser.primaryEmailAddress.emailAddress;

        if (!isAdmin){
            return res.status(403).json({ success: false, message: "Forbidden - you do not have admin access." });
        }
        next();
    } catch (error) {
        console.error("Error in requireAdmin middleware:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}