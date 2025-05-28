import User from "../../models/user-model.js";


export async function getUserById(id, select="") {
    try {
        const query = User.findById(id);
        if (select) {
            query.select(select); 
        }
        const user = await query;
        return user;
    } catch (error) {
        console.error("Error in userService.getUserById ", error);
        throw error;
    }
}

export async function getUserByEmail(email) {
    try {
        const user = await User.findOne({ email });
        return user;
    } catch (error) {
        console.error("Error in userService.getUserByEmail ", error);
        throw error;
    }
}

export async function createUser(
    firstName, 
    lastName, 
    email, 
    password, 
    verified,
    refreshToken,
    senderEmail,
) {
    try {
        const user = await User.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase(),
            password: password,
            verified: verified,
            refreshToken: refreshToken,
            metaData: {
                senderEmail: senderEmail
            }
        });

        return user;
    } catch (error) {
        console.error("Error in userService.createUser ", error);
        throw error;
    }
}

export async function saveSenderCredentials(userId, senderEmail, senderEmailPassword) {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            {
                "metaData.senderEmail": senderEmail,
                "metaData.senderEmailPassword": senderEmailPassword,
                verified: true,
            },
            { new: true }
        )
        return updatedUser;
    } catch (error) {
        console.error("Error in userService.saveSenderCredentials ", error);
        throw error;
    }
}

export async function changeUserSenderCredentialsStatus(userId, status) {
    try {
        const updatedUserStatus = await User.findByIdAndUpdate(
            userId,
            {
                verified: status
            },
            { new: true }
        )
        return updatedUserStatus;
    } catch (error) {
        console.error("Error in userService.changeUserSenderCredentialsStatus ", error);
        throw error;
    }
}