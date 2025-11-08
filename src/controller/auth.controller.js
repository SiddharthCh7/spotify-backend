import { User } from "../models/User.model.js";

export const authCallback = async (req, res) => {
    try{
        const { id, firstName, lastName, imageUrl} = req.body;

        const user = await User.findOne({clerId: id});
        if (!user){
            await User.create({
                clerkId: id,
                fullName: `${firstName} ${lastName}`,
                imageUrl
            });
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error in auth callback", error);
        next(error);
    }
}