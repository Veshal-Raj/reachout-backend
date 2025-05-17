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

export async function createUser(firstName, lastName, email, password) {
    try {
        const user = await User.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase(),
            password: password
        });

        return user;
    } catch (error) {
        console.error("Error in userService.createUser ", error);
        throw error;
    }
}
